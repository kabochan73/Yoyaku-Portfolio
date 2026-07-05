<?php

namespace App\Http\Controllers;

use App\Events\ReservationUpdated;
use App\Mail\ReservationCancelled;
use App\Mail\ReservationConfirmed;
use App\Models\Holiday;
use App\Models\Price;
use App\Models\RegularHoliday;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reservations = $request->user()
            ->reservations()
            ->where('status', 'confirmed')
            ->whereDate('date', '>=', Carbon::today())
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json($reservations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $date = $validated['date'];
        $startTime = $validated['start_time'];
        $endTime = $validated['end_time'];
        $startHour = (int) substr($startTime, 0, 2);
        $endHour = (int) substr($endTime, 0, 2);

        if (Carbon::parse($date)->gt(Carbon::today()->addMonth())) {
            return response()->json(['message' => '予約は1ヶ月先まで可能です。'], 422);
        }

        if ($startHour < 10 || $endHour > 22) {
            return response()->json(['message' => '営業時間は10:00〜22:00です。'], 422);
        }

        $duration = $endHour - $startHour;
        if ($duration < 2 || $duration > 4) {
            return response()->json(['message' => '予約時間は2〜4時間で指定してください。'], 422);
        }

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        if (RegularHoliday::where('day_of_week', $dayOfWeek)->exists()) {
            return response()->json(['message' => 'その日は定休日です。'], 422);
        }
        if (Holiday::whereDate('date', $date)->exists()) {
            return response()->json(['message' => 'その日は休業日です。'], 422);
        }

        $alreadyBooked = Reservation::where('user_id', $request->user()->id)
            ->whereDate('date', $date)
            ->where('status', 'confirmed')
            ->exists();

        if ($alreadyBooked) {
            return response()->json(['message' => '同じ日にすでに予約があります。'], 422);
        }

        $conflict = Reservation::whereDate('date', $date)
            ->where('status', 'confirmed')
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'その時間帯はすでに予約済みです。'], 422);
        }

        $isWeekend = in_array($dayOfWeek, [0, 6]);
        $priceType = $isWeekend ? 'weekend' : 'weekday';
        $amountPerHour = Price::where('type', $priceType)->value('amount_per_hour');
        $totalPrice = $amountPerHour * $duration;

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmed',
            'booker_name' => $request->user()->name,
            'price' => $totalPrice,
        ]);

        Cache::tags(['calendar'])->flush();

        Mail::to($request->user()->email)->send(new ReservationConfirmed($reservation));

        broadcast(new ReservationUpdated($date));

        return response()->json($reservation, 201);
    }

    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reservation->update(['status' => 'cancelled']);

        Cache::tags(['calendar'])->flush();

        Mail::to($request->user()->email)->send(new ReservationCancelled($reservation));

        broadcast(new ReservationUpdated($reservation->date->format('Y-m-d')));

        return response()->json(['message' => '予約をキャンセルしました。']);
    }
}
