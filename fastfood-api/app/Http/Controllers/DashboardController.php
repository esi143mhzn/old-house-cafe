<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    /**
     * GET /api/dashboard — today's numbers + popular items.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->reportService->dashboardSummary(),
        ]);
    }
}