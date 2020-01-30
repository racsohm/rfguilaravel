/// <reference path="node_modules/@types/jQuery.d.ts">
class rfFrameWork {

    static generarId(){
        let rand1 = Math.random();
        let rand2 = Math.random();
        return "rf_"+( (rand1*rand2) * 100 + Math.random() );
    }
    /**
     * Guarda un valor como una cookie
     * @param nombre
     * @param valor
     * @param toJSON
     */
    static cWrite(nombre,valor,toJSON=false){
        return window.localStorage.setItem(nombre,toJSON===true?JSON.stringify(valor):valor);
    }
    /**
     * Obtiene un valor de una cookie previamente almacenada.
     * @param nombre
     * @param aJson
     */
    static cRead(nombre,aJson = false){
        let cVal = window.localStorage.getItem(nombre);
        if(typeof cVal == "undefined")
            return  false;

        return !aJson? window.localStorage.getItem(nombre): JSON.parse(cVal);
    }
    /**
     * Especifica la ruta a las imagenes SVG:
     */
    static urlImagenes = "../../../img";
    /**
     * Carga un SVG
     * @param nombreImagen
     */
    static loadSvg(nombreImagen){
        let svg:JQuery = null;
        $.ajax({
            url:`${rfFrameWork.urlImagenes}/${nombreImagen}.svg`,
            async:false,
            success:function (e) {
                svg = $(e);
            }
        });

        return svg.contents();
    }
    /**
     * Clase para clonar un objeto ya que en JS los objeto se pasan por referencia
     * @param objeto
     * @param Agregar
     */
    static clonarObjeto(objeto,Agregar?){
        let tmpObj = {};
        // Recorremos el objeto y lo clonamos las opciones:
        for(let x in objeto){
            tmpObj[x] = objeto[x];
        }
        // Si existe adición las pasamos:
        if(typeof Agregar == "object"){
            for(let a in Agregar){
                tmpObj[a] = Agregar[a];
            }
        }

        return tmpObj;
    }

    /**
     * Detecta su el contenido actual esta o no en un frame para el control de diálogos:
     */
    static detectaFrame(){
           return  window.location !== window.parent.location;
    }

}

/**
 * Interface para rfBootOpciones
 */
interface rfBootOpciones {
    nombreModulo:string;
    css?:any;
    otros?:any;
    ruta?:string
}

/**
 * Interface para datos tipos:
 */
interface datosTipo {
    etiqueta:string;
    atributos:string;
}

/**
 * Clase para importar modulos rfFrameWork
 */
class rfBoot{

    static modulosPorDefecto;

    private tipos= {
        css:{
            etiqueta: "link",
            extension:"css",
            atributos:{
                type: 'text/css',
                rel: 'stylesheet',
                href: null
            }
        },
        js:{
            etiqueta: "script",
            extension:"js",
            atributos:{
                type: 'text/javascript',
                src: null
            }
        }
    };


    private importar(nombre,type,ruta){

        try{
            // Buscamos primero el objeto JS:
            let datosTipo:datosTipo = this.tipos[type];
            if(typeof datosTipo != "object")
                throw "El tipo de origen no es válido";

            let fullPath = `${ruta}${nombre}.${type}`;
            type=="js"?
                datosTipo.atributos["src"] = fullPath:
                datosTipo.atributos["href"] = fullPath;

            $(`<${datosTipo.etiqueta}>`)
                .appendTo('head')
                .attr(datosTipo.atributos);
            /*jQuery.ajax({
                url: fullPath,
                dataType: datosTipo.dataType,
                cache: true,
                async:false,
                data:{ _rfToken_ :(Math.random() * Math.random())}
            }).done(function() {
                // jQuery.cookie("cookie_name", "value", { expires: 7 });
            });*/
        }
        catch (e) {
            alert(e);
        }
    }



    static boot(){
        let me = new rfBoot();

        try{
            if(typeof rfBoot.modulosPorDefecto !== "object" || Object.keys(rfBoot.modulosPorDefecto).length <= 0)
                throw "No existen modulos por defecto, o bien el tipo de objeto no es valido";

            for(let x in rfBoot.modulosPorDefecto){
                let cItem:rfBootOpciones = rfBoot.modulosPorDefecto[x];
                me.importar(cItem.nombreModulo,"js",cItem.ruta);
                // Buscamos si tienen CSS:
                if(typeof cItem.css !== "undefined"){
                    me.importar(cItem.css,"css",cItem.ruta);
                }
            }
        }
        catch (e) {
            alert(e)
        }
    }

    static cargarModulo(optModulo:rfBootOpciones){
        let me = new rfBoot();
    }


}

// RFVENTANA //
interface iOptRfVentana {
    alto?:number;
    ancho?:number;
    tipo?:number;
    eventoCerrar?:any;
    base?:JQuery
    minimizar?:boolean;
    maximizar?:boolean,
    opcional1?:any
}

class rfVelo {
    private html:JQuery;
    constructor(ventana:rfCVentana) {
        console.log('Velo')
        this.html = $(`<div class='rfVelo'></div>`);
        ventana.htmlObj().before(this.html);
    }

    public destruir(){
        this.html.remove();
    }

}

class rfCVentana {

    static zIndexDB = [];
    static OMGW = {};
    private titulo = "N/A";
    private html:JQuery;
    // 0 = Normal 1= Minimizado, 3 Máximizado
    private estado:number = 0;
    private opciones:iOptRfVentana = {ancho:400,alto:250,eventoCerrar:null,tipo:null,maximizar:true,minimizar:true};
    private idElemento = null;
    private base:JQuery = null;
    private velo:rfVelo = null;

