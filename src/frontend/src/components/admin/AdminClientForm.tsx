import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminAddOrUpdateClient } from '../../hooks/useQueries';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import type { Client } from '../../lib/types';

interface AdminClientFormProps {
  client?: Client;
  onSuccess?: () => void;
}

export function AdminClientForm({ client, onSuccess }: AdminClientFormProps) {
  const [formData, setFormData] = useState({
    principalId: client?.id.toString() || '',
    companyName: client?.companyName || '',
    gstNumber: client?.gstNumber || '',
    address: client?.address || '',
    mobile: client?.mobile || '',
  });
  const [error, setError] = useState('');

  const updateClient = useAdminAddOrUpdateClient();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate Principal ID format
    if (!formData.principalId.trim()) {
      setError('Client Principal ID is required');
      return;
    }

    try {
      await updateClient.mutateAsync({
        principalId: formData.principalId.trim(),
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        address: formData.address,
        mobile: formData.mobile,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update client profile');
    }
  };

  const clientPrincipal = client?.id.toString() || '';

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold">
          {client ? 'Update Client Profile' : 'Add Client Profile'}
        </CardTitle>
        <CardDescription className="text-white/70">
          {client ? 'Update the profile information for this client' : 'Add profile information for a new client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principalId" className="text-white">
              Client Principal ID *
            </Label>
            <Input
              id="principalId"
              type="text"
              placeholder="Enter Principal ID"
              value={formData.principalId}
              onChange={(e) => setFormData({ ...formData, principalId: e.target.value })}
              required
              disabled={!!client}
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
            {client && (
              <p className="text-xs text-white/50">Principal ID cannot be changed</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-white">
              Company Name *
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstNumber" className="text-white">
              GST Number *
            </Label>
            <Input
              id="gstNumber"
              type="text"
              placeholder="Enter GST number"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-white">
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">
              Address *
            </Label>
            <Textarea
              id="address"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 min-h-20"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-white/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={updateClient.isPending}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
          >
            {updateClient.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {client ? 'Update Profile' : 'Add Profile'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
