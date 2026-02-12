import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle } from 'lucide-react';
import { useGetLoginHistory } from '@/hooks/useQueries';

export function AdminLoginHistoryPanel() {
  const { data: loginHistory, isLoading, error } = useGetLoginHistory();

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Login History
          </CardTitle>
          <CardDescription className="text-white/70">
            Recent client login activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-neutral-800" />
            <Skeleton className="h-10 w-full bg-neutral-800" />
            <Skeleton className="h-10 w-full bg-neutral-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Clock className="w-5 h-5" />
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

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Login History
        </CardTitle>
        <CardDescription className="text-white/70">
          Recent client login activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!loginHistory || loginHistory.length === 0 ? (
          <Alert className="bg-neutral-800 border-neutral-700">
            <AlertCircle className="h-4 w-4 text-gold" />
            <AlertDescription className="text-white/70">
              No login history available yet. Login records will appear here once clients start logging in.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border border-neutral-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                  <TableHead className="text-gold">Identifier</TableHead>
                  <TableHead className="text-gold">Login Time</TableHead>
                  <TableHead className="text-gold">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map((entry, index) => (
                  <TableRow
                    key={`${entry.identifier}-${entry.loginTime}-${index}`}
                    className="border-neutral-800 hover:bg-neutral-800/50"
                  >
                    <TableCell className="text-white font-medium">
                      {entry.identifier}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(Number(entry.loginTime) / 1_000_000).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {entry.ipAddress || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
