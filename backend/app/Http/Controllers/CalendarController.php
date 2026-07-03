<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use App\Models\RegularHoliday;
use App\Models\Reservation;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CalendarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $today = Carbon::today();

        // 日付が変わると「今日」の判定が変わるため、キャッシュキーに含めて自動的に切り替える
        $cacheKey = "calendar:{$request->month}:{$today->format('Y-m-d')}";

        $calendar = Cache::tags(['calendar'])->remember(
            $cacheKey,
            $today->copy()->endOfDay(),
            fn () => $this->buildCalendar($request->month, $today)
        );

        return response()->json($calendar);
    }

    private function buildCalendar(string $month, Carbon $today): array
    {
        $month = Carbon::createFromFormat('Y-m', $month);
        $maxDate = $today->copy()->addMonth();

        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $regularHolidays = RegularHoliday::pluck('day_of_week')->toArray();
        $holidays = Holiday::whereBetween('date', [$start, $end])
            ->pluck('date')
            ->map(fn ($d) => $d->format('Y-m-d'))
            ->toArray();

        $reservations = Reservation::where('status', 'confirmed')
            ->whereBetween('date', [$start, $end])
            ->get(['date', 'start_time', 'end_time']);

        $calendar = [];

        foreach (CarbonPeriod::create($start, $end) as $date) {
            $dateStr = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeek;

            if ($date->lt($today) || $date->gt($maxDate)) {
                $calendar[$dateStr] = ['closed' => true, 'slots' => []];
                continue;
            }

            if (in_array($dayOfWeek, $regularHolidays) || in_array($dateStr, $holidays)) {
                $calendar[$dateStr] = ['closed' => true, 'slots' => []];
                continue;
            }

            $bookedSlots = $reservations
                ->filter(fn ($r) => $r->date->toDateString() === $dateStr)
                ->map(fn ($r) => [
                    'start' => (int) substr($r->start_time, 0, 2),
                    'end' => (int) substr($r->end_time, 0, 2),
                ]);

            $slots = [];
            for ($hour = 10; $hour <= 20; $hour++) {
                $isBooked = $bookedSlots->contains(fn ($b) => $hour >= $b['start'] && $hour < $b['end']);
                $slots[$hour] = $isBooked ? 'booked' : 'available';
            }

            $calendar[$dateStr] = ['closed' => false, 'slots' => $slots];
        }

        return $calendar;
    }
}
