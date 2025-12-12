import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./config/db";
import logger from "./utils/logger";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI || "");
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
