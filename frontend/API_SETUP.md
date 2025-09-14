# API Integration Setup

This document explains how to set up and run the application with the API integration.

## Quick Start

### 1. Start the Mock API Server
```bash
npm run mock-server
```
This will start the mock API server on `http://localhost:3001`

### 2. Start the Frontend Development Server
```bash
npm run dev
```
This will start the Vite development server on `http://localhost:3000`

## API Endpoints

### GET /api/lessons
Returns a list of available lessons.

**Response:**
```json
[
  {
    "id": "water-cycle",
    "title": "The Water Cycle",
    "summary": "How water moves through Earth's systems."
  }
]
```

## Environment Configuration

The API base URL can be configured using the `REACT_APP_API_URL` environment variable. By default, it points to `http://localhost:3001`.

To use a different API server, create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://your-api-server.com
```

## Features

- **Loading States**: Shows a spinner while fetching lessons
- **Error Handling**: Displays error messages if the API call fails
- **Retry Functionality**: Users can retry failed API calls
- **Responsive Design**: Works on all device sizes

## Testing the API

You can test the API directly using curl:
```bash
curl http://localhost:3001/api/lessons
```

Or check the health endpoint:
```bash
curl http://localhost:3001/health
```
