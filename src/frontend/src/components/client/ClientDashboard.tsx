import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientShipmentsTable } from './ClientShipmentsTable';
import { ClientInvoicesTable } from './ClientInvoicesTable';
import { useClientLogout } from '../../hooks/useQueries';
import { LogOut, Package, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ClientDashboard() {
  const clientLogout = useClientLogout();

  const handleLogout = async () => {
    try {
      await clientLogout.mutateAsync();
      toast.success('Logged out successfully');
      
      // Scroll to client portal section
      const element = document.getElementById('client-portal');
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gold text-2xl">Welcome to Your Dashboard</CardTitle>
            <Button
              onClick={handleLogout}
              disabled={clientLogout.isPending}
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10"
            >
              {clientLogout.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            View and manage your shipments and invoices from your account.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="shipments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900">
          <TabsTrigger
            value="shipments"
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <Package className="w-4 h-4 mr-2" />
            My Shipments
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="data-[state=active]:bg-gold data-[state=active]:text-black"
          >
            <FileText className="w-4 h-4 mr-2" />
            My Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-6">
          <ClientShipmentsTable />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <ClientInvoicesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
