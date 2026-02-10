import { useGetLoginHistory } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, History } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminLoginHistoryPanel() {
  const { data: loginHistory, isLoading, error } = useGetLoginHistory();

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <History className="w-5 h-5" />
            Login History
          </CardTitle>
          <CardDescription className="text-white/70">
            Loading login history...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <History className="w-5 h-5" />
            Login History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load login history. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const sortedHistory = loginHistory
    ? [...loginHistory].sort((a, b) => Number(b.loginTime - a.loginTime))
    : [];

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <History className="w-5 h-5" />
          Login History
        </CardTitle>
        <CardDescription className="text-white/70">
          View all client login activity with timestamps and IP addresses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sortedHistory || sortedHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No login history yet</p>
            <p className="text-white/30 text-sm mt-2">
              Login records will appear here once clients start logging in
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-neutral-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-950 hover:bg-neutral-950 border-neutral-800">
                  <TableHead className="text-gold font-semibold">Client Email/Mobile</TableHead>
                  <TableHead className="text-gold font-semibold">Login Time</TableHead>
                  <TableHead className="text-gold font-semibold">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((entry, index) => {
                  const loginDate = new Date(Number(entry.loginTime) / 1_000_000);
                  const formattedDate = loginDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <TableRow
                      key={`${entry.clientId}-${entry.loginTime}-${index}`}
                      className="border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <TableCell className="text-white font-medium">
                        {entry.identifier}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {entry.ipAddress || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
