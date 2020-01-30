<?php

namespace racsohm\rfguilaravel;

use Illuminate\Routing\Controller;
use racsohm\rfguilaravel\rfRedirect;
use Exception;
use Illuminate\Contracts\View\Factory;


abstract class rfGui extends  Controller {

    protected $modeloPadre = null;
    protected $modelo = null;
    protected $modeloHijo = null;

    private $nombre;
    private $html;
    private $id;
    private $opciones=[];
    private $opcionesObj=[];
    private $tablaObj;
    protected $baseRuta;
    protected $idElementoPadre = null;
    protected $preferenciasVentana = null;
    protected $validar=null;
    protected $dependenciasModelo=null;

    protected $imgPrederterminadas = [
        'crear'=>'img/icons/archive-insert.png',
        'eliminar'=>'img/icons/trash-empty.png',
        'editar'=>'img/icons/document-edit.png'
    ];

    /**
     * @param  $tituloTabla
     * @param  $nombreModelo
     * @param  $campoBusqueda
     * @param array $sobreEscribirAcciones
     * @param null $idObj
     * @param null $id
     * @param null $strGetColsTabla
     * @throws Exception
     */
    public function preparar(
        $tituloTabla,
        $nombreModelo,
        $campoBusqueda,
        Array $sobreEscribirAcciones = [] ,
        $idObj = null ,$id=null,
        $strGetColsTabla = null
    )
    {

        if($this->baseRuta == null)
            throw new Exception('Debe proporcionar la base de la ruta en $baseRuta');

        if( gettype($tituloTabla) !== "string" || count_chars($tituloTabla) <= 2)
            throw new Exception("Debe proporcionar un nombre para el Objeto GUI");

        if($idObj != null)
        $this->idElementoPadre = $idObj;


        // Almacenamos el nombre
        $this->nombre = $tituloTabla;

        $this->tablaObj = $this->crearTabla(
                $this->modelo
        );

        if($strGetColsTabla != null)
            $this->tablaObj->setQueryCols($strGetColsTabla);

        // Validamso el ID:
        $id===null?
            $this->id = rfGui::generarID():
            $this->id = $id;

        $html = new rfDoom();
        $contenedor = $html->createElement('div');
        $contenedor->setAttribute('class','rfControl');
        $contenedor->setAttribute('id',$this->id);

        $baseAcciones = $html->createElement('div');
        $baseAcciones->setAttribute('class','baseAcciones');
        $accionesControl = $html->createElement('div');
        $accionesControl->setAttribute('class','accionesControl');
        $tituloControl = $html->createElement('div');
        $tituloControl->setAttribute('class','tituloControl');
        $baseTitulo = $html->createElement('div');
        $baseTitulo->setAttribute("class","row");
        $baseTitulo->setAttribute("style","width:100%");

        $formBuscar = $html->createElement("form");
        $formBuscar->setAttribute("method","get");
        $formBuscar->setAttribute("action",url()->current());

        $csfr = $html->createElement("input");
        $csfr->setAttribute("type","hidden");
        $csfr->setAttribute("name","_token");
        $csfr->setAttribute("value",csrf_token());
        $formBuscar->appendChild($csfr);

        $barraBusqueda = $html->createElement("input");
        $barraBusqueda->setAttribute("placeholder","Buscar");
        $barraBusqueda->setAttribute("name","vBuscar");
        // Actualizamos el valor de la busqueda:
        if(request('vBuscar') !=  ""){
            $barraBusqueda->setAttribute("value",request('vBuscar') );

        }
        $barraBusqueda->setAttribute("class","col-sm form-control border");
        $barraBusqueda->setAttribute("style","height: 80%; width: 100%;");

        $formBuscar->appendChild($barraBusqueda);

        $baseTitulo->appendChild($formBuscar);
        $tituloControl->appendChild($baseTitulo);
        $baseAcciones->appendChild($tituloControl);
        $baseAcciones->appendChild($accionesControl);


        $baseTabla = $html->createElement('div');
        $baseTabla->setAttribute('class','baseTabla');

        $contenedor->appendChild($baseAcciones);
        $contenedor->appendChild($baseTabla);

        $html->appendChild($contenedor);

        $this->html = $html;

        if(sizeof($sobreEscribirAcciones) > 0){
            foreach ($sobreEscribirAcciones as $acc){
                $acc($this);
            }
        }
        else{
            $this->eventosPredeterminados();
        }

        $this->tabla()->buscarColumna($campoBusqueda);
        $this->comportamientoBusqueda();
    }

