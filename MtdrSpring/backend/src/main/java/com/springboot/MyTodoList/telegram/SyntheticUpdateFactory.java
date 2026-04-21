package com.springboot.MyTodoList.telegram;

import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.message.Message;

import java.lang.reflect.Field;

public class SyntheticUpdateFactory {

    private SyntheticUpdateFactory() {}

    /**
     * Returns a new Update that is identical to the original except that
     * message.text is replaced with syntheticText. Uses reflection because
     * the Telegram library does not expose setters for message fields.
     */
    public static Update withText(Update original, String syntheticText) {
        try {
            Message originalMsg = original.getMessage();

            Message syntheticMsg = new Message();
            copyFields(originalMsg, syntheticMsg);
            setField(syntheticMsg, "text", syntheticText);

            Update syntheticUpdate = new Update();
            copyFields(original, syntheticUpdate);
            setField(syntheticUpdate, "message", syntheticMsg);

            return syntheticUpdate;
        } catch (Exception e) {
            return original;
        }
    }

    private static void copyFields(Object src, Object dst) throws Exception {
        for (Field f : src.getClass().getDeclaredFields()) {
            f.setAccessible(true);
            f.set(dst, f.get(src));
        }
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Class<?> clazz = obj.getClass();
        while (clazz != null) {
            try {
                Field f = clazz.getDeclaredField(fieldName);
                f.setAccessible(true);
                f.set(obj, value);
                return;
            } catch (NoSuchFieldException e) {
                clazz = clazz.getSuperclass();
            }
        }
    }
}
