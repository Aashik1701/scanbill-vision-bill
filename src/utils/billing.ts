
import { Product, Bill } from '@/types';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Calculate subtotal for a product
export const calculateProductTotal = (product: Product): number => {
  return product.price * product.quantity;
};

// Calculate total for all products
export const calculateSubtotal = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + calculateProductTotal(product);
  }, 0);
};

// Calculate tax amount
export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return subtotal * taxRate;
};

// Generate a bill
export const generateBill = (products: Product[], taxRate: number = 0.1): Bill => {
  const subtotal = calculateSubtotal(products);
  const tax = calculateTax(subtotal, taxRate);
  
  return {
    id: generateId(),
    date: new Date(),
    products: [...products],
    total: subtotal,
    tax: tax,
    grandTotal: subtotal + tax
  };
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Mock products database (for testing before model integration)
export const mockProducts: Record<string, Omit<Product, 'id' | 'quantity'>> = {
  'apple': { name: 'Apple', price: 1.99 },
  'banana': { name: 'Banana', price: 0.99 },
  'orange': { name: 'Orange', price: 1.49 },
  'milk': { name: 'Milk', price: 3.99 },
  'bread': { name: 'Bread', price: 2.49 },
  'eggs': { name: 'Eggs', price: 4.99 },
  'water': { name: 'Water Bottle', price: 1.29 },
  'soda': { name: 'Soda Can', price: 1.99 },
  'chips': { name: 'Potato Chips', price: 3.49 },
  'chocolate': { name: 'Chocolate Bar', price: 2.99 }
};

// Find product info from detected class
export const findProductInfo = (className: string): Omit<Product, 'id' | 'quantity'> => {
  const product = mockProducts[className.toLowerCase()];
  if (product) return product;
  
  // Default product if not found
  return {
    name: className,
    price: 0.99
  };
};
