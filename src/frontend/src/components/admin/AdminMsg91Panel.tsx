import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { useIsMsg91ApiKeyStored, useStoreMsg91ApiKey, useVerifyMsg91AccessToken } from '@/hooks/useQueries';
import { toast } from 'sonner';

export function AdminMsg91Panel() {
  const { data: isApiKeyStored, isLoading: checkingKey } = useIsMsg91ApiKeyStored();
  const storeApiKeyMutation = useStoreMsg91ApiKey();
  const verifyTokenMutation = useVerifyMsg91AccessToken();

  const [apiKey, setApiKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    statusCode: number;
    rawResponse: string;
  } | null>(null);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      await storeApiKeyMutation.mutateAsync(apiKey);
      toast.success('MSG91 API key saved successfully');
      setApiKey(''); // Clear input after successful save
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Unauthorized: Only admins can save the API key');
      } else if (errorMessage.includes('Invalid API key')) {
        toast.error('Invalid API key: API key cannot be empty');
      } else {
        toast.error('Failed to save API key. Please try again.');
      }
    }
  };

  const handleVerifyAccessToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken.trim()) {
      toast.error('Please enter an access token');
      return;
    }

    setVerificationResult(null);

    try {
      const [backendSuccess, rawResponse, statusCode] = await verifyTokenMutation.mutateAsync(accessToken);
      
      // Parse the raw response to determine actual success/failure
      // MSG91 returns JSON with type: "success" or "error"
      let actualSuccess = backendSuccess;
      let message = 'Verification completed';
      
      try {
        const parsed = JSON.parse(rawResponse);
        if (parsed.type === 'error' || parsed.message?.toLowerCase().includes('invalid') || parsed.message?.toLowerCase().includes('expired')) {
          actualSuccess = false;
          message = parsed.message || 'Verification failed';
        } else if (parsed.type === 'success') {
          actualSuccess = true;
          message = parsed.message || 'Token verified successfully';
        }
      } catch {
        // If parsing fails, check for common error patterns in raw text
        const lowerResponse = rawResponse.toLowerCase();
        if (lowerResponse.includes('error') || lowerResponse.includes('invalid') || lowerResponse.includes('expired') || lowerResponse.includes('failed')) {
          actualSuccess = false;
          message = 'Verification failed';
        }
      }
      
      setVerificationResult({
        success: actualSuccess,
        message,
        statusCode: Number(statusCode),
        rawResponse,
      });

      if (actualSuccess) {
        toast.success('Access token verified successfully');
      } else {
        toast.error('Access token verification failed');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('MSG91 API key not configured')) {
        toast.error('MSG91 API key not configured. Please save your API key first.');
        setVerificationResult({
          success: false,
          message: 'API key not configured',
          statusCode: 0,
          rawResponse: 'Please configure your MSG91 API key before verifying access tokens.',
        });
      } else {
        toast.error('Verification failed. Please try again.');
        setVerificationResult({
          success: false,
          message: 'Verification error',
          statusCode: 0,
          rawResponse: errorMessage,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Configuration Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <Key className="w-5 h-5" />
            MSG91 API Configuration
          </CardTitle>
          <CardDescription className="text-white/70">
            Configure your MSG91 authentication key for OTP verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkingKey ? (
            <div className="flex items-center gap-2 text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking configuration...</span>
            </div>
          ) : (
            <Alert className={isApiKeyStored ? 'bg-green-950/30 border-green-800' : 'bg-neutral-950 border-neutral-800'}>
              <Shield className={`w-4 h-4 ${isApiKeyStored ? 'text-green-500' : 'text-white/50'}`} />
              <AlertDescription className="text-white/90">
                {isApiKeyStored
                  ? 'MSG91 API key is configured and ready to use'
                  : 'No MSG91 API key configured. Please add your API key below.'}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-white">
                MSG91 AuthKey
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your MSG91 AuthKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/40"
                disabled={storeApiKeyMutation.isPending}
              />
              <p className="text-sm text-white/50">
                Your API key will be stored securely and not displayed after saving
              </p>
            </div>

            <Button
              type="submit"
              disabled={storeApiKeyMutation.isPending || !apiKey.trim()}
              className="bg-gold hover:bg-gold/90 text-black font-medium"
            >
              {storeApiKeyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  {isApiKeyStored ? 'Update API Key' : 'Save API Key'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Access Token Verification Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Verify Access Token
          </CardTitle>
          <CardDescription className="text-white/70">
            Test MSG91 OTP widget access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerifyAccessToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessToken" className="text-white">
                Access Token (JWT)
              </Label>
              <Input
                id="accessToken"
                type="text"
                placeholder="Paste MSG91 access token here"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white placeholder:text-white/40 font-mono text-sm"
                disabled={verifyTokenMutation.isPending}
              />
              <p className="text-sm text-white/50">
                Enter the JWT token received from the MSG91 OTP widget
              </p>
            </div>

            <Button
              type="submit"
              disabled={verifyTokenMutation.isPending || !accessToken.trim()}
              className="bg-gold hover:bg-gold/90 text-black font-medium"
            >
              {verifyTokenMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Token
                </>
              )}
            </Button>
          </form>

          {/* Verification Result */}
          {verificationResult && (
            <div className="mt-6 space-y-4">
              <Alert
                className={
                  verificationResult.success
                    ? 'bg-green-950/30 border-green-800'
                    : 'bg-red-950/30 border-red-800'
                }
              >
                {verificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <AlertDescription className="text-white/90">
                  <div className="font-medium mb-1">{verificationResult.message}</div>
                  <div className="text-sm text-white/70">
                    HTTP Status: {verificationResult.statusCode}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-white">Response Details</Label>
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
                  <pre className="text-sm text-white/80 whitespace-pre-wrap break-words font-mono">
                    {verificationResult.rawResponse}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
