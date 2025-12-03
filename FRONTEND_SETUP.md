# Frontend Setup Guide - Next.js 15 + Supabase Auth + Tailwind + Shadcn
## Complete Step-by-Step Implementation

---

## Part 1: Initial Project Setup

### 1.1 Create Next.js Project

```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest prowrite-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-git \
  --src-dir

cd prowrite-frontend

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs \
  @tanstack/react-query axios zod react-hook-form \
  @hookform/resolvers class-validator

# Install Shadcn/UI
npm install -D shadcn-ui@latest
npx shadcn-ui@latest init -d

# Dev dependencies
npm install -D @types/node @types/react typescript
```

### 1.2 Project Structure

```bash
mkdir -p app/{(auth),{(dashboard)}/{cold-email,website-copy,youtube-scripts,hr-docs},landing}
mkdir -p components/{dashboard,templates,ui,auth}
mkdir -p lib/{api,supabase,utils}
mkdir -p hooks
mkdir -p types
mkdir -p public/images
```

---

## Part 2: Supabase Configuration

### 2.1 Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper to get auth session
export const getAuthSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
```

### 2.2 Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[SUPABASE_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## Part 3: Authentication Setup

### 3.1 Create Auth Hook

Create `hooks/useAuth.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/dashboard');
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
```

### 3.2 Create Login Page

Create `app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to ProWrite AI</CardTitle>
          <CardDescription>
            Access your AI writing platform for professional content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-center">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3.3 Create Signup Page

Create `app/(auth)/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const { signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="text-gray-600">
                We've sent a confirmation link to {email}
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to confirm your account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Join ProWrite AI and start generating professional content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
            <p className="text-sm text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Part 4: API Client

### 4.1 Create API Client

Create `lib/api.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import { getAuthSession } from './supabase';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const session = await getAuthSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });
  }

  // Generation endpoints
  async generateContent(templateId: string, inputData: Record<string, any>) {
    return this.client.post('/generation/generate', {
      template_id: templateId,
      input_data: inputData,
    });
  }

  async listGenerations() {
    return this.client.get('/generation/list');
  }

  async getGeneration(id: string) {
    return this.client.get(`/generation/${id}`);
  }

  // Template endpoints
  async getTemplates(moduleType: string) {
    return this.client.get('/templates', { params: { module_type: moduleType } });
  }

  async getTemplate(id: string) {
    return this.client.get(`/templates/${id}`);
  }
}

export const api = new ApiClient();
```

---

## Part 5: Dashboard Layout

### 5.1 Create Dashboard Layout

Create `app/(dashboard)/layout.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const modules = [
    { name: 'Cold Email', href: '/dashboard/cold-email', icon: '✉️' },
    { name: 'Website Copy', href: '/dashboard/website-copy', icon: '📝' },
    { name: 'YouTube Scripts', href: '/dashboard/youtube-scripts', icon: '▶️' },
    { name: 'HR/Docs', href: '/dashboard/hr-docs', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300`}>
        <div className="p-4">
          <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-lg'}`}>
            {sidebarOpen ? 'ProWrite AI' : 'PW'}
          </h1>
        </div>

        <nav className="space-y-2 p-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="block p-2 rounded hover:bg-gray-800 transition"
              title={module.name}
            >
              {sidebarOpen ? (
                <span>{module.icon} {module.name}</span>
              ) : (
                <span>{module.icon}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={logout}
            className="w-full"
            variant="destructive"
          >
            {sidebarOpen ? 'Logout' : '←'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{user.email}</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ☰
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Part 6: Module Component (Cold Email Example)

### 6.1 Create Cold Email Module

Create `app/(dashboard)/cold-email/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function ColdEmailPage() {
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_company: '',
    recipient_title: '',
    value_proposition: '',
    your_company: '',
    tone: 'professional',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', 'cold_email'],
    queryFn: () => api.getTemplates('cold_email'),
  });

  const defaultTemplate = templates?.data?.[0];

  const handleGenerateChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!defaultTemplate) return;

    setIsGenerating(true);
    try {
      const response = await api.generateContent(defaultTemplate.id, formData);
      setGenerated(response.data);
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Cold Email Generator</CardTitle>
          <CardDescription>Enter details to generate outreach emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Name</Label>
            <Input
              placeholder="John Doe"
              value={formData.recipient_name}
              onChange={(e) => handleGenerateChange('recipient_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Company</Label>
            <Input
              placeholder="Acme Inc"
              value={formData.recipient_company}
              onChange={(e) => handleGenerateChange('recipient_company', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="VP of Sales"
              value={formData.recipient_title}
              onChange={(e) => handleGenerateChange('recipient_title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Your Value Proposition</Label>
            <Textarea
              placeholder="What unique value do you offer?"
              value={formData.value_proposition}
              onChange={(e) => handleGenerateChange('value_proposition', e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || templatesLoading}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Content</CardTitle>
        </CardHeader>
        <CardContent>
          {generated ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                {generated.content}
              </div>
              <div className="text-sm text-gray-600">
                Tokens used: {generated.tokens}
              </div>
              <Button variant="outline" className="w-full">
                Copy to Clipboard
              </Button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Generated content will appear here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Part 7: Running the Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

The app will be available at `http://localhost:3001`

---

## Part 8: Connecting Frontend & Backend

1. Ensure backend is running on `http://localhost:3000`
2. Ensure frontend is running on `http://localhost:3001`
3. Backend `.env` should have `FRONTEND_URL=http://localhost:3001`
4. Frontend `.env.local` should have correct Supabase keys

---

## Troubleshooting

### CORS Errors
```
Solution: Check backend CORS is enabled for frontend URL
```

### Auth Token Not Sending
```
Solution: Verify API client has Authorization header with Bearer token
```

### TypeScript Errors
```bash
npm run tsc --noEmit
```

---

**Next:** Deploy to production

