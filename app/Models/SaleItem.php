<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'product_id', 'name', 'quantity', 'unit_price', 'subtotal'];

    protected $casts = ['unit_price' => 'float', 'subtotal' => 'float'];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