    /**
     * Método constructor
     * @param titulo
     * @param contenido
     * @param opciones
     * @param procesador
     */
    private constructor(titulo="Sin nombre",contenido:JQuery|string,opciones?:iOptRfVentana,procesador=null){
        this.idElemento = rfFrameWork.generarId();
        let me = this;
        this.opciones.ancho = opciones.ancho;
        this.opciones.alto = opciones.alto;

        if(typeof opciones.eventoCerrar == "function")
            this.opciones.eventoCerrar = opciones.eventoCerrar;
        this.html = $(`
    <div class="rfGrid rfVentana" id="${this.idElemento}" style="width: ${this.opciones.ancho}; height: ${this.opciones.alto};
        position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">
    <div class="rfGrid rfVentana encabezado">
        <div class="rfGrid rfVentana encabezado titulo">${titulo}</div>
        <div class="rfGrid rfVentana encabezado opt">
            <button class="rfGrid rfVentana encabezado opt minimiza">_</button>
            <button class="rfGrid rfVentana encabezado opt maximiza">[]</button>
            <button class="rfGrid rfVentana encabezado opt cerrar">X</button>
        </div>
    </div>
    <div class="rfGrid rfVentana contenido"></div>
    <div class="rfGrid rfVentana infobar"></div>
    </div>`);
        this.html.data({rfCVentana:this});
        // Pasamos el evento de cerrar:
        this.html.find(".cerrar").on("click",function (e) {
            e.preventDefault();
            me.cerrar();
        });
        // Revisamos los controles de minimizar y maximizar
        {
            if(typeof opciones.maximizar == "boolean")
                this.opciones.maximizar = opciones.maximizar;
            !this.opciones.maximizar?this.html.find(".maximiza").remove():null;

            if(typeof opciones.minimizar == "boolean")
                this.opciones.minimizar = opciones.minimizar;
            !this.opciones.minimizar?this.html.find(".minimiza").remove():null;
        }

        this.html.find(".rfGrid.rfVentana.contenido").append(contenido);
        opciones.base.append(this.html);
        // Creamos el velo
        this.velo = new rfVelo(this);

        this.estado = 1;
        this.base = opciones.base;

        // Avisamos al objeto supremo de nuestra existencia:
        rfCVentana.OMGW[this.idElemento] = this;
        // Correspmos el procesador
        if(typeof procesador == "function")
            window.setTimeout(function () {
                procesador(me);
            },100);

    }

    /**
     * Supervisa el estado del objeto Ventana
     * para el correcto control de los datos:
     */
    private control(){
        if(this.estado==0)
            throw "La ventana no se ha iniciado";
        return this;
    }

    /**
     * Evento para cerrar la ventana:
     */
    public cerrar(eventoFinal?){

        let me = this;
        let eventoCierre = (typeof eventoFinal == "function")?
            eventoFinal :
            this.opciones.eventoCerrar;

        this.html.fadeOut("fast",function () {
            me.velo.destruir();
            me.html.remove();

            if(typeof eventoCierre == "function"){
                try {
                    eventoCierre(me);
                }
                catch (e) {
                    alert(e);
                }

            }

        });
    }

    /**
     * Retorna el emento padre donde se ensambla en Nuevo objeto:
     */
    public parentNode(){
        return this.base;
    }

    /**
     * Actualiza el contenido de la barra de información.
     * @param data
     */
    public actualizarBaraInfo(data){
        this.control();
        let baseInfo = this.html.find(".infobar");

        !baseInfo.is(":visible")?
            baseInfo.show():null;

        baseInfo.html(data);
        return this;
    }

    /**
     * Método para actulizar el contenido de la ventana:
     * @param html
     * @param callBack
     */
    public actualizarContenido(html:any,callBack?){
        this.html.find(".contenido").html(html);
        if(typeof callBack === "function")
            callBack(this);
    }

    public htmlObj():JQuery{
        return this.html;
    }

    /**
     * Retorna el ID del objeto
     */
    public id(){return this.idElemento;}

    //----------------------------- METODOS ESTÁTICOS ----------------------------

    /**
     * Esta clase nos ayuda a generar un diálogo rápido para el sistema
     * dentro de dos categorias 1: Advertencia, 2: Error
     * @param mensaje
     * @param opciones
     */
    static dialogo(mensaje:string,opciones?:iOptRfVentana){

        // Validamos que se proporcione un tipo de ventana valida:
        if(typeof opciones.tipo == "undefined" || opciones.tipo <= 0 || opciones.tipo > 3)
            throw "Debe proporcionar un tipo válido";
        // Otras configuraciones
        opciones.maximizar = false;
        opciones.minimizar = false;
        // Alamcenamos la clase de tipo:
        let cTipo = null;
        let img = null;
        let cTitulo = null;

        switch (opciones.tipo) {
            case 1:
                cTipo = "advertencia";
                img = "advertencia";
                cTitulo = "Advertencia";
                break;
            case 2:
                cTipo = "imgError";
                img = "error";
                cTitulo = "Error";
                break;
            case 3:
                cTipo = "decision";
                img = "interrogacion";
                cTitulo = "Toma de decisión";
                break;
        }

        let strAdvertencia = $(
            `
                    <div class="rfGrid rfVentana contenido advertencia">
                        <div class="rfGrid rfVentana contenido advertencia txt">
                            <div class="rfGrid rfVentana contenido advertencia txt str">${mensaje}</div>
                            <div class="rfGrid rfVentana contenido advertencia txt opts"></div>
                        </div>
                        <div class="rfGrid rfVentana contenido advertencia img1">
                        <div class="imgRf"></div>
                    </div>`);
        let imgSvg:any = rfFrameWork.loadSvg(img);
        strAdvertencia.find(".imgRf").append(imgSvg);
        // Revisamos si es una toma de desciciones:
        let me:rfCVentana = null;

        if( opciones.tipo == 3 ){
            for(let dd in opciones.opcional1){
                let cElement = opciones.opcional1[dd];

                if( typeof cElement['gui'] == "undefined" ){
                    let cTmp = $(`<button name="${dd}" class="opt" >${dd}</button>`);
                    cTmp.bind('click',function () {
                        me.cerrar(cElement['evento']);
                    });

                    strAdvertencia.find(".opts").append(cTmp);
                }else{
                    let cTmp = cElement["gui"];
                    strAdvertencia.find(".opts").append(cTmp);
                }
            }
        }

        // Revisamos las opciones para este tipo de elemento:
        let opcionesDefault = {alto:200, ancho:400};

        if( typeof opciones == "object"){
            typeof opciones.alto == "undefined"? opciones.alto = opcionesDefault.alto:null;
            typeof opciones.ancho == "undefined"? opciones.ancho = opcionesDefault.ancho:null;
        }
        else{
            opciones = opcionesDefault;
        }
        return me = new rfCVentana(cTitulo,strAdvertencia,opciones);
    }

