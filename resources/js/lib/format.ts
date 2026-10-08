export const money = (n: number | string) => `$ ${Number(n).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const dateTime = (s: string) => new Date(s).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' });

export const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring';

export interface Category {
    id: number;
    name: string;
    products_count?: number;
}

export interface Product {
    id: number;
    category_id: number | null;
    category?: Category | null;
    name: string;
    sku: string;
    description: string | null;
    size: string | null;
    color: string | null;
    cost: number;
    price: number;
    stock: number;
    min_stock: number;
    image: string | null;
    image_url: string | null;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}
