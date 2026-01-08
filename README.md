# 🧭 GuideHub (Backend)

Scalable API powering the GuideHub travel & guide marketplace.

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
| Authentication | JWT + bcrypt                   |
| Validation     | Zod / Joi (whichever you use)  |
| Utilities      | Cloudinary, Multer, Nodemailer |
| Architecture   | MVC + Service Layer            |

---

## 🧱 Project Architecture

```
src/
 ┣ config/            # DB setup, environment configs
 ┣ controllers/       # Route controllers
 ┣ services/          # Business logic layer
 ┣ routes/            # Express routes
 ┣ models/            # Mongoose schemas
 ┣ middleware/        # Auth, validation, error handlers
 ┣ utils/             # Helper functions
 ┣ types/             # Global TS types
 ┣ app.ts             # Express app config
 ┗ server.ts          # Server bootstrap
```

---

## Key Design Principles

✔ Strong separation of concerns
✔ Reusable business logic (services)
✔ Typed API responses
✔ Centralized error handling
✔ Secure authentication workflow

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
- Email Notifications
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
CLIENT_URL=http://localhost:3000
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
http://localhost:5000/api/v1
```

---

## 🧪 API Structure

Example route paths:

```
POST   /auth/register
POST   /auth/login
GET    /guides
GET    /guides/:id
POST   /bookings
GET    /users/me
PUT    /admin/user/:id
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
