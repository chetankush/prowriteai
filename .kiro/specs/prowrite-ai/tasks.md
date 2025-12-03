# Implementation Plan

## Phase 1: Project Setup and Core Infrastructure

- [x] 1. Initialize backend project with NestJS and configure core dependencies
  - [x] 1.1 Create NestJS project with TypeScript configuration
    - Initialize project using `nest new prowrite-backend`
    - Install dependencies: @nestjs/typeorm, typeorm, pg, @supabase/supabase-js, @google/generative-ai, class-validator, class-transformer
    - Configure TypeScript strict mode and path aliases
    - _Requirements: 10.1, 10.4, 10.5_

  - [x] 1.2 Configure environment variables and database connection
    - Create .env.example with all required variables
    - Create src/config/database.config.ts for TypeORM configuration
    - Configure SSL for Supabase PostgreSQL connection
    - _Requirements: 10.4_

  - [x] 1.3 Set up global exception filter and validation pipes
    - Create GlobalExceptionFilter in src/common/filters/
    - Configure ValidationPipe with whitelist and transform options
    - Set up CORS for frontend origin
    - _Requirements: 10.4, 10.5_

  - [x] 1.4 Write property test for error response safety
    - **Property 31: Database Error Response**
    - **Validates: Requirements 10.4**

- [x] 2. Initialize frontend project with React and Vite
  - [x] 2.1 Create React project with Vite and TypeScript
    - Initialize project using Vite React-TS template
    - Install dependencies: @supabase/supabase-js, @tanstack/react-query, axios, react-router-dom, zod, react-hook-form
    - Configure path aliases in vite.config.ts and tsconfig.json
    - _Requirements: 11.1_

  - [x] 2.2 Set up Tailwind CSS and Shadcn UI
    - Install and configure Tailwind CSS
    - Initialize Shadcn UI with default configuration
    - Add essential components: Button, Input, Card, Label, Textarea, Select
    - _Requirements: 11.1, 11.5_

  - [x] 2.3 Configure environment variables and API client
    - Create .env.example with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
    - Create src/lib/api.ts with axios instance and auth interceptor
    - Create src/lib/supabase.ts with Supabase client initialization
    - _Requirements: 1.2, 10.1_

## Phase 2: Database Entities and Authentication

- [x] 3. Create database entities with TypeORM
  - [x] 3.1 Create Workspace entity
    - Define entity with id, user_id, name, description, brand_voice_guide, usage_limit, usage_count
    - Configure JSON column for brand_voice_guide
    - Add timestamps (created_at, updated_at)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Create Template entity
    - Define entity with id, workspace_id, module_type, name, description, system_prompt, input_schema, output_format, tags, is_custom
    - Configure enum for module_type (cold_email, website_copy, youtube_scripts, hr_docs)
    - Configure JSON column for input_schema
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.3 Create Generation entity
    - Define entity with id, workspace_id, template_id, input_data, generated_content, tokens_used, status, error_message
    - Configure enum for status (pending, completed, failed)
    - Configure JSON column for input_data
    - _Requirements: 4.2, 8.1, 8.2_

  - [x] 3.4 Create Subscription entity
    - Define entity with id, workspace_id, stripe_subscription_id, plan_type, status, current_period_start, current_period_end
    - Configure enums for plan_type and status
    - _Requirements: 9.1, 9.3, 9.4_

  - [x] 3.5 Write property test for template serialization round-trip
    - **Property 9: Template Serialization Round-Trip**
    - **Validates: Requirements 3.5, 3.6**

  - [x] 3.6 Write property test for brand voice guide serialization
    - **Property 4: Brand Voice Guide Serialization Round-Trip**
    - **Validates: Requirements 2.3**

