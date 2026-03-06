import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSetMsg91ApiKey, useVerifyMsg91Token, useIsMsg91ApiKeyStored } from '../../hooks/useQueries';
import { Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export function AdminMsg91Panel() {
  const [apiKey, setApiKey] = useState('');
  const { data: isStored, isLoading: isCheckingStorage } = useIsMsg91ApiKeyStored();
  const setKey = useSetMsg91ApiKey();
  const verifyToken = useVerifyMsg91Token();

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    await setKey.mutateAsync(apiKey);
    setApiKey('');
  };

  const handleVerify = async () => {
    if (!apiKey.trim()) return;
    await verifyToken.mutateAsync(apiKey);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold">MSG91 API Configuration</CardTitle>
            <CardDescription className="text-white/70">
              Configure MSG91 API key for OTP functionality
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckingStorage ? (
          <div className="flex items-center gap-2 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking storage status...</span>
          </div>
        ) : isStored ? (
          <Alert className="bg-green-900/20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              MSG91 API key is configured and stored
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-900/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400">
              MSG91 API key is not configured. OTP functionality will not work.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="msg91ApiKey" className="text-white">
            MSG91 API Key
          </Label>
          <Input
            id="msg91ApiKey"
            type="password"
            placeholder="Enter MSG91 API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-neutral-950 border-neutral-700 text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || setKey.isPending}
            className="flex-1 bg-gold hover:bg-gold/90 text-black"
          >
            {setKey.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save API Key'
            )}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={!apiKey.trim() || verifyToken.isPending}
            variant="outline"
            className="flex-1 border-neutral-700 hover:bg-neutral-800 text-white"
          >
            {verifyToken.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Token'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
