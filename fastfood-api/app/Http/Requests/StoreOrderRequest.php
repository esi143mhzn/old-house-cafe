<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order_type' => ['required', Rule::in(['dine_in', 'takeaway'])],
            'table_number' => ['nullable', 'string', 'max:50'],
            'discount' => ['sometimes', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Custom messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Please add at least one item to the order.',
            'items.min' => 'Please add at least one item to the order.',
            'items.*.quantity.min' => 'Quantity must be at least 1.',
        ];
    }
}