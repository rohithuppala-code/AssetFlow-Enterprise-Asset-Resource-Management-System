# 🚀 AssetFlow

### 🏢 Enterprise Asset & Resource Management System

AssetFlow is a modern, cross-industry Enterprise Resource Planning (ERP) platform designed to digitize and manage the end-to-end lifecycle of an organization’s physical assets and shared resources. It replaces outdated spreadsheets with a robust, real-time tracking pipeline for asset registrations, allocations, transfer conflict resolutions, resource bookings, maintenance operations, and physical audits.

---

## 🛠️ Technology Stack & Badges

| Architecture Layer | Technologies | Badges |
| :--- | :--- | :--- |
| **Frontend UI/UX** | React 19, Vite, Tailwind CSS, Framer Motion | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-B736FF?style=for-the-badge&logo=vite&logoColor=FFD62B) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Backend Services** | Node.js, Express, Joi Schema Validator | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![Joi](https://img.shields.io/badge/Joi-F25F5C?style=for-the-badge&logo=json&logoColor=white) |
| **Database & ODM** | MongoDB Atlas Cloud, Mongoose ODM | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white) |
| **Security & Auth** | JWT Authentication, Bcrypt Password Salting | ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![Bcrypt](https://img.shields.io/badge/Bcrypt-4A154B?style=for-the-badge&logo=keybase&logoColor=white) |
| **Network Client** | Axios HTTP Request Client with Token Rotation Interceptors | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) |

---

## 📐 System Modules & Component Flow

The master workflow below maps every user page, backend route, middleware gate, controller handler, service module, and MongoDB collection in a colorful representation.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef route fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff;
    classDef middleware fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff;
    classDef controller fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef service fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    classDef model fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;

    %% Client Pages
    subgraph "Client Pages (React Router)"
        P_Dash[📊 Dashboard Page]
        P_Assets[📦 Assets Directory]
        P_Alloc[🔄 Allocations & Transfers]
        P_Book[📅 Resource Bookings]
        P_Maint[🔧 Maintenance Tickets]
        P_Aud[📋 Physical Audits]
        P_Org[🏢 Organization Setup]
        P_Rep[📈 Analytics Reports]
        P_Notif[🔔 Notification Center]
        P_Logs[📝 Audit Trails]
    end

    %% API Routes
    subgraph Express Routing Gateway
        R_Auth[POST /api/v1/auth]
        R_Asset[GET/POST /api/v1/assets]
        R_Alloc[GET/POST /api/v1/allocations]
        R_Book[GET/POST /api/v1/bookings]
        R_Maint[GET/POST /api/v1/maintenance]
        R_Aud[GET/POST /api/v1/audits]
        R_Org[GET/POST /api/v1/departments]
        R_Rep[GET /api/v1/reports]
    end

    %% Middlewares
    subgraph Security Guards
        M_Auth{JWT Authentication}
        M_Role{Role Verification}
        M_Val{Joi Validator}
    end

    %% Controllers
    subgraph Express Controllers
        C_Auth[Auth Controller]
        C_Asset[Asset Controller]
        C_Alloc[Allocation Controller]
        C_Book[Booking Controller]
        C_Maint[Maintenance Controller]
        C_Aud[Audit Controller]
        C_Org[Org Controller]
        C_Rep[Report Controller]
    end

    %% Services
    subgraph "Business Logic (services/*)"
        S_Auth[Auth Service]
        S_Asset[Asset Service]
        S_Alloc[Allocation Service]
        S_Book[Booking Service]
        S_Maint[Maintenance Service]
        S_Aud[Audit Service]
        S_Org[Org Service]
        S_Rep[Report Aggregator]
    end

    %% Database Models
    subgraph MongoDB Database
        Db_User[(User Collection)]
        Db_Asset[(Asset Collection)]
        Db_Alloc[(Allocation Collection)]
        Db_Book[(Booking Collection)]
        Db_Maint[(Maintenance Collection)]
        Db_Aud[(Audit Collection)]
        Db_Dept[(Department Collection)]
        Db_Cat[(Category Collection)]
    end

    %% Connections
    P_Dash --> R_Rep
    P_Assets --> R_Asset
    P_Alloc --> R_Alloc
    P_Book --> R_Book
    P_Maint --> R_Maint
    P_Aud --> R_Aud
    P_Org --> R_Org
    P_Rep --> R_Rep

    R_Asset --> M_Auth
    R_Alloc --> M_Auth
    R_Book --> M_Auth
    R_Maint --> M_Auth
    R_Aud --> M_Auth
    R_Org --> M_Auth
    R_Rep --> M_Auth

    M_Auth --> M_Role
    M_Role --> M_Val
    
    M_Val --> C_Asset
    M_Val --> C_Alloc
    M_Val --> C_Book
    M_Val --> C_Maint
    M_Val --> C_Aud
    M_Val --> C_Org
    M_Val --> C_Rep

    C_Asset --> S_Asset
    C_Alloc --> S_Alloc
    C_Book --> S_Book
    C_Maint --> S_Maint
    C_Aud --> S_Aud
    C_Org --> S_Org
    C_Rep --> S_Rep

    S_Auth --> Db_User
    S_Asset --> Db_Asset
    S_Alloc --> Db_Alloc
    S_Book --> Db_Book
    S_Maint --> Db_Maint
    S_Aud --> Db_Aud
    S_Org --> Db_Dept
    S_Org --> Db_Cat
    S_Rep --> Db_Alloc
    S_Rep --> Db_Book

    %% Applying Classes
    class P_Dash,P_Assets,P_Alloc,P_Book,P_Maint,P_Aud,P_Org,P_Rep,P_Notif,P_Logs client;
    class R_Auth,R_Asset,R_Alloc,R_Book,R_Maint,R_Aud,R_Org,R_Rep route;
    class M_Auth,M_Role,M_Val middleware;
    class C_Auth,C_Asset,C_Alloc,C_Book,C_Maint,C_Aud,C_Org,C_Rep controller;
    class S_Auth,S_Asset,S_Alloc,S_Book,S_Maint,S_Aud,S_Org,S_Rep service;
    class Db_User,Db_Asset,Db_Alloc,Db_Book,Db_Maint,Db_Aud,Db_Dept,Db_Cat model;
