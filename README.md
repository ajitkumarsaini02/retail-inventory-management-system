# 📦 Retail Inventory & Supply Chain ERP System

[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x%2F4.x-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Security-JWT%20Stateless-blue.svg?logo=springsecurity)](https://spring.io/projects/spring-security)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0-blue.svg?logo=mysql)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)

A modern, enterprise-grade **Retail Inventory and Supply Chain Management ERP System** engineered with a **Spring Boot** REST backend, stateless **JWT-based Spring Security**, a **MySQL** relational database, and a high-performance **React (Vite + TailwindCSS)** dashboard interface.

---

## 🌟 Key Features

### 🏢 Multi-Hub Warehouse & Inventory Control
* **Real-time Stock Tracking**: View on-hand total quantities, reserved quantities, and available quantities per warehouse.
* **Low-stock Reorder Triggers**: Automatic alerts and warnings when stock drops to or below threshold levels.
* **Multi-Warehouse Allocation**: Manage multiple distribution hubs with status tracking, capacity monitoring, and address mapping.
* **CSV Export**: Instantly export inventory logs and warehouse summaries to CSV format.

### 🛍️ Product Catalog & Category Management
* Full CRUD for retail products with SKU codes, categories, pricing, unit cost, and reorder levels.
* Instant search and multi-facet filtering by category, status, and warehouse hub.

### 📑 Customer Orders & Sales Fulfillment
* Multi-item order creation tied to customer records.
* Automated stock availability validation and order status lifecycle (`PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` / `CANCELLED`).
* Printable and viewable detailed customer invoice summaries.

### 🚚 Supply Chain & Purchase Orders (Admin Only)
* **Supplier Directory**: Manage vendor profiles, contacts, payment terms, and active statuses.
* **Procurement Orders**: Issue, review, and track purchase orders (`PENDING` ➔ `APPROVED` ➔ `ORDERED` ➔ `RECEIVED`).
* Receiving stock updates directly into warehouse inventory upon PO fulfillment.

### 🛡️ Role-Based Access Control (RBAC) & Security
* **Stateless JWT Authentication**: Secure HMAC-signed bearer tokens.
* **Role Segregation**:
  * `ADMIN`: Full access across all modules, including Procurement, Suppliers, and System Configurations.
  * `USER` (Operator): Operational access to Inventory, Products, Customers, and Sales Orders.
* **First-User Bootstrap**: The first account registered automatically receives the `ADMIN` role.

### 🎨 State-of-the-Art User Interface
* **Dual Theme Engine**: Seamless dark and light modes with custom palette tokens.
* **Quick Access Palette**: Keyboard command shortcuts (`Cmd/Ctrl + K`) for instant navigation.
* **Responsive Layouts**: Designed for mobile, tablet, and ultra-wide desktop monitors.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│    TailwindCSS  •  Lucide Icons  •  Axios Interceptors      │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / REST APIs (Port 8080)
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
                               │ JDBC (Port 3306)
┌──────────────────────────────▼──────────────────────────────┐
│                    MySQL Database                           │
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
│   │   └── application.properties # Server port, MySQL credentials, JWT secret
│   ├── retail_inventory_dataset.sql # Initial database schema & sample dataset
│   └── pom.xml              # Maven dependencies & build plugins
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Images & logos
│   │   ├── components/      # UI Modular Components (Auth, Inventory, Orders, Table)
│   │   ├── context/         # React Contexts (AuthContext, ThemeContext)
│   │   ├── pages/           # View Route Pages (Dashboard, Inventory, Orders, etc.)
│   │   ├── services/        # Axios API Client service layers
│   │   └── utils/           # Constants and CSV exporters
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
│
├── .gitignore               # Root git ignore rules
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your machine:
* **Java Development Kit (JDK)**: Version 17 or higher
* **Apache Maven**: Version 3.8+
* **Node.js**: Version 18+ and **npm**
* **MySQL Server**: Version 8.0+

---

### 1️⃣ Database Setup

1. Start your local MySQL service.
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
   spring.datasource.url=jdbc:mysql://localhost:3306/retail_inventory
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   
   # Server Port
   server.port=8080
   
   # Hibernate
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   
   # JWT Configuration
   jwt.secret=defaultDevelopmentSecretKeyChangeThisImmediately123456789
   jwt.expiration=86400000
   ```

2. Navigate to the backend directory and run the application:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
   The backend API will start and listen on **`http://localhost:8080`**.

---

### 3️⃣ Frontend Configuration & Startup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:5173`**.

---

### 4️⃣ Creating Your Administrator Account
1. Open the application at `http://localhost:5173`.
2. Click on **Create an Account**.
3. Fill in your name, email, and password.
4. **Note:** The very first user account created automatically receives full **`ADMIN`** privileges!

---

## 📡 API Reference Overview

| Module | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user account (1st is Admin) |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| **Products** | `GET` | `/api/products` | User / Admin | List all products with filtering |
| **Products** | `POST` | `/api/products` | User / Admin | Create new catalog product |
| **Inventory** | `GET` | `/api/inventory` | User / Admin | Query stock levels across hubs |
| **Inventory** | `POST` | `/api/inventory` | User / Admin | Add or update stock levels |
| **Warehouses**| `GET` | `/api/warehouses` | User / Admin | List distribution centers |
| **Customers** | `GET` | `/api/customers` | User / Admin | Manage client directory |
| **Orders** | `GET` | `/api/orders` | User / Admin | Fetch sales orders & statuses |
| **Orders** | `POST` | `/api/orders` | User / Admin | Place new customer sales order |
| **Suppliers** | `GET` | `/api/suppliers` | **Admin Only** | Manage supply vendors |
| **Purchase** | `GET` | `/api/purchase-orders` | **Admin Only** | Procurement & PO lifecycle |

---

## 🛠️ Built With

* **Backend**: Spring Boot, Spring Security, Spring Data JPA, Hibernate, JJWT, MySQL Connector/J
* **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons, Axios, React Router DOM
* **Tools**: Maven, NPM, Git, VS Code

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
