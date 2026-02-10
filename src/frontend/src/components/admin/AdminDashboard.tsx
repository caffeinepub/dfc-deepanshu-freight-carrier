import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, History } from 'lucide-react';
import { AdminClientsTable } from './AdminClientsTable';
import { AdminLoginHistoryPanel } from './AdminLoginHistoryPanel';
import { AdminLogoutButton } from '../auth/AdminLogoutButton';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDeniedScreen } from '../auth/AccessDeniedScreen';

export function AdminDashboard() {
  const { isAuthenticated, isValidating } = useAdminSession();

  if (isValidating) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <Skeleton className="h-8 w-48 bg-neutral-800" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return <AccessDeniedScreen />;
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gold text-3xl mb-2">Admin Dashboard</CardTitle>
            <CardDescription className="text-white/70 text-base">
              Manage client accounts and view login history
            </CardDescription>
          </div>
          <AdminLogoutButton />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-950 border border-neutral-800">
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="login-history"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <History className="w-4 h-4 mr-2" />
              Login History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-6">
            <AdminClientsTable />
          </TabsContent>

          <TabsContent value="login-history" className="mt-6">
            <AdminLoginHistoryPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
