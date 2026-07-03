<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
        }

        .header {
            background-color: #dc2626;
            color: white;
            padding: 16px 24px;
            border-radius: 8px 8px 0 0;
        }

        .body {
            background-color: #f9f9f9;
            padding: 24px;
            border: 1px solid #e5e7eb;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }

        .info-table th {
            text-align: left;
            padding: 8px 12px;
            background-color: #f3f4f6;
            width: 40%;
        }

        .info-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }

        .reason-box {
            margin-top: 20px;
            padding: 12px 16px;
            background-color: #fef9c3;
            border-left: 4px solid #facc15;
            border-radius: 4px;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 24px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0;">予約キャンセルのお知らせ（施設都合）</h2>
        </div>
        <div class="body">
            <p>{{ $reservation->booker_name }} 様</p>
            <p>誠に申し訳ございませんが、施設都合により以下の予約をキャンセルさせていただきます。</p>

            @if($reason)
            <div class="reason-box">
                <strong>キャンセル理由：</strong>{{ $reason }}
            </div>
            @endif

            <table class="info-table">
                <tr>
                    <th>予約日</th>
                    <td>{{ $reservation->date->format('Y年m月d日') }}</td>
                </tr>
                <tr>
                    <th>時間</th>
                    <td>{{ substr($reservation->start_time, 0, 5) }} 〜 {{ substr($reservation->end_time, 0, 5) }}</td>
                </tr>
                <tr>
                    <th>料金</th>
                    <td>¥{{ number_format($reservation->price) }}</td>
                </tr>
            </table>

            <p style="margin-top: 24px;">ご不便をおかけして申し訳ございません。またのご利用をお待ちしております。</p>
        </div>
        <div class="footer">
            <p>Futsal Park｜TEL: 000-123-4567</p>
        </div>
    </div>
</body>

</html>
