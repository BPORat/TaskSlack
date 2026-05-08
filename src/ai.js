// IA simple basada en reglas locales (sin llamadas externas)
export function suggestSubtasks(task) {
  const suggestions = [];
  const title = (task.title || "").toLowerCase();
  const category = (task.category || "").toLowerCase();

  const push = (text) => {
    if (!suggestions.includes(text)) suggestions.push(text);
  };

  if (category.includes("bug") || title.includes("bug") || title.includes("fix")) {
    push("Reproducir el problema y documentar los pasos");
    push("Revisar logs y métricas relacionadas");
    push("Escribir pruebas automatizadas que cubran el bug");
    push("Implementar la corrección y hacer code review");
  }

  if (category.includes("feature") || title.includes("feature") || title.includes("new")) {
    push("Definir claramente el alcance y criterios de aceptación");
    push("Diseñar la experiencia de usuario (wireframes o mockups)");
    push("Dividir la implementación en tareas pequeñas y entregables");
    push("Planificar pruebas y validación con el equipo");
  }

  if (category.includes("design") || title.includes("design")) {
    push("Recopilar requisitos y restricciones de diseño");
    push("Crear bocetos de baja fidelidad");
    push("Validar el diseño con el equipo o stakeholders");
  }

  if (category.includes("research") || title.includes("research")) {
    push("Definir preguntas clave de investigación");
    push("Revisar documentación y soluciones existentes");
    push("Resumir hallazgos y proponer siguientes pasos");
  }

  if (suggestions.length === 0) {
    push("Dividir la tarea en 3–5 subtareas pequeñas y accionables");
    push("Estimar el esfuerzo de cada subtarea");
    push("Acordar prioridades con el equipo");
  }

  return suggestions;
}
