# 📦 Retail Inventory & Supply Chain ERP System

[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x%2F4.x-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Security-JWT%20Stateless-blue.svg?logo=springsecurity)](https://spring.io/projects/spring-security)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-blue.svg?logo=mysql)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%20v4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)

A modern, enterprise-grade **Retail Inventory and Supply Chain Management ERP System** engineered with a **Spring Boot** REST backend, stateless **JWT-based Spring Security**, a **MySQL** relational database, and a high-performance **React 19 + Vite + TailwindCSS v4** dashboard interface.

---

## 🌟 Key Features

### 🏢 Multi-Hub Warehouse & Inventory Control

- **Real-time Stock Tracking**: View on-hand total quantities, reserved quantities, and available quantities per warehouse.
- **Low-Stock Replenishment Alerts**: Automatic warnings and notifications when stock falls to or below threshold levels.
- **Multi-Warehouse Allocation**: Manage distribution hubs with capacity limits, operational status, and address details.
- **CSV Export**: Instantly export inventory logs and warehouse summaries to CSV format.

### 🛍️ Product Catalog & Category Management

- Full CRUD operations for retail products with SKU codes, categories, selling prices, unit costs, and reorder levels.
- Instant search and multi-facet filtering by category, status, and warehouse hub.

### 📑 Customer Orders & Sales Fulfillment

- Multi-item order creation linked to customer profiles.
- Automated stock availability checks and real-time status progression (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` / `CANCELLED`).
- Printable and viewable detailed customer invoice summaries.

### 🚚 Supply Chain & Purchase Orders (Admin Only)

- **Supplier Directory**: Manage vendor profiles, points of contact, payment terms, and status.
- **Procurement Pipeline**: Issue, review, and advance purchase orders (`PENDING` ➔ `APPROVED` ➔ `ORDERED` ➔ `RECEIVED`).
- **Direct Stock Replenishment**: Receiving PO stock directly increments warehouse inventory levels.

### 🛡️ Role-Based Access Control (RBAC) & Security

- **Stateless JWT Authentication**: Secure HMAC-signed bearer tokens.
- **Role Segregation & Dedicated Workspaces**:
  - `ADMIN`: Executive Command Center with full access to Procurement, Suppliers, Warehouse Management, and Staff Access Control.
  - `USER` (Operator): Store Operator Workspace tailored for fast order fulfillment, customer registrations, and SKU availability checks.
- **Dynamic Role Switcher**: Quick toggle in the navbar to test and experience both Admin and Operator workspaces instantly.
- **First-User Bootstrap**: The first account registered automatically receives the `ADMIN` role.

### 🎨 State-of-the-Art User Interface (UI/UX)

- **Class-Based Dual Theme Engine**: Seamless instant toggle between Dark Mode and Light Mode, with user preference saved in `localStorage`.
- **High Contrast & Accessible Forms**: Native form controls, dropdowns, and inputs styled for clear readability in both light and dark environments.
- **Spacious Modern Dashboard Layout**: Responsive sidebar with auto-collapse, notification drawer, telemetry status, and elevated card hover micro-interactions.
- **Quick Access Command Trigger**: Keyboard shortcut (`Ctrl + K`) for instant module and SKU lookup.
- **Responsive Design**: Flawlessly adapts across mobile phones, tablets, laptops, and ultra-wide desktop monitors.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 Frontend (Vite)                    │
│   TailwindCSS v4  •  Lucide Icons  •  Axios  •  Context API │
│       Executive Admin Console & Operator Workspace          │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / REST APIs (Port 8081)
                               │ Authorization: Bearer <JWT>
┌──────────────────────────────▼──────────────────────────────┐
│                Spring Boot REST Backend                     │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │   Security Filter Chain │  │ Controllers & Validation  │ │
│  │   JWT Token Validator   │  │ Product, Order, Warehouse │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Spring Data JPA / Hibernate ORM             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC (Port 3306 / 4000)
┌──────────────────────────────▼──────────────────────────────┐
│                MySQL / TiDB Cloud Database                  │
│  `retail_inventory` Schema • Users, Products, Orders, POs   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
retail-inventory-management-system/
├── backend/
│   ├── src/main/java/com/hcl/retail_inventory/
│   │   ├── controller/      # REST API Controllers (Auth, Product, Inventory, Order, PO, etc.)
│   │   ├── entity/          # JPA Domain Entities (User, Product, Warehouse, Order, etc.)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JWT Filter, SecurityConfig, Token Provider
│   │   └── services/        # Business Logic Services
│   ├── src/main/resources/
│   │   ├── application.properties         # Server port (8081), MySQL credentials, JWT secret
│   │   └── application.properties.example # Environment variable template
│   ├── src/test/java/       # Comprehensive MockMvc Integration Test Suites
│   ├── retail_inventory_dataset.sql # Initial database schema & sample dataset
│   └── pom.xml              # Maven dependencies & build plugins
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common, Auth, Product, Order, Warehouse, Supplier components
│   │   ├── context/         # AuthContext and ThemeContext state management
│   │   ├── pages/           # Route Views (Auth, Dashboards, Products, Orders, Inventory, etc.)
│   │   ├── services/        # Axios API clients & interceptors
│   │   ├── utils/           # Global constants (API_BASE_URL: 8081) & CSV exporter
│   │   ├── App.jsx          # Protected route definitions and Layout hierarchy
│   │   └── main.jsx         # React application bootstrap
│   ├── .env.example         # Template with VITE_API_BASE_URL=http://localhost:8081
│   ├── .env                 # Local environment config
│   ├── package.json         # Frontend dependencies and npm scripts
│   └── vite.config.js       # Vite dev server (port 5173) and /api proxy configuration
│
├── .gitignore               # Root git ignore rules
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Java Development Kit (JDK)**: Version 17 or higher
- **Apache Maven**: Version 3.8+
- **Node.js**: Version 18+ and **npm**
- **MySQL Server**: Version 8.0+ (or TiDB Cloud MySQL cluster)

---

### 1️⃣ Database Setup

1. Start your local MySQL service or use TiDB Cloud.
2. Open your MySQL client or terminal and run the sample dump script provided in the backend folder:
   ```bash
   mysql -u root -p < backend/retail_inventory_dataset.sql
   ```
   *(Alternatively, create the database manually: `CREATE DATABASE retail_inventory;`)*

---

### 2️⃣ Backend Configuration & Startup

1. Open `backend/src/main/resources/application.properties` and verify your MySQL credentials and port:

   ```properties
   spring.application.name=retail_inventory

   # MySQL Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/retail_inventory?sslMode=PREFERRED&useUnicode=true&characterEncoding=utf8
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD

   # Server Port
   server.port=8081

   # Hibernate
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=false
   spring.jpa.open-in-view=false

   # JWT Configuration
   jwt.secret=defaultDevelopmentSecretKeyChangeThisImmediately123456789
   jwt.expiration=86400000
   ```

2. Navigate to the backend directory and run the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The backend API will start and listen on **`http://localhost:8081`**.

---

### 3️⃣ Frontend Configuration & Startup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Copy the example environment file or verify `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `VITE_API_BASE_URL=http://localhost:8081` is specified).*

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:5173`**.

---

### 4️⃣ Logging In or Creating an Administrator Account

1. Open the application in your browser at `http://localhost:5173`.
2. **Login Credentials**: Enter your administrator account credentials:
   - **Email**: `admin@hcl.com`
   - **Password**: `password123`
3. **Register New Account**: Click **Create an Account**. If the database has no users, the very first user account registered automatically receives full **`ADMIN`** privileges!

---

## 📡 API Reference Overview

| Module         | Method   | Endpoint                           | Access         | Description                                      |
| -------------- | -------- | ---------------------------------- | -------------- | ------------------------------------------------ |
| **Auth**       | `POST`   | `/api/auth/register`               | Public         | Register new user account (1st user is Admin)    |
| **Auth**       | `POST`   | `/api/auth/login`                  | Public         | Authenticate user & return JWT token             |
| **Auth**       | `GET`    | `/api/auth/me`                     | Authenticated  | Retrieve current user profile                    |
| **Products**   | `GET`    | `/api/products`                    | User / Admin   | List all products with search & category filters |
| **Products**   | `GET`    | `/api/products/{id}`               | User / Admin   | Retrieve product by ID                           |
| **Products**   | `POST`   | `/api/products`                    | User / Admin   | Create new catalog product                       |
| **Products**   | `PUT`    | `/api/products/{id}`               | User / Admin   | Update existing product details                  |
| **Products**   | `DELETE` | `/api/products/{id}`               | **Admin Only** | Remove product from catalog                      |
| **Inventory**  | `GET`    | `/api/inventory`                   | User / Admin   | Query stock levels across distribution hubs      |
| **Inventory**  | `GET`    | `/api/inventory/low-stock`         | User / Admin   | Fetch items below reorder thresholds             |
| **Inventory**  | `POST`   | `/api/inventory`                   | User / Admin   | Add or adjust stock levels                       |
| **Inventory**  | `PUT`    | `/api/inventory/{id}`              | User / Admin   | Update inventory record                          |
| **Warehouses** | `GET`    | `/api/warehouses`                  | User / Admin   | List all active distribution centers             |
| **Warehouses** | `POST`   | `/api/warehouses`                  | **Admin Only** | Register new warehouse hub                       |
| **Warehouses** | `DELETE` | `/api/warehouses/{id}`             | **Admin Only** | Remove warehouse hub                             |
| **Customers**  | `GET`    | `/api/customers`                   | User / Admin   | Browse and manage customer directory             |
| **Customers**  | `POST`   | `/api/customers`                   | User / Admin   | Register new customer record                     |
| **Customers**  | `DELETE` | `/api/customers/{id}`              | **Admin Only** | Remove customer record                           |
| **Orders**     | `GET`    | `/api/orders`                      | User / Admin   | Fetch sales orders and statuses                  |
| **Orders**     | `GET`    | `/api/orders/{id}`                 | User / Admin   | Get order details with line items                |
| **Orders**     | `POST`   | `/api/orders`                      | User / Admin   | Place new customer sales order                   |
| **Orders**     | `PUT`    | `/api/orders/{id}/status`          | User / Admin   | Update sales order fulfillment status            |
| **Orders**     | `DELETE` | `/api/orders/{id}`                 | **Admin Only** | Remove sales order                               |
| **Suppliers**  | `GET`    | `/api/suppliers`                   | **Admin Only** | Manage supply chain vendor profiles              |
| **Suppliers**  | `POST`   | `/api/suppliers`                   | **Admin Only** | Register new supplier                            |
| **Purchase**   | `GET`    | `/api/purchase-orders`             | **Admin Only** | Procurement pipeline & PO lifecycle              |
| **Purchase**   | `POST`   | `/api/purchase-orders`             | **Admin Only** | Draft new purchase order                         |
| **Purchase**   | `PUT`    | `/api/purchase-orders/{id}/status` | **Admin Only** | Advance PO status (`PENDING` ➔ `RECEIVED`)       |
| **Users**      | `GET`    | `/api/users`                       | **Admin Only** | System staff & access control list               |
| **Health**     | `GET`    | `/api/health`                      | Public         | System status and health check                   |

---

## 🛠️ Built With

- **Backend**: Spring Boot 3.x/4.x, Spring Security, Spring Data JPA, Hibernate 7, JJWT (Java JWT), MySQL Connector/J
- **Frontend**: React 19, Vite, TailwindCSS v4, Lucide React, Axios
- **Build & Dev Tools**: Apache Maven, Vite, ESLint flat config

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
