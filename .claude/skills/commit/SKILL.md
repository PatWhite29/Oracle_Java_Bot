---
name: commit
description: Realiza commits organizados y descriptivos agrupando cambios por módulo, usando prefijos Conventional Commits con scope, mensajes en español, y git add selectivo.
---

## Flujo de ejecución

Sigue estos pasos en orden cada vez que se invoque la skill:

1. Ejecuta `git log --oneline -5` para ver los últimos commits y entender el contexto reciente.
2. Ejecuta `git status` y `git diff` (incluyendo `git diff --cached`) para identificar todos los cambios pendientes.
3. Agrupa los cambios por dominio según la ruta de los archivos modificados.
4. Por cada grupo, realiza un `git add` selectivo con los archivos del grupo y un commit con el mensaje correspondiente.
5. Procede automáticamente sin pedir confirmación, incluso si hay múltiples commits.

## Agrupación por dominio (scope)

Usa la ruta del archivo para determinar el scope:

| Ruta del archivo | Scope |
|---|---|
| `MtdrSpring/backend/src/main/java/...` (controllers, services, repos, DTOs) | `api` |
| `MtdrSpring/backend/src/main/java/.../bot/...` o clases relacionadas al bot de Telegram | `bot` |
| `MtdrSpring/backend/src/main/frontend/...` | `frontend` |
| `MtdrSpring/terraform/...` | `infra` |
| `MtdrSpring/backend/src/main/resources/...` | `config` |
| `documentation/...` o `*.md` | `docs` |
| Archivos de base de datos, SQL, migraciones | `db` |
| `.claude/...`, scripts, `pom.xml`, `package.json` | `chore` |

Si un cambio no encaja en ningún scope anterior, elige el que mejor lo describa con una palabra corta en inglés.

## Formato del mensaje de commit

```
<prefijo>(<scope>): <descripción en español>
```

- Descripción en español, minúsculas, sin punto final.
- Máximo una línea, corta y directa — que se pueda leer de un vistazo.
- Sin cuerpo adicional, sin `Co-Authored-By`.

### Prefijos disponibles

| Prefijo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Reestructuración sin cambio de comportamiento |
| `docs` | Cambios en documentación |
| `chore` | Mantenimiento, configs, dependencias |
| `test` | Añadir o modificar tests |
| `style` | Formato, espacios, puntuación sin cambio lógico |

### Ejemplos

```
feat(api): endpoint para creación de sprints
fix(bot): comando /my_tasks no mostraba tareas en backlog
refactor(frontend): simplificación de componente KPI
docs(docs): actualización de documentación de endpoints
chore(config): ajuste de variables de entorno en Docker
```

## Reglas adicionales

- Nunca uses `git add .` ni `git add -A` — siempre agrega archivos específicos.
- Si dos archivos de dominios distintos están claramente relacionados al mismo cambio lógico, pueden ir en el mismo commit usando el scope más representativo.
- Si no hay nada que commitear (`git status` limpio), informa al usuario y no hagas nada.
