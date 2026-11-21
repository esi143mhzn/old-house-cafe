<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    public const STATUS_NEW = 'new';
    public const STATUS_PREPARING = 'preparing';
    public const STATUS_COMPLETED = 'completed';

    public const PAYMENT_PENDING = 'pending';
    public const PAYMENT_PAID = 'paid';

    public const TYPE_DINE_IN = 'dine_in';
    public const TYPE_TAKEAWAY = 'takeaway';

    public const METHOD_CASH = 'cash';
    public const METHOD_QR = 'qr';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'order_number',
        'order_type',
        'status',
        'subtotal',
        'discount',
        'total',
        'payment_status',
        'payment_method',
        'table_number',
        'ordered_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * Items belonging to this order.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * The staff member who created the order.
     */
    public function staff()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    /**
     * Scope: orders in the active kitchen queue.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_NEW, self::STATUS_PREPARING]);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [self::STATUS_NEW, self::STATUS_PREPARING], true);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_PAID;
    }
}