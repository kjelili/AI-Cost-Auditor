# API Reference

## Base URL

- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /api/auth/token

Login and get access token.

**Request:**
```
Content-Type: multipart/form-data

username: admin@local
password: admin123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET /api/auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@local",
  "full_name": "Admin User",
  "is_admin": true
}
```

### Proxy Endpoints

#### POST /proxy/openai/v1/chat/completions

Proxy OpenAI chat completions.

**Headers:**
```
X-Virtual-Key: vk_xxx
Authorization: Bearer <token> (optional, for logging user)
```

**Request Body:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response:**
Standard OpenAI API response with usage information.

#### POST /proxy/anthropic/v1/messages

Proxy Anthropic messages.

**Headers:**
```
X-Virtual-Key: vk_xxx
Authorization: Bearer <token> (optional)
```

**Request Body:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

**Response:**
Standard Anthropic API response with usage information.

### Metrics

#### GET /api/metrics/overview

Get comprehensive metrics overview.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cost": {
    "spend_today": 12.50,
    "spend_mtd": 450.75,
    "spend_ytd": 1250.00,
    "forecasted_month_end": 1350.00,
    "total_requests": 1250,
    "total_tokens": 1250000
  },
  "top_users": [
    {
      "user_email": "user@example.com",
      "total_cost": 250.50,
      "request_count": 500
    }
  ],
  "top_projects": [
    {
      "project_name": "AI Chatbot",
      "total_cost": 300.00,
      "request_count": 600
    }
  ],
  "waste": {
    "repeated_prompts_count": 45,
    "estimated_waste": 25.50,
    "top_repeated_hashes": [
      {
        "hash": "abc123...",
        "count": 10,
        "estimated_waste": 5.00
      }
    ]
  }
}
```

### Admin

#### POST /api/admin/virtual-keys

Create a new virtual key.

**Headers:**
```
Authorization: Bearer <token> (admin required)
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "user_email": "user@example.com",
  "cost_centre": "Engineering",
  "environment": "prod",
  "agent_name": "HR Bot",
  "monthly_budget_cap": 1000.00,
  "max_tokens_per_request": 10000,
  "max_reasoning_tokens": 2000
}
```

**Response:**
```json
{
  "id": 1,
  "key": "vk_abc123...",
  "name": "Production API Key",
  "user_email": "user@example.com",
  "monthly_budget_cap": 1000.00,
  "is_active": true,
  "created_at": "2025-01-15T00:00:00Z"
}
```

#### GET /api/admin/virtual-keys

List all virtual keys.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
Array of virtual key objects.

#### GET /api/admin/virtual-keys/{id}

Get a specific virtual key.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
Virtual key object.

#### GET /api/admin/usage-events

List usage events.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of events to return (default: 100)
- `virtual_key_id` (optional): Filter by virtual key ID

**Response:**
Array of usage event objects.

### Health & Metrics

#### GET /healthz

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

#### GET /metrics

Prometheus metrics endpoint.

**Response:**
Prometheus metrics format.

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message"
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently not implemented. Planned for future releases.

## Webhooks

Not yet implemented. Planned for future releases.
