# Promptly

Promptly is a web application designed to facilitate the management, versioning, and A/B testing of prompts used with Large Language Models (LLMs). It enables users to create, modify, and track the performance of prompts without directly altering the underlying code.

## Features

- **Prompt Creation**: A user-friendly interface for creating new prompts with rich text formatting and variable insertion.
- **Dashboard**: A comprehensive dashboard displaying all created prompts with key metrics.
- **Prompt Versioning**: A versioning system that allows users to create and manage multiple versions of a prompt.
- **A/B Testing**: Integrated A/B testing capabilities to compare the performance of different prompt versions.
- **Integration**: A mechanism for developers to integrate prompts into their applications via variables or URLs.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/promptly.git
   cd promptly
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Creating a Prompt

1. Navigate to the "Prompts" page.
2. Click on the "New Prompt" button.
3. Fill in the prompt details, including name, description, and content.
4. Use the `{{variable}}` syntax to define variables in your prompt.
5. Click "Create Prompt" to save.

### Creating Versions

1. Navigate to a prompt's detail page.
2. Click on the "Versions" tab.
3. Click on the "New Version" button.
4. Fill in the version details, including name and content.
5. Click "Create Version" to save.

### Setting Up A/B Tests

1. Navigate to the "A/B Testing" page.
2. Click on the "New A/B Test" button.
3. Select a prompt and at least two versions to compare.
4. Define the traffic distribution between versions.
5. Set up metrics to track.
6. Click "Create A/B Test" to start the test.

### Integrating Prompts

1. Navigate to the "Integration" page to see code examples.
2. Use the provided API endpoints to fetch prompts in your application.
3. For A/B testing, use the `abTest=true` query parameter.
4. Record metrics using the POST endpoint.

## DOCS

### Introduction

Promptly is a powerful prompt management system designed for developers and teams working with Large Language Models (LLMs). It provides a centralized platform for creating, versioning, testing, and optimizing prompts used in AI applications.

Key benefits of integrating Promptly into your development workflow:

- **Decoupled Prompt Management**: Separate prompt content from application code, allowing non-technical team members to refine prompts without code changes.
- **Versioning and History**: Track changes to prompts over time with a complete version history.
- **A/B Testing Framework**: Scientifically test different prompt variations to identify the most effective approaches.
- **Performance Metrics**: Collect and analyze prompt performance data to make data-driven improvements.
- **Collaborative Workflow**: Enable teams to collaborate on prompt development with a shared repository.

Promptly is built with a modern tech stack including Next.js, React, Prisma, and PostgreSQL, providing a robust foundation for enterprise applications.

### Getting Started

#### Installation in Your Project

To integrate Promptly with your existing application:

1. **Install the Promptly client library**:
   ```bash
   npm install @promptly/client
   # or
   yarn add @promptly/client
   ```

2. **Configure the client**:
   ```javascript
   import { PromptlyClient } from '@promptly/client';

   const promptly = new PromptlyClient({
     apiUrl: 'https://your-promptly-instance.com/api',
     apiKey: 'your-api-key',
   });
   ```

3. **Fetch and use prompts in your application**:
   ```javascript
   // Basic prompt fetching
   const prompt = await promptly.getPrompt('prompt-id');
   
   // With variable substitution
   const filledPrompt = await promptly.getPrompt('prompt-id', {
     variables: {
       userName: 'John',
       topic: 'machine learning',
     }
   });
   
   // With A/B testing enabled
   const testPrompt = await promptly.getPrompt('prompt-id', {
     abTest: true,
   });
   ```

4. **Record metrics for A/B testing**:
   ```javascript
   await promptly.recordMetric({
     promptId: 'prompt-id',
     versionId: 'version-id', // Returned from getPrompt with abTest: true
     metricName: 'user_satisfaction',
     value: 4.5,
   });
   ```

### Components

Promptly consists of several key components that work together to provide a complete prompt management solution:

#### 1. Prompt Repository

The core storage system for prompts, providing:
- CRUD operations for prompts
- Metadata management (tags, descriptions, usage statistics)
- Search and filtering capabilities

#### 2. Version Control System

Tracks changes to prompts over time:
- Complete version history for each prompt
- Ability to revert to previous versions
- Comparison between versions
- Branching for experimental prompt development

#### 3. A/B Testing Framework

Scientific testing infrastructure for prompt optimization:
- Create tests with multiple prompt versions
- Configure traffic distribution between versions
- Define custom metrics for evaluation
- Statistical analysis of results

#### 4. API Layer

RESTful API for integrating with your applications:
- Secure authentication and authorization
- Rate limiting and usage tracking
- Webhook support for event notifications
- SDKs for popular programming languages

#### 5. Web Interface

