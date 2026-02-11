import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AdminClientsTable } from './AdminClientsTable';
import { AdminTrackingPanel } from '../AdminTrackingPanel';
import { AdminMsg91Panel } from './AdminMsg91Panel';
import { AdminGoogleGeocodingPanel } from './AdminGoogleGeocodingPanel';
import { AdminClientProvisionDialog } from './AdminClientProvisionDialog';
import { AdminLogoutButton } from '../auth/AdminLogoutButton';
import { AdminRevenuePanel } from './AdminRevenuePanel';
import { AdminLoginHistoryPanel } from './AdminLoginHistoryPanel';
import { AdminInvoiceExportButton } from './AdminInvoiceExportButton';
import type { Client } from '@/lib/types';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gold">Admin Dashboard</h2>
          <div className="flex items-center gap-3">
            <AdminClientProvisionDialog />
            <AdminInvoiceExportButton />
            <AdminLogoutButton />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-neutral-950 border border-neutral-800">
            <TabsTrigger value="clients" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Clients
            </TabsTrigger>
            <TabsTrigger value="tracking" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Tracking
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Login History
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-6">
            <AdminClientsTable />
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <AdminTrackingPanel enabled={activeTab === 'tracking'} />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <AdminRevenuePanel />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <AdminLoginHistoryPanel />
          </TabsContent>

          <TabsContent value="config" className="mt-6 space-y-6">
            <AdminMsg91Panel />
            <AdminGoogleGeocodingPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
