<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@tienda.com'], [
            'name' => 'Administrador',
            'password' => bcrypt('admin1234'),
            'email_verified_at' => now(),
        ]);

        $cats = collect(['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas', 'Accesorios'])
            ->mapWithKeys(fn ($n) => [$n => Category::firstOrCreate(['name' => $n])->id]);

        $demo = [
            ['Camiseta básica', 'CAM-001', 'Camisetas', 'M', 'Blanco', 8, 19.9, 20],
            ['Camiseta básica', 'CAM-002', 'Camisetas', 'L', 'Negro', 8, 19.9, 15],
            ['Jean slim fit', 'PAN-001', 'Pantalones', '32', 'Azul', 22, 49.9, 10],
            ['Vestido floral', 'VES-001', 'Vestidos', 'S', 'Rosa', 18, 59.9, 6],
            ['Chaqueta denim', 'CHA-001', 'Chaquetas', 'M', 'Azul', 30, 89.9, 2],
            ['Cinturón de cuero', 'ACC-001', 'Accesorios', 'Única', 'Marrón', 7, 24.9, 12],
        ];
        foreach ($demo as [$name, $sku, $cat, $size, $color, $cost, $price, $stock]) {
            Product::firstOrCreate(['sku' => $sku], [
                'category_id' => $cats[$cat], 'name' => $name, 'size' => $size, 'color' => $color,
                'cost' => $cost, 'price' => $price, 'stock' => $stock, 'min_stock' => 3,
            ]);
        }
    }
}