- [x] 4. Implement authentication module
  - [x] 4.1 Create Auth module structure
    - Create auth.module.ts, auth.controller.ts, auth.service.ts
    - Configure JwtModule with secret from environment
    - Import TypeORM repositories for Workspace and Subscription
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Implement AuthService with Supabase user handling
    - Implement handleSupabaseUser() to create workspace for new users
    - Implement validateToken() for JWT verification
    - Create free subscription on new user registration
    - _Requirements: 1.4, 1.2_

  - [x] 4.3 Create AuthGuard for protected routes
    - Create src/common/guards/auth.guard.ts
    - Extract and verify JWT from Authorization header
    - Attach user payload to request object
    - _Requirements: 10.1, 10.2_

  - [x] 4.4 Implement Auth controller endpoints
    - POST /api/auth/login - Handle Supabase token exchange
    - GET /api/auth/me - Return current user info
    - _Requirements: 1.2, 1.3_

  - [x] 4.5 Write property test for new user workspace creation
    - **Property 1: New User Workspace Creation**
    - **Validates: Requirements 1.4**

  - [x] 4.6 Write property test for invalid credentials error safety
    - **Property 2: Invalid Credentials Error Safety**
    - **Validates: Requirements 1.5**

  - [x] 4.7 Write property test for missing token authentication
    - **Property 29: Missing Token Authentication**
    - **Validates: Requirements 10.1**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Frontend Authentication and Layout

- [x] 6. Implement frontend authentication
  - [x] 6.1 Create useAuth hook
    - Implement user state management with Supabase auth listener
    - Implement signUp, login, logout functions
    - Handle auth state changes and redirects
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 6.2 Create Login page component
    - Build form with email and password inputs using Shadcn UI
    - Implement form validation with react-hook-form and zod
    - Handle login errors and display messages
    - _Requirements: 1.2, 1.5_

  - [x] 6.3 Create Signup page component
    - Build form with email, password, and confirm password
    - Implement password match validation
    - Show email confirmation message on success
    - _Requirements: 1.1_

  - [x] 6.4 Create protected route wrapper
    - Create ProtectedRoute component that checks auth state
    - Redirect to login if not authenticated
    - Show loading state while checking auth
    - _Requirements: 1.6_

- [x] 7. Create dashboard layout
  - [x] 7.1 Create DashboardLayout component
    - Build sidebar with module navigation links
    - Implement collapsible sidebar with icons
    - Add user info and logout button
    - _Requirements: 11.1, 11.2, 11.4_

  - [x] 7.2 Create responsive navigation
    - Implement hamburger menu for mobile
    - Add tooltips for collapsed sidebar icons
    - Handle navigation without full page reload using React Router
    - _Requirements: 11.2, 11.4, 11.5_

  - [x] 7.3 Set up React Router with dashboard routes
    - Configure routes for /dashboard, /cold-email, /website-copy, /youtube-scripts, /hr-docs
    - Wrap dashboard routes with ProtectedRoute
    - Set up TanStack Query provider
    - _Requirements: 11.1, 11.2_

## Phase 4: Template System and Generation Engine

- [x] 8. Implement templates module
  - [x] 8.1 Create Templates module structure
    - Create templates.module.ts, templates.controller.ts, templates.service.ts
    - Import TypeORM repository for Template entity
    - _Requirements: 3.1_

  - [x] 8.2 Implement TemplatesService
    - Implement getTemplatesByModule() with module_type filter
    - Implement getTemplate() by id
    - Implement createDefaultTemplates() for seeding
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.3 Implement Templates controller endpoints
    - GET /api/templates?module_type= - List templates by module
    - GET /api/templates/:id - Get single template
    - POST /api/templates - Create custom template (Pro+)
    - _Requirements: 3.1, 3.2_

  - [x] 8.4 Create default template seeds
    - Create cold email templates (outreach, follow-up, LinkedIn)
    - Create website copy templates (landing page, product description)
    - Create HR docs templates (job description, offer letter)
    - _Requirements: 5.1, 6.1, 7.1_

  - [x] 8.5 Write property test for template module filtering
    - **Property 6: Template Module Filtering**
    - **Validates: Requirements 3.1**

  - [x] 8.6 Write property test for required field validation
    - **Property 8: Required Field Validation**
    - **Validates: Requirements 3.4**

  - [x] 8.7 Write property test for cold email input schema
    - **Property 15: Cold Email Input Schema**
    - **Validates: Requirements 5.2**

