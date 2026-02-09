import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, FileText } from 'lucide-react';
import { AdminShipmentsTable } from './AdminShipmentsTable';
import { AdminInvoicesTable } from './AdminInvoicesTable';
import type { Client } from '../../backend';

interface AdminClientDetailProps {
  client: Client;
  onBack: () => void;
}

export function AdminClientDetail({ client, onBack }: AdminClientDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold text-2xl">{client.companyName}</CardTitle>
          <CardDescription className="text-white/70 space-y-1">
            <div>GST: {client.gstNumber}</div>
            <div>Mobile: {client.mobile}</div>
            <div>Address: {client.address}</div>
            <div className="text-xs mt-2 font-mono">Principal: {client.id.toString()}</div>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="shipments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border border-neutral-800">
          <TabsTrigger 
            value="shipments" 
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <Package className="w-4 h-4 mr-2" />
            Shipments
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <FileText className="w-4 h-4 mr-2" />
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
