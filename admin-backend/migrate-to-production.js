// Migration script to copy development data to production database
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws;

// Database URLs from environment variables
const DEV_DATABASE_URL = process.env.DEV_DATABASE_URL;
const PROD_DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;

async function migrateData() {
  // Validate environment variables
  if (!DEV_DATABASE_URL) {
    throw new Error('❌ DEV_DATABASE_URL environment variable is required. Please set it in your environment.');
  }
  if (!PROD_DATABASE_URL) {
    throw new Error('❌ PROD_DATABASE_URL or DATABASE_URL environment variable is required. Please set it in your environment.');
  }

  console.log('🔐 Using environment variables for database connections (credentials secured)');
  
  const devDb = new Pool({ connectionString: DEV_DATABASE_URL });
  const prodDb = new Pool({ connectionString: PROD_DATABASE_URL });

  try {
    console.log('🔄 Starting data migration...');

    // 1. Create schema in production database
    console.log('📋 Creating database schema...');
    await prodDb.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
    `);

    await prodDb.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        make VARCHAR,
        model VARCHAR,
        year INTEGER,
        trim VARCHAR,
        price DECIMAL(10,2),
        mileage INTEGER,
        exterior_color VARCHAR,
        interior_color VARCHAR,
        fuel_type VARCHAR,
        transmission VARCHAR,
        drivetrain VARCHAR,
        engine VARCHAR,
        seating_capacity INTEGER,
        description TEXT,
        features TEXT[],
        images TEXT[],
        status VARCHAR,
        stock_number VARCHAR,
        vin VARCHAR,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        status_banner VARCHAR
      );
    `);
    console.log('✅ Database schema created');

    // 2. Get all vehicles from development
    const { rows: vehicles } = await devDb.query('SELECT * FROM vehicles ORDER BY created_at');
    console.log(`📋 Found ${vehicles.length} vehicles in development`);

    // 3. Clear production vehicles (optional - remove if you want to keep existing data)
    await prodDb.query('DELETE FROM vehicles WHERE true');
    console.log('🗑️ Cleared existing production vehicles');

    // 4. Insert each vehicle into production
    for (const vehicle of vehicles) {
      const insertQuery = `
        INSERT INTO vehicles (
          id, make, model, year, trim, price, mileage, exterior_color, interior_color,
          fuel_type, transmission, drivetrain, engine, seating_capacity, description,
          features, images, status, stock_number, vin, is_featured, created_at, updated_at, status_banner
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )
      `;
      
      await prodDb.query(insertQuery, [
        vehicle.id, vehicle.make, vehicle.model, vehicle.year, vehicle.trim,
        vehicle.price, vehicle.mileage, vehicle.exterior_color, vehicle.interior_color,
        vehicle.fuel_type, vehicle.transmission, vehicle.drivetrain, vehicle.engine,
        vehicle.seating_capacity, vehicle.description, vehicle.features, vehicle.images,
        vehicle.status, vehicle.stock_number, vehicle.vin, vehicle.is_featured,
        vehicle.created_at, vehicle.updated_at, vehicle.status_banner
      ]);
    }

    console.log(`✅ Successfully migrated ${vehicles.length} vehicles to production!`);

    // 5. Verify the migration
    const { rows: prodVehicles } = await prodDb.query('SELECT COUNT(*) as count FROM vehicles');
    console.log(`🔍 Production now has ${prodVehicles[0].count} vehicles`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await devDb.end();
    await prodDb.end();
  }
}

migrateData();