import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientSignup } from '../../hooks/useQueries';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';
import { validateClientIdentifier } from '../../utils/clientIdentifier';

interface ClientSignupCardProps {
  onSignupSuccess: () => void;
}

export function ClientSignupCard({ onSignupSuccess }: ClientSignupCardProps) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    gstNumber: '',
    address: '',
  });
  const [error, setError] = useState('');

  const clientSignup = useClientSignup();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate identifier
    const identifierValidation = validateClientIdentifier(formData.identifier);
    if (!identifierValidation.isValid) {
      setError(identifierValidation.errorMessage || 'Invalid email or mobile number');
      return;
    }

    // Validate password
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const isEmail = formData.identifier.includes('@');
      
      await clientSignup.mutateAsync({
        identifier: formData.identifier.trim(),
        password: formData.password,
        email: isEmail ? formData.identifier.trim() : undefined,
        mobile: !isEmail ? formData.identifier.trim() : undefined,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        address: formData.address,
      });

      // Clear form and notify parent
      setFormData({
        identifier: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        gstNumber: '',
        address: '',
      });
      onSignupSuccess();
    } catch (error: any) {
      const userMessage = getClientAuthErrorMessage(error);
      setError(userMessage);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-gold text-2xl">Create Account</CardTitle>
        <CardDescription className="text-white/70 text-base">
          Sign up to access your shipments and invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-white">
              Email or Mobile Number *
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="Enter email or 10-digit mobile"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              required
              autoFocus
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
            />
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
            disabled={clientSignup.isPending}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg"
          >
            {clientSignup.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
