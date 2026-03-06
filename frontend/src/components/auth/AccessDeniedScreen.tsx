import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export function AccessDeniedScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="bg-neutral-900 border-neutral-800 max-w-md">
        <CardHeader>
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-gold text-2xl text-center">Access Denied</CardTitle>
          <CardDescription className="text-white/70 text-center">
            You do not have permission to access this section. Please contact an administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