- [x] 9. Implement Gemini AI service
  - [x] 9.1 Create GeminiService
    - Initialize GoogleGenerativeAI client with API key
    - Implement generateContent() with system instruction
    - Calculate token usage from response
    - _Requirements: 4.1_

  - [x] 9.2 Implement variation generation
    - Implement generateVariations() for A/B testing
    - Ensure variations are distinct
    - _Requirements: 5.4_

  - [x] 9.3 Write property test for A/B variation distinctness
    - **Property 17: A/B Variation Distinctness**
    - **Validates: Requirements 5.4**

- [x] 10. Implement generation module
  - [x] 10.1 Create Generation module structure
    - Create generation.module.ts, generation.controller.ts, generation.service.ts
    - Import GeminiService and TypeORM repositories
    - _Requirements: 4.1_

  - [x] 10.2 Implement GenerationService core methods
    - Implement generateContent() with usage limit check
    - Build prompt from template and input data
    - Store generation record with status tracking
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 10.3 Implement generation listing and retrieval
    - Implement listGenerations() with workspace filter and sorting
    - Implement getGeneration() with workspace authorization
    - Implement deleteGeneration()
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [x] 10.4 Implement Generation controller endpoints
    - POST /api/generation/generate - Create new generation
    - GET /api/generation/list - List user generations
    - GET /api/generation/:id - Get single generation
    - DELETE /api/generation/:id - Delete generation
    - _Requirements: 4.1, 8.1, 8.4_

  - [x] 10.5 Write property test for usage count increment
    - **Property 11: Usage Count Increment**
    - **Validates: Requirements 4.3**

  - [x] 10.6 Write property test for usage limit enforcement
    - **Property 13: Usage Limit Enforcement**
    - **Validates: Requirements 4.5**

  - [x] 10.7 Write property test for failed generation status
    - **Property 12: Failed Generation Status**
    - **Validates: Requirements 4.4**

  - [x] 10.8 Write property test for generation history sorting
    - **Property 23: Generation History Sorting**
    - **Validates: Requirements 8.1**

  - [x] 10.9 Write property test for generation list limit
    - **Property 26: Generation List Limit**
    - **Validates: Requirements 8.5**

  - [x] 10.10 Write property test for generation deletion
    - **Property 25: Generation Deletion**
    - **Validates: Requirements 8.4**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Frontend Module Pages

- [x] 12. Create generation form components
  - [x] 12.1 Create DynamicForm component
    - Render form fields based on template input_schema
    - Support text, textarea, select, and number field types
    - Implement validation for required fields
    - _Requirements: 3.2, 3.4_

  - [x] 12.2 Create GenerationResult component
    - Display generated content with proper formatting
    - Show token usage information
    - Add copy to clipboard functionality
    - Add regenerate button
    - _Requirements: 4.3, 8.3_

  - [x] 12.3 Create GenerationHistory component
    - Display list of past generations
    - Show template name, date, and preview
    - Add delete functionality
    - _Requirements: 8.1, 8.4_

- [x] 13. Implement Cold Email module page
  - [x] 13.1 Create ColdEmailPage component
    - Fetch cold email templates using TanStack Query
    - Display template selector
    - Integrate DynamicForm and GenerationResult components
    - _Requirements: 5.1, 5.2_

  - [x] 13.2 Implement cold email specific features
    - Add A/B variation toggle
    - Support personalization token preview
    - Display subject and body sections separately
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 13.3 Write property test for cold email output structure
    - **Property 16: Cold Email Output Structure**
    - **Validates: Requirements 5.3**

  - [x] 13.4 Write property test for personalization token preservation
    - **Property 18: Personalization Token Preservation**
    - **Validates: Requirements 5.5**

