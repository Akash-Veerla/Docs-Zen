# Docs Zen - Document Conflict Detector

A pure Client-Side React Application to analyze documents for conflicts using Google Gemini AI.

## Features

- **Document Analysis**: Upload multiple documents (PDF, DOCX, PPTX, MD, TXT) to identify contradictions.
- **Client-Side Processing**: All file extraction and AI calls happen directly in your browser. No files are uploaded to our server.
- **Secure**: Your API Key is used only for the current session and never stored.
- **Format Support**:
    -   Word (.docx)
    -   PowerPoint (.pptx)
    -   PDF (.pdf)
    -   Markdown/Text

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
- A Google Gemini API Key.

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

### Running Locally

1.  Create a `.env` file in the root directory (optional, but convenient for dev):

    ```env
    VITE_GOOGLE_GENAI_API_KEY=your_api_key_here
    ```

2.  Start the development server:

    ```bash
    npm run dev
    ```

3.  Open [http://localhost:5173](http://localhost:5173).

### Building for Production

```bash
npm run build
```

The output will be in the `dist/` directory, ready to be deployed to any static host (Netlify, Vercel, GitHub Pages).
