<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
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
            'status' => ['sometimes', Rule::in(['new', 'preparing', 'completed'])],
            'payment_status' => ['sometimes', Rule::in(['pending', 'paid'])],
            'payment_method' => [
                'nullable',
                Rule::in(['cash', 'qr']),
            ],
            'order_type' => ['sometimes', Rule::in(['dine_in', 'takeaway'])],
            'table_number' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * If the order is being marked paid, a payment method is required.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $data = $this->validated();

            if (($data['payment_status'] ?? null) === 'paid' && empty($data['payment_method'])) {
                $validator->errors()->add(
                    'payment_method',
                    'A payment method (cash or qr) is required when marking an order as paid.'
                );
            }
        });
    }
}