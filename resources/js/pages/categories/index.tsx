import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type Category } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categorías', href: '/categories' }];

export default function Categories({ categories }: { categories: Category[] }) {
    const form = useForm({ name: '' });
    const [editing, setEditing] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    const add: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/categories', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    const save = (id: number) => router.put(`/categories/${id}`, { name: editName }, { preserveScroll: true, onSuccess: () => setEditing(null) });

    const remove = (c: Category) => {
        if (confirm(`¿Eliminar la categoría "${c.name}"? Sus productos quedarán sin categoría.`)) {
            router.delete(`/categories/${c.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <div className="mx-auto w-full max-w-2xl space-y-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={add} className="flex gap-2">
                            <div className="flex-1">
                                <Input placeholder="Ej. Camisetas" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                <InputError message={form.errors.name} className="mt-1" />
                            </div>
                            <Button disabled={form.processing}>Agregar</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="divide-y p-0">
                        {categories.length === 0 && <p className="text-muted-foreground p-4 text-sm">No hay categorías.</p>}
                        {categories.map((c) => (
                            <div key={c.id} className="flex items-center gap-2 p-3">
                                {editing === c.id ? (
                                    <>
                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                                        <Button size="icon" variant="ghost" onClick={() => save(c.id)}>
                                            <Check />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setEditing(null)}>
                                            <X />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 font-medium">{c.name}</span>
                                        <span className="text-muted-foreground text-sm">{c.products_count} productos</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setEditing(c.id);
                                                setEditName(c.name);
                                            }}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => remove(c)}>
                                            <Trash2 />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
