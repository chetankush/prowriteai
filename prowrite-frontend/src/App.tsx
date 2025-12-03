import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
  TranslateHubPage
} from '@/pages'
import { ProtectedRoute, DashboardLayout } from '@/components'

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

/**
 * Main App component with routing configuration
 * Requirements: 11.1, 11.2
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
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
          </Route>
          
          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
