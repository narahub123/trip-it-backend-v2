import { User } from "../../db/users";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: mongoose.Types.ObjectId;
        email: string;
        role: string;
      };
    }
  }
}
