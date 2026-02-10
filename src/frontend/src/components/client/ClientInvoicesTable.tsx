import { useGetInvoicesByClient, useGetClientAccountStatus } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, CreditCard } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '../../backend';

export function ClientInvoicesTable() {
  const { data: accountStatus } = useGetClientAccountStatus();
  const clientId = accountStatus?.clientId || null;
  
  const { data: invoices, isLoading } = useGetInvoicesByClient(clientId);

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusMap: Record<InvoiceStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; className?: string }> = {
      paid: { label: 'Paid', variant: 'default', className: 'bg-green-600 hover:bg-green-700' },
      pending: { label: 'Pending', variant: 'secondary', className: 'bg-yellow-600 hover:bg-yellow-700' },
      overdue: { label: 'Overdue', variant: 'destructive', className: 'bg-red-600 hover:bg-red-700' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // PDF generation would require client profile data
    console.log('Download PDF for invoice:', invoice.invoiceNo);
  };

  const handlePayNow = (invoice: Invoice) => {
    const paymentUrl = `https://example.com/pay?invoice=${invoice.invoiceNo}&amount=${invoice.amount}`;
    window.open(paymentUrl, '_blank');
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold">My Invoices</CardTitle>
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
                  <TableHead className="text-gold">Invoice No</TableHead>
                  <TableHead className="text-gold">Amount</TableHead>
                  <TableHead className="text-gold">Due Date</TableHead>
                  <TableHead className="text-gold">Status</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoiceNo.toString()} className="border-neutral-800">
                    <TableCell className="text-white font-medium">INV{invoice.invoiceNo.toString()}</TableCell>
                    <TableCell className="text-white/90">₹{Number(invoice.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-white/70">
                      {new Date(Number(invoice.dueDate) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice)}
                          className="border-gold text-gold hover:bg-gold/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        {invoice.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(invoice)}
                            className="bg-gold hover:bg-gold/90 text-black"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-white/50">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No invoices yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
