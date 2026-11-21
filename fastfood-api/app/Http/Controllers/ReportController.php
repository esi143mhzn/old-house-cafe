<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    /**
     * GET /api/reports/sales
     *
     * Query params:
     *  - period: today|yesterday|week|month|custom
     *  - date_from, date_to (required when period=custom)
     */
    public function sales(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['sometimes', 'in:today,yesterday,week,month,custom'],
            'date_from' => ['sometimes', 'date'],
            'date_to' => ['sometimes', 'date'],
        ]);

        $range = $this->reportService->resolveRange(
            $validated['period'] ?? 'today',
            $validated['date_from'] ?? null,
            $validated['date_to'] ?? null
        );

        if (($validated['period'] ?? '') === 'custom' && empty($validated['date_from'])) {
            abort(422, 'date_from is required for a custom range.');
        }
        if (($validated['period'] ?? '') === 'custom' && empty($validated['date_to'])) {
            abort(422, 'date_to is required for a custom range.');
        }

        return response()->json([
            'success' => true,
            'data' => $this->reportService->salesSummary($range),
        ]);
    }
}