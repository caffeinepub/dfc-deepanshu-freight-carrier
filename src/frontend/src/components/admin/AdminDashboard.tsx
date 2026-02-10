import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, FileDown, Shield, Map, TrendingUp, MapPin, History } from 'lucide-react';
import { AdminClientsTable } from './AdminClientsTable';
import { AdminClientForm } from './AdminClientForm';
import { AdminClientDetail } from './AdminClientDetail';
import { AdminInvoiceExportButton } from './AdminInvoiceExportButton';
import { AdminMsg91Panel } from './AdminMsg91Panel';
import { AdminGoogleGeocodingPanel } from './AdminGoogleGeocodingPanel';
import { AdminTrackingPanel } from '../AdminTrackingPanel';
import { AdminRevenuePanel } from './AdminRevenuePanel';
import { AdminLoginHistoryPanel } from './AdminLoginHistoryPanel';
import { AdminLogoutButton } from '../auth/AdminLogoutButton';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessDeniedScreen } from '../auth/AccessDeniedScreen';
import type { Client } from '../../backend';

export function AdminDashboard() {
  const { isAuthenticated, isValidating } = useAdminSession();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
              Manage clients, shipments, invoices, tracking, and API configuration
            </CardDescription>
          </div>
          <AdminLogoutButton />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-neutral-950 border border-neutral-800">
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
              value="tracking"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <Map className="w-4 h-4 mr-2" />
              Live Tracking
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger
              value="login-history"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <History className="w-4 h-4 mr-2" />
              Login History
            </TabsTrigger>
            <TabsTrigger
              value="msg91"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              MSG91
            </TabsTrigger>
            <TabsTrigger
              value="geocoding"
              className="data-[state=active]:bg-gold data-[state=active]:text-black"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Geocoding
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

          <TabsContent value="tracking" className="mt-6">
            <AdminTrackingPanel />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <AdminRevenuePanel />
          </TabsContent>

          <TabsContent value="login-history" className="mt-6">
            <AdminLoginHistoryPanel />
          </TabsContent>

          <TabsContent value="msg91" className="mt-6">
            <AdminMsg91Panel />
          </TabsContent>

          <TabsContent value="geocoding" className="mt-6">
            <AdminGoogleGeocodingPanel />
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
