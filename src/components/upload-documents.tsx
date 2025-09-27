'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Upload,
  File as FileIcon,
  X,
  LoaderCircle,
  CheckCircle,
  AlertTriangle,
  FilePlus,
  Trash2,
  BookCopy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from './ui/textarea';

const initialState: {
  report: Report | null;
  error: string | null;
  key: number;
} = {
  report: null,
  error: null,
  key: 0,
};

type TextFile = {
  id: string;
  name: string;
  content: string;
  isEditing?: boolean;
};

const sampleFilesData = [
  {
    name: 'ceo_announcement.txt',
    content:
      'To all employees,\nWe are excited to announce our return to the office, embracing a new hybrid model. We believe in-person collaboration is key to our culture. Further details will be shared by HR.',
  },
  {
    name: 'hr_policy_final.txt',
    content:
      'Official Return-to-Office Policy:\nEffective October 1st, all employees are required to work from the office a minimum of 3 days per week (Tuesday, Wednesday, Thursday).',
  },
  {
    name: 'facilities_memo.txt',
    content:
      'Facilities Update:\nThe office will be fully operational and ready for staff starting September 25th. All workspaces are available Monday through Friday, 8 AM to 6 PM.',
  },
  {
    name: 'engineering_dept_rules.txt',
    content:
      'Engineering Team Mandate:\nTo maximize collaboration on Project Phoenix, all engineering staff must be in the office from Monday to Thursday, starting immediately.',
  },
];


function SubmitButton({ hasFiles }: { hasFiles: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || !hasFiles} className="w-full sm:w-auto">
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
  const [textFiles, setTextFiles] = useState<TextFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [state, formAction] = useActionState(analyzeDocuments, initialState);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFiles = (newFiles: FileList | null) => {
    if (newFiles) {
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        Array.from(newFiles).forEach((file) => {
          if (!updatedFiles.some((f) => f.name === file.name && f.size === file.size)) {
            updatedFiles.push(file);
          }
        });
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
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeTextFile = (id: string) => {
    setTextFiles((prev) => prev.filter((tf) => tf.id !== id));
  };

  const addTextFile = () => {
    const newId = `text-file-${Date.now()}`;
    setTextFiles((prev) => [
      ...prev,
      {
        id: newId,
        name: `new-document-${prev.length + 1}.txt`,
        content: '',
        isEditing: true,
      },
    ]);
  };
  
  const loadSampleFiles = () => {
    const samples: TextFile[] = sampleFilesData.map((sample, index) => ({
      id: `sample-${Date.now()}-${index}`,
      name: sample.name,
      content: sample.content,
      isEditing: false,
    }));
    setTextFiles(prev => [...prev, ...samples]);
     toast({
      title: 'Sample Files Loaded',
      description: 'The four sample documents have been added to the list.',
    });
  };

  const updateTextFile = (id: string, newContent: Partial<TextFile>) => {
    setTextFiles((prev) =>
      prev.map((tf) => (tf.id === id ? { ...tf, ...newContent } : tf))
    );
  };
  
  const onFormAction = (formData: FormData) => {
    files.forEach((file) => {
      formData.append('documents', file);
    });
  
    textFiles.forEach((textFile) => {
      if (textFile.content.trim() !== '') {
        const file = new File([textFile.content], textFile.name, { type: 'text/plain' });
        formData.append('documents', file);
      }
    });

    formAction(formData);
  };

  useEffect(() => {
    if (state.key > 0) {
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
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/reports')}
            >
              View Reports
            </Button>
          ),
        });
        formRef.current?.reset();
        setFiles([]);
        setTextFiles([]);
      }
    }
  }, [state, toast, router]);

  const closeDialog = () => setIsResultOpen(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Start New Analysis</CardTitle>
          <CardDescription>
            Upload two or more documents to find contradictions and overlaps, or create them here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={onFormAction} className="space-y-6">
            <div className="space-y-4">
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
                  name="documents"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".txt,.md,.docx,.pptx,.pdf"
                  onChange={(e) => handleFiles(e.target.files)}
                  ref={fileInputRef}
                />
              </label>

              {(files.length > 0 || textFiles.length > 0) && (
                 <div className="space-y-2">
                 <h3 className="font-medium">Documents for Analysis:</h3>
                 <ScrollArea className="h-72 pr-4">
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
                      {textFiles.map((textFile) => (
                        <li key={textFile.id} className="p-2 rounded-md bg-secondary animate-in fade-in-50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-grow overflow-hidden">
                              <FileIcon className="h-5 w-5 text-primary flex-shrink-0" />
                              {textFile.isEditing ? (
                                <Input
                                  value={textFile.name}
                                  onChange={(e) =>
                                    updateTextFile(textFile.id, { name: e.target.value })
                                  }
                                  onBlur={() => updateTextFile(textFile.id, { isEditing: false })}
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="text-sm font-medium truncate cursor-pointer"
                                  onClick={() => updateTextFile(textFile.id, { isEditing: true })}
                                  title={textFile.name}
                                >
                                  {textFile.name}
                                </span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTextFile(textFile.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Enter document content here..."
                            value={textFile.content}
                            onChange={(e) =>
                              updateTextFile(textFile.id, { content: e.target.value })
                            }
                            className="w-full font-code"
                            rows={5}
                          />
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={addTextFile}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Add Text File
                </Button>
                <Button type="button" variant="secondary" onClick={loadSampleFiles}>
                  <BookCopy className="mr-2 h-4 w-4" />
                  Load Samples
                </Button>
              </div>
              <SubmitButton hasFiles={files.length > 0 || textFiles.some(tf => tf.content.trim() !== '')} />
            </div>
          </form>
        </CardContent>
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
            {state.report && (
              <Button onClick={() => router.push('/reports')}>View All Reports</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
