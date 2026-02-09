import { useState, FormEvent } from 'react';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ShieldOff, Loader2, AlertCircle } from 'lucide-react';
import { useGrantAdmin, useRevokeAdmin } from '@/hooks/useQueries';
import { useAdminSession } from '@/hooks/useAdminSession';
import { toast } from 'sonner';

export function AdminRoleManagement() {
  const { isAuthenticated } = useAdminSession();
  const [principalId, setPrincipalId] = useState('');
  const [principalError, setPrincipalError] = useState('');
  const grantAdmin = useGrantAdmin();
  const revokeAdmin = useRevokeAdmin();

  // Show access denied if not authenticated via password
  if (!isAuthenticated) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold">Admin Role Management</CardTitle>
          <CardDescription className="text-white/70">
            Access denied. This feature is not available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="bg-red-950/50 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-white/90">
              Admin role management is not available in password-only mode.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
    setPrincipalId(value);
    if (value.trim()) {
      validatePrincipal(value);
    } else {
      setPrincipalError('');
    }
  };

  const handleGrantAdmin = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePrincipal(principalId)) {
      toast.error('Please enter a valid Principal ID');
      return;
    }

    try {
      const targetPrincipal = Principal.fromText(principalId.trim());
      await grantAdmin.mutateAsync(targetPrincipal);
      toast.success('Admin privileges granted successfully');
      setPrincipalId('');
      setPrincipalError('');
    } catch (error: any) {
      console.error('Failed to grant admin:', error);
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to grant admin privileges');
      } else {
        toast.error('Failed to grant admin privileges');
      }
    }
  };

  const handleRevokeAdmin = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePrincipal(principalId)) {
      toast.error('Please enter a valid Principal ID');
      return;
    }

    try {
      const targetPrincipal = Principal.fromText(principalId.trim());
      await revokeAdmin.mutateAsync(targetPrincipal);
      toast.success('Admin privileges revoked successfully');
      setPrincipalId('');
      setPrincipalError('');
    } catch (error: any) {
      console.error('Failed to revoke admin:', error);
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Cannot revoke own admin privileges')) {
        toast.error('You cannot revoke your own admin privileges');
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to revoke admin privileges');
      } else {
        toast.error('Failed to revoke admin privileges');
      }
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold">Admin Role Management</CardTitle>
        <CardDescription className="text-white/70">
          Grant or revoke administrator privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-neutral-950 border-neutral-800">
          <AlertCircle className="h-4 w-4 text-gold" />
          <AlertDescription className="text-white/80">
            This feature is not available in password-only admin mode.
          </AlertDescription>
        </Alert>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principalId" className="text-white">
              Principal ID
            </Label>
            <Input
              id="principalId"
              type="text"
              placeholder="Enter user's Principal ID"
              value={principalId}
              onChange={(e) => handlePrincipalChange(e.target.value)}
              disabled
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
            {principalError && (
              <p className="text-sm text-red-500">{principalError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGrantAdmin}
              disabled
              className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Grant Admin
            </Button>

            <Button
              onClick={handleRevokeAdmin}
              disabled
              variant="destructive"
              className="flex-1"
            >
              <ShieldOff className="w-4 h-4 mr-2" />
              Revoke Admin
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
