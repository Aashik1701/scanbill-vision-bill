
import React from 'react';
import { Product } from '@/types';
import ProductList from './ProductList';
import BillSummary from './BillSummary';
import { ShoppingBasket } from 'lucide-react';

interface SidebarProps {
  products: Product[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveProduct: (id: string) => void;
  onGenerateBill: () => void;
  onSendEmail: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  products,
  onUpdateQuantity,
  onRemoveProduct,
  onGenerateBill,
  onSendEmail,
  className = ""
}) => {
  return (
    <div className={`bg-sidebar flex flex-col h-full text-sidebar-foreground border-l border-sidebar-border ${className}`}>
      <div className="p-4 border-b border-sidebar-border flex items-center">
        <ShoppingBasket className="h-5 w-5 mr-2 text-sidebar-primary" />
        <h2 className="font-semibold">Scanned Products</h2>
        {products.length > 0 && (
          <span className="ml-2 bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium rounded-full px-2 py-0.5">
            {products.length}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <ProductList 
          products={products}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveProduct={onRemoveProduct}
        />
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <BillSummary 
          products={products}
          onGenerateBill={onGenerateBill}
          onSendEmail={onSendEmail}
        />
      </div>
    </div>
  );
};

export default Sidebar;
