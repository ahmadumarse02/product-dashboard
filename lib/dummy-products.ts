export type ProductStatus = "Active" | "Draft" | "Low Stock";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
};

const STORAGE_KEY = "dashboard.products";

const defaultProducts: Product[] = [
  {
    id: "PRD-1001",
    name: "Wireless Keyboard",
    category: "Electronics",
    price: 79,
    stock: 34,
    status: "Active",
    description: "Compact keyboard with low-profile keys.",
  },
  {
    id: "PRD-1002",
    name: "Desk Lamp",
    category: "Home Office",
    price: 42,
    stock: 8,
    status: "Low Stock",
    description: "Adjustable LED lamp with warm and cool modes.",
  },
  {
    id: "PRD-1003",
    name: "Travel Backpack",
    category: "Accessories",
    price: 118,
    stock: 0,
    status: "Draft",
    description: "Weather-resistant backpack with laptop storage.",
  },
];

const cloneProducts = (products: Product[]) =>
  products.map((product) => ({ ...product }));

export function getStoredProducts() {
  if (typeof window === "undefined") {
    return cloneProducts(defaultProducts);
  }

  try {
    const storedProducts = window.localStorage.getItem(STORAGE_KEY);

    if (!storedProducts) {
      saveStoredProducts(defaultProducts);
      return cloneProducts(defaultProducts);
    }

    const parsedProducts = JSON.parse(storedProducts);

    if (!Array.isArray(parsedProducts)) {
      return cloneProducts(defaultProducts);
    }

    return parsedProducts as Product[];
  } catch {
    return cloneProducts(defaultProducts);
  }
}

export function saveStoredProducts(products: Product[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
