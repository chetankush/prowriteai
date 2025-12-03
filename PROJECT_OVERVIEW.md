# AI Writing Platform for Software Industry & Cold Email
## Complete MVP Implementation Documentation

**Project Name:** ProWrite AI  
**Version:** 1.0.0 (MVP)  
**Last Updated:** November 2025  
**Status:** Ready for Implementation

---

## Executive Summary

ProWrite AI is a sophisticated AI-powered content generation platform specifically designed for:
- **Software Industry Professionals** (HR, TA, QA teams, technical writers)
- **B2B Sales Teams** (cold email specialists, SDRs, sales managers)
- **SMBs & Agencies** (website copy, product descriptions)

Unlike generic ChatGPT/Claude, ProWrite AI provides:
1. **Industry-specific templates** (not generic prompts)
2. **Brand voice training** (consistency across outputs)
3. **Workflow automation** (batch generation, scheduling)
4. **Production-ready architecture** (scalable, secure, compliant)

---

## Table of Contents

1. [Tech Stack & Architecture](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Feature Breakdown](#features)
6. [Implementation Timeline](#timeline)
7. [Free Services & Cost Optimization](#free-services)
8. [Differentiation vs ChatGPT/Claude/Gemini](#differentiation)
9. [Deployment Instructions](#deployment)

---

## Tech Stack & Architecture

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** Shadcn/UI + Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Authentication:** Supabase Auth
- **Forms:** React Hook Form + Zod validation
- **Hosting:** Vercel (free tier)

### Backend
- **Framework:** NestJS 10 (TypeScript)
- **Database:** Supabase PostgreSQL (free tier: 500MB)
- **ORM:** TypeORM
- **Authentication:** JWT + Supabase Auth
- **AI APIs:** Google Gemini (free tier: 5-15 RPM)
- **Email Service:** Resend (free tier: 100 emails/day)
- **File Storage:** Supabase Storage (free tier: 1GB)
- **Hosting:** Railway/Render (free tier)

### Infrastructure
- **Version Control:** GitHub
- **CI/CD:** GitHub Actions (free)
- **Environment:** .env configuration
- **Monitoring:** Basic logging (free)
- **Analytics:** PostHog (free tier)

---

## Project Structure

```
prowrite-ai/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                # Authentication Module
│   │   │   ├── generation/          # AI Generation Module
│   │   │   ├── templates/           # Template Management
│   │   │   ├── workspace/           # Workspace/Team Management
│   │   │   ├── billing/             # Stripe Billing
│   │   │   └── analytics/           # Usage Analytics
│   │   ├── common/
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── entities/            # Database Entities
│   │   │   ├── guards/              # Auth Guards
│   │   │   └── interceptors/        # Logging/Error Handling
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── gemini.config.ts
│   │   │   └── stripe.config.ts
│   │   └── main.ts                  # App Entry Point
│   ├── .env.example
│   ├── docker-compose.yml           # Local Development
│   └── package.json
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/                  # Auth Pages
│   │   ├── (dashboard)/             # Dashboard Pages
│   │   │   ├── dashboard/           # Main Dashboard
│   │   │   ├── cold-email/          # Cold Email Module
│   │   │   ├── website-copy/        # Website Copy Module
│   │   │   ├── youtube-scripts/     # YouTube Scripts Module
│   │   │   └── hr-docs/             # HR/JD Documentation Module
│   │   ├── landing/                 # Landing Page
│   │   └── layout.tsx               # Root Layout
│   ├── components/
│   │   ├── dashboard/               # Dashboard Components
│   │   ├── templates/               # Template Components
│   │   └── ui/                      # Shadcn UI Components
│   ├── hooks/                       # Custom React Hooks
│   ├── lib/
│   │   ├── api.ts                   # API Client
│   │   ├── supabase.ts              # Supabase Client
│   │   └── utils.ts                 # Utilities
│   ├── types/
│   │   └── index.ts                 # TypeScript Types
│   ├── .env.local
│   ├── tailwind.config.ts
│   └── package.json
│
├── docs/                            # Documentation
│   ├── API.md                       # API Documentation
│   ├── DATABASE.md                  # Database Schema
│   ├── DEPLOYMENT.md                # Deployment Guide
│   └── FEATURES.md                  # Feature Documentation
│
├── .github/
│   └── workflows/                   # CI/CD Pipelines
│       ├── backend-deploy.yml
│       └── frontend-deploy.yml
│
└── README.md                        # Project Overview

```

---

## Database Schema

### Core Entities

**users** (Supabase Auth handles this)
```
- id: UUID (primary)
- email: String
- password_hash: String (handled by Supabase)
- created_at: Timestamp
- updated_at: Timestamp
```

**workspaces**
```
- id: UUID (primary)
- user_id: UUID (foreign key -> users)
- name: String
- description: String
- brand_voice_guide: JSON (user's tone/style)
- usage_limit: Integer (based on tier)
- created_at: Timestamp
- updated_at: Timestamp
```

**templates**
```
- id: UUID (primary)
- workspace_id: UUID (foreign key -> workspaces)
- module_type: Enum (cold_email, website_copy, youtube_scripts, hr_docs)
- name: String
- description: String
- system_prompt: Text (instructions for AI)
- input_schema: JSON (form fields)
- output_format: Text (expected output structure)
- tags: String[] (searchable)
- created_at: Timestamp
- updated_at: Timestamp
```

**generations**
```
- id: UUID (primary)
- workspace_id: UUID (foreign key -> workspaces)
- template_id: UUID (foreign key -> templates)
- input_data: JSON (user inputs)
- generated_content: Text (AI output)
- tokens_used: Integer (for billing)
- status: Enum (pending, completed, failed)
- created_at: Timestamp
- updated_at: Timestamp
```

**subscriptions**
```
- id: UUID (primary)
- workspace_id: UUID (foreign key -> workspaces)
- stripe_subscription_id: String
- plan_type: Enum (free, starter, pro, enterprise)
- status: Enum (active, canceled, past_due)
- current_period_start: Timestamp
- current_period_end: Timestamp
- created_at: Timestamp
- updated_at: Timestamp
```

**api_usage**
```
- id: UUID (primary)
- workspace_id: UUID (foreign key -> workspaces)
- model_used: String (gemini-2-5, etc)
- tokens_input: Integer
- tokens_output: Integer
- cost_usd: Decimal
- date: Date
- created_at: Timestamp
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register              Create Account
POST   /api/auth/login                 Login
POST   /api/auth/logout                Logout
POST   /api/auth/refresh               Refresh Token
GET    /api/auth/me                    Current User
```

### Generation (AI)
```
POST   /api/generation/generate         Generate Content
GET    /api/generation/:id              Get Generation
GET    /api/generation/list             List User Generations
DELETE /api/generation/:id              Delete Generation
POST   /api/generation/regenerate       Regenerate with Different Prompt
```

### Templates
```
GET    /api/templates                   List All Templates
GET    /api/templates/:module_type      List Templates by Module
GET    /api/templates/:id               Get Template Details
POST   /api/templates                   Create Custom Template (Pro+)
PUT    /api/templates/:id               Update Template
DELETE /api/templates/:id               Delete Custom Template
```

### Workspace
```
GET    /api/workspace                   Get Current Workspace
PUT    /api/workspace                   Update Workspace Settings
POST   /api/workspace/brand-voice       Train Brand Voice
GET    /api/workspace/usage             Get Usage Stats
GET    /api/workspace/billing           Get Billing Info
```

### Billing
```
GET    /api/billing/plans               List Pricing Plans
POST   /api/billing/subscribe           Subscribe to Plan
GET    /api/billing/invoice/:id         Get Invoice
GET    /api/billing/invoices            List Invoices
POST   /api/billing/cancel              Cancel Subscription
```

---

## Features by Module

### Module 1: Cold Email Copy (Pro: $99/month)
**Target:** B2B Sales Teams, Agencies, SDRs

Templates:
- Cold Outreach Email (intro + value prop)
- Follow-up Sequences (3-email series)
- Value-Prop Framework
- Objection Handling Responses
- LinkedIn Connection Message
- Meeting Confirmation Email

Features:
- A/B variation generation
- Personalization token support {{company_name}}, {{first_name}}
- Tone customization (formal, casual, aggressive)
- Industry-specific angles
- Email warmup scheduling integration

---

### Module 2: Website Copy (Starter: $15/month)
**Target:** SMBs, Ecommerce Stores, Freelancers

Templates:
- Landing Page Copy
- Homepage Copy
- About Page Copy
- Product Description (bulk CSV)
- Service Page Copy
- FAQ Generator
- Blog Post Title + Outline

Features:
- Bulk product description generation (upload CSV, download results)
- Shopify/WooCommerce integration ready
- SEO optimization (keywords, meta descriptions)
- Conversion-focused copywriting frameworks
- A/B headline variants

---

### Module 3: YouTube Scripts (Starter: $15/month)
**Target:** Content Creators, Agencies

Templates:
- Tutorial Script Format
- Review/Reaction Script
- Storytelling Script
- Educational Script
- Product Demo Script
- Vlog Script Template

Features:
- Hook formulas (5+ variants)
- Timestamp/chapter breakdown
- CTA optimization
- Platform-specific (YouTube, TikTok, Instagram Reels variants)
- Estimated video length calculator

---

### Module 4: HR/Software Docs (Enterprise: $299+/month)
**Target:** HR Teams, QA Engineers, Tech Managers

Templates:
- Job Description Generator
- Offer Letter Template
- Performance Review Framework
- QA Test Case Documentation
- API Documentation
- Release Notes
- On boarding Guide
- Software Architecture Document

Features:
- Company culture/tone training
- Compliance template library (GDPR, ADA)
- Team seat management (multiple HR staff)
- Org chart integration ready
- Approval workflow (draft → review → publish)
- Bulk HR doc generation

---

## Differentiation vs ChatGPT/Claude/Gemini

| Feature | ProWrite AI | ChatGPT | Claude | Gemini |
|---------|-------------|---------|--------|--------|
| **Industry-specific templates** | ✅ Pre-built | ❌ Generic | ❌ Generic | ❌ Generic |
| **Brand voice training** | ✅ Automatic | ❌ Manual | ❌ Manual | ❌ Manual |
| **Batch generation** | ✅ CSV bulk | ❌ One-by-one | ❌ One-by-one | ❌ One-by-one |
| **Cold email A/B variants** | ✅ Built-in | ❌ Manual copies | ❌ Manual copies | ❌ Manual copies |
| **Product desc bulk upload** | ✅ Native | ❌ Copy/paste | ❌ Copy/paste | ❌ Copy/paste |
| **Team collaboration** | ✅ Workspace | ❌ No | ❌ No | ❌ No |
| **Usage tracking** | ✅ Dashboard | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **Affordable B2B pricing** | ✅ $99 | ❌ $20+ | ❌ Paid only | ✅ Free tier, paid later |
| **SMB pricing** | ✅ $15 | ❌ $20+ | ❌ Paid only | ✅ Free tier, paid later |
| **Software industry expertise** | ✅ Specialized | ❌ Generic | ❌ Generic | ❌ Generic |
| **Cold email frameworks** | ✅ Proven sales | ❌ Generic | ❌ Generic | ❌ Generic |
| **Export integrations** | ✅ Zapier/Email | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |

---

## Free Services Strategy

### Computation
- **Gemini API** (Free): 5-15 RPM, 250K tokens/min (commercial use allowed) → $0
- **Database:** Supabase (Free): 500MB storage, unlimited reads ($0 with optimization)
- **Frontend Hosting:** Vercel (Free): Unlimited deployments ($0)
- **Backend Hosting:** Railway/Render (Free): 750 hours/month (~$5/month if exceeded, minimal)

### Infrastructure
- **Authentication:** Supabase Auth (included in database) → $0
- **Email:** Resend (Free): 100 emails/day → $0
- **File Storage:** Supabase Storage (1GB free) → $0
- **Analytics:** PostHog (Free tier: 1M events) → $0
- **Monitoring:** Basic logging (self-hosted) → $0
- **CI/CD:** GitHub Actions (Free) → $0

### **Total Monthly Cost for MVP: ~$0-5/month**

---

## Implementation Timeline

### Week 1: Foundation & Auth
- [ ] Setup NestJS project with TypeORM + Supabase
- [ ] Setup Next.js project with Vercel
- [ ] Implement Supabase Auth (signup/login)
- [ ] Create user entity + workspace entity
- [ ] Test auth flow end-to-end

### Week 2: Core Generation Engine
- [ ] Integrate Gemini API
- [ ] Create Generation module (NestJS)
- [ ] Build template system
- [ ] Create Cold Email templates (5)
- [ ] Test generation API

### Week 3: Frontend Dashboard
- [ ] Build dashboard layout (Shadcn UI)
- [ ] Cold email module UI
- [ ] Generation result display
- [ ] User auth UI (login/signup)
- [ ] Mobile responsiveness

### Week 4: Additional Modules
- [ ] Website Copy module + templates
- [ ] YouTube Scripts module + templates
- [ ] HR/Docs module + templates (basic)
- [ ] Module switching UI

### Week 5: Advanced Features
- [ ] Brand voice training
- [ ] Batch CSV generation
- [ ] Usage dashboard
- [ ] Export functionality

### Week 6: Billing & Launch Prep
- [ ] Stripe integration
- [ ] Pricing tiers (Free, Starter $15, Pro $99, Enterprise $299)
- [ ] Freemium paywall logic
- [ ] Landing page
- [ ] Documentation

### Week 7-8: Testing & Optimization
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Bug fixes
- [ ] Production deployment

---

## Key Implementation Notes

### Why Gemini Over Others
- **Free tier:** 15 RPM (sufficient for MVP)
- **Commercial use:** Explicitly allowed
- **No credit card required** initially
- **Better multimodal** (supports images for future features)
- **Cost:** Free → ~$1-2 per 1M tokens at scale

### Why Supabase Over Others
- **PostgreSQL** (powerful for joins)
- **Real-time:** Built-in (free)
- **Auth:** Included
- **Storage:** Included
- **No vendor lock-in** (standard Postgres)

### Why NestJS Over Express
- **Built-in validation** (class-validators)
- **Dependency injection** (clean architecture)
- **TypeORM integration** (smooth)
- **Industry standard** for scalable Node.js
- **Great for long-term scaling**

---

## Deployment Checklist

### Backend (NestJS)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Gemini API key secured
- [ ] Stripe keys configured
- [ ] Deploy to Railway/Render
- [ ] Database backups enabled

### Frontend (Next.js)
- [ ] Environment variables configured
- [ ] Build optimization completed
- [ ] Image optimization enabled
- [ ] Deploy to Vercel
- [ ] Custom domain configured

### Post-Launch
- [ ] Monitor error rates
- [ ] Setup uptime monitoring
- [ ] Email support channel
- [ ] Analytics dashboard
- [ ] User feedback collection

---

## Next Steps

1. **Review Tech Stack** - Confirm all tools match your preferences
2. **Setup Environments** - Create accounts (Supabase, Vercel, Railway, Gemini)
3. **Clone Repositories** - Backend and frontend templates
4. **Begin Implementation** - Follow the detailed guides in separate documents
5. **Reference Specific Files** - Backend setup, Frontend setup, Database schema, API docs

---

## Support & Troubleshooting

See detailed docs:
- **BACKEND.md** - NestJS setup & configuration
- **FRONTEND.md** - Next.js setup & components
- **DATABASE.md** - Supabase migrations & queries
- **API.md** - Complete endpoint documentation
- **DEPLOYMENT.md** - Production deployment guide

---

**Status:** Ready to implement  
**Maintained by:** Your Team  
**Last Review:** November 2025

