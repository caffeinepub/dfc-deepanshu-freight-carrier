import { useState, FormEvent } from 'react';
import { useGetInvoicesByClient, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '../../lib/types';
import type { Invoice, InvoiceStatus } from '../../backend';

interface AdminInvoicesTableProps {
  client: Client;
}

function getStatusVariant(status: InvoiceStatus): 'default' | 'destructive' | 'secondary' {
  if (typeof status === 'string') {
    if (status === 'paid') return 'default';
    if (status === 'overdue') return 'destructive';
    return 'secondary';
  }
  
  // Handle enum variant style
  const statusValue = status as any;
  if (statusValue.__kind__ === 'paid') return 'default';
  if (statusValue.__kind__ === 'overdue') return 'destructive';
  return 'secondary';
}

function getStatusLabel(status: InvoiceStatus): string {
  if (typeof status === 'string') {
    return status;
  }
  
  // Handle enum variant style
  const statusValue = status as any;
  return statusValue.__kind__ || 'pending';
}

export function AdminInvoicesTable({ client }: AdminInvoicesTableProps) {
  const { data: invoices, isLoading } = useGetInvoicesByClient();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: '',
    amount: '',
    status: 'pending',
    dueDate: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await createInvoice.mutateAsync({
        invoiceNo: Number(formData.invoiceNo),
        amount: Number(formData.amount),
        status: formData.status,
        dueDate: BigInt(new Date(formData.dueDate).getTime() * 1_000_000),
        client: client.id,
      });

      setFormData({ invoiceNo: '', amount: '', status: 'pending', dueDate: '' });
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  const handleDelete = async (invoiceNo: bigint) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await deleteInvoice.mutateAsync(Number(invoiceNo));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete invoice');
    }
  };

  const clientInvoices = invoices?.filter(inv => inv.client.toString() === client.id.toString()) || [];

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="py-8">
          <div className="space-y-4">
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
            <CardTitle className="text-gold">Invoices</CardTitle>
            <CardDescription className="text-white/70">
              Manage invoices for {client.companyName}
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">Create New Invoice</DialogTitle>
                <DialogDescription className="text-white/70">
                  Add a new invoice for {client.companyName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo" className="text-white">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    type="number"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="bg-neutral-950 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createInvoice.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 hover:bg-neutral-800/50">
                <TableHead className="text-gold">Invoice No</TableHead>
                <TableHead className="text-gold">Amount</TableHead>
                <TableHead className="text-gold">Status</TableHead>
                <TableHead className="text-gold">Due Date</TableHead>
                <TableHead className="text-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-white/50 py-8">
                    No invoices yet
                  </TableCell>
                </TableRow>
              ) : (
                clientInvoices.map((invoice) => (
                  <TableRow key={invoice.invoiceNo.toString()} className="border-neutral-800 hover:bg-neutral-800/50">
                    <TableCell className="text-white font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gold" />
                        {invoice.invoiceNo.toString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">₹{invoice.amount.toString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white/70">
                      {new Date(Number(invoice.dueDate) / 1_000_000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleDelete(invoice.invoiceNo)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400 hover:bg-neutral-800"
                        disabled={deleteInvoice.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