    /**
     * @param null $args
     * @return array|mixed|null
     */
    private function buscarPreferenciasVentana($args = null){
        $out = [];
        // Si args tiene especificado las opciones detenemos el proceso y devolvemos el mismo valor:
        if( isset($args[4]) &&  sizeof($args[4]) > 0 ){
            $out =  $args[4];
        }
        // Solo si está declarado la variable local dentro de la clase procedemos a realizar algunas comparaciones:
        elseif( gettype($this->preferenciasVentana )  == 'array' && sizeof($this->preferenciasVentana) > 0  ){
            //dd($this->preferenciasVentana);
            // Buscamos si existe un array especifico para el nombre de la acción definido dentro de la clase:
            if ( gettype($args) == "array" && array_key_exists( $args[0], $this->preferenciasVentana)){
                $out =  $this->preferenciasVentana[$args[0]][0];
            }
            else{
                $out = $this->preferenciasVentana;
            }
        }

        return  $out;

    }

    /**
     * Eventos predeterminados que controlan un tipico GUI
     */
    private function eventosPredeterminados(){
        $modelo = new $this->modelo;
        $idColum = $modelo->getKeyName();
        // Cargamos las opciones pretederminadas
        $this->agregarAccion("Nuevo",$this->baseRuta.'/create','img/icons/archive-insert.png',false);
        $this->agregarAccion("Editar",$this->baseRuta.'/;'.$idColum.';/edit','img/icons/document-edit.png',true);
        $this->agregarAccion("Eliminar",$this->baseRuta.'/;'.$idColum.';','img/icons/trash-empty.png',true);

        $tabla = $this->tabla();
        $tabla->ocultarColumna(["created_at","updated_at"]);
        $tabla->agregarColumna($modelo->getKeyName(),"Opciones",function(){return "";},["Editar","Eliminar"]);

    }

    /**
     * Establece el comportamieto de busqueda predeterminado.
     * @throws Exception
     */
    private function comportamientoBusqueda(){
        $modelo = new $this->modelo;
        $idColum = $modelo->getKeyName();
        $tabla = $this->tabla();
        $tabla->ordenTabla(request('ord') ==""?$idColum : request('ord'));
        $tabla->ordenDireccion(request('dir') ==""?'desc' : request('dir'));

        // Corroboramos si existe un valor de busqueda:
        request('vBuscar') != ""?
            $tabla->valorBusqueda(request('vBuscar')):
            null;
    }

    /**
     * @param $nombreModelo
     * @return gridView
     */
    private function crearTabla($nombreModelo):gridView{
        $tabla = new gridView($nombreModelo,15,$this->idElementoPadre);
        // Fijamos el rfGui:
        $tabla->guiFijar($this);
        return  $tabla;
    }

    public function ModeloHijo(){
        return $this->modeloHijo;
    }

    public function Modelo(){
        return $this->modelo;
    }

    public function Padre(){
        return $this->modeloPadre;
    }

    /**
     * @return gridView
     */
    function tabla():gridView{
        return $this->tablaObj;
    }

    /**
     * @return string
     * @throws Exception
     */
    function dibujar(){
        // Dibujamos las acciones
        {
            if(sizeof($this->opciones)<=0)
                throw new Exception("No se ha proprocionado nínguna opción para el GUI: ".$this->nombre);

            $baseAcciones = $this->html->buscar("//div[@class='accionesControl']")->item(0);
            foreach ($this->opciones as $accion){
                $baseAcciones->appendChild($accion);
            }
        }
        // Preparamos la tabla:
        {
            $tabla = $this->tablaObj->dibujar(false);
            $baseTabla = $this->html->buscar('//div[@class="baseTabla"]')->item(0);
            $tabla = $this->html->importNode($tabla,true);
            $baseTabla->appendChild($tabla);

        }


        return $this->html->saveHTML($this->html->getElementById($this->id));
    }