    static ventana(titulo,contenido,opciones, proceador=null):rfCVentana{
        return  new rfCVentana(titulo,contenido,opciones,proceador);
    }


    private static controlZindex(){

    }


}
// RF-TABLA //
/**
 * Interfaz para el control de datos:
 */
interface datosRfGrid {
    columnas:any;
    datos:[];
    idElemento?:any;
    titulo?;
    ancho:number;
    alto:number;
    idTabla:string;
    ctrlClick:any;
    paginacion:number;
    colorSeleccion:string;
}

/**
 * Clase para dibujar una tabla con un conjunto de datos
 * proporcionados a través de json
 */
class rfCtable {

    private datos:datosRfGrid;
    private colorSeleccion:string = "red";
    private parentNonde:JQuery;
    private html:JQuery;
    private ordenColumnas=null;
    private anchoInterno = 35;
    private ctrlClick:any=null;
    private paginacion:number = null;
    private filasGui;
    private tmpBusqueda;

    private constructor(param1:datosRfGrid,base:JQuery){

        this.datos = param1;
        let me = this;

        // validamos datos:
        if(typeof param1.datos !== "object")
            throw "El parámetro datos debe ser un objeto";
        if(typeof param1.columnas !== "object" || Object.keys(param1.columnas).length <= 0)
            throw "No se ha procionado un objeto válido para las columnas o éste está vacio";
        if(typeof param1.idTabla == "undefined")
            throw "Debe proporcionar un identificador para la tabla [idTabla]";

        // Validamos si existe un ctrlClick
        if(typeof param1.ctrlClick == "function")
            this.ctrlClick = param1.ctrlClick;
        // Validamos los opciones de paginación:
        if( typeof param1.paginacion == "number")
            this.paginacion = param1.paginacion;
        // Revisamos si existen un color definido para los elementos seleccinados:
        if(typeof param1.colorSeleccion == "string")
            this.colorSeleccion = param1.colorSeleccion;



        // Validamos el entorno
        this.initEntorno(param1.idTabla);

        this.parentNonde = base;

        let titulo = typeof this.datos.titulo == "undefined"?
            "":
            `<div class="rfTabla titulo" >${this.datos.titulo}</div>`;

        let tmpPaginador = $(`<div class="rfTabla paginador">
        <div class="rfTabla paginador vbuscar"></div>
        <div class="rfTabla paginador vpag"><select name="paginador"></select>  </div>
</div>`);
        let formBuscar  = this.newForBusqueda(false);

        tmpPaginador.find(".vbuscar").append(formBuscar);


        this.html = $(
            `<div id="${rfFrameWork.generarId()}" class="rfTabla" style="width: ${this.datos.ancho}; height: ${this.datos.alto};">
                   </div>`
        );

        titulo += tmpPaginador.prop("outerHTML");


        // Preparamos el ordén de las filas:
        if(typeof this.datos.titulo !== "undefined")
            this.html.append(titulo);

        // Colocamos las columnas según orden (fila para las columnas):
        let filaEncabezado = this.nuevaFila('encabezado');

        // Ahora agregamos un Chk (Tipo general);
        let chkOpt = this.nuevaCelda(
            `<div class="chk"><input type="checkbox"></div>`,
            "columna",
            {width:35},
            true
        );
        // Evento para contrlorar todos los chk;
        chkOpt.on({
            click: function (w) {
                me.controlChk();
            }
        });

        filaEncabezado.append(chkOpt);
        // Creamos los encabezados:
        for(let cname in this.ordenColumnas){
            let cItem = this.ordenColumnas[cname].split("|");
            // Buscamos el tamaño de la celda:
            let ancho = this.datos.columnas[cItem[0]]["ancho"];
            let pegajoso = this.datos.columnas[cItem[0]]["pegajoso"];
            this.anchoInterno += parseInt(ancho);
            //
            let cCelda = this.nuevaCelda(cItem[1],"columna",{width:ancho},pegajoso,null,null,`data-orden='X'`);
            cCelda.on({
                click:function (e) {
                    let modoOrden=$(this).attr("data-orden");
                    me.ordenar(cname,modoOrden);
                    $(this).attr("data-orden",modoOrden=='0'?'1':'0');
                }
            });
            filaEncabezado.append(cCelda);

        }

        // Pasamos el ancho total y adjuntamos el encabezado:
        filaEncabezado.css({width:this.anchoInterno});
        this.html.append(filaEncabezado);
        // Calculamos la paginación:
        this.generaPaginador();
        // Pasamos el evento de búsqueda:
        let formBus = this.html.find("form[name=vbus]");
        this.eventoBuqueda(formBus);

        base.append(this.html);

        this.paginacion!==null?
            this.rangoPaginacion(1,true):
            this.dibujarFilas(this.datos.datos);
    }

