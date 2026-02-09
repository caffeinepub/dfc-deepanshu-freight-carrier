import { useState } from 'react';
import { useGetInvoicesByClient, useCreateInvoice } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, FileText, Download, MessageCircle } from 'lucide-react';
import { generateInvoicePDF } from '../../lib/pdf/invoicePdf';
import { generateWhatsAppReminderLink } from '../../lib/whatsapp';
import type { Client, Invoice, InvoiceStatus } from '../../backend';

interface AdminInvoicesTableProps {
  client: Client;
}

export function AdminInvoicesTable({ client }: AdminInvoicesTableProps) {
  const { data: invoices, isLoading } = useGetInvoicesByClient(client.id);
  const createInvoice = useCreateInvoice();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: '',
    amount: '',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueDateTimestamp = BigInt(new Date(formData.dueDate).getTime() * 1000000);
      await createInvoice.mutateAsync({
        invoiceNo: BigInt(formData.invoiceNo),
        amount: BigInt(formData.amount),
        dueDate: dueDateTimestamp,
        client: client.id,
      });
      setFormData({ invoiceNo: '', amount: '', dueDate: '' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusMap: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
      paid: { label: 'Paid', variant: 'default', className: 'bg-green-600 hover:bg-green-700' },
      pending: { label: 'Pending', variant: 'secondary', className: 'bg-yellow-600 hover:bg-yellow-700' },
      overdue: { label: 'Overdue', variant: 'destructive', className: 'bg-red-600 hover:bg-red-700' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    generateInvoicePDF({
      invoiceNo: invoice.invoiceNo.toString(),
      companyName: client.companyName,
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: new Date(Number(invoice.dueDate) / 1000000),
      gstNumber: client.gstNumber,
      address: client.address,
    });
  };

  const handleWhatsAppReminder = (invoice: Invoice) => {
    const link = generateWhatsAppReminderLink({
      mobile: client.mobile,
      invoiceNo: invoice.invoiceNo.toString(),
      amount: Number(invoice.amount),
      companyName: client.companyName,
    });
    window.open(link, '_blank');
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gold">Invoices</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold/90 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-gold">Add New Invoice</DialogTitle>
                <DialogDescription className="text-white/70">
                  Create a new invoice for {client.companyName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo" className="text-white">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    type="number"
                    required
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="e.g., 1001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-white">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-neutral-950 border-neutral-700 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createInvoice.isPending}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
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
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-950 border-neutral-800 hover:bg-neutral-950">
                  <TableHead className="text-gold">Invoice #</TableHead>
                  <TableHead className="text-gold">Amount</TableHead>
                  <TableHead className="text-gold">Due Date</TableHead>
                  <TableHead className="text-gold">Status</TableHead>
                  <TableHead className="text-gold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoiceNo.toString()} className="border-neutral-800">
                    <TableCell className="text-white font-medium">#{invoice.invoiceNo.toString()}</TableCell>
                    <TableCell className="text-white/90">₹{invoice.amount.toString()}</TableCell>
                    <TableCell className="text-white/70">
                      {new Date(Number(invoice.dueDate) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        className="text-gold hover:text-gold hover:bg-gold/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWhatsAppReminder(invoice)}
                          className="text-green-500 hover:text-green-500 hover:bg-green-500/10"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No invoices yet for this client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
