import { useState } from 'react';
import { useGetAllClients } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ChevronRight } from 'lucide-react';
import type { Client } from '../../backend';

interface AdminClientsTableProps {
  onSelectClient: (client: Client) => void;
}

export function AdminClientsTable({ onSelectClient }: AdminClientsTableProps) {
  const { data: clients = [], isLoading } = useGetAllClients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((client) =>
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mobile.includes(searchTerm)
  );

  if (isLoading) {
    return <div className="text-white/70 text-center py-8">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-white/70 text-center py-8">
        No clients found. Add your first client using the form above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <Input
          type="text"
          placeholder="Search by company name, GST, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
        />
      </div>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-950 hover:bg-neutral-950 border-neutral-800">
              <TableHead className="text-gold">Company Name</TableHead>
              <TableHead className="text-gold">GST Number</TableHead>
              <TableHead className="text-gold">Mobile</TableHead>
              <TableHead className="text-gold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id.toString()}
                className="border-neutral-800 hover:bg-neutral-800/50 cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                <TableCell className="text-white font-medium">{client.companyName}</TableCell>
                <TableCell className="text-white/80">{client.gstNumber}</TableCell>
                <TableCell className="text-white/80">{client.mobile}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClient(client);
                    }}
                    className="text-gold hover:text-gold hover:bg-gold/10"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredClients.length === 0 && searchTerm && (
        <div className="text-white/70 text-center py-4">
          No clients match your search criteria.
        </div>
      )}
    </div>
  );
}
