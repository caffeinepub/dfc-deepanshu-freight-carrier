import { useState, FormEvent } from 'react';
import { useGetShipmentsByClient, useCreateShipment, useUpdateShipment, useDeleteShipment } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '../../lib/types';

interface AdminShipmentsTableProps {
  client: Client;
}

export function AdminShipmentsTable({ client }: AdminShipmentsTableProps) {
  const { data: shipments, isLoading } = useGetShipmentsByClient();
  const createShipment = useCreateShipment();
  const updateShipment = useUpdateShipment();
  const deleteShipment = useDeleteShipment();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    trackingID: '',
    status: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const coordinates =
        formData.latitude && formData.longitude
          ? {
              latitude: parseFloat(formData.latitude),
              longitude: parseFloat(formData.longitude),
            }
          : undefined;

      await createShipment.mutateAsync({
        trackingID: formData.trackingID,
        status: formData.status,
        location: formData.location,
        client: client.id,
        coordinates,
      });

      setFormData({ trackingID: '', status: '', location: '', latitude: '', longitude: '' });
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shipment');
    }
  };

  const handleDelete = async (trackingID: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      await deleteShipment.mutateAsync(trackingID);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete shipment');
    }
  };

  const clientShipments = shipments?.filter(ship => ship.client.toString() === client.id.toString()) || [];

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-neutral-800" />
            <Skeleton className="h-10 w-full bg-neutral-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gold">Shipments</CardTitle>
            <CardDescription className="text-white/70">
              Manage shipments for {client.companyName}
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">Create New Shipment</DialogTitle>
                <DialogDescription className="text-white/70">
                  Add a new shipment for {client.companyName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trackingID" className="text-white">Tracking ID</Label>
                  <Input
                    id="trackingID"
                    value={formData.trackingID}
                    onChange={(e) => setFormData({ ...formData, trackingID: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-white">Latitude (Optional)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="bg-neutral-950 border-neutral-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-white">Longitude (Optional)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="bg-neutral-950 border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createShipment.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  {createShipment.isPending ? 'Creating...' : 'Create Shipment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                <TableHead className="text-gold">Tracking ID</TableHead>
                <TableHead className="text-gold">Status</TableHead>
                <TableHead className="text-gold">Location</TableHead>
                <TableHead className="text-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-white/50 py-8">
                    No shipments yet
                  </TableCell>
                </TableRow>
              ) : (
                clientShipments.map((shipment) => (
                  <TableRow key={shipment.trackingID} className="border-neutral-800 hover:bg-neutral-800/50">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold" />
                        {shipment.trackingID}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{shipment.status}</TableCell>
                    <TableCell className="text-white/70">{shipment.location}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleDelete(shipment.trackingID)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-neutral-800"
                        disabled={deleteShipment.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
