import { UploadDocuments } from '@/components/upload-documents';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Upload your documents to check for conflicts and ensure consistency.
        </p>
      </div>
      
      <UploadDocuments />

    </div>
  );
}
