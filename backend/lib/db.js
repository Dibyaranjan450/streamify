import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGODB_URI;
// Prevent multiple connections in development (hot reload fix)
let isConnected;

if (!uri) {
  throw new Error("Please define the MONGODB_URI in env!");
}

export async function connectMongo() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(uri);
    isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
