# Automatic Timetable Generator

A web app that builds clash-free timetables for multiple branches, sections and
subgroups. It is a working model of an institution-level scheduler: the admin
enters the academic data, and a constraint solver (planned) generates the
timetable automatically.

## Why

Making a timetable by hand means juggling faculty availability, room capacity,
lab rooms and workload limits for every section at once. Double-booked rooms
and teachers usually show up only after the timetable is shared. This project
treats it as a constraint satisfaction problem and lets a solver handle it.

## Features

**Built (frontend, running on mock data)**
- Dynamic home page and login page
- Collapsible admin dashboard
- Branch management (add, edit, delete, reorder)
- Section management with two subgroups per section
- Subject management with first and second-year papers pre-loaded per branch,
  an open-elective table and drag-to-reorder

**Planned**
- Django REST API with JWT authentication
- Timetable generation with Google OR-Tools CP-SAT
- Conflict detection and verification before publishing
- Weekly calendar view (FullCalendar)
- Email notifications, PDF and Excel export
- Role-based access for admin, faculty and students

## How scheduling will work

- **Hard constraints** (never broken): no faculty or room double-booking, lab
  subjects only in lab rooms, room capacity at least the group size.
- **Soft constraints** (preferred): at most 5 teaching hours a day per faculty,
  labs after lunch, no repeated subject back-to-back.
- Lectures are shared by both subgroups of a section. Labs and tutorials are
  scheduled per subgroup.
- The data model is generic, so adding a branch or section is just new data,
  not new code.

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui, dnd-kit |
| Backend (planned) | Django, Django REST Framework, simplejwt |
| Solver (planned) | Google OR-Tools CP-SAT |
| Database (planned) | SQLite for dev, PostgreSQL for production |
| Calendar (planned) | FullCalendar |
| Export (planned) | WeasyPrint, openpyxl |

## Project structure

```text
Automatic-Timetable-Generator/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js              # API client
│   │   │   └── mockData.js            # mock data until the backend is connected
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── DashboardLayout.jsx
│   │   │   └── ui/                    # shadcn/ui components
│   │   │       ├── button.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       └── table.jsx
│   │   ├── config/
│   │   │   └── timetableconfig.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # auth state
│   │   ├── data/
│   │   │   ├── firstYearScheme.js     # first-year subject scheme
│   │   │   └── secondYearScheme.js    # second-year subject scheme
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminHome.jsx
│   │   │   │   ├── Branches.jsx
│   │   │   │   ├── Sections.jsx
│   │   │   │   └── Subjects.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── PagePlaceholder.jsx    # stand-in for pages not built yet
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx     # blocks pages until logged in
│   │   ├── services/
│   │   │   ├── branchService.js
│   │   │   ├── sectionService.js
│   │   │   └── subjectService.js
│   │   ├── utils/
│   │   │   ├── branchOrdering.js
│   │   │   ├── sectionGrouping.js
│   │   │   ├── sectionNaming.js
│   │   │   └── subjectLoad.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.development
│   ├── .env.production
│   ├── .gitignore
│   ├── components.json                # shadcn/ui config
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
└── README.md
```

The frontend is split by job: `pages/` holds the screens, `services/` holds the
data calls (mock for now, so swapping in the real API later touches only this
layer), and `utils/` holds helpers for ordering, grouping and naming. A
`backend/` folder will sit next to `frontend/` once the Django API is added.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

## Status

Early development. The UI is in place; the backend and scheduling engine are
next.