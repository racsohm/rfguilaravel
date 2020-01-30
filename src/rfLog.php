<?php

namespace racsohm\rfguilaravel;

use Illuminate\Database\Eloquent\Model;

class rfLog extends Model
{
    protected $fillable = ['idElemento','nombreModelo','idElementoSecundario','idUsuario','valorRegistro','json','jsonRespaldo','nombreUsuario'];

    static function registrar($idPrincipal,$texto,$nombreModelo,$json=null, $jsonCopia=null,$idSecundario=null){

        $usuarioData = \Illuminate\Support\Facades\Auth::user();

        self::create([
            'idElemento' => $idPrincipal,
            'valorRegistro'=>$texto,
            'nombreModelo'=>$nombreModelo,
            'json'=>$json,
            'jsonRespaldo'=>$jsonCopia,
            'idSecundario'=>$idSecundario,
            'idUsuario'=> $usuarioData->id,
            'nombreUsuario'=> $usuarioData->name
        ]);
    }
}
