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
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://workspace-nu-ecru.vercel.app",
    /^https?:\/\/([a-zA-Z0-9-]+\.)?replit\.dev$/,
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  ];

  const isAllowedOrigin = allowedOrigins.some(o =>
    o instanceof RegExp ? o.test(origin) : o === origin
  );

  if (!isAllowedOrigin) {
    return res.status(403).json({ message: "Origin not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vercel-protection-bypass");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // if (req.method === "GET") {
    //   const vehicleList = await db.select().from(vehicles);
    //   res.json({ vehicles: vehicleList });
    // } else 
    if (req.method === "POST") {
      const vehicleData = req.body;
      const [vehicle] = await db
        .insert(vehicles)
        .values(vehicleData)
        .returning();
      res.json(vehicle);
    } else if (req.method === "PUT") {
      // Expect vehicle id in the URL path: /api/auth/vehicles/:id
      const idMatch = req.url?.match(/\/api\/auth\/vehicles\/([a-zA-Z0-9-]+)/);
      const vehicleId = idMatch?.[1];
      if (!vehicleId) {
        return res.status(400).json({ message: "Vehicle ID required in URL" });
      }
      const updateData = req.body;
      // Serialize arrays to JSON for DB columns
      if (Array.isArray(updateData.features)) {
        updateData.features = JSON.stringify(updateData.features);
      }
      if (Array.isArray(updateData.images)) {
        updateData.images = JSON.stringify(updateData.images);
      }
      // Update the vehicle with the given id
      const [updatedVehicle] = await db
        .update(vehicles)
        .set(updateData)
        .where(eq(vehicles.id, vehicleId))
        .returning();
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(updatedVehicle);
      } else if (req.method === "DELETE") {
        // Expect vehicle id in the URL path: /api/auth/vehicles/:id
        const idMatch = req.url?.match(/\/api\/auth\/vehicles\/([a-zA-Z0-9-]+)/);
        const vehicleId = idMatch?.[1];
        if (!vehicleId) {
          return res.status(400).json({ message: "Vehicle ID required in URL" });
        }
        const deleted = await db.delete(vehicles).where(eq(vehicles.id, vehicleId)).returning();
        if (!deleted.length) {
          return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json({ message: "Vehicle deleted", vehicle: deleted[0] });
    } else {
      res.status(405).json({ message: "Method not allowed, but it should be allowed >:C" });
    }
  } catch (error) {
    console.error("Error handling vehicles request:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
}
