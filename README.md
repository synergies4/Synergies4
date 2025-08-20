# Synergies4 - AI-Powered Learning Platform

<!-- Test deployment after webhook removal -->

An AI-powered learning management system built with Next.js, featuring AI assistants for course creation and blog writing.

## Features

- 🤖 AI-powered course creation assistant
- 📝 AI blog writing assistant  
- 👥 User management with role-based access
- 📚 Comprehensive course management
- 🎓 Student enrollment and progress tracking
- 📊 Admin dashboard with analytics
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 Secure authentication with Supabase
- 📱 Mobile-first design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database + Auth)
- **AI**: Anthropic Claude, OpenAI GPT
- **Deployment**: Vercel
- **UI Components**: Radix UI primitives

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Other
NEXTAUTH_SECRET=your_nextauth_secret
```

## Project Structure

```
src/
├── app/                 # Next.js 13+ app directory
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── lib/               # Utility functions and configs
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## 🚀 Features

### ✅ **Authentication System**
- Email/password authentication with NextAuth.js
- Google OAuth integration (optional)
- Role-based access control (USER, ADMIN, INSTRUCTOR)
- Protected routes and session management
- Beautiful login/signup pages with animations

### ✅ **Database & API**
- Supabase PostgreSQL database with built-in authentication
- Complete schema for users, courses, enrollments, payments, and blogs
- RESTful API endpoints for all major operations
- Type-safe database operations with Supabase client

### ✅ **User Management**
- User registration and profile management
- User dashboard with course progress tracking
- Enrollment system with progress monitoring

### ✅ **Admin Dashboard**
- Complete admin interface for course management
- User management and analytics
- Course creation and content management
- Real-time statistics and reporting

### ✅ **Course System**
- Hierarchical course structure (Courses → Modules → Lessons)
- Course categories and difficulty levels
- Progress tracking and completion status
- Course enrollment and access control

### 🔄 **Coming Soon**
- Stripe payment integration
- Blog management system
- File upload for course materials
- Email notifications
- Advanced course features (quizzes, certificates)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase
- **Database**: Supabase PostgreSQL with built-in authentication
- **Authentication**: Supabase Auth with multiple providers
- **Payments**: Stripe (ready for integration)
- **Deployment**: Vercel-ready

## 📋 Quick Setup

### 1. **Clone and Install**
```bash
git clone <your-repo>
cd synergies4
npm install
```

### 2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

### 3. **Database Setup**
```bash
# Set up your Supabase database (see setup guide)
# 1. Create a Supabase project at https://supabase.com
# 2. Run the main database schema in your Supabase SQL Editor:
cat sql/database-setup-final.sql

# 3. Run additional schemas as needed:
cat sql/stripe-schema.sql
cat sql/user-content-schema.sql
cat sql/resume-customizer-schema.sql
```

### 4. **Create Admin User**
```bash
npm run setup:admin
```

### 5. **Start Development**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 🔑 Required Environment Variables

### **Essential (Required)**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

### **Optional (Enhanced Features)**
- `ANTHROPIC_API_KEY` & `OPENAI_API_KEY` - AI services
- `STRIPE_PUBLISHABLE_KEY` & `STRIPE_SECRET_KEY` - Payments
- `CLOUDINARY_*` - File uploads

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- Supabase Auth handles OAuth providers automatically

### **Courses**
- `GET /api/courses` - List published courses
- `POST /api/courses` - Create course (admin only)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (admin only)

### **User**
- `GET /api/user/enrollments` - User's enrolled courses

### **Admin**
- `GET /api/admin/courses` - All courses (admin only)

## 🎯 Pages

### **Public Pages**
- `/` - Homepage with course showcase
- `/courses` - Course directory
- `/about-us` - About page
- `/coaching` - Coaching services
- `/consulting` - Consulting services
- `/industry-insight` - Blog/insights

### **Authentication**
- `/login` - User login
- `/signup` - User registration

### **Protected Pages**
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard (admin only)

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### **Environment Variables for Production**
- Update Supabase environment variables for production
- Use production API keys
- Add production Stripe keys

## 📖 Documentation

- **Setup Guide**: `scripts/setup.md` - Detailed setup instructions
- **Database Schema**: `sql/` folder - Complete SQL schemas for Supabase
- **API Documentation**: Check individual route files in `src/app/api/`

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run setup:admin  # Create admin user
```

## 🎨 UI Components

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Modern UI**: Clean, professional design system
- **Accessibility**: WCAG compliant components

## 🔒 Security Features

- **Row Level Security (RLS)**: Built-in with Supabase
- **Session Management**: Secure JWT tokens with Supabase Auth
- **CSRF Protection**: Built-in with Supabase
- **Role-based Access**: Granular permission system
- **Input Validation**: Server-side validation for all endpoints

## 📈 What's Next?

1. **Set up your Supabase database** (see setup guide)
2. **Configure environment variables**
3. **Create your first admin user**
4. **Start adding courses through the admin panel**
5. **Customize the design to match your brand**

## 🆘 Support

If you encounter any issues:
1. Check the setup guide in `scripts/setup.md`
2. Verify your Supabase environment variables
3. Check database connection in Supabase dashboard
4. Review console logs for errors

---

**Ready to transform education with AI-powered learning? Let's build something amazing! 🚀**