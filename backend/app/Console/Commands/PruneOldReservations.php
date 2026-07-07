<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('reservations:prune-old')]
#[Description('3ヶ月より前の予約を削除する（admin画面の閲覧上限と対称）')]
class PruneOldReservations extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $cutoff = Carbon::today()->subMonths(3);

        $count = Reservation::where('date', '<', $cutoff)->delete();

        $this->info("{$count}件の予約を削除しました（{$cutoff->format('Y-m-d')}より前）。");
    }
}
