import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, AlertCircle } from 'lucide-react';

// This component is deprecated in the password-only admin flow
// Kept for compatibility but should not be rendered
export function AdminBootstrapCard() {
  return (
    <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gold" />
          </div>
          <div>
            <CardTitle className="text-gold text-2xl">Admin Access</CardTitle>
            <CardDescription className="text-white/70 text-base mt-1">
              This feature is not available
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="bg-red-950/50 border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-white/90">
            Internet Identity-based admin bootstrap is not available in password-only mode.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
