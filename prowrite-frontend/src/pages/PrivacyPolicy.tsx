import { Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { ThemeToggleButton } from '@/components/ThemeToggle'

export function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-sm prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProWrite AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered writing platform and related services (collectively, the "Service").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Account registration information (email address, name, organization)</li>
              <li>Content you create, upload, or generate using the Service</li>
              <li>Payment and billing information (processed securely via Stripe)</li>
              <li>Communications with us (support requests, feedback)</li>
              <li>Team and workspace settings and preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (features used, interaction patterns, timestamps)</li>
              <li>Log data (IP address, access times, pages viewed)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send billing-related communications</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Send administrative notifications and Service updates</li>
              <li>Monitor and analyze usage trends to improve user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. AI & Content Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Content you submit for AI-powered generation is sent to our AI processing providers (Google Gemini) to generate responses. We do not use your content to train AI models. Your generated content remains your intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Sharing & Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who assist in operating our Service (hosting, payment processing, analytics)</li>
              <li><strong className="text-foreground">Team Members:</strong> Content shared within your workspace is visible to team members per your workspace settings</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including 256-bit SSL/TLS encryption, secure authentication via Supabase, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us. We will delete or anonymize your data within 30 days of such a request, unless retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate or incomplete data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive data in a structured format)</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and session management. We may also use analytics cookies to understand how you use our Service. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for users under the age of 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in compliance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong className="text-foreground">Email:</strong> privacy@prowriteai.com<br />
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

export default PrivacyPolicyPage
