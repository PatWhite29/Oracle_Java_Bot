package com.springboot.MyTodoList.telegram.nlu;

import java.util.List;
import java.util.Map;

public class NluResult {

    private NluStatus status;
    private String command;
    private Map<String, String> params;
    private List<String> missing;

    public NluResult() {}

    public static NluResult unknown() {
        NluResult r = new NluResult();
        r.status = NluStatus.UNKNOWN;
        return r;
    }

    public NluStatus getStatus() { return status; }
    public void setStatus(NluStatus status) { this.status = status; }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }

    public Map<String, String> getParams() { return params; }
    public void setParams(Map<String, String> params) { this.params = params; }

    public List<String> getMissing() { return missing; }
    public void setMissing(List<String> missing) { this.missing = missing; }
}
