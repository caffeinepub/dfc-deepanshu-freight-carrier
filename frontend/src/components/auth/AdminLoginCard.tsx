import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';

export function AdminLoginCard() {
  const { login, isActorFetching } = useAdminSession();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(password);
      // On success the adminToken state updates and the parent re-renders to show the dashboard
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only disable while actively logging in; don't block on isActorFetching so
  // the user can still attempt login once the actor becomes available.
  const isDisabled = isLoading;

  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold text-2xl">Admin Login</CardTitle>
            <CardDescription className="text-white/70 text-base mt-1">
              Enter password to access admin dashboard
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
              autoFocus
              disabled={isDisabled}
              className="bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50 h-12 disabled:opacity-50"
            />
          </div>

          {error && (
            <Alert className="bg-neutral-800 border-gold/50">
              <AlertCircle className="h-4 w-4 text-gold" />
              <AlertDescription className="text-white/90">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isActorFetching && !isLoading && !error && (
            <Alert className="bg-blue-950/50 border-blue-900">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-white/90">
                Initializing service...
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isDisabled || !password.trim()}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg h-12 rounded-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
