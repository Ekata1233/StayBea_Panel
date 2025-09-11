// utils/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => {
      console.log("✅ MongoDB connected successfully"); // <-- log message
      return m;
    }).catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
