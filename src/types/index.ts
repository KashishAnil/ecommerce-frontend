/** Shared TypeScript shapes matching the backend models / responses. */

export type Role = "Customer" | "Seller" | "Admin";

export type Product = {
  _id: string;
  productName: string;
  description: string;
  price: number;
  quantityAvailable: number;
  imageURL: string;
  category: string;
  seller: string;
  isActive?: boolean;
};

export type Category = {
  _id: string;
  categoryName: string;
  createdBy?: string;
};

export type CartItem = {
  product: Product | string;
  quantity: number;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
};

export type CartResponse = {
  cartExists: Cart;
  total: number;
};

export type OrderItem = {
  product: string;
  name: string;
  priceAtPurchase: number;
  quantity: number;
};

export type Order = {
  _id: string;
  user: string;
  items: OrderItem[];
  totalPrice: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  paymentStatus?: string;
  createdAt?: string;
};
