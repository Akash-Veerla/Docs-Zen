'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Upload,
  File as FileIcon,
  X,
  LoaderCircle,
  CheckCircle,
  AlertTriangle,
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
import { analyzeDocuments, Report } from '@/app/actions';
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
import { Input } from './ui/input';

const initialState: {
  report: Report | null;
  error: string | null;
  key: number;
} = {
  report: null,
  error: null,
  key: 0,
};

function SubmitButton({ hasFiles }: { hasFiles: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || !hasFiles}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        'Analyze Documents'
      )}
    </Button>
  );
}

export function UploadDocuments() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [state, formAction] = useActionState(analyzeDocuments, initialState);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
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
        // Update the files in the file input
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          updatedFiles.forEach(file => dataTransfer.items.add(file));
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
    // Update the files in the file input
    if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        newFiles.forEach(file => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
    }
  };

  useEffect(() => {
    if (state.key > 0) { // Only react to form submissions
      if (state.error) {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: state.error,
        });
      } else if (state.report) {
        setIsResultOpen(true);
        toast({
          title: 'Analysis Complete!',
          description: `Report ${state.report.id} has been generated.`,
        });
        // Reset form state
        setFiles([]);
        if (formRef.current) formRef.current.reset();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }, [state, toast]);
  

  const closeDialog = () => setIsResultOpen(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Start New Analysis</CardTitle>
          <CardDescription>
            Upload two or more documents to find contradictions and overlaps.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent>
            <label
              htmlFor="dropzone-file"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors',
                dragActive ? 'border-primary' : 'border-border'
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  DOCX, PPTX, PDF, MD, TXT, etc. (up to 10MB each)
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

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Documents for Analysis:</h3>
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
            <SubmitButton hasFiles={files.length > 1} />
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            {state.report && (
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Analysis Complete
              </DialogTitle>
            )}
            {state.error && (
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Analysis Failed
              </DialogTitle>
            )}
            <DialogDescription>
              {state.report
                ? `Report ${state.report.id} is ready. The following conflicts and ambiguities were found.`
                : state.error}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-4">
              {state.report && (
                <pre className="text-sm whitespace-pre-wrap font-code bg-secondary p-4 rounded-md">
                  {state.report.reportContent}
                </pre>
              )}
              {state.error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                  {state.error}
                </div>
              )}
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
