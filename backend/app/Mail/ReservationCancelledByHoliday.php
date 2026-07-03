<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationCancelledByHoliday extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly ?string $reason = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '【Futsal Park】予約キャンセルのお知らせ（施設都合）',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reservation-cancelled-by-holiday',
        );
    }
}
