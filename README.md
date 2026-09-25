# DEWECS - Disaster Early-Warning and Emergency Coordination System

## System Overview
**DEWECS (Disaster Early Warning and Emergency Coordination System)** is a full working MERN-stack application built for real-time ground hazard reporting, location-specific warnings with multi-channel notification fan-out, emergency resource coordination, and post-event analytical reporting.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB server running locally at `mongodb://localhost:27017/dewecs`

---

### Step 1: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

### Step 2: Seed the Database
Run the database seed script to populate sample data (3 Districts, 1 River Basin, 15 Citizens, 4 Organisations, Shelters, Rescue Teams, Relief Supplies, Reports, and Warnings):

```bash
cd ../backend
npm run seed
```

---

### Step 3: Run the System Locally

#### Terminal 1: Start Backend API (Port 5000)
```bash
cd backend
npm run dev
```

#### Terminal 2: Start Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173** to demo the application.

---

### Step 4: Run Backend Jest Unit Test Suites
To verify all 19 unit tests across all four modules:

```bash
cd backend
npm test -- --runInBand
```

---

## 📌 Module & Use Case Architecture

### Shared Models (`backend/src/shared/models/`)
- `District`: `{ districtId, name, riverBasin (ref), citizenCount }`
- `RiverBasin`: `{ basinId, name, districts: [ref District] }`
- `Citizen`: `{ nationalId, name, homeAddress, districtId (ref), pushToken, phone }`
- `Organisation`: `{ orgId, name, type: enum [GovernmentBody, ArmedForcesUnit, NGO, PrivateDonor] }`
- `Notification`: `{ notificationId, hazardAlertId (ref), citizenId (ref), channel: enum [PUSH, SMS, AUDIBLE], sentTime, deliveryStatus: enum [SENT, FAILED] }`

---

### Module 1: `ground-report` (UC2 - Submit & Verify Ground Hazard Report)
- **Model**: `GroundReport` `{ reportId, hazardType, description, photoUrl, gpsLat, gpsLng, submittedTime, submittedBy, districtId, verificationStatus, verifiedBy, verifiedTime, severityLevel, rejectionReason, corroboratingReportIds, evidenceHistory }`
- **Endpoints**:
  - `POST /api/ground-reports` — Submit report with ~1km & <6h auto-duplicate detection linking
  - `GET /api/ground-reports?district=&status=` — List queue sorted by district & time
  - `GET /api/ground-reports/:id` — Full details & corroborating report links
  - `PATCH /api/ground-reports/:id/verify` — Sets status=VERIFIED. High severity logs escalation message.
  - `PATCH /api/ground-reports/:id/reject` — Sets status=REJECTED with reason.
  - `PATCH /api/ground-reports/:id/request-info` — Sets status=NEEDS_MORE_INFO.
  - `PATCH /api/ground-reports/:id/add-evidence` — Appends evidence & resets status to PENDING.
- **Frontend Pages**:
  - `/ground-reports/submit` — Submit report page with simulated GPS & offline submit stub.
  - `/ground-reports/queue` — Duty Officer verification queue table & inline controls.

---

### Module 2: `hazard-warning` (UC1 - Issue Location-Specific Hazard Warning)
- **Model**: `HazardAlert` `{ alertId, hazardType, severityLevel, targetDistrictIds, targetRiverBasinId, message, issuedTime, status: enum [ACTIVE, ESCALATED, CANCELLED, EXPIRED] }`
- **Endpoints**:
  - `POST /api/hazard-alerts/preview` — Preview reach calculation (citizen count in target districts/basin)
  - `POST /api/hazard-alerts` — Create HazardAlert & trigger 3-channel (PUSH, SMS, AUDIBLE) fan-out with 90/10 delivery status
  - `GET /api/hazard-alerts` — List active & escalated warnings
  - `PATCH /api/hazard-alerts/:id/escalate` — Escalate severity & re-notify citizens (rejects if at Emergency or cancelled)
  - `PATCH /api/hazard-alerts/:id/cancel` — Sets status=CANCELLED & sends "hazard has passed" follow-up
  - `GET /api/hazard-alerts/:id/notifications` — Delivery stats & channel breakdown report
- **Frontend Pages**:
  - `/hazard-warnings/issue` — Warning broadcast configuration & reach preview.
  - `/hazard-warnings/active` — Active warnings dashboard with escalation, cancellation & reach stats.

---

### Module 3: `resource-coordination` (UC3 - Coordinate Emergency Resources)
- **Models**:
  - `Shelter`: `{ shelterId, name, location, capacity, currentOccupancy, districtId, ownerOrgId, status }`
  - `RescueTeam`: `{ teamId, name, status: enum [AVAILABLE, DISPATCHED, RETURNING], currentLocation, ownerOrgId, districtId }`
  - `ReliefSupply`: `{ supplyId, supplyType, quantity, distributedQuantity, ownerOrgId, districtId }`
- **Endpoints**:
  - `GET /api/resource-dashboard/:districtId` — Aggregate shelters, teams, and supplies per district
  - `POST /api/shelters` — Register new shelter
  - `PATCH /api/shelters/:id/occupancy` — Update occupancy (rejects with 400 if over capacity)
  - `GET /api/rescue-teams?district=&status=AVAILABLE` — List dispatchable teams
  - `PATCH /api/rescue-teams/:id/dispatch` — Dispatch team (rejects if not AVAILABLE)
  - `PATCH /api/rescue-teams/:id/return` — Cycle team status RETURNING -> AVAILABLE
  - `POST /api/relief-supplies/distribute` — Log distribution (rejects if exceeding stock)
- **Frontend Pages**:
  - `/resources` — Resource coordination dashboard with shelters, rescue units, relief supplies & modal forms.

---

### Module 4: `analysis-report` (UC4 - Generate Post-Event Analysis Report)
- **Model**: `AnalysisReport` `{ reportId, generatedDate, periodFrom, periodTo, districtFilter, hazardTypeFilter, citizensReachedCount, alertsIssuedCount, reportsVerifiedCount, sheltersActivatedCount, sharedWithOrgIds }`
- **Endpoints**:
  - `POST /api/analysis-reports/generate` — Aggregate metrics from collections (returns `noActivity: true` if zero activity)
  - `GET /api/analysis-reports` — List generated reports
  - `GET /api/analysis-reports/:id` — Report detail with weekly alert trend & supply distribution %
  - `POST /api/analysis-reports/:id/share` — Share report with partner orgs & simulated PDF download
- **Frontend Pages**:
  - `/analysis-reports/generate` — Date picker & filter form.
  - `/analysis-reports` — Summary dashboard with KPI tiles, Recharts weekly alert bar chart, supply breakdown, and org sharing modal.

---

## 🎨 Demo Navigation Routes Overview

| Route | Page / Feature |
| :--- | :--- |
| `/` | System Landing Dashboard & Quick Links |
| `/ground-reports/submit` | Submit Ground Hazard Report (UC2) |
| `/ground-reports/queue` | Duty Officer Verification Queue (UC2) |
| `/hazard-warnings/issue` | Issue Hazard Warning & Reach Preview (UC1) |
| `/hazard-warnings/active` | Active Warnings & Escalation Controls (UC1) |
| `/resources` | Emergency Resource Coordination Dashboard (UC3) |
| `/analysis-reports` | Post-Event Analysis Report Summary & Recharts (UC4) |
| `/analysis-reports/generate` | Generate New Analysis Report (UC4) |
