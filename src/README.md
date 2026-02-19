# Radiant Hospital - Ambulance Fleet Management System

## Overview

Welcome to the Radiant Hospital Ambulance Fleet Management System. This is a comprehensive, full-stack web application designed to streamline the operational and financial management of a hospital's ambulance fleet. It provides a secure, role-based platform for administrators and staff to manage fleet vehicles, personnel, and daily financial transactions with precision and efficiency.

The system empowers healthcare administrators to monitor the fleet's financial health in real-time, track performance against targets, and make data-driven decisions. For staff members, it simplifies the process of logging daily ambulance runs, ensuring all financial data is captured accurately.

## Key Features

### Financial & Operational Management
-   **Centralized Admin Dashboard**: A powerful dashboard for administrators providing a high-level overview of the entire fleet's performance. Features include:
    -   Date-range filtering to analyze performance over specific periods.
    -   Key performance indicators (KPIs) like Total Till, Net Banked vs. Target, and Deficit.
    -   Period-over-period comparisons to track financial trends (e.g., current month vs. previous month).
-   **Ambulance Fleet Management**: Full Create, Read, Update, and Delete (CRUD) functionality for the ambulance fleet. Administrators can add new vehicles, update registration details, and set financial targets and default operational costs.
-   **Detailed Ambulance Dashboard**: Each ambulance has its own dedicated page, showing key details and a complete history of its financial transactions. This allows for granular analysis of a single vehicle's performance.
-   **Comprehensive Transaction Logging**: An intuitive form for staff to log daily financial transactions for each ambulance run. The system automatically calculates critical metrics like `net banked`, `deficit`, and `driver salary` based on the inputs, minimizing manual calculation errors.
-   **Data Export**: Administrators can export fleet performance summaries and detailed transaction reports to Excel (`.xlsx`) for offline analysis, reporting, or auditing purposes.

### User and Personnel Management
-   **Secure User Authentication**: A complete login system protects the application from unauthorized access. Includes a "Forgot Password" flow for user convenience.
-   **Role-Based Access Control (RBAC)**: The system defines distinct roles for **`Admin`** and **`Staff`**.
    -   `Admin`: Has unrestricted access to all features, including system settings, personnel management, and financial oversight.
    -   `Staff`: Has access to core operational features like logging transactions but is restricted from administrative settings.
-   **Personnel Management**: Admins have dedicated interfaces to manage all personnel associated with the fleet, including drivers, emergency technicians, and application users (other admins and staff), with full CRUD capabilities.
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
    -   **xlsx**: For generating Excel file exports.
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