User-friendly dashboard for managing prompts:
- Rich text editor with syntax highlighting
- Real-time collaboration features
- Analytics dashboards
- User and team management

### API Reference

#### Authentication

All API requests require authentication using an API key:

```
Authorization: Bearer your-api-key
```

API keys can be generated in the Promptly dashboard under Settings > API Keys.

#### Endpoints

##### Prompts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prompts` | GET | List all prompts |
| `/api/prompts` | POST | Create a new prompt |
| `/api/prompts/:id` | GET | Get a specific prompt |
| `/api/prompts/:id` | PUT | Update a prompt |
| `/api/prompts/:id` | DELETE | Delete a prompt |

**Example Request:**
```javascript
// Fetch a prompt with A/B testing
fetch('/api/prompts/bb1219c0-ad89-4fdb-9040-c5665d2fba0c?abTest=true', {
  headers: {
    'Authorization': 'Bearer your-api-key'
  }
})
```

**Example Response:**
```json
{
  "content": "Write a blog post about {{topic}} that is engaging and informative.",
  "variables": ["topic"],
  "versionId": "v-12345",
  "isAbTest": true,
  "testId": "test-6789"
}
```

##### Versions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prompts/:id/versions` | GET | List all versions of a prompt |
| `/api/prompts/:id/versions` | POST | Create a new version |
| `/api/prompts/:id/versions/:versionId` | GET | Get a specific version |
| `/api/prompts/:id/versions/:versionId` | PUT | Update a version |
| `/api/prompts/:id/versions/:versionId` | DELETE | Delete a version |

**Example Request:**
```javascript
// Create a new version
fetch('/api/prompts/bb1219c0-ad89-4fdb-9040-c5665d2fba0c/versions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    name: 'Improved clarity',
    content: 'Write a comprehensive blog post about {{topic}} that is both engaging and informative for a general audience.',
    variables: ['topic'],
    isActive: false
  })
})
```

##### A/B Tests

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/a-b-tests` | GET | List all A/B tests |
| `/api/a-b-tests` | POST | Create a new A/B test |
| `/api/a-b-tests/:id` | GET | Get a specific A/B test |
| `/api/a-b-tests/:id` | PUT | Update an A/B test |
| `/api/a-b-tests/:id` | PATCH | Update test status |
| `/api/a-b-tests/:id/delete` | POST | Delete an A/B test |

**Example Request:**
```javascript
// Create a new A/B test
fetch('/api/a-b-tests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    name: 'Blog Post Tone Test',
    description: 'Testing formal vs casual tone',
    promptId: 'bb1219c0-ad89-4fdb-9040-c5665d2fba0c',
    versionIds: ['v-12345', 'v-67890'],
    weights: [0.5, 0.5],
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-06-30T23:59:59Z',
    isActive: true,
    metrics: ['completion_rate', 'user_satisfaction']
  })
})
```

##### Metrics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/metrics` | POST | Record a metric for an A/B test |
| `/api/metrics/:testId` | GET | Get metrics for an A/B test |

**Example Request:**
```javascript
// Record a metric
fetch('/api/metrics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    testId: 'test-6789',
    versionId: 'v-12345',
    metricName: 'user_satisfaction',
    value: 4.5
  })
})
```

#### Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON body with details:

```json
{
  "error": "Resource not found",
  "details": "Prompt with ID 'invalid-id' does not exist"
}
```

## Current Limitations

- The application currently uses localStorage for data persistence, which means:
  - Data is stored only in the browser and will be lost if the browser storage is cleared.
  - There is no user authentication or multi-user support.
  - The API endpoints return mock data on the server side.

## Future Improvements

- Add a database for persistent storage.
- Implement user authentication and authorization.
- Add more advanced analytics for A/B testing results.
- Support for more complex prompt structures and templates.
- Add export/import functionality for prompts and versions.

## Authentication Setup

This project uses NextAuth.js for authentication with the following features:

- Email/password authentication
- OAuth providers (GitHub, Google)
- Session management
- User registration

### Setup Instructions

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Update the `.env` file with your database connection string:

```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

3. Generate a NextAuth.js secret:

```bash
openssl rand -base64 32
```

4. Update the `.env` file with your NextAuth.js secret:

```
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. (Optional) Add OAuth provider credentials:

```
# GitHub
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# Google
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"
```

6. Run the database migrations:

```bash
npx prisma migrate dev
```

7. Start the development server:

```bash
npm run dev
```

### Authentication Flow

1. Users can register with email/password or sign in with OAuth providers
2. Passwords are securely hashed using bcrypt
3. Sessions are managed using JWT strategy
4. User data is stored in the PostgreSQL database

## License

This project is licensed under the MIT License - see the LICENSE file for details.
