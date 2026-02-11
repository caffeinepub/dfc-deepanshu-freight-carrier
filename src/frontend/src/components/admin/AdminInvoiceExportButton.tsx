import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useExportAllInvoices } from '@/hooks/useQueries';
import { toast } from 'sonner';

export function AdminInvoiceExportButton() {
  const exportMutation = useExportAllInvoices();

  const handleExport = async () => {
    try {
      const csvData = await exportMutation.mutateAsync();
      
      const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoices exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export invoices');
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exportMutation.isPending}
      className="bg-gold hover:bg-gold/90 text-black font-semibold"
    >
      {exportMutation.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Export All Invoices
        </>
      )}
    </Button>
  );
}
