package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ToDoItemService;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.generics.TelegramClient;

public class BotActions{

    private static final Logger logger = LoggerFactory.getLogger(BotActions.class);
    private static final Map<Long, BotConversationState> CONVERSATIONS = new ConcurrentHashMap<>();
    private static final String TITLE_PREFIX = "TITULO:";
    private static final String TITLE_PREFIX_ALT = "TÍTULO:";
    private static final String ASSIGNEE_PREFIX = "ASIGNADO:";
    private static final String COMPLEXITY_PREFIX = "COMPLEJIDAD:";

    String requestText;
    long chatId;
    TelegramClient telegramClient;
    boolean exit;

    ToDoItemService todoService;
    DeepSeekService deepSeekService;

    public BotActions(TelegramClient tc,ToDoItemService ts, DeepSeekService ds){
        telegramClient = tc;
        todoService = ts;
        deepSeekService = ds;
        exit  = false;
    }

    public void setRequestText(String cmd){
        requestText=cmd;
    }

    public void setChatId(long chId){
        chatId=chId;
    }

    public void setTelegramClient(TelegramClient tc){
        telegramClient=tc;
    }

    public void setTodoService(ToDoItemService tsvc){
        todoService = tsvc;
    }

    public ToDoItemService getTodoService(){
        return todoService;
    }

    public void setDeepSeekService(DeepSeekService dssvc){
        deepSeekService = dssvc;
    }

    public DeepSeekService getDeepSeekService(){
        return deepSeekService;
    }


    

    public void fnStart() {
        if (!(requestText.equals(BotCommands.START_COMMAND.getCommand()) || requestText.equals(BotLabels.SHOW_MAIN_SCREEN.getLabel())) || exit) 
            return;

        startTaskConversation();
        exit = true;
    }

