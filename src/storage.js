const TASKS_KEY = "taskflow_tasks";
const TEAMS_KEY = "taskflow_teams";
const THEME_KEY = "taskflow_theme";

export function loadTasks() {
  const raw = localStorage.getItem(TASKS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadTeams() {
  const raw = localStorage.getItem(TEAMS_KEY);
  if (!raw) {
    return [
      {
        id: "team-default",
        name: "Core",
        members: ["Alice", "Bob", "Carlos"]
      }
    ];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTeams(teams) {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export function loadTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
