package com.springboot.MyTodoList.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Forward all non-file, non-API routes to index.html so React Router handles them
    @RequestMapping(value = {
            "/{path:[^\\.]*}",
            "/{path:[^\\.]*}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
