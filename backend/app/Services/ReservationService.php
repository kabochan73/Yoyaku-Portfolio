<?php

namespace App\Services;

use App\Models\Price;
use App\Models\Reservation;
use Carbon\Carbon;

/**
 * ReservationController(一般ユーザー)とAdminReservationController(管理者の電話代理予約)で
 * 重複していた「時間帯の妥当性チェック・料金計算」ロジックを共通化するService。
 *
 * 両コントローラーは呼ぶメソッドの組み合わせが異なる(管理者側は定休日チェックや
 * 月内上限チェックを行わない)ため、あえて1つの「予約を作る」メソッドにまとめず、
 * 小さく独立したメソッドとして提供している。
 */
class ReservationService
{
    /**
     * 開始〜終了時刻から利用時間(時間数)を計算する。
     * 例: "10:00" 〜 "13:00" なら 3。
     */
    public function duration(string $startTime, string $endTime): int
    {
        return (int) substr($endTime, 0, 2) - (int) substr($startTime, 0, 2);
    }

    /**
     * 営業時間内(10:00〜22:00)に収まっているかを判定する。
     */
    public function isWithinBusinessHours(string $startTime, string $endTime): bool
    {
        $startHour = (int) substr($startTime, 0, 2);
        $endHour = (int) substr($endTime, 0, 2);

        return $startHour >= 10 && $endHour <= 22;
    }

    /**
     * 利用時間が2〜4時間の範囲内かを判定する。
     */
    public function isValidDuration(string $startTime, string $endTime): bool
    {
        $duration = $this->duration($startTime, $endTime);

        return $duration >= 2 && $duration <= 4;
    }

    /**
     * 同じ日・重なる時間帯にすでに確定済みの予約が無いかを判定する。
     * (キャンセル済み予約は対象外)
     */
    public function hasConflict(string $date, string $startTime, string $endTime): bool
    {
        return Reservation::whereDate('date', $date)
            ->where('status', 'confirmed')
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->exists();
    }

    /**
     * 曜日(平日/週末)に応じた時間単価 × 利用時間で合計料金を計算する。
     */
    public function calculatePrice(string $date, string $startTime, string $endTime): int
    {
        $isWeekend = in_array(Carbon::parse($date)->dayOfWeek, [0, 6]);
        $priceType = $isWeekend ? 'weekend' : 'weekday';
        $amountPerHour = Price::where('type', $priceType)->value('amount_per_hour');

        return $amountPerHour * $this->duration($startTime, $endTime);
    }
}
