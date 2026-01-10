# Docs Zen - Document Conflict Detector

A pure Client-Side React Application to analyze and cross-reference documents for conflicts using Google Gemini AI.

## Features

- **Multi-Document Analysis**: Upload up to 4 documents (PDF, DOCX, PPTX, TXT) at once.
- **AI-Powered**: Uses Google Gemini 1.5 Flash to identify contradictions, overlaps, and inconsistencies across the entire set.
- **Client-Side Processing**: Files are parsed locally in the browser before being sent to the AI model.
- **Privacy**: Your documents are processed in memory and not stored on any backend server.

## Tech Stack

-   **Framework**: React + Vite
-   **AI**: Google Generative AI SDK (Gemini 1.5 Flash)
-   **UI**: Tailwind CSS, Shadcn UI, Lucide React
-   **File Parsing**:
    -   `mammoth` (DOCX)
    -   `pdfjs-dist` (PDF)
    -   `jszip` (PPTX)

## Getting Started

### Prerequisites

- Node.js installed.

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Running Locally

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  Open [http://localhost:5173](http://localhost:5173).

### Building for Production

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to any static host (Netlify, Vercel, GitHub Pages).
