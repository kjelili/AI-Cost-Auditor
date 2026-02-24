import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../shared/lib/cn";

type LayoutProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin", label: "Admin", icon: Settings },
] as const;

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = user?.is_admin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.path !== "/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav
        className="sticky top-0 z-50 border-b border-gray-200 bg-white"
        aria-label="Main"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link
                to="/dashboard"
                className="flex items-center text-fluid-xl font-bold text-primary-600 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
              >
                AI Cost Auditor
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center gap-2 rounded-lg border-b-2 px-3 py-2 text-fluid-sm font-medium transition-colors touch-manipulation",
                        isActive
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-4">
              <span className="text-fluid-sm text-gray-700" aria-hidden>
                {user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "inline-flex min-h-[2.75rem] items-center gap-2 rounded-lg border border-transparent px-4 py-2 text-fluid-sm font-medium text-gray-700",
                  "hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 touch-manipulation",
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Logout
              </button>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className={cn(
                  "inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-lg text-gray-500",
                  "hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 touch-manipulation",
                )}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t border-gray-200 sm:hidden">
            <div className="space-y-1 px-2 py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-[3rem] items-center gap-3 rounded-lg border-l-4 py-3 pl-4 pr-3 text-fluid-base font-medium transition-colors touch-manipulation",
                      isActive
                        ? "border-primary-500 bg-primary-50 text-primary-800"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <p className="text-fluid-sm font-medium text-gray-900">{user?.email}</p>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className={cn(
                  "mt-2 flex min-h-[3rem] w-full items-center gap-3 rounded-lg py-3 pl-4 pr-3 text-left text-fluid-base font-medium text-gray-600",
                  "hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 touch-manipulation",
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" aria-hidden />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
