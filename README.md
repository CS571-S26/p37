# Personal Task Manager

A clean, lightweight productivity app built with vanilla HTML, CSS, and JavaScript. No frameworks, no build step — just open and run.

Built for CS571: Building User Interfaces @ UW–Madison.

---

## Getting Started
```bash
git clone https://github.com/CS571-S26/p37.git
cd p37
open index.html
```

Or just drag `index.html` into your browser.

---

## Project Structure
```
p37/
├── index.html        # App shell & markup
├── style.css         # All styles, animations, responsive layout
├── app.js            # State, localStorage, rendering, events
└── README.md
```

---

## Features

- Add tasks with a title, description, and priority level
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

- HTML5
- CSS3 (custom properties, keyframe animations, transitions)
- Vanilla JavaScript (ES6+)
- localStorage for persistence
- Google Fonts — DM Sans + Fraunces

---

## Author

Seunghoon Lee — [@twoSquaredHoon](https://github.com/twoSquaredHoon)  
Course repo: [CS571-S26/p37](https://github.com/CS571-S26/p37)
