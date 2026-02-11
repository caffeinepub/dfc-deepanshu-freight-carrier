import { useState, FormEvent } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAdminAddOrUpdateClient } from '../../hooks/useQueries';
import { AdminClientProvisionDialog } from './AdminClientProvisionDialog';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

export function AdminClientForm() {
  const [formData, setFormData] = useState({
    clientPrincipal: '',
    companyName: '',
    gstNumber: '',
    address: '',
    mobile: ''
  });
  const [principalError, setPrincipalError] = useState('');

  const addOrUpdateClient = useAdminAddOrUpdateClient();

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError('');
      return false;
    }

    try {
      Principal.fromText(value.trim());
      setPrincipalError('');
      return true;
    } catch (error) {
      setPrincipalError('Invalid Principal ID format');
      return false;
    }
  };

  const handlePrincipalChange = (value: string) => {
    setFormData({ ...formData, clientPrincipal: value });
    if (value.trim()) {
      validatePrincipal(value);
    } else {
      setPrincipalError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePrincipal(formData.clientPrincipal)) {
      toast.error('Please enter a valid Client Principal ID');
      return;
    }

    try {
      const clientIdString = formData.clientPrincipal.trim();
      const clientPrincipal = Principal.fromText(clientIdString);
      
      await addOrUpdateClient.mutateAsync({
        clientId: clientPrincipal,
        profile: {
          companyName: formData.companyName,
          gstNumber: formData.gstNumber,
          address: formData.address,
          mobile: formData.mobile
        }
      });

      toast.success('Client profile saved successfully');
      
      // Clear form
      setFormData({
        clientPrincipal: '',
        companyName: '',
        gstNumber: '',
        address: '',
        mobile: ''
      });
      setPrincipalError('');
    } catch (error) {
      console.error('Failed to save client:', error);
      toast.error('Failed to save client profile');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gold mb-4">Create Client Account with Login</h3>
        <p className="text-white/70 text-sm mb-4">
          Provision a new client account with email/mobile login credentials and temporary password.
        </p>
        <AdminClientProvisionDialog />
      </div>

      <Separator className="bg-neutral-700" />

      <div>
        <h3 className="text-xl font-semibold text-gold mb-4">Update Client Profile by Principal</h3>
        <p className="text-white/70 text-sm mb-4">
          Update profile information for an existing client using their Principal ID.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientPrincipal" className="text-white">
              Client Principal ID *
            </Label>
            <Input
              id="clientPrincipal"
              type="text"
              placeholder="Enter client's Principal ID"
              value={formData.clientPrincipal}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
            {principalError && (
              <p className="text-sm text-red-500">{principalError}</p>
            )}
            <p className="text-xs text-white/50">
              The unique Principal ID for the client
            </p>
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
            <Label htmlFor="address" className="text-white">
              Address *
            </Label>
            <Textarea
              id="address"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 min-h-24"
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

          <Button
            type="submit"
            disabled={addOrUpdateClient.isPending || !!principalError}
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
          >
            {addOrUpdateClient.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Save Client Profile
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
