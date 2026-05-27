# Architecture Decision Record: 0001

## Title: Selection of Layered Architecture with Oracle Autonomous Database

### Status
Accepted

### Context
The Oracle Java Bot project needs a scalable, maintainable, and cloud-ready architecture to support multi-channel interaction (web, Telegram), integration with Oracle Cloud Infrastructure (OCI), and advanced AI features. It must also reliably persist data and logs.

### Decision
We chose a **Layered Architecture** as the primary architectural style, leveraging the following layers:
- **Presentation Layer:** Web UI (JavaScript/HTML/CSS) and Telegram Adapter for user interactions.
- **Application/Service Layer:** Java-based application logic handling bot intelligence, orchestration, and integration.
- **Data Layer:** Oracle AI Autonomous Database (managed in OCI), storing persistent data such as users, logs, and conversational analytics.

All layers are deployed on Oracle Cloud Infrastructure for ease of scaling and integration. The Oracle Autonomous Database is used because it provides robust, auto-managed, highly available, and AI-powered data persistence.

### Consequences
- **Maintainability:** Clear logical boundaries allow independent layer evolution.
- **Scalability:** Presentation and app layers can scale horizontally; database scaling is managed by OCI.
- **Security & Compliance:** Controlled access between tiers; OCI and Oracle DB handle compliance needs.
- **Vendor Tie-In:** Strong coupling to Oracle ecosystem may limit future deployment options.

### Alternatives Considered
- Microservices: Rejected for initial phase due to increased complexity and overhead for a single-product solution.
- Monolithic: Not selected to avoid tightly coupled code and limited scalability/flexibility.

### Related Diagrams
See `../model.dsl` for graphical context.