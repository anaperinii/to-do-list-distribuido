<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'acao' => 'required|string|max:255',
            'detalhe' => 'nullable|string',
        ]);

        $log = Log::create([
            'acao' => $data['acao'],
            'detalhe' => $data['detalhe'] ?? null,
            'usuario_id' => $request->attributes->get('usuario_id'),
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Log registrado com sucesso.',
            'data' => $log,
        ], 201);
    }

    public function index(Request $request)
    {
        $logs = Log::where('usuario_id', $request->attributes->get('usuario_id'))
            ->orderByDesc('timestamp')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Logs carregados com sucesso.',
            'data' => $logs,
        ]);
    }
}
