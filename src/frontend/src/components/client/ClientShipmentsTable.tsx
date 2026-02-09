import { useGetShipmentsByClient } from '../../hooks/useQueries';
import { useClientSession } from '../../hooks/useClientSession';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Truck } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export function ClientShipmentsTable() {
  const { sessionToken } = useClientSession();
  
  // Extract client principal from session token (format: timestamp_session_clientId or timestamp_otp_session_mobile)
  // For now, we'll need to get the principal from the backend via a separate query
  // Since we don't have direct access to the principal, we'll use a placeholder
  // In a real implementation, the backend would provide a method to get current client info
  
  const { data: shipments, isLoading } = useGetShipmentsByClient(undefined);

  const activeShipments = shipments?.filter(s => !s.status.toLowerCase().includes('delivered')) || [];
  const deliveredShipments = shipments?.filter(s => s.status.toLowerCase().includes('delivered')) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Active Shipments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : activeShipments.length > 0 ? (
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-950 border-neutral-800 hover:bg-neutral-950">
                    <TableHead className="text-gold">Tracking ID</TableHead>
                    <TableHead className="text-gold">Status</TableHead>
                    <TableHead className="text-gold">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeShipments.map((shipment) => (
                    <TableRow key={shipment.trackingID} className="border-neutral-800">
                      <TableCell className="text-white font-medium">{shipment.trackingID}</TableCell>
                      <TableCell className="text-white/90">{shipment.status}</TableCell>
                      <TableCell className="text-white/70">{shipment.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active shipments.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Delivery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold animate-spin" />
            </div>
          ) : deliveredShipments.length > 0 ? (
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-950 border-neutral-800 hover:bg-neutral-950">
                    <TableHead className="text-gold">Tracking ID</TableHead>
                    <TableHead className="text-gold">Status</TableHead>
                    <TableHead className="text-gold">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredShipments.map((shipment) => (
                    <TableRow key={shipment.trackingID} className="border-neutral-800">
                      <TableCell className="text-white font-medium">{shipment.trackingID}</TableCell>
                      <TableCell className="text-white/90">
                        <Badge className="bg-green-600 hover:bg-green-700">Delivered</Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{shipment.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              <p>No delivery history yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
