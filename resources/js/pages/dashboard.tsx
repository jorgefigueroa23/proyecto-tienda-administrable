import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dateTime, money } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Panel', href: '/dashboard' }];

interface Props {
    stats: { sales_today: number; sales_month: number; orders_month: number; products: number; inventory_value: number };
    lowStock: { id: number; name: string; sku: string; size: string | null; color: string | null; stock: number; min_stock: number }[];
    recentSales: { id: number; customer_name: string | null; payment_method: string; total: number; created_at: string }[];
    topProducts: { name: string; qty: number }[];
}

export default function Dashboard({ stats, lowStock, recentSales, topProducts }: Props) {
    const cards = [
        { label: 'Ventas de hoy', value: money(stats.sales_today) },
        { label: 'Ventas del mes', value: money(stats.sales_month) },
        { label: 'Pedidos del mes', value: stats.orders_month },
        { label: 'Valor del inventario (costo)', value: money(stats.inventory_value) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel" />
            <div className="flex flex-col gap-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((c) => (
                        <Card key={c.label}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">{c.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold">{c.value}</CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock bajo ({lowStock.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {lowStock.length === 0 && <p className="text-muted-foreground text-sm">Todo el inventario está al día.</p>}
                            {lowStock.map((p) => (
                                <Link key={p.id} href={`/products/${p.id}/edit`} className="hover:bg-accent flex items-center justify-between rounded-md p-2 text-sm">
                                    <span>
                                        {p.name} <span className="text-muted-foreground">{[p.size, p.color].filter(Boolean).join(' · ')}</span>
                                    </span>
                                    <Badge variant={p.stock === 0 ? 'destructive' : 'outline'}>{p.stock} uds.</Badge>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Más vendidos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {topProducts.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay ventas.</p>}
                            {topProducts.map((p) => (
                                <div key={p.name} className="flex items-center justify-between p-2 text-sm">
                                    <span>{p.name}</span>
                                    <span className="font-medium">{p.qty} vendidos</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimas ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay ventas.</p>}
                        {recentSales.map((s) => (
                            <div key={s.id} className="flex items-center justify-between border-b p-2 text-sm last:border-0">
                                <span>
                                    #{s.id} · {s.customer_name || 'Cliente general'}
                                    <span className="text-muted-foreground"> · {s.payment_method} · {dateTime(s.created_at)}</span>
                                </span>
                                <span className="font-medium">{money(s.total)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
