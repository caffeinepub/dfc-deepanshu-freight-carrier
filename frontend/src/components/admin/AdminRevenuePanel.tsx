import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useGetRevenueData } from '@/hooks/useQueries';

export function AdminRevenuePanel() {
  const { data: revenueData, isLoading, error } = useGetRevenueData();

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription className="text-white/70">
            Track paid invoice amounts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[400px] bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load revenue data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!revenueData || revenueData.length === 0) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Analytics
          </CardTitle>
          <CardDescription className="text-white/70">
            Track paid invoice amounts over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-neutral-800 border-neutral-700">
            <AlertCircle className="h-4 w-4 text-gold" />
            <AlertDescription className="text-white/70">
              No revenue data available yet. Data will appear here once invoices are marked as paid.
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
          <TrendingUp className="w-5 h-5" />
          Revenue Analytics
        </CardTitle>
        <CardDescription className="text-white/70">
          Track paid invoice amounts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="date" stroke="#D4AF37" />
            <YAxis stroke="#D4AF37" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171717',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#D4AF37"
              strokeWidth={2}
              dot={{ fill: '#D4AF37', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
