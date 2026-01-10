import { useState, useRef } from 'react';
import {
  Upload,
  File as FileIcon,
  X,
  LoaderCircle,
  ArrowRight,
  GitCompare,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { extractText } from '@/lib/file-processing';
import { detectConflicts, ComparisonReport, ConflictItem, UniqueItem } from '@/lib/comparator';
import { Badge } from '@/components/ui/badge';

function DiffView({ conflicts }: { conflicts: ConflictItem[] }) {
  if (conflicts.length === 0) return <p className="text-muted-foreground italic">No conflicts found.</p>;

  return (
    <div className="space-y-6">
      {conflicts.map((conflict, idx) => (
        <div key={idx} className="border rounded-md p-4 bg-background">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Similarity: {(conflict.score * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="space-y-3 font-mono text-sm">
             <div className="bg-red-500/10 p-2 rounded border border-red-500/20">
                <span className="font-bold text-red-500 block mb-1">Doc A:</span>
                {conflict.source}
             </div>
             <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 md:rotate-0" />
             </div>
             <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
                <span className="font-bold text-green-500 block mb-1">Doc B:</span>
                {conflict.target}
             </div>
             {/* Simple word diff visualization could go here */}
             <div className="mt-2 pt-2 border-t">
               <span className="text-xs text-muted-foreground font-sans">Detailed Diff:</span>
               <div className="mt-1 break-words whitespace-pre-wrap">
                 {conflict.diff.map((part, i) => (
                   <span key={i} className={part.added ? 'bg-green-500/20 text-green-700 dark:text-green-300' : part.removed ? 'bg-red-500/20 text-red-700 dark:text-red-300 line-through' : ''}>
                     {part.value}
                   </span>
                 ))}
               </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UniqueView({ items, docName }: { items: UniqueItem[], docName: string }) {
    if (items.length === 0) return <p className="text-muted-foreground italic">No unique content.</p>;

    return (
        <ul className="space-y-2 list-disc pl-4 text-sm">
            {items.map((item, idx) => (
                <li key={idx} className="text-muted-foreground">
                    {item.text}
                </li>
            ))}
        </ul>
    );
}

export function UploadDocuments() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        Array.from(newFiles).forEach((file) => {
          if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
            updatedFiles.push(file);
          }
        });
        if (fileInputRef.current) {
           const dataTransfer = new DataTransfer();
           updatedFiles.forEach(f => dataTransfer.items.add(f));
           fileInputRef.current.files = dataTransfer.files;
        }
        return updatedFiles;
      });
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        newFiles.forEach(f => dataTransfer.items.add(f));
        fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not enough files',
        description: 'Please upload at least two documents.',
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReport(null);

    try {
      // 1. Extract Text
      const docs = await Promise.all(
        files.slice(0, 2).map(async (file) => ({
          filename: file.name,
          content: await extractText(file),
        }))
      );

      const validDocs = docs.filter(d => d.content && d.content.trim() !== '') as {filename: string, content: string}[];

      if (validDocs.length < 2) {
        throw new Error("Could not extract text from enough documents. Files may be empty or unsupported.");
      }

      // 2. Compare
      const result = detectConflicts(validDocs[0].content, validDocs[1].content);

      setReport(result);
      setIsResultOpen(true);
      toast({
        title: 'Comparison Complete!',
        description: `Compared ${validDocs[0].filename} and ${validDocs[1].filename}.`,
      });

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.');
      } else {
        setError('An unexpected error occurred.');
      }
      setIsResultOpen(true); // Open dialog to show error
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDialog = () => setIsResultOpen(false);

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Compare Documents</CardTitle>
            <CardDescription>
                Upload two documents to find contradictions, text changes, and similarities.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors',
                dragActive ? 'border-primary' : 'border-border'
              )}
            >
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                    DOCX, PPTX, PDF, MD, TXT (up to 10MB each)
                    </p>
                </div>
                <Input
                    id="dropzone-file"
                    ref={fileInputRef}
                    name="documents"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".txt,.md,.docx,.pptx,.pdf"
                    onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Documents (First 2 will be compared):</h3>
                <ScrollArea className="h-60 pr-4">
                  <ul className="space-y-3">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center justify-between p-2 rounded-md bg-secondary animate-in fade-in-50"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium truncate" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isProcessing || files.length < 2}>
                {isProcessing ? (
                    <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Comparing...
                    </>
                ) : (
                    <>
                    <GitCompare className="mr-2 h-4 w-4" />
                    Compare Documents
                    </>
                )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
             <DialogTitle>Comparison Results</DialogTitle>
             <DialogDescription>
                Analysis between {files[0]?.name} and {files[1]?.name}
             </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-4">
              {report ? (
                 <div className="space-y-8 p-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Matches</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 text-2xl font-bold text-green-500">{report.matchCount}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Potential Conflicts</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 text-2xl font-bold text-yellow-500">{report.conflicts.length}</CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2"><CardTitle className="text-sm">Unique Sentences</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0 text-2xl font-bold text-blue-500">{report.uniqueToA.length + report.uniqueToB.length}</CardContent>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                             <AlertTriangle className="h-5 w-5 text-yellow-500" />
                             Potential Conflicts & Edits
                        </h3>
                        <DiffView conflicts={report.conflicts} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h3 className="text-lg font-semibold mb-3 text-blue-500">Unique to {files[0]?.name}</h3>
                             <UniqueView items={report.uniqueToA} docName={files[0]?.name} />
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-3 text-purple-500">Unique to {files[1]?.name}</h3>
                             <UniqueView items={report.uniqueToB} docName={files[1]?.name} />
                        </div>
                    </div>
                 </div>
              ) : error ? (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                  {error}
                </div>
              ) : null}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
