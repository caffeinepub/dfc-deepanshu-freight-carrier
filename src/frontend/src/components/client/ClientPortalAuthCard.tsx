import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientPortalLoginCard } from './ClientPortalLoginCard';
import { ClientSignupCard } from './ClientSignupCard';
import { LogIn, UserPlus } from 'lucide-react';

export function ClientPortalAuthCard() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleSignupSuccess = () => {
    setActiveTab('login');
  };

  return (
    <div className="max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900 mb-6">
          <TabsTrigger 
            value="login" 
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </TabsTrigger>
          <TabsTrigger 
            value="signup" 
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <ClientPortalLoginCard />
        </TabsContent>

        <TabsContent value="signup">
          <ClientSignupCard onSuccess={handleSignupSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
