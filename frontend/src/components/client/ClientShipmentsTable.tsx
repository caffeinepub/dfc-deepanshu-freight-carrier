import { useGetClientShipments } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Truck, LogIn, AlertCircle } from 'lucide-react';
import { useClientSession } from '../../hooks/ClientSessionProvider';
import { getQueryErrorMessage } from '../../utils/queryErrorMessage';

export function ClientShipmentsTable() {
  const { isAuthenticated } = useClientSession();
  const { data: shipments, isLoading, error } = useGetClientShipments();

  const activeShipments = shipments?.filter(s => !s.status.toLowerCase().includes('delivered')) || [];
  const deliveredShipments = shipments?.filter(s => s.status.toLowerCase().includes('delivered')) || [];

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <LogIn className="w-16 h-16 mx-auto mb-4 text-gold opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
              <p className="text-white/70">Please log in to view your shipments.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for linkage errors (special handling with yellow alert)
  const isLinkageError = error && 
    (String(error).includes('no linked principal') || 
     String(error).includes('Client account has no linked principal'));

  // Get user-friendly error message
  const errorMessage = error ? getQueryErrorMessage(error) : '';

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
          ) : isLinkageError ? (
            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                <strong>Account Not Linked:</strong> Your account is not linked to a client profile. 
                Please contact the administrator to link your account so you can view your shipments.
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {errorMessage}
              </AlertDescription>
            </Alert>
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
          ) : isLinkageError ? (
            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                <strong>Account Not Linked:</strong> Your account is not linked to a client profile. 
                Please contact the administrator to link your account so you can view your delivery history.
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">
                {errorMessage}
              </AlertDescription>
            </Alert>
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
