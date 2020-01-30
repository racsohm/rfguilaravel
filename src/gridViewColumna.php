<?php


namespace racsohm\rfguilaravel;

class gridViewColumna{

    private static $procesados = [];

    private $nombre;
    private $complementos=[];
    private $acciones=[];
    private $busquedaLista = [];
    private $ancho;
    private $gridView;
    private $rfGui;

    private function __construct(gridView $gridView  ,$nombre, $mascara = null, $acciones=[], array $busquedaLista = [])
    {
        $this->gridView = $gridView;
        $this->nombre = $nombre;

        if(gettype($mascara) === "object"){
            $this->complementos['mask'] = $mascara;
        }

        $tipoAccion = gettype($acciones);

        switch ($tipoAccion){
            case "string":
                $this->acciones[] = $acciones;
                break;
            case "array":
                $this->acciones = $acciones;
                break;
        }

        if(sizeof($busquedaLista)>0)
            $this->busquedaLista = $busquedaLista;


    }

    /**
     * Método para procesar la mascara
     * @param $valor
     * @return mixed
     */
    public function procesarMascara($valor, $obj = null){
        return sizeof($this->complementos)>0  ?
            $this->complementos['mask']($valor,$obj) : $valor;
    }

    /**
     * Devuelve el nombre de la columna
     * @return mixed
     */
    function nombre(){
        return $this->nombre;
    }

    /**
     *
     * @param $arg
     * @return  array
     */
    function accionesLista(){
        return $this->acciones;
    }

    function busquedaLista(){
        return $this->busquedaLista;
    }


    /**
     * @param gridView $gridView = Recibe el objeto gridView
     * @param $nombre = mombre del campo del modelo
     * @param null $mascara = nombre para usar el sustituto del campo
     * @param array $acciones = array con las acciones para mostrar en la fila
     * @param null $busquedaOpciones = recibe un array con las opciones de busqueda lo que pemite crear un select en lugar de un input[text]
     * @return gridViewColumna
     */
    static function crear( gridView $gridView, $nombre, $mascara = null,$acciones=[], $busquedaOpciones = [] ){
        return new gridViewColumna($gridView, $nombre, $mascara,$acciones,$busquedaOpciones);
    }
}
