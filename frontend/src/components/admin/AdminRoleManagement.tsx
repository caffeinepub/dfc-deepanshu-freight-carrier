import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function AdminRoleManagement() {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold">Role Management</CardTitle>
        <CardDescription className="text-white/70">
          Manage admin roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="bg-neutral-800 border-neutral-700">
          <AlertCircle className="h-4 w-4 text-gold" />
          <AlertDescription className="text-white/70">
            Role management is disabled in password-only authentication mode. Admin access is controlled
            through the admin password.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
