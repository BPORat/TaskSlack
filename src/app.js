import { applyTranslations, getLanguage, setLanguage } from "./i18n.js";
import { loadTasks, saveTasks, loadTeams, saveTeams, loadTheme, saveTheme } from "./storage.js";
import { suggestSubtasks } from "./ai.js";
import { renderTaskList, renderTaskDetails, renderTeams, populateFilters } from "./ui.js";

let state = {
  tasks: [],
  teams: [],
  filters: {
    search: "",
    category: "",
    status: "",
    assignee: ""
  },
  selectedTaskId: null,
  editingTaskId: null,
  editingTeamId: null
};

function init() {
  state.tasks = loadTasks();
  state.teams = loadTeams();

  const theme = loadTheme();
  document.documentElement.setAttribute("data-theme", theme);

  applyTranslations();
  bindEvents();
  refreshUI();
}

function bindEvents() {
  // Theme
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
  });

  // Language
  document.getElementById("lang-toggle").addEventListener("click", () => {
    const current = getLanguage();
    const next = current === "en" ? "es" : "en";
    setLanguage(next);
    applyTranslations();
    refreshUI();
  });

  // Filters
  document.getElementById("search-input").addEventListener("input", (e) => {
    state.filters.search = e.target.value;
    refreshTaskList();
  });

  document.getElementById("category-filter").addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    refreshTaskList();
  });

  document.getElementById("status-filter").addEventListener("change", (e) => {
    state.filters.status = e.target.value;
    refreshTaskList();
  });

  document.getElementById("assignee-filter").addEventListener("change", (e) => {
    state.filters.assignee = e.target.value;
    refreshTaskList();
  });

  document.getElementById("clear-filters").addEventListener("click", () => {
    state.filters = { search: "", category: "", status: "", assignee: "" };
    document.getElementById("search-input").value = "";
    document.getElementById("category-filter").value = "";
    document.getElementById("status-filter").value = "";
    document.getElementById("assignee-filter").value = "";
    refreshTaskList();
  });

  // Tasks
  document.getElementById("add-task-btn").addEventListener("click", () => openTaskModal());

  document.getElementById("task-modal-close").addEventListener("click", closeTaskModal);

  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveTaskFromForm();
  });

  document.getElementById("task-delete-btn").addEventListener("click", () => {
    if (!state.editingTaskId) return;
    state.tasks = state.tasks.filter((t) => t.id !== state.editingTaskId);
    saveTasks(state.tasks);
    state.selectedTaskId = null;
    closeTaskModal();
    refreshUI();
  });

  document.getElementById("task-ai-btn").addEventListener("click", () => {
    const task = getTaskFromForm();
    const suggestions = suggestSubtasks(task);
    const container = document.getElementById("ai-suggestions");
    const list = document.getElementById("ai-suggestions-list");
    list.innerHTML = "";
    suggestions.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      list.appendChild(li);
    });
    container.classList.remove("hidden");
  });

  // Teams
  document.getElementById("add-team-btn").addEventListener("click", () => openTeamModal());

  document.getElementById("team-modal-close").addEventListener("click", closeTeamModal);

  document.getElementById("team-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveTeamFromForm();
  });

  document.getElementById("team-delete-btn").addEventListener("click", () => {
    if (!state.editingTeamId) return;
    state.teams = state.teams.filter((t) => t.id !== state.editingTeamId);
    // Remove team from tasks
    state.tasks = state.tasks.map((task) =>
      task.teamId === state.editingTeamId ? { ...task, teamId: null, assignee: "" } : task
    );
    saveTeams(state.teams);
    saveTasks(state.tasks);
    closeTeamModal();
    refreshUI();
  });
}

function refreshUI() {
  populateFilters(state.tasks, state.teams);
  renderTaskList(state.tasks, state.filters, state.teams, (id) => {
    state.selectedTaskId = id;
    renderTaskDetails(state.tasks.find((t) => t.id === id), state.teams);
  });
  renderTaskDetails(state.tasks.find((t) => t.id === state.selectedTaskId), state.teams);
  renderTeams(state.teams, (teamId) => openTeamModal(teamId));
}

