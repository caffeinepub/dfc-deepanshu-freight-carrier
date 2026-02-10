import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useIsGoogleApiKeyConfigured, useSetGoogleApiKey } from '@/hooks/useQueries';

export function AdminGoogleGeocodingPanel() {
  const [apiKey, setApiKey] = useState('');
  const { data: isConfigured, isLoading: isCheckingConfig } = useIsGoogleApiKeyConfigured();
  const setGoogleApiKeyMutation = useSetGoogleApiKey();

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      return;
    }
    await setGoogleApiKeyMutation.mutateAsync(apiKey);
    setApiKey('');
  };

  if (isCheckingConfig) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <Skeleton className="h-8 w-64 bg-neutral-800" />
          <Skeleton className="h-4 w-96 bg-neutral-800 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Google Geocoding Configuration
        </CardTitle>
        <CardDescription className="text-white/70">
          Configure Google Geocoding API key for automatic address-to-coordinates conversion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <Alert
          className={
            isConfigured
              ? 'bg-green-950/30 border-green-800/50'
              : 'bg-neutral-800 border-neutral-700'
          }
        >
          {isConfigured ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-gold" />
          )}
          <AlertDescription className="text-white/90">
            {isConfigured
              ? 'Google Geocoding API key is configured'
              : 'Google Geocoding API key is not configured'}
          </AlertDescription>
        </Alert>

        {/* Save/Update API Key Form */}
        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="googleApiKey" className="text-white/90">
              {isConfigured ? 'Update Google Geocoding API Key' : 'Google Geocoding API Key'}
            </Label>
            <Input
              id="googleApiKey"
              type="password"
              placeholder="Enter your Google Geocoding API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/40"
              disabled={setGoogleApiKeyMutation.isPending}
            />
            <p className="text-sm text-white/50">
              The API key will be stored securely and never displayed after saving.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!apiKey.trim() || setGoogleApiKeyMutation.isPending}
            className="bg-gold hover:bg-gold/90 text-black font-medium"
          >
            {setGoogleApiKeyMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isConfigured ? 'Update API Key' : 'Save API Key'}</>
            )}
          </Button>
        </form>

        {/* Information */}
        <Alert className="bg-neutral-800 border-neutral-700">
          <AlertDescription className="text-white/70 text-sm space-y-2">
            <p className="font-medium text-white/90">How to get a Google Geocoding API key:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to the Google Cloud Console</li>
              <li>Create or select a project</li>
              <li>Enable the Geocoding API</li>
              <li>Create credentials (API key)</li>
              <li>Copy and paste the API key above</li>
            </ol>
            <p className="mt-3">
              Once configured, shipments will automatically geocode addresses to coordinates when
              created.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
