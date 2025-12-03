import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold">ProWrite AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            AI-Powered Content
            <span className="text-primary"> Generation</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 leading-8">
            Create professional cold emails, website copy, HR documents, and more 
            with industry-specific AI templates. Save hours of writing time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon="✉️"
            title="Cold Emails"
            description="Generate personalized outreach emails that get responses"
          />
          <FeatureCard
            icon="🌐"
            title="Website Copy"
            description="Create compelling landing pages and product descriptions"
          />
          <FeatureCard
            icon="📄"
            title="HR Documents"
            description="Professional job descriptions, offer letters, and more"
          />
          <FeatureCard
            icon="🎬"
            title="YouTube Scripts"
            description="Engaging video scripts optimized for your audience"
          />
        </div>

        {/* Benefits Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Why ProWrite AI?</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard
              title="Industry-Specific"
              description="Templates designed for software, B2B sales, and professional services"
            />
            <BenefitCard
              title="Brand Voice"
              description="Train the AI to match your company's tone and style"
            />
            <BenefitCard
              title="Save Time"
              description="Generate professional content in seconds, not hours"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-24 border-t">
        <div className="text-center text-slate-500">
          <p>© 2024 ProWrite AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}

export default LandingPage
