import { useState } from 'react';
import { useGetShipmentsByClient, useCreateShipment, useUpdateShipment, useDeleteShipment } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Loader2, Package, Trash2 } from 'lucide-react';
import type { Client } from '../../lib/types';

interface AdminShipmentsTableProps {
  client: Client;
}

export function AdminShipmentsTable({ client }: AdminShipmentsTableProps) {
  const { data: shipments, isLoading } = useGetShipmentsByClient(client.id);
  const createShipment = useCreateShipment();
  const updateShipment = useUpdateShipment();
  const deleteShipment = useDeleteShipment();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    trackingID: '',
    status: '',
    location: '',
    latitude: '',
    longitude: '',
  });

  const handleCreate = async () => {
    const coordinates =
      formData.latitude && formData.longitude
        ? { latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) }
        : undefined;

    await createShipment.mutateAsync({
      trackingID: formData.trackingID,
      status: formData.status,
      location: formData.location,
      client: client.id,
      coordinates,
    });
    setIsCreateDialogOpen(false);
    setFormData({ trackingID: '', status: '', location: '', latitude: '', longitude: '' });
  };

  const handleDelete = async (trackingID: string) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      await deleteShipment.mutateAsync(trackingID);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-neutral-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Shipments</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-gold">Create New Shipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingID">Tracking ID</Label>
                <Input
                  id="trackingID"
                  value={formData.trackingID}
                  onChange={(e) => setFormData({ ...formData, trackingID: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (optional)</Label>
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
                  <Label htmlFor="longitude">Longitude (optional)</Label>
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
                onClick={handleCreate}
                disabled={createShipment.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-black"
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
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {shipments && shipments.length > 0 ? (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                <TableHead className="text-white">Tracking ID</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.trackingID} className="border-neutral-800 hover:bg-neutral-900/50">
                  <TableCell className="text-white font-mono">{shipment.trackingID}</TableCell>
                  <TableCell className="text-white">{shipment.status}</TableCell>
                  <TableCell className="text-white">{shipment.location}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(shipment.trackingID)}
                      disabled={deleteShipment.isPending}
                      className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border border-neutral-800 rounded-lg">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-white/70">No shipments found for this client</p>
        </div>
      )}
    </div>
  );
}
