package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MYTODO_BOT(
	"Hola, soy MyTodoList Bot. Vamos a crear una tarea nueva paso a paso.\nFormato para iniciar: TITULO: <nombre de la tarea>"),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	ITEM_DONE("Tarea completada. El KPI de productividad fue calculado con startTime y endTime."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Formato correcto para el título: TITULO: <nombre de la tarea>"),
	TYPE_TASK_ASSIGNEE("Ahora ingresa el responsable con este formato: ASIGNADO: <nombre del responsable>"),
	TYPE_TASK_COMPLEXITY("Por último, indica la complejidad con este formato: COMPLEJIDAD: Low | Medium | High"),
	INVALID_TITLE_FORMAT("Formato inválido. Usa exactamente: TITULO: <nombre de la tarea>"),
	INVALID_ASSIGNEE_FORMAT("Formato inválido. Usa exactamente: ASIGNADO: <nombre del responsable>"),
	INVALID_COMPLEXITY_FORMAT("Formato inválido. Usa exactamente: COMPLEJIDAD: Low | Medium | High"),
	NEW_ITEM_ADDED("Nueva tarea agregada correctamente. Usa /todolist para verla en la lista."),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
