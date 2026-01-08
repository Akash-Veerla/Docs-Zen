# Document Conflict Detector

This is a Next.js application that uses AI to analyze documents for conflicts, overlaps, and ambiguities. It supports DOCX, PDF, PPTX, and text files.

## Features

- **Document Analysis**: Upload multiple documents to identify contradictions and consistencies.
- **AI-Powered**: Uses Google's Gemini 1.5 Flash model for deep analysis.
- **Support for Multiple Formats**: Works with `.docx`, `.pdf`, `.pptx`, `.md`, and `.txt`.

## Getting Started

### Prerequisites

- Node.js installed.
- A Google AI API key (for Gemini).

### Installation

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root directory and add your Google AI API key:

    ```env
    GOOGLE_GENAI_API_KEY=your_api_key_here
    ```

### Running the App

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
The dashboard is located at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Usage

1.  Navigate to the Dashboard.
2.  Click "Start New Analysis" or drag and drop files.
3.  Upload at least two documents.
4.  Click "Analyze Documents".
5.  View the generated report highlighting any conflicts found.

## Tech Stack

-   **Framework**: Next.js 15
-   **AI**: Genkit + Google AI (Gemini 1.5 Flash)
-   **UI**: Tailwind CSS, Radix UI, Lucide React
-   **File Processing**: Mammoth (DOCX), PDF-Parse (PDF), JSZip (PPTX)
