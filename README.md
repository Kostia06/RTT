# Respect the Technique - Ramen E-Commerce Platform

A modern, full-stack ramen business management system built with Next.js 14, TypeScript, and MongoDB.

## 🎯 Current Status: Phase 1B/1C Complete

### ✅ What's Built

**Foundation (Phase 1A)**
- ✅ Next.js 14 with App Router & TypeScript
- ✅ Tailwind CSS styling system
- ✅ MongoDB database connection
- ✅ NextAuth.js authentication
- ✅ 5 Mongoose models (User, Product, Order, Class, ClassRegistration)
- ✅ Complete TypeScript type definitions
- ✅ Protected route middleware

**Authentication System**
- ✅ User registration with email/password
- ✅ Login/logout functionality
- ✅ Role-based access control (customer/employee/admin)
- ✅ JWT session management
- ✅ Protected customer routes

**E-Commerce Core**
- ✅ Product catalog with 11 sample products
- ✅ Product listing page with filtering
- ✅ Product detail pages
- ✅ Category filtering (Ramen Bowls, Retail Products, Merchandise)
- ✅ Featured products system
- ✅ Product variants & pricing
- ✅ SEO-optimized product pages

**UI Components**
- ✅ Reusable component library (Button, Input, Card, Modal, Spinner)
- ✅ Responsive navigation (desktop & mobile)
- ✅ Header with auth state
- ✅ Footer with sitemap
- ✅ Product cards & grids
- ✅ Black & white minimalist design

