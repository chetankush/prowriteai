import * as React from "react"
import { NavLink, Outlet } from "react-router-dom"
import { 
  Mail, 
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  CreditCard,
  Users,
  FolderOpen,
  CheckSquare,
  Variable,
  Languages,
  Sparkles,
  FileText,
  FileCheck,
  UserCheck,
  Shield,
  Globe,
  Video,
  Code
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggleButton } from "@/components/ThemeToggle"
import { getOnboardingUseCases } from "@/pages/Onboarding"

const USE_CASE_TO_PATH: Record<string, string> = {
  cold_email: '/cold-email',
  hr_docs: '/hr-docs',
  translation: '/translate',
  bulk: '/personalization',
  website_copy: '/website-copy',
  youtube_scripts: '/youtube-scripts',
  software_docs: '/software-docs',
  incident: '/incident-hub',
}

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  badge?: string
}

const mainNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: "/documents", label: "Documents", icon: <FileCheck className="h-5 w-5" /> },
  { path: "/cold-email", label: "Cold Email", icon: <Mail className="h-5 w-5" /> },
  { path: "/hr-docs", label: "HR Docs", icon: <UserCheck className="h-5 w-5" /> },
  { path: "/translate", label: "Translate", icon: <Languages className="h-5 w-5" /> },
]

const workspaceNavItems: NavItem[] = [
  { path: "/assets", label: "Asset Library", icon: <FolderOpen className="h-5 w-5" /> },
  { path: "/approvals", label: "Approvals", icon: <CheckSquare className="h-5 w-5" /> },
  { path: "/personalization", label: "Mail Merge", icon: <Variable className="h-5 w-5" /> },
]

const adminNavItems: NavItem[] = [
  { path: "/admin", label: "Admin Dashboard", icon: <Shield className="h-5 w-5" /> },
  { path: "/admin/compliance", label: "Compliance", icon: <FileText className="h-5 w-5" /> },
]

const settingsNavItems: NavItem[] = [
  { path: "/team", label: "Team", icon: <Users className="h-5 w-5" /> },
  { path: "/billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
  { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const highlightedPaths = React.useMemo(() => {
    const useCases = getOnboardingUseCases()
    const paths = new Set<string>()
    for (const uc of useCases) {
      const path = USE_CASE_TO_PATH[uc]
      if (path) paths.add(path)
    }
    return paths
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 h-screen sticky top-0",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border/50 px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">ProWrite</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", isCollapsed && "hidden")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
          {/* Main */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Main
              </span>
            )}
            <div className="space-y-0.5 mt-2">
              {mainNavItems.map((item) => (
                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>

          {/* Workspace */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Workspace
              </span>
            )}
            <div className="space-y-0.5 mt-2">
              {workspaceNavItems.map((item) => (
                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>

          {/* Admin */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </span>
            )}
            <div className="space-y-0.5 mt-2">
              {adminNavItems.map((item) => (
                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Settings
              </span>
            )}
            <div className="space-y-0.5 mt-2">
              {settingsNavItems.map((item) => (
                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>
        </nav>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <div className="px-2 py-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-full h-9 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Theme Toggle & User */}
        <div className={cn(
          "border-t border-border/50 p-3",
          isCollapsed ? "flex flex-col items-center space-y-2" : "space-y-3"
        )}>
          {isCollapsed ? (
            <>
              <Tooltip content="Toggle theme" side="right">
                <div><ThemeToggleButton /></div>
              </Tooltip>
              <Tooltip content={user?.email || "User"} side="right">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-violet-400" />
                </div>
              </Tooltip>
              <Tooltip content="Logout" side="right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggleButton />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email?.split('@')[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">ProWrite</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggleButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-9 w-9"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-72 bg-card border-r border-border/50 z-50 transform transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-14 flex items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">ProWrite</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Main</span>
            <div className="space-y-0.5 mt-2">
              {mainNavItems.map((item) => (
                <MobileNavItem key={item.path} item={item} onClick={toggleMobileMenu} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Workspace</span>
            <div className="space-y-0.5 mt-2">
              {workspaceNavItems.map((item) => (
                <MobileNavItem key={item.path} item={item} onClick={toggleMobileMenu} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</span>
            <div className="space-y-0.5 mt-2">
              {adminNavItems.map((item) => (
                <MobileNavItem key={item.path} item={item} onClick={toggleMobileMenu} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Settings</span>
            <div className="space-y-0.5 mt-2">
              {settingsNavItems.map((item) => (
                <MobileNavItem key={item.path} item={item} onClick={toggleMobileMenu} isHighlighted={highlightedPaths.has(item.path)} />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <User className="h-4 w-4 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email?.split('@')[0] || "User"}</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="md:hidden h-14 shrink-0" />
        <div className="flex-1 min-h-0 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({ item, isCollapsed, isHighlighted }: { item: NavItem; isCollapsed: boolean; isHighlighted: boolean }) {
  const linkContent = (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
          isCollapsed ? "justify-center" : ""
        )
      }
    >
      <span className="relative">
        {item.icon}
        {isHighlighted && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-background" />
        )}
      </span>
      {!isCollapsed && <span className="ml-3">{item.label}</span>}
    </NavLink>
  )

  if (isCollapsed) {
    return <Tooltip content={item.label} side="right">{linkContent}</Tooltip>
  }
  return linkContent
}

function MobileNavItem({ item, onClick, isHighlighted }: { item: NavItem; onClick: () => void; isHighlighted: boolean }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
        )
      }
    >
      <span className="relative">
        {item.icon}
        {isHighlighted && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 ring-1 ring-background" />
        )}
      </span>
      <span className="ml-3">{item.label}</span>
    </NavLink>
  )
}

export default DashboardLayout
