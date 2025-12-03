# Backend Setup Guide - NestJS + Supabase + Gemini
## Complete Step-by-Step Implementation

---

## Part 1: Initial Setup

### 1.1 Prerequisites
```bash
# Required
Node.js 18.17+ (https://nodejs.org/)
npm 9+ or yarn 4+
Git

# Recommended
VSCode with NestJS extension
Postman (API testing)
Docker & Docker Compose (optional, for local Supabase)
```

### 1.2 Create NestJS Project
```bash
# Install NestJS CLI (if not already installed)
npm install -g @nestjs/cli

# Generate new project
nest new prowrite-backend

cd prowrite-backend

# Install additional dependencies
npm install --save @nestjs/typeorm typeorm pg @supabase/supabase-js @google-ai/generativelanguage axios class-validator class-transformer

# Dev dependencies
npm install --save-dev @types/node typescript ts-loader
```

### 1.3 Project Structure Setup
```bash
# Create folder structure
mkdir -p src/modules/{auth,generation,templates,workspace,billing,analytics}
mkdir -p src/common/{dto,entities,guards,interceptors,filters}
mkdir -p src/config
```

---

## Part 2: Database Configuration

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Project Name: `prowrite-ai`
   - Database Password: (strong password)
   - Region: (closest to you)
4. Wait for setup to complete (~2 minutes)
5. Copy your credentials:
   - **Project URL** (under Settings → API)
   - **Anon Key** (under Settings → API)
   - **JWT Secret** (under Settings → API)

### 2.2 Configure Environment Variables

Create `.env` file in `prowrite-backend/`:

```env
# App
NODE_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[SUPABASE_ID].supabase.co:5432/postgres
DB_HOST=db.[SUPABASE_ID].supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[PASSWORD]
DB_NAME=postgres

# Supabase
SUPABASE_URL=https://[SUPABASE_ID].supabase.co
SUPABASE_KEY=[ANON_KEY]
SUPABASE_JWT_SECRET=[JWT_SECRET]

# Gemini API
GEMINI_API_KEY=[GET_FROM_GOOGLE_AI_STUDIO]

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRATION=7d

# Stripe (setup later)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
```

### 2.3 Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key in new project"
3. Copy the API key to `.env` as `GEMINI_API_KEY`

---

## Part 3: TypeORM Configuration

### 3.1 Create Database Configuration File

Create `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Entities
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  
  // Migrations
  migrations: ['dist/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  
  // Development
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  logger: 'advanced-console',
  
  // SSL for Supabase (important!)
  ssl: process.env.DB_HOST?.includes('supabase') ? {
    rejectUnauthorized: false,
  } : false,
};
```

### 3.2 Update App Module

Edit `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';

// Import modules (we'll create these)
import { AuthModule } from './modules/auth/auth.module';
import { GenerationModule } from './modules/generation/generation.module';
import { TemplatesModule } from './modules/templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    GenerationModule,
    TemplatesModule,
    // Add other modules as we create them
  ],
})
export class AppModule {}
```

---

## Part 4: Create Database Entities

### 4.1 Workspace Entity

Create `src/common/entities/workspace.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string; // Supabase user ID

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  brand_voice_guide: Record<string, any>;

  @Column({ default: 100 })
  usage_limit: number; // Monthly generation limit

  @Column({ default: 0 })
  usage_count: number; // Current month usage

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 4.2 Template Entity

Create `src/common/entities/template.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspace_id: string;

  @Column({
    type: 'enum',
    enum: ['cold_email', 'website_copy', 'youtube_scripts', 'hr_docs'],
  })
  module_type: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text' })
  system_prompt: string; // Instruction for AI

  @Column({ type: 'jsonb' })
  input_schema: Record<string, any>; // Form field definitions

  @Column({ type: 'text' })
  output_format: string; // Expected output structure

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: false })
  is_custom: boolean; // User-created template

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 4.3 Generation Entity

Create `src/common/entities/generation.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('generations')
export class Generation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspace_id: string;

  @Column()
  template_id: string;

  @Column({ type: 'jsonb' })
  input_data: Record<string, any>;

  @Column({ type: 'text' })
  generated_content: string;

  @Column({ default: 0 })
  tokens_used: number;

  @Column({ 
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  })
  status: string;

  @Column({ nullable: true })
  error_message: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

### 4.4 Subscription Entity

Create `src/common/entities/subscription.entity.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspace_id: string;

  @Column({ nullable: true })
  stripe_subscription_id: string;

  @Column({
    type: 'enum',
    enum: ['free', 'starter', 'pro', 'enterprise'],
    default: 'free'
  })
  plan_type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'canceled', 'past_due'],
    default: 'active'
  })
  status: string;

  @Column({ nullable: true })
  current_period_start: Date;

  @Column({ nullable: true })
  current_period_end: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

