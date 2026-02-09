interface InvoiceData {
  invoiceNo: string;
  companyName: string;
  amount: number;
  status: string;
  dueDate: Date;
  gstNumber: string;
  address: string;
}

export function generateInvoicePDF(data: InvoiceData) {
  // Create a simple HTML-based PDF using browser print
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${data.invoiceNo}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #D4AF37;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #D4AF37;
          margin: 0;
          font-size: 32px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .invoice-details {
          margin: 30px 0;
        }
        .invoice-details table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-details td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .invoice-details td:first-child {
          font-weight: bold;
          width: 200px;
        }
        .amount {
          background: #f9f9f9;
          padding: 20px;
          margin: 30px 0;
          border-left: 4px solid #D4AF37;
        }
        .amount h2 {
          margin: 0 0 10px 0;
          color: #333;
        }
        .amount .total {
          font-size: 28px;
          color: #D4AF37;
          font-weight: bold;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 4px;
          font-weight: bold;
        }
        .status.paid {
          background: #4CAF50;
          color: white;
        }
        .status.pending {
          background: #FFC107;
          color: black;
        }
        .status.overdue {
          background: #F44336;
          color: white;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DFC Invoice</h1>
        <p>Deepanshu Freight Carrier</p>
        <p>258, Riddhi Arcade, Steel Market, Kalamboli, Navi Mumbai</p>
        <p>Phone: 9817783604 | Email: deepanshufreightcarrier@gmail.com</p>
      </div>

      <div class="invoice-details">
        <table>
          <tr>
            <td>Invoice Number:</td>
            <td>INV${data.invoiceNo}</td>
          </tr>
          <tr>
            <td>Company Name:</td>
            <td>${data.companyName}</td>
          </tr>
          <tr>
            <td>GST Number:</td>
            <td>${data.gstNumber}</td>
          </tr>
          <tr>
            <td>Address:</td>
            <td>${data.address}</td>
          </tr>
          <tr>
            <td>Due Date:</td>
            <td>${data.dueDate.toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>Status:</td>
            <td><span class="status ${data.status}">${data.status.toUpperCase()}</span></td>
          </tr>
        </table>
      </div>

      <div class="amount">
        <h2>Total Amount</h2>
        <div class="total">₹${data.amount.toLocaleString()}</div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>For any queries, please contact us at 9817783604</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 100);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
