# DEWECS - SE3070 Assignment 02 (Group 18)

## System Overview
**DEWECS (Disaster Early Warning and Emergency Coordination System)** is a unified, modular MERN-stack application designed to handle real-time disaster reporting, location-specific hazard warnings, emergency resource allocation, and post-event analysis.

The system uses a single combined Node.js/Express backend and a single React/Vite frontend with feature-based architecture to allow modular collaboration among team members.

## Team Members & Feature Module Assignment

| Member Name | Feature Module Folder | Assigned Use Case |
| :--- | :--- | :--- |
| **Pathirana** | `backend/src/modules/ground-report/`<br>`frontend/src/features/ground-report/` | Submit and Verify Ground Hazard Report |
| **Perera** | `backend/src/modules/hazard-warning/`<br>`frontend/src/features/hazard-warning/` | Issue Location-Specific Hazard Warning |
| **Wijekoon** | `backend/src/modules/resource-coordination/`<br>`frontend/src/features/resource-coordination/` | Coordinate Emergency Resources |
| **Ranketh** | `backend/src/modules/analysis-report/`<br>`frontend/src/features/analysis-report/` | Generate Post-Event Analysis Report |

## Directory Structure Overview
```text
dewecs-se3070-g18/
├── README.md
├── .gitignore
├── report/
│   ├── use-case-diagram/
│   ├── class-diagram/
│   └── critique-and-improvements.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── jest.config.js
│   └── src/
│       ├── config/
│       ├── shared/
│       ├── modules/
│       │   ├── ground-report/
│       │   ├── hazard-warning/
│       │   ├── resource-coordination/
│       │   └── analysis-report/
│       ├── app.js
│       └── server.js
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    └── src/
        ├── shared/
        ├── router/
        ├── features/
        │   ├── ground-report/
        │   ├── hazard-warning/
        │   ├── resource-coordination/
        │   └── analysis-report/
        ├── App.jsx
        └── main.jsx
```

## Running the Application

### Local Execution

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```