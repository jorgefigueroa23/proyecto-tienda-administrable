import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Paginated, dateTime, money } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Undo2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Ventas', href: '/sales' }];

interface Sale {
    id: number;
    customer_name: string | null;
    payment_method: string;
    total: number;
    created_at: string;
    user: { name: string } | null;
    items: { id: number; name: string; quantity: number; unit_price: number; subtotal: number }[];
}

export default function Sales({ sales }: { sales: Paginated<Sale> }) {
    const cancel = (s: Sale) => {
        if (confirm(`¿Anular la venta #${s.id}? El stock se devolverá al inventario.`)) router.delete(`/sales/${s.id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas" />
            <div className="space-y-4 p-4">
                <div className="flex justify-end">
                    <Button asChild>
                        <Link href="/sales/create">
                            <Plus /> Nueva venta
                        </Link>
                    </Button>
                </div>

                {sales.data.length === 0 && <p className="text-muted-foreground text-sm">Aún no hay ventas registradas.</p>}
                {sales.data.map((s) => (
                    <div key={s.id} className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="font-semibold">Venta #{s.id}</span>
                                <span className="text-muted-foreground text-sm">
                                    {' '}
                                    · {s.customer_name || 'Cliente general'} · {s.payment_method} · {dateTime(s.created_at)}
                                    {s.user && ` · ${s.user.name}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{money(s.total)}</span>
                                <Button size="sm" variant="outline" onClick={() => cancel(s)}>
                                    <Undo2 /> Anular
                                </Button>
                            </div>
                        </div>
                        <ul className="text-muted-foreground mt-2 text-sm">
                            {s.items.map((i) => (
                                <li key={i.id}>
                                    {i.quantity} × {i.name} — {money(i.subtotal)}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div className="flex flex-wrap gap-1">
                    {sales.links.length > 3 &&
                        sales.links.map((l, i) => (
                            <Button key={i} size="sm" variant={l.active ? 'default' : 'outline'} disabled={!l.url} onClick={() => l.url && router.get(l.url)}>
                                <span dangerouslySetInnerHTML={{ __html: l.label }} />
                            </Button>
                        ))}
                </div>
            </div>
        </AppLayout>
    );
}
