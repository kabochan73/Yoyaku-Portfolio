<?php

namespace App\Http\Controllers\Admin;

use App\Events\ReservationUpdated;
use App\Http\Controllers\Controller;
use App\Mail\ReservationCancelledByHoliday;
use App\Models\Holiday;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AdminHolidayController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Holiday::orderBy('date')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'reason' => ['nullable', 'string', 'max:255'],
            'force' => ['boolean'],
        ]);

        if (Holiday::whereDate('date', $validated['date'])->exists()) {
            return response()->json(['message' => 'その日はすでに休日として登録されています。'], 422);
        }

        $conflictingReservations = Reservation::whereDate('date', $validated['date'])
            ->where('status', 'confirmed')
            ->with('user')
            ->get();

        if ($conflictingReservations->isNotEmpty() && empty($validated['force'])) {
            return response()->json([
                'warning' => true,
                'count' => $conflictingReservations->count(),
                'message' => "{$conflictingReservations->count()}件の予約があります。全てキャンセルして休日を設定しますか？",
            ], 409);
        }

        foreach ($conflictingReservations as $reservation) {
            $reservation->update(['status' => 'cancelled']);

            if ($reservation->user) {
                Mail::to($reservation->user->email)
                    ->send(new ReservationCancelledByHoliday($reservation, $validated['reason'] ?? null));
            }
        }

        $holiday = Holiday::create([
            'date' => $validated['date'],
            'reason' => $validated['reason'] ?? null,
        ]);

        Cache::tags(['calendar'])->flush();

        broadcast(new ReservationUpdated($validated['date']));

        return response()->json($holiday, 201);
    }

    public function destroy(Holiday $holiday): JsonResponse
    {
        $date = $holiday->date->format('Y-m-d');

        $holiday->delete();

        Cache::tags(['calendar'])->flush();

        broadcast(new ReservationUpdated($date));

        return response()->json(['message' => '休日を削除しました。']);
    }
}