    public void fnDone() {
        if (!(requestText.indexOf(BotLabels.DONE.getLabel()) != -1) || exit) 
            return;
            
        String done = requestText.substring(0, requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(done);

        try {

            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(true);
            item.setEndTime(OffsetDateTime.now());
            ToDoItem updatedItem = todoService.updateToDoItem(id, item);
            String productivityMessage = updatedItem != null && updatedItem.getProductivityKpi() != null
                    ? " KPI: " + updatedItem.getProductivityKpi()
                    : "";
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DONE.getMessage() + productivityMessage, telegramClient);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnUndo() {
        if (requestText.indexOf(BotLabels.UNDO.getLabel()) == -1 || exit)
            return;

        String undo = requestText.substring(0,
                requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(undo);

        try {

            ToDoItem item = todoService.getToDoItemById(id);
            item.setDone(false);
            item.setEndTime(null);
            todoService.updateToDoItem(id, item);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_UNDONE.getMessage(), telegramClient);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnDelete(){
        if (requestText.indexOf(BotLabels.DELETE.getLabel()) == -1 || exit)
            return;

        String delete = requestText.substring(0,
                requestText.indexOf(BotLabels.DASH.getLabel()));
        Integer id = Integer.valueOf(delete);

        try {
            todoService.deleteToDoItem(id);
            BotHelper.sendMessageToTelegram(chatId, BotMessages.ITEM_DELETED.getMessage(), telegramClient);

        } catch (Exception e) {
            logger.error(e.getLocalizedMessage(), e);
        }
        exit = true;
    }

    public void fnHide(){
        if (requestText.equals(BotCommands.HIDE_COMMAND.getCommand())
				|| requestText.equals(BotLabels.HIDE_MAIN_SCREEN.getLabel()) && !exit)
			BotHelper.sendMessageToTelegram(chatId, BotMessages.BYE.getMessage(), telegramClient);
        else
            return;
        exit = true;
    }

    public void fnListAll(){
        if (!(requestText.equals(BotCommands.TODO_LIST.getCommand())
				|| requestText.equals(BotLabels.LIST_ALL_ITEMS.getLabel())
				|| requestText.equals(BotLabels.MY_TODO_LIST.getLabel())) || exit)
            return;
        logger.info("todoSvc: "+todoService);
        List<ToDoItem> allItems = todoService.findAll();
        ReplyKeyboardMarkup keyboardMarkup = ReplyKeyboardMarkup.builder()
            .resizeKeyboard(true)
            .oneTimeKeyboard(false)
            .selective(true)
            .build();

        List<KeyboardRow> keyboard = new ArrayList<>();

        // command back to main screen
        KeyboardRow mainScreenRowTop = new KeyboardRow();
        mainScreenRowTop.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowTop);

        KeyboardRow firstRow = new KeyboardRow();
        firstRow.add(BotLabels.ADD_NEW_ITEM.getLabel());
        keyboard.add(firstRow);

        KeyboardRow myTodoListTitleRow = new KeyboardRow();
        myTodoListTitleRow.add(BotLabels.MY_TODO_LIST.getLabel());
        keyboard.add(myTodoListTitleRow);

        List<ToDoItem> activeItems = allItems.stream().filter(item -> item.isDone() == false)
                .collect(Collectors.toList());

        for (ToDoItem item : activeItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(buildTaskLabel(item));
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DONE.getLabel());
            keyboard.add(currentRow);
        }

        List<ToDoItem> doneItems = allItems.stream().filter(item -> item.isDone() == true)
                .collect(Collectors.toList());

        for (ToDoItem item : doneItems) {
            KeyboardRow currentRow = new KeyboardRow();
            currentRow.add(buildTaskLabel(item));
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.UNDO.getLabel());
            currentRow.add(item.getID() + BotLabels.DASH.getLabel() + BotLabels.DELETE.getLabel());
            keyboard.add(currentRow);
        }

        // command back to main screen
        KeyboardRow mainScreenRowBottom = new KeyboardRow();
        mainScreenRowBottom.add(BotLabels.SHOW_MAIN_SCREEN.getLabel());
        keyboard.add(mainScreenRowBottom);

        keyboardMarkup.setKeyboard(keyboard);

        //
        BotHelper.sendMessageToTelegram(chatId, BotLabels.MY_TODO_LIST.getLabel(), telegramClient,  keyboardMarkup);//
        exit = true;
    }

    public void fnAddItem(){
        logger.info("Adding item");
		if (!(requestText.contains(BotCommands.ADD_ITEM.getCommand())
				|| requestText.contains(BotLabels.ADD_NEW_ITEM.getLabel())) || exit )
            return;
        logger.info("Adding item by BotHelper");
        startTaskConversation();
        exit = true;
    }

    public void fnCollectTaskData() {
        if (exit) {
            return;
        }

        BotConversationState conversationState = getConversationState();
        if (!conversationState.isAwaitingInput()) {
            return;
        }

        switch (conversationState.getStep()) {
            case WAITING_TITLE:
                handleTitleStep(conversationState);
                break;
            case WAITING_ASSIGNEE:
                handleAssigneeStep(conversationState);
                break;
            case WAITING_COMPLEXITY:
                handleComplexityStep(conversationState);
                break;
            default:
                return;
        }

        exit = true;
    }

    public void fnElse(){
        if(exit)
            return;
        BotHelper.sendMessageToTelegram(chatId,
                "Usa /start para comenzar el flujo guiado de creación de tareas o /todolist para ver la lista.",
                telegramClient,
                null);
        exit = true;
    }

    public void fnLLM(){
        logger.info("Calling LLM");
        if (!(requestText.contains(BotCommands.LLM_REQ.getCommand())) || exit)
            return;
        
        String prompt = "Dame los datos del clima en mty";
        String out = "<empty>";
        try{
            out = deepSeekService.generateText(prompt);
        }catch(Exception exc){

        }

        BotHelper.sendMessageToTelegram(chatId, "LLM: "+out, telegramClient, null);

    }

    private void startTaskConversation() {
        BotConversationState conversationState = getConversationState();
        conversationState.reset();
        conversationState.setStep(BotConversationState.Step.WAITING_TITLE);

        BotHelper.sendMessageToTelegram(chatId, BotMessages.HELLO_MYTODO_BOT.getMessage(), telegramClient,
                ReplyKeyboardMarkup
                        .builder()
                        .keyboardRow(new KeyboardRow(BotLabels.LIST_ALL_ITEMS.getLabel(), BotLabels.HIDE_MAIN_SCREEN.getLabel()))
                        .build());
    }

    private BotConversationState getConversationState() {
        return CONVERSATIONS.computeIfAbsent(chatId, ignored -> new BotConversationState());
    }

    private void handleTitleStep(BotConversationState conversationState) {
        String title = extractFormattedValue(requestText, TITLE_PREFIX, TITLE_PREFIX_ALT);
        if (title == null) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_TITLE_FORMAT.getMessage(), telegramClient, null);
            return;
        }

