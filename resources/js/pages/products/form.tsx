import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type Category, type Product, selectClass } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
    const editing = !!product;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Productos', href: '/products' },
        { title: editing ? 'Editar' : 'Nuevo', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: editing ? 'put' : 'post',
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        description: product?.description ?? '',
        size: product?.size ?? '',
        color: product?.color ?? '',
        cost: String(product?.cost ?? '0'),
        price: String(product?.price ?? ''),
        stock: String(product?.stock ?? '0'),
        min_stock: String(product?.min_stock ?? '3'),
        active: product?.active ?? true,
        image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // POST + _method=put: PHP no lee archivos en peticiones PUT reales
        post(editing ? `/products/${product!.id}` : '/products', { forceFormData: true });
    };

    const field = (key: keyof typeof data, label: string, props: React.ComponentProps<'input'> = {}) => (
        <div className="space-y-1">
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} value={data[key] as string} onChange={(e) => setData(key, e.target.value as never)} {...props} />
            <InputError message={errors[key]} />
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Editar producto' : 'Nuevo producto'} />
            <div className="mx-auto w-full max-w-3xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {field('name', 'Nombre', { required: true })}
                                {field('sku', 'SKU / Código', { required: true })}
                                <div className="space-y-1">
                                    <Label htmlFor="category_id">Categoría</Label>
                                    <select id="category_id" className={selectClass} value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                                        <option value="">Sin categoría</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {field('size', 'Talla')}
                                    {field('color', 'Color')}
                                </div>
                                {field('cost', 'Costo', { type: 'number', step: '0.01', min: 0 })}
                                {field('price', 'Precio de venta', { type: 'number', step: '0.01', min: 0, required: true })}
                                {field('stock', 'Stock', { type: 'number', min: 0 })}
                                {field('min_stock', 'Alerta de stock mínimo', { type: 'number', min: 0 })}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="description">Descripción</Label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="image">Imagen</Label>
                                {product?.image_url && <img src={product.image_url} alt="" className="mb-2 size-24 rounded object-cover" />}
                                <Input id="image" type="file" accept="image/*" onChange={(e) => setData('image', e.target.files?.[0] ?? null)} />
                                <InputError message={errors.image} />
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={data.active} onChange={(e) => setData('active', e.target.checked)} />
                                Visible en el catálogo y disponible para vender
                            </label>

                            <div className="flex gap-2">
                                <Button disabled={processing}>{editing ? 'Guardar cambios' : 'Crear producto'}</Button>
                                <Button variant="outline" asChild>
                                    <Link href="/products">Cancelar</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
