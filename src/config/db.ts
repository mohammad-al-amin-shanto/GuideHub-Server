import mongoose from "mongoose";
import logger from "@/utils/logger";

const connectDB = async (uri: string) => {
  if (!uri) throw new Error("MONGO_URI not set");
  await mongoose.connect(uri, {});
  logger.info("MongoDB connected");
  return mongoose.connection;
};

export default connectDB;