```

---

## 📐 Architecture & System Design

### 1. High-Level Design (HLD)

The HLD below represents the clean segregation of client-side components, request mediation, app services, security interceptors, and database systems.

```mermaid
graph TB
    %% Define Styles
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff;
    classDef infra fill:#64748b,stroke:#475569,color:#fff;
    classDef app fill:#8b5cf6,stroke:#6d28d9,color:#fff;
    classDef security fill:#ef4444,stroke:#b91c1c,color:#fff;
    classDef db fill:#10b981,stroke:#047857,color:#fff;

    subgraph "Client Layer (React 19)"
        UI[Tailwind CSS Components] --- Pages[Vite Routing & Pages]
        Pages --- AuthCtx[AuthContext / User Session]
        Pages --- Axios[Axios Instance / Interceptors]
    end
    
    subgraph Infrastructure
        Proxy[Vite Proxy]
    end
    
    Axios --- Proxy
    Proxy --- Route[API Routes Gateway]
    
    subgraph "Service Application Layer (Node/Express)"
        Route --- Controllers[Express Controllers]
        Controllers --- Services[Business Services]
        Services --- Aggregation[Report Aggregator]
    end
    
    subgraph Security Layer
        JWT[JWT Verification & Rotation]
        Joi[Joi Schema Sanitizers]
    end
    
    Controllers -.-> JWT
    Controllers -.-> Joi
    
    subgraph Database Layer
        Mongoose[Mongoose ODM] --- DB[(MongoDB Atlas Cloud)]
    end
    
    Services --- Mongoose
    Aggregation --- Mongoose

    class UI,Pages,AuthCtx,Axios client;
    class Proxy,Route infra;
    class Controllers,Services,Aggregation app;
    class JWT,Joi security;
    class Mongoose,DB db;
```

---

### 2. Low-Level Design (LLD)

The system enforces a **Three-Layer Architecture** (Routes ➔ Controllers ➔ Services ➔ Models). The diagram below models the schema structures and relationships between primary database entities.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +ObjectId department
        +String status
        +comparePassword(candidatePassword)
        +toJSON()
    }
    class Asset {
        +ObjectId _id
        +String name
        +String assetTag
        +String status
        +ObjectId category
        +Object specs
        +Date purchaseDate
    }
    class Allocation {
        +ObjectId _id
        +ObjectId asset
        +ObjectId allocatedTo
        +ObjectId allocatedBy
        +Date expectedReturnDate
        +String status
    }
    class Booking {
        +ObjectId _id
        +ObjectId asset
        +ObjectId bookedBy
        +Date startTime
        +Date endTime
        +String status
    }
    
    User "1" --> "0..*" Allocation : receives
    Asset "1" --> "0..*" Allocation : assigned_in
    Asset "1" --> "0..*" Booking : reserved_in
```

