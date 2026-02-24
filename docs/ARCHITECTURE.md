# Architecture Documentation

## System Overview

AI Cost Auditor is a secure LLM proxy + financial intelligence layer that sits between applications and LLM providers (OpenAI, Anthropic, etc.). It transforms raw token usage into cost attribution, behavioral insights, budget enforcement, waste detection, and executive-level reporting.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications / Agents                     │
│              (Using SDKs or Direct API Calls)                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ X-Virtual-Key: vk_xxx
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Cost Auditor (Proxy Gateway)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Control Plane (Governance & Reporting)              │   │
│  │  - Admin UI                                          │   │
│  │  - Virtual Key Management                            │   │
│  │  - Policy Configuration                              │   │
│  │  - Dashboards & Reporting                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Plane (LLM Proxy / Enforcement)                │   │
│  │  - Request Validation                                │   │
│  │  - Policy Enforcement                                │   │
│  │  - Usage Extraction                                  │   │
│  │  - Audit Logging                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Forwards to upstream providers
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         LLM Providers (OpenAI / Anthropic / etc.)           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Response with token usage
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              AI Cost Auditor (Processing)                    │
│  - Extract token usage                                      │
│  - Calculate costs                                          │
│  - Hash prompts for waste detection                         │
│  - Log usage events                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Writes UsageEvent
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - Organizations, Teams, Projects                           │
│  - Users                                                    │
│  - Virtual Keys                                             │
│  - Usage Events (immutable audit log)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Queries for metrics
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              React Dashboard (Frontend)                      │
│  - Cost overview                                            │
│  - Top users/projects                                       │
│  - Waste detection                                          │
│  - Admin panel                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Backend (FastAPI)

#### Core Components

1. **Main Application** (`app/main.py`)
   - FastAPI app initialization
   - CORS middleware
   - Router registration
   - Prometheus metrics endpoint

2. **Database Layer** (`app/database.py`)
   - SQLAlchemy engine and session management
   - Connection pooling

3. **Models** (`app/models.py`)
   - SQLAlchemy ORM models
   - Relationships and indexes

4. **Authentication** (`app/auth.py`)
   - JWT token generation and validation
   - Password hashing
   - User authentication and authorization

5. **Routers**
   - **Auth Router**: Login, token management
   - **Proxy Router**: LLM provider proxying
   - **Admin Router**: Virtual key and usage event management
   - **Metrics Router**: Analytics and reporting

6. **Utilities** (`app/utils.py`)
   - Cost calculation
   - Prompt hashing
   - Budget checking
   - Waste detection

### Frontend (React + TypeScript)

#### Core Components

1. **API Client** (`src/api/`)
   - Axios-based HTTP client
   - Auth token injection
   - Error handling

2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - Global auth state management
   - Login/logout functionality

3. **Pages**
   - Landing page (marketing)
   - Login page
   - Dashboard (metrics and charts)
   - Admin panel (virtual key management)

4. **Components**
   - Layout (navigation and structure)
   - Reusable UI components

### Database Schema

#### Core Tables

1. **organizations**: Top-level organizational units
2. **teams**: Teams within organizations
3. **projects**: Projects within teams/organizations
4. **users**: System users with authentication
5. **virtual_keys**: Attribution and policy containers
6. **usage_events**: Immutable audit log of all API calls

#### Key Relationships

- Organization → Teams → Projects
- VirtualKey → Team, Project, User
- UsageEvent → VirtualKey, User

## Data Flow

### Request Flow

1. Application sends request with `X-Virtual-Key` header
2. Proxy validates virtual key and checks budget limits
3. Request is forwarded to upstream LLM provider
4. Response is received with token usage
5. Costs are calculated based on provider/model pricing
6. Prompt is hashed for waste detection
7. UsageEvent is logged to database
8. Response is returned to application

### Metrics Flow

1. Dashboard requests metrics from API
2. API queries database for usage events
3. Aggregations are calculated (costs, top users, etc.)
4. Waste detection analyzes prompt hashes
5. Metrics are returned to dashboard
6. Charts and visualizations are rendered

## Security Model

### Virtual Keys

- Virtual keys are NOT upstream provider API keys
- They are internal identifiers for attribution
- Upstream keys are stored securely in environment variables
- Virtual keys can have budget caps and limits

### Authentication

- JWT tokens for API authentication
- Password hashing with bcrypt
- Role-based access control (admin vs regular users)
- Token expiration and refresh

### Data Privacy

- Minimal prompt data stored (hash + preview only)
- Configurable prompt preview length
- Optional redaction policies (future enhancement)
- Immutable audit logs for compliance

## Waste Detection

### Current Implementation

1. **Repeated Prompt Detection**
   - Hashes "dominant prompt fields" (messages + model)
   - Stores prompt_hash in UsageEvent
   - Dashboard calculates repeated occurrences
   - Estimates waste from duplicate prompts

### Future Enhancements

1. **Semantic Similarity**
   - Use embeddings to detect near-duplicates
   - MinHash for efficient similarity detection

2. **Context Window Bloat**
   - Track prompt size vs completion size
   - Detect unnecessary context growth

3. **Retry Loop Detection**
   - Same prompt hash repeatedly within short window
   - Alert on potential infinite loops

4. **Agent Runaway Detection**
   - High request rate + no successful outcomes
   - Automatic kill-switch for runaway agents

## Scalability Considerations

### Database

- Indexed queries for performance
- Partitioning usage_events by date (future)
- Read replicas for analytics (future)

### Proxy

- Async request handling
- Connection pooling
- Rate limiting per virtual key (future)
- Caching for policy lookups (Redis ready)

### Frontend

- Client-side caching
- Pagination for large datasets
- Lazy loading of components
- Optimistic UI updates

## Deployment Architecture

### Development

- Docker Compose for local development
- Hot reload for both frontend and backend
- Local PostgreSQL and Redis

### Production (Recommended)

- Separate containers for each service
- Load balancer for proxy gateway
- Database with backups and replication
- CDN for frontend assets
- Monitoring and logging (Prometheus, Grafana)

## Integration Points

### SDKs (Future)

- Python SDK
- JavaScript/TypeScript SDK
- Java SDK
- Drop-in OpenAI-compatible endpoint

### External Integrations (Future)

- Slack/Teams alerts
- Jira ticket creation
- Snowflake/BigQuery export
- AWS Cost Explorer-style CSVs
- Email notifications