    /**
     * Metodo para generar la paginación
     * @param vPagClass
     */
    private generaPaginador(){
        let vPagClass:JQuery = this.html.find(".vpag");
        let me = this;
        let select = vPagClass.find("select");

        if(this.paginacion != null){
            let nElementos = Object.keys(this.datos.datos).length;
            let nPag = Math.ceil(nElementos / this.paginacion);
            // Calculamos las paginas que usaremos dentro de la paginación:

            select.empty();
            // Agregamos la paginacion
            for(let x1 = 1; x1<=nPag; x1++){
                select.append(`<option value="${x1}">${x1}</option>`);
            }

        }
        // Pasamos el evento de paginación:
        select.on({
            change:function () {
                let cPos = $(this).find("option:checked").val();
                me.rangoPaginacion(cPos);
            }
        });
        this.actulizarNumeroFilas();
    }

    private actulizarNumeroFilas(){
        let vPagClass:JQuery = this.html.find(".vpag");
        vPagClass.find("span").remove();
        vPagClass.append(`<span>Filas: ${Object.keys(this.datos.datos).length}</span>`);
    }
    /**
     *
     * @param tmp
     */
    private dibujarFilas(tmp,limpiarGui=false){

        if(limpiarGui == true)
            this.html.find(".filaLineal").remove();

        let me = this;
        // Ahora vamos por el conenido de las filas y preparamos a organizar el orden según lo establecido
        // por la constante del sistema.
        for(let cItem in tmp){

            let cDato = tmp[cItem];
            // Evitamos un desbordamiento de datos:
            if(typeof cDato == "undefined")
                break;
            let cFila = this.nuevaFila("fila filaLineal",cDato,{width:this.anchoInterno});

            // Elemento CHK para la fila:
            let chkOpt = this.nuevaCelda(
                `<div class="chk"><input type="checkbox"></div>`,
                "columna",
                {width:25},
                true
            );

            let getChkItem = chkOpt.find(".chk input");
            getChkItem.on("click",function (e) {

                let cVal = $(e.currentTarget).is(":checked");
                me.chkStilo(cFila,cVal);

            });

            cFila.append(chkOpt);

            // Iniciamos el orden de datos:
            for(let eo in this.ordenColumnas){
                let cOrden = this.ordenColumnas[eo].split("|");


                let cValCelda:any = cDato[eo] ;

                let pegajoso = this.datos.columnas[eo]["pegajoso"];
                let ancho_ = this.datos.columnas[eo]["ancho"];
                //
                if(typeof this.datos.columnas[eo]["mascara"] == "function"){
                    cValCelda = this.datos.columnas[eo]["mascara"](cValCelda);
                }

                let tmpCelda = this.nuevaCelda(cValCelda,"fila celda",{width:ancho_},pegajoso,null,cDato);
                cFila.append(tmpCelda);

            }


            this.html.append(cFila);
        }



    }
    /**
     *
     * @param pos
     * @param reiniciar
     * @param callBack
     */
    private rangoPaginacion(pos,reiniciar=true,callBack=null){

        this.html.find(".filaLineal").remove();

        let newPos =  (pos * this.paginacion) - this.paginacion;
        let cursor = 1;
        let tmp = [];
        for(let cPos = newPos; cursor <= this.paginacion; cPos++){
            tmp.push(this.datos.datos[cPos]);
            cursor++;
        }
        this.filasGui = tmp;
        this.dibujarFilas(tmp);
    }
    /**
     *
     * @param chkBase
     * @param orden
     */
    private chkStilo(chkBase,orden){
        let me = this;
        let items  = chkBase.find(".rfTabla.fila.celda");
        items.each(function (index, element) {
            let cElement = $(element);

            if(orden== true){
                cElement.attr("data-gb", cElement.css( "background-color"));
                cElement.css( "background-color",me.colorSeleccion);
                cElement.css( "color","black");
            }
            else{
                cElement.removeAttr( "data-gb");
                cElement.css('background-color','');
                cElement.css('color','');
            }

        });


    }
    /**
     *
     */
    private initOrden(){
        let leeOrden = window.localStorage.getItem("rfTaleOrden");
    }
    /**
     * Realiza algunas tareas para inicialiar las variables locales con las preferencias del usuario:
     * @param idElemento
     */
    private  initEntorno(idElemento){

        let rfVaiable =  rfFrameWork.cRead(`${idElemento}_Orden`);

        if(rfVaiable == null){
            let ordenOrganico = [];
            for(let x in this.datos.columnas ){
                ordenOrganico.push(`${x}|${this.datos.columnas[x]["nombre"]}`);
            }
            this.ordenColumnas = ordenOrganico;
            rfFrameWork.cWrite(`${idElemento}_Orden`,JSON.stringify(ordenOrganico));
        }
        else{
            this.ordenColumnas = rfFrameWork.cRead(`${idElemento}_Orden`,true);

        }

    }
    /**
     *
     * @param clase
     * @param datos
     * @param cssExtra
     */
    private nuevaFila(clase = "fila", datos?,cssExtra?){
        let fila = $(`<div id="${rfFrameWork.generarId()}" class="rfTabla ${clase}"></div>`);
        if(typeof cssExtra == "object")
            fila.css(cssExtra);

        if(typeof datos == "object"){
            fila.data(datos);
        }
        return fila;
    }
    /**
     * Crea una nueva celda para ser adjuntada a una filas con todos los métoos necesarios para
     * el nuevo comportamiento.
     * @param datos
     * @param clase
     * @param style
     * @param pegajoso
     * @param mascara
     * @param datosAdjuntos
     */
    private nuevaCelda(datos:any="",clase="rfFila rfCelda",style?,pegajoso:boolean=false, mascara= null ,datosAdjuntos=null,htmlAttr?){

        let cloname = this;

        if(typeof mascara == "function"){
            datos = mascara(datos);
        }

        let pstyle = "pegajoso1";

        if( datos == `<div class="chk"><input type="checkbox"></div>`)
            pstyle = "pegajoso";
        let idCelda = rfFrameWork.generarId();
        let celda = $(`<div id="${idCelda}" class="rfTabla ${clase} ${pegajoso?pstyle:''}" ${htmlAttr} >${datos}</div>`);
        // Comprobamos si existen datos por adjuntar al objeto:
        if(datosAdjuntos !== null)
            celda.data(datosAdjuntos);


        celda.on( 'click', function( event ) {
            if ( event.ctrlKey ) {
                let cMe = $(this);
                cloname.ctrlClick(cMe.data());
            } else {
                if(celda.select()){
                    document.execCommand("copy");
                }
            }
        } );

        // Pasamos las variables de CSS para esta celda
        if(typeof style == "object")
            celda.css(style);

        return celda;
    }
    /**
     * REALIZA UNA BUSQUEDA DE INFORMACIÓN DENTRO DE TODO EL DATASET (DATOS.DATOS)
     * @param valor
     */
    private buscar(valor){
        // Convertimos a string el valor:
        valor = valor.toString();
        // Creamos una copia de filasGui;
        this.tmpBusqueda = this.filasGui;
        let tmpFilas = [];
        // Recorremos cada fila
        for(let x in this.datos.datos){
            let tmpFila:any = this.datos.datos[x];
            // Iniciamos la búsqueda en la celda:

            let cVal = String(tmpFila.toString());
            let reg = new RegExp( valor,"gi" );

            if(reg.test(cVal))
                tmpFilas.push(tmpFila);

        }
        // Avisamos a la tabla cuantos resultado obtuvimos de la búsqueda:
        let spanRes = $(`<div name="resulv">Resultados: ${Object.keys(tmpFilas).length}</div>`);
        this.html.find(".vbuscar").append(spanRes);
        // Pasamos el evento de las filas:
        this.dibujarFilas(tmpFilas,true);

    }
    /**
     * GENERA LOS EVENTO NECESARIOS PARA EL FORMULARIO DE BUSQUEDA:
     * @param html
     */
    private eventoBuqueda(html:JQuery){
        let me = this;

        // Pasamos el evento de busqueda:
        html.submit(function (e) {
            e.preventDefault();
            let form = $(this);

            let parent = form.parent();
            let valor = form.find("input");
            // Buscamos el btt
            let bttReset = parent.find("button");
            bttReset.css({visibility:"visible"});
            let obj = bttReset.find("object");
            let dd = obj.contents().find("svg");

            bttReset.on({
                click:function (e) {

                    me.html.find("div[name=resulv]").remove();
                    form.remove();
                    me.dibujarFilas(me.tmpBusqueda,true);
                    parent.append(me.newForBusqueda());

                }
            });
            dd.focus();
            me.buscar(valor.val());
            valor.attr("disabled","disabled");
            if(form.off()){
                form.submit(function (dat) {
                    dat.preventDefault();
                })
            }
        });
    }
    /**
     * GENERA UN NUEVO FORMULARIO DE BUSQUEDA
     * @param initEventos
     */
    private newForBusqueda(initEventos=true){
        let newForm = $(`<form name="vbus">
        <input type="text" class="rfTabla buscar" placeholder="Escriba aquí para buscar">
        <button type="button"><div style="width: 20px; height: 25px;" class="redo"></div></button>
        </form>`);
        let svg:any =  rfFrameWork.loadSvg("error");
        newForm.find("button .redo").append(svg);

        if(initEventos== true)
            this.eventoBuqueda(newForm);

        return newForm;
    }
    /**
     * Retorna los elementos seleccionados
     * @param control
     */
    public getChkItem(control = true){

        let tmpChk = [];
        let chkItem = this.html.find(`.chk input[type=checkbox]${control==true?':checked':''}`);

        $(chkItem).each(function (index, element) {
            let cFila = $(element).parent().parent().parent();
            if(cFila.hasClass('filaLineal'))
                tmpChk.push(control==true?cFila.data():element)
        });
        // ------
        return tmpChk;
    }
    /**
     * Comportamientos de los chk
     */
    private controlChk(){
        let chkItem = this.getChkItem(false);
        $(chkItem).each(function (index, element) {
            let c = $(element);
            c.trigger("click");
        })
    }
    /**
     * Metodo para ordenar las columnas
     * @param idColumna
     * @param modo
     */
    public ordenar(idColumna,modo){
        // Reiniciamos los estilos:
        $(this.html).find(".columna").attr("data-orden","X");
        let tmpInd:any = {};
        let tmpObj:any = {};
        let tmpObjNumerico = [];
        let tipoVal = this.datos.columnas[idColumna]["tipo"];
        // Ordenamos los datos (generales)
        for(let x in this.datos.datos){
            let cDato = this.datos.datos[x];
            let valor = String(cDato[idColumna]);

            if(tipoVal=="numero"){
                let nInd = parseFloat(valor);
                // Si el typeod dentro de tmpObjetoNumerico es undefined
                // procedemos a insertarlo en el objeto por que este indice está libre:
                if(typeof tmpObjNumerico[nInd] == "undefined"){
                    tmpObjNumerico[nInd] = cDato;
                }
                /**
                 * De lo contrario recorremos el objeto en busca de una posición valida
                 * según su valor del numero, a este se le incrementa su valor para ordenarlo
                 * adecuadamente
                 */
                else
                {
                    let xInd=nInd+1;
                    let control = 0;
                    for (;;){
                        if(typeof tmpObjNumerico[xInd] == "undefined")
                        {
                            tmpObjNumerico[xInd] = cDato;
                            break;
                        }
                        else
                        {
                            xInd++;
                            if(control> this.datos.datos.length)
                            {
                                alert("Error de filtrado de datos");
                                break;
                            }
                        }
                        control++;
                    }
                }

            }else{
                if(!tmpInd.hasOwnProperty(valor)){
                    tmpInd[valor] = 0
                }
                else
                {
                    tmpInd[valor]++;
                }
                let nvoInd = `${valor}.${tmpInd[valor]}`;

                tmpObj[nvoInd] = cDato;
            }

        }

        let objOrdenado:any = [];

        if(tipoVal=="numero"){
            for(let cInd in tmpObjNumerico){
                objOrdenado.push(tmpObjNumerico[cInd]);
            }
        }
        else
        {
            let keys = Object.keys(tmpObj).sort();
            for(let oo in keys){
                let cInd = keys[oo];
                let cVal = tmpObj[cInd];
                objOrdenado.push(cVal)
            }
        }


        // Vamos por la posición de paginación actual:
        let pagNo = this.html.find("select[name=paginador] option:selected").val();
        if(modo=='1')
            objOrdenado.reverse();

        this.datos.datos = objOrdenado;
        console.log(objOrdenado);
        this.rangoPaginacion(pagNo,true);
    }
    /**
     *
     * @param datosFilas
     * @param redibujar:bool
     */
    public agregarFila(datosFilas:any,redibujar=false){
        eval(`this.datos.datos.push(datosFilas);`);
        this.dibujarFilas([datosFilas], redibujar);
        this.actulizarNumeroFilas();
        return this;
    }
    /**
     * Metodo que permite actulizar el contenido (filas) y redibujarlo:
     * @param datos
     * @param callBack
     */
    public recargarContenido(datos,callBack?:any){
        this.datos.datos = datos;
        // Actualizamos la paginación:
        this.generaPaginador();
        // Iniciamos con la generación de filas según congfiguración:
        this.paginacion!==null?
            this.rangoPaginacion(1,true):
            this.dibujarFilas(this.datos.datos,true);
        if(typeof callBack === "function")
            callBack(this);
    }
    /**
     * Método estatico para crear una nueva tabla como función
     * extendida de JQuery
     * @param datos
     * @param base
     */
    static nueva(datos,base){
        return new rfCtable(datos,base);
    }
    /**
     * EXPORTAR LOS DATOS DE LA TABLA A FORMATO JSON:
     */
    public exportar(){
        return this.datos.datos;
    }

}

