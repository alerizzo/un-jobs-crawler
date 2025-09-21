# UN Jobs Crawler

A command line application built with TypeScript and Node.js for crawling UN job postings.

## Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Build the project
```bash
npm run build
```

### Run in development mode
```bash
npm run dev
```

### Run the compiled version
```bash
npm start
```

## Usage

### Show help
```bash
npm run dev -- --help
```

### Crawl UN jobs
```bash
npm run dev crawl
```

### Crawl with options
```bash
npm run dev crawl --output my-jobs.json --verbose
```

### List available job sources
```bash
npm run dev list
```

## Project Structure

```
├── src/
│   └── index.ts          # Main CLI entry point
├── dist/                 # Compiled JavaScript output
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Available Commands

- `crawl` - Start crawling UN jobs (placeholder implementation)
- `list` - List available job sources

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled application
- `npm run dev` - Run the application in development mode with ts-node
- `npm run clean` - Remove the dist directory

## Next Steps

The application currently includes placeholder implementations. You can extend it by:

1. Adding actual web scraping logic for UN job sites
2. Implementing data storage and formatting
3. Adding more command-line options and features
4. Adding tests and error handling
5. Implementing configuration files

## License

ISC
