<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $fillable = [
        'acao',
        'detalhe',
        'usuario_id',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];
}
