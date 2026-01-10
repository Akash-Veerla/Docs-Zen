# Docs Zen - Document Comparator

A pure Client-Side React Application to compare documents and detect text conflicts deterministically.

## Features

- **Privacy First**: All processing happens 100% in your browser. No data is sent to any server or AI model.
- **Deterministic Comparison**: Uses diffing algorithms and sentence similarity (Dice Coefficient) to find changes, conflicts, and unique content.
- **Format Support**:
    -   Word (.docx)
    -   PowerPoint (.pptx)
    -   PDF (.pdf)
    -   Markdown/Text

## Tech Stack

-   **Framework**: React + Vite
-   **Comparison**: `diff` library + Custom NLP logic
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
