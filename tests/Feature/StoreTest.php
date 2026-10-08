<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

beforeEach(fn () => $this->actingAs(User::factory()->create()));

it('renders every admin page', function () {
    $product = Product::create(['name' => 'Polo', 'sku' => 'P-1', 'price' => 10, 'stock' => 5]);

    foreach (['/dashboard', '/products', '/products/create', "/products/{$product->id}/edit", '/sales', '/sales/create', '/categories', '/'] as $url) {
        $this->get($url)->assertOk();
    }
});

it('requires login for the admin', function () {
    auth()->logout();
    $this->get('/products')->assertRedirect('/login');
});

it('creates a product with a category', function () {
    $cat = Category::create(['name' => 'Camisetas']);

    $this->post('/products', [
        'name' => 'Polo', 'sku' => 'P-1', 'category_id' => $cat->id,
        'cost' => 5, 'price' => 12.5, 'stock' => 10, 'min_stock' => 2, 'active' => true,
    ])->assertRedirect('/products');

    expect(Product::where('sku', 'P-1')->first()->category_id)->toBe($cat->id);
});

it('sells, decrements stock, rejects overselling and restores stock when voided', function () {
    $p = Product::create(['name' => 'Polo', 'sku' => 'P-1', 'price' => 10, 'stock' => 5]);

    $this->post('/sales', ['payment_method' => 'efectivo', 'items' => [['product_id' => $p->id, 'quantity' => 3]]])
        ->assertRedirect('/sales');
    expect($p->fresh()->stock)->toBe(2);
    $sale = Sale::first();
    expect($sale->total)->toBe(30.0);

    $this->post('/sales', ['payment_method' => 'efectivo', 'items' => [['product_id' => $p->id, 'quantity' => 3]]])
        ->assertSessionHasErrors('items.0.quantity');
    expect($p->fresh()->stock)->toBe(2)->and(Sale::count())->toBe(1);

    $this->delete("/sales/{$sale->id}");
    expect($p->fresh()->stock)->toBe(5)->and(Sale::count())->toBe(0);
});