interface agregarAccion {
    etiqueta:string;
    evento:any;
}
interface rfControlData {
    titulo:string;
    acciones:agregarAccion;
    datosTabla:datosRfGrid;
    preferencias:any;
}

interface opcionesRfControlGui {
    nombre:string;
    tipo:string;
    valores:any;
    predeterminado:[];
    valoresSeleccionados:any;
}
interface iTiposElementosGui{
    select?:string;
    text?:string;
    checbox?:string

}

interface iValoresElementoGui{
    indice:string,
    valor:string
}

interface iElementosGui{
    nombre: string;
    tipo:iTiposElementosGui;
    valores:iValoresElementoGui;
    predeterminado?:[iValoresElementoGui];
    obligatorio?:'si'|any;
    valoresSeleccionados:any;
}

/**
 * Interface para la implementación de rfcontrolGui
 */
interface rfControlGuiAccion{
    etiqueta:string;
    evento:any;
    icono?:string;
}

/**
 * Clase para la interace gráfica de los elementos dentro de un
 * flujo de trabajo
 */
abstract class rfControlGui {
    /** Nombre del objeto **/
    protected nombreObj:string;
    /** Objeto HTML de To_do el Dataset **/
    protected html: JQuery;
    protected parentNode: JQuery;
    protected tabla: rfCtable;
    protected acciones = [];
    protected preferenciasObj: any;
    protected abstract rfAjaxUrl;
    protected abstract rfAjaxData;
    protected abstract datosComplemento?;


