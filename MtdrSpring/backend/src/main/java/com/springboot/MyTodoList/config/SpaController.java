package com.springboot.MyTodoList.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Reenvía rutas SPA (sin extensión de archivo) a index.html para que React Router las maneje.
    // Se usan patrones de profundidad fija (hasta 3 niveles) en lugar de /** para no interceptar
    // assets estáticos como /static/js/bundle.js cuyos sub-segmentos sí contienen puntos.
    @RequestMapping(value = {
            "/",
            "/{p1:[^\\.]*}",
            "/{p1:[^\\.]*}/{p2:[^\\.]*}",
            "/{p1:[^\\.]*}/{p2:[^\\.]*}/{p3:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
