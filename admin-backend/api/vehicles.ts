import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import ws from "ws";

// Configure WebSocket for Neon Database in serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;

// Define the vehicles table directly - matching production schema
const vehicles = pgTable("vehicles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  trim: varchar("trim"),
  price: varchar("price").notNull(),
  mileage: integer("mileage").notNull(),
  exteriorColor: varchar("exterior_color").notNull(),
  interiorColor: varchar("interior_color").notNull(),
  fuelType: varchar("fuel_type").notNull(),
  transmission: varchar("transmission").notNull(),
  drivetrain: varchar("drivetrain").notNull(),
  engine: varchar("engine").notNull(),
  seatingCapacity: integer("seating_capacity"),
  description: text("description"),
  features: varchar("features"), // jsonb in production
  images: varchar("images"), // jsonb in production
  status: varchar("status").notNull().default("available"),
  stockNumber: varchar("stock_number").notNull(),
  vin: varchar("vin").notNull(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  statusBanner: varchar("status_banner"),
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS with credentials - wildcard pattern for all Vercel workspace deployments
  const origin = req.headers.origin;
  // Only allow requests from workspace-nu-ecru.vercel.app and local/test origins
  const isAllowedOrigin =
    origin && (
      origin === "https://workspace-nu-ecru.vercel.app" ||
      origin.includes("replit.dev") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    );

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-vercel-protection-bypass",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const vehicleList = await db.select().from(vehicles);
      res.json({ vehicles: vehicleList });
    } else if (req.method === "POST") {
      const vehicleData = req.body;
      const [vehicle] = await db
        .insert(vehicles)
        .values(vehicleData)
        .returning();
      res.json(vehicle);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling vehicles request:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
}
