import { vehicles, inquiries, users, financingApplications, dealerships, auditLogs, type User, type InsertUser, type Vehicle, type InsertVehicle, type Inquiry, type InsertInquiry, type FinancingApplication, type InsertFinancingApplication, type Dealership, type InsertDealership, type AuditLog, type InsertAuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, gte, lte, desc, asc, sql, SQL } from "drizzle-orm";
import { encryptField, decryptField } from "./encryption";

export interface VehicleFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  searchQuery?: string;
}

export interface VehicleSortOptions {
  sortBy?: 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc' | 'mileage-asc' | 'mileage-desc';
}

export interface IStorage {
  getDealerships(): Promise<Dealership[]>;
  getDealershipById(id: string): Promise<Dealership | undefined>;
  getDealershipBySlug(slug: string): Promise<Dealership | undefined>;
  getDealershipByDomain(domain: string): Promise<Dealership | undefined>;
  createDealership(dealership: InsertDealership): Promise<Dealership>;
  updateDealership(id: string, dealership: Partial<InsertDealership>): Promise<Dealership | undefined>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVehicles(dealershipId: string | null, filters?: VehicleFilters, sort?: VehicleSortOptions, limit?: number, offset?: number): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  getVehicleCount(dealershipId: string | null, filters?: VehicleFilters): Promise<number>;
  getFeaturedVehicles(dealershipId: string | null, limit?: number): Promise<Vehicle[]>;
  
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(dealershipId: string | null): Promise<Inquiry[]>;
  
  createFinancingApplication(application: InsertFinancingApplication): Promise<FinancingApplication>;
  getFinancingApplications(dealershipId: string | null): Promise<FinancingApplication[]>;
  
