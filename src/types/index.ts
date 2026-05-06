export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: Pick<Category, "id" | "name" | "slug" | "sort_order"> | null;
};

export type CartItem = {
  id: string;
  product: Product;
  options: ProductOption[];
  quantity: number;
};

export type ProductOption = {
  id: string;
  name: string;
  price: number;
};

export type DeliveryType = "pickup" | "delivery";
export type PaymentMethod = "pix" | "dinheiro" | "cartao_credito" | "cartao_debito";

export type CheckoutData = {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

export type OrderPayload = CheckoutData & {
  total: number;
};

export type OrderRecord = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  address: string | null;
  payment_method: string;
  notes: string | null;
  subtotal?: number;
  total: number;
  status: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Category>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          badge?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Product>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: OrderRecord;
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          delivery_type: string;
          address?: string | null;
          payment_method: string;
          notes?: string | null;
          subtotal?: number;
          total: number;
          status?: string;
          created_at?: string;
        };
        Update: Partial<OrderRecord>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          notes: string | null;
          created_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
