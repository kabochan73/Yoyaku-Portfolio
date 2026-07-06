<?php

namespace App\Http\Controllers\Admin;

use App\Events\ReservationUpdated;
use App\Http\Controllers\Controller;
use App\Mail\ReservationCancelled;
use App\Models\Price;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AdminReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $month = Carbon::createFromFormat('Y-m', $request->month);

        $reservations = Reservation::with('user')
            ->where('status', 'confirmed')
            ->whereBetween('date', [
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth(),
            ])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'date' => $r->date->format('Y-m-d'),
                'start_time' => substr($r->start_time, 0, 5),
                'end_time' => substr($r->end_time, 0, 5),
                'booker_name' => $r->booker_name,
                'price' => $r->price,
                'user_id' => $r->user_id,
            ]);

        return response()->json($reservations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'booker_name' => ['required', 'string', 'max:255'],
        ]);

        $date = $validated['date'];
        $startTime = $validated['start_time'];
        $endTime = $validated['end_time'];
        $startHour = (int) substr($startTime, 0, 2);
        $endHour = (int) substr($endTime, 0, 2);
        $duration = $endHour - $startHour;

        if ($startHour < 10 || $endHour > 22 || $duration < 2 || $duration > 4) {
            return response()->json(['message' => '時間の指定が正しくありません。'], 422);
        }

        $conflict = Reservation::whereDate('date', $date)
            ->where('status', 'confirmed')
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'その時間帯はすでに予約済みです。'], 422);
        }

        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $isWeekend = in_array($dayOfWeek, [0, 6]);
        $priceType = $isWeekend ? 'weekend' : 'weekday';
        $amountPerHour = Price::where('type', $priceType)->value('amount_per_hour');

        $reservation = Reservation::create([
            'user_id' => null,
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmed',
            'booker_name' => $validated['booker_name'],
            'price' => $amountPerHour * $duration,
        ]);

        Cache::tags(['calendar'])->flush();
        broadcast(new ReservationUpdated($date));

        return response()->json($reservation, 201);
    }

    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->update(['status' => 'cancelled']);

        if ($reservation->user) {
            Mail::to($reservation->user->email)->send(new ReservationCancelled($reservation));
        }

        Cache::tags(['calendar'])->flush();
        broadcast(new ReservationUpdated($reservation->date->format('Y-m-d')));

        return response()->json(['message' => '予約をキャンセルしました。']);
    }
}
