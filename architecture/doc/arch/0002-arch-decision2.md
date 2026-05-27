# Architecture Decision Record: 0002

## Title: Choice of Oracle Autonomous Database as Primary Data Store

### Status
Accepted

### Context
Reliable, high-performing, and scalable data management is required for handling bot user data, logs, analytic records, and configuration. Cloud-native management is a priority to reduce DevOps overhead. The data layer needs to support AI-driven capabilities and automated scaling.

### Decision
The Oracle Java Bot employs **Oracle Autonomous Database** (in Oracle Cloud Infrastructure) as its main, cloud SQL/AI-backed data storage. Autonomous DB is fully managed, scales on demand, includes built-in AI features, and is robust for real-time workloads.

### Consequences
- **Reduced Operational Overhead:** Automatic patching, scaling, and tuning.
- **Native AI Capabilities:** Enables richer analytics for bot improvement.
- **High Availability:** Managed failover and backup by Oracle.
- **Tight OCI Integration:** Simplifies deployment within broader Oracle ecosystem.
- **Vendor Lock-In Risk:** Committing to Oracle Cloud/DB may make future migration complex.

### Alternatives Considered
- AWS/RDS: Rejected to maintain one-cloud architecture and to leverage Oracle's AI DB features.
- Self-managed DB: Rejected due to operational complexity.

### Related Diagrams
See `../model.dsl` for data layer relationships.