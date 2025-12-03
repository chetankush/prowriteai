# Quick Start & Deployment Guide
## Get ProWrite AI Running in 30 Minutes

---

## 5-Minute Quick Start (Development)

### Step 1: Clone and Setup Backend (5 min)

```bash
# Create backend
nest new prowrite-backend
cd prowrite-backend

# Install deps
npm install @nestjs/typeorm typeorm pg @supabase/supabase-js @google/generative-ai @nestjs/jwt @nestjs/passport passport passport-jwt

# Create .env (get values from https://supabase.com)
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
GEMINI_API_KEY=YOUR_GEMINI_KEY
JWT_SECRET=dev-secret-key-change-in-prod
STRIPE_SECRET_KEY=sk_test_xxx
EOF

# Start backend
npm run start:dev
```

### Step 2: Setup Frontend (3 min)

```bash
# Create frontend
npx create-next-app@latest prowrite-frontend --typescript --tailwind --app
cd prowrite-frontend

# Install deps
npm install @supabase/supabase-js @tanstack/react-query axios

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

# Start frontend
npm run dev
```

### Step 3: Verify (2 min)

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- Signup and test cold email generation

---

## Full Setup Checklist

### Accounts to Create
- [ ] Supabase (https://supabase.com) - Get PROJECT_ID, API_KEY, JWT_SECRET
- [ ] Google AI Studio (https://aistudio.google.com/app/apikey) - Get GEMINI_API_KEY
- [ ] Stripe (https://stripe.com) - Get test keys (setup later)
- [ ] GitHub - For version control
- [ ] Vercel - For frontend hosting
- [ ] Railway/Render - For backend hosting

### Environment Variables Needed

**Backend (.env)**
```
DATABASE_URL
GEMINI_API_KEY
JWT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY (optional, for emails)
SUPABASE_URL
SUPABASE_KEY
SUPABASE_JWT_SECRET
NODE_ENV=development
APP_PORT=3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Critical Configuration Files

### Backend Files to Create
```
✅ .env (environment variables)
✅ src/app.module.ts (imports modules, configures TypeORM)
✅ src/config/database.config.ts (Supabase PostgreSQL connection)
✅ src/modules/auth/ (authentication logic)
✅ src/modules/generation/ (AI generation with Gemini)
✅ src/modules/templates/ (template management)
✅ src/common/entities/ (database entities)
✅ src/common/guards/auth.guard.ts (JWT verification)
```

### Frontend Files to Create
```
✅ .env.local (environment variables)
✅ app/(auth)/login/page.tsx (login form)
✅ app/(auth)/signup/page.tsx (signup form)
✅ app/(dashboard)/layout.tsx (dashboard layout)
✅ app/(dashboard)/cold-email/page.tsx (cold email module)
✅ lib/supabase.ts (Supabase client)
✅ lib/api.ts (API client with auth)
✅ hooks/useAuth.ts (authentication hook)
```

---

## Database Setup

### Supabase Tables (Auto-Created by TypeORM)

**workspaces**
- id (UUID, PK)
- user_id (String)
- name (String)
- brand_voice_guide (JSON)
- usage_limit (Int)
- usage_count (Int)
- created_at (Timestamp)

**templates**
- id (UUID, PK)
- workspace_id (UUID, FK)
- module_type (Enum)
- name (String)
- system_prompt (Text)
- input_schema (JSON)
- output_format (Text)
- tags (String[])
- is_custom (Boolean)

**generations**
- id (UUID, PK)
- workspace_id (UUID, FK)
- template_id (UUID, FK)
- input_data (JSON)
- generated_content (Text)
- tokens_used (Int)
- status (Enum: pending, completed, failed)
- created_at (Timestamp)

**subscriptions**
- id (UUID, PK)
- workspace_id (UUID, FK)
- stripe_subscription_id (String)
- plan_type (Enum: free, starter, pro, enterprise)
- status (Enum: active, canceled, past_due)
- current_period_start (Timestamp)
- current_period_end (Timestamp)

---

## API Quick Reference

### Authentication
```
POST /api/auth/login
{
  "access_token": "supabase_jwt"
}

GET /api/auth/me
Authorization: Bearer JWT_TOKEN
```

### Generation
```
POST /api/generation/generate
Authorization: Bearer JWT_TOKEN
{
  "template_id": "uuid",
  "input_data": {
    "recipient_name": "John",
    "company": "Acme",
    ...
  }
}

GET /api/generation/list
Authorization: Bearer JWT_TOKEN
```

### Templates
```
GET /api/templates?module_type=cold_email
GET /api/templates/:id
```

---

## Module Implementations

### Cold Email (Priority 1)
**Templates Needed:**
- Initial outreach
- Follow-up email 1
- Follow-up email 2
- Follow-up email 3
- LinkedIn connection message

**System Prompts:**
```
"You are an expert at writing cold outreach emails. Focus on the recipient's pain points and your unique value. Keep emails concise, personable, and specific to the company. Use proven copywriting frameworks."
```

### Website Copy (Priority 2)
**Templates Needed:**
- Landing page hero copy
- Product description
- About page copy
- Benefits section
- CTA copy

**System Prompt:**
```
"Write conversion-focused website copy that emphasizes benefits over features. Use emotional triggers and social proof. Focus on the customer's transformation."
```

### YouTube Scripts (Priority 3)
**Templates Needed:**
- Tutorial script
- Review/reaction script
- Storytelling script
- Hook formulas

**System Prompt:**
```
"Write YouTube video scripts with strong hooks in the first 3 seconds. Include timestamps, clear structure, and CTAs. Make content engaging for 3-10 minute videos."
```

### HR/Docs (Priority 4)
**Templates Needed:**
- Job description
- Offer letter
- Performance review
- Onboarding guide

**System Prompt:**
```
"Write professional HR and technical documentation. Ensure clarity, compliance, and consistency with company tone. Include all required information in the correct format."
```

---

## Production Deployment

### Frontend (Vercel)

```bash
# Push to GitHub
git push origin main

# In Vercel dashboard:
# 1. Connect GitHub repo
# 2. Add environment variables
# 3. Deploy (automatic on push)

# Custom domain: Add in Vercel Settings
```

### Backend (Railway)

```bash
# Push to GitHub
git push origin main

# In Railway dashboard:
# 1. Create new project
# 2. Connect GitHub repo
# 3. Add environment variables
# 4. Set build command: npm run build
# 5. Set start command: npm run start:prod
# 6. Deploy (automatic on push)
```

### Database (Supabase)

```bash
# Backups: Already configured in Supabase
# Production DB: Separate project from staging
# SSL: Enabled by default
# Connection pooling: Use via Supabase connection string
```

---

## Cost Analysis

### Monthly Costs
```
Supabase PostgreSQL (free tier): $0
  - 500MB storage ✓
  - Unlimited reads ✓
  - Unlimited queries ✓

Gemini API (free tier): $0
  - 5-15 requests/minute ✓
  - 250K tokens/minute ✓
  - Commercial use allowed ✓

Vercel (frontend): $0
  - Unlimited deployments ✓
  - Up to 100GB bandwidth ✓

Railway (backend): ~$5
  - 750 hours/month included
  - Auto-scale as needed

Stripe (payments): 2.9% + $0.30
  - Only charged when subscriptions sold

─────────────────────────
Total MVP Cost: ~$5/month
```

### Scaling Costs (100k users)
```
Supabase: ~$50/month (increased storage/compute)
Gemini API: ~$100/month (token consumption)
Vercel: $20/month (bandwidth)
Railway: $50/month (compute)
Monitoring: $20/month
─────────────────────────
Total: ~$240/month for 100k users
```

---

## Monitoring & Maintenance

### Daily Tasks
- Monitor error logs in backend
- Check API latency (target: <500ms)
- Monitor Gemini API usage (free tier: 1M tokens/day recommended)

### Weekly Tasks
- Review user signups & engagement
- Check database storage (target: <50% of free tier)
- Review generation success rates (target: >95%)

### Monthly Tasks
- Review billing (Supabase, Gemini API, hosting)
- Optimize slow queries
- Update dependencies
- Review security logs

---

## Troubleshooting Guide

### Backend Won't Start
```
Error: ENOENT: no such file or directory, open '.env'
Solution: Create .env file with all required variables

Error: connect ECONNREFUSED
Solution: Check Supabase is running, DATABASE_URL is correct
```

### Frontend Shows Blank Page
```
Error: Supabase URL/Key missing
Solution: Create .env.local with NEXT_PUBLIC_SUPABASE_* keys

Error: API_URL not accessible
Solution: Ensure backend is running on correct port
```

### Generation API Returns 401
```
Error: Invalid token
Solution: Ensure JWT token is sent in Authorization header
         Check JWT_SECRET matches between frontend auth & backend

Error: Token expired
Solution: Implement token refresh logic in API client
```

### Gemini API Returns 429
```
Error: Rate limit exceeded
Solution: Free tier is 5-15 RPM. Implement queuing/caching.
         Consider upgrade to paid tier for production.
```

---

## Next Steps After MVP

1. **Week 1-2: Test & Iterate**
   - Get 10 beta users
   - Collect feedback on templates
   - Fix bugs & edge cases

2. **Week 3-4: Add Features**
   - Batch CSV generation
   - Brand voice training
   - More templates per module
   - Export integrations

3. **Week 5-6: Go Live**
   - Setup Stripe billing
   - Launch landing page
   - Begin customer acquisition
   - Start marketing

4. **Week 7+: Growth**
   - Customer support system
   - Detailed analytics
   - Advanced features (API access, webhooks)
   - Affiliate program

---

## Documentation Files Reference

- **PROJECT_OVERVIEW.md** - Architecture, tech stack, database schema
- **BACKEND_SETUP.md** - Step-by-step backend implementation
- **FRONTEND_SETUP.md** - Step-by-step frontend implementation
- **This File** - Quick start, deployment, troubleshooting

---

## Support Resources

**NestJS Docs:** https://docs.nestjs.com/
**Next.js Docs:** https://nextjs.org/docs
**Supabase Docs:** https://supabase.com/docs
**Gemini API Docs:** https://ai.google.dev/docs
**TypeORM Docs:** https://typeorm.io/

---

**Ready to build?** Start with 5-minute quick start above!

**Questions?** Check PROJECT_OVERVIEW.md for architecture details
**Stuck?** See Troubleshooting section or docs links above

---

**ProWrite AI MVP - Complete & Production Ready**
**Build Date: November 2025**
**Status: Ready for Implementation**

