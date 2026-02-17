import { Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { ThemeToggleButton } from '@/components/ThemeToggle'

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">ProWrite AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggleButton />
            <Link
              to="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ProWrite AI (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProWrite AI is an AI-powered professional writing platform that enables users to generate, edit, and manage various types of content including cold emails, website copy, HR documents, YouTube scripts, software documentation, and more. The Service includes team collaboration features, asset management, approval workflows, and integrations with third-party AI providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription & Billing</h2>
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.1 Plans</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service offers Free, Starter, Pro, and Enterprise subscription plans. Features and usage limits vary by plan. Details are available on our pricing page.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.2 Payment</h3>
            <p className="text-muted-foreground leading-relaxed">
              Paid subscriptions are billed in advance on a monthly or annual basis via Stripe. All fees are non-refundable except as required by law or as stated in our refund policy.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.3 Cancellation</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the end of that period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Generate content that is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Generate spam, phishing emails, or other deceptive communications</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Attempt to circumvent usage limits, rate limits, or security measures</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Resell, sublicense, or redistribute the Service without authorization</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">6.1 Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all content you create, input, or generate using the Service. By using the Service, you grant us a limited license to process your content solely for the purpose of providing the Service.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">6.2 Our Service</h3>
            <p className="text-muted-foreground leading-relaxed">
              The Service, including its design, code, features, and documentation, is the intellectual property of ProWrite AI. Nothing in these Terms grants you rights to our trademarks, logos, or brand assets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. AI-Generated Content</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>AI-generated content is provided "as-is" and should be reviewed before use</li>
              <li>We do not guarantee the accuracy, completeness, or suitability of AI-generated content</li>
              <li>You are responsible for reviewing and editing AI-generated content before distribution</li>
              <li>AI-generated content should not be relied upon as legal, financial, or medical advice</li>
              <li>We are not liable for any consequences arising from the use of AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Team & Workspace Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              Workspace owners and administrators are responsible for managing team member access, roles, and permissions. Content shared within a workspace may be visible to other workspace members according to their assigned roles (Owner, Admin, Editor, Viewer).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will provide reasonable notice of planned maintenance when possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROWRITE AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless ProWrite AI, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate this agreement at any time. We may suspend or terminate your access to the Service immediately if you violate these Terms. Upon termination, your right to use the Service ceases immediately. Sections that by their nature should survive termination will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ProWrite AI is incorporated, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">15. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong className="text-foreground">Email:</strong> legal@prowriteai.com<br />
              <strong className="text-foreground">Address:</strong> ProWrite AI, Inc.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} ProWrite AI. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TermsOfServicePage
