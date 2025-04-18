
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bill } from '@/types';
import { formatCurrency } from '@/utils/billing';
import { sendBillEmail } from '@/services/emailService';
import { useToast } from '@/components/ui/use-toast';
import { Mail, FileText, Send, Loader2 } from 'lucide-react';

interface BillModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (email: string) => void;
}

const BillModal: React.FC<BillModalProps> = ({
  bill,
  isOpen,
  onClose,
  onSendEmail,
}) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const handleSendEmail = async () => {
    if (!bill) return;
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const success = await sendBillEmail(email, bill);
      
      if (success) {
        toast({
          title: "Email Sent",
          description: `Receipt has been sent to ${email}`,
        });
        onSendEmail(email);
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      toast({
        title: "Email Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  if (!bill) return null;
  
  const date = new Date(bill.date).toLocaleDateString();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Receipt #{bill.id.substring(0, 8)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Date: {date}</p>
          </div>
          
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Qty</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(product.price)}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(product.price * product.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={3} className="p-2 text-right font-medium">Subtotal:</td>
                  <td className="p-2 text-right">{formatCurrency(bill.total)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-2 text-right font-medium">Tax:</td>
                  <td className="p-2 text-right">{formatCurrency(bill.tax)}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td colSpan={3} className="p-2 text-right font-bold">Total:</td>
                  <td className="p-2 text-right font-bold">{formatCurrency(bill.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="border p-4 rounded-md space-y-4">
            <div className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-medium">Send Receipt</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-2"
          >
            Close
          </Button>
          <Button 
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillModal;