---

## Part 5: Authentication Module

### 5.1 Create Auth Service

Create `src/modules/auth/auth.service.ts`:

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../../common/entities/workspace.entity';
import { Subscription } from '../../common/entities/subscription.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
  ) {}

  async handleSupabaseUser(supabaseUser: any) {
    const { id: userId, email } = supabaseUser;

    // Check if workspace exists
    let workspace = await this.workspaceRepo.findOne({
      where: { user_id: userId }
    });

    // Create workspace if new user
    if (!workspace) {
      workspace = this.workspaceRepo.create({
        user_id: userId,
        name: `${email.split('@')[0]}'s Workspace`,
        usage_count: 0,
        usage_limit: 100,
      });
      await this.workspaceRepo.save(workspace);

      // Create free subscription
      const subscription = this.subscriptionRepo.create({
        workspace_id: workspace.id,
        plan_type: 'free',
        status: 'active',
      });
      await this.subscriptionRepo.save(subscription);
    }

    // Generate access token
    const token = this.jwtService.sign({
      sub: userId,
      email,
      workspace_id: workspace.id,
    });

    return {
      access_token: token,
      workspace_id: workspace.id,
      email,
    };
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
```

### 5.2 Create Auth Guard

Create `src/common/guards/auth.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpException('No authorization header', HttpStatus.UNAUTHORIZED);
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer') {
      throw new HttpException('Invalid auth scheme', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
```

### 5.3 Create Auth Controller

Create `src/modules/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, Get, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { access_token: string }) {
    try {
      // Verify Supabase token here (optional)
      // For now, we'll trust the frontend's Supabase auth
      
      // Decode the token to get user info
      const payload = {
        id: body.access_token,
        email: 'user@example.com' // Should come from Supabase JWT
      };

      const result = await this.authService.handleSupabaseUser(payload);
      return result;
    } catch (error) {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Request() req) {
    return {
      user_id: req.user.sub,
      email: req.user.email,
      workspace_id: req.user.workspace_id,
    };
  }
}
```

---

## Part 6: Generation Module (AI Integration)

### 6.1 Create Gemini Service

Create `src/modules/generation/gemini.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateContent(
    prompt: string,
    systemInstruction: string,
  ): Promise<{ content: string; tokens: number }> {
    try {
      const model = this.client.getGenerativeModel({
        model: 'gemini-2.5-pro',
        systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      // Estimate tokens (rough estimate)
      const tokens = Math.ceil((prompt.length + content.length) / 4);

      return { content, tokens };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async generateVariations(
    prompt: string,
    systemInstruction: string,
    count: number = 3,
  ): Promise<string[]> {
    const variations = [];

    for (let i = 0; i < count; i++) {
      const { content } = await this.generateContent(
        `${prompt}\n\nGenerate variation ${i + 1}:`,
        systemInstruction,
      );
      variations.push(content);
    }

    return variations;
  }
}
```

### 6.2 Create Generation Controller

Create `src/modules/generation/generation.controller.ts`:

```typescript
import { Controller, Post, Body, Get, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/generation')
@UseGuards(AuthGuard)
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Post('generate')
  async generateContent(
    @Body() body: {
      template_id: string;
      input_data: Record<string, any>;
    },
    @Request() req,
  ) {
    try {
      const result = await this.generationService.generateContent(
        req.user.workspace_id,
        body.template_id,
        body.input_data,
      );
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('list')
  async listGenerations(@Request() req) {
    return this.generationService.listGenerations(req.user.workspace_id);
  }

  @Get(':id')
  async getGeneration(@Param('id') id: string, @Request() req) {
    return this.generationService.getGeneration(id, req.user.workspace_id);
  }
}
```

### 6.3 Create Generation Service

Create `src/modules/generation/generation.service.ts`:

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Generation } from '../../common/entities/generation.entity';
import { Template } from '../../common/entities/template.entity';
import { Workspace } from '../../common/entities/workspace.entity';
import { GeminiService } from './gemini.service';

@Injectable()
export class GenerationService {
  constructor(
    @InjectRepository(Generation) private generationRepo: Repository<Generation>,
    @InjectRepository(Template) private templateRepo: Repository<Template>,
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    private geminiService: GeminiService,
  ) {}

  async generateContent(
    workspaceId: string,
    templateId: string,
    inputData: Record<string, any>,
  ) {
    // Check workspace usage
    const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new HttpException('Workspace not found', HttpStatus.NOT_FOUND);

    if (workspace.usage_count >= workspace.usage_limit) {
      throw new HttpException('Usage limit reached', HttpStatus.PAYMENT_REQUIRED);
    }

    // Get template
    const template = await this.templateRepo.findOne({ where: { id: templateId } });
    if (!template) throw new HttpException('Template not found', HttpStatus.NOT_FOUND);

    // Create generation record
    const generation = this.generationRepo.create({
      workspace_id: workspaceId,
      template_id: templateId,
      input_data: inputData,
      status: 'pending',
    });

    await this.generationRepo.save(generation);

    try {
      // Build prompt
      const prompt = this.buildPrompt(template.input_schema, inputData);

      // Call Gemini
      const { content, tokens } = await this.geminiService.generateContent(
        prompt,
        template.system_prompt,
      );

      // Update generation
      generation.generated_content = content;
      generation.tokens_used = tokens;
      generation.status = 'completed';
      await this.generationRepo.save(generation);

      // Update workspace usage
      workspace.usage_count += 1;
      await this.workspaceRepo.save(workspace);

      return {
        id: generation.id,
        content,
        tokens,
      };
    } catch (error) {
      generation.status = 'failed';
      generation.error_message = error.message;
      await this.generationRepo.save(generation);
      throw error;
    }
  }

  async listGenerations(workspaceId: string) {
    return this.generationRepo.find({
      where: { workspace_id: workspaceId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async getGeneration(id: string, workspaceId: string) {
    const generation = await this.generationRepo.findOne({
      where: { id, workspace_id: workspaceId },
    });

    if (!generation) throw new HttpException('Generation not found', HttpStatus.NOT_FOUND);
    return generation;
  }

  private buildPrompt(schema: Record<string, any>, data: Record<string, any>): string {
    let prompt = '';
    for (const [key, value] of Object.entries(data)) {
      prompt += `${key}: ${value}\n`;
    }
    return prompt;
  }
}
```

---

## Part 7: Templates Module

### 7.1 Create Template Service

Create `src/modules/templates/templates.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../../common/entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template) private templateRepo: Repository<Template>,
  ) {}

  async getTemplatesByModule(moduleType: string) {
    return this.templateRepo.find({
      where: { module_type: moduleType, is_custom: false },
    });
  }

  async getTemplate(id: string) {
    return this.templateRepo.findOne({ where: { id } });
  }

  async createDefaultTemplates() {
    // Cold Email Templates
    const coldEmailTemplates = [
      {
        name: 'Cold Outreach',
        module_type: 'cold_email',
        description: 'Initial cold outreach email',
        system_prompt: 'You are an expert at writing cold outreach emails that get replies. Write professional, concise emails that focus on value.',
        input_schema: {
          recipient_name: 'string',
          recipient_company: 'string',
          recipient_title: 'string',
          value_proposition: 'string',
          your_company: 'string',
          tone: 'string',
        },
        output_format: 'Email (subject + body)',
        is_custom: false,
      },
      // Add more templates...
    ];

    for (const template of coldEmailTemplates) {
      const existing = await this.templateRepo.findOne({
        where: { name: template.name },
      });
      if (!existing) {
        await this.templateRepo.save(template);
      }
    }
  }
}
```

---

## Part 8: Main.ts Configuration

Edit `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`✅ Backend running on http://localhost:${port}`);
}

bootstrap();
```

---

## Part 9: Running the Backend

```bash
# Development
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod

# Test
npm run test
```

---

## Part 10: Troubleshooting

### Database Connection Issues
```
Error: FATAL: Ident authentication failed
Solution: Check DATABASE_URL is correct, use postgres://user:password@host:port/db format
```

### Gemini API Errors
```
Error: 429 Too Many Requests
Solution: Free tier is 5-15 RPM. Implement rate limiting or wait.
```

### TypeORM Synchronization
```
Error: column "xxx" of relation "xxx" already exists
Solution: Set synchronize: false and use migrations instead.
```

---

**Next:** Continue with Frontend Setup documentation

