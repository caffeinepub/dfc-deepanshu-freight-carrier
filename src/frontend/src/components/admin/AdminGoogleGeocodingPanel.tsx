import { useState, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsGoogleApiKeyConfigured, useStoreGoogleApiKey } from '@/hooks/useQueries';
import { Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminGoogleGeocodingPanel() {
  const [apiKey, setApiKey] = useState('');
  const { data: isConfigured, isLoading: isCheckingConfig } = useIsGoogleApiKeyConfigured();
  const storeApiKey = useStoreGoogleApiKey();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    await storeApiKey.mutateAsync(apiKey);
    setApiKey('');
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <Key className="w-5 h-5" />
          Google Geocoding API Configuration
        </CardTitle>
        <CardDescription className="text-white/70">
          Configure Google Geocoding API for address-to-coordinates conversion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckingConfig ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : isConfigured ? (
          <Alert className="bg-green-900/20 border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              Google API key is configured and ready to use.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-yellow-900/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400">
              Google API key is not configured. Please add your API key below.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleApiKey" className="text-white">
              Google API Key
            </Label>
            <Input
              id="googleApiKey"
              type="password"
              placeholder="Enter your Google API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-neutral-950 border-neutral-700 text-white"
            />
            <p className="text-xs text-white/50">
              Get your API key from{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>

          <Button
            type="submit"
            disabled={!apiKey.trim() || storeApiKey.isPending}
            className="w-full bg-gold hover:bg-gold/90 text-black font-semibold"
          >
            {storeApiKey.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Storing API Key...
              </>
            ) : (
              'Store API Key'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-neutral-950 rounded-lg space-y-2">
          <h4 className="text-white font-semibold text-sm">Setup Instructions:</h4>
          <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
            <li>Go to Google Cloud Console</li>
            <li>Enable Geocoding API for your project</li>
            <li>Create an API key with Geocoding API access</li>
            <li>Copy and paste the API key above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
