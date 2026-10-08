<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $month = fn () => Sale::whereYear('created_at', now()->year)->whereMonth('created_at', now()->month);

        return Inertia::render('dashboard', [
            'stats' => [
                'sales_today' => (float) Sale::whereDate('created_at', today())->sum('total'),
                'sales_month' => (float) $month()->sum('total'),
                'orders_month' => $month()->count(),
                'products' => Product::count(),
                'inventory_value' => (float) Product::selectRaw('COALESCE(SUM(cost * stock), 0) as v')->value('v'),
            ],
            'lowStock' => Product::whereColumn('stock', '<=', 'min_stock')->orderBy('stock')->limit(8)
                ->get(['id', 'name', 'sku', 'size', 'color', 'stock', 'min_stock']),
            'recentSales' => Sale::latest()->limit(6)->get(['id', 'customer_name', 'payment_method', 'total', 'created_at']),
            'topProducts' => SaleItem::selectRaw('name, SUM(quantity) as qty')
                ->groupBy('name')->orderByDesc('qty')->limit(5)->get(),
        ]);
    }
}
