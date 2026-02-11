import { useState } from 'react';
import { useGetAllClients } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, RefreshCw } from 'lucide-react';
import { AdminClientDetail } from './AdminClientDetail';

export function AdminClientsTable() {
  const { data: clients, isLoading, refetch, isFetching } = useGetAllClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients?.filter(client =>
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mobile.includes(searchTerm)
  );

  if (selectedClient) {
    return <AdminClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Clients
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-gold text-gold hover:bg-gold/10"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="Search by company, GST, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-950 border-neutral-700 text-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : filteredClients && filteredClients.length > 0 ? (
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-950 border-neutral-800 hover:bg-neutral-950">
                  <TableHead className="text-gold">Company Name</TableHead>
                  <TableHead className="text-gold">GST Number</TableHead>
                  <TableHead className="text-gold">Mobile</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id.toString()} className="border-neutral-800">
                    <TableCell className="text-white font-medium">{client.companyName}</TableCell>
                    <TableCell className="text-white/90">{client.gstNumber}</TableCell>
                    <TableCell className="text-white/70">{client.mobile}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => setSelectedClient(client)}
                        className="bg-gold hover:bg-gold/90 text-black"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>
              {searchTerm
                ? 'No clients found matching your search.'
                : 'No clients yet. Clients will appear here after they sign up or are created by admin.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
