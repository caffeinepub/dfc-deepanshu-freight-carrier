import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';

interface ProfileSetupDialogProps {
  isAuthenticated: boolean;
}

// This component is no longer required in the password-only admin flow
// Kept for compatibility but not actively used
export function ProfileSetupDialog({ isAuthenticated }: ProfileSetupDialogProps) {
  // Component is not used in the new password-only admin flow
  return null;
}