- [x] 14. Implement Website Copy module page
  - [x] 14.1 Create WebsiteCopyPage component
    - Fetch website copy templates
    - Display template selector with categories
    - Integrate form and result components
    - _Requirements: 6.1, 6.2_

  - [x] 14.2 Implement landing page generation features
    - Parse and display headline, subheadline, benefits, CTA sections
    - Add SEO meta description display
    - _Requirements: 6.3, 6.5_

  - [x] 14.3 Write property test for landing page output structure
    - **Property 20: Landing Page Output Structure**
    - **Validates: Requirements 6.3**

- [x] 15. Implement HR Docs module page
  - [x] 15.1 Create HRDocsPage component
    - Fetch HR documentation templates
    - Display template selector with categories
    - Integrate form and result components
    - _Requirements: 7.1, 7.2_

  - [x] 15.2 Implement job description generation
    - Add company culture integration from brand voice
    - Display structured output with sections
    - _Requirements: 7.2, 7.3_

  - [x] 15.3 Write property test for HR template input schema
    - **Property 22: HR Template Input Schema**
    - **Validates: Requirements 7.2**

- [x] 16. Implement YouTube Scripts module page
  - [x] 16.1 Create YouTubeScriptsPage component
    - Fetch YouTube script templates
    - Display template selector
    - Integrate form and result components
    - _Requirements: 3.1, 3.2_

## Phase 6: Workspace and Settings

- [x] 17. Implement workspace module
  - [x] 17.1 Create Workspace module structure
    - Create workspace.module.ts, workspace.controller.ts, workspace.service.ts
    - Import TypeORM repository for Workspace entity
    - _Requirements: 2.1_

  - [x] 17.2 Implement WorkspaceService
    - Implement getWorkspace() by id
    - Implement updateWorkspace() with partial updates
    - Implement incrementUsage() and checkUsageLimit()
    - _Requirements: 2.1, 2.2, 4.5_

  - [x] 17.3 Implement Workspace controller endpoints
    - GET /api/workspace - Get current workspace
    - PUT /api/workspace - Update workspace settings
    - GET /api/workspace/usage - Get usage statistics
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 17.4 Write property test for workspace update round-trip
    - **Property 3: Workspace Update Round-Trip**
    - **Validates: Requirements 2.2**

  - [x] 17.5 Write property test for cross-workspace authorization
    - **Property 30: Cross-Workspace Authorization**
    - **Validates: Requirements 10.2**

- [x] 18. Create workspace settings page
  - [x] 18.1 Create WorkspaceSettingsPage component
    - Display current workspace name and description
    - Create edit form for workspace details
    - _Requirements: 2.1, 2.2_

  - [x] 18.2 Create BrandVoiceEditor component
    - Create form for tone, style, terminology, avoid fields
    - Save brand voice guide as JSON
    - _Requirements: 2.3_

  - [x] 18.3 Create UsageDashboard component
    - Display current usage count and limit
    - Show usage progress bar
    - Display remaining generations
    - _Requirements: 2.5_

- [x] 19. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: Billing and Subscription

- [x] 20. Implement billing module
  - [x] 20.1 Create Billing module structure
    - Create billing.module.ts, billing.controller.ts, billing.service.ts
    - Import Stripe SDK and configure with secret key
    - _Requirements: 9.1_

  - [x] 20.2 Implement BillingService
    - Implement getPlans() returning plan details
    - Implement createCheckoutSession() for Stripe
    - Implement handleWebhook() for subscription events
    - _Requirements: 9.2, 9.3_

  - [x] 20.3 Implement subscription management
    - Update workspace subscription on successful payment
    - Update usage limits based on plan
    - Handle subscription cancellation
    - _Requirements: 9.3, 9.4_

  - [x] 20.4 Implement Billing controller endpoints
    - GET /api/billing/plans - List available plans
    - POST /api/billing/subscribe - Create checkout session
    - POST /api/billing/webhook - Handle Stripe webhooks
    - _Requirements: 9.1, 9.2_

  - [x] 20.5 Write property test for subscription update on confirmation
    - **Property 27: Subscription Update on Confirmation**
    - **Validates: Requirements 9.3**

  - [x] 20.6 Write property test for canceled subscription access
    - **Property 28: Canceled Subscription Access**
    - **Validates: Requirements 9.4**

