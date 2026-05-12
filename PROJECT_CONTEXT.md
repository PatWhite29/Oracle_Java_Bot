# PROJECT_CONTEXT

## Overview

This repository contains **Chuva Bot**, a task management system with:

- **Backend:** Spring Boot (REST API + Telegram Bot integration)
- **Frontend:** React web portal
- **Database:** Oracle
- **Deployment/Infra tooling:** Docker + Terraform + OCI scripts

---

## Architecture Summary

- Monolithic Spring Boot application under:
  - `/home/runner/work/Oracle_Java_Bot/Oracle_Java_Bot/MtdrSpring/backend`
- React frontend under:
  - `/home/runner/work/Oracle_Java_Bot/Oracle_Java_Bot/MtdrSpring/backend/src/main/frontend`
- Infrastructure as code under:
  - `/home/runner/work/Oracle_Java_Bot/Oracle_Java_Bot/MtdrSpring/terraform`

---

## OCI as Infrastructure and Database Platform

This project uses **OCI (Oracle Cloud Infrastructure)** for both:

1. **Infrastructure**
   - Networking (VCN, subnets, gateways)
   - Container platform (OKE / Kubernetes resources)
   - Object Storage and Container Repository
   - Terraform automation for provisioning

2. **Database (BD)**
   - Oracle Autonomous Database resources are provisioned in OCI
   - Wallet-based secure connectivity is supported in production flows

> In short: **OCI is the cloud foundation for infra and BD in this project.**

---

## Main Functional Domains

- Authentication and JWT security
- Project, member, sprint, and task management
- Task activity and audit logging
- KPI/dashboard endpoints
- Telegram bot commands and optional NLU routing
- Notification scheduling and delivery tracking

---

## CI/CD and Runtime

- GitHub Actions workflow for backend tests, frontend tests, and Docker build checks
- Docker Compose for local and production-oriented execution
- Additional OCI-oriented setup/deploy scripts in:
  - `/home/runner/work/Oracle_Java_Bot/Oracle_Java_Bot/MtdrSpring/utils`
  - `/home/runner/work/Oracle_Java_Bot/Oracle_Java_Bot/MtdrSpring/backend`

