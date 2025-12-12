import Stripe from "stripe";
const key = process.env.STRIPE_SECRET_KEY || "";
if (!key) {
  // eslint-disable-next-line no-console
  console.warn(
    "STRIPE_SECRET_KEY not set — stripe calls will fail in production"
  );
}
const stripe = new Stripe(key, { apiVersion: "2022-11-15" });

export default stripe;
