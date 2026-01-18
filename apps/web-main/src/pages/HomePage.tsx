import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/layout/AppHeader";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="space-y-5 lg:col-span-7">
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
            </div>

            {/* Primary actions only */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:w-auto">
                       <Link to="/login">Sign In</Link>
              </Button>

      
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

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-base">Links</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
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
          </div>

          {/* Right column */}
          <div className="lg:col-span-5">
            <Card className="lg:sticky lg:top-6">
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
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  );
}