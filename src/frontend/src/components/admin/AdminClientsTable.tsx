import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { useGetAllClients } from '../../hooks/useQueries';
import type { Client } from '../../lib/types';

interface AdminClientsTableProps {
  onSelectClient: (client: Client) => void;
}

export function AdminClientsTable({ onSelectClient }: AdminClientsTableProps) {
  const { data: clientsData, isLoading, refetch, isFetching } = useGetAllClients();
  const [searchTerm, setSearchTerm] = useState('');

  const clients = clientsData?.clientAccounts || [];
  const filteredClients = clients.filter(account =>
    account.profile.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-neutral-800" />
            <Skeleton className="h-10 w-full bg-neutral-800" />
            <Skeleton className="h-10 w-full bg-neutral-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gold">Client Accounts</CardTitle>
            <CardDescription className="text-white/70">
              Manage client accounts and profiles
            </CardDescription>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:bg-neutral-800 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by company name or identifier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
            />
          </div>

          <div className="rounded-md border border-neutral-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                  <TableHead className="text-gold">Company Name</TableHead>
                  <TableHead className="text-gold">Identifier</TableHead>
                  <TableHead className="text-gold">Mobile</TableHead>
                  <TableHead className="text-gold">GST Number</TableHead>
                  <TableHead className="text-gold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-white/50 py-8">
                      {searchTerm ? 'No clients found matching your search' : 'No client accounts yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((account) => (
                    <TableRow
                      key={account.identifier}
                      className="border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <TableCell className="text-white font-medium">
                        {account.profile.companyName}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {account.identifier}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {account.profile.mobile || account.mobile || 'N/A'}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {account.profile.gstNumber}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            if (account.linkedPrincipal) {
                              const client: Client = {
                                id: account.linkedPrincipal,
                                companyName: account.profile.companyName,
                                gstNumber: account.profile.gstNumber,
                                address: account.profile.address,
                                mobile: account.profile.mobile,
                              };
                              onSelectClient(client);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-gold hover:text-gold/80 hover:bg-neutral-800"
                          disabled={!account.linkedPrincipal}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
