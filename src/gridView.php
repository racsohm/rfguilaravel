<?php
namespace racsohm\rfguilaravel;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;


class gridView
{
    private $columnas;
    private $id;
    private $html;
    private $modelo;
    private $ocultos = [];
    private $elementoPaginacion;
    private $rfGui;
    private $stmtOrden = null;
    private $ordenMetodo = "desc";
    private $buscarCol = null;
    private $filtro = null;
    private $filtros = [];
    private $idPadre = [];
    private $queryGetCols = null;
    private $metodoColMuestra = 0;

    function __construct($nombreModelo,  $elementoPaginacion=15, $idPadre = null, $id=null)
    {
        $id===null?
            $this->id = rfGui::generarID():
            $this->id = $id;

        $this->idPadre = $idPadre;
        $this->elementoPaginacion = $elementoPaginacion;

        // Revisamos que el nombre del modelo exista:
        $modedo = new $nombreModelo();
        $this->modelo = $modedo;
        $this->stmtOrden = $modedo->getKeyName();

        $html = new rfDoom('5.0','utf8');
        $table = $html->createElement("table");
        $table->setAttribute("class","table-sm table-bordered table-hover");
        $table->setAttribute("style","width: 100%;");
        $table->setAttribute("id",$id);

        $thead = $html->createElement("thead");
        $thead->setAttribute("class","thead bg-light");
        $table->appendChild($thead);

        $table->appendChild($html->createElement("tbody"));
        $table->appendChild($html->createElement("tfoot"));

        $html->appendChild($table);

        // Pasamos el objedo DOM a toda la clase:
        $this->html = $html;
    }

    /**
     * Método para agregar contenido al grupo de busqueda (where);
     * @param mixed ...$whereArray
     * @return $this
     */
    function agregarFiltro( ... $whereArray){
        $args = func_get_args();

        foreach ($args as $arg){
            if(gettype($arg) !== 'array' || sizeof($arg)<3)
                throw new Exception('El valor proporcionado no es un array o no tiene el siguiente patrón [{colName}, {Operador}, {valorComparacion}] ');

            // Iniciamos la variable como array:
            $this->filtros[] = $arg;

        }

        return $this;

    }

    /**
     * Fija el objeto GUI:
     * @param rfGui $rfGui
     * @return $this
     */
    public function guiFijar(rfGui $rfGui){
        $this->rfGui = $rfGui;
        return $this;
    }

    /**
     * Retorna el modelo orgien
     * @return mixed
     */
    public function modeloOrigen():Model{
        return $this->modelo;
    }

    /**
     * @param $nombre
     * @param null $mascara
     * @param null $ancho
     * @return $this
     */
    function agregarColumna($campoModelo, $nombre, $mascara = null, $acciones = null):gridViewColumna{
        $gridColObj = gridViewColumna::crear($this, $nombre,$mascara, $acciones);
        $this->columnas[$campoModelo] = $gridColObj;
        return $gridColObj;
    }

    /**
     * Agrega una nombre de columna a la lista de ocultación:
     * @param $args
     */
    function ocultarColumna($args){
        $tipo = gettype($args);
        switch ($tipo){
            case "array":
                if(sizeof($args)>0){
                    foreach ($args as $item){
                        $this->ocultos[] = $item;
                    }
                }

                break;
            default:
                $this->ocultos[] = $args;
                break;
        }
    }

    /**
     * Crear un chk de tipo bootstrap
     * @param $id
     * @param $label
     * @return \DOMElement
     */
    private function crearChk($id,$label){

        $divContainer = $this->html->createElement('div');
        $divContainer->setAttribute("class","custom-control custom-checkbox");
        $input = $this->html->createElement("input");

        return $divContainer;

    }

    /**
     * Crear una fila
     * @param array $atributos
     * @return \DOMElement
     */
    private function crearFila($atributos=[]){
        $tr = $this->html->createElement("tr");

        foreach ($atributos as $attr => $val){
            $tr->setAttribute($attr,$val);
        }

        return  $tr;
    }

    /**
     * @param string $valor
     * @param $atributos
     * @return \DOMElement
     */
    private function crearCelda($valor,$esEncabezado=false,$atributos=[]){
        $val = gettype($valor) === "object"?
            $valor :
            $this->html->createTextNode($valor);

        $cel = $this->html->createElement($esEncabezado?"th":"td");
        $cel->setAttribute('scope',$esEncabezado?"col":"row");

        // Recorremos atributos:
        foreach ($atributos as $Attr){
            $cel->setAttribute($Attr[0],$Attr[1]);
        }
        $cel->appendChild($val);

        return $cel;
    }

    /**
     * @param \DOMElement $element
     */
    private function agregarEnThead(\DOMElement $element){
        $thead = $this->html->buscar('//thead')->item(0);

        $thead->appendChild($element);
    }

    /**
     * @param \DOMElement $element
     */
    private function agregarEnTbody(\DOMElement $element){
        $thead = $this->html->buscar('//tbody')->item(0);

        $thead->appendChild($element);
    }

    /**
     * @param \DOMElement $element
     */
    private function agregarEnTfoot(\DOMElement $element){
        $thead = $this->html->buscar('//tfoot')->item(0);

        $thead->appendChild($element);
    }

    /**
     * Prepara el texto de una columna para ser mostrado de forma estilizada
     * @param $val
     */
    private function formatoTexto(&$val){

        switch ($this->metodoColMuestra){
            // Camel Case:
            case 0:
                preg_match_all('/((?:^|[A-Z])[a-z]+)/',$val,$matches);
                $val = ucwords(implode(' ',$matches[0]));
                break;
            // Por Control
            case 1:

                break;
        }
    }

    /**
     * Método para generar el campo HTML del formulario de busqueda
     * @param $nombreCampo
     * @throws \Exception
     */

    private function campoBusqueda($nombreCampo){

        // validamo primero que el campo exista:
        // $this->buscarColumna($nombreCampo);
        $tipo = DB::getSchemaBuilder()->getColumnType($this->modelo->getTable(), $nombreCampo);

        // Operadores disponibles por tipo de dato:
        $operadores = [
            'varchar'=>['=','LIKE','NOT LIKE'],
            'string'=>['=','LIKE','NOT LIKE'],
            'bigint'=>['=','>','<'],
            'integer'=>['=','>','<'],
            'double'=>['=','>','<'],
            'date'=>['=','>','<']
        ];
        // Nombre de los operadoras para mostrar en el gui:
        $operadoresNombre = [
            '='=>'Igual',
            'LIKE'=>'Parecido a',
            'NOT LIKE'=>'Diferente a',
            'IN'=>'En un grupo',
            '>'=>'Mayor que',
            '<'=>'Menor que',
        ];

        $operadorAct = $operadores[$tipo];

        // HTML DOM Base:
        $htmlinput = null;
        $htmlComparacion = $this->html->createElement("select");
        $htmlComparacion->setAttribute('name','m_'.$nombreCampo);
        $htmlBase = $this->html->createElement('div');

        // Determinamos si es una lista de opciones para el metodo de búsqueda o lo procesamos como un campo normal:
        $campoBusquedaLista = array_key_exists($nombreCampo,$this->columnas) ?
            $this->columnas[$nombreCampo]->busquedaLista() :
            [];

        if( sizeof($campoBusquedaLista) > 0){

            $htmlinput = $this->html->createElement("select");
            $htmlinput->setAttribute('name',$nombreCampo);

            foreach ($campoBusquedaLista as $value){
                $htmlinputOpt = $this->html->createElement('option',$value[0]);
                $htmlinputOpt->setAttribute('value',$value[1]);
            }

            $htmlBase->appendChild($htmlinput);
        }
        else{

            $htmlinput = $this->html->createElement("input");
            $htmlinput->setAttribute('type','text');
            $htmlinput->setAttribute('name',$nombreCampo);
            $htmlinput->setAttribute('value',old($nombreCampo));
            $htmlinput->setAttribute('placeholder','Buscar en '.$nombreCampo);

            // Preparamos el html para el campo de comparaciones:
            try{
                foreach($operadorAct as $comp ){
                    $nombreOperador = $operadoresNombre[$comp];
                    $opt = $this->html->createElement('option',$nombreOperador);
                    $opt->setAttribute('value',$comp);
                    $htmlComparacion->appendChild($opt);
                }
            }
            catch (\Exception $exception){
                dd($operadorAct,$tipo);

            }

            $htmlBase->setAttribute('class','admformbasebus');
            $htmlBase->appendChild($htmlinput);
            $htmlBase->appendChild($htmlComparacion);
        }

        return $htmlBase;

    }

