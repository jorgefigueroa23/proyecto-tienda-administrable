<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function __invoke(Request $request)
    {
        return Inertia::render('welcome', [
            'products' => Product::where('active', true)->where('stock', '>', 0)
                ->when($request->category, fn ($q, $c) => $q->where('category_id', $c))
                ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%"))
                ->latest()
                ->get(['id', 'category_id', 'name', 'description', 'size', 'color', 'price', 'image']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('search', 'category'),
        ]);
    }
}
