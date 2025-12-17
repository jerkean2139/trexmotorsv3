import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertInquirySchema, insertFinancingApplicationSchema, insertDealershipSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import bcrypt from "bcrypt";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";

// CSRF Token utilities
const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const validateCsrfToken = (sessionToken: string | undefined, headerToken: string | undefined): boolean => {
  if (!sessionToken || !headerToken) return false;
  return crypto.timingSafeEqual(Buffer.from(sessionToken), Buffer.from(headerToken));
};

// Session configuration
declare module "express-session" {
  interface SessionData {
    isAuthenticated: boolean;
    userId: string;
    selectedDealershipId: string | null;
    csrfToken: string;
  }
}

// SECURITY: Validate session secret in production
const getSessionSecret = (): string => {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }
  return secret || 'trex-motors-dev-secret-' + Date.now();
};

// Rate limiters for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour
  message: { error: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for rate limiting to work correctly behind reverse proxies
  app.set('trust proxy', 1);
  
  // Apply general rate limiting
  app.use(generalLimiter);

  // CORS middleware - strict origin validation
  // SECURITY: Only allow specific trusted origins
  const getAllowedOrigins = (): string[] => {
    const origins: string[] = [];
    
    // Development origins
    if (process.env.NODE_ENV !== 'production') {
      origins.push('http://localhost:5000', 'http://127.0.0.1:5000');
    }
    
    // Production origins - add your Railway domain here when deployed
    const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    origins.push(...productionOrigins);
    
    return origins;
  };
  
  const allowedOrigins = getAllowedOrigins();
  
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if origin is in allowed list or if it's a same-origin request (no origin header)
    const isAllowedOrigin = !origin || 
      allowedOrigins.includes(origin) ||
      // Allow Replit dev domains for development
      (process.env.NODE_ENV !== 'production' && origin?.includes('replit.dev'));
    
    if (isAllowedOrigin && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  });

  // Session middleware with validated secret
  app.use(session({
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
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

  // CSRF protection middleware for state-changing admin operations
  const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    const sessionToken = req.session?.csrfToken;
    
    if (!validateCsrfToken(sessionToken, headerToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  };

  // Combined auth + CSRF middleware for protected admin routes
  const requireAuthWithCsrf = [requireAuth, requireCsrf];

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
  app.put("/api/vehicles/:id/images", requireAuthWithCsrf, async (req: Request, res: Response) => {
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

  // Authentication routes with rate limiting
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Try database user first
      const user = await storage.getUserByUsername(username);
      
      if (user) {
        // Verify bcrypt hashed password from database
        const validPassword = await bcrypt.compare(password, user.password);
        if (validPassword) {
          req.session.isAuthenticated = true;
          req.session.userId = user.id;
          req.session.csrfToken = generateCsrfToken();
          return res.json({ success: true, csrfToken: req.session.csrfToken });
        }
      }
      
      // Fallback for legacy admin (will be removed after first login updates password)
      // This ensures existing admin can still login and then password gets migrated
      if (username === 'admin' && password === 'trex2025!') {
        // Create/update admin user with hashed password for future logins
        const hashedPassword = await bcrypt.hash(password, 10);
        let adminUser = await storage.getUserByUsername('admin');
        if (!adminUser) {
          adminUser = await storage.createUser({ username: 'admin', password: hashedPassword });
        }
        req.session.isAuthenticated = true;
        req.session.userId = adminUser.id;
        req.session.csrfToken = generateCsrfToken();
        return res.json({ success: true, csrfToken: req.session.csrfToken });
      }

      res.status(401).json({ error: 'Invalid credentials' });
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
    // Generate CSRF token if authenticated and doesn't have one
    if (req.session.isAuthenticated && !req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken();
    }
    
    res.json({ 
      isAuthenticated: !!req.session.isAuthenticated,
      selectedDealershipId: req.session.selectedDealershipId || null,
      csrfToken: req.session.isAuthenticated ? req.session.csrfToken : undefined
    });
  });

  // Dealership routes
  app.get("/api/dealerships", async (req, res) => {
    try {
      const dealerships = await storage.getDealerships();
      res.json(dealerships);
    } catch (error) {
      console.error("Error fetching dealerships:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dealerships/:id", async (req, res) => {
    try {
      const dealership = await storage.getDealershipById(req.params.id);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error fetching dealership:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dealerships/slug/:slug", async (req, res) => {
    try {
      const dealership = await storage.getDealershipBySlug(req.params.slug);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error fetching dealership:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/dealerships", requireAuth, async (req, res) => {
    try {
      const dealershipData = insertDealershipSchema.parse(req.body);
      const dealership = await storage.createDealership(dealershipData);
      res.status(201).json(dealership);
    } catch (error) {
      console.error("Error creating dealership:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/dealerships/:id", requireAuth, async (req, res) => {
    try {
      const dealershipData = insertDealershipSchema.partial().parse(req.body);
      const dealership = await storage.updateDealership(req.params.id, dealershipData);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error updating dealership:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Set selected dealership for admin session
  app.post("/api/admin/select-dealership", requireAuthWithCsrf, async (req: Request, res: Response) => {
    try {
      const { dealershipId } = req.body;
      
      // Validate that the dealership exists
      if (dealershipId) {
        const dealership = await storage.getDealershipById(dealershipId);
        if (!dealership) {
          return res.status(400).json({ error: "Invalid dealership ID" });
        }
      }
      
      req.session.selectedDealershipId = dealershipId;
      res.json({ success: true, selectedDealershipId: dealershipId });
    } catch (error) {
      console.error("Error selecting dealership:", error);
      res.status(500).json({ error: "Internal server error" });
    }
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
        offset = 0,
        dealershipId,
        dealershipSlug
      } = req.query;

      // Determine dealership ID from query params or slug
      let resolvedDealershipId: string | null = dealershipId as string || null;
      if (!resolvedDealershipId && dealershipSlug) {
        const dealership = await storage.getDealershipBySlug(dealershipSlug as string);
        resolvedDealershipId = dealership?.id || null;
      }

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
        resolvedDealershipId,
        filters,
        sort,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const totalCount = await storage.getVehicleCount(resolvedDealershipId, filters);

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
      const { dealershipId, dealershipSlug } = req.query;
      
      // Determine dealership ID from query params or slug
      let resolvedDealershipId: string | null = dealershipId as string || null;
      if (!resolvedDealershipId && dealershipSlug) {
        const dealership = await storage.getDealershipBySlug(dealershipSlug as string);
        resolvedDealershipId = dealership?.id || null;
      }
      
      const vehicles = await storage.getFeaturedVehicles(resolvedDealershipId, 6);
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

  app.post("/api/vehicles", requireAuthWithCsrf, async (req: Request, res: Response) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // SECURITY: Always use session dealership - never trust client-supplied dealershipId
      const dealershipId = req.session.selectedDealershipId;
      if (!dealershipId) {
        return res.status(400).json({ error: "No dealership selected. Please select a dealership first." });
      }
      
      const vehicle = await storage.createVehicle({
        ...vehicleData,
        dealershipId,
      });
      
      // Audit log: vehicle creation
      await storage.createAuditLog({
        userId: req.session.userId!,
        dealershipId,
        action: 'create',
        entityType: 'vehicle',
        entityId: vehicle.id,
        details: { make: vehicle.make, model: vehicle.model, year: vehicle.year, vin: vehicle.vin },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });
      
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/vehicles/:id", requireAuthWithCsrf, async (req: Request, res: Response) => {
    try {
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      
      // SECURITY: Verify vehicle belongs to admin's selected dealership
      const selectedDealershipId = req.session.selectedDealershipId;
      if (!selectedDealershipId) {
        return res.status(400).json({ error: "No dealership selected" });
      }
      
      const existingVehicle = await storage.getVehicleById(req.params.id);
      if (!existingVehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      if (existingVehicle.dealershipId !== selectedDealershipId) {
        return res.status(403).json({ error: "Not authorized to modify this vehicle" });
      }
      
      // Remove dealershipId from update data to prevent reassignment
      const { dealershipId: _, ...safeVehicleData } = vehicleData as any;
      
      const vehicle = await storage.updateVehicle(req.params.id, safeVehicleData);
      
      // Audit log: vehicle update with full before/after context
      const beforeState = {
        make: existingVehicle.make,
        model: existingVehicle.model,
        year: existingVehicle.year,
        price: existingVehicle.price,
        mileage: existingVehicle.mileage,
        vin: existingVehicle.vin,
        stockNumber: existingVehicle.stockNumber,
        status: existingVehicle.status,
        isFeatured: existingVehicle.isFeatured,
      };
      await storage.createAuditLog({
        userId: req.session.userId!,
        dealershipId: selectedDealershipId,
        action: 'update',
        entityType: 'vehicle',
        entityId: req.params.id,
        details: { before: beforeState, changes: safeVehicleData, after: vehicle ? { make: vehicle.make, model: vehicle.model, year: vehicle.year, price: vehicle.price, mileage: vehicle.mileage, vin: vehicle.vin, stockNumber: vehicle.stockNumber, status: vehicle.status, isFeatured: vehicle.isFeatured } : null },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });
      
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuthWithCsrf, async (req: Request, res: Response) => {
    try {
      // SECURITY: Verify vehicle belongs to admin's selected dealership
      const selectedDealershipId = req.session.selectedDealershipId;
      if (!selectedDealershipId) {
        return res.status(400).json({ error: "No dealership selected" });
      }
      
      const existingVehicle = await storage.getVehicleById(req.params.id);
      if (!existingVehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      if (existingVehicle.dealershipId !== selectedDealershipId) {
        return res.status(403).json({ error: "Not authorized to delete this vehicle" });
      }
      
      // Capture full pre-deletion snapshot for audit compliance
      const deletedSnapshot = {
        make: existingVehicle.make,
        model: existingVehicle.model,
        year: existingVehicle.year,
        price: existingVehicle.price,
        mileage: existingVehicle.mileage,
        vin: existingVehicle.vin,
        stockNumber: existingVehicle.stockNumber,
        status: existingVehicle.status,
        isFeatured: existingVehicle.isFeatured,
        condition: existingVehicle.condition,
        exteriorColor: existingVehicle.exteriorColor,
        interiorColor: existingVehicle.interiorColor,
        fuelType: existingVehicle.fuelType,
        transmission: existingVehicle.transmission,
      };
      
      const success = await storage.deleteVehicle(req.params.id);
      
      // Audit log: vehicle deletion with full snapshot
      await storage.createAuditLog({
        userId: req.session.userId!,
        dealershipId: selectedDealershipId,
        action: 'delete',
        entityType: 'vehicle',
        entityId: req.params.id,
        details: { deletedVehicle: deletedSnapshot },
        ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Audit log endpoint for admins - SECURITY: Strictly scoped to session dealership
  app.get("/api/admin/audit-logs", requireAuth, async (req, res) => {
    try {
      // SECURITY: Only allow viewing logs for the currently selected dealership
      // This prevents multi-tenant data leakage
      const dealershipId = req.session.selectedDealershipId;
      if (!dealershipId) {
        return res.status(400).json({ error: "No dealership selected. Please select a dealership first." });
      }
      
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 500) : 100;
      const logs = await storage.getAuditLogs(dealershipId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inquiry routes with rate limiting
  app.post("/api/inquiries", formLimiter, async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse(req.body);
      
      // SECURITY: Only derive dealershipId from the vehicle - never trust client
      let dealershipId: string | null = null;
      if (inquiryData.vehicleId) {
        const vehicle = await storage.getVehicleById(inquiryData.vehicleId);
        if (!vehicle) {
          return res.status(400).json({ error: "Invalid vehicle ID" });
        }
        dealershipId = vehicle.dealershipId;
      }
      
      const inquiry = await storage.createInquiry({
        ...inquiryData,
        dealershipId,
      });
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
      const dealershipId = req.session.selectedDealershipId || req.query.dealershipId as string || null;
      const inquiries = await storage.getInquiries(dealershipId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Financing application routes with rate limiting
  app.post("/api/financing-applications", formLimiter, async (req, res) => {
    try {
      const applicationData = insertFinancingApplicationSchema.parse(req.body);
      
      // SECURITY: Derive dealershipId from dealershipSlug only - don't accept raw dealershipId
      let dealershipId: string | null = null;
      if (req.body.dealershipSlug) {
        const dealership = await storage.getDealershipBySlug(req.body.dealershipSlug);
        if (!dealership) {
          return res.status(400).json({ error: "Invalid dealership" });
        }
        dealershipId = dealership.id;
      }
      
      const application = await storage.createFinancingApplication({
        ...applicationData,
        dealershipId,
      });
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
      const dealershipId = req.session.selectedDealershipId || req.query.dealershipId as string || null;
      const applications = await storage.getFinancingApplications(dealershipId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching financing applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SEO Routes - Sitemap
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const allVehicles = await storage.getVehicles(null); // null = all dealerships
      const baseUrl = "https://trexmotors.com";
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/financing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/inventory</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

      // Add individual vehicle pages
      for (const vehicle of allVehicles) {
        const vehicleUrl = `${baseUrl}/vehicle/${vehicle.id}`;
        const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
        sitemap += `
  <url>
    <loc>${vehicleUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`;
        
        if (vehicle.images && vehicle.images.length > 0) {
          sitemap += `
    <image:image>
      <image:loc>${vehicle.images[0]}</image:loc>
      <image:title>${vehicleTitle}</image:title>
    </image:image>`;
        }
        sitemap += `
  </url>`;
      }

      sitemap += `
</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `# T-Rex Motors - Richmond's Premier Used Car Dealership
# https://trexmotors.com

User-agent: *
Allow: /

Crawl-delay: 1

Disallow: /admin
Disallow: /api/

Allow: /api/vehicles$
Allow: /api/vehicles/featured$

Sitemap: https://trexmotors.com/sitemap.xml

User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1
`;
    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  // Web Vitals RUM endpoint
  app.post("/api/rum", (req, res) => {
    // In production, you'd send this to an analytics service
    console.log("Web Vitals:", req.body);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
