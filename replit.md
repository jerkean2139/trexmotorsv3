# Overview

This is a comprehensive used car dealership website for T-Rex Motors in Richmond. The application provides a customer-facing vehicle inventory browsing system with advanced search and filter capabilities, vehicle detail modals with inquiry forms, and a complete admin dashboard for vehicle management. The system is built as a full-stack web application using modern React and Node.js technologies with a PostgreSQL database.

## Current Status (November 2025)
✓ **Full Application Completed** - Professional dealership website with complete functionality
✓ **Vehicle Inventory System** - 21+ vehicles with comprehensive data
✓ **Search & Filter System** - Advanced filtering by make, year range, price range with real-time results
✓ **Admin Dashboard** - Complete vehicle management with authentication (admin/trex2025!)
✓ **Dual Image Management System** - Both local file upload and Google Drive URL integration
✓ **Database Integration** - Full PostgreSQL setup with proper schema and sample data
✓ **Railway Deployment Ready** - Configured for unified frontend/backend deployment on Railway

## Deployment Platform: Railway
- **Configuration**: `railway.toml` in project root
- **Build**: `npm run build` (Vite builds frontend, esbuild bundles backend)
- **Start**: `npm run start` (serves from dist/)
- **Database**: PostgreSQL on Railway (same as dev for matching schemas)
- **Documentation**: See `RAILWAY_DEPLOYMENT.md` for full deployment guide

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, professional automotive branding
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript throughout the entire stack for consistency
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Session-based authentication for admin users
- **File Uploads**: Uppy.js integration with object storage for vehicle images

## Database Design
- **Primary Entities**: Users, Vehicles, and Inquiries
- **Vehicle Schema**: Comprehensive fields including make, model, year, price, mileage, colors, engine specs, features array, and image storage
- **Relationships**: Inquiries reference specific vehicles for customer interest tracking
- **Features**: Support for featured vehicles, status tracking, and rich metadata

## Project Structure
- `/client` - React frontend application with components, pages, and utilities
- `/server` - Express backend with API routes, database logic, and authentication
- `/shared` - Common TypeScript schemas and types used by both frontend and backend
- `railway.toml` - Railway deployment configuration
- Single Vite configuration at project root for unified build process

## Development vs Production Strategy
- Development uses Vite dev server with hot module replacement (port 5000)
- Production serves static files from Express (Railway handles PORT)
- Environment-based configuration for database connections and authentication
- Unified deployment on Railway (frontend and backend on same domain)

# External Dependencies

## Database
- **PostgreSQL**: Serverless PostgreSQL database (Neon in development, Railway in production)
- **Drizzle Kit**: Database migration and schema management tools

## UI Components
- **Radix UI**: Headless component primitives for accessibility and keyboard navigation
- **shadcn/ui**: Pre-styled component library built on Radix UI with Tailwind CSS

## File Storage
- **Google Cloud Storage**: Object storage for vehicle images with ACL policy management
- **Uppy.js**: File upload interface with AWS S3 integration for direct uploads

## Authentication & Security
- **bcrypt**: Password hashing for admin authentication
- **express-session**: Session management for maintaining admin login state

## Development Tools
- **Replit Integration**: Development environment optimization with cartographer and error modal plugins
- **TypeScript**: Full-stack type safety with shared schema definitions

# Environment Variables

## Required for Production (Railway)
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Railway PostgreSQL)
- `SESSION_SECRET` - Secure random string for session encryption
- `NODE_ENV` - Set to `production`
- `VITE_ENABLE_ADMIN` - Set to `true` to enable admin dashboard

## Admin Credentials
- Username: `admin`
- Password: `trex2025!` (or custom password set in database)

# SEO/AEO/GEO Implementation (December 2025)

## Technical SEO Features
- **Dynamic Sitemap**: Auto-generated at `/sitemap.xml` with all pages and vehicles
- **Robots.txt**: Served at `/robots.txt` with proper crawl directives
- **Canonical URLs**: Set on all pages via SEOHead component
- **Meta Tags**: Unique title, description for each page
- **Open Graph**: Full OG tags for social sharing (og:title, og:description, og:image, og:url)
- **Twitter Cards**: summary_large_image format for Twitter sharing

## Structured Data (JSON-LD)
- **AutoDealer Schema**: Full local business data with NAP, hours, geo coordinates
- **WebSite Schema**: With SearchAction for Google sitelinks search box
- **BreadcrumbList**: Navigation breadcrumbs on all pages
- **Vehicle Schema**: Product structured data for individual vehicles

## Local SEO (GEO)
- **Geo Tags**: geo.region, geo.placename, geo.position, ICBM coordinates
- **LocalBusiness Schema**: Address, phone, hours, service area (50mi radius)
- **NAP Consistency**: Name, Address, Phone consistent across site and schema

## Performance Optimizations
- **Preconnect**: fonts.googleapis.com, fonts.gstatic.com, storage.googleapis.com
- **DNS Prefetch**: images.unsplash.com for hero images
- **Font Loading**: display=swap for non-blocking font loading
- **Web Vitals Monitoring**: RUM endpoint at `/api/rum` for Core Web Vitals tracking

## Brand Colors
- **Primary Green**: #72E118 (HSL: 93, 81%, 49%)
- **Dark Green**: #5CBF12 (for hover states)
- **Light Green**: #8EF442 (for accents)

## SEO Components
- `SEOHead`: Dynamic meta tag management per page
- `LocalBusinessSchema`: JSON-LD for local business
- `BreadcrumbSchema`: JSON-LD for breadcrumb navigation
- `VehicleSchema`: JSON-LD for vehicle product pages
- `WebVitalsMonitor`: Real User Monitoring for Core Web Vitals
