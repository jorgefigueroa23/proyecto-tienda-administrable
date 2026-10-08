import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type Category, type Paginated, type Product, money, selectClass } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Productos', href: '/products' }];

interface Props {
    products: Paginated<Product>;
    categories: Category[];
    filters: { search?: string; category?: string; low?: string };
}

export default function Products({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (extra: Record<string, string | undefined> = {}) =>
        router.get('/products', { search, category: filters.category, low: filters.low, ...extra }, { preserveState: true, replace: true });

    const remove = (p: Product) => {
        if (confirm(`¿Eliminar "${p.name}"?`)) router.delete(`/products/${p.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        className="flex-1 sm:max-w-xs"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply();
                        }}
                    >
                        <Input placeholder="Buscar por nombre o SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </form>
                    <select className={selectClass + ' sm:w-48'} value={filters.category ?? ''} onChange={(e) => apply({ category: e.target.value || undefined })}>
                        <option value="">Todas las categorías</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!filters.low} onChange={(e) => apply({ low: e.target.checked ? '1' : undefined })} />
                        Solo stock bajo
                    </label>
                    <Button asChild className="ml-auto">
                        <Link href="/products/create">
                            <Plus /> Nuevo producto
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="p-3">Producto</th>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Categoría</th>
                                <th className="p-3">Talla / Color</th>
                                <th className="p-3 text-right">Precio</th>
                                <th className="p-3 text-right">Stock</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-muted-foreground p-6 text-center">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                            {products.data.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt="" className="size-10 rounded object-cover" />
                                            ) : (
                                                <div className="bg-muted size-10 rounded" />
                                            )}
                                            <div>
                                                <div className="font-medium">{p.name}</div>
                                                {!p.active && <Badge variant="outline">Oculto</Badge>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">{p.sku}</td>
                                    <td className="p-3">{p.category?.name ?? '—'}</td>
                                    <td className="p-3">{[p.size, p.color].filter(Boolean).join(' · ') || '—'}</td>
                                    <td className="p-3 text-right">{money(p.price)}</td>
                                    <td className="p-3 text-right">
                                        <Badge variant={p.stock === 0 ? 'destructive' : p.stock <= p.min_stock ? 'outline' : 'default'}>{p.stock}</Badge>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <Button size="icon" variant="ghost" asChild>
                                            <Link href={`/products/${p.id}/edit`}>
                                                <Pencil />
                                            </Link>
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => remove(p)}>
                                            <Trash2 />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap gap-1">
                    {products.links.length > 3 &&
                        products.links.map((l, i) => (
                            <Button key={i} size="sm" variant={l.active ? 'default' : 'outline'} disabled={!l.url} onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}>
                                <span dangerouslySetInnerHTML={{ __html: l.label }} />
                            </Button>
                        ))}
                </div>
            </div>
        </AppLayout>
    );
}
