# Synergies4 Setup Guide

## 🚀 Quick Start

Your authentication system and database are now set up! Here's what you need to do to get everything running:

## 📋 Required Accounts & Keys

### 1. Database (PostgreSQL)
You'll need a PostgreSQL database. Choose one of these options:

**Option A: Local PostgreSQL**
- Install PostgreSQL locally
- Create a database named `synergies4`
- Use connection string: `postgresql://username:password@localhost:5432/synergies4`

**Option B: Cloud Database (Recommended)**
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app
- **PlanetScale** (Free tier): https://planetscale.com
- **Neon** (Free tier): https://neon.tech

### 2. Authentication (NextAuth.js)
**Required:**
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` (for development)

**Optional (for social login):**
- **Google OAuth**: https://console.developers.google.com
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

### 3. Payments (Stripe)
- **Stripe Account**: https://stripe.com
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### 4. File Upload (Optional)
- **Cloudinary**: https://cloudinary.com
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 🔧 Setup Steps

### Step 1: Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`

### Step 2: Database Setup
1. Set up your PostgreSQL database (see options above)
2. Update `DATABASE_URL` in your `.env` file
3. Run database migrations:
   ```bash
   npx prisma db push
   ```

### Step 3: Create Admin User
Run this script to create your first admin user:
```bash
npm run setup:admin
```

### Step 4: Start Development Server
```bash
npm run dev
```

## 🎯 What's Already Built

### ✅ Authentication System
- Email/password login and signup
- Google OAuth (when configured)
- Protected routes
- Role-based access (USER, ADMIN, INSTRUCTOR)

### ✅ Database Schema
- Users and profiles
- Courses with modules and lessons
- Enrollments and progress tracking
- Blog posts and comments
- Payment records
- Admin management

### ✅ API Routes
- `/api/auth/*` - Authentication
- `/api/courses` - Course management
- `/api/user/enrollments` - User enrollments
- `/api/admin/courses` - Admin course management

### ✅ Pages
- `/login` - Beautiful login page
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard
- All your existing marketing pages

## 🔄 Next Steps

### Immediate (Ready to use):
1. Set up database and environment variables
2. Create admin user
3. Start adding courses through admin panel
4. Test user registration and login

### Phase 2 (Next development):
1. Payment integration with Stripe
2. Course content upload system
3. Blog management system
4. Email notifications
5. Advanced course features

## 🆘 Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your database is running
- Check firewall settings for cloud databases

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- For Google OAuth, verify redirect URLs

### Build Issues
- Run `npm install` to ensure all dependencies
- Run `npx prisma generate` to regenerate client
- Clear `.next` folder and restart

## 📞 Support
If you encounter any issues, check:
1. Console logs in browser developer tools
2. Terminal output for server errors
3. Database connection status

The system is now ready for production deployment to Vercel once you have your environment variables configured! 