    /**
     * Arma la tabla para ser mostrada:
     */
    private function armarTabla(){
        // Vamos por el nombre de la columnas
        $baseColumnas = $this->crearFila();
        $baseBuqueda = $this->crearFila();

        //$chk = $this->crearCelda($this->crearChk("general",null));
        $modeloClumnas = $this->buscarColumna();

        foreach ($modeloClumnas as  $columna){
            $valCol = null;
            if(!in_array($columna,$this->ocultos)){
                if(array_key_exists($columna,$this->columnas)){
                    $valCol = $this->columnas[$columna]->nombre();
                }
                else{
                    $valCol = $columna;
                }

                $ord = $this->ordenMetodo == "asc" ? "desc" : "asc";
                // Verificamos si hay complemento de busqueda
                $urlBus = request('vBuscar') != "" ? "&vBuscar=".request('vBuscar'): "";
                $this->formatoTexto($valCol);
                $hrefCol = $this->html->createElement("a",$valCol);
                $hrefCol->setAttribute("href",url()->current()."?ord=".$columna."&dir=".$ord.$urlBus);
                $hrefCol->setAttribute("class","btn");
                $hrefCol->setAttribute("style","font-weight: bold;");
                $col = $this->crearCelda($hrefCol,true);
                $baseColumnas->appendChild($col);

                if($columna != 'id'){
                    // Ahora creamos el campo para la busqueda:
                    $celdaBus = $this->crearCelda( $this->campoBusqueda($columna) );
                    $baseBuqueda->appendChild($celdaBus);
                }else{
                    $celdaBus = $this->crearCelda( "" );
                    $baseBuqueda->appendChild($celdaBus);
                }
            }
        }

        $this->agregarEnThead($baseColumnas);
        $this->agregarEnThead($baseBuqueda);

        {   // Agregamos los datos
            reset($modeloClumnas);
            $datos = null;


            if($this->idPadre != null)
                $this->agregarFiltro([$this->idPadre[0],'=',$this->idPadre[1]]);

            if($this->filtro != null)
                $this->agregarFiltro([$this->buscarCol,"LIKE",$this->filtro]);
            // Vamos por los datos:

            $datos = $this->modelo->where( $this->filtros)->orderBy(
                $this->stmtOrden,
                $this->ordenMetodo
            )->paginate($this->elementoPaginacion);

            foreach ($datos as $cDatos){

                $baseFila = $this->crearFila();

                foreach ($modeloClumnas as $columna){

                    if(!in_array($columna,$this->ocultos)){
                        $obj = $this->modelo::find($cDatos->id);

                        $val =  $this->procesarMascara($columna,$cDatos->{$columna},$obj);
                        // Buscmos si la columna tiene mascara
                        $celda = $this->crearCelda("$val");

                        // Buscamos si debemos agregar acciones a la celda correspondiente al nombre de la columna:
                        $objCol = $this->getObjCol($columna);
                        if($objCol){
                            $acciones =  $objCol->accionesLista();
                            foreach ($acciones as $acc){
                                // Obtenemos los datos de la accion:
                                $accionesDisp = $this->rfGui->accionesLista();

                                if(in_array($acc,$acciones)){
                                    $prepData = $accionesDisp[$acc];

                                    // Detectamos si hay codificaciones por solicitud de tabla:
                                    $datosCods = preg_match_all(
                                        "/\;[a-zA-Z\_]+\;/i",
                                        $prepData['urlAccion'],
                                        $colNamesUrl,
                                        PREG_PATTERN_ORDER
                                    );
                                    //var_dump(count($colNamesUrl[0]));
                                    $urlAccion = &$prepData['urlAccion'];
                                    //$cods = explode(";",$prepData['urlAccion']);
                                    if(sizeof($colNamesUrl[0])>=1){
                                        foreach ($colNamesUrl[0] as $nCol){
                                            $cleanCol = str_replace(";","",$nCol);
                                            $datArg = $cDatos->{$cleanCol};
                                            $urlAccion =  str_replace($nCol,$datArg,$prepData['urlAccion']);

                                        }
                                        /*$cods = $cods[1];
                                        //Buscamos el valor solicitado
                                        $datArg = $cDatos->{$cods};
                                        // Pasamos reemplazamos el valor:
                                        $prepData['urlAccion'] = str_replace(";id".$cods,$datArg,$prepData['urlAccion']);*/
                                    }


                                    $btt = $this->html->createElement("button");
                                    $btt->setAttribute('data-rf',json_encode($prepData));

                                    $target = isset($prepData['opciones']['target']) ?
                                        $prepData['opciones']['target']:
                                        'rfVentana';

                                    $btt->setAttribute('data-rf-target', $target);
                                    // $btt->setAttribute('data-rf',"");
                                    $btt->setAttribute('class',"btn btn-outline-primary rfaccion");
                                    $btt->setAttribute('style',"margin-left:5px;");
                                    $img = $this->html->createElement("img");
                                    $img->setAttribute("src",asset($prepData["icono"]));
                                    $btt->appendChild($img);
                                    $celda->appendChild($btt);
                                }

                            }
                        }
                        $baseFila->appendChild($celda);
                    }

                }

                $this->agregarEnTbody($baseFila);
            }
        }




        try{
            $link =   $datos->links();
            $basePag = $this->crearFila();
            $pag = new \DOMDocument();

            $pag->loadHTML($link);
            $listaDom = $this->html->importNode($pag->getElementsByTagName("ul")->item(0),true);
            $crearCelda = $this->crearCelda($listaDom,false,[["colspan","100%"]]);
            $basePag->appendChild($crearCelda);
            $this->agregarEnTfoot($basePag);
        }
        catch (\Exception $exception){

        }




        // ---->


    }

    /**
     * @param $nombreCol
     * @return bool|gridViewColumna
     */
    private function getObjCol($nombreCol){
        if(array_key_exists($nombreCol,$this->columnas))
            return $this->columnas[$nombreCol];

        return false;
    }

    /**
     * @param $nombreCampo
     * @param $valor
     * @return |null
     */
    private function procesarMascara($nombreCampo, $valor, $obji = null){

        $val = null;
        if(array_key_exists($nombreCampo, $this->columnas)){
            $obj = $this->columnas[$nombreCampo];
            $val = $obj->procesarMascara($valor,$obji);
        }
        else{
            $val = $valor;
        }

        return $val;
    }

    /**
     * @param bool $salidaString
     * @return string|\DOMNode
     */
    function dibujar($salidaString=true){

        $this->armarTabla();
        $tabla = $this->html->firstChild;


        return $salidaString==true ?
            $this->html->saveHTML():
            $tabla;
    }

    /**
     * @param $numero
     */
    function paginacionElementos($numero){
        $this->elementoPaginacion = $numero;
    }

    /**
     * Especifica cual es el orden de la tabla en relación a una columna de eloquent
     * @param $stmt
     */
    function ordenTabla($stmt){
        $this->stmtOrden = $stmt;
    }

    /**
     * Orden para la dirección
     * @param $orden
     * @throws \Exception
     */
    function ordenDireccion($orden){
        $permitidos = ["asc","desc"];
        if(!in_array($orden,$permitidos))
            throw new \Exception('Debe proporcionar un orden valido');
        $this->ordenMetodo = $orden;
    }

    /**
     * Define el campo de busqueda si se le pasa un nombre de lo contrario retorna los campos que conforman la tabla:
     * @param null $nombreCol
     * @return array
     * @throws \Exception
     */
    function buscarColumna($nombreCol=null){

        $cols = [];

        // Revisamos si esiste el metodo alternativo para obtener las columnas:
        if($this->queryGetCols != null){
            $data = DB::select($this->queryGetCols);
            foreach($data as $cData){
                $cols[] = $cData->Field;
            }
        }
        else
        {
            $cols = Schema::getColumnListing($this->modelo->getTable());

        }

        if($nombreCol == null){
            return $cols;
        }
        else{

            if(!in_array($nombreCol, $cols))
                throw new \Exception("El nombre de la columna no existe");

            $this->buscarCol = $nombreCol;
        }

    }

    function setQueryCols($str){
        $this->queryGetCols = $str;
    }

    public function valorBusqueda($str){
        $this->filtro = "%{$str}%";
    }

    public function busquedaEstado(){
        return $this->filtro;
    }

    /**
     * @return \DOMDocument
     */
    function html():\DOMDocument{
        return $this->html;
    }

}
