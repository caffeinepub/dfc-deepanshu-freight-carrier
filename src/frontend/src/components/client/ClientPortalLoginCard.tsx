import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientLogin } from '../../hooks/useQueries';
import { Loader2, Mail, AlertCircle } from 'lucide-react';
import { validateClientIdentifier } from '../../utils/clientIdentifier';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';

export function ClientPortalLoginCard() {
  const [passwordIdentifier, setPasswordIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');

  const clientLogin = useClientLogin();

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
    } catch (error: any) {
      const userMessage = getClientAuthErrorMessage(error);
      setIdentifierError(userMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto">
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
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
