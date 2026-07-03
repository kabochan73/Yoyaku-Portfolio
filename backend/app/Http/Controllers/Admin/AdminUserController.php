<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['required', 'string', 'min:1', 'max:255'],
        ]);

        $users = User::where('role', 'user')
            ->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->withCount(['reservations' => fn ($q) => $q->where('status', 'confirmed')])
            ->limit(20)
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($users);
    }
}
