import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import type { Client } from '@/lib/types';
import { AdminShipmentsTable } from './AdminShipmentsTable';
import { AdminInvoicesTable } from './AdminInvoicesTable';

interface AdminClientDetailProps {
  client: Client;
  onBack: () => void;
}

export function AdminClientDetail({ client, onBack }: AdminClientDetailProps) {
  const [activeTab, setActiveTab] = useState('shipments');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-gold text-gold hover:bg-gold/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold text-2xl">{client.companyName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-white/80">
          <p><strong>GST:</strong> {client.gstNumber}</p>
          <p><strong>Mobile:</strong> {client.mobile}</p>
          <p><strong>Address:</strong> {client.address}</p>
          <p className="text-xs text-white/50 font-mono">Principal: {client.id.toString()}</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border border-neutral-800">
          <TabsTrigger value="shipments" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            Shipments
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-6">
          <AdminShipmentsTable client={client} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <AdminInvoicesTable client={client} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
