# UN Jobs Crawler

A robust command line application built with TypeScript and Node.js for crawling UN job postings from multiple sources with email notifications, comparison features, and comprehensive error handling.

## Features

- 🌐 **Multi-source crawling**: Crawls from UNJobs.org, CareersUN.org, and UNTalent.org
- 📧 **Email notifications**: Send new job alerts via email
- 🔍 **Job comparison**: Compare with previous results to find only new jobs
- 💾 **Flexible output**: Save results to JSON files or display in console
- 🛡️ **Error handling**: Robust error handling with graceful degradation
- 🌍 **Geographic data**: European duty stations with country information
- 🤖 **AI-powered job relevance**: Uses OpenAI to categorize job relevance
- 📊 **Input file support**: Process existing job data without crawling
- ✨ **Rich console output**: Colorful emojis and progress indicators

## Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- OpenAI API key (optional, for AI-powered job relevance analysis)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Basic crawling
```bash
# Crawl all jobs and display in console
npm start crawl

# Save all jobs to a file
npm start crawl --output jobs.json

# Process existing job data without crawling
npm start crawl --input existing-jobs.json
```

### Job comparison and new job detection
```bash
# Compare with previous results and show only new jobs
npm start crawl --compare previous-jobs.json

# Save new jobs to a separate file
npm start crawl --compare previous-jobs.json --compare-output new-jobs.json
```

### Email notifications with AI relevance
```bash
# Send new jobs via email with AI-powered relevance analysis
npm start crawl --compare previous-jobs.json --email recipient@example.com
```

### Combined usage
```bash
# Complete workflow: compare, save all jobs, save new jobs, and email
npm start crawl \
  --output all-jobs.json \
  --compare previous-jobs.json \
  --compare-output new-jobs.json \
  --email team@company.com
```

## Environment Configuration

### Email Configuration

To use email notifications, set these environment variables:

```bash
# For Gmail (recommended to use App Passwords)
export SMTP_USER="your-gmail@gmail.com"
export SMTP_PASS="your-app-password"
```

### OpenAI Configuration (Optional)

For AI-powered job relevance analysis, set your OpenAI API key:

```bash
# OpenAI API key for job relevance analysis
export OPENAI_API_KEY="your-openai-api-key"
```

Alternatively, you can create a `.env` file in the project root:

```bash
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
OPENAI_API_KEY=your-openai-api-key
```

### Setting up Gmail App Password
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings → Security → App passwords (or use direct link: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords))
3. Generate a new app password for this application
4. Use the generated password (not your regular Gmail password)

## GitHub Actions Automation

This project includes a GitHub Actions workflow that automatically runs the crawler every 6 hours and sends email notifications for new jobs.

### Setup GitHub Secrets

