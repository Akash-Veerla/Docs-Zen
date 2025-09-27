'use client';

import { useEffect, useState } from 'react';
import { getReports, Report } from '@/app/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, Eye, LoaderCircle, BarChart2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      // Fetch only the 5 most recent reports
      const fetchedReports = await getReports({ limit: 5 });
      setReports(fetchedReports);
      setLoading(false);
    }
    fetchReports();
  }, []);

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewOpen(true);
  };

  const handleDownloadReport = (report: Report) => {
    const blob = new Blob([report.reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = reports
    .map((report) => ({
      name: report.id,
      conflicts: report.conflicts,
    }))
    .reverse(); // Reverse to show oldest to newest in chart

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline text-primary">
        Recent Reports
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Recent Conflict Analysis
          </CardTitle>
          <CardDescription>
            A summary of conflicts found in your last {reports.length} analyses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ChartContainer config={{}} className="h-60 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis allowDecimals={false} tickMargin={10} fontSize={12} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="conflicts" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Files Analyzed</TableHead>
              <TableHead>Conflicts Found</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <LoaderCircle className="mr-2 h-6 w-6 animate-spin text-primary" />
                    <span>Loading reports...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No reports found. Analyze some documents to get started.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium text-primary">{report.id}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.files}</TableCell>
                  <TableCell>
                    <Badge variant={report.conflicts > 0 ? 'destructive' : 'secondary'}>
                      {report.conflicts}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Completed' ? 'outline' : 'destructive'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewReport(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>Report: {selectedReport.id}</DialogTitle>
                <DialogDescription>
                  Generated on {selectedReport.date}. Found {selectedReport.conflicts} conflicts.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                  <pre className="text-sm whitespace-pre-wrap font-code bg-secondary p-4 rounded-md">
                    {selectedReport.reportContent}
                  </pre>
                </ScrollArea>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
