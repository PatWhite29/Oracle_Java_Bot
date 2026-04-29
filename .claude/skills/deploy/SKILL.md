---
name: deploy
description: Despliega la aplicación Chuva Bot con Docker. Baja el stack, reconstruye la imagen y lo levanta en background. Si hay error de build o arranque, revisa logs, diagnostica y espera confirmación antes de aplicar cualquier fix.
---

## Comando de despliegue

Siempre usar exactamente este comando (desde la raíz del repo):

```bash
docker-compose -f MtdrSpring/docker-compose.yml down && docker-compose -f MtdrSpring/docker-compose.yml up --build -d
```

No usar rutas absolutas ni flags adicionales salvo que el usuario lo indique explícitamente.

## Flujo de ejecución

1. Ejecutar el comando de despliegue completo.
2. Si el build y el arranque son exitosos → informar al usuario que el stack está corriendo.
3. Si hay error en cualquier etapa → ir al flujo de diagnóstico.

## Flujo de diagnóstico ante errores

1. Revisar los logs del contenedor:
   ```bash
   docker logs chuvabot-app --tail 80
   ```
2. Identificar la causa raíz del error (compilación, arranque de Spring, conexión a DB, etc.).
3. Explicar al usuario:
   - Qué falló
   - Por qué falló
   - Qué cambio propones para resolverlo
4. **Esperar confirmación explícita del usuario antes de modificar cualquier archivo o ejecutar cualquier comando adicional.**

## Restricciones

- Nunca aplicar un fix automáticamente sin confirmación del usuario.
- Nunca omitir el `down` antes del `up` — siempre bajar el stack primero.
- Nunca usar `docker compose` (plugin) en lugar de `docker-compose` (CLI) salvo que el usuario lo indique.
- El `--env-file` no es necesario — Docker Compose carga `.env` automáticamente desde `MtdrSpring/`.
