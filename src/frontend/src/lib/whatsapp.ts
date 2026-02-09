interface WhatsAppReminderData {
  mobile: string;
  invoiceNo: string;
  amount: number;
  companyName: string;
}

export function generateWhatsAppReminderLink(data: WhatsAppReminderData): string {
  // Remove any non-digit characters from mobile number
  const cleanMobile = data.mobile.replace(/\D/g, '');
  
  // Ensure mobile starts with country code (91 for India)
  const formattedMobile = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;
  
  // Create the reminder message
  const message = `Dear ${data.companyName},

This is a payment reminder from Deepanshu Freight Carrier (DFC).

Invoice Number: INV${data.invoiceNo}
Amount Due: ₹${data.amount.toLocaleString()}

Please clear your pending dues at your earliest convenience.

For any queries, contact us at 9817783604.

Thank you!`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Return WhatsApp deep link
  return `https://wa.me/${formattedMobile}?text=${encodedMessage}`;
}
