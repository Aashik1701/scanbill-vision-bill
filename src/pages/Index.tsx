
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Product, DetectedObject, Bill } from '@/types';
import CameraView from '@/components/scanner/CameraView';
import Sidebar from '@/components/sidebar/Sidebar';
import BillModal from '@/components/BillModal';
import { generateId, findProductInfo, generateBill } from '@/utils/billing';
import { MenuIcon, ReceiptText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [detectionEnabled, setDetectionEnabled] = useState(true);

  // Handle product detection
  const handleProductDetected = (detection: DetectedObject) => {
    // Skip if detection is disabled
    if (!detectionEnabled) return;
    
    // Only add products with high confidence
    if (detection.confidence < 0.6) return;
    
    const productInfo = findProductInfo(detection.class);
    
    // Check if product already exists in the list
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === productInfo.name.toLowerCase()
    );
    
    if (existingProduct) {
      // Update quantity of existing product
      handleUpdateQuantity(existingProduct.id, existingProduct.quantity + 1);
      
      toast({
        title: "Product quantity updated",
        description: `${productInfo.name} quantity increased to ${existingProduct.quantity + 1}`,
        duration: 2000,
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: generateId(),
        name: productInfo.name,
        price: productInfo.price,
        quantity: 1,
      };
      
      setProducts((prev) => [...prev, newProduct]);
      
      toast({
        title: "Product added",
        description: `${productInfo.name} added to bill`,
        duration: 2000,
      });
    }
    
    // Temporarily disable detection to prevent duplicates
    setDetectionEnabled(false);
    setTimeout(() => setDetectionEnabled(true), 3000);
  };

  // Handle quantity updates
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(id);
      return;
    }
    
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  };

  // Handle product removal
  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
    
    toast({
      title: "Product removed",
      description: "Product removed from bill",
      duration: 2000,
    });
  };

  // Generate bill
  const handleGenerateBill = () => {
    if (products.length === 0) {
      toast({
        title: "No products added",
        description: "Please scan some products first",
        variant: "destructive",
      });
      return;
    }
    
    const bill = generateBill(products);
    setCurrentBill(bill);
    setShowBillModal(true);
  };

  // Send bill to email
  const handleSendEmail = (email: string) => {
    if (!currentBill) return;
    
    // Close modal after email is sent
    setShowBillModal(false);
    
    // Reset products after successful email
    setProducts([]);
    
    toast({
      title: "Ready for next customer",
      description: "Bill sent and products cleared",
    });
  };

  // Close modal
  const handleCloseBillModal = () => {
    setShowBillModal(false);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-scanblue-800 text-white shadow-md">
        <div className="flex items-center">
          <ReceiptText className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">ScanBill Assistant</h1>
        </div>
        
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:bg-scanblue-700"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Camera section */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex flex-col h-full max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Product Scanner</h2>
            <div className="flex-1 min-h-0">
              <CameraView 
                onProductDetected={handleProductDetected} 
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div 
            className={`
              ${isMobile ? 'fixed inset-y-0 right-0 z-50 w-80' : 'w-80'} 
              transition-all duration-300 ease-in-out
            `}
          >
            <Sidebar
              products={products}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveProduct={handleRemoveProduct}
              onGenerateBill={handleGenerateBill}
              onSendEmail={() => setShowBillModal(true)}
              className="h-full"
            />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Bill modal */}
      <BillModal 
        bill={currentBill}
        isOpen={showBillModal}
        onClose={handleCloseBillModal}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
};

export default Index;
