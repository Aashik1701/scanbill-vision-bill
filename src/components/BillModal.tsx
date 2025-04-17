
import React from 'react';
import { Bill } from '@/types';
import { formatCurrency } from '@/utils/billing';
import { X, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [email, setEmail] = React.useState('');

  if (!bill) return null;

  const handleSendEmail = () => {
    onSendEmail(email);
    setEmail('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Bill #{bill.id.substring(0, 8)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-right text-muted-foreground text-sm">
            {formatDate(bill.date)}
          </div>

          <div className="border rounded-md">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                    Item
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-left">{product.name}</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-2 text-right">{product.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(product.price * product.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(bill.tax)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(bill.grandTotal)}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="email">Send bill to email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="customer@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={!email}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillModal;
