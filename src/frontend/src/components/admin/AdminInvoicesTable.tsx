import { useState } from 'react';
import { useGetInvoicesByClient, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Loader2, FileText, Trash2 } from 'lucide-react';
import { InvoiceStatus } from '../../backend';
import type { Client } from '../../lib/types';

interface AdminInvoicesTableProps {
  client: Client;
}

export function AdminInvoicesTable({ client }: AdminInvoicesTableProps) {
  const { data: invoices, isLoading } = useGetInvoicesByClient(client.id);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: '',
    amount: '',
    status: 'pending' as keyof typeof InvoiceStatus,
    dueDate: '',
  });

  const handleCreate = async () => {
    await createInvoice.mutateAsync({
      invoiceNo: BigInt(formData.invoiceNo),
      amount: BigInt(formData.amount),
      status: formData.status,
      dueDate: BigInt(new Date(formData.dueDate).getTime() * 1_000_000),
      client: client.id,
    });
    setIsCreateDialogOpen(false);
    setFormData({ invoiceNo: '', amount: '', status: 'pending', dueDate: '' });
  };

  const handleDelete = async (invoiceNo: bigint) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice.mutateAsync(invoiceNo);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusMap = {
      [InvoiceStatus.paid]: { label: 'Paid', variant: 'default' as const },
      [InvoiceStatus.pending]: { label: 'Pending', variant: 'secondary' as const },
      [InvoiceStatus.overdue]: { label: 'Overdue', variant: 'destructive' as const },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-neutral-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Invoices</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/90 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-gold">Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice Number</Label>
                <Input
                  id="invoiceNo"
                  type="number"
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as keyof typeof InvoiceStatus })}
                >
                  <SelectTrigger className="bg-neutral-950 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-neutral-950 border-neutral-700 text-white"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createInvoice.isPending}
                className="w-full bg-gold hover:bg-gold/90 text-black"
              >
                {createInvoice.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                <TableHead className="text-white">Invoice No</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Due Date</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceNo.toString()} className="border-neutral-800 hover:bg-neutral-900/50">
                  <TableCell className="text-white font-mono">{invoice.invoiceNo.toString()}</TableCell>
                  <TableCell className="text-white">₹{invoice.amount.toString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-white">
                    {new Date(Number(invoice.dueDate) / 1_000_000).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice.invoiceNo)}
                      disabled={deleteInvoice.isPending}
                      className="text-red-500 hover:text-red-400 hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border border-neutral-800 rounded-lg">
          <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-white/70">No invoices found for this client</p>
        </div>
      )}
    </div>
  );
}
