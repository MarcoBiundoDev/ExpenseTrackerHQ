 Smart Expense Tracker — Project Overview

📌 Purpose

Smart Expense Tracker is a cloud-native, production-grade portfolio project designed to showcase modern backend engineering, DevOps, and Azure platform skills.
The goal is to build an enterprise-quality system demonstrating:
	•	Clean Architecture in .NET 8
	•	Containerization & local Kubernetes
	•	IaC with Terraform
	•	AKS deployment
	•	Azure SQL + APIM + Key Vault
	•	Full observability with OpenTelemetry
	•	Azure DevOps pipelines & automation
	•	Secure authentication with Azure AD B2C

This project mirrors the patterns used in large-scale companies and is designed to be a centerpiece portfolio piece for senior developer or cloud engineering roles.

⸻

🗺️ High-Level Architecture

The system will eventually include:
	•	Backend API (ASP.NET Core 8 Web API, Clean Architecture)
	•	React Frontend (TypeScript + MSAL for B2C login)
	•	Azure SQL Database
	•	Containers (Docker) and Local Kubernetes (Minikube/Docker Desktop)
	•	Azure Kubernetes Service (AKS)
	•	API Management (APIM)
	•	Key Vault + Managed Identity
	•	Terraform IaC
	•	OpenTelemetry + Application Insights
	•	Azure DevOps CI/CD pipelines

⸻

📦 Core Functional Scope

The eventual full application will support:

✔ Expense Tracking (CRUD)
	•	Add expenses
	•	Get all expenses for a user
	•	Categorize spending
	•	Summaries & filtering (date range, category)

✔ Authentication (later phase)
	•	Azure AD B2C authentication
	•	Secure API endpoints
	•	User isolation / multi-tenant mindset

✔ Observability
	•	Distributed tracing
	•	Structured logging
	•	Metrics
	•	Cloud dashboards

✔ Deployment Ready
	•	Full Docker Compose environment
	•	Helm charts for AKS
	•	Automated Azure DevOps pipelines

⸻

🧩 Project Roadmap (Phases)

This project is structured into 6 major phases, each with its own epics, features, stories, and tasks.

⸻

Phase 1 — Backend Foundations (CURRENT PHASE)

Goal: Build a Clean Architecture .NET 8 API running locally.

Includes:
	•	Clean Architecture (Domain → Application → Infrastructure → API)
	•	Light DDD patterns (entities, basic validation, mapping)
	•	EF Core async operations + repository pattern
	•	SQL Server integration (local)
	•	Storage via stored procedures
	•	Health checks & structured logging
	•	Full Docker Compose environment (API + SQL Server)

This phase sets the foundation for all future cloud-native work.

⸻

Phase 2 — Containerization & Local Kubernetes

Goal: Package backend into containers and deploy to a local K8s cluster.

Includes:
	•	Dockerfile (multi-stage)
	•	Kubernetes manifests or Helm charts
	•	Deployments, Services, Secrets, ConfigMaps
	•	Local dev namespace
	•	Ingress routing

⸻

Phase 3 — Azure Infrastructure & AKS

Goal: Deploy API to Azure Kubernetes Service using Terraform.

Includes:
	•	Terraform modules for:
	•	VNet, Subnets
	•	AKS Cluster
	•	ACR
	•	Azure SQL
	•	Storage for Terraform state
	•	Deploy backend container images to AKS
	•	Secure connections & networking

⸻

Phase 4 — Security, Identity & API Management

Goal: Add modern cloud security layers.

Includes:
	•	Azure AD B2C for authentication
	•	APIM for API protection and routing
	•	Key Vault + Managed Identity
	•	No plaintext secrets
	•	JWT-protected API endpoints

⸻

Phase 5 — Observability & Reliability

Goal: Full enterprise-grade observability pipeline.

Includes:
	•	OpenTelemetry for distributed traces
	•	Metrics, logs, correlation
	•	Application Insights integration
	•	Dashboards and alerting
	•	K8s cluster logs & metrics

⸻

Phase 6 — Frontend & User Experience

Goal: Build a production-grade React frontend.

Includes:
	•	React + TS + Vite
	•	MSAL integration for B2C login
	•	Expense UI
	•	Backend calls via Axios
	•	Basic dashboards/graphs
