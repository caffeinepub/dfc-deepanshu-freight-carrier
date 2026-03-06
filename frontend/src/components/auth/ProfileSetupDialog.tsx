import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ProfileSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSetupDialog({ open, onClose }: ProfileSetupDialogProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    gstNumber: '',
    address: '',
    mobile: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // This component is deprecated and not used in password-only mode
    // Keeping it for compatibility but it won't be rendered
    
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-white/70">
            Please provide your company details to continue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-white">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="bg-neutral-950 border-neutral-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber" className="text-white">GST Number</Label>
            <Input
              id="gstNumber"
              type="text"
              required
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="bg-neutral-950 border-neutral-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">Address</Label>
            <Textarea
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="bg-neutral-950 border-neutral-700 text-white min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-white">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="bg-neutral-950 border-neutral-700 text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
