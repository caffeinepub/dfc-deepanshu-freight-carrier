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
import { useCreateClientAccount } from '../../hooks/useQueries';
import { Loader2, UserPlus, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AdminClientProvisionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    companyName: '',
    gstNumber: '',
    address: '',
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createAccount = useCreateClientAccount();

  const generatePassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%';
    let password = 'DFC';
    for (let i = 0; i < 9; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email && !formData.mobile) {
      toast.error('Please provide either email or mobile number');
      return;
    }

    const tempPassword = generatePassword();

    try {
      await createAccount.mutateAsync({
        email: formData.email || null,
        mobile: formData.mobile || null,
        temporaryPassword: tempPassword,
        profile: {
          companyName: formData.companyName,
          gstNumber: formData.gstNumber,
          address: formData.address,
          mobile: formData.mobile,
        },
      });

      setGeneratedPassword(tempPassword);
      toast.success('Client account created successfully');
    } catch (error: any) {
      console.error('Failed to create client account:', error);
      toast.error(error?.message || 'Failed to create client account');
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
    });
    setGeneratedPassword(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold hover:bg-gold/90 text-black font-semibold">
          <UserPlus className="w-4 h-4 mr-2" />
          Create Client Account
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl">Create New Client Account</DialogTitle>
          <DialogDescription className="text-white/70">
            Provision a new client account with login credentials
          </DialogDescription>
        </DialogHeader>

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={createAccount.isPending}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {createAccount.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-900/20 border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                Client account created successfully!
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
                  className="bg-gold hover:bg-gold/90 text-black"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-neutral-950 rounded-lg">
              <p className="text-white/90 font-semibold">Account Details:</p>
              <p className="text-white/70 text-sm">
                {formData.email && `Email: ${formData.email}`}
                {formData.email && formData.mobile && ' | '}
                {formData.mobile && `Mobile: ${formData.mobile}`}
              </p>
              <p className="text-white/70 text-sm">Company: {formData.companyName}</p>
            </div>

            <Alert className="bg-neutral-950 border-neutral-700">
              <AlertDescription className="text-white/70 text-sm">
                The client will be required to change this password on their first login.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleClose}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