**API Routes**
- ✅ GET /api/products (with filtering)
- ✅ GET /api/products/[id] (by ID or slug)
- ✅ POST /api/auth/register
- ✅ NextAuth endpoints

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18+ installed
- **MongoDB** database (local or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Update `.env.local` with your MongoDB connection string:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/rtt
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rtt

# Already configured (change for production)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-please-change-in-production-min-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed the Database

Populate the database with sample products:

```bash
npm run seed
```

This creates:
- 5 Ramen Bowls (Tonkotsu, Spicy Miso, Shoyu, Vegetarian, Wagyu)
- 3 Retail Products (Noodles, Tare Sauce, Spice Mix)
- 3 Merchandise items (T-Shirt, Bowl Set, Chopsticks)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
rtt/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Public routes
│   │   │   ├── shop/            # Product listing & detail
│   │   │   ├── classes/         # Classes (coming soon)
│   │   │   ├── cart/            # Cart (Phase 1D)
│   │   │   └── checkout/        # Checkout (Phase 1E)
│   │   ├── (auth)/              # Auth pages
│   │   │   ├── login/           ✅ Login page
│   │   │   └── register/        ✅ Register page
│   │   ├── (customer)/          # Protected routes
│   │   │   ├── account/         # Customer dashboard
│   │   │   ├── orders/          # Order history
│   │   │   └── profile/         # Profile management
│   │   ├── (admin)/             # Admin (Phase 2)
│   │   └── api/                 # API routes
│   │       ├── auth/            ✅ Auth endpoints
│   │       └── products/        ✅ Product endpoints
│   ├── components/
│   │   ├── ui/                  ✅ Reusable UI components
│   │   ├── layout/              ✅ Header, Footer
│   │   ├── products/            ✅ Product components
│   │   ├── auth/                ✅ Login, Register forms
│   │   └── providers/           ✅ SessionProvider
│   ├── lib/
│   │   ├── db/                  ✅ MongoDB connection
│   │   ├── auth/                ✅ NextAuth config
│   │   └── hooks/               ✅ Custom hooks
│   ├── models/                  ✅ Mongoose schemas
│   └── types/                   ✅ TypeScript definitions
├── scripts/
│   └── seed-products.ts         ✅ Database seeding
└── public/images/placeholders/  # Placeholder images
```

## 🎨 Design System

**Colors**
- Primary: Black (`#000000`)
- Secondary: White (`#FFFFFF`)
- Grays: 50-950 scale

**Typography**
- Font: System fonts with fallback
- Scale: sm (14px), base (16px), lg (18px), xl (20px), 2xl+

**Components**
- Buttons: Primary, Secondary, Outline, Ghost
- Inputs: With labels, errors, helper text
- Cards: Hoverable with padding options
- Modal: Responsive with size variants

## 🔐 Authentication

**User Roles**
- `customer` - Default role for registered users
- `employee` - For staff (Phase 2)
- `admin` - Full access (Phase 2)

**Protected Routes**
- `/account/*` - Requires authentication
- `/orders/*` - Requires authentication
- `/admin/*` - Requires admin/employee role (Phase 2)

**Registration**
- POST `/api/auth/register`
- Auto-login after successful registration

**Login**
- NextAuth credentials provider
- Email/password authentication
- JWT sessions (30-day expiry)

## 📦 Database Models

### User
- Email, name, password (hashed with bcrypt)
- Role-based access
- Addresses (shipping/billing)
- Employee data (optional, Phase 2)

### Product
- Name, slug, description
- Category (ramen-bowl, retail-product, merchandise)
- Price, compareAtPrice (for discounts)
- Images with primary flag
- Variants (size, spice level, etc.)
- Nutritional info
- Inventory data (optional, Phase 3)

### Order
- Order number (auto-generated)
- Customer info (user or guest)
- Items with snapshots
- Payment status (Square integration in Phase 1E)
- Fulfillment (pickup/delivery)

### Class
- Title, description, schedule
- Instructor info
- Max students, pricing
- Featured flag

### ClassRegistration
- Student info
- Payment details
- Attendance status
- QR check-in (Phase 2)

## 🛣️ Roadmap

### ✅ Phase 1A-1C: Foundation & Products (COMPLETE)
- Project setup
- Authentication
- Product catalog
- Shop pages

### 🔄 Phase 1D: Shopping Cart (NEXT)
- Cart state management
- Add/remove items
- Persistent cart (localStorage)
- Cart drawer UI

### 📅 Phase 1E: Checkout & Payments
- Checkout flow
- Square SDK integration
- Order processing
- Email notifications

### 📅 Phase 1F: Classes
- Class listing
- Class detail pages
- Registration system
- Payment integration

### 📅 Phase 1G: UI/UX Polish
- GSAP animations
- Responsive optimization
- Loading states
- Error handling

### 📅 Phase 2: Employee Management
- QR code generation
- Clock in/out system
- Scheduling
- Order management dashboard

### 📅 Phase 3: Inventory Tracking
- Stock management
- QR-based inventory
- Low stock alerts
- Supplier management

## 🧪 Testing User Flows

### Register a New User
1. Go to http://localhost:3000/register
2. Fill in name, email, password
3. Submit → Auto-login → Redirect to /account

### Browse Products
1. Go to http://localhost:3000/shop
2. Filter by category
3. Click product card → View details

### View Product Details
1. Select variant (if available)
2. Adjust quantity
3. Click "Add to Cart" (placeholder for Phase 1D)

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with products
```

## 🐛 Known Issues & Notes

1. **MongoDB Required**: The app requires a MongoDB connection to start. Update `.env.local` with a valid URI.

2. **Cart Functionality**: "Add to Cart" button shows alert - full cart implementation coming in Phase 1D.

3. **Placeholder Images**: Products use placeholder images. Replace with real images later.

4. **Email Notifications**: Currently console-logging only. Real email service in Phase 1E.

5. **Square Payments**: Sandbox credentials needed. Add in Phase 1E.

## 📝 Environment Setup Checklist

- [ ] Install Node.js 18+
- [ ] Install MongoDB locally OR create MongoDB Atlas cluster
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Update `.env.local` with MongoDB URI
- [ ] Update `.env.local` with NEXTAUTH_SECRET (generate random 32+ char string)
- [ ] Run `npm run seed` to populate products
- [ ] Run `npm run dev`
- [ ] Test registration at /register
- [ ] Test login at /login
- [ ] Browse shop at /shop

## 🚀 Production Deployment (Future)

1. **Database**: MongoDB Atlas (Production cluster)
2. **Hosting**: Vercel (recommended) or custom VPS
3. **Environment**: Update all `.env` variables for production
4. **Square**: Switch to production API keys
5. **Email**: Configure SendGrid/Mailgun
6. **Images**: Upload to CDN (Cloudinary/Vercel)

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js 4
- **Forms**: React Hook Form + Zod
- **UI**: Headless UI, Heroicons
- **Payments**: Square SDK (Phase 1E)
- **Animation**: GSAP (Phase 1G)
- **Email**: Nodemailer (Phase 1E)

## 📄 License

Private project for Respect the Technique.

## 👤 Support

For setup help or questions, refer to the implementation plan at `.claude/plans/wild-floating-stonebraker.md`

---

**Built with** ⚡ by Claude Code
