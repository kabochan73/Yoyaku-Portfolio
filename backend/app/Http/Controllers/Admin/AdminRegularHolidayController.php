<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegularHoliday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminRegularHolidayController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(RegularHoliday::orderBy('day_of_week')->get());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'days' => ['required', 'array'],
            'days.*' => ['integer', 'between:0,6'],
        ]);

        RegularHoliday::truncate();

        foreach ($validated['days'] as $day) {
            RegularHoliday::create(['day_of_week' => $day]);
        }

        Cache::tags(['calendar'])->flush();

        return response()->json(RegularHoliday::orderBy('day_of_week')->get());
    }
}
