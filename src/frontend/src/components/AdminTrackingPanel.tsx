import { useState, useEffect } from 'react';
import { Trash2, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { shipmentsStorage } from '@/lib/shipmentsStorage';

const ADMIN_PASSWORD = 'dfc2026';

export function AdminTrackingPanel() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState('');
  const [shipments, setShipments] = useState<Record<string, string>>({});

  // Load shipments from localStorage
  const loadShipments = () => {
    shipmentsStorage.initialize();
    const data = shipmentsStorage.getAll();
    setShipments(data);
  };

  // Load on mount if unlocked
  useEffect(() => {
    if (isUnlocked) {
      loadShipments();
    }
  }, [isUnlocked]);

  // Handle password unlock
  const handleUnlock = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  // Save or update shipment
  const handleSave = () => {
    if (!trackingId.trim() || !status.trim()) {
      return;
    }

    shipmentsStorage.upsert(trackingId, status);
    setTrackingId('');
    setStatus('');
    loadShipments();
  };

  // Delete shipment
  const handleDelete = (id: string) => {
    shipmentsStorage.delete(id);
    loadShipments();
  };

  return (
    <section id="admin" className="py-20 lg:py-32 bg-neutral-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gold text-center mb-16">
          DFC Admin Tracking Panel
        </h2>

        {!isUnlocked ? (
          // Password Gate
          <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
            <CardHeader>
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <CardTitle className="text-gold text-2xl text-center">Admin Access</CardTitle>
              <CardDescription className="text-white/70 text-center">
                Enter password to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                placeholder="Enter Password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnlock();
                  }
                }}
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
              />
              
              {passwordError && (
                <p className="text-red-500 text-sm text-center">{passwordError}</p>
              )}
              
              <Button
                onClick={handleUnlock}
                className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
              >
                Unlock
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Admin Panel Content
          <>
            {/* Add/Update Shipment Form */}
            <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto mb-12">
              <CardHeader>
                <CardTitle className="text-gold text-2xl">Add / Update Shipment</CardTitle>
                <CardDescription className="text-white/70">
                  Enter tracking ID and status to create or update a shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Tracking ID (e.g., DFC1001)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Status (e.g., ✅ Load Confirmed - Truck Loaded from Kalamboli)"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 min-h-24"
                  />
                  <p className="text-white/50 text-sm">
                    You can include emojis and detailed status information
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Save
                </Button>
              </CardContent>
            </Card>

            {/* All Shipments Table */}
            <Card className="bg-neutral-900 border-neutral-800 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-gold text-2xl">All Shipments</CardTitle>
                <CardDescription className="text-white/70">
                  Manage all tracking IDs and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(shipments).length === 0 ? (
                  <div className="text-center py-12 text-white/60">
                    No shipments added yet. Create your first shipment above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                          <TableHead className="text-gold font-bold">Tracking ID</TableHead>
                          <TableHead className="text-gold font-bold">Status</TableHead>
                          <TableHead className="text-gold font-bold text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(shipments).map(([id, shipmentStatus]) => (
                          <TableRow 
                            key={id} 
                            className="border-neutral-800 hover:bg-neutral-800/50"
                          >
                            <TableCell className="text-white font-medium">{id}</TableCell>
                            <TableCell className="text-white/90">{shipmentStatus}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                onClick={() => handleDelete(id)}
                                variant="destructive"
                                size="sm"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </section>
  );
}