To enable automated crawling, set up these repository secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SMTP_USER` | Your Gmail address | `your-email@gmail.com` |
| `SMTP_PASS` | Gmail app password (16 characters) | `abcd efgh ijkl mnop` |
| `RECIPIENT` | Email address to receive job notifications | `recipient@company.com` |
| `OPENAI_API_KEY` | OpenAI API key for job relevance analysis (optional) | `sk-proj-...` |

### Workflow Features

The automated workflow:
- 🕒 **Runs every 6 hours** (00:00, 06:00, 12:00, 18:00 UTC)
- 💾 **Persistent storage** using GitHub workflow artifacts
- 🔄 **Smart comparison** - only sends emails for truly new jobs
- 🤖 **AI-powered job relevance** - automatically categorizes job relevance
- 📧 **Automatic notifications** to your specified recipient
- 🛡️ **Error handling** - continues running even if individual crawlers fail
- 📊 **Run summaries** - detailed reports in GitHub Actions interface

### Manual Triggering

You can also trigger the workflow manually:
1. Go to **Actions** tab in your repository
2. Select "UN Jobs Crawler" workflow
3. Click "Run workflow"

### Artifact Management

The workflow automatically:
- Downloads previous results from artifacts
- Compares new jobs against previous results
- Stores current results as artifacts for the next run
- Keeps job results for 90 days and comparison data for 30 days

## Command Line Options

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Save all crawled jobs to specified JSON file |
| `-i, --input <file>` | Process existing job data from file without crawling |
| `-c, --compare <file>` | Compare results with existing JSON file to find new jobs |
| `-x, --compare-output <file>` | Save only new jobs to specified JSON file |
| `-e, --email <email>` | Send new jobs notification to specified email address |

## Project Structure

```
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── email.ts              # Email service for notifications
│   ├── gpt.ts                # OpenAI integration for job relevance analysis
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Utility functions
│   └── crawlers/
│       ├── unjobs.ts         # UNJobs.org crawler
│       ├── careersun.ts      # CareersUN.org crawler
│       └── untalent.ts       # UNTalent.org crawler
├── dist/                     # Compiled JavaScript output
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                # This file
```

## Data Sources

### UNJobs.org
- Website: https://unjobs.org
- Crawls job listings with titles, URLs, and descriptions
- Focuses on UN system job opportunities

### CareersUN.org  
- Website: https://careers.un.org
- Targets European duty stations (43+ locations)
- Includes country information for geographic filtering

### UNTalent.org
- Website: https://untalent.org
- Focuses on UN system job opportunities
- Filters for European locations and remote work
- Includes job tags and organization information

## Job Data Structure

Each job object contains:
```typescript
{
  uuid: string;           // Unique identifier
  title: string;          // Job title
  url: string;            // Direct link to job posting
  organization?: string;  // UN organization/agency
  description?: string;   // Job description
  updatedAt?: Date;       // Last update timestamp
  // AI-powered fields (when using OpenAI integration)
  reasoning?: string;     // AI reasoning for relevance category
  category?: "relevant" | "potentiallyRelevant" | "needsHumanReview" | "notRelevant";
}
```

## Error Handling

The application includes comprehensive error handling:
- **Individual crawler failures**: If one source fails, others continue
- **File operation errors**: Graceful handling of read/write failures
- **Email failures**: Non-blocking email errors with clear messaging
- **JSON parsing errors**: Fallback behavior for malformed data
- **Network issues**: Retry logic and timeout handling
- **AI service failures**: Graceful degradation when OpenAI is unavailable

## AI-Powered Job Relevance Analysis

When an OpenAI API key is configured, the application automatically analyzes new jobs to categorize their relevance. This feature:

- **Processes jobs in batches**: Handles up to 20 jobs at a time to avoid rate limiting
- **Categorizes relevance**: Jobs are classified as `relevant`, `potentiallyRelevant`, `needsHumanReview`, or `notRelevant`
- **Provides reasoning**: Each job includes AI-generated reasoning for its relevance category
- **Non-blocking**: If OpenAI is unavailable, the application continues without AI analysis
- **Only for new jobs**: AI analysis is performed only on newly discovered jobs during comparison

### Relevance Categories

- **relevant**: Jobs that closely match typical UN career profiles
- **potentiallyRelevant**: Jobs that might be of interest but require closer review
- **needsHumanReview**: Jobs that the AI couldn't categorize confidently
- **notRelevant**: Jobs that don't match typical UN career interests

## Development

### Build the project
```bash
npm run build
```

### Run in development mode
```bash
npm run dev crawl [options]
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled application
- `npm run dev` - Run in development mode with ts-node
- `npm run clean` - Remove the dist directory

## Example Workflows

### Daily job monitoring
```bash
#!/bin/bash
# daily-job-check.sh

# Crawl and compare with yesterday's results
npm start crawl \
  --compare jobs-$(date -d yesterday +%Y%m%d).json \
  --output jobs-$(date +%Y%m%d).json \
  --compare-output new-jobs-$(date +%Y%m%d).json \
  --email hr-team@company.com
```

### Weekly summary
```bash
# Get all jobs for the week
npm start crawl --output weekly-jobs-$(date +%Y-W%U).json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC
