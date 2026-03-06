import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientLogin, useSendOtp, useVerifyOtp } from '../../hooks/useQueries';
import { Loader2, LogIn, Smartphone, AlertCircle } from 'lucide-react';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';

export function ClientPortalLoginCard() {
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  
  // Password login state
  const [passwordForm, setPasswordForm] = useState({ identifier: '', password: '' });
  const [passwordError, setPasswordError] = useState('');
  
  // OTP login state
  const [otpForm, setOtpForm] = useState({ phoneNumber: '', otp: '' });
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const clientLogin = useClientLogin();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.identifier.trim() || !passwordForm.password.trim()) {
      setPasswordError('Please enter both email/mobile and password');
      return;
    }

    try {
      await clientLogin.mutateAsync({
        identifier: passwordForm.identifier.trim(),
        password: passwordForm.password,
      });
      // Success - navigation handled by parent component
    } catch (error: any) {
      const userMessage = getClientAuthErrorMessage(error);
      setPasswordError(userMessage);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (!otpForm.phoneNumber.trim()) {
      setOtpError('Please enter your mobile number');
      return;
    }

    if (otpForm.phoneNumber.length !== 10) {
      setOtpError('Mobile number must be exactly 10 digits');
      return;
    }

    try {
      await sendOtp.mutateAsync(otpForm.phoneNumber);
      setOtpSent(true);
    } catch (error: any) {
      const userMessage = getClientAuthErrorMessage(error);
      setOtpError(userMessage);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (!otpForm.otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    try {
      await verifyOtp.mutateAsync({
        phoneNumber: otpForm.phoneNumber,
        otp: otpForm.otp,
      });
      // Success - navigation handled by parent component
    } catch (error: any) {
      const userMessage = getClientAuthErrorMessage(error);
      setOtpError(userMessage);
    }
  };

  const isPasswordFormValid = passwordForm.identifier.trim() && passwordForm.password.trim();
  const isOtpPhoneValid = otpForm.phoneNumber.trim().length === 10;
  const isOtpCodeValid = otpForm.otp.trim().length > 0;

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-gold text-2xl">Client Portal Login</CardTitle>
        <CardDescription className="text-white/70 text-base">
          Access your shipments and invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'password' | 'otp')}>
          <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
            <TabsTrigger value="password" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Password
            </TabsTrigger>
            <TabsTrigger value="otp" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              OTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4 mt-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-white">
                  Email or Mobile Number
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter email or mobile"
                  value={passwordForm.identifier}
                  onChange={(e) => setPasswordForm({ ...passwordForm, identifier: e.target.value })}
                  required
                  autoFocus
                  disabled={clientLogin.isPending}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  required
                  disabled={clientLogin.isPending}
                  className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
                />
              </div>

              {passwordError && (
                <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-white/90">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!isPasswordFormValid || clientLogin.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
              >
                {clientLogin.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="otp" className="space-y-4 mt-4">
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
                    value={otpForm.phoneNumber}
                    onChange={(e) => setOtpForm({ ...otpForm, phoneNumber: e.target.value })}
                    maxLength={10}
                    required
                    autoFocus
                    disabled={sendOtp.isPending}
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
                  />
                </div>

                {otpError && (
                  <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-white/90">
                      {otpError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={!isOtpPhoneValid || sendOtp.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
                >
                  {sendOtp.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Alert className="bg-blue-900/20 border-blue-800">
                  <AlertDescription className="text-blue-400">
                    OTP sent to {otpForm.phoneNumber}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                    maxLength={6}
                    required
                    autoFocus
                    disabled={verifyOtp.isPending}
                    className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12"
                  />
                </div>

                {otpError && (
                  <Alert variant="destructive" className="bg-red-950/50 border-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-white/90">
                      {otpError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpForm({ ...otpForm, otp: '' });
                      setOtpError('');
                    }}
                    disabled={verifyOtp.isPending}
                    className="flex-1 border-neutral-700 hover:bg-neutral-800 text-white disabled:opacity-50"
                  >
                    Change Number
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isOtpCodeValid || verifyOtp.isPending}
                    className="flex-1 bg-gold hover:bg-gold/90 text-black font-bold disabled:opacity-50"
                  >
                    {verifyOtp.isPending ? (
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
  );
}
