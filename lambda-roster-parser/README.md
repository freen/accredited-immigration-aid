# Legal Resources Extractor

A serverless application that extracts structured data from the DOJ OLAP Recognized Organizations and Accredited Representatives roster PDF.

## Overview

This Lambda-based application automatically:

1. Downloads the latest DOJ OLAP R&A roster PDF
2. Extracts and structures the data using PDF parsing and GPT-4
3. Tracks and records changes between versions
4. Maintains a history of all changes for timeline visualization
5. Provides structured data for use in the legal resources mobile app

## Architecture

- **AWS Lambda**: Main processing engine
- **Amazon S3**: Data storage for current and archived versions
- **Amazon DynamoDB**: Change history tracking
- **CloudWatch Events**: Scheduled execution (daily)
- **OpenAI GPT-4**: Intelligent data extraction and structuring

## Setup Instructions

### Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate permissions
- Serverless Framework installed (`npm install -g serverless`)
- OpenAI API key

### Environment Setup

1. Create an SSM Parameter for your OpenAI API key:

```bash
aws ssm put-parameter --name "/legal-resources/openai-key" --value "your-api-key" --type "SecureString"
```

2. Install dependencies:

```bash
npm install
```

### Deployment

Deploy using Serverless Framework:

```bash
npm run deploy
```

For a specific stage (e.g., production):

```bash
npm run deploy -- --stage prod
```

### Local Development

Invoke the function locally:

```bash
npm run invoke-local
```

With debug output:

```bash
npm run invoke-local -- --debug true
```

## Change Detection

The system records three types of changes:

- **Added**: New organizations that weren't in the previous version
- **Modified**: Organizations with updated information
- **Removed**: Organizations that were in the previous version but not the current one

Each change is timestamped and recorded in DynamoDB for historical tracking.

## Data Structure

The extracted data follows this structure:

```json
{
  "organizations": [
    {
      "name": "Organization Name",
      "address": "123 Main St, City, ST 12345",
      "phone": "(123) 456-7890",
      "email": "contact@org.example",
      "website": "https://www.org.example",
      "services": ["Immigration Forms", "Removal Defense", "Asylum"],
      "languages": ["English", "Spanish", "Arabic"],
      "states": ["NY", "NJ"]
    }
  ],
  "metadata": {
    "source": "DOJ OLAP R&A Roster",
    "extractedAt": "2023-11-05T12:34:56.789Z",
    "updatedAt": "2023-11-05T12:34:56.789Z"
  }
}
```

## Timeline Feature

The application maintains a complete history of all changes to the roster, eventually enabling a timeline visualization similar to the Internet Archive's Wayback Machine but specifically for legal resources data.