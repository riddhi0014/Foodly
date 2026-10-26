# 🍔 Foodly — Full-Stack Microservices Food Delivery Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2F6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-AMQP-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

> **An event-driven, production-grade food delivery application built with a distributed microservices architecture.**  
> Features real-time GPS delivery tracking with Leaflet OpenStreetMap, automated asynchronous payment-to-dispatch pipelines with RabbitMQ, role-based workflows for 4 distinct user types, and full Docker containerization.

---

## 🔗 Live Application & Showcase

- 🌐 **Live Website:** [Foodly on Vercel](https://food-delivery-app-2.vercel.app) *(Replace with your deployment URL if different)*
- 🎥 **Video Demo Walkthrough:** [Watch 2-Minute Demo on Loom / YouTube](#) *(Add your recording link)*
- 👨‍💻 **Developer:** [Riddhi Jain](https://github.com/riddhi0014) • [Email](mailto:rjain_be24@thapar.edu)

> ⏳ **Note for Reviewers & Employers on Cold Starts:**  
> The backend microservices are hosted on Render free tier and connect to MongoDB Atlas. If the services have been inactive, the initial request may take **~30–45 seconds** to warm up (cold start). Once spun up, all actions run with instant responsiveness. For an uninterrupted preview, check out the video walkthrough linked above!

---

## 📌 Table of Contents

- [Why This Project? (Key Engineering Highlights)](#-why-this-project-key-engineering-highlights)
- [System Architecture](#-system-architecture)
- [Microservices Breakdown](#-microservices-breakdown)
- [Event-Driven Order & Delivery Lifecycle](#-event-driven-order--delivery-lifecycle)
- [Core Features & Multi-Role Workflows](#-core-features--multi-role-workflows)
- [Technical Stack & Skills Demonstrated](#-technical-stack--skills-demonstrated)
- [Testing & Demo Guide for Evaluators](#-testing--demo-guide-for-evaluators)
- [Local Development Setup](#-local-development-setup)
- [Environment Configuration](#-environment-configuration)
- [Deployment Architecture](#-deployment-architecture)
- [Author & Contact](#-author--contact)

---

## 💡 Why This Project? (Key Engineering Highlights)

Foodly was engineered to model the complexity, concurrency, and reliability requirements of real-world on-demand logistics platforms (like DoorDash, UberEats, or Swiggy):

1. **Decoupled Event-Driven Microservices:** Rather than a monolithic backend, business domains are isolated into 6 specialized microservices. Services communicate via REST APIs, persistent WebSockets, and asynchronous **RabbitMQ (AMQP)** message queues.
2. **Resilient Asynchronous Processing:** Payment verification and order readiness trigger asynchronous background workers via message brokers, ensuring that user-facing HTTP request threads never block or time out during heavy processing.
3. **Real-Time GPS Tracking with WebSockets:** Live bidirectional communication using **Socket.IO** streams rider coordinates to the customer map, complete with route rendering via **Leaflet** and **OSRM (Open Source Routing Machine)**.
4. **Role-Based Access Control (RBAC):** Unified Single Page Application (SPA) dynamically renders tailor-made interfaces depending on whether the authenticated user is a **Customer**, **Restaurant Merchant**, **Delivery Rider**, or **Administrator**.
5. **Multi-Gateway Payment Integration:** Production-style checkout pipelines supporting both **Stripe** and **Razorpay**, with automatic webhook confirmation and order state transitions.

---

## 🏗️ System Architecture

```
                                 ┌─────────────────────────────────────────┐
                                 │       Frontend Client (Vercel)          │
                                 │   React 19 • TypeScript • Tailwind v4   │
                                 └────┬───────────────┬──────────────┬─────┘
                                      │               │              │
                        HTTP REST API │    WebSockets │   REST/OAuth │
                                      ▼               ▼              ▼
                         ┌─────────────────┐   ┌─────────────┐  ┌─────────────────┐
                         │ Restaurant API  │   │  Realtime   │  │  Auth Service   │
                         │   (Port 5002)   │   │ (Port 5004) │  │   (Port 5001)   │
                         └────────┬────────┘   └──────▲──────┘  └────────┬────────┘
                                  │                   │                  │
                     RabbitMQ Pub │                   │ Internal Notify  │ MongoDB
                                  ▼                   │                  ▼
                         ┌─────────────────┐          │         ┌─────────────────┐
                         │    RabbitMQ     │          │         │   Users / Auth  │
                         │  Message Broker ├──────────┤         └─────────────────┘
                         └────────┬────────┘          │
                                  │                   │
                     RabbitMQ Sub │                   │
                                  ▼                   │
                         ┌─────────────────┐          │
                         │  Rider Service  ├──────────┘
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

## 🧩 Microservices Breakdown

| Service | Port | Domain Responsibility | Key Technologies |
| :--- | :---: | :--- | :--- |
| **`auth-service`** | `5001` | Google OAuth 2.0 verification, JWT session tokens, user onboarding & role selection | Express 5, Mongoose, Google APIs, JWT |
| **`restaurant-service`** | `5002` | Restaurant profiles, menu item catalog, dynamic cart, address management, order state machine | Express 5, Mongoose, amqplib, Multer |
| **`utils-service`** | `5003` | Multi-gateway payment sessions (Stripe & Razorpay), payment webhooks, Cloudinary media CDN uploads | Stripe SDK, Razorpay SDK, Cloudinary, amqplib |
| **`realtime-service`** | `5004` | Bidirectional WebSocket server broadcasting order status transitions and live rider GPS location | Socket.IO, Express 5, JWT |
| **`rider-service`** | `5005` | Rider profiles, vehicle registration, dispatch queue, delivery claim & assignment | Express 5, Mongoose, amqplib, Multer |
| **`admin-service`** | `5006` | Platform administration, merchant verification, rider moderation, and platform metrics | Express 5, MongoDB Native Driver, JWT |
| **`frontend`** | `5173` | Responsive Single Page Application with dynamic role-based routing and map visualization | React 19, Vite 8, Tailwind v4, Leaflet |

---

## ⚡ Event-Driven Order & Delivery Lifecycle

Foodly avoids monolithic database locking and synchronous bottlenecks by passing state changes through **RabbitMQ message queues**:

```
[1. Customer Places Order & Pays]
               │
               ▼
   (Utils / Payment Service)
   Verifies Stripe / Razorpay Webhook
   Publishes event to RabbitMQ: "payment_queue"
               │
               ▼
   (Restaurant Service)
   Consumes "payment_queue"
   Transitions Order state: UNPAID ➔ PAID ➔ PREPARING
               │
               ▼
   [2. Kitchen Finishes Preparing Food]
   Merchant clicks "Mark as Ready"
   Restaurant Service publishes to RabbitMQ: "order_ready_queue"
               │
               ▼
   (Rider Service)
   Consumes "order_ready_queue"
   Identifies online riders in proximity
   Sends internal dispatch trigger to Realtime Service
               │
               ▼
   (Realtime Service via Socket.IO)
   Broadcasts audio notification & delivery request to available riders
               │
               ▼
   [3. Rider Accepts & Delivers]
   Rider claims order ➔ Live GPS coordinate streaming begins
   Customer tracks rider movement on interactive Leaflet route in real time
   Rider marks: PICKED_UP ➔ OUT_FOR_DELIVERY ➔ DELIVERED
```

---

## ✨ Core Features & Multi-Role Workflows

### 1. 👤 Customer Experience
- **Interactive Restaurant Discovery:** Search local eateries, explore categorized menus with high-resolution food images.
- **Cart & Dynamic Pricing:** Real-time item quantity adjustment, delivery address selection, and price calculation.
- **Secure Multi-Gateway Checkout:** Dual support for **Stripe** and **Razorpay** checkout sessions.
- **Turn-by-Turn Live Tracking:** Real-time route visualization using **Leaflet** + **OSRM**, displaying the path between customer and delivery rider.
- **Instant Audio Alerts:** Interactive audio chimes and toast alerts when order status changes.

### 2. 🍳 Restaurant (Seller) Portal
- **Storefront & Menu Management:** Create restaurant profiles and manage menu items with Cloudinary-backed image uploads.
- **Live Kitchen Order Queue:** Real-time incoming order dashboard with status controls: *Preparing* ➔ *Ready for Pickup*.

### 3. 🛵 Delivery Rider Dashboard
- **Instant Dispatch Radar:** Receive real-time audio and visual order alerts when an order in the area is marked ready.
- **Claim & Route Navigation:** Accept or decline deliveries; view full routing from restaurant to customer destination.
- **Delivery State Controls:** Step-by-step progress tracking (*Picked Up* ➔ *Out for Delivery* ➔ *Delivered*).

### 4. 🛡️ Administrator Panel
- **System Oversight:** Centralized panel for auditing active restaurants, verifying new merchants, and managing delivery riders.

---

## 🛠️ Technical Stack & Skills Demonstrated

| Category | Technologies & Tools |
| :--- | :--- |
| **Frontend Engineering** | React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router DOM v7, React Hot Toast, React Icons |
| **Maps & Geospatial** | Leaflet, React-Leaflet, Leaflet Routing Machine, OpenStreetMap, OSRM API |
| **Backend & APIs** | Node.js (v22), Express 5, RESTful API Design, Microservices Architecture |
| **Real-Time & Messaging** | Socket.IO (WebSockets), RabbitMQ (AMQP protocol via `amqplib`) |
| **Databases & Cloud Storage** | MongoDB, MongoDB Atlas, Mongoose ODM, Cloudinary Image CDN |
| **Payments & Auth** | Stripe API, Razorpay API, Google OAuth 2.0 (`@react-oauth/google`, `googleapis`), JWT |
| **DevOps & Containers** | Docker (Multi-stage Alpine builds), Vercel (Frontend SPA), Render (Web Services) |

---

## 🧪 Testing & Demo Guide for Evaluators

Want to test all 4 roles in the live app? Follow this quick guide:

1. **Sign In:**
   - Navigate to the [Live Website](https://food-delivery-app-2.vercel.app).
   - Sign in using your Google Account via Google OAuth.
2. **Switching Roles:**
   - Click on your profile or visit `/select-role` to switch between:
     - **Customer:** Default user experience (browse, cart, checkout, live map).
     - **Seller (Restaurant):** Access the restaurant kitchen queue and menu management.
     - **Rider:** Access the rider dispatch screen and delivery simulator.
     - **Admin:** Access platform verification and administration.
3. **Simulating a Full Order Flow:**
   - **Step A (Customer):** Add an item to cart, choose an address, and proceed to checkout using Stripe test credentials.
   - **Step B (Restaurant):** Switch role to Seller ➔ View order under "Orders" ➔ Click "Preparing" ➔ Click "Ready for Pickup".
   - **Step C (Rider):** Switch role to Rider ➔ Hear notification chime ➔ Accept the delivery ➔ Watch routing update ➔ Mark "Delivered".
   - **Step D (Customer):** View order status transition to "Delivered" on the live map.

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **MongoDB**: Local instance or MongoDB Atlas URI
- **RabbitMQ**: Local broker (`brew install rabbitmq` or `docker run -d -p 5672:5672 rabbitmq:3-management`)

### 1. Clone & Install
```bash
git clone https://github.com/riddhi0014/Foodly.git
cd Foodly

# Install Frontend
cd frontend && npm install && cd ..

# Install all microservices
for service in services/*; do
  (cd "$service" && npm install)
done
```

### 2. Run Locally
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 to 7 - Backend Microservices
cd services/auth && npm run dev
cd services/restaurant && npm run dev
cd services/utils && npm run dev
cd services/realtime && npm run dev
cd services/rider && npm run dev
cd services/admin && npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🔐 Environment Configuration

Create a `.env` file in each respective directory with the following variables:

<details>
<summary><b>Click to expand Environment Variables Reference</b></summary>

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
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/foodly-auth
JWT_SEC=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### `services/restaurant/.env`
```env
PORT=5002
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/foodly-restaurant
JWT_SEC=your_jwt_secret
UTILS_SERVICE=http://localhost:5003
INTERNAL_SERVICE_KEY=your_shared_secret
REALTIME_SERVICE=http://localhost:5004
RABBITMQ_URL=amqp://localhost:5672
PAYMENT_QUEUE=payment_queue
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

### `services/utils/.env`
```env
PORT=5003
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/foodly-utils
JWT_SEC=your_jwt_secret
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_SECRET_KEY=your_cloudinary_secret
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5002
INTERNAL_SERVICE_KEY=your_shared_secret
RABBITMQ_URL=amqp://localhost:5672
PAYMENT_QUEUE=payment_queue
```

### `services/realtime/.env`
```env
PORT=5004
JWT_SEC=your_jwt_secret
INTERNAL_SERVICE_KEY=your_shared_secret
```

### `services/rider/.env`
```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/foodly-rider
JWT_SEC=your_jwt_secret
UTILS_SERVICE=http://localhost:5003
INTERNAL_SERVICE_KEY=your_shared_secret
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5002
RABBITMQ_URL=amqp://localhost:5672
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

### `services/admin/.env`
```env
PORT=5006
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
DB_NAME=foodly
JWT_SEC=your_jwt_secret
```

</details>

---

## 🐳 Deployment Architecture

- **Frontend:** Hosted on [Vercel](https://vercel.com) with client-side SPA routing (`frontend/vercel.json`).
- **Backend Services:** Containerized using multi-stage Alpine Docker builds (`services/*/Dockerfile`) and deployed on [Render](https://render.com).
- **Database:** Cloud-managed [MongoDB Atlas](https://www.mongodb.com/atlas) multi-tenant clusters.
- **Media CDN:** [Cloudinary](https://cloudinary.com/) for optimized food and storefront assets.

---

## 👤 Author & Contact

**Riddhi Jain**  
- 💼 LinkedIn: [linkedin.com/in/riddhi-jain](https://linkedin.com) *(Update with your LinkedIn link)*  
- 🐙 GitHub: [@riddhi0014](https://github.com/riddhi0014)  
- 📧 Email: [rjain_be24@thapar.edu](mailto:rjain_be24@thapar.edu)  

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
