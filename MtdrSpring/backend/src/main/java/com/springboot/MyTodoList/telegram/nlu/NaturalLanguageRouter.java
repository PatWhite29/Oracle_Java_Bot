package com.springboot.MyTodoList.telegram.nlu;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class NaturalLanguageRouter {

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION = "2023-06-01";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    private static final String SYSTEM_PROMPT =
            "You are a command classifier for a task management Telegram bot." +
            "Your only job is to map the user's message to one of the available commands and extract parameters." +
            "You must ALWAYS respond with valid JSON only. No explanations, no markdown, no extra text.\n" +
            "Available commands:\n" +
            "- start: greet the user or show the main menu. No params.\n" +
            "- help: show available commands. No params.\n" +
            "- my_projects: list the user's projects. No params.\n" +
            "- my_tasks: list the user's assigned tasks. No params.\n" +
            "- task: show task detail. Params: id (integer).\n" +
            "- task_status: update task status. Params: id (integer), status (one of: TODO, IN_PROGRESS, BLOCKED, DONE), hours (decimal, required only if status is DONE).\n" +
            "- comment: add a comment to a task. Params: id (integer), text (string).\n" +
            "Response format:\n" +
            "- If all required params are present: {\"status\": \"ok\", \"command\": \"<name>\", \"params\": { ... }}\n" +
            "- If the command is identified but params are missing: {\"status\": \"missing_params\", \"command\": \"<name>\", \"missing\": [\"<param1>\", ...]}\n" +
            "- If the message cannot be mapped to any command: {\"status\": \"unknown\"}";

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public NaturalLanguageRouter(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public NluResult classify(String userMessage) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            log.warn("ANTHROPIC_API_KEY not configured, NLU disabled");
            return NluResult.unknown();
        }

        try {
            String responseJson = callAnthropicApi(userMessage);
            return parseResponse(responseJson);
        } catch (Exception e) {
            log.warn("NLU classification failed: {}", e.getMessage());
            return NluResult.unknown();
        }
    }

    private String callAnthropicApi(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", ANTHROPIC_VERSION);

        Map<String, Object> body = new HashMap<>();
        body.put("model", MODEL);
        body.put("max_tokens", 150);
        body.put("system", SYSTEM_PROMPT);
        body.put("messages", List.of(Map.of("role", "user", "content", userMessage)));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        String raw = restTemplate.postForObject(ANTHROPIC_URL, request, String.class);

        JsonNode root = objectMapper.readValue(raw, JsonNode.class);
        return root.path("content").get(0).path("text").asText();
    }

    @SuppressWarnings("unchecked")
    private NluResult parseResponse(String json) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        String statusStr = node.path("status").asText("unknown").toLowerCase();

        NluResult result = new NluResult();

        switch (statusStr) {
            case "ok" -> {
                String command = node.path("command").asText();
                if ("login".equals(command)) {
                    return NluResult.unknown();
                }
                result.setStatus(NluStatus.OK);
                result.setCommand(command);
                Map<String, String> params = new HashMap<>();
                node.path("params").fields().forEachRemaining(e -> params.put(e.getKey(), e.getValue().asText()));
                result.setParams(params);
            }
            case "missing_params" -> {
                String command = node.path("command").asText();
                if ("login".equals(command)) {
                    return NluResult.unknown();
                }
                result.setStatus(NluStatus.MISSING_PARAMS);
                result.setCommand(command);
                List<String> missing = objectMapper.convertValue(node.path("missing"), List.class);
                result.setMissing(missing);
            }
            default -> result.setStatus(NluStatus.UNKNOWN);
        }

        return result;
    }
}
