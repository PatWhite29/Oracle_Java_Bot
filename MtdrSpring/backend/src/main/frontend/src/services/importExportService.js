const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export function exportTasksToJson(tasks, sprintName) {
  const data = tasks.map((t) => ({
    task_name: t.taskName,
    description: t.description ?? null,
    status: t.status,
    priority: t.priority ?? null,
    story_points: t.storyPoints,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sprintName.replace(/\s+/g, '-')}-tasks.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseAndValidateImportFile(file) {
  const text = await file.text();
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { tasks: [], errors: ['El archivo no contiene JSON válido.'] };
  }

  if (!Array.isArray(parsed)) {
    return { tasks: [], errors: ['El archivo debe contener un array de tareas: [{...}, {...}].'] };
  }

  if (parsed.length === 0) {
    return { tasks: [], errors: ['El archivo no contiene tareas (el array está vacío).'] };
  }

  const errors = [];

  parsed.forEach((item, i) => {
    const n = i + 1;

    if (!item.task_name || typeof item.task_name !== 'string' || item.task_name.trim() === '') {
      errors.push(`Tarea #${n}: falta el campo "task_name" o está vacío.`);
    } else if (item.task_name.trim().length > 200) {
      errors.push(`Tarea #${n}: "task_name" no puede superar 200 caracteres.`);
    }

    if (item.story_points === undefined || item.story_points === null) {
      errors.push(`Tarea #${n}: falta el campo "story_points".`);
    } else if (!Number.isInteger(item.story_points) || item.story_points <= 0) {
      errors.push(`Tarea #${n}: "story_points" debe ser un entero mayor a 0 (valor recibido: ${JSON.stringify(item.story_points)}).`);
    }

    if (item.status !== undefined && !VALID_STATUSES.includes(item.status)) {
      errors.push(`Tarea #${n}: "status" inválido "${item.status}" (valores permitidos: ${VALID_STATUSES.join(', ')}).`);
    }

    if (item.priority !== undefined && item.priority !== null && !VALID_PRIORITIES.includes(item.priority)) {
      errors.push(`Tarea #${n}: "priority" inválido "${item.priority}" (valores permitidos: ${VALID_PRIORITIES.join(', ')}).`);
    }

    if (item.description !== undefined && item.description !== null) {
      if (typeof item.description !== 'string') {
        errors.push(`Tarea #${n}: "description" debe ser texto.`);
      } else if (item.description.length > 1000) {
        errors.push(`Tarea #${n}: "description" no puede superar 1000 caracteres.`);
      }
    }
  });

  if (errors.length > 0) return { tasks: [], errors };

  const tasks = parsed.map((item) => ({
    taskName: item.task_name.trim(),
    description: item.description || null,
    status: item.status || 'TODO',
    priority: item.priority || null,
    storyPoints: item.story_points,
  }));

  return { tasks, errors: [] };
}