        conversationState.setTitle(title);
        conversationState.setStep(BotConversationState.Step.WAITING_ASSIGNEE);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_TASK_ASSIGNEE.getMessage(), telegramClient, null);
    }

    private void handleAssigneeStep(BotConversationState conversationState) {
        String assignee = extractFormattedValue(requestText, ASSIGNEE_PREFIX);
        if (assignee == null) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_ASSIGNEE_FORMAT.getMessage(), telegramClient, null);
            return;
        }

        conversationState.setAssignee(assignee);
        conversationState.setStep(BotConversationState.Step.WAITING_COMPLEXITY);
        BotHelper.sendMessageToTelegram(chatId, BotMessages.TYPE_TASK_COMPLEXITY.getMessage(), telegramClient, null);
    }

    private void handleComplexityStep(BotConversationState conversationState) {
        String complexity = extractFormattedValue(requestText, COMPLEXITY_PREFIX);
        String normalizedComplexity = normalizeComplexity(complexity);

        if (normalizedComplexity == null) {
            BotHelper.sendMessageToTelegram(chatId, BotMessages.INVALID_COMPLEXITY_FORMAT.getMessage(), telegramClient, null);
            return;
        }

        OffsetDateTime startTime = OffsetDateTime.now();
        ToDoItem newItem = new ToDoItem();
        newItem.setTitle(conversationState.getTitle());
        newItem.setDescription(conversationState.getTitle());
        newItem.setAssignee(conversationState.getAssignee());
        newItem.setComplexity(normalizedComplexity);
        newItem.setCreation_ts(startTime);
        newItem.setStartTime(startTime);
        newItem.setDone(false);
        todoService.addToDoItem(newItem);

        conversationState.reset();
        BotHelper.sendMessageToTelegram(chatId,
                BotMessages.NEW_ITEM_ADDED.getMessage()
                        + "\nResumen: " + newItem.getTitle()
                        + " | Asignado: " + newItem.getAssignee()
                        + " | Complejidad: " + newItem.getComplexity(),
                telegramClient,
                null);
    }

    private String extractFormattedValue(String message, String... prefixes) {
        if (message == null) {
            return null;
        }

        String trimmedMessage = message.trim();
        for (String prefix : prefixes) {
            if (trimmedMessage.regionMatches(true, 0, prefix, 0, prefix.length())) {
                String extractedValue = trimmedMessage.substring(prefix.length()).trim();
                return extractedValue.isEmpty() ? null : extractedValue;
            }
        }

        return null;
    }

    private String normalizeComplexity(String complexity) {
        if (complexity == null) {
            return null;
        }

        String normalizedComplexity = complexity.trim().toUpperCase();
        if ("LOW".equals(normalizedComplexity) || "BAJA".equals(normalizedComplexity)) {
            return "Low";
        }
        if ("HIGH".equals(normalizedComplexity) || "ALTA".equals(normalizedComplexity)) {
            return "High";
        }
        if ("MEDIUM".equals(normalizedComplexity) || "MEDIA".equals(normalizedComplexity)) {
            return "Medium";
        }

        return null;
    }

    private String buildTaskLabel(ToDoItem item) {
        String title = item.getTitle() != null && !item.getTitle().trim().isEmpty()
                ? item.getTitle()
                : item.getDescription();
        String assignee = item.getAssignee() != null && !item.getAssignee().trim().isEmpty()
                ? item.getAssignee()
                : "Unassigned";
        String complexity = item.getComplexity() != null && !item.getComplexity().trim().isEmpty()
                ? item.getComplexity()
                : "Medium";

        return title + " | " + assignee + " | " + complexity;
    }


}