# Hydrangea - Fleet Management System

## Overview

Welcome to the Hydrangea Fleet Management System. This is a full-stack web application designed to streamline the operational and financial management of a mixed fleet of buses and ambulances. It provides a secure, role-based platform for administrators and staff to manage vehicles, personnel, and daily financial transactions with precision and efficiency.

The system helps administrators monitor fleet financial health in real time, track performance against targets, and make data-driven decisions. For staff members, it simplifies the process of logging daily vehicle transactions, ensuring all financial data is captured accurately.

## Key Features

### Financial & Operational Management
-   **Centralized Admin Dashboard**: A powerful dashboard for administrators providing a high-level overview of the entire fleet's performance. Features include:
    -   Date-range filtering to analyze performance over specific periods.
    -   Key performance indicators (KPIs) like Total Till, Net Banked vs. Target, and Deficit.
    -   Period-over-period comparisons to track financial trends (e.g., current month vs. previous month).
-   **Fleet Management**: Full Create, Read, Update, and Delete (CRUD) functionality for buses and ambulances. Administrators can add new vehicles, update registration details, set the vehicle type, and define financial targets and operational costs.
-   **Detailed Vehicle Dashboard**: Each vehicle has its own dedicated page, showing key details and a complete history of its financial transactions. This allows for granular analysis of a single vehicle's performance.
-   **Comprehensive Transaction Logging**: An intuitive form for staff to log daily financial transactions for each vehicle. The system automatically calculates critical metrics like `net banked`, `deficit`, and `performance` based on the inputs, minimizing manual calculation errors.
-   **Data Export**: Administrators can export fleet performance summaries and detailed transaction reports to Excel (`.xlsx`) for offline analysis, reporting, or auditing purposes.

### User and Personnel Management
-   **Secure User Authentication**: A complete login system protects the application from unauthorized access. Includes a "Forgot Password" flow for user convenience.
-   **Role-Based Access Control (RBAC)**: The system defines distinct roles for **`Admin`** and **`Staff`**.
    -   `Admin`: Has unrestricted access to all features, including system settings, personnel management, and financial oversight.
    -   `Staff`: Has access to core operational features like logging transactions but is restricted from administrative settings.
-   **Personnel Management**: Admins have dedicated interfaces to manage all personnel associated with the fleet, including drivers, assistants, and application users (other admins and staff), with full CRUD capabilities.
-   **Bulk Operations**: To improve administrative efficiency, the system supports bulk deletion of records (e.g., ambulances, users, transactions) directly from data tables.

### Modern User Interface
-   **Responsive Design**: The user interface is built with modern tools like ShadCN UI and Tailwind CSS, providing a seamless and intuitive experience on both desktop and mobile devices.
-   **Interactive Data Tables**: All tabular data is presented in powerful, interactive data grids powered by TanStack Table, featuring sorting, filtering, and pagination.
-   **Data Visualization**: The admin dashboard utilizes charts from Recharts to provide a clear, visual representation of the fleet's overall performance.

## Tech Stack

-   **Framework**: **Next.js 14+** (utilizing the App Router for server-centric architecture)
-   **Language**: **TypeScript**
-   **UI Components**:
    -   **ShadCN UI**: A collection of beautifully designed, accessible, and reusable components.
    -   **Tailwind CSS**: For all styling and layout.
    -   **Recharts**: For data visualization on the admin dashboard.
    -   **Lucide React**: For a consistent and clean icon set.
-   **Forms**: **React Hook Form** for robust and performant form handling.
-   **Data Tables**: **TanStack Table v8** for powerful and extensible data grids.
-   **Backend**: **Next.js API Routes** serving as the RESTful backend.
-   **Database**: **MySQL 8.0**
-   **Authentication**: **bcryptjs** for secure password hashing.
-   **Utilities**:
    -   **date-fns**: For reliable date manipulation and formatting.
    -   **exceljs**: For generating Excel file exports.
-   **Local Development**: **Docker** & **Docker Compose** for a consistent and reproducible development environment.

## Application Architecture

The application is built as a monolith, with the frontend and backend co-located in a single Next.js project. It follows a classic three-tier architecture:

1.  **Presentation Layer (Frontend)**: Built with a mix of React Server Components (RSCs) for fast initial loads and Client Components (`'use client'`) for interactivity. This layer is responsible for rendering the UI and handling user input.
2.  **Application Logic Layer (Backend)**: Implemented using Next.js API Routes (`src/app/api`). These server-side endpoints contain all business logic, data validation, and serve as the gateway to the database.
3.  **Data Access Layer (Database)**: A dedicated module (`src/lib/db.ts`) manages a connection pool to the MySQL database, ensuring efficient and persistent connections. API routes use this pool to execute SQL queries.

## Getting Started

This project is fully containerized with Docker, making local setup straightforward.

### Prerequisites

-   [Docker](https://docs.docker.com/get-docker/)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

### Running the Application

1.  **Clone the Repository**

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Environment Configuration**: The project includes a `.env` file pre-configured for the Docker environment. No changes are needed to get started locally.

4.  **Set up the Database**: A `localhost.sql` file is included in the project root. This file will be automatically imported by the MySQL service when it starts for the first time, creating all necessary tables and a default admin user.

5.  **Build and Run Services**: Open your terminal in the project root and run:
    ```bash
    docker-compose up --build
    ```

6.  **Access the Services**:
    -   **Web Application**: [http://localhost:3000](http://localhost:3000)
    -   **Database Admin (phpMyAdmin)**: [http://localhost:8080](http://localhost:8080) (User: `root`, Password: `secret`)
    -   **Default Login**:
        -   **Email**: `admin@superadmin.com`
        -   **Password**: `password`

## Financial Calculation Logic

The financial metrics are calculated server-side in:

-   `src/app/api/transactions/route.ts` when creating a transaction
-   `src/app/api/transactions/[id]/route.ts` when updating a transaction

This means the client only sends raw inputs. All derived values are recalculated on the server every time a transaction is created or edited.

### Inputs Used Per Transaction

Each transaction calculation uses these inputs:

-   `total_till`: Total cash collected for the transaction day
-   `fuel`: Fuel spend for that day
-   `operation`: Operational spend for that day
-   `cash_deposited_by_staff`: Cash physically deposited by staff
-   `target`: The vehicle target pulled from the selected vehicle at save time

Important notes:

-   The `target` is copied from the selected vehicle into the transaction record when the transaction is saved. If a vehicle target changes later, old transactions keep their original saved target.
-   `cash_deposited_by_staff` is tracked for reporting, but it does not currently affect `net_banked`, `deficit`, or `performance`.

### Per-Transaction Formulas

For each saved transaction, the app calculates:

-   `amount_paid_to_the_till = total_till - cash_deposited_by_staff`
-   `offload = total_till - fuel - operation`
-   `salary = max(offload - target, 0)`
-   `operations_cost = operation + salary`
-   `net_banked = total_till - fuel - operation - salary`
-   `deficit = max(target - net_banked, 0)`
-   `performance = target > 0 ? net_banked / target : 0`
-   `fuel_revenue_ratio = total_till > 0 ? fuel / total_till : 0`

### Business Meaning Of The Core Metrics

#### Net Banked

`net_banked` is the amount credited toward the vehicle target after subtracting fuel, operation cost, and salary.

Because `salary = max(offload - target, 0)`, any amount above the target is treated as salary. In practice, that means:

-   if `offload` is below target, `salary` is `0`
-   if `offload` is above target, the excess is paid out as `salary`
-   therefore `net_banked` is effectively capped at the target

This makes `net_banked` the amount counted against target, not simply the raw leftover cash.

#### Deficit

`deficit` is the remaining shortfall against target after `net_banked` is applied.

-   If `net_banked` is below target, the deficit is the difference.
-   If `net_banked` reaches or exceeds target, deficit becomes `0`.

Because the formula uses `max(target - net_banked, 0)`, deficit never goes negative at the transaction level.

#### Performance

`performance` measures how much of the target was achieved:

-   `performance = net_banked / target`

Examples:

-   `1.00` = 100% of target achieved
-   `0.75` = 75% of target achieved
-   `0.00` = no target achievement

Since `net_banked` is capped by the target logic, performance is also effectively capped at `100%` per transaction.

### Dashboard Aggregation Logic

The admin dashboard does not recalculate transaction formulas from scratch. Instead, it:

1.  Filters transactions by the selected inclusive date range.
2.  Sums the already-calculated transaction values.
3.  Computes overall and per-vehicle performance from those summed values.

This logic lives in `src/app/dashboard/admin/admin-dashboard-client.tsx`.

#### Period Summary

For the selected date range, the dashboard sums:

-   `total_target += transaction.target`
-   `total_net_banked += transaction.net_banked`
-   `total_till += transaction.total_till`
-   `total_deficit += transaction.deficit`
-   `total_cash_deposited += transaction.cash_deposited_by_staff`

Then it calculates:

-   `overall_performance = total_target > 0 ? min(100, (total_net_banked / total_target) * 100) : 0`

#### Per-Vehicle Table

For the fleet performance table, transactions are grouped by vehicle and the dashboard sums:

-   `total_target`
-   `total_net_banked`
-   `total_till`
-   `total_cash_deposited`

Then it calculates:

-   `total_deficit = total_target - total_net_banked`
-   `performance = total_target > 0 ? total_net_banked / total_target : 0`

Important implementation detail:

-   In the per-vehicle table, `total_deficit` is currently calculated as a raw subtraction and is not clamped with `max(..., 0)` the way individual transaction deficits are.
-   In the overall summary cards, `total_deficit` is the sum of transaction deficits, which are clamped at zero.

That means the summary deficit and the per-vehicle table deficit are related, but not calculated in exactly the same way.
