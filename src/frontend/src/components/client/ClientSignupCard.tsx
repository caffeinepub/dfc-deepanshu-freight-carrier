import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useClientSignup } from '../../hooks/useQueries';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';
import { validateClientIdentifier } from '../../utils/clientIdentifier';

interface ClientSignupCardProps {
  onSuccess: () => void;
}

export function ClientSignupCard({ onSuccess }: ClientSignupCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clientSignup = useClientSignup();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Validate email format
    const emailValidation = validateClientIdentifier(email);
    if (!emailValidation.isValid || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Validate mobile format (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      setValidationError('Mobile number must be exactly 10 digits');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate required fields
    if (!companyName.trim() || !address.trim()) {
      setValidationError('All fields are required');
      return;
    }

    try {
      await clientSignup.mutateAsync({
        email: emailValidation.normalized,
        password,
        profile: {
          companyName: companyName.trim(),
          gstNumber: gstNumber.trim(),
          address: address.trim(),
          mobile: mobile.trim(),
        },
      });

      setSuccessMessage('Account created successfully! Please log in with your credentials.');
      
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCompanyName('');
      setGstNumber('');
      setAddress('');
      setMobile('');

      // Navigate back to login after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      const userMessage = getClientAuthErrorMessage(error);
      setValidationError(userMessage);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold text-2xl">Create Account</CardTitle>
          <CardDescription className="text-white/70">
            Sign up to access your shipments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-white">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                pattern="[0-9]{10}"
                maxLength={10}
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-white">
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-white">
                GST Number (Optional)
              </Label>
              <Input
                id="gstNumber"
                type="text"
                placeholder="Enter GST number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-white">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter company address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
              />
            </div>

            {validationError && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="bg-green-900/20 border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={clientSignup.isPending}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {clientSignup.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
