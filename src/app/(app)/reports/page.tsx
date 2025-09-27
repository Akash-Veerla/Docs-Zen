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
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const reports = [
  { id: 'REP-001', date: '2024-06-15', files: 3, conflicts: 5, status: 'Completed' },
  { id: 'REP-002', date: '2024-06-14', files: 2, conflicts: 0, status: 'Completed' },
  { id: 'REP-003', date: '2024-06-12', files: 5, conflicts: 12, status: 'Completed' },
  { id: 'REP-004', date: '2024-06-11', files: 4, conflicts: 2, status: 'Completed' },
  { id: 'REP-005', date: '2024-06-10', files: 2, conflicts: 1, status: 'Completed' },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline">
        Reports
      </h1>
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
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>{report.files}</TableCell>
                <TableCell>
                  <Badge variant={report.conflicts > 0 ? 'destructive' : 'secondary'}>
                    {report.conflicts}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{report.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Report</DropdownMenuItem>
                      <DropdownMenuItem>Download</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
