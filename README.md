# ExpenseTrackerHQ



🎥 Architecture Overview

[![Architecture Overview Video](https://img.youtube.com/vi/EKfLfc6lGG8/0.jpg)](https://www.youtube.com/watch?v=EKfLfc6lGG8)

**ExpenseTrackerHQ** is a cloud-native, production-style expense tracking platform built as a **portfolio-grade system** to demonstrate modern backend development, Kubernetes deployment, and Azure infrastructure using Infrastructure as Code.

This repository intentionally mirrors how real-world teams structure and operate cloud platforms — it is **not** a toy project.

---

## Why This Project Exists 

ExpenseTrackerHQ was built to **demonstrate senior-level, real-world engineering capability**, not to showcase a single framework or tutorial outcome.

The goal was to design and build an **end-to-end, cloud-native system** the way it would be done inside a professional engineering organization—working backward from production expectations rather than forward from examples.

This project intentionally focuses on:
- System design and architectural decision-making
- Production-oriented defaults (security, networking, observability)
- Infrastructure-as-Code and repeatable deployments
- CI/CD pipelines that mirror real enterprise workflows
- Clear separation of concerns across backend, frontend, and platform layers

Every major decision—from Clean Architecture in the API, to Kubernetes + Helm deployments, to Azure-native identity and networking—was made to reflect **how modern teams actually build, ship, and operate software at scale**.

This repository exists as a **portfolio-grade reference** that demonstrates depth, not just breadth.

## Project Goals

This project is designed to showcase:

- Clean, maintainable backend clean architecture (.NET 8)
- Containerized local development with Docker
- Kubernetes fundamentals (local + cloud - AKS)
- Helm-based application deployment
- Azure infrastructure provisioning using Terraform
- Secure cloud patterns (private networking, managed identity)
- A scalable monorepo layout suitable for multi-service systems

---

## High-Level Architecture

ExpenseTrackerHQ consists of the following layers:

### Backend API
- .NET 8 Web API
- Clean Architecture (Domain / Application / Infrastructure / API)
- CQRS-ready design
- Containerized for Docker and Kubernetes

### Frontend Applications
- Multiple React clients
- One primary hand-built UI
- Additional AI-generated UI variants for comparison and experimentation

### Platform & Infrastructure
- Docker & Docker Compose (local dev)
- Kubernetes (Minikube locally, AKS in Azure)
- Helm for application deployment
- Terraform for Azure infrastructure (AKS, ACR, SQL, networking)

### Cloud Provider
- Microsoft Azure
- Azure Kubernetes Service (AKS)
- Azure Container Registry (ACR)
- Azure SQL with Private Endpoints
- Managed Identity for authentication

---

## Repository Structure (Monorepo)

```text
ExpenseTrackerHQ/
├── apps/
│   ├── api/                 # .NET backend (ExpenseTracker.Api, Domain, Infra)
│   ├── Migrations/          # Migration Runner Project/Helm Job Source
│   └── web-main/            # React frontend
│  
│  
├── docs/
│   ├── Mermaid Charts/               # Architecture diagrams & explanations
│   ├── Phase-1- Backend/             # Notes & Sprint Walkthroughs
│   ├── Phase-2- K8s Helm/            # Notes & Sprint Walkthroughs
│   ├── Phase-3- Azure Infra/         # Notes & Sprint Walkthroughs
│   ├── Phase-4- Security & Identity/ # Notes & Sprint Walkthroughs
│   ├── Phase-5- Observability/       # Notes & Sprint Walkthroughs
│   └── Phase-6- Frontend & CICD/     # Notes & Sprint Walkthroughs
│
├── infra/
│   ├── helm/                # Helm charts for Kubernetes deployments
│   ├── k8s/                 # Optional raw Kubernetes manifests (local testing)
│   └── terraform/           # Azure IaC (AKS, ACR, SQL, networking, Observability)
│
├── ops/
│   ├── postman/             # Postman collections for API testing
│   └── sql/                 # SQL scripts, stored procedures, seed data
│
├── pipeline/                # CICD YAML Pipelines
│

└── README.md
