<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'sku', 'description', 'size', 'color',
        'cost', 'price', 'stock', 'min_stock', 'image', 'active',
    ];

    protected $casts = [
        'cost' => 'float',
        'price' => 'float',
        'active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? '/storage/'.$this->image : null;
    }
}
