import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useIsAuthenticated, useMsal } from "@azure/msal-react";

type AppHeaderProps = {
  title?: string;
};

const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export function AppHeader({ title = "Montera" }: AppHeaderProps) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const userEmail = accounts?.[0]?.username;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/15 text-green-500">
              <Wallet className="h-5 w-5" />
            </div>
            <Link to="/" className="text-lg font-semibold tracking-tight">
              {title}
            </Link>
          </div>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/expenses">Expenses</Link>
            </Button>
          </nav>
        </div>

        {/* Right: User / Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && userEmail ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userEmail}
            </span>
          ) : null}

          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => instance.logoutRedirect()}
            >
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => instance.loginRedirect(loginRequest)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t sm:hidden">
        <nav className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-2">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link to="/expenses">Expenses</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}