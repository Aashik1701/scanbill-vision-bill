
import React from 'react';
import { Product } from '@/types';
import { formatCurrency, calculateProductTotal } from '@/utils/billing';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductListProps {
  products: Product[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onUpdateQuantity,
  onRemoveProduct
}) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <p>No products scanned yet</p>
        <p className="text-sm mt-2">Point your camera at products to scan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="flex items-center justify-between p-3 bg-card rounded-md shadow-sm border border-border"
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-card-foreground truncate">{product.name}</h4>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-muted-foreground">
                {formatCurrency(product.price)} × {product.quantity}
              </span>
              <span className="font-medium">
                {formatCurrency(calculateProductTotal(product))}
              </span>
            </div>
          </div>
          
          <div className="flex items-center ml-4 space-x-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-l-md"
                onClick={() => onUpdateQuantity(product.id, Math.max(1, product.quantity - 1))}
                disabled={product.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{product.quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-r-md"
                onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive/80"
              onClick={() => onRemoveProduct(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
