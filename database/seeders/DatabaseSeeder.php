<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Datos de demostración para una tienda de crochet.
 * Precios en soles (PEN), tomados del estudio de mercado (docs/estudio-de-mercado.md).
 * Fotos: Wikimedia Commons (ver database/seeders/images/CREDITS.md).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->users();
        $this->catalog();
        $this->sales();
    }

    private function users(): void
    {
        $users = [
            ['Gloria Isabel Ormeño León (Dueña)', 'gloria.ormeno@ovillodulce.test', 'Gloria2026!'],
            ['Sofía Méndez (Ventas)', 'ventas@ovillodulce.test', 'Ventas2026!'],
            ['Lucía Paredes (Inventario)', 'inventario@ovillodulce.test', 'Inventario2026!'],
        ];

        foreach ($users as [$name, $email, $password]) {
            User::updateOrCreate(['email' => $email], [
                'name' => $name,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);
        }
    }

    private function catalog(): void
    {
        $cats = collect(['Muñecos', 'Llaveros', 'Decoración', 'Flores y plantas'])
            ->mapWithKeys(fn ($n) => [$n => Category::firstOrCreate(['name' => $n])->id]);

        // [nombre, sku, categoría, tamaño, color, costo, precio, stock, imagen, descripción]
        $products = [
            ['Oso de apego amigurumi', 'MUN-001', 'Muñecos', '25 cm', 'Beige', 30, 90, 6, 'oso.jpg', 'Osito tejido a mano con hilo de algodón suave y relleno hipoalergénico.'],
            ['Gatito amigurumi', 'MUN-002', 'Muñecos', '22 cm', 'Crema', 26, 80, 5, 'gatito.jpg', 'Gatito sentado con orejas y cola tejidas, ideal para regalo.'],
            ['Unicornio pastel amigurumi', 'MUN-003', 'Muñecos', '28 cm', 'Pastel', 36, 110, 4, 'unicornio.jpg', 'Unicornio de colores pastel con cuerno y crin tejidos.'],
            ['Pollito amigurumi', 'MUN-004', 'Muñecos', '10 cm', 'Amarillo', 11, 35, 12, 'pollito.jpg', 'Pollito pequeño, perfecto para decorar o como detalle.'],

            ['Llavero granny circular', 'LLA-001', 'Llaveros', '8 cm', 'Mostaza y rosa', 5, 15, 25, 'llavero-1.jpg', 'Mandala tejido a crochet con argolla metálica.'],
            ['Llavero granny morado con borla', 'LLA-002', 'Llaveros', '9 cm', 'Morado', 6, 18, 20, 'llavero-2.jpg', 'Cuadro granny en hilo mercerizado con borla y cierre de mosquetón.'],
            ['Llavero ratoncito micro (par)', 'LLA-003', 'Llaveros', '4 cm', 'Gris', 9, 25, 15, 'llavero-3.png', 'Par de ratoncitos micro-crochet, cada uno con su argolla.'],
            ['Llavero granny verde y crema', 'LLA-004', 'Llaveros', '8 cm', 'Verde y crema', 5, 15, 2, 'llavero-4.jpg', 'Cuadro granny en verde pistacho y crema.'],

            ['Tapete redondo calado', 'DEC-001', 'Decoración', '30 cm', 'Crema', 15, 45, 8, 'tapete-1.jpg', 'Tapete clásico para mesa de centro o repisa.'],
            ['Set de 2 tapetes de encaje irlandés', 'DEC-002', 'Decoración', '20 cm c/u', 'Blanco', 28, 80, 5, 'tapete-2.jpg', 'Dos piezas de encaje irlandés tejidas a mano.'],
            ['Tapete floral blanco', 'DEC-003', 'Decoración', '25 cm', 'Blanco', 12, 40, 7, 'tapete-3.jpg', 'Tapete con flores calado en hilo de algodón fino.'],
            ['Tapete cuadrado filet', 'DEC-004', 'Decoración', '32 cm', 'Blanco', 22, 65, 3, 'tapete-4.jpg', 'Tapete cuadrado en técnica filet con motivos florales en las esquinas.'],

            ['Cactus amigurumi', 'FLO-001', 'Flores y plantas', '15 cm', 'Verde', 11, 35, 10, 'cactus.jpg', 'Cactus tejido que no necesita riego.'],
            ['Narciso a crochet en maceta', 'FLO-002', 'Flores y plantas', '20 cm', 'Blanco y amarillo', 14, 40, 8, 'narciso.jpg', 'Narciso tejido con tallo flexible y maceta de yute.'],
            ['Ramo de flores a crochet', 'FLO-003', 'Flores y plantas', '30 cm', 'Multicolor', 30, 85, 6, 'flores-1.jpg', 'Ramo de flores tejidas que duran para siempre.'],
        ];

        foreach ($products as [$name, $sku, $cat, $size, $color, $cost, $price, $stock, $image, $desc]) {
            $path = "products/$image";
            $source = __DIR__.'/images/'.$image;
            if (is_file($source)) {
                Storage::disk('public')->put($path, file_get_contents($source));
            }

            Product::updateOrCreate(['sku' => $sku], [
                'category_id' => $cats[$cat], 'name' => $name, 'description' => $desc,
                'size' => $size, 'color' => $color, 'cost' => $cost, 'price' => $price,
                'stock' => $stock, 'min_stock' => 3, 'image' => is_file($source) ? $path : null, 'active' => true,
            ]);
        }
    }

    /** Ventas de los últimos 30 días para que el panel tenga datos. */
    private function sales(): void
    {
        if (Sale::exists()) {
            return;
        }

        mt_srand(2026);
        $products = Product::all();
        $sellers = User::whereIn('email', ['gloria.ormeno@ovillodulce.test', 'ventas@ovillodulce.test'])->pluck('id')->all();
        $customers = ['Valentina Cruz', 'Daniela Ortiz', null, 'Mariana López', null, 'Paula Herrera', 'Renata Silva', null];
        $payments = ['efectivo', 'tarjeta', 'transferencia'];

        for ($i = 0; $i < 22; $i++) {
            $at = now()->subDays(mt_rand(0, 29))->setTime(mt_rand(10, 19), mt_rand(0, 59));
            $sale = Sale::create([
                'user_id' => $sellers[array_rand($sellers)],
                'customer_name' => $customers[array_rand($customers)],
                'payment_method' => $payments[array_rand($payments)],
                'total' => 0,
            ]);

            $total = 0;
            foreach ($products->random(mt_rand(1, 3)) as $p) {
                $p->refresh();
                $qty = min(mt_rand(1, 2), $p->stock - 1);
                if ($qty < 1) {
                    continue;
                }
                $sale->items()->create([
                    'product_id' => $p->id, 'name' => trim("{$p->name} {$p->size}"), 'quantity' => $qty,
                    'unit_price' => $p->price, 'subtotal' => $p->price * $qty,
                ]);
                $p->decrement('stock', $qty);
                $total += $p->price * $qty;
            }

            if ($total == 0) {
                $sale->delete();

                continue;
            }
            $sale->update(['total' => $total]);
            $sale->forceFill(['created_at' => $at, 'updated_at' => $at])->saveQuietly();
        }
    }
}
