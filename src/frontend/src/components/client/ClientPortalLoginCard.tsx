import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientLogin, useClientOtpLogin, useSendOtp } from '../../hooks/useQueries';
import { Loader2, Mail, Smartphone, AlertCircle } from 'lucide-react';
import { validateClientIdentifier } from '../../utils/clientIdentifier';

export function ClientPortalLoginCard() {
  const [passwordIdentifier, setPasswordIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const clientLogin = useClientLogin();
  const clientOtpLogin = useClientOtpLogin();
  const sendOtp = useSendOtp();

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIdentifierError('');

    const validation = validateClientIdentifier(passwordIdentifier);
    if (!validation.isValid) {
      setIdentifierError(validation.errorMessage || 'Invalid email or mobile number');
      return;
    }

    try {
      await clientLogin.mutateAsync({
        identifier: passwordIdentifier,
        password,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleSendOtp = async () => {
    setPhoneError('');

    const validation = validateClientIdentifier(phoneNumber);
    if (!validation.isValid) {
      setPhoneError(validation.errorMessage || 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    // Check if it's a mobile number (not email)
    if (phoneNumber.includes('@')) {
      setPhoneError('Please enter a mobile number, not an email address');
      return;
    }

    try {
      await sendOtp.mutateAsync(phoneNumber);
      setOtpSent(true);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleOtpLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await clientOtpLogin.mutateAsync({
        phoneNumber,
        otp,
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900">
          <TabsTrigger value="password" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            <Mail className="w-4 h-4 mr-2" />
            Password
          </TabsTrigger>
          <TabsTrigger value="otp" className="data-[state=active]:bg-gold data-[state=active]:text-black">
            <Smartphone className="w-4 h-4 mr-2" />
            OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-gold">Login with Password</CardTitle>
              <CardDescription className="text-white/70">
                Enter your email or mobile number and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-white">
                    Email or Mobile Number
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={passwordIdentifier}
                    onChange={(e) => {
                      setPasswordIdentifier(e.target.value);
                      setIdentifierError('');
                    }}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="email@example.com or 9876543210"
                  />
                  {identifierError && (
                    <Alert className="bg-red-900/20 border-red-800 py-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400 text-sm">
                        {identifierError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={clientLogin.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                >
                  {clientLogin.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="otp">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-gold">Login with OTP</CardTitle>
              <CardDescription className="text-white/70">
                Enter your mobile number to receive an OTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Mobile Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError('');
                    }}
                    required
                    disabled={otpSent}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="9876543210"
                  />
                  {phoneError && (
                    <Alert className="bg-red-900/20 border-red-800 py-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400 text-sm">
                        {phoneError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendOtp.isPending}
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
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-white">
                        Enter OTP
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={4}
                        className="bg-neutral-950 border-neutral-700 text-white"
                        placeholder="1234"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={clientOtpLogin.isPending}
                      className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
                    >
                      {clientOtpLogin.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Login'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                      }}
                      className="w-full text-white/70 hover:text-white"
                    >
                      Change Number
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
