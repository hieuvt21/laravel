<?php

namespace Modules\DongBo\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\DongBo\Services\DongBoService;

class DongBoController extends Controller
{
    public function day(Request $request, DongBoService $dongBo): JsonResponse
    {
        $d = $request->validate([
            'cacThaoTac' => ['required', 'array', 'max:100'],
        ]);
        return response()->json(['ketQua' => $dongBo->day($d['cacThaoTac'], $request->attributes->get('quyen'))]);
    }

    public function keo(Request $request, DongBoService $dongBo): JsonResponse
    {
        $d = $request->validate(['since' => ['nullable', 'integer', 'min:0']]);
        return response()->json($dongBo->keo((int) ($d['since'] ?? 0), $request->attributes->get('quyen')));
    }
}
