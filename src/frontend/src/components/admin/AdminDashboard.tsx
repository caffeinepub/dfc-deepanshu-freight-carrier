import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, FileDown } from 'lucide-react';
import { AdminClientsTable } from './AdminClientsTable';
import { AdminClientDetail } from './AdminClientDetail';
import { AdminTrackingPanel } from '../AdminTrackingPanel';
import { AdminRevenuePanel } from './AdminRevenuePanel';
import { AdminLoginHistoryPanel } from './AdminLoginHistoryPanel';
import { AdminMsg91Panel } from './AdminMsg91Panel';
import { AdminGoogleGeocodingPanel } from './AdminGoogleGeocodingPanel';
import { AdminClientProvisionDialog } from './AdminClientProvisionDialog';
import { AdminInvoiceExportButton } from './AdminInvoiceExportButton';
import { useAdminSession } from '../../hooks/useAdminSession';
import { scrollToSection } from '../../utils/scrollToSection';
import type { Client } from '../../lib/types';

export function AdminDashboard() {
  const { logout } = useAdminSession();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('clients');

  const handleLogout = async () => {
    await logout();
    scrollToSection('home');
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-gold text-2xl">Admin Dashboard</CardTitle>
            <CardDescription className="text-white/70 text-base">
              Manage clients, shipments, invoices, and system configuration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
            <AdminClientProvisionDialog />
            <AdminInvoiceExportButton />
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-neutral-700 hover:bg-neutral-800 text-white whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-neutral-800 mb-6">
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

          <TabsContent value="clients" className="space-y-4">
            {selectedClient ? (
              <AdminClientDetail
                client={selectedClient}
                onBack={() => setSelectedClient(null)}
              />
            ) : (
              <AdminClientsTable onSelectClient={setSelectedClient} />
            )}
          </TabsContent>

          <TabsContent value="tracking">
            <AdminTrackingPanel enabled={activeTab === 'tracking'} />
          </TabsContent>

          <TabsContent value="revenue">
            <AdminRevenuePanel />
          </TabsContent>

          <TabsContent value="history">
            <AdminLoginHistoryPanel />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <AdminMsg91Panel />
            <AdminGoogleGeocodingPanel />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
