package com.springboot.MyTodoList.util;

public class BotConversationState {

    public enum Step {
        IDLE,
        WAITING_TITLE,
        WAITING_ASSIGNEE,
        WAITING_COMPLEXITY
    }

    private Step step = Step.IDLE;
    private String title;
    private String assignee;

    public Step getStep() {
        return step;
    }

    public void setStep(Step step) {
        this.step = step;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public boolean isAwaitingInput() {
        return step != Step.IDLE;
    }

    public void reset() {
        this.step = Step.IDLE;
        this.title = null;
        this.assignee = null;
    }
}