    /**
     * Método para agregar acciones al GUI como botones (acciones)
     * @param $nombreBotton
     * @param $rutaControl
     * @param null $icono
     */
    function agregarAccion($nombreBotton,$rutaControl,$icono=null,$oculto=false, $opciones=[]){

        $preferencias = $this->buscarPreferenciasVentana(func_get_args());

        $prep = [
            "tipo"=>"accion",
            "urlAccion"=> $this->idElementoPadre == null ?
                url($rutaControl) :
                url($rutaControl) .'?idPadre='.$this->idElementoPadre[1],
            "icono"=>asset($icono),
            "nombreBoton"=>$nombreBotton,
            "oculto"=> $oculto,
            "opciones"=>  $preferencias
        ];


        $btt = $this->html->createElement('button');
        $btt->setAttribute("class","btn btn-secondary");

        $btt->setAttribute('data-rf',json_encode($prep));
        $target = isset($preferencias['target']) ? $preferencias['target']: 'rfVentana';
        $btt->setAttribute('data-rf-target', $target);

        if($icono!==null){
            $img = $this->html->createElement("img");
            $img->setAttribute("src",asset($icono));
            $btt->appendChild($img);
        }

        $txt = $this->html->createTextNode($nombreBotton);
        $btt->appendChild($txt);

        if(!$oculto)
            $this->opciones[] = $btt;

        $this->opcionesObj[$nombreBotton] = $prep;
    }

    /**
     * Retorna la lista de acciones disponibles para el GUI:
     * @return array
     */
    function accionesLista(){
        return $this->opcionesObj;
    }

    /**
     * Método estático para generar un ID dinámico con un prefijo
     * @param string $prefijo
     * @return string
     */
    static function generarID($prefijo = "RF"){

        return $prefijo."_".md5(microtime());

    }

    /**
     * @return mixed
     */
    function ruta(){
        return $this->baseRuta;
    }

