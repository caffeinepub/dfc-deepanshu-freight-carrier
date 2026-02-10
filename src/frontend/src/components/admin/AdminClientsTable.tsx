import { useState } from 'react';
import { useGetAllClientAccounts, useDeleteClientAccount } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ClientAccount } from '../../backend';

interface AdminClientsTableProps {
  onSelectClient?: (client: ClientAccount) => void;
}

export function AdminClientsTable({ onSelectClient }: AdminClientsTableProps) {
  const { data: clientAccounts = [], isLoading } = useGetAllClientAccounts();
  const deleteClient = useDeleteClientAccount();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clientAccounts.filter((account) =>
    account.profile.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (account.mobile && account.mobile.includes(searchTerm))
  );

  const handleDelete = async (clientCode: string) => {
    try {
      await deleteClient.mutateAsync(clientCode);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (isLoading) {
    return <div className="text-white/70 text-center py-8">Loading clients...</div>;
  }

  if (clientAccounts.length === 0) {
    return (
      <div className="text-white/70 text-center py-8">
        No clients found. Clients will appear here after they sign up.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <Input
          type="text"
          placeholder="Search by client code, company name, email, or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-neutral-950 border-neutral-700 text-white placeholder:text-white/50"
        />
      </div>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-950 hover:bg-neutral-950 border-neutral-800">
              <TableHead className="text-gold">Client Code</TableHead>
              <TableHead className="text-gold">Company Name</TableHead>
              <TableHead className="text-gold">Email</TableHead>
              <TableHead className="text-gold">Mobile</TableHead>
              <TableHead className="text-gold">Created</TableHead>
              <TableHead className="text-gold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((account) => (
              <TableRow
                key={account.clientCode}
                className="border-neutral-800 hover:bg-neutral-800/50"
              >
                <TableCell className="text-white font-mono font-semibold">{account.clientCode}</TableCell>
                <TableCell className="text-white font-medium">{account.profile.companyName}</TableCell>
                <TableCell className="text-white/80">{account.email || '-'}</TableCell>
                <TableCell className="text-white/80">{account.mobile || '-'}</TableCell>
                <TableCell className="text-white/80">
                  {new Date(Number(account.createdAt) / 1_000_000).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Delete Client</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to delete client <span className="font-mono font-semibold text-gold">{account.clientCode}</span> ({account.profile.companyName})? 
                          This action cannot be undone and will prevent them from logging in.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-neutral-800 text-white hover:bg-neutral-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(account.clientCode)}
                          disabled={deleteClient.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {deleteClient.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
