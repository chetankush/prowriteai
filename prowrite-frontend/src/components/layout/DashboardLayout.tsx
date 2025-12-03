import * as React from "react"
import { NavLink, Outlet } from "react-router-dom"
import { 
  Mail, 
  Globe, 
  Youtube, 
  FileText, 
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
  Code,
  AlertTriangle,
  Languages
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: "/cold-email", label: "Cold Email", icon: <Mail className="h-5 w-5" /> },
  // TODO: Expand later - commenting out for MVP focus
  // { path: "/website-copy", label: "Website Copy", icon: <Globe className="h-5 w-5" /> },
  // { path: "/youtube-scripts", label: "YouTube Scripts", icon: <Youtube className="h-5 w-5" /> },
  // { path: "/hr-docs", label: "HR Docs", icon: <FileText className="h-5 w-5" /> },
  // { path: "/software-docs", label: "Software Docs", icon: <Code className="h-5 w-5" /> },
  // { path: "/incident-hub", label: "Incident Hub", icon: <AlertTriangle className="h-5 w-5" /> },
  { path: "/translate", label: "Translate", icon: <Languages className="h-5 w-5" /> },
  { path: "/assets", label: "Asset Library", icon: <FolderOpen className="h-5 w-5" /> },
  { path: "/approvals", label: "Approvals", icon: <CheckSquare className="h-5 w-5" /> },
  { path: "/personalization", label: "Mail Merge", icon: <Variable className="h-5 w-5" /> },
  { path: "/team", label: "Team", icon: <Users className="h-5 w-5" /> },
  { path: "/billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
  { path: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
]

/**
 * DashboardLayout component with collapsible sidebar navigation
 * Requirements: 11.1, 11.2, 11.4, 11.5
 */
export function DashboardLayout() {
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)


  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo/Brand */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground">ProWrite AI</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className={cn(
          "border-t border-border p-4",
          isCollapsed ? "flex flex-col items-center space-y-2" : ""
        )}>
          {isCollapsed ? (
            <>
              <Tooltip content={user?.email || "User"} side="right">
                <div className="p-2 rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              </Tooltip>
              <Tooltip content="Logout" side="right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email || "User"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>
      </aside>


      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <span className="font-bold text-lg text-foreground">ProWrite AI</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Logo */}
        <div className="h-16 flex items-center justify-between border-b border-border px-4">
          <span className="font-bold text-lg text-foreground">ProWrite AI</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.path}
              item={item}
              onClick={toggleMobileMenu}
            />
          ))}
        </nav>

        {/* Mobile User Info & Logout */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email || "User"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


/**
 * Desktop navigation item with tooltip support for collapsed state
 */
function NavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const linkContent = (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isCollapsed ? "justify-center" : ""
        )
      }
    >
      {item.icon}
      {!isCollapsed && <span className="ml-3">{item.label}</span>}
    </NavLink>
  )

  if (isCollapsed) {
    return (
      <Tooltip content={item.label} side="right">
        {linkContent}
      </Tooltip>
    )
  }

  return linkContent
}

/**
 * Mobile navigation item that closes menu on click
 */
function MobileNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {item.icon}
      <span className="ml-3">{item.label}</span>
    </NavLink>
  )
}

export default DashboardLayout
