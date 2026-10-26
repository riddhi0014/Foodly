# 🍔 Foodly — Full-Stack Microservices Food Delivery Platform

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2F6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

**Foodly** is a production-ready, full-stack food delivery application built using an **event-driven microservices architecture**. It delivers a seamless experience across four dedicated user roles: **Customers**, **Restaurants (Sellers)**, **Delivery Riders**, and **Administrators** — featuring real-time GPS delivery tracking, automated multi-gateway payment processing, and asynchronous order dispatch via message queues.

---

## 📌 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Microservices Breakdown](#-microservices-breakdown)
- [Event-Driven Workflow (RabbitMQ)](#-event-driven-workflow-rabbitmq)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Services](#running-the-services)
- [Environment Variables](#-environment-variables)
- [Deployment & Docker](#-deployment--docker)
- [License](#-license)

---

## 🏗️ Architecture Overview

Foodly separates concerns across independent backend microservices communicating via HTTP REST APIs, persistent WebSockets, and asynchronous RabbitMQ message queues.

```
                            ┌────────────────────────────────────────┐
                            │            Frontend (Vite)             │
                            │   React 19 • Tailwind v4 • Leaflet     │
                            └────┬──────────────┬──────────────┬─────┘
                                 │              │              │
                   HTTP Requests │   WebSockets │  HTTP / OAuth│
                                 ▼              ▼              ▼
                    ┌─────────────────┐  ┌─────────────┐  ┌─────────────────┐
                    │ Restaurant API  │  │ Realtime    │  │  Auth Service   │
                    │   (Port 5002)   │  │ (Port 5004) │  │   (Port 5001)   │
                    └────────┬────────┘  └──────▲──────┘  └────────┬────────┘
                             │                  │                  │
                RabbitMQ Pub │                  │ Internal HTTP    │ MongoDB
                             ▼                  │                  ▼
                    ┌─────────────────┐         │         ┌─────────────────┐
                    │    RabbitMQ     │         │         │   Users / Auth  │
                    │  Message Broker ├─────────┤         └─────────────────┘
                    └────────┬────────┘         │
                             │                  │
                RabbitMQ Sub │                  │
                             ▼                  │
                    ┌─────────────────┐         │
                    │  Rider Service  ├─────────┘
                    │   (Port 5005)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Utils Service  │ ──► Stripe / Razorpay & Cloudinary
                    │   (Port 5003)   │
                    └─────────────────┘
```

---

## ✨ Key Features

### 👤 Customer Experience
- **Interactive Restaurant & Menu Discovery**: Browse local restaurants with rich menus, prices, and high-definition food imagery.
- **Dynamic Cart & Checkout**: Add/remove items, manage multiple delivery addresses, and apply custom delivery instructions.
- **Flexible Payments**: Seamless payment flows via **Stripe** and **Razorpay** checkout sessions.
- **Live Order & Rider Tracking**: Real-time route visualization on interactive **Leaflet OpenStreetMap** with turn-by-turn routing indicators powered by OSRM.
- **Instant Status Notifications**: Audio chimes and toast alerts on order updates and rider status changes.

### 🍳 Restaurant (Seller) Portal
- **Storefront Management**: Onboard restaurant profiles, set operational addresses, and update banner images.
- **Menu Engineering**: Full CRUD for menu items with instant Cloudinary image uploads and categorization.
- **Live Kitchen Display**: Real-time order queue with status transitions: *Pending* ➔ *Preparing* ➔ *Ready for Pickup*.

### 🛵 Delivery Rider Dashboard
- **Instant Order Dispatch**: Real-time broadcast when an order is packed and ready for pickup.
- **Acceptance / Decline Flow**: Instant claim mechanism with delivery request notifications.
- **Turn-by-Turn Navigation**: Map view connecting restaurant pickup and customer drop-off coordinates.
- **Order Lifecycle Controls**: Update order status (*Picked Up* ➔ *Out for Delivery* ➔ *Delivered*).

### 🛡️ Administration Dashboard
- **Platform Management**: Centralized dashboard to view system stats, monitor active restaurants, verify sellers, and oversee delivery riders.

---

## 🧩 Microservices Breakdown

| Service | Port | Primary Responsibilities | Key Dependencies |
| :--- | :---: | :--- | :--- |
| **`auth`** | `5001` | Google OAuth 2.0, JWT token issuance, user profile & role assignment | Express 5, Mongoose, Google APIs, JWT |
| **`restaurant`** | `5002` | Restaurant profiles, menu catalog, cart operations, customer addresses, orders | Express 5, Mongoose, amqplib (RabbitMQ), Multer |
| **`utils`** | `5003` | Cloudinary CDN uploads, Stripe & Razorpay payment sessions & webhook processing | Stripe, Razorpay, Cloudinary, amqplib |
| **`realtime`** | `5004` | Live bidirectional WebSocket server for GPS location updates & status broadcasts | Express 5, Socket.IO, JWT |
| **`rider`** | `5005` | Rider profiles, vehicle registration, dispatch queue, delivery tracking | Express 5, Mongoose, amqplib, Multer |
| **`admin`** | `5006` | Administrative control, platform auditing, user and restaurant verification | Express 5, MongoDB native driver, JWT |
| **`frontend`** | `5173` | React 19 SPA, Tailwind CSS v4, Leaflet Maps, React Router v7 | React 19, Vite 8, Tailwind v4, Socket.IO Client |

---

## ⚡ Event-Driven Workflow (RabbitMQ)

Foodly uses asynchronous message passing to decouple payment processing and order assignment from synchronous user request threads:

```
[Customer Checkout]
       │
       ▼
(Utils Service) ───[Verifies Payment]───► Publishes to "payment_queue"
                                                  │
                                                  ▼
                                      (Restaurant Service)
                                      Consumes payment event
                                      Marks order as PAID & PREPARING
                                                  │
                                                  ▼ [Kitchen marks order READY]
                                      Publishes to "order_ready_queue"
                                                  │
                                                  ▼
                                           (Rider Service)
                                      Consumes order ready event
                                      Dispatches to available riders
                                                  │
                                                  ▼
                                      (Realtime Service via Socket.IO)
                                      Streams live updates to Rider & Customer
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev/) + [Oxlint](https://oxc.rs/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Mapping & Geolocation**: [Leaflet](https://leafletjs.com/), [React-Leaflet](https://react-leaflet.js.org/), Leaflet Routing Machine
- **Real-Time Client**: [Socket.IO Client](https://socket.io/)
- **State & Notifications**: React Context API, [React Hot Toast](https://react-hot-toast.com/), React Icons

### Backend & Microservices
- **Runtime**: [Node.js](https://nodejs.org/) (v20+ / v22 Alpine)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: TypeScript (compiled with `tsc`)
- **Databases**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Message Broker**: [RabbitMQ](https://www.rabbitmq.com/) (AMQP protocol via `amqplib`)
- **Real-Time Engine**: [Socket.IO](https://socket.io/)
- **Asset Storage**: [Cloudinary](https://cloudinary.com/)
- **Payments**: [Stripe](https://stripe.com/) & [Razorpay](https://razorpay.com/)
- **Authentication**: JWT & Google OAuth 2.0 (`googleapis`, `@react-oauth/google`)

---

## 📂 Project Directory Structure

```plaintext
Foodly/
├── frontend/                     # React 19 Vite application
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── assets/               # Audio alerts & SVGs
│   │   ├── components/           # Reusable UI & Map components
│   │   ├── context/              # AppContext & SocketContext
│   │   ├── pages/                # Role-based pages (Customer, Rider, Seller, Admin)
│   │   ├── utils/                # Helper utilities (order flows, coordinates)
│   │   ├── App.tsx               # Root router & role guard
│   │   └── main.tsx              # Providers & service endpoint configurations
│   ├── package.json
│   ├── vercel.json               # Vercel deployment configuration
│   └── vite.config.ts
│
├── services/                     # Backend microservices
│   ├── admin/                    # Admin service (Port 5006)
│   ├── auth/                     # Auth service & Google OAuth (Port 5001)
│   ├── realtime/                 # Socket.IO WebSocket server (Port 5004)
│   ├── restaurant/               # Core restaurant, orders & catalog (Port 5002)
│   ├── rider/                    # Delivery rider & dispatch (Port 5005)
│   └── utils/                    # Payments (Stripe/Razorpay) & Cloudinary (Port 5003)
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following tools are installed locally:
- **Node.js**: `v20.x` or higher (Node 22 recommended)
- **npm** or **pnpm** / **yarn**
- **MongoDB**: Local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas) URI
- **RabbitMQ**: Local broker (`brew install rabbitmq` or Docker `rabbitmq:3-management`)

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/riddhi0014/Foodly.git
   cd Foodly
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install Service Dependencies**:
   ```bash
   for service in services/*; do
     echo "Installing dependencies in $service..."
     (cd "$service" && npm install)
   done
   ```

---

### Running the Services

#### 1. Start Backend Services
Open separate terminal tabs or use a process manager for each service:

```bash
# Auth Service (Port 5001)
cd services/auth && npm run dev

# Restaurant Service (Port 5002)
cd services/restaurant && npm run dev

# Utils Service (Port 5003)
cd services/utils && npm run dev

# Realtime Service (Port 5004)
cd services/realtime && npm run dev

# Rider Service (Port 5005)
cd services/rider && npm run dev

# Admin Service (Port 5006)
cd services/admin && npm run dev
```

#### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Access the client application in your browser at `http://localhost:5173`.

---

## 🔐 Environment Variables

Create a `.env` file in each respective directory based on the reference below:

### `frontend/.env`
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_AUTH_SERVICE=http://localhost:5001
VITE_RESTAURANT_SERVICE=http://localhost:5002
VITE_UTILS_SERVICE=http://localhost:5003
VITE_REALTIME_SERVICE=http://localhost:5004
VITE_RIDER_SERVICE=http://localhost:5005
VITE_ADMIN_SERVICE=http://localhost:5006
```

### `services/auth/.env`
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/foodly-auth
JWT_SEC=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### `services/restaurant/.env`
```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/foodly-restaurant
JWT_SEC=your_jwt_secret_key
UTILS_SERVICE=http://localhost:5003
INTERNAL_SERVICE_KEY=your_shared_internal_secret
REALTIME_SERVICE=http://localhost:5004
RABBITMQ_URL=amqp://localhost:5672
PAYMENT_QUEUE=payment_queue
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

### `services/utils/.env`
```env
PORT=5003
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/foodly-utils
JWT_SEC=your_jwt_secret_key
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_api_secret
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5002
INTERNAL_SERVICE_KEY=your_shared_internal_secret
RABBITMQ_URL=amqp://localhost:5672
PAYMENT_QUEUE=payment_queue
```

### `services/realtime/.env`
```env
PORT=5004
JWT_SEC=your_jwt_secret_key
INTERNAL_SERVICE_KEY=your_shared_internal_secret
```

### `services/rider/.env`
```env
PORT=5005
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/foodly-rider
JWT_SEC=your_jwt_secret_key
UTILS_SERVICE=http://localhost:5003
INTERNAL_SERVICE_KEY=your_shared_internal_secret
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5002
RABBITMQ_URL=amqp://localhost:5672
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

### `services/admin/.env`
```env
PORT=5006
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
DB_NAME=foodly
JWT_SEC=your_jwt_secret_key
```

---

## 🐳 Deployment & Docker

### Docker Containerization
Each backend service is Dockerized with multi-stage builds (`node:22-alpine`):

```bash
# Build any service container (e.g. restaurant service)
docker build -t foodly-restaurant ./services/restaurant

# Run container
docker run -p 5002:5002 --env-file ./services/restaurant/.env foodly-restaurant
```

### Production Deployments
- **Backend Services**: Hosted on [Render](https://render.com) using containerized environments.
- **Frontend**: Hosted on [Vercel](https://vercel.com) with Single Page Application (SPA) rewrite rules configured in `frontend/vercel.json`.

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
