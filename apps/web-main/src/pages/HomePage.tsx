import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "@/auth/msalConfig";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/layout/AppHeader";
import profileImage from "@/assets/marco.jpg";

export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex h-full flex-col lg:col-span-7">
            <div className="flex-grow space-y-5">
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Montera
                  <span className="text-muted-foreground"> Expense Tracker</span>
                </h1>

                <p className="max-w-prose text-base text-muted-foreground sm:text-lg">
                  A production-minded frontend for an end-to-end cloud-native system.
                  Built to showcase real-world architecture: secure identity, API
                  gateway, private networking, observability, and modern CI/CD.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React + TypeScript</Badge>
                <Badge variant="secondary">shadcn/ui</Badge>
                <Badge variant="secondary">MSAL + Entra External ID</Badge>
                <Badge variant="secondary">APIM</Badge>
                <Badge variant="secondary">AKS</Badge>
                <Badge variant="secondary">Terraform</Badge>
                <Badge variant="secondary">Helm</Badge>
                <Badge variant="secondary">OpenTelemetry</Badge>
                <Badge variant="secondary">Azure SQL + Private Endpoints</Badge>
              </div>

              {/* Primary actions only */}
              <div className="flex flex-col gap-3 sm:flex-row">
                {!isAuthenticated && (
                  <>
                    <Button
                      className="sm:w-auto"
                      onClick={() => instance.loginRedirect(loginRequest)}
                    >
                      Sign In
                    </Button>

                    <Button
                      variant="secondary"
                      className="sm:w-auto"
                      onClick={() =>
                        instance.loginRedirect({
                          ...loginRequest,
                          prompt: "create",
                        })
                      }
                    >
                      Sign Up
                    </Button>
                  </>
                )}

                {isAuthenticated && (
                  <Button
                    className="sm:w-auto"
                    onClick={() => navigate("/expenses")}
                  >
                    Go to your Expenses
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Note: this project focuses on cloud-native execution and
                  engineering discipline (security by default, deterministic
                  deployments, and production-grade telemetry). The UI is
                  intentionally clean and fast.
                </p>

                <p className="text-sm text-muted-foreground pb-4">
                  Contact:{" "}
                  <a
                    href="mailto:marcojbiundo@gmail.com"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    marcojbiundo@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <Card className="mt-8">
              <CardHeader className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <img
                  src={profileImage}
                  alt="Marco Biundo"
                  className="h-20 w-20 rounded-full object-cover border border-border"
                />
                <div>
                  <CardTitle className="text-base">Developer Links</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Project source, professional profile, and demos
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 pt-2 sm:grid-cols-3">
                <Button asChild variant="secondary" className="justify-start">
                  <a
                    href="https://github.com/MarcoBiundoDev/ExpenseTrackerHQ"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub Repo
                  </a>
                </Button>

                <Button asChild variant="secondary" className="justify-start">
                  <a
                    href="https://www.linkedin.com/in/marcobiundo/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                </Button>

                <Button asChild variant="secondary" className="justify-start">
                  <a
                    href="https://www.youtube.com/@MarcoBiundoDev"
                    target="_blank"
                    rel="noreferrer"
                  >
                    YouTube
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="h-full lg:col-span-5">
            <Card className="h-full lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">What this demonstrates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">Secure auth</div>
                  <div>
                    SPA sign-in with Entra External ID, token acquisition, and
                    protected routes.
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="font-medium text-foreground">API gateway</div>
                  <div>
                    Requests flow through Azure API Management to a
                    Kubernetes-backed API.
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    Private networking
                  </div>
                  <div>
                    Private endpoints and private DNS patterns to avoid public
                    exposure of core services.
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    Observability
                  </div>
                  <div>
                    End-to-end traces and metrics wired with OpenTelemetry and
                    Azure Monitor.
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="font-medium text-foreground">Deterministic delivery</div>
                  <div>
                    Dockerized workloads, IaC with Terraform, and Helm-based
                    deployments for repeatable environments.
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="font-medium text-foreground">Data layer security</div>
                  <div>
                    Azure SQL secured with private endpoints and identity-based access patterns, no secrets exposed in the frontend.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}