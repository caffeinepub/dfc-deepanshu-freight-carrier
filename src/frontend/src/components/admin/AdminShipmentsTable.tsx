import { useState } from 'react';
import { useGetShipmentsByClient, useCreateShipment } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Package } from 'lucide-react';
import type { Client } from '../../backend';

interface AdminShipmentsTableProps {
  client: Client;
}

export function AdminShipmentsTable({ client }: AdminShipmentsTableProps) {
  const { data: shipments, isLoading } = useGetShipmentsByClient(client.id);
  const createShipment = useCreateShipment();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    trackingID: '',
    status: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShipment.mutateAsync({
        trackingID: formData.trackingID.toUpperCase(),
        status: formData.status,
        location: formData.location,
        client: client.id,
      });
      setFormData({ trackingID: '', status: '', location: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create shipment:', error);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold">Shipments</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">Add New Shipment</DialogTitle>
                <DialogDescription className="text-white/70">
                  Create a new shipment for {client.companyName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingID" className="text-white">Tracking ID</Label>
                  <Input
                    id="trackingID"
                    required
                    value={formData.trackingID}
                    onChange={(e) => setFormData({ ...formData, trackingID: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="e.g., DFC1001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Textarea
                    id="status"
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="e.g., 🚚 In Transit - Expected delivery tomorrow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="e.g., Mumbai"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createShipment.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  {createShipment.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Shipment'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : shipments && shipments.length > 0 ? (
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
                {shipments.map((shipment) => (
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
            <p>No shipments yet for this client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
