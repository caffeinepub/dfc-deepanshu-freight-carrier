import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChangeClientPassword } from '../../hooks/useQueries';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getClientAuthErrorMessage } from '../../utils/clientAuthErrors';

interface ClientPasswordChangeCardProps {
  onSuccess: () => void;
}

export function ClientPasswordChangeCard({ onSuccess }: ClientPasswordChangeCardProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const changePassword = useChangeClientPassword();

  const validateForm = (): boolean => {
    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      // Success toast is shown by the mutation
      onSuccess();
    } catch (error: any) {
      console.error('Password change error:', error);
      const userMessage = getClientAuthErrorMessage(error);
      toast.error(userMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password Required
          </CardTitle>
          <CardDescription className="text-white/70">
            For security reasons, you must change your temporary password before accessing your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-white">
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="bg-neutral-950 border-neutral-700 text-white"
              />
              <p className="text-xs text-white/50">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-neutral-950 border-neutral-700 text-white"
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
              disabled={changePassword.isPending}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