    /**
     * Retorna la vista final
     * @param array $args
     * @return Factory|\Illuminate\View\View
     * @throws Exception
     */
    function view($args=[]){

        try {
            $argsInner = [
                'tabla'=> $this->dibujar(),
                'gui'=>$this,
                'nombre'=>$this->nombre
            ];

            if(sizeof($args)>0){
                foreach ($args as $index => $value){
                    $argsInner[$index] = $value;
                }
            }

            return view(
                'baseGui',
                $argsInner

            );
        }
        catch (Exception $exception)
        {
            return  view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Simplifica la creaciòn del método create
     * @param string $vista
     * @return Factory|\Illuminate\View\View
     */
    public function createRf(string $vista, $argExt = null)
    {
        try{
            $obj = new $this->modelo();

            $innerArgs = [
                'obj'=>$obj,
                'gui'=>$this,
                'put'=>'no',
                'ruta'=> route($this->baseRuta.'.store')
            ];

            $this->argExt($innerArgs,$argExt);

            return  view(
                $vista,
                $innerArgs
            );
        }
        catch (Exception $exception)
        {
            return view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Simplifica la creaciíon del método store:
     * @param $request
     * @param string $msn
     * @param $redirecUrl
     * @param null $args
     * @return Factory|\Illuminate\View\View
     */
    public function storeRf($request, $msn ='Se ha procesado el elemento', $redirecUrl=null, $argExt = null){
        try{
            $data = [];

            if($this->validar !== null){
                $data = $this->validate(
                    $request,
                    $this->validar
                );
            }
            else{
                $data = $request->all();
                unset($data['_token']);
            }

            $obj = $this->modelo::create($data);

            $arg = rfRedirect::preparaUrl(
                $redirecUrl == null ? $this->baseRuta : $redirecUrl
                ,$msn
                ,false
            );
            $id = $obj->getKeyName();

            rfLog::registrar(
                $obj->{$id},
                'CREATE',
                $this->modelo,
                $obj->toJson()
            );

            $innerArgs = ['args'=>$arg];

            $this->argExt($innerArgs,$argExt);

            return view('redirect',$innerArgs);

        }
        catch (\Exception $exception)
        {
            return view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Simplifica el metodo edit
     * @param $id
     * @param string $view
     * @return Factory|\Illuminate\View\View
     */
    public function editRf($id, string $view, $argExt = null )
    {
        try{

            $obj = $this->modelo::find($id);
            $innerArgs = [
                'gui'=>$this,
                'obj'=>$obj,
                'put'=>'si',
                'ruta'=>route(
                    $this->baseRuta.'.update',
                    ['id'=>$id]
                )
            ];

            $this->argExt($innerArgs,$argExt);

            return  view(
                $view,
                $innerArgs
            );

        }
        catch (\Exception $exception){
            return  view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Simplifica el metodo actualizar
     * @param $request
     * @param $id
     * @param null $msn
     * @param $baseRuta
     * @return Factory|\Illuminate\View\View
     */
    public function updateRf($request, $id , $msn = null,$baseRuta = null)
    {
        try {
            $msnControl = $msn == null ?
                'Elemento actualizado correctamente':
                $msn;

            $data = [];

            if($this->validar != null ){
                $data = $this->validate($request,$this->validar);
            }
            else
            {
                $data = $request->all();
                unset($data['_token']);
            }


            $obj = $this->modelo::find($id);
            $ant = $obj->toJson();


            if($obj == null)
                throw new \Exception('No fue posible localizar el objeto con ID: '.$id.' del modelo'.$this->modelo);

            $obj->update($data);

            rfLog::registrar(
                $id,
                'UPDATE',
                $this->modelo,
                $obj->toJson(),
                $ant
            );

            $arg = rfRedirect::preparaUrl(
                $baseRuta== null ?$this->baseRuta : $baseRuta
                ,$msnControl
                ,false
            );
            return view('redirect',['args'=>$arg]);

        }
        catch (\Exception $exception)
        {
            return view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * @param $id
     * @param $vista
     * @return Factory|\Illuminate\View\View
     */
    protected function showRf($id,$vista)
    {
        try {
            if($v =$this->tieneDependencias($id))
                throw new \Exception(
                    'No es poible eliminar la unidad de medida ya que existe una dependencia en: '.$v
                );

            $obj = $this->modelo::find($id);
            return view(
                $vista,
                [
                    'gui'=>$this,
                    'obj'=>$obj,
                    'ruta'=>route($this->baseRuta.'.destroy',['id',$id])
                ]
            );
        }
        catch (\Exception $exception) {
            return  view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Proceso para dar de baja un modelo dependiendo del metodo elejido.
     * @param $id [Id del objeto que debemos cargar]
     * @param $metodo [0 = Eliminar de la tabla, 1 = Cambiar estado]
     * @param $colEstado  [Nombre de la columna para cambiar el estado.]
     * @param $estadoValor [Valor que se debe colocar en caso de que el meétodo de eliminarción sea por estado]
     * @return Factory|\Illuminate\View\View
     */
    protected function destroyRf( $id, $urlRedirect=null, $metodo=0, $colEstado='estado', $estadoValor ='E'){

        try{
            // Opes
            $obj = $this->modelo::find($id);

            if($obj == null)
                throw new Exception('No fue posible ubicar el ID: '.$id.' del modelo '.$this->modelo);
            $ant = $obj->toJson();

            // Detectamos el metodo de eliminación o baja:
            if($metodo == 0){
                $obj->destroy($id);
            }
            else{
                $obj->{$colEstado} = $estadoValor;
                $obj->save();
            }
            // Avisamos sobre el evento
            rfLog::registrar(
                $id,
                'DELETE',
                $this->modelo,
                $ant
            );

            $arg = rfRedirect::preparaUrl(
                $urlRedirect == null ? $this->baseRuta : $urlRedirect
                ,'Se ha eliminado el elemento'
                ,false
            );


            return view('redirect',['args'=>$arg]);
        }
        catch (Exception $exception)
        {
            return view('error',['error'=>$exception->getMessage()]);
        }
    }

    /**
     * Verifica si el modelo tiene dependencia en otros modelos:
     * para ello en la propiedad $dependenciasModelo se debe de especificar un array por cada  uno o mas modelo
     * dependientes con la sigueinte estructura: [ [(class::Name) nombreModelo, (string) idColumna ] , ... ]
     * @param $id
     * @return bool
     */
    protected function tieneDependencias($id){
        $validar = null;
        $msn = null;
        if(gettype($this->dependenciasModelo) == 'array' && sizeof($this->dependenciasModelo)> 0){

            foreach ($this->dependenciasModelo as $cModelo){
                $modeloObj = $cModelo[0]::where($cModelo[1],'=',$id)->get();
                if($modeloObj->count()){
                    $validar = true;
                    $msn = $cModelo[0];
                    break;
                }
            }

        }

        return $validar== true ? $msn : false;
    }

    /**
     * @param $original
     * @param $ext
     */
    private function argExt(&$original, $ext){
        if(gettype($ext) == 'array' && sizeof($ext) > 0){
            foreach ($ext as $index => $value){
                $original[$index] = $value;
            }
        }
    }
}
