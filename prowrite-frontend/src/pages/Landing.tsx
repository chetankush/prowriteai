import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Mail,
  Globe,
  FileText,
  Video,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Users,
  Clock,
  FileCheck,
  Code,
  BarChart3,
  Lock,
  Check,
  X,
  Star,
  ChevronDown,
  Languages,
  Monitor,
} from 'lucide-react';
import { ThemeToggleButton } from '@/components/ThemeToggle';

// ─── Animated Counter Hook ───────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

// ─── FAQ Accordion Item ──────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-base font-medium text-foreground pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// ─── Landing Page ────────────────────────────────────────────────────────────

export function LandingPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">ProWrite AI</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollToSection('comparison')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 pt-20 pb-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8">
              <Zap className="h-4 w-4" />
              <span>Trusted by 2,500+ teams worldwide</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              AI content platform
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                built for teams
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Generate professional content with built-in approval workflows,
              audit trails, and compliance reporting. The AI writing tool that
              enterprises actually trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105"
                >
                  Start Free — No Credit Card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base border-border/50 hover:bg-secondary/80"
                onClick={() => scrollToSection('features')}
              >
                See How It Works
              </Button>
            </div>
          </div>

          {/* Product Mockup Visual */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
                <div className="h-3 w-3 rounded-full bg-red-400/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />
                <span className="ml-3 text-xs text-muted-foreground">ProWrite AI — Dashboard</span>
              </div>
              <div className="p-6 grid grid-cols-12 gap-4">
                {/* Mini sidebar */}
                <div className="col-span-3 space-y-3 hidden md:block">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                    <span className="text-xs text-violet-400 font-medium">Dashboard</span>
                  </div>
                  {[{ icon: Mail, label: 'Cold Email' }, { icon: FileText, label: 'HR Docs' }, { icon: Globe, label: 'Website Copy' }, { icon: Video, label: 'YouTube Scripts' }, { icon: Code, label: 'Software Docs' }].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
                {/* Main content mockup */}
                <div className="col-span-12 md:col-span-9 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-32 bg-foreground/10 rounded" />
                      <div className="h-3 w-48 bg-foreground/5 rounded mt-2" />
                    </div>
                    <div className="h-8 w-24 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium">+ New Doc</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Documents', 'Pending', 'Approved'].map((label, i) => (
                      <div key={label} className="rounded-lg border border-border/50 bg-secondary/20 p-3">
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                        <p className="text-lg font-bold text-foreground mt-1">{[147, 12, 89][i]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border/50 bg-secondary/10 p-3 space-y-2">
                    {['Sales Outreach Template — Approved ✓', 'Q4 Offer Letter — Pending Review', 'Landing Page Copy v3 — Draft'].map((item) => (
                      <div key={item} className="flex items-center gap-2 py-1.5 px-2 rounded bg-secondary/20">
                        <div className="h-2 w-2 rounded-full bg-violet-400" />
                        <span className="text-[11px] text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Metrics Bar ── */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <StatCounter target={50000} label="Documents Generated" suffix="+" />
            <StatCounter target={2500} label="Teams Active" suffix="+" />
            <StatCounter target={95} label="Faster Than Manual" suffix="%" />
            <StatCounter target={99.9} label="Uptime SLA" suffix="%" decimals={1} />
          </div>
        </div>
      </section>

      {/* ── Content Generation Features ── */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Specialized AI Modules</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              One platform, every content type
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Purpose-built AI experts for every type of business content — not a generic chatbot
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Mail className="h-6 w-6" />} title="Cold Email" description="Generate personalized outreach emails that get responses with proven copywriting frameworks" gradient="from-blue-500 to-cyan-500" />
            <FeatureCard icon={<FileText className="h-6 w-6" />} title="HR Documents" description="Job descriptions, offer letters, onboarding docs, and 20+ HR templates with compliance built-in" gradient="from-green-500 to-emerald-500" />
            <FeatureCard icon={<Globe className="h-6 w-6" />} title="Website Copy" description="Compelling landing pages, product descriptions, and conversion-focused web content" gradient="from-purple-500 to-violet-500" />
            <FeatureCard icon={<Video className="h-6 w-6" />} title="YouTube Scripts" description="Engaging video scripts with hooks, storytelling, and calls-to-action that retain viewers" gradient="from-red-500 to-pink-500" />
            <FeatureCard icon={<Code className="h-6 w-6" />} title="Software Docs" description="Technical documentation, API guides, README files, and developer content" gradient="from-orange-500 to-amber-500" />
            <FeatureCard icon={<Languages className="h-6 w-6" />} title="Translate & Rewrite" description="Translate content into multiple tones and formats for different audiences" gradient="from-teal-500 to-cyan-500" />
          </div>
        </div>
      </section>

      {/* ── ChatGPT vs ProWrite Comparison Table ── */}
      <section id="comparison" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
              <BarChart3 className="h-4 w-4" />
              <span>Why Switch?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ChatGPT is great for individuals.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                ProWrite is built for teams.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See why enterprise teams choose ProWrite AI over generic chatbots
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground text-center">ChatGPT Teams</th>
                    <th className="p-4 text-sm font-medium text-center">
                      <span className="text-violet-400">ProWrite AI</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Approval Workflows', chatgpt: false, prowrite: true },
                    { feature: 'Role-Based Permissions', chatgpt: false, prowrite: true },
                    { feature: 'Asset Library & Version History', chatgpt: false, prowrite: true },
                    { feature: 'Audit Trails & Compliance', chatgpt: false, prowrite: true },
                    { feature: 'Bulk CSV Mail Merge', chatgpt: false, prowrite: true },
                    { feature: 'Industry-Specific Templates', chatgpt: false, prowrite: true },
                    { feature: 'Brand Voice Training', chatgpt: false, prowrite: true },
                    { feature: 'Real-Time Co-Editing', chatgpt: false, prowrite: true },
                    { feature: 'Document Status Lifecycle', chatgpt: false, prowrite: true },
                    { feature: 'Admin Dashboard & Analytics', chatgpt: false, prowrite: true },
                  ].map(({ feature, chatgpt, prowrite }) => (
                    <tr key={feature} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 text-sm text-foreground">{feature}</td>
                      <td className="p-4 text-center">
                        {chatgpt ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {prowrite ? (
                          <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-8">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                  Switch to ProWrite AI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Document Management & Governance ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
              <Shield className="h-4 w-4" />
              <span>Enterprise-Ready Governance</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Document Management & Approval Workflows
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Full document lifecycle management with status tracking, version history, and compliance reporting
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <GovernanceCard icon={<FileCheck className="h-5 w-5" />} title="Status Lifecycle" description="Draft → Pending Approval → Approved → Archived with enforced transitions" />
            <GovernanceCard icon={<Clock className="h-5 w-5" />} title="Version History" description="Track every change with full version history and rollback capability" />
            <GovernanceCard icon={<Shield className="h-5 w-5" />} title="Audit Trails" description="Complete audit logs for compliance with who, what, and when tracking" />
            <GovernanceCard icon={<BarChart3 className="h-5 w-5" />} title="Compliance Reports" description="Generate PDF/CSV reports for governance and audit readiness" />
          </div>
        </div>
      </section>

      {/* ── Team Collaboration ── */}
      <section className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
              <Users className="h-4 w-4" />
              <span>Built for Teams</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Team Collaboration Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything your team needs to create, review, and approve content together
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <BenefitCard icon={<Users className="h-5 w-5" />} title="Team Workspaces" description="Invite team members with role-based permissions (Owner, Admin, Editor, Viewer)" />
            <BenefitCard icon={<CheckCircle className="h-5 w-5" />} title="Approval Workflows" description="Submit content for review, approve or reject with comments and feedback" />
            <BenefitCard icon={<Zap className="h-5 w-5" />} title="Real-Time Editing" description="See changes instantly with live document collaboration — no more version chaos" />
            <BenefitCard icon={<FileText className="h-5 w-5" />} title="Asset Library" description="Centralized storage for approved content, templates, and brand assets" />
            <BenefitCard icon={<Lock className="h-5 w-5" />} title="Admin Controls" description="Admin-only invites, billing controls, and workspace settings" />
            <BenefitCard icon={<BarChart3 className="h-5 w-5" />} title="Admin Dashboard" description="Workspace stats, activity feed, and compliance metrics at a glance" />
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-4">
              <Star className="h-4 w-4" />
              <span>Loved by Teams</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What our customers say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals creating better content, faster
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              quote="ProWrite cut our HR document creation time by 80%. Offer letters that used to take 45 minutes now take 5. The approval workflow means nothing goes out without review."
              name="Sarah Chen"
              title="VP of People Operations"
              company="TechScale Inc."
              rating={5}
            />
            <TestimonialCard
              quote="We switched from ChatGPT Teams and the difference is night and day. Having an asset library, templates, and audit trails makes our sales team 3x more productive."
              name="Marcus Rodriguez"
              title="Director of Sales"
              company="GrowthPath Solutions"
              rating={5}
            />
            <TestimonialCard
              quote="The bulk personalization feature alone pays for itself. We generated 500 personalized outreach emails from a CSV in minutes. Our reply rates jumped 40%."
              name="Emily Takahashi"
              title="Content Marketing Lead"
              company="CloudBridge Analytics"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
              <Zap className="h-4 w-4" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start free. Scale as you grow.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No credit card required to start. Cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              description="100 generations/month"
              features={['100 AI generations/month', 'All content modules', '1 team member', 'Basic templates', 'Community support']}
              ctaLabel="Get Started Free"
              ctaLink="/signup"
            />
            <PricingCard
              name="Starter"
              price="$19"
              period="/month"
              description="500 generations/month"
              features={['500 AI generations/month', 'All content modules', '5 team members', 'Custom templates', 'Asset library', 'Email support']}
              ctaLabel="Start Free Trial"
              ctaLink="/signup"
            />
            <PricingCard
              name="Pro"
              price="$49"
              period="/month"
              description="2,000 generations/month"
              features={['2,000 AI generations/month', 'All content modules', '25 team members', 'Approval workflows', 'Audit trails', 'Brand voice training', 'Bulk mail merge', 'Priority support']}
              ctaLabel="Start Free Trial"
              ctaLink="/signup"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              description="Unlimited generations"
              features={['Unlimited generations', 'Unlimited team members', 'SSO & SAML', 'Custom integrations', 'Compliance reports', 'Dedicated account manager', 'SLA guarantee', 'On-premise option']}
              ctaLabel="Contact Sales"
              ctaLink="mailto:sales@prowrite.ai"
              isEnterprise
            />
          </div>
        </div>
      </section>

      {/* ── Trust & Security Badges ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-lg font-semibold text-foreground mb-2">Enterprise-Grade Security</h3>
            <p className="text-sm text-muted-foreground">Your data is protected with industry-leading security standards</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl mx-auto">
            <TrustBadge icon={<Lock className="h-5 w-5" />} label="256-bit SSL Encryption" />
            <TrustBadge icon={<Shield className="h-5 w-5" />} label="SOC 2 Type II Ready" />
            <TrustBadge icon={<Globe className="h-5 w-5" />} label="GDPR Compliant" />
            <TrustBadge icon={<Monitor className="h-5 w-5" />} label="99.9% Uptime SLA" />
            <TrustBadge icon={<FileCheck className="h-5 w-5" />} label="Full Audit Trails" />
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about ProWrite AI
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            <FAQItem
              question="How is ProWrite AI different from ChatGPT?"
              answer="ChatGPT is a general-purpose chatbot. ProWrite AI is purpose-built for teams — with approval workflows, audit trails, role-based permissions, an asset library, bulk mail merge, and compliance reporting. Your content goes through a proper review process before going live, and your company retains ownership of all generated content."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Absolutely. We use 256-bit SSL encryption for all data in transit and at rest. Your content is stored securely on Supabase (powered by PostgreSQL) with enterprise-grade security. We never use your data to train AI models. We're working toward SOC 2 Type II certification."
            />
            <FAQItem
              question="Can I try it for free?"
              answer="Yes! Our Free plan includes 100 AI generations per month, access to all content modules, and is free forever. No credit card required. Upgrade anytime when you need more generations or team features."
            />
            <FAQItem
              question="What AI model do you use?"
              answer="We use Google's Gemini AI models, which provide state-of-the-art content generation with excellent accuracy. Each content module has its own specialized system prompt fine-tuned for that specific use case — so you get much better results than a generic chatbot."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes. There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time. If you cancel, you'll retain access until the end of your current billing period."
            />
            <FAQItem
              question="Do you support team collaboration?"
              answer="Yes! ProWrite AI is built from the ground up for teams. You can invite team members with role-based permissions (Owner, Admin, Editor, Viewer), use approval workflows to review content, collaborate in real-time on documents, and maintain a shared asset library."
            />
            <FAQItem
              question="What types of content can I generate?"
              answer="ProWrite AI supports cold emails, HR documents (20+ templates including offer letters, JDs, NDAs), website copy, YouTube scripts, software documentation, incident reports, and content translation. Each module has a specialized AI expert tuned for that content type."
            />
            <FAQItem
              question="Do you offer enterprise plans?"
              answer="Yes. Our Enterprise plan includes unlimited generations, unlimited team members, SSO/SAML authentication, custom integrations, compliance reports, a dedicated account manager, and SLA guarantees. Contact sales@prowrite.ai for a custom quote."
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to transform your team's content workflow?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join 2,500+ teams creating compliant, approved content at scale.
              Start free today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No credit card required · Free forever plan available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Expanded Footer ── */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">ProWrite AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered content platform built for teams. Generate, approve, and manage professional content at scale.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                {['Cold Email', 'HR Documents', 'Website Copy', 'YouTube Scripts', 'Software Docs', 'Translate'].map((item) => (
                  <li key={item}>
                    <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Features</h4>
              <ul className="space-y-3">
                {['Approval Workflows', 'Asset Library', 'Audit Trails', 'Mail Merge', 'Team Workspaces', 'Brand Voice'].map((item) => (
                  <li key={item}>
                    <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollToSection('pricing')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</button></li>
                <li><a href="mailto:support@prowrite.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="mailto:sales@prowrite.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sales</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ProWrite AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="mailto:support@prowrite.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                support@prowrite.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatCounter({
  target,
  label,
  suffix = '',
  decimals = 0,
}: {
  target: number;
  label: string;
  suffix?: string;
  decimals?: number;
}) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="space-y-1">
      <p className="text-3xl md:text-4xl font-bold text-foreground">
        {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-violet-500/30 transition-all hover:shadow-lg hover:shadow-violet-500/5">
      <div
        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function GovernanceCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card/50 hover:border-green-500/30 transition-all">
      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 text-violet-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  title,
  company,
  rating,
}: {
  quote: string;
  name: string;
  title: string;
  company: string;
  rating: number;
}) {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50 hover:border-violet-500/20 transition-all">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-violet-400">
            {name.split(' ').map((n) => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{title}, {company}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaLink,
  highlighted = false,
  isEnterprise = false,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  highlighted?: boolean;
  isEnterprise?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-6 transition-all',
        highlighted
          ? 'border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10 scale-[1.02]'
          : 'border-border/50 bg-card/50'
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg shadow-violet-500/25">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </span>
        </div>
      )}
      <div className={cn('mb-4', highlighted && 'pt-2')}>
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-foreground">{price}</span>
          {period && <span className="text-sm text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <ul className="space-y-3 flex-1 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-emerald-400" />
            </div>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      {isEnterprise ? (
        <a href={ctaLink}>
          <Button variant="outline" className="w-full">
            {ctaLabel}
          </Button>
        </a>
      ) : (
        <Link to={ctaLink}>
          <Button
            className={cn(
              'w-full',
              highlighted
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25'
                : ''
            )}
            variant={highlighted ? 'default' : 'outline'}
          >
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default LandingPage;