    /**
     * Método estatico para ejecutar el objeto, este va por los datos necesarios segùn nuestro
     * estandar de informaciòn.
     * @param base
     * @param xhrComplemento:any Complemento JSON que se pasa como argumento en la solicitud XHR.
     * @param callBack:any Función que es invocada tras ejecutar el evento XHR, éste métod es opcional.
     */
    public launcher(base: JQuery, xhrComplemento: any = null, callBack = null) {
        let me: rfControlGui = this;

        rfControlGui.xhrEvent("Espere por favor, cargando datos para ",
            me,
            function (xhrResponse, msn: rfCVentana) {
                try {
                    /**
                     *  Revisamos si dentro de las preferencias del objeto existen
                     *  complementos para los campos.
                     */
                    let complemento = me.datosComplemento;
                    if(typeof complemento == "object" ){
                        for(let x in complemento){
                            let cComp = complemento[x];
                            me.tratarColumnaXhr(xhrResponse,x,cComp[0], cComp[1]);
                            console.log(cComp);
                        }

                    }

                    let tabla = {
                        titulo: "",
                        idTabla: me.nombreObj,
                        columnas: xhrResponse["columnas"],
                        datos: xhrResponse["contenido"],
                        idElemento: 0,
                        ancho: "100%",
                        alto: "100%",
                        paginacion: 50,
                        colorSeleccion: "#86b1ba",
                        ctrlClick: function (flRow) {
                            me.ctrlFunction(flRow);
                        }
                    };
                    me.construir(tabla, base, callBack);
                    msn.cerrar();
                } catch (e) {
                    alert(e);
                }
            },
            xhrComplemento
        );
        return me;
    }
    /**
     * Método para modificar las opciones de las colunas
     * @param xhrData
     * @param nombreColumna
     * @param atributo
     * @param valor
     */
    private tratarColumnaXhr(xhrData,nombreColumna,atributo,valor){

            for(let x in xhrData){
                let cData = xhrData[x];
                if(typeof cData[nombreColumna] == "object"){
                    if(cData["nombre"] == nombreColumna)
                        cData[atributo] = valor;
                }
            }

    }

