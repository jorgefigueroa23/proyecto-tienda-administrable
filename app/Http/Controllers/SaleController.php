<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('sales/index', [
            'sales' => Sale::with(['items', 'user:id,name'])->latest()->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('sales/create', [
            'products' => Product::where('active', true)->where('stock', '>', 0)
                ->orderBy('name')->get(['id', 'name', 'sku', 'size', 'color', 'price', 'stock']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'nullable|string|max:150',
            'payment_method' => 'required|in:efectivo,tarjeta,transferencia',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($data, $request) {
            $sale = Sale::create([
                'user_id' => $request->user()->id,
                'customer_name' => $data['customer_name'] ?? null,
                'payment_method' => $data['payment_method'],
                'total' => 0,
            ]);

            $total = 0;
            foreach ($data['items'] as $i => $line) {
                $product = Product::lockForUpdate()->find($line['product_id']);
                if ($product->stock < $line['quantity']) {
                    throw ValidationException::withMessages([
                        "items.$i.quantity" => "Stock insuficiente para {$product->name} (disponible: {$product->stock}).",
                    ]);
                }
                $subtotal = $product->price * $line['quantity'];
                $sale->items()->create([
                    'product_id' => $product->id,
                    'name' => trim($product->name.' '.$product->size.' '.$product->color),
                    'quantity' => $line['quantity'],
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal,
                ]);
                $product->decrement('stock', $line['quantity']);
                $total += $subtotal;
            }
            $sale->update(['total' => $total]);
        });

        return redirect()->route('sales.index');
    }

    /** Anular una venta devuelve el stock. */
    public function destroy(Sale $sale)
    {
        DB::transaction(function () use ($sale) {
            foreach ($sale->items as $item) {
                if ($item->product_id) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
            $sale->delete();
        });

        return back();
    }
}
