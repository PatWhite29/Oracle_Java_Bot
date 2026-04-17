package com.springboot.MyTodoList.util;

import com.springboot.MyTodoList.model.ToDoItem;
import com.springboot.MyTodoList.service.DeepSeekService;
import com.springboot.MyTodoList.service.ToDoItemService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.telegram.telegrambots.meta.generics.TelegramClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class BotActionsTaskRegistrationTest {

    @Test
    void guidedConversationRegistersTask() {
        TelegramClient telegramClient = mock(TelegramClient.class);
        ToDoItemService toDoItemService = mock(ToDoItemService.class);
        DeepSeekService deepSeekService = mock(DeepSeekService.class);

        long chatId = 998877L;

        consumeMessage(telegramClient, toDoItemService, deepSeekService, chatId, "/start");
        consumeMessage(telegramClient, toDoItemService, deepSeekService, chatId, "TITULO: Integrar tablero de analytics");
        consumeMessage(telegramClient, toDoItemService, deepSeekService, chatId, "ASIGNADO: Patricio");
        consumeMessage(telegramClient, toDoItemService, deepSeekService, chatId, "COMPLEJIDAD: High");

        ArgumentCaptor<ToDoItem> captor = ArgumentCaptor.forClass(ToDoItem.class);
        verify(toDoItemService, times(1)).addToDoItem(captor.capture());

        ToDoItem savedTask = captor.getValue();
        assertNotNull(savedTask);
        assertEquals("Integrar tablero de analytics", savedTask.getTitle());
        assertEquals("Integrar tablero de analytics", savedTask.getDescription());
        assertEquals("Patricio", savedTask.getAssignee());
        assertEquals("High", savedTask.getComplexity());
        assertFalse(savedTask.isDone());
        assertNotNull(savedTask.getCreation_ts());
        assertNotNull(savedTask.getStartTime());
    }

    private void consumeMessage(TelegramClient telegramClient,
                                ToDoItemService toDoItemService,
                                DeepSeekService deepSeekService,
                                long chatId,
                                String text) {
        BotActions actions = new BotActions(telegramClient, toDoItemService, deepSeekService);
        actions.setChatId(chatId);
        actions.setRequestText(text);

        actions.fnStart();
        actions.fnDone();
        actions.fnUndo();
        actions.fnDelete();
        actions.fnHide();
        actions.fnListAll();
        actions.fnAddItem();
        actions.fnCollectTaskData();
        actions.fnLLM();
        actions.fnElse();
    }
}
