# 📦 Retail Inventory & ERP Portal — Frontend

A high-performance modern Single-Page Application (SPA) built with **React 19**, **Vite**, and **TailwindCSS v4**, providing complete logistics, inventory control, and supply chain management interfaces.

---

## 🚀 Key Modules

- **Executive Admin Command Center**: High-level KPIs, inventory valuation, active orders, and quick access to management tools.
- **Store Associate / Operator Workspace**: Tailored workspace for fast order fulfillment, stock checks, and customer operations.
- **Role Switcher**: Real-time preview mode in the navigation bar to test both Administrator and Operator views seamlessly.
- **Products & Catalog**: Full product listings with category filtering, instant search, and stock level visibility.
- **Multi-Hub Warehouses**: Capacity monitoring, operational status, and address details.
- **Customer Orders & Invoicing**: Order processing workflow (`PENDING` ➔ `DELIVERED`), line-item breakdowns, and printable invoices.
- **Procurement & POs (Admin)**: Vendor directory and purchase order lifecycle management (`PENDING` ➔ `RECEIVED`).
- **Dark / Light Dual Theme Engine**: Seamless toggle with persistent user preference in `localStorage`.

---

## 🛠️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure the backend API URL matches the Spring Boot server port (default: `8081`):

```properties
VITE_API_BASE_URL=http://localhost:8081
```

---

## 💻 Development & Build Scripts

- **Start Dev Server**:
  ```bash
  npm run dev
  ```
  Runs Vite dev server on `http://localhost:5173` with HMR and `/api` proxy to `http://localhost:8081`.

- **Lint Codebase**:
  ```bash
  npm run lint
  ```

- **Build Production Bundle**:
  ```bash
  npm run build
  ```
  Generates production-optimized assets in `dist/`.

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 🔐 Demo Credentials

- **Admin Account**: `admin@hcl.com`
- **Password**: `password123`
*(Or use the 1-click **Auto Fill** button directly on the login form)*
