package com.springboot.MyTodoList.telegram;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.telegram.telegrambots.meta.api.objects.Update;

@Slf4j
public class SyntheticUpdateFactory {

    private SyntheticUpdateFactory() {}

    public static Update withText(Update original, String syntheticText, ObjectMapper objectMapper) {
        try {
            String json = objectMapper.writeValueAsString(original);
            ObjectNode root = (ObjectNode) objectMapper.readTree(json);
            ObjectNode message = (ObjectNode) root.get("message");
            if (message != null) {
                message.put("text", syntheticText);
            }
            return objectMapper.treeToValue(root, Update.class);
        } catch (Exception e) {
            log.warn("Failed to create synthetic update: {}", e.getMessage());
            return original;
        }
    }
}