- [x] 21. Create billing UI components
  - [x] 21.1 Create PricingPlans component
    - Display Free, Starter, Pro, Enterprise plans
    - Show features and pricing for each plan
    - Highlight current plan
    - _Requirements: 9.5_

  - [x] 21.2 Create BillingPage component
    - Display current subscription status
    - Show billing period and next renewal date
    - Add upgrade/downgrade buttons
    - _Requirements: 9.1_

  - [x] 21.3 Implement Stripe checkout integration
    - Redirect to Stripe checkout on plan selection
    - Handle success and cancel redirects
    - _Requirements: 9.2_

## Phase 8: Input Validation and Security

- [x] 22. Implement comprehensive input validation
  - [x] 22.1 Create DTOs with class-validator decorators
    - Create GenerateRequestDto with template_id and input_data validation
    - Create UpdateWorkspaceDto with optional field validation
    - Create CreateTemplateDto with all required fields
    - _Requirements: 10.5_

  - [x] 22.2 Implement custom validators
    - Create IsValidModuleType validator
    - Create IsValidInputSchema validator
    - _Requirements: 3.4, 10.5_

  - [x] 22.3 Write property test for input validation response
    - **Property 32: Input Validation Response**
    - **Validates: Requirements 10.5**

- [x] 23. Implement authorization checks
  - [x] 23.1 Create WorkspaceGuard
    - Verify user has access to requested workspace
    - Return 403 for unauthorized access attempts
    - _Requirements: 10.2_

  - [x] 23.2 Apply guards to all protected endpoints
    - Add AuthGuard to all /api/* routes except /auth/login
    - Add WorkspaceGuard to workspace-specific operations
    - _Requirements: 10.1, 10.2_

## Phase 9: Brand Voice Integration

- [x] 24. Implement brand voice in generation
  - [x] 24.1 Update GenerationService to include brand voice
    - Fetch workspace brand voice guide before generation
    - Append brand voice instructions to system prompt
    - _Requirements: 2.4, 7.3_

  - [x] 24.2 Write property test for brand voice incorporation
    - **Property 5: Brand Voice Incorporation in Prompts**
    - **Validates: Requirements 2.4**

## Phase 10: Final Integration and Polish

- [x] 25. Create main dashboard page
  - [x] 25.1 Create DashboardHomePage component
    - Display usage statistics widget
    - Show recent conversations list
    - Add quick access to modules
    - _Requirements: 11.3_

  - [x] 25.2 Implement dashboard data fetching
    - Fetch workspace usage stats
    - Fetch recent conversations
    - _Requirements: 11.3, 8.1_

- [ ] 26. Implement bulk CSV generation for product descriptions
  - [ ] 26.1 Create backend bulk generation endpoint
    - Add POST /api/generation/bulk endpoint to generation controller
    - Accept CSV data as array of row objects
    - Validate CSV structure matches template input schema
    - _Requirements: 6.4_

  - [ ] 26.2 Implement bulk generation service method
    - Create bulkGenerateContent() method in GenerationService
    - Process CSV rows sequentially with rate limiting
    - Track progress and handle individual row errors gracefully
    - Return array of generation results with row indices
    - _Requirements: 6.4_

  - [ ] 26.3 Create CSV upload component in frontend
    - Add file upload input accepting .csv files
    - Parse CSV using browser FileReader API
    - Validate columns match template input schema
    - Display preview of parsed data before generation
    - _Requirements: 6.4_

  - [ ] 26.4 Create BulkGenerationResult component
    - Display progress during bulk generation
    - Show success/failure status for each row
    - Add download button for results as CSV
    - _Requirements: 6.4_

  - [ ] 26.5 Integrate bulk generation into WebsiteCopy page
    - Add bulk generation tab/section for product descriptions
    - Wire up CSV upload to bulk generation API
    - Display results with download option
    - _Requirements: 6.4_

  - [ ]* 26.6 Write property test for bulk CSV generation count
    - **Property 21: Bulk CSV Generation Count**
    - **Validates: Requirements 6.4**

- [ ] 27. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
