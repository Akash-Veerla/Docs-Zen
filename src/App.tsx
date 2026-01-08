import { Toaster } from '@/components/ui/toaster';
import { UploadDocuments } from '@/components/upload-documents';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
            Docs Zen
          </h1>
          <p className="text-muted-foreground">
            Upload your documents to check for conflicts and ensure consistency.
          </p>
        </div>

        <UploadDocuments />
      </div>
      <Toaster />
    </div>
  );
}

export default App;
