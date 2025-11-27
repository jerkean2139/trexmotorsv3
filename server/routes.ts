import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertInquirySchema, insertFinancingApplicationSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";

// Session configuration
declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware - allow frontend to access backend
  app.use((req, res, next) => {
    // Allow all Vercel workspace deployments and development domains
    const origin = req.headers.origin;
    const isAllowedOrigin = origin && (
      origin.includes('workspace-') && origin.includes('jeremys-projects-0f68a4ab.vercel.app') ||
      origin.includes('replit.dev') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    );
    
    if (isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-vercel-protection-bypass');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'trex-motors-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow non-HTTPS in development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Object storage routes
  const objectStorageService = new ObjectStorageService();

  // Serve vehicle images (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for vehicle images
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Update vehicle with image URL after upload
  app.put("/api/vehicles/:id/images", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageURLs } = req.body;

      if (!imageURLs || !Array.isArray(imageURLs)) {
        return res.status(400).json({ error: "imageURLs array is required" });
      }

      // Normalize the image URLs
      const normalizedPaths = imageURLs.map(url => 
        objectStorageService.normalizeObjectEntityPath(url)
      );

      const vehicle = await storage.getVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const updatedVehicle = await storage.updateVehicle(id, {
        images: normalizedPaths
      });

      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle images:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (username === 'admin' && password === 'trex2025!') {
        req.session.isAuthenticated = true;
        req.session.userId = 'admin';
        res.json({ success: true });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ isAuthenticated: !!req.session.isAuthenticated });
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const {
        make,
        model,
        yearMin,
        yearMax,
        priceMin,
        priceMax,
        searchQuery,
        sortBy,
        limit = 20,
        offset = 0
      } = req.query;

      const filters = {
        make: make as string,
        model: model as string,
        yearMin: yearMin ? parseInt(yearMin as string) : undefined,
        yearMax: yearMax ? parseInt(yearMax as string) : undefined,
        priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
        priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
        searchQuery: searchQuery as string,
      };

      const sort = { sortBy: sortBy as any };
      
      const vehicles = await storage.getVehicles(
        filters,
        sort,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const totalCount = await storage.getVehicleCount(filters);

      res.json({
        vehicles,
        totalCount,
        hasMore: parseInt(offset as string) + vehicles.length < totalCount
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/vehicles/featured", async (req, res) => {
    try {
      const vehicles = await storage.getFeaturedVehicles(6);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching featured vehicles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inquiry routes
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/inquiries", requireAuth, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Financing application routes
  app.post("/api/financing-applications", async (req, res) => {
    try {
      const applicationData = insertFinancingApplicationSchema.parse(req.body);
      const application = await storage.createFinancingApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating financing application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/financing-applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getFinancingApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching financing applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
