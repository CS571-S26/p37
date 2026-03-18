# Personal Task Manager

A clean, lightweight productivity app built with React + Vite. No UI libraries — just React, CSS, and localStorage.

Built for CS571: Building User Interfaces @ UW–Madison.

---

## Getting Started
```bash
git clone https://github.com/CS571-S26/p37.git
cd p37
npm install
npm run dev
```

Opens at `http://localhost:5173` with hot reload.

---

## Project Structure
```
p37/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AddTaskForm.jsx
│   │   ├── FilterBar.jsx
│   │   ├── Header.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── TaskItem.jsx
│   │   └── TaskList.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── CHANGELOG.md
└── README.md
```

---

## Features

- Add tasks with title, description, and priority level
- Mark tasks complete — strikethrough + fade animation
- Delete tasks — slides out on removal
- Filter by All / Active / Done / High Priority
- Progress bar tracking completion
- Persists across page refreshes via localStorage

---

## UX Principles Applied (CS571)

| Principle | Implementation |
|-----------|---------------|
| Feedback | Red border flash on empty submit, visual state change on complete |
| Affordance | Hover reveals delete button, circle implies toggleable checkbox |
| Accessibility | aria-checked, keyboard support (Enter / Space) on checkboxes |
| Responsiveness | Mobile-first layout, wraps gracefully on small screens |

---

## Tech

- React 19 + Vite 8
- CSS3 (custom properties, keyframe animations, transitions)
- localStorage for persistence
- Google Fonts — DM Sans + Fraunces

---

## Author

Seunghoon Lee — [@twoSquaredHoon](https://github.com/twoSquaredHoon)
Course repo: [CS571-S26/p37](https://github.com/CS571-S26/p37)
