import { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateClientAccount, useProvisionClientAccount } from '../../hooks/useQueries';
import { Loader2, UserPlus, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

export function AdminClientProvisionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    companyName: '',
    gstNumber: '',
    address: '',
    clientPrincipalId: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [principalError, setPrincipalError] = useState<string | null>(null);

  const createAccount = useCreateClientAccount();
  const provisionAccount = useProvisionClientAccount();

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
    let password = 'DFC';
    for (let i = 0; i < 9; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validatePrincipal = (principalId: string): boolean => {
    if (!principalId.trim()) {
      setPrincipalError('Client Principal ID is required');
      return false;
    }
    
    try {
      Principal.fromText(principalId.trim());
      setPrincipalError(null);
      return true;
    } catch (error) {
      setPrincipalError('Invalid Principal ID format. Please check and try again.');
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email && !formData.mobile) {
      toast.error('Please provide either email or mobile number');
      return;
    }

    if (!validatePrincipal(formData.clientPrincipalId)) {
      return;
    }

    const tempPassword = generatePassword();
    const identifier = formData.email || formData.mobile;

    try {
      // Step 1: Create the client account
      await createAccount.mutateAsync({
        identifier,
        password: tempPassword,
        linkedPrincipal: Principal.fromText(formData.clientPrincipalId.trim()),
        email: formData.email || undefined,
        mobile: formData.mobile || undefined,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        address: formData.address,
      });

      // Step 2: Link the account to the client Principal
      const linkedPrincipal = Principal.fromText(formData.clientPrincipalId.trim());
      await provisionAccount.mutateAsync({
        identifier,
        password: tempPassword,
        linkedPrincipal,
      });

      setGeneratedPassword(tempPassword);
      toast.success('Client account created and linked successfully');
    } catch (error: any) {
      console.error('Failed to create and provision client account:', error);
      // Error toasts are handled by the mutation hooks
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      email: '',
      mobile: '',
      companyName: '',
      gstNumber: '',
      address: '',
      clientPrincipalId: '',
    });
    setGeneratedPassword(null);
    setCopied(false);
    setPrincipalError(null);
  };

  const isPending = createAccount.isPending || provisionAccount.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold hover:bg-gold/90 text-black font-semibold">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Client Account
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl">Create New Client Account</DialogTitle>
          <DialogDescription className="text-white/70">
            Provision a new client account with login credentials and link it to a client Principal
          </DialogDescription>
        </DialogHeader>

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-blue-900/20 border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-400 text-sm">
                <strong>Important:</strong> You must provide the Client Principal ID to link this login account. 
                This ensures shipments and invoices created for that client will be visible after login.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="clientPrincipalId" className="text-white">
                Client Principal ID *
              </Label>
              <Input
                id="clientPrincipalId"
                type="text"
                placeholder="e.g., rrkah-fqaaa-aaaaa-aaaaq-cai"
                value={formData.clientPrincipalId}
                onChange={(e) => {
                  setFormData({ ...formData, clientPrincipalId: e.target.value });
                  setPrincipalError(null);
                }}
                onBlur={() => {
                  if (formData.clientPrincipalId.trim()) {
                    validatePrincipal(formData.clientPrincipalId);
                  }
                }}
                required
                className={`bg-neutral-950 border-neutral-700 text-white font-mono ${
                  principalError ? 'border-red-500' : ''
                }`}
              />
              {principalError && (
                <p className="text-red-500 text-sm">{principalError}</p>
              )}
              <p className="text-xs text-white/50">
                The Principal ID of the client for whom you're creating this login account
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-white">
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  maxLength={10}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
            </div>

            <p className="text-xs text-white/50">* At least one of Email or Mobile is required</p>

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
                className="bg-neutral-950 border-neutral-700 text-white"
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
                className="bg-neutral-950 border-neutral-700 text-white"
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
                className="bg-neutral-950 border-neutral-700 text-white min-h-20"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating and Linking Account...
                </>
              ) : (
                'Create and Link Account'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-900/20 border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Client account created and linked successfully!
              </AlertDescription>
            </Alert>

            <Alert className="bg-yellow-900/20 border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                <strong>Important:</strong> This temporary password will only be shown once. Make sure to copy it now.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-white">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="bg-neutral-950 border-neutral-700 text-white font-mono text-lg"
                />
                <Button
                  type="button"
                  onClick={handleCopyPassword}
                  variant="outline"
                  className="border-neutral-700 hover:bg-neutral-800"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Alert className="bg-blue-900/20 border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-400 text-sm">
                Share this password with the client. They will be prompted to change it on first login.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleClose}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
