# 📘 Phase 6 — Frontend & Experience (Sprint 6.1, 6.2, 6.3)
**ExpenseTrackerHQ**

---

## 1. Phase 6 Overview

Phase 6 completes the ExpenseTrackerHQ platform by delivering a **production-grade frontend**, integrated with:

- Entra ID (CIAM) authentication
- Secure token-based API access
- Azure API Management (APIM)
- Azure Static Web Apps (SWA)
- Azure DevOps CI/CD

The goal of this phase is **not visual novelty**, but:

> **A secure, maintainable, cloud-native frontend that behaves like a real enterprise system.**

---

## 2. Objectives of Phase 6

This phase demonstrates the ability to:

- Build a modern React application with clear structure
- Integrate enterprise authentication (Entra ID)
- Securely inject and forward access tokens
- Consume APIs via APIM
- Deploy frontend infrastructure via CI/CD
- Separate environment configuration from source code
- Operate independently of backend lifecycle (API up/down)

---

## 3. Technology Stack

### Frontend
- React (Vite)
- TypeScript
- React Router
- Axios
- MSAL (Microsoft Authentication Library)

### Azure Services
- Azure Entra ID (CIAM)
- Azure Static Web Apps
- Azure API Management
- Azure Kubernetes Service (AKS)
- Azure DevOps Pipelines

---

## 4. Repository Structure (Frontend)

```
apps/
└── web-main/
    ├── src/
    │   ├── app/
    │   │   ├── routes.tsx
    │   │   └── router.tsx
    │   ├── auth/
    │   │   └── msalConfig.ts
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── AppHeader.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   └── ExpensesPage.tsx
    │   ├── services/
    │   │   ├── apiClient.ts
    │   │   └── expenseApi.ts
    │   ├── main.tsx
    │   └── vite-env.d.ts
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── package-lock.json
```

---

## 5. Authentication Model (Happy Path)

### Identity Provider
- Azure Entra ID (CIAM tenant)

### Flow
1. User lands on frontend (SWA)
2. User clicks **Sign In**
3. MSAL performs redirect login
4. User authenticates with Entra ID
5. Entra ID redirects back to frontend
6. MSAL stores account + tokens in browser
7. Application renders authenticated state

---

## 6. MSAL Configuration

### `msalConfig.ts`

Defines:
- clientId
- authority
- redirectUri
- postLogoutRedirectUri

All values are sourced from **Vite environment variables**, not hardcoded.

---

## 7. Environment Configuration Strategy

### Local Development
- `.env.local` (gitignored)

### Source-Controlled Template
- `.env.example`

### Azure Static Web Apps
- Application settings configured in Azure Portal

---

## 8. Routing & Protected Pages

| Route | Access |
|-----|------|
| `/` | Public |
| `/expenses` | Authenticated only |

Protected routes are enforced via MSAL authentication state.

---

## 9. Navigation & Layout

The navigation header dynamically renders:
- Sign In / Sign Up when logged out
- User avatar + Logout when logged in
- Expenses link only when authenticated

---

## 10. Token Injection Strategy

Tokens are injected centrally via Axios interceptors.

### `apiClient.ts`
- Acquires token silently
- Attaches `Authorization: Bearer <token>`

No component manually handles tokens.

---

## 11. API Consumption Model

All frontend calls route through **Azure API Management**, never directly to AKS.

---

## 12. API Management Responsibilities

APIM enforces:
- JWT validation
- CORS
- Rate limiting
- Header normalization
- Security headers

---

## 13. Expense Page Behavior

- User ID derived from token `oid`
- User-scoped routes
- Full CRUD support

---

## 14. Static Web Apps Deployment

Frontend is deployed via Azure Static Web Apps for:
- Global CDN
- HTTPS by default
- Native Entra redirect support

---

## 15. Frontend CI/CD (Azure DevOps)

Pipeline:
1. Install Node
2. Build Vite app
3. Produce `dist/`
4. Deploy using SWA deployment token

---

## 16. Decoupling from Backend Lifecycle

Frontend remains online even when AKS is stopped.  
Functionality resumes automatically when backend is restored.

---

## 17. Why This Phase Matters

This phase proves the ability to:
- Ship a secure frontend
- Integrate enterprise identity
- Respect cloud security boundaries
- Deploy using CI/CD
- Operate like a production system

---

## 18. Final Phase 6 Outcome

✅ Secure frontend  
✅ Enterprise authentication  
✅ Token-based API access  
✅ APIM integration  
✅ CI/CD automation  
✅ Production-like behavior  

---

## 19. Closing Note

> *The frontend is intentionally boring — because boring systems scale.*

This phase prioritizes correctness, security, and maintainability over novelty.
