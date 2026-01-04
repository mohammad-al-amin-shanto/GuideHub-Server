// src/types/express.d.ts
import { UserDocument } from "../models/User.model";

type LeanUser = InferSchemaType<typeof User.schema>;
declare global {
  namespace Express {
    interface Request {
      user?: LeanUser | null;
    }
  }
}

export {};