---

### 3. Data Flow Diagram (DFD)

The data flow diagram depicts the journey of a client request as it gets authorized, sanitized, routed through controllers to service layers, queried in MongoDB, and broadcasted to log and notification adapters.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff;
    classDef middleware fill:#ef4444,stroke:#b91c1c,color:#fff;
    classDef controller fill:#8b5cf6,stroke:#6d28d9,color:#fff;
    classDef service fill:#f59e0b,stroke:#b45309,color:#fff;
    classDef model fill:#10b981,stroke:#047857,color:#fff;

    User([User Client]) -->|1. Request with JWT / Cookies| API[API Gateway / Router]
    
    subgraph Middlewares
        Auth[JWT Authentication] --> Role[Role Authorization]
        Role --> Validate[Joi Schema Validation]
    end
    
    API --> Auth
    Validate -->|2. Validated Payload| Controller[Controller Layer]
    
    subgraph Services
        Conflict[Conflict Detection Service]
        Notify[Notification Service]
        Logger[Activity Logging Service]
    end
    
    Controller -->|3. Invoke Service| MainService[Main Business Service]
    MainService --> Conflict
    MainService -->|4. Query / Update| Models[Mongoose Models]
    
    subgraph Storage
        MongoDB[(MongoDB Atlas)]
    end
    
    Models ---|5. Read / Write| MongoDB
    MainService --> Notify
    MainService --> Logger
    MainService -->|6. Return DTO| Controller
    Controller -->|7. JSON Response| User

    class User client;
    class Auth,Role,Validate middleware;
    class Controller,API controller;
    class Conflict,Notify,Logger,MainService service;
    class Models,MongoDB model;
```

---

### 4. Authentication Flow (JWT Token Rotation & Invalidation)

AssetFlow balances security and UX via **JWT Token Rotation**. Access tokens are short-lived, while refresh tokens are hashed in MongoDB. The sequence below demonstrates login, request authorization, automatic silent token refreshing, and token rotation security checks.

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / Admin
    participant Frontend as React App (Axios)
    participant Backend as Express Server
    participant DB as MongoDB Atlas

    User->>Frontend: Enter credentials & submit
    Frontend->>Backend: POST /api/v1/auth/login
    Backend->>DB: Fetch user & verify password
    DB-->>Backend: User records match
    Backend->>Backend: Generate JWT Access & Refresh Tokens
    Backend-->>Frontend: Response (Access Token in JSON, Refresh Token in Secure HTTP-Only Cookie)
    Frontend->>Frontend: Save Access Token in Memory (State)
    Note over Frontend, Backend: Access Token expires (15 min)
    Frontend->>Backend: GET /api/v1/assets (Expired Access Token)
    Backend-->>Frontend: 401 Unauthorized
    Frontend->>Backend: POST /api/v1/auth/refresh (Sends Refresh Cookie)
    Backend->>DB: Verify Refresh Hash in Database
    DB-->>Backend: Valid refresh session
    Backend->>Backend: Generate new Access & Refresh Token pair
    Backend-->>Frontend: 200 OK (New Access Token in JSON, New Refresh Cookie)
    Frontend->>Backend: Retry GET /api/v1/assets (New Access Token)
    Backend-->>Frontend: 200 OK (Return Asset Data)
```

---

## 🚀 Installation & Setup

### Prerequisites
* ⚙️ Node.js (v18+)
* 📦 npm (v10+)
* 🗄️ A MongoDB Atlas Cluster

### Step 1: Clone and Install Dependencies

```bash
# 1. Clone the repository
git clone https://github.com/Pranavdotexe/HelloWorld.git
cd HelloWorld

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/assetflow?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
BCRYPT_SALT_ROUNDS=12
```

### Step 3: Run the Application

#### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```

#### 2. Start the Frontend Client (Terminal 2)
```bash
cd frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser. 

---

## 🔒 Security Hardening
* 🛡️ **NoSQL Injection Protection:** Queries use structured object attributes instead of raw inputs to prevent query manipulation.
* 🔑 **Token Rotation:** Old refresh tokens are invalidated upon use. If a reuse attack is detected, all refresh sessions for the compromised user are instantly revoked.
* 🍪 **HTTP-Only Cookies:** Prevents XSS attacks from accessing the session tokens.
