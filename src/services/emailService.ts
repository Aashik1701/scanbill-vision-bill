
import { Bill } from '@/types';
import { formatCurrency } from '@/utils/billing';

// Email service for sending bills
export async function sendBillEmail(email: string, bill: Bill): Promise<boolean> {
  try {
    console.log(`Sending bill email to: ${email}`);
    
    // Generate email content
    const emailContent = generateEmailContent(bill);
    
    // In a real application, you would integrate with an email API like SendGrid, Mailchimp, etc.
    // For this example, we'll create a simulated email service
    
    // Normally, you would make an API call like this:
    // const response = await fetch('https://api.emailservice.com/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: email,
    //     subject: `Your Receipt - Order #${bill.id}`,
    //     html: emailContent
    //   })
    // });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Email sent successfully', { to: email, billId: bill.id });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Generate HTML email content from bill
function generateEmailContent(bill: Bill): string {
  const date = new Date(bill.date).toLocaleDateString();
  
  // Create items HTML
  const itemsHtml = bill.products
    .map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(product.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(product.price * product.quantity)}</td>
      </tr>
    `)
    .join('');
  
  // Email template
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #6E59A5; padding: 20px; color: white;">
        <h1 style="margin: 0;">ScanBill Receipt</h1>
        <p>Order #${bill.id}</p>
        <p>Date: ${date}</p>
      </div>
      
      <div style="padding: 20px;">
        <h2>Your Receipt</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f3f3;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px;">${formatCurrency(bill.total)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Tax:</td>
              <td style="padding: 10px;">${formatCurrency(bill.tax)}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; font-weight: bold;">${formatCurrency(bill.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p>Thank you for your purchase!</p>
          <p>ScanBill Assistant</p>
        </div>
      </div>
    </div>
  `;
}
