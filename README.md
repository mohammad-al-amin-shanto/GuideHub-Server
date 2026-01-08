# 🧭 GuideHub (Backend)

Scalable REST API powering the GuideHub travel & guide marketplace.

The GuideHub Backend is a modular, secure, and scalable REST API built to support the GuideHub platform — connecting travelers with verified guides worldwide.
It handles authentication, listings, bookings, reviews, admin operations, and more, while maintaining clean code architecture and strong TypeScript foundations.

---

## ⚙️ Tech Stack

| Layer          | Technologies                   |
| -------------- | ------------------------------ |
| Runtime        | Node.js                        |
| Language       | TypeScript                     |
| Framework      | Express.js                     |
| Database       | MongoDB + Mongoose             |
| Authentication | JWT (HTTP-only cookies)        |
| Payments       | Stripe (Payment Intents)       |
| Security       | bcrypt, helmet, CORS           |
| Architecture   | Modular MVC-style structure    |

---

## 🧱 Project Architecture

```
src/
 ┣ config/            # DB setup, environment configs
 ┣ controllers/       # Route controllers & business logic
 ┣ routes/            # Express routes
 ┣ models/            # Mongoose schemas
 ┣ middleware/        # Auth, validation, error handlers
 ┣ utils/             # Helper functions
 ┣ types/             # Global TS types
 ┣ app.ts             # Express app config
 ┗ index.ts          # Server bootstrap

```

---

## Key Design Principles

✔ Strong separation of concerns
✔ Modular controller-based architecture
✔ Typed API responses
✔ Centralized error handling
✔ Secure, role-based authentication workflow  
✔ Transaction-safe booking & payment flows

---

## 🔐 Core Features

- JWT Authentication (Register, Login, Refresh)
- Role-based access (User, Guide, Admin)
- Guide Management
- Listings & Availability Management
- Booking System
- Reviews & Ratings
- Image/File Uploads (Cloudinary or local)
- Admin Panel Endpoints
- Email Notifications (planned)
- Advanced Error Handling

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```
git clone https://github.com/your-org/guidehub-backend.git
cd guidehub-backend
```

### 2️⃣ Install dependencies

```
npm install
```

### 3️⃣ Configure environment variables

Create a .env file:

```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
COOKIE_NAME=token
CLIENT_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYMENT_CURRENCY=usd

```

Add or remove based on your stack.

---

## 🏃 Running the Server

Development

```
npm run dev
```

Production

```
npm run build
npm start
```

API will run on:

```
http://localhost:5000/api

```

---

## 🧪 API Structure

Example route paths:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/listings
GET    /api/listings/:id

POST   /api/bookings
GET    /api/bookings/me
PATCH  /api/bookings/:id/status

POST   /api/payments/create-intent
POST   /api/payments/webhook

```

All responses use a standardized format:

```
{
  "success": true,
  "message": "Guide created successfully",
  "data": { ... }
}
```

## 🛡️ Security Highlights

- Password hashing using bcrypt
- JWT token protection
- Route-level role authorization
- Sanitized input validation
- CORS configuration
- Rate limiting & helmet (optional but recommended)

---

## 📦 Deployment

This backend runs seamlessly on:

- Render
- Railway
- DigitalOcean
- AWS EC2
- Docker
- VPS / Bare-metal Node instances

Build & Run:

```
npm run build
node dist/server.js
```

Ensure environment variables are set properly in production.

---

## 🤝 Contributing

We welcome contributions!
Follow the standard Git workflow:

- Fork the repo
- Create a feature branch
- Make changes with clear formatting
- Submit a pull request

## 🗺️ Roadmap

- Real-time chat system
- Webhooks for payment providers
- Analytics & insights endpoints
- Email templates & improved notifications
- Admin dashboard expansion
- Redis caching layer

## 📄 License

Licensed under the MIT License.