    protected asignarPropiedadesColumna(){}

    private construir(datosTabla, base: JQuery, callback = null) {
        let me = this;
        // Cargamos las acciones:
        this.cargarAcciones();

        // Build the object with ventana and rfObciones:
        this.html = $(`
                <div class="rfControl">

                        <div class="baseAcciones">
                            <div class="accionesControl">
                            </div>
                            <div class="tituloControl">
                               <div>${this.nombreObj}</div>
                               <div style="width: 20px; height: 20px; cursor: pointer;" title="Preferencias de la vista" class="engrane"></div>
                               <div style="width: 20px; height: 20px; cursor: pointer;" title="Recargar contenido"  class="refresh"></div>
                               <div></div>
                            </div>
                        </div>
                        <div class="baseTabla">

                        </div>
                    </div>
        `);

        // Vamos por el icono de recarga:
        let refresh: any = rfFrameWork.loadSvg("refresh");
        this.html.find(".tituloControl .refresh").append(refresh);
        refresh.on({
            click: function (e) {
                me.recargar();
            }
        });
        // Preparamos  el objeto para mostrar el cuadro de preferencias:
        /*this.preferenciasObj = new opcionesGui();
        this.preferenciasObj.prepara(this);*/
        let engrane: any = rfFrameWork.loadSvg("engrane");
        engrane.on({
            click: function () {
                me.mostrarPreferencias();
            }
        });
        this.html.find(".tituloControl .engrane").append(engrane);

        if (base.length <= 0)
            throw "No ha proporcionado una base válida";
        this.parentNode = base;

        // vamos por la acciones:
        for (let a in this.acciones) {
            let cAccion = this.acciones[a];
            this.agregarAccion(cAccion);
        }
        // Armamos la tabla:
        this.tabla = $(this.html.find(".baseTabla"))['rfTabla'](datosTabla);


        this.parentNode.append(this.html);

        if (typeof callback == "function")
            callback(me);
    }

    /**
     * Agrega un boton al GUI y adjunta su acción, además pasa por argumento
     * al esta clase.
     * @param accion
     */
    private agregarAccion(accion: agregarAccion) {
        let me = this;
        let htmlAccion = $(`<button>${accion.etiqueta}</button>`);
        htmlAccion.on({
            click: function (e) {
                e.preventDefault();
                accion.evento(me);
            }
        });

        this.html.find(".accionesControl").append(htmlAccion);

    }

    /**
     * Devuelve los elementos chk seleccionados del sub-objeto
     * rfCtable
     */
    public getChkItem() {
        return this.tabla.getChkItem();
    }

    /**
     * Invoca el orden de una columna y reordena las filas según resultado:
     * @param idCol
     * @param modoOrden
     */
    public ordenar(idCol, modoOrden) {
        this.tabla.ordenar(idCol, modoOrden);
    }

    /**
     * Devueve el objeto html desde afuera para que otros objetos
     * los puedan usar
     */
    public getBaseHtml() {
        return this.html;
    }

    /**
     * Define una accion dentro del entorno gráfico (como un botón):
     * @param etiqueta
     * @param evento
     * @param icono
     */
    protected definirAcciones(etiqueta, evento, icono): rfControlGuiAccion {
        let tmpAccion: rfControlGuiAccion = {
            etiqueta: etiqueta,
            evento: evento,
            icono: icono
        };
        this.acciones.push(tmpAccion);
        return tmpAccion;
    }

    /**
     * Funcion que es ejecutada cuando el usuario realizar crtl + click dentro de la tabla,
     * este metodo debe ser sobreescrito para una correcta ejecución. Nota: esté objeto se definicio
     * vacio para no probocar un error dentro del launcher...
     * @param args
     */
    protected ctrlFunction(args: any): void {
    }

    /**
     * Meotodo que es invocado para cargar las acciones definidas en las clases heredadas
     * de este objeto. dentro de la cual se ejecuta por cada accion el metodo definirAcciones();
     */
    protected abstract cargarAcciones();

