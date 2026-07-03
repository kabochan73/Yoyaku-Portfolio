<?php

namespace App\Http\Controllers;

use App\Models\Price;
use App\Models\RegularHoliday;
use Illuminate\Http\JsonResponse;

class FacilityController extends Controller
{
    public function prices(): JsonResponse
    {
        return response()->json(Price::all());
    }

    public function regularHolidays(): JsonResponse
    {
        return response()->json(RegularHoliday::orderBy('day_of_week')->get());
    }
}