function refreshTaskList() {
  renderTaskList(state.tasks, state.filters, state.teams, (id) => {
    state.selectedTaskId = id;
    renderTaskDetails(state.tasks.find((t) => t.id === id), state.teams);
  });
}

/* Task modal */

function openTaskModal(taskId = null) {
  state.editingTaskId = taskId;
  const modal = document.getElementById("task-modal");
  const form = document.getElementById("task-form");
  const deleteBtn = document.getElementById("task-delete-btn");
  const aiContainer = document.getElementById("ai-suggestions");
  const aiList = document.getElementById("ai-suggestions-list");
  aiContainer.classList.add("hidden");
  aiList.innerHTML = "";

  if (taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    document.getElementById("task-modal-title").setAttribute("data-i18n", "editTask");
    form["task-title"].value = task.title;
    form["task-description"].value = task.description || "";
    form["task-category"].value = task.category || "";
    form["task-status"].value = task.status;
    form["task-priority"].value = task.priority;
    form["task-dueDate"].value = task.dueDate || "";
    form["task-team"].value = task.teamId || "";
    form["task-assignee"].value = task.assignee || "";
    deleteBtn.classList.remove("hidden");
  } else {
    document.getElementById("task-modal-title").setAttribute("data-i18n", "newTask");
    form.reset();
    deleteBtn.classList.add("hidden");
  }

  applyTranslations();
  modal.classList.remove("hidden");
}

function closeTaskModal() {
  const modal = document.getElementById("task-modal");
  modal.classList.add("hidden");
  state.editingTaskId = null;
}

function getTaskFromForm() {
  const form = document.getElementById("task-form");
  return {
    title: form["task-title"].value.trim(),
    description: form["task-description"].value.trim(),
    category: form["task-category"].value.trim(),
    status: form["task-status"].value,
    priority: form["task-priority"].value,
    dueDate: form["task-dueDate"].value || "",
    teamId: form["task-team"].value || null,
    assignee: form["task-assignee"].value || ""
  };
}

function saveTaskFromForm() {
  const data = getTaskFromForm();
  if (!data.title) return;

  const now = Date.now();

  if (state.editingTaskId) {
    state.tasks = state.tasks.map((task) =>
      task.id === state.editingTaskId
        ? {
            ...task,
            ...data,
            updatedAt: now
          }
        : task
    );
  } else {
    const newTask = {
      id: `task-${now}-${Math.random().toString(16).slice(2)}`,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    state.tasks.push(newTask);
    state.selectedTaskId = newTask.id;
  }

  saveTasks(state.tasks);
  closeTaskModal();
  refreshUI();
}

/* Team modal */

function openTeamModal(teamId = null) {
  state.editingTeamId = teamId;
  const modal = document.getElementById("team-modal");
  const form = document.getElementById("team-form");
  const deleteBtn = document.getElementById("team-delete-btn");

  if (teamId) {
    const team = state.teams.find((t) => t.id === teamId);
    form["team-name"].value = team.name;
    form["team-members"].value = team.members.join(", ");
    deleteBtn.classList.remove("hidden");
  } else {
    form.reset();
    deleteBtn.classList.add("hidden");
  }

  modal.classList.remove("hidden");
}

function closeTeamModal() {
  const modal = document.getElementById("team-modal");
  modal.classList.add("hidden");
  state.editingTeamId = null;
}

function saveTeamFromForm() {
  const form = document.getElementById("team-form");
  const name = form["team-name"].value.trim();
  const membersRaw = form["team-members"].value.trim();
  const members =
    membersRaw.length === 0
      ? []
      : membersRaw
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean);

  if (!name) return;

  if (state.editingTeamId) {
    state.teams = state.teams.map((team) =>
      team.id === state.editingTeamId
        ? {
            ...team,
            name,
            members
          }
        : team
    );
  } else {
    const id = `team-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    state.teams.push({ id, name, members });
  }

  saveTeams(state.teams);
  closeTeamModal();
  refreshUI();
}

document.addEventListener("DOMContentLoaded", init);
