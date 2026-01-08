import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

// Routes
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import listingsRoutes from "./routes/listings.routes";
import bookingsRoutes from "./routes/bookings.routes";
import paymentsRoutes from "./routes/payments.routes";

// Controllers
import { handleStripeWebhook } from "./controllers/payments.controller";

// Middleware
import errorHandler from "./middleware/errorHandler";

const app = express();

/* ======================================================
   SECURITY
====================================================== */
app.use(helmet());

/* ======================================================
   🔥 STRIPE WEBHOOK (MUST BE FIRST)
   - Uses raw body
   - Must come BEFORE express.json()
====================================================== */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ======================================================
   CORS CONFIG
====================================================== */

app.use(
  cors({
    origin: "https://guide-hub-client.vercel.app",
    credentials: true,
  })
);

/* ======================================================
   BODY PARSERS (AFTER WEBHOOK)
====================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ======================================================
   LOGGING
====================================================== */
app.use(morgan("tiny"));

/* ======================================================
   HEALTH & ROOT
====================================================== */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "GuideHub API",
    note: "API running",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ======================================================
   API ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);

/* ======================================================
   ERROR HANDLER (LAST)
====================================================== */
app.use(errorHandler);

export default app;
