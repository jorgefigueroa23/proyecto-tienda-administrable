import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { money, selectClass } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Minus, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Nueva venta', href: '/sales/create' }];

interface P {
    id: number;
    name: string;
    sku: string;
    size: string | null;
    color: string | null;
    price: number;
    stock: number;
}

export default function NewSale({ products }: { products: P[] }) {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<Record<number, number>>({});
    const [customer, setCustomer] = useState('');
    const [payment, setPayment] = useState('efectivo');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
    const filtered = products.filter((p) => `${p.name} ${p.sku} ${p.color} ${p.size}`.toLowerCase().includes(search.toLowerCase()));
    const lines = Object.entries(cart).map(([id, qty]) => ({ p: byId[+id], qty }));
    const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);

    const setQty = (id: number, qty: number) =>
        setCart((c) => {
            const next = { ...c };
            if (qty <= 0) delete next[id];
            else next[id] = Math.min(qty, byId[id].stock);
            return next;
        });

    const submit = () => {
        router.post(
            '/sales',
            { customer_name: customer, payment_method: payment, items: lines.map((l) => ({ product_id: l.p.id, quantity: l.qty })) },
            { onStart: () => setProcessing(true), onFinish: () => setProcessing(false), onError: setErrors },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva venta" />
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_380px]">
                <div className="space-y-3">
                    <Input placeholder="Buscar producto, SKU, talla o color…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((p) => (
                            <button key={p.id} onClick={() => setQty(p.id, (cart[p.id] ?? 0) + 1)} className="hover:bg-accent rounded-lg border p-3 text-left">
                                <div className="font-medium">{p.name}</div>
                                <div className="text-muted-foreground text-xs">
                                    {p.sku} · {[p.size, p.color].filter(Boolean).join(' · ')}
                                </div>
                                <div className="mt-1 flex justify-between text-sm">
                                    <span className="font-semibold">{money(p.price)}</span>
                                    <span className="text-muted-foreground">{p.stock} en stock</span>
                                </div>
                            </button>
                        ))}
                        {filtered.length === 0 && <p className="text-muted-foreground text-sm">Sin resultados (solo se muestran productos activos con stock).</p>}
                    </div>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Carrito</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lines.length === 0 && <p className="text-muted-foreground text-sm">Toca un producto para agregarlo.</p>}
                        {lines.map(({ p, qty }, i) => (
                            <div key={p.id} className="space-y-1 border-b pb-2">
                                <div className="flex items-start justify-between gap-2 text-sm">
                                    <span>
                                        {p.name} <span className="text-muted-foreground">{[p.size, p.color].filter(Boolean).join(' · ')}</span>
                                    </span>
                                    <button onClick={() => setQty(p.id, 0)} aria-label="Quitar">
                                        <X className="size-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(p.id, qty - 1)}>
                                            <Minus className="size-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm">{qty}</span>
                                        <Button size="icon" variant="outline" className="size-7" onClick={() => setQty(p.id, qty + 1)} disabled={qty >= p.stock}>
                                            <Plus className="size-3" />
                                        </Button>
                                    </div>
                                    <span className="text-sm font-medium">{money(p.price * qty)}</span>
                                </div>
                                <InputError message={errors[`items.${i}.quantity`]} />
                            </div>
                        ))}

                        <Input placeholder="Cliente (opcional)" value={customer} onChange={(e) => setCustomer(e.target.value)} />
                        <select className={selectClass} value={payment} onChange={(e) => setPayment(e.target.value)}>
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                        <InputError message={errors.items} />

                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>{money(total)}</span>
                        </div>
                        <Button className="w-full" disabled={lines.length === 0 || processing} onClick={submit}>
                            Registrar venta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
