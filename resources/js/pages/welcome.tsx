import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Category, money } from '@/lib/format';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Shirt } from 'lucide-react';
import { useState } from 'react';

interface Item {
    id: number;
    category_id: number | null;
    name: string;
    description: string | null;
    size: string | null;
    color: string | null;
    price: number;
    image: string | null;
}

interface Props {
    products: Item[];
    categories: Category[];
    filters: { search?: string; category?: string };
}

export default function Welcome({ products, categories, filters }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (extra: Record<string, string | undefined> = {}) =>
        router.get('/', { search, category: filters.category, ...extra }, { preserveState: true, replace: true });

    return (
        <>
            <Head title="Catálogo" />
            <div className="bg-background text-foreground min-h-screen">
                <header className="border-b">
                    <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Shirt className="size-5" /> {name}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={auth.user ? '/dashboard' : '/login'}>{auth.user ? 'Ir al panel' : 'Administrar'}</Link>
                        </Button>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-6 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant={!filters.category ? 'default' : 'outline'} onClick={() => apply({ category: undefined })}>
                            Todo
                        </Button>
                        {categories.map((c) => (
                            <Button key={c.id} size="sm" variant={filters.category === String(c.id) ? 'default' : 'outline'} onClick={() => apply({ category: String(c.id) })}>
                                {c.name}
                            </Button>
                        ))}
                        <form
                            className="ml-auto w-full sm:w-64"
                            onSubmit={(e) => {
                                e.preventDefault();
                                apply();
                            }}
                        >
                            <Input placeholder="Buscar prenda…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>
                    </div>

                    {products.length === 0 && <p className="text-muted-foreground py-12 text-center">No hay prendas disponibles.</p>}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((p) => (
                            <div key={p.id} className="overflow-hidden rounded-lg border">
                                {p.image ? (
                                    <img src={`/storage/${p.image}`} alt={p.name} className="aspect-square w-full object-cover" />
                                ) : (
                                    <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center">
                                        <Shirt className="size-10" />
                                    </div>
                                )}
                                <div className="space-y-1 p-3">
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-muted-foreground text-xs">{[p.size && `Talla ${p.size}`, p.color].filter(Boolean).join(' · ')}</div>
                                    <div className="font-semibold">{money(p.price)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
