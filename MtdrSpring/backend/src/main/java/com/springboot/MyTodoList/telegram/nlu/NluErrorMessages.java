package com.springboot.MyTodoList.telegram.nlu;

import java.util.List;

public class NluErrorMessages {

    private NluErrorMessages() {}

    public static String getErrorMessage(String command, List<String> missing) {
        if (missing == null || missing.isEmpty()) {
            return fallback();
        }

        if ("task_status".equals(command)) {
            if (missing.contains("hours")) {
                return "Para marcar una tarea como DONE debes especificar tus horas reales trabajadas.\n" +
                       "Ejemplo: marca la tarea 5 como done con 3.5 horas";
            }
            if (missing.contains("id")) {
                return "No identifiqué qué tarea quieres actualizar. Dime el ID de la tarea.";
            }
            if (missing.contains("status")) {
                return "No identifiqué el nuevo estado. Los estados válidos son: TODO, IN_PROGRESS, BLOCKED, DONE.";
            }
        }

        if ("task".equals(command) && missing.contains("id")) {
            return "No identifiqué qué tarea quieres ver. Dime el ID de la tarea.";
        }

        if ("comment".equals(command)) {
            if (missing.contains("id")) {
                return "No identifiqué en qué tarea quieres comentar. Dime el ID de la tarea.";
            }
            if (missing.contains("text")) {
                return "No identifiqué el texto del comentario. ¿Qué quieres agregar?";
            }
        }

        return fallback();
    }

    private static String fallback() {
        return "No entendí tu mensaje. Escribe /help para ver los comandos disponibles.";
    }
}
