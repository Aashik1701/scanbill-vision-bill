
// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Detected object from YOLOv8
export interface DetectedObject {
  id: string;
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

// Bill related types
export interface Bill {
  id: string;
  date: Date;
  products: Product[];
  total: number;
  tax: number;
  grandTotal: number;
  customerEmail?: string;
}
