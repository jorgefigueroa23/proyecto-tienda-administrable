import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Category, money } from '@/lib/format';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart, Search } from 'lucide-react';
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

    const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name;

    return (
        <>
            <Head title="Muñecos, llaveros y decoración a crochet" />
            <div className="bg-background text-foreground min-h-screen">
                <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
                        <div className="flex items-center gap-2 text-lg font-bold">
                            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
                                <Heart className="size-4" />
                            </span>
                            {name}
                        </div>
                        <div className="flex items-center gap-1">
                            <AppearanceToggleDropdown />
                            <Button variant="outline" size="sm" asChild>
                                <Link href={auth.user ? '/dashboard' : '/login'}>{auth.user ? 'Ir al panel' : 'Administrar'}</Link>
                            </Button>
                        </div>
                    </div>
                </header>

                <section className="from-secondary via-background to-accent bg-gradient-to-br">
                    <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
                        <p className="text-primary mb-2 text-sm font-semibold tracking-widest uppercase">Hecho a mano, con cariño</p>
                        <h1 className="text-3xl font-extrabold sm:text-5xl">Muñecos, llaveros y decoración a crochet</h1>
                        <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
                            Cada pieza se teje puntada a puntada con hilos suaves en tonos pastel. Encuentra un detalle único para ti o para regalar.
                        </p>
                        <a href="#catalogo" className="mt-6 inline-block">
                            <Button size="lg">Ver catálogo</Button>
                        </a>
                    </div>
                </section>

                <main id="catalogo" className="mx-auto max-w-6xl space-y-6 p-4 pt-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant={!filters.category ? 'default' : 'outline'} className="rounded-full" onClick={() => apply({ category: undefined })}>
                            Todo
                        </Button>
                        {categories.map((c) => (
                            <Button
                                key={c.id}
                                size="sm"
                                className="rounded-full"
                                variant={filters.category === String(c.id) ? 'default' : 'outline'}
                                onClick={() => apply({ category: String(c.id) })}
                            >
                                {c.name}
                            </Button>
                        ))}
                        <form
                            className="relative ml-auto w-full sm:w-64"
                            onSubmit={(e) => {
                                e.preventDefault();
                                apply();
                            }}
                        >
                            <Search className="text-muted-foreground absolute top-3 left-3 size-4" />
                            <Input className="rounded-full pl-9" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>
                    </div>

                    {products.length === 0 && <p className="text-muted-foreground py-12 text-center">No encontramos piezas con ese filtro.</p>}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {products.map((p) => (
                            <article key={p.id} className="bg-card group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="bg-muted aspect-square overflow-hidden">
                                    {p.image ? (
                                        <img src={`/storage/${p.image}`} alt={p.name} loading="lazy" className="size-full object-cover transition group-hover:scale-105" />
                                    ) : (
                                        <div className="text-muted-foreground flex size-full items-center justify-center">
                                            <Heart className="size-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1 p-3">
                                    <div className="text-primary text-xs font-semibold uppercase">{categoryName(p.category_id)}</div>
                                    <h2 className="leading-tight font-bold">{p.name}</h2>
                                    <p className="text-muted-foreground text-xs">{[p.size, p.color].filter(Boolean).join(' · ')}</p>
                                    <p className="text-lg font-extrabold">{money(p.price)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>

                <footer className="text-muted-foreground mt-12 border-t p-6 text-center text-xs">
                    <p>
                        © {new Date().getFullYear()} {name} · Precios en soles (PEN)
                    </p>
                    <p className="mt-1">Fotos de demostración: Wikimedia Commons (CC0, CC BY y CC BY-SA); créditos en database/seeders/images/CREDITS.md.</p>
                </footer>
            </div>
        </>
    );
}
