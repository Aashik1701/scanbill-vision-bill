
import React from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { formatCurrency, calculateSubtotal, calculateTax } from '@/utils/billing';
import { Send, FileText } from 'lucide-react';

interface BillSummaryProps {
  products: Product[];
  taxRate?: number;
  onGenerateBill: () => void;
  onSendEmail: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({
  products,
  taxRate = 0.1,
  onGenerateBill,
  onSendEmail
}) => {
  const subtotal = calculateSubtotal(products);
  const tax = calculateTax(subtotal, taxRate);
  const total = subtotal + tax;
  
  return (
    <div className="border-t pt-4 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-medium text-lg">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={onGenerateBill}
          className="w-full"
          disabled={products.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generate Bill
        </Button>
        <Button 
          onClick={onSendEmail}
          variant="outline"
          className="w-full"
          disabled={products.length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Send to Email
        </Button>
      </div>
    </div>
  );
};

export default BillSummary;
