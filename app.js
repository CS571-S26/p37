// ── State ────────────────────────────────────────
const STORAGE_KEY = 'cs571_tasks';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let activeFilter = 'all';

// ── Persistence ──────────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── Task Operations ───────────────────────────────
function addTask() {
  const titleInput = document.getElementById('add-title');
  const descInput  = document.getElementById('add-desc');
  const priInput   = document.getElementById('add-priority');

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    titleInput.style.borderColor = '#EF4444';
    setTimeout(() => titleInput.style.borderColor = '', 1000);
    return;
  }

  const task = {
    id:       Date.now(),
    title,
    desc:     descInput.value.trim(),
    priority: priInput.value,
    done:     false,
    created:  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };

  tasks.unshift(task);
  save();

  titleInput.value = '';
  descInput.value  = '';
  priInput.value   = 'med';

  render();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  save();
  render();
}

function removeTask(id) {
  const el = document.querySelector(`.task-item[data-id="${id}"]`);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }, 300);
}

// ── Filtering ─────────────────────────────────────
function getFiltered() {
  switch (activeFilter) {
    case 'active': return tasks.filter(t => !t.done);
    case 'done':   return tasks.filter(t => t.done);
    case 'high':   return tasks.filter(t => t.priority === 'high');
    default:       return tasks;
  }
}

// ── Render ────────────────────────────────────────
function render() {
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty');
  const statsEl = document.getElementById('stats');
  const barEl   = document.getElementById('progress-bar');
  const pctEl   = document.getElementById('pct');

  const doneCount  = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const pct        = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  statsEl.textContent = `${doneCount} of ${totalCount} done`;
  barEl.style.width   = pct + '%';
  pctEl.textContent   = pct + '%';

  const filtered = getFiltered();

  if (filtered.length === 0) {
    listEl.innerHTML      = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  listEl.innerHTML = filtered.map(t => renderTask(t)).join('');

  listEl.querySelectorAll('.check').forEach(el => {
    el.addEventListener('click', () => toggleDone(Number(el.dataset.id)));
  });
  listEl.querySelectorAll('.del-btn').forEach(el => {
    el.addEventListener('click', () => removeTask(Number(el.dataset.id)));
  });
}

function priorityLabel(p) {
  return p === 'high' ? 'High' : p === 'med' ? 'Medium' : 'Low';
}

function renderTask(t) {
  return `
    <div class="task-item${t.done ? ' done' : ''}" data-id="${t.id}">
      <div class="check${t.done ? ' checked' : ''}" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" tabindex="0"></div>
      <div class="task-body">
        <div class="task-title">${escapeHtml(t.title)}</div>
        ${t.desc ? `<div class="task-desc">${escapeHtml(t.desc)}</div>` : ''}
        <div class="task-meta">
          <span class="priority-badge p-${t.priority}">${priorityLabel(t.priority)}</span>
          <span class="task-date">${t.created}</span>
        </div>
      </div>
      <button class="del-btn" data-id="${t.id}" title="Delete task" aria-label="Delete task">×</button>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Events ────────────────────────────────────────
document.getElementById('add-btn').addEventListener('click', addTask);

document.getElementById('add-title').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

document.getElementById('task-list').addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') {
    const check = e.target.closest('.check');
    if (check) {
      e.preventDefault();
      toggleDone(Number(check.dataset.id));
    }
  }
});

// ── Init ──────────────────────────────────────────
render();
