import { t, getLanguage } from "./i18n.js";

export function renderTaskList(tasks, filters, teams, onSelectTask) {
  const container = document.getElementById("task-list");
  container.innerHTML = "";

  const filtered = tasks.filter((task) => {
    if (filters.search) {
      const text = (task.title + " " + (task.description || "")).toLowerCase();
      if (!text.includes(filters.search.toLowerCase())) return false;
    }
    if (filters.category && task.category !== filters.category) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = getLanguage() === "es" ? "No hay tareas" : "No tasks";
    container.appendChild(empty);
    return;
  }

  filtered
    .slice()
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";

      const left = document.createElement("div");
      const right = document.createElement("div");

      const title = document.createElement("div");
      title.className = "task-card-title";
      title.textContent = task.title;

      const meta = document.createElement("div");
      meta.className = "task-card-meta";

      const category = document.createElement("span");
      category.className = "badge";
      category.textContent = task.category || t("category");

      const status = document.createElement("span");
      status.className = `badge status-${task.status}`;
      status.textContent = statusLabel(task.status);

      const priority = document.createElement("span");
      priority.className = `badge priority-${task.priority}`;
      priority.textContent = priorityLabel(task.priority);

      const team = teams.find((t) => t.id === task.teamId);
      const teamBadge = document.createElement("span");
      teamBadge.className = "badge";
      teamBadge.textContent = team ? team.name : t("noTeam");

      const assignee = document.createElement("span");
      assignee.className = "badge";
      assignee.textContent = task.assignee || t("unassigned");

      meta.append(category, status, priority, teamBadge, assignee);

      left.append(title, meta);

      const due = document.createElement("div");
      due.className = "task-card-meta";
      if (task.dueDate) {
        const label = document.createElement("span");
        label.textContent = `${t("due")}: ${task.dueDate}`;
        due.appendChild(label);
      }

      right.appendChild(due);

      card.append(left, right);
      card.addEventListener("click", () => onSelectTask(task.id));

      container.appendChild(card);
    });
}

export function renderTaskDetails(task, teams) {
  const empty = document.getElementById("task-details-empty");
  const details = document.getElementById("task-details");

  if (!task) {
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    details.innerHTML = "";
    return;
  }

  empty.classList.add("hidden");
  details.classList.remove("hidden");
  details.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = task.title;

  const descSection = section(t("description"), task.description || "—");
  const metaSection = document.createElement("div");
  metaSection.className = "task-details-section";

  const metaList = document.createElement("ul");
  metaList.style.paddingLeft = "18px";
  metaList.style.margin = "0";

  const liStatus = document.createElement("li");
  liStatus.textContent = `${t("status")}: ${statusLabel(task.status)}`;

  const liPriority = document.createElement("li");
  liPriority.textContent = `${t("priority")}: ${priorityLabel(task.priority)}`;

  const liCategory = document.createElement("li");
  liCategory.textContent = `${t("category")}: ${task.category || "—"}`;

  const team = teams.find((t) => t.id === task.teamId);
  const liTeam = document.createElement("li");
  liTeam.textContent = `${t("team")}: ${team ? team.name : t("noTeam")}`;

  const liAssignee = document.createElement("li");
  liAssignee.textContent = `${t("assignee")}: ${task.assignee || t("unassigned")}`;

  if (task.dueDate) {
    const liDue = document.createElement("li");
    liDue.textContent = `${t("dueDate")}: ${task.dueDate}`;
    metaList.append(liStatus, liPriority, liCategory, liTeam, liAssignee, liDue);
  } else {
    metaList.append(liStatus, liPriority, liCategory, liTeam, liAssignee);
  }

  metaSection.appendChild(metaList);

  const timeSection = document.createElement("div");
  timeSection.className = "task-details-section";
  const timeList = document.createElement("ul");
  timeList.style.paddingLeft = "18px";
  timeList.style.margin = "0";

  const created = document.createElement("li");
  created.textContent = `${t("createdAt")}: ${formatDateTime(task.createdAt)}`;
  timeList.appendChild(created);

  if (task.updatedAt && task.updatedAt !== task.createdAt) {
    const updated = document.createElement("li");
    updated.textContent = `${t("updatedAt")}: ${formatDateTime(task.updatedAt)}`;
    timeList.appendChild(updated);
  }

  timeSection.appendChild(timeList);

  details.append(title, descSection, metaSection, timeSection);
}

export function renderTeams(teams, onSelectTeam) {
  const container = document.getElementById("team-list");
  container.innerHTML = "";

  teams.forEach((team) => {
    const pill = document.createElement("div");
    pill.className = "team-pill";

    const name = document.createElement("span");
    name.textContent = team.name;

    const count = document.createElement("span");
    count.className = "muted";
    count.textContent = `${team.members.length}`;

    pill.append(name, count);
    pill.addEventListener("click", () => onSelectTeam(team.id));

    container.appendChild(pill);
  });
}

export function populateFilters(tasks, teams) {
  const categoryFilter = document.getElementById("category-filter");
  const assigneeFilter = document.getElementById("assignee-filter");
  const categorySuggestions = document.getElementById("category-suggestions");

  const categories = Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort();
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean))).sort();

  // Categories
  categoryFilter.querySelectorAll("option:not([value=''])").forEach((o) => o.remove());
  categorySuggestions.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);

    const dat = document.createElement("option");
    dat.value = cat;
    categorySuggestions.appendChild(dat);
  });

  // Assignees
  assigneeFilter.querySelectorAll("option:not([value=''])").forEach((o) => o.remove());
  assignees.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    assigneeFilter.appendChild(opt);
  });

  // Team & assignee selects in modal
  const teamSelect = document.getElementById("task-team");
  const assigneeSelect = document.getElementById("task-assignee");
  teamSelect.innerHTML = "";
  assigneeSelect.innerHTML = "";

  const noTeamOpt = document.createElement("option");
  noTeamOpt.value = "";
  noTeamOpt.textContent = t("noTeam");
  teamSelect.appendChild(noTeamOpt);

  teams.forEach((team) => {
    const opt = document.createElement("option");
    opt.value = team.id;
    opt.textContent = team.name;
    teamSelect.appendChild(opt);
  });

  const unassignedOpt = document.createElement("option");
  unassignedOpt.value = "";
  unassignedOpt.textContent = t("unassigned");
  assigneeSelect.appendChild(unassignedOpt);

  teams.forEach((team) => {
    team.members.forEach((member) => {
      const opt = document.createElement("option");
      opt.value = member;
      opt.textContent = `${member} (${team.name})`;
      assigneeSelect.appendChild(opt);
    });
  });
}

function section(label, text) {
  const wrapper = document.createElement("div");
  wrapper.className = "task-details-section";

  const h = document.createElement("h4");
  h.textContent = label;

  const p = document.createElement("p");
  p.textContent = text;

  wrapper.append(h, p);
  return wrapper;
}

function statusLabel(status) {
  const lang = getLanguage();
  if (status === "todo") return lang === "es" ? "Por hacer" : "To do";
  if (status === "in_progress") return lang === "es" ? "En progreso" : "In progress";
  if (status === "done") return lang === "es" ? "Hecho" : "Done";
  return status;
}

function priorityLabel(priority) {
  const lang = getLanguage();
  if (priority === "high") return lang === "es" ? "Alta" : "High";
  if (priority === "medium") return lang === "es" ? "Media" : "Medium";
  if (priority === "low") return lang === "es" ? "Baja" : "Low";
  return priority;
}

function formatDateTime(timestamp) {
  if (!timestamp) return "—";
  const d = new Date(timestamp);
  return d.toLocaleString();
}
