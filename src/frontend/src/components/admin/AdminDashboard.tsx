import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, FileDown, Shield } from 'lucide-react';
import { AdminClientsTable } from './AdminClientsTable';
import { AdminClientForm } from './AdminClientForm';
import { AdminClientDetail } from './AdminClientDetail';
import { AdminInvoiceExportButton } from './AdminInvoiceExportButton';
import { AdminMsg91Panel } from './AdminMsg91Panel';
import { AdminLogoutButton } from '../auth/AdminLogoutButton';
import { useValidateAdminSession } from '@/hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDeniedScreen } from '../auth/AccessDeniedScreen';
import type { Client } from '../../backend';

export function AdminDashboard() {
  const { data: isValidSession, isLoading } = useValidateAdminSession();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  if (isLoading) {
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

  if (!isValidSession) {
    return <AccessDeniedScreen />;
  }

  if (selectedClient) {
    return (
      <AdminClientDetail
        client={selectedClient}
        onBack={() => setSelectedClient(null)}
      />
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gold text-3xl mb-2">Admin Dashboard</CardTitle>
            <CardDescription className="text-white/70 text-base">
              Manage clients, shipments, invoices, and MSG91 configuration
            </CardDescription>
          </div>
          <AdminLogoutButton />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-neutral-950 border border-neutral-800">
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger
              value="add-client"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Client
            </TabsTrigger>
            <TabsTrigger
              value="msg91"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              MSG91
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-6">
            <AdminClientsTable onSelectClient={setSelectedClient} />
          </TabsContent>

          <TabsContent value="add-client" className="mt-6">
            <div className="max-w-2xl">
              <AdminClientForm />
            </div>
          </TabsContent>

          <TabsContent value="msg91" className="mt-6">
            <AdminMsg91Panel />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <div className="space-y-4">
              <p className="text-white/70">
                Export all invoices to CSV format for accounting and record-keeping.
              </p>
              <AdminInvoiceExportButton />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
