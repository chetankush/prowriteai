import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { 
  LandingPage,
  LoginPage, 
  SignupPage, 
  DashboardPage, 
  ColdEmailPage, 
  WebsiteCopyPage, 
  YouTubeScriptsPage, 
  HRDocsPage,
  WorkspaceSettingsPage,
  BillingPage,
  TeamPage,
  AssetsPage,
  ApprovalsPage,
  PersonalizationPage,
  SoftwareDocsPage,
  IncidentHubPage,
  TranslateHubPage,
  DocumentsPage,
  DocumentDetailPage,
  AdminDashboardPage,
  AdminCompliancePage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  ForgotPasswordPage,
  OnboardingPage
} from '@/pages'
import { ProtectedRoute, ErrorBoundary, DashboardLayout } from '@/components'
import { ToastProvider } from '@/components/ui/toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />

              {/* Onboarding — protected but outside DashboardLayout */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* Protected routes with DashboardLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cold-email" element={<ColdEmailPage />} />
                <Route path="/website-copy" element={<WebsiteCopyPage />} />
                <Route path="/youtube-scripts" element={<YouTubeScriptsPage />} />
                <Route path="/hr-docs" element={<HRDocsPage />} />
                <Route path="/software-docs" element={<SoftwareDocsPage />} />
                <Route path="/incident-hub" element={<IncidentHubPage />} />
                <Route path="/translate" element={<TranslateHubPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/personalization" element={<PersonalizationPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/settings" element={<WorkspaceSettingsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/:id" element={<DocumentDetailPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/compliance" element={<AdminCompliancePage />} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
