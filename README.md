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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
