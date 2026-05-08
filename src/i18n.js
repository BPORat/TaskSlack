const TRANSLATIONS = {
  en: {
    tagline: "Smart task manager for modern teams",
    toggleDarkMode: "Dark mode",
    filters: "Filters",
    search: "Search",
    category: "Category",
    allCategories: "All categories",
    status: "Status",
    allStatuses: "All statuses",
    statusTodo: "To do",
    statusInProgress: "In progress",
    statusDone: "Done",
    assignee: "Assignee",
    allAssignees: "All assignees",
    clearFilters: "Clear filters",
    teams: "Teams",
    addTeam: "Add team",
    tasks: "Tasks",
    addTask: "Add task",
    taskDetails: "Task details",
    noTaskSelected: "No task selected",
    newTask: "New task",
    editTask: "Edit task",
    title: "Title",
    description: "Description",
    priority: "Priority",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    dueDate: "Due date",
    team: "Team",
    askAI: "Ask AI for subtasks",
    delete: "Delete",
    save: "Save",
    aiSuggestions: "AI suggestions",
    manageTeam: "Manage team",
    teamName: "Team name",
    members: "Members (comma separated)",
    noTeam: "No team",
    unassigned: "Unassigned",
    due: "Due",
    languageEn: "EN",
    languageEs: "ES",
    createdAt: "Created at",
    updatedAt: "Updated at"
  },
  es: {
    tagline: "Gestor de tareas inteligente para equipos modernos",
    toggleDarkMode: "Modo oscuro",
    filters: "Filtros",
    search: "Buscar",
    category: "Categoría",
    allCategories: "Todas las categorías",
    status: "Estado",
    allStatuses: "Todos los estados",
    statusTodo: "Por hacer",
    statusInProgress: "En progreso",
    statusDone: "Hecho",
    assignee: "Responsable",
    allAssignees: "Todos los responsables",
    clearFilters: "Limpiar filtros",
    teams: "Equipos",
    addTeam: "Añadir equipo",
    tasks: "Tareas",
    addTask: "Añadir tarea",
    taskDetails: "Detalle de la tarea",
    noTaskSelected: "Ninguna tarea seleccionada",
    newTask: "Nueva tarea",
    editTask: "Editar tarea",
    title: "Título",
    description: "Descripción",
    priority: "Prioridad",
    priorityLow: "Baja",
    priorityMedium: "Media",
    priorityHigh: "Alta",
    dueDate: "Fecha límite",
    team: "Equipo",
    askAI: "Pedir subtareas a la IA",
    delete: "Eliminar",
    save: "Guardar",
    aiSuggestions: "Sugerencias de la IA",
    manageTeam: "Gestionar equipo",
    teamName: "Nombre del equipo",
    members: "Miembros (separados por comas)",
    noTeam: "Sin equipo",
    unassigned: "Sin asignar",
    due: "Vence",
    languageEn: "EN",
    languageEs: "ES",
    createdAt: "Creada",
    updatedAt: "Actualizada"
  }
};

const LANGUAGE_KEY = "taskflow_language";

export function getLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  return navigator.language.startsWith("es") ? "es" : "en";
}

export function setLanguage(lang) {
  localStorage.setItem(LANGUAGE_KEY, lang);
}

export function t(key, lang = getLanguage()) {
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
}

export function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key, lang);
    if (text) el.textContent = text;
  });

  const langToggle = document.getElementById("lang-toggle");
  if (langToggle) {
    langToggle.textContent = lang === "en" ? t("languageEs", lang) : t("languageEn", lang);
  }
}
