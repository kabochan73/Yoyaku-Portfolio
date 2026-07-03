<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Price;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPriceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Price::all());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'weekday' => ['required', 'integer', 'min:0'],
            'weekend' => ['required', 'integer', 'min:0'],
        ]);

        Price::where('type', 'weekday')->update(['amount_per_hour' => $validated['weekday']]);
        Price::where('type', 'weekend')->update(['amount_per_hour' => $validated['weekend']]);

        return response()->json(Price::all());
    }
}
