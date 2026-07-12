# TransitOps — Smart Transport Operations Platform 🚛

TransitOps is a centralized logistics and transport operations management platform. Designed for logistics companies shifting away from manual spreadsheets, TransitOps digitizes and integrates vehicle registries, CDL driver profiles, trip dispatch lifecycles, maintenance ticketing, fuel logs, and expense tracking. The system enforces strict business rules and provides real-time operational insights via role-based dashboards.

---

## 🔑 Quick Demo Access Credentials

To test the application, use the dropdown on the **Operations Portal** sign-in screen to select your role. The corresponding credentials are listed below:

| Role (RBAC Scope) | Login Email | Password |
|---|---|---|
| **Fleet Manager** | `fleet@transitops.com` | `password123` |
| **Driver / Dispatcher** | `driver@transitops.com` | `password123` |
| **Safety Officer** | `safety@transitops.com` | `password123` |
| **Financial Analyst** | `finance@transitops.com` | `password123` |

*Note: Credentials correspond to mock local storage profiles seeded automatically in `mockDb.js`.*

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** React (Functional Components + Hooks)
- **Routing & Guards:** React Router v6 (Scoped Role-Based Routing guards)
- **State Management:** Context API (Auth session context, Theme toggle state)
- **Styling:** Custom CSS (Obsidian Design Tokens, responsive layouts, support for Dark/Light mode)
- **Visuals & Charts:** Recharts (responsive analytics & distribution graphs)
- **Exports:** Native CSV generation & PDF report rendering (`jspdf`, `jspdf-autotable`)

---

## ⚡ Key Features

1. **Role-Based Access Control (RBAC):** Distinct dashboards, views, and navigation menus custom-tailored for Fleet Managers, Drivers, Safety Officers, and Financial Analysts. Unauthenticated or unauthorized page requests route to secure login/403 pages.
2. **Interactive Dashboard:** Dynamic metric cards and utilization stats (Total Fleet, Active Trucks, Available assets, Maintenance tickets). Includes live filtering by vehicle type, status, and region.
3. **Vehicle & Driver Registry:** Complete profiles featuring custom document attachments (PDF/images), safety score monitoring, and automated licensing warnings.
4. **Trip Lifecycle Dispatch:** Interactive dispatch board to schedule, start, log fuel/distance, and complete cargo trips.
5. **Maintenance & Fuel Logging:** Real-time logging of service checks and fuel expenses with automatic asset cost calculations.
6. **Reports & Analytics:** Performance tables with immediate filters and single-click **CSV** and **PDF** exports.
7. **Obsidian Dark & Light Modes:** Custom theme toggle located in the main header and sidebar layout.

---

## 🚀 Running the Project Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 3. Build for Production
```bash
npm run build
```
