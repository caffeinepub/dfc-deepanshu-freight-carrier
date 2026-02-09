import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  useAuthenticateClient,
  useSendOtp,
  useVerifyOtpAndAuthenticate,
  useIsMsg91ApiKeyStored,
} from '../../hooks/useQueries';
import { Loader2, Lock, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';
import { validateClientIdentifier } from '../../utils/clientIdentifier';

export function ClientPortalLoginCard() {
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');

  // Password login state
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // OTP login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const authenticateClient = useAuthenticateClient();
  const sendOtp = useSendOtp();
  const verifyOtpAndAuth = useVerifyOtpAndAuthenticate();
  const { data: isMsg91Configured } = useIsMsg91ApiKeyStored();

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate identifier format before calling backend
    const validation = validateClientIdentifier(emailOrMobile);
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid email or mobile number');
      return;
    }

    try {
      await authenticateClient.mutateAsync({ 
        emailOrMobile: validation.normalized, 
        password 
      });
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (!isMsg91Configured) {
      toast.error('OTP service not configured. Please contact admin or use password login.');
      return;
    }

    try {
      const [success, rawResponse, statusCode] = await sendOtp.mutateAsync(phoneNumber);
      
      if (success) {
        setOtpSent(true);
        toast.success('OTP sent successfully to your mobile');
      } else {
        console.error('OTP send failed:', { rawResponse, statusCode });
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (otp.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    try {
      await verifyOtpAndAuth.mutateAsync({ phoneNumber, otp });
      toast.success('Login successful');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    }
  };

  const resetOtpFlow = () => {
    setOtpSent(false);
    setOtp('');
  };

  // Clear validation error when user types
  const handleEmailOrMobileChange = (value: string) => {
    setEmailOrMobile(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold text-2xl">Client Login</CardTitle>
          <CardDescription className="text-white/70">
            Sign in to access your shipments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMode} onValueChange={(v) => setLoginMode(v as 'password' | 'otp')}>
            <TabsList className="grid w-full grid-cols-2 bg-neutral-950">
              <TabsTrigger value="password" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="data-[state=active]:bg-gold data-[state=active]:text-black">
                <Smartphone className="w-4 h-4 mr-2" />
                OTP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 mt-6">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrMobile" className="text-white">
                    Email or Mobile Number
                  </Label>
                  <Input
                    id="emailOrMobile"
                    type="text"
                    placeholder="Enter your email or mobile"
                    value={emailOrMobile}
                    onChange={(e) => handleEmailOrMobileChange(e.target.value)}
                    required
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  type="submit"
                  disabled={authenticateClient.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  {authenticateClient.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="otp" className="space-y-4 mt-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">
                      Mobile Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-white/50">Enter mobile number without country code</p>
                  </div>

                  {!isMsg91Configured && (
                    <Alert className="bg-yellow-900/20 border-yellow-800">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-yellow-400">
                        OTP service not configured. Please use password login.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={sendOtp.isPending || !isMsg91Configured}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                  >
                    {sendOtp.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-white">
                      Enter OTP
                    </Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="bg-neutral-950 border-neutral-700 text-white" />
                          <InputOTPSlot index={1} className="bg-neutral-950 border-neutral-700 text-white" />
                          <InputOTPSlot index={2} className="bg-neutral-950 border-neutral-700 text-white" />
                          <InputOTPSlot index={3} className="bg-neutral-950 border-neutral-700 text-white" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-white/50 text-center">
                      OTP sent to +91{phoneNumber}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetOtpFlow}
                      className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
                    >
                      Change Number
                    </Button>
                    <Button
                      type="submit"
                      disabled={verifyOtpAndAuth.isPending || otp.length !== 4}
                      className="flex-1 bg-gold hover:bg-gold/90 text-black font-semibold"
                    >
                      {verifyOtpAndAuth.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Login'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
