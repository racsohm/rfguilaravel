<?php

namespace racsohm\rfguilaravel;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Routing\Route;

class rfRedirect extends Controller
{
    /**
     * Codifica una ruta para hacerla compatible a través de un URI
     * @param $rutaStr
     * @return string|string[]
     */
    private static function codificarRuta($rutaStr){
        return str_replace('/','.',$rutaStr);
    }

    /**
     * Decodificar una ruta provida por un codificador de ruta
     * @param $rutaStr
     * @return string|string[]
     */
    private static function recodificarRuta($rutaStr){
        return str_replace('.','/',$rutaStr);
    }

    /**
     * Prepara una ruta para enviarla al controlador rfRedirect::index
     * @param $ruta
     * @param $mensaje
     * @return string
     */
    static function preparaUrl($ruta,$mensaje,$codificar=true){
        return implode(
            ";",
            [
                $codificar?rfRedirect::codificarRuta($ruta):$ruta,
                htmlentities($mensaje)]
        );
    }

    /**
     * @param $rutaStr
     * @return array
     */
    static function recuperaUrl($rutaStr){

        $data = explode(";",$rutaStr);
        $data[0] = self::recodificarRuta($rutaStr);

        return $rutaStr;
    }

    function index($args){
        $args = self::recuperaUrl($args);
        return view('/redirect',["args"=>$args]);
    }
}
