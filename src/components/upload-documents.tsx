import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  File as FileIcon,
  X,
  LoaderCircle,
  CheckCircle,
  AlertTriangle,
  Key,
  Bot
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
import { analyzeDocuments, analyzeWithChromeAI, checkChromeAIAvailability, Report } from '@/lib/ai';
import { Badge } from '@/components/ui/badge';

export function UploadDocuments() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [chromeAIAvailable, setChromeAIAvailable] = useState(false);
  const [useLocalAI, setUseLocalAI] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check Chrome AI Availability
    checkChromeAIAvailability().then((available) => {
      setChromeAIAvailable(available);
      if (available) {
        setUseLocalAI(true);
      }
    });

    // Load API Key from env if available
    if (import.meta.env.VITE_GOOGLE_GENAI_API_KEY) {
      setApiKey(import.meta.env.VITE_GOOGLE_GENAI_API_KEY);
    }
  }, []);

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

    if (!useLocalAI && !apiKey) {
      toast({
        variant: 'destructive',
        title: 'Missing API Key',
        description: 'Please provide a Google Gemini API Key or enable Chrome AI.',
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setReport(null);

    try {
      // 1. Extract Text
      const docs = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: await extractText(file),
        }))
      );

      const validDocs = docs.filter(d => d.content && d.content.trim() !== '') as {filename: string, content: string}[];

      if (validDocs.length < 2) {
        throw new Error("Could not extract text from enough documents. Files may be empty or unsupported.");
      }

      // 2. Analyze
      let result: Report;
      if (useLocalAI && chromeAIAvailable) {
         result = await analyzeWithChromeAI(validDocs);
      } else {
         result = await analyzeDocuments(validDocs, apiKey);
      }

      setReport(result);
      setIsResultOpen(true);
      toast({
        title: 'Analysis Complete!',
        description: `Report generated successfully using ${useLocalAI ? 'Chrome AI' : 'Gemini API'}.`,
      });
      setFiles([]); // Clear files after success
      if (fileInputRef.current) fileInputRef.current.value = "";

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
          <div className="flex justify-between items-start">
             <div>
                <CardTitle>Start New Analysis</CardTitle>
                <CardDescription>
                    Upload two or more documents to find contradictions and overlaps.
                </CardDescription>
             </div>
             {chromeAIAvailable && (
                <Badge variant={useLocalAI ? "default" : "secondary"} className="cursor-pointer" onClick={() => setUseLocalAI(!useLocalAI)}>
                    {useLocalAI ? "Using Chrome AI (Local)" : "Switch to Local AI"}
                </Badge>
             )}
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
             {!useLocalAI && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="api-key">
                        Google Gemini API Key
                    </label>
                    <div className="relative">
                        <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="api-key"
                            type="password"
                            placeholder="Enter your API Key"
                            className="pl-9"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            required={!useLocalAI}
                        />
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Your key is used only for this session and is not stored.
                    </p>
                </div>
            )}

            {useLocalAI && (
                 <div className="p-4 bg-secondary/50 rounded-lg flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <p>Using Chrome's built-in AI model. No data leaves your device.</p>
                 </div>
            )}

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
            <Button type="submit" disabled={isProcessing || files.length < 2 || (!useLocalAI && !apiKey)}>
                {isProcessing ? (
                    <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                    </>
                ) : (
                    'Analyze Documents'
                )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader>
            {report && (
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Analysis Complete
              </DialogTitle>
            )}
            {error && (
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Analysis Failed
              </DialogTitle>
            )}
            <DialogDescription>
              {report
                ? `Report ${report.id} is ready.`
                : 'An error occurred during analysis.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-4">
              {report && (
                <pre className="text-sm whitespace-pre-wrap font-code bg-secondary p-4 rounded-md">
                  {report.reportContent}
                </pre>
              )}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-md">
                  {error}
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