    /**
     * Método para recargar los datos del objeto:
     * Nota: usa la configuraciòn de rfOpciones.exportar()
     */
    public recargar(callBack?) {
        let me = this;
        rfControlGui.xhrEvent(
            "Espere actualizando información de ",
            this,
            function (xhrResponse, msn: rfCVentana) {
                // console.log(xhrResponse);
                me.tabla.recargarContenido(xhrResponse["contenido"]);
                msn.cerrar();
            }, null
        )
    }

    /**
     * Exporta en un nuevo objeto las propiedades de rfAjax del objeto eredado:
     */
    public exportarRfAjaxPropiedades(): any {
        let tmp = rfFrameWork.clonarObjeto(this.rfAjaxData);
        return {rfAjaxData: tmp, rfAjaxUrl: this.rfAjaxUrl};
    }

    /**
     * Metodo para iniciar el comportamiento XHR tanto del launcher como de recargar datos
     * @param mensje
     * @param me
     * @param susscessEnt
     */
    private static xhrEvent(mensje, me: rfControlGui, susscessEnt, xhrComplemento?) {

        let prefs = me.exportar();
        let xhrData = rfFrameWork.clonarObjeto(me.rfAjaxData, {complemento: prefs});
        console.log(prefs);
        // Si xhrComplemento es un objeto pasamos las opciones:
        if (typeof xhrComplemento === "object")
            xhrData = rfFrameWork.clonarObjeto(xhrData, xhrComplemento);

        let msn = rfCVentana.dialogo(`${mensje} ${me.nombreObj}`, {
            tipo: 1,
            base: $("body"),
            maximizar: false,
            minimizar: false
        });
        window.setTimeout(function (obj) {
            $.ajax({
                async: false,
                url: me.rfAjaxUrl,
                data: xhrData,
                dataType: "json",
                success: function (xhrResponse) {

                    susscessEnt(xhrResponse, msn);
                }
            });
        }, 200);
    }

    /**
     * Agrega datos a la tabla para ser representados;
     * @param datos
     */
    public agregarDatos(datos) {
        this.tabla.agregarFila(datos);
    }

    /**
     * Método para mostrar el cuadro de preferncias y su evento submit
     */
    abstract mostrarPreferencias();
    protected abstract exportar();

}
// Ejemplo Datos:

$.fn.extend(
    {
        rfTabla:function (datos) {
            return rfCtable.nueva(datos,this);
        },
        rfError: function (e,opciones?) {

            let evnt =(
                typeof opciones == "object" &&
                typeof opciones["eventoCerrar"] == "function"
            ) ?
                opciones["eventoCerrar"]:
                null;

            return  rfCVentana.dialogo(
                e,
                {
                    tipo:2,
                    base:this,
                    maximizar:false,
                    minimizar:false,
                    eventoCerrar: evnt
                });
        },
        rfAdvertencia: function (e, opciones?) {

            let evnt =(
                typeof opciones == "object" &&
                typeof opciones["eventoCerrar"] == "function"
            ) ?
                opciones["eventoCerrar"]:
                null;

            return  rfCVentana.dialogo(e,{tipo:1,base:this,maximizar:false, minimizar:false,  eventoCerrar: evnt});
        },
        rfTomaDecision: function (e,elementosDesiciones) {

            if(typeof elementosDesiciones !== "object")
                throw "El argumento elementosDesiciones debe ser un objeto";

            if(elementosDesiciones.length <= 0)
                throw "Debe proporcionar almenos un elemento para toma de desición";


            return  rfCVentana.dialogo(
                e,
                {
                    tipo:3,
                    base:this,
                    maximizar:false,
                    minimizar:false,
                    opcional1:elementosDesiciones
                }
            );
        },

        rfVentana:function (titulo, opciones) {
            let evnt =(
                typeof opciones == "object" &&
                typeof opciones["eventoCerrar"] == "function"
            ) ?
                opciones["eventoCerrar"]:
                null;




        }
    }
);

// Metodos para buscar elementos de grid dentro del doom:
window.setTimeout(function (e) {

    $(".rfControl .baseAcciones .accionesControl button, .rfaccion").each(function (index, element) {
        let btt = $(this);
        let arg = JSON.parse(btt.attr("data-rf"));
        let target = btt.attr("data-rf-target");
        btt.data(arg);
        // btt.removeAttr("data-rf");

        $(this).on(
            {"click":function (element) {

                let innerOpt = $(this).data();

                let alto = typeof innerOpt['opciones']['alto'] == "string"?
                        innerOpt['opciones']['ancho'] : '450px';

                let ancho = typeof innerOpt['opciones']['ancho'] == "string"?
                        innerOpt['opciones']['alto'] : '610px';

                let url = arg['urlAccion'];

                let gotoOpt = innerOpt['opciones']['goto'];

                if(typeof gotoOpt != 'undefined')
                    url = url + '?goto='+ gotoOpt[0];

                switch (target) {

                    case 'self':
                        window.location.href = url;
                        break;
                    // rfVentana
                    default:
                        let obj = $(`<object type="text/html" style='width: 100%; height: 100%;' data='${url}'>`);
                        rfCVentana.ventana(
                            `<img src="${arg['icono']}"> <div style="margin: 2px;">${arg["nombreBoton"]}</div>`,
                            obj,
                            {ancho:ancho,alto:alto,base:$("body")},
                            function (ventana:rfCVentana) {
                                let html = ventana.htmlObj();
                                obj.attr("data-rfcVentana",ventana.id());
                            }
                        );

                        break;
                }

                }
            }
        )
    })
},100);