  // Audit logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(dealershipId: string | null, limit?: number): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getDealerships(): Promise<Dealership[]> {
    return await db.select().from(dealerships).where(eq(dealerships.isActive, true)).orderBy(asc(dealerships.name));
  }

  async getDealershipById(id: string): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id));
    return dealership || undefined;
  }

  async getDealershipBySlug(slug: string): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.slug, slug));
    return dealership || undefined;
  }

  async getDealershipByDomain(domain: string): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(
      and(eq(dealerships.domain, domain), eq(dealerships.isActive, true))
    );
    return dealership || undefined;
  }

  async createDealership(dealership: InsertDealership): Promise<Dealership> {
    const [newDealership] = await db.insert(dealerships).values(dealership).returning();
    return newDealership;
  }

  async updateDealership(id: string, dealership: Partial<InsertDealership>): Promise<Dealership | undefined> {
    const [updatedDealership] = await db.update(dealerships).set(dealership).where(eq(dealerships.id, id)).returning();
    return updatedDealership || undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getVehicles(dealershipId: string | null, filters?: VehicleFilters, sort?: VehicleSortOptions, limit = 50, offset = 0): Promise<Vehicle[]> {
    // Build conditions array using proper SQL type for Drizzle compatibility
    const conditions: SQL[] = [];
    
    if (dealershipId) {
      conditions.push(eq(vehicles.dealershipId, dealershipId));
    }
    
    if (filters?.make) {
      conditions.push(eq(vehicles.make, filters.make));
    }
    
    if (filters?.model) {
      conditions.push(eq(vehicles.model, filters.model));
    }
    
    if (filters?.yearMin) {
      conditions.push(gte(vehicles.year, filters.yearMin));
    }
    
    if (filters?.yearMax) {
      conditions.push(lte(vehicles.year, filters.yearMax));
    }
    
    if (filters?.priceMin) {
      conditions.push(gte(vehicles.price, filters.priceMin.toString()));
    }
    
    if (filters?.priceMax) {
      conditions.push(lte(vehicles.price, filters.priceMax.toString()));
    }
    
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      const searchCondition = or(
        like(vehicles.make, searchTerm),
        like(vehicles.model, searchTerm),
        like(vehicles.trim, searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Determine sort order
    const getOrderBy = () => {
      switch (sort?.sortBy) {
        case 'price-asc': return asc(vehicles.price);
        case 'price-desc': return desc(vehicles.price);
        case 'year-desc': return desc(vehicles.year);
        case 'year-asc': return asc(vehicles.year);
        case 'mileage-asc': return asc(vehicles.mileage);
        case 'mileage-desc': return desc(vehicles.mileage);
        default: return desc(vehicles.createdAt);
      }
    };

    // Build and execute query
    if (conditions.length > 0) {
      return await db.select().from(vehicles)
        .where(and(...conditions))
        .orderBy(getOrderBy())
        .limit(limit)
        .offset(offset);
    }
    
    return await db.select().from(vehicles)
      .orderBy(getOrderBy())
      .limit(limit)
      .offset(offset);
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db
      .insert(vehicles)
      .values(vehicle)
      .returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ ...vehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updatedVehicle || undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getVehicleCount(dealershipId: string | null, filters?: VehicleFilters): Promise<number> {
    // Build conditions array using proper SQL type for Drizzle compatibility
    const conditions: SQL[] = [];
    
    if (dealershipId) {
      conditions.push(eq(vehicles.dealershipId, dealershipId));
    }
    
    if (filters?.make) {
      conditions.push(eq(vehicles.make, filters.make));
    }
    
    if (filters?.model) {
      conditions.push(eq(vehicles.model, filters.model));
    }
    
    if (filters?.yearMin) {
      conditions.push(gte(vehicles.year, filters.yearMin));
    }
    
    if (filters?.yearMax) {
      conditions.push(lte(vehicles.year, filters.yearMax));
    }
    
    if (filters?.priceMin) {
      conditions.push(gte(vehicles.price, filters.priceMin.toString()));
    }
    
    if (filters?.priceMax) {
      conditions.push(lte(vehicles.price, filters.priceMax.toString()));
    }
    
    if (filters?.searchQuery) {
      const searchTerm = `%${filters.searchQuery}%`;
      const searchCondition = or(
        like(vehicles.make, searchTerm),
        like(vehicles.model, searchTerm),
        like(vehicles.trim, searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Execute count query
    if (conditions.length > 0) {
      const [result] = await db.select({ count: sql`count(*)` })
        .from(vehicles)
        .where(and(...conditions));
      return Number(result.count);
    }

    const [result] = await db.select({ count: sql`count(*)` }).from(vehicles);
    return Number(result.count);
  }

  async getFeaturedVehicles(dealershipId: string | null, limit = 6): Promise<Vehicle[]> {
    const conditions = [eq(vehicles.isFeatured, true)];
    if (dealershipId) {
      conditions.push(eq(vehicles.dealershipId, dealershipId));
    }
    return await db
      .select()
      .from(vehicles)
      .where(and(...conditions))
      .orderBy(desc(vehicles.createdAt))
      .limit(limit);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db
      .insert(inquiries)
      .values(inquiry)
      .returning();
    return newInquiry;
  }

  async getInquiries(dealershipId: string | null): Promise<Inquiry[]> {
    if (dealershipId) {
      return await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.dealershipId, dealershipId))
        .orderBy(desc(inquiries.createdAt));
    }
    return await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  }

  async createFinancingApplication(application: InsertFinancingApplication): Promise<FinancingApplication> {
    const encryptedApplication = { ...application };
    
    if (encryptedApplication.monthlyIncome) {
      const encrypted = encryptField(encryptedApplication.monthlyIncome);
      if (encrypted) {
        encryptedApplication.monthlyIncome = encrypted;
      }
    }
    
    if (encryptedApplication.creditScore) {
      const encrypted = encryptField(encryptedApplication.creditScore);
      if (encrypted) {
        encryptedApplication.creditScore = encrypted;
      }
    }
    
    const [newApplication] = await db
      .insert(financingApplications)
      .values(encryptedApplication)
      .returning();
    return this.decryptFinancingApplication(newApplication);
  }

  private decryptFinancingApplication(app: FinancingApplication): FinancingApplication {
    const decrypted = { ...app };
    
    if (decrypted.monthlyIncome) {
      const plaintext = decryptField(decrypted.monthlyIncome);
      if (plaintext) {
        decrypted.monthlyIncome = plaintext;
      }
    }
    
    if (decrypted.creditScore) {
      const plaintext = decryptField(decrypted.creditScore);
      if (plaintext) {
        decrypted.creditScore = plaintext;
      }
    }
    
    return decrypted;
  }

  async getFinancingApplications(dealershipId: string | null): Promise<FinancingApplication[]> {
    let applications: FinancingApplication[];
    
    if (dealershipId) {
      applications = await db
        .select()
        .from(financingApplications)
        .where(eq(financingApplications.dealershipId, dealershipId))
        .orderBy(desc(financingApplications.createdAt));
    } else {
      applications = await db
        .select()
        .from(financingApplications)
        .orderBy(desc(financingApplications.createdAt));
    }
    
    return applications.map(app => this.decryptFinancingApplication(app));
  }

  // Audit logging methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAuditLogs(dealershipId: string | null, limit = 100): Promise<AuditLog[]> {
    if (dealershipId) {
      return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.dealershipId, dealershipId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
    }
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
