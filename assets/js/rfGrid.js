class rfFrameWork {
    static generarId() {
        let rand1 = Math.random();
        let rand2 = Math.random();
        return "rf_" + ((rand1 * rand2) * 100 + Math.random());
    }
    static cWrite(nombre, valor, toJSON = false) {
        return window.localStorage.setItem(nombre, toJSON === true ? JSON.stringify(valor) : valor);
    }
    static cRead(nombre, aJson = false) {
        let cVal = window.localStorage.getItem(nombre);
        if (typeof cVal == "undefined")
            return false;
        return !aJson ? window.localStorage.getItem(nombre) : JSON.parse(cVal);
    }
    static loadSvg(nombreImagen) {
        let svg = null;
        $.ajax({
            url: `${rfFrameWork.urlImagenes}/${nombreImagen}.svg`,
            async: false,
            success: function (e) {
                svg = $(e);
            }
        });
        return svg.contents();
    }
    static clonarObjeto(objeto, Agregar) {
        let tmpObj = {};
        for (let x in objeto) {
            tmpObj[x] = objeto[x];
        }
        if (typeof Agregar == "object") {
            for (let a in Agregar) {
                tmpObj[a] = Agregar[a];
            }
        }
        return tmpObj;
    }
    static detectaFrame() {
        return window.location !== window.parent.location;
    }
}
rfFrameWork.urlImagenes = "../../../img";
class rfBoot {
    constructor() {
        this.tipos = {
            css: {
                etiqueta: "link",
                extension: "css",
                atributos: {
                    type: 'text/css',
                    rel: 'stylesheet',
                    href: null
                }
            },
            js: {
                etiqueta: "script",
                extension: "js",
                atributos: {
                    type: 'text/javascript',
                    src: null
                }
            }
        };
    }
    importar(nombre, type, ruta) {
        try {
            let datosTipo = this.tipos[type];
            if (typeof datosTipo != "object")
                throw "El tipo de origen no es válido";
            let fullPath = `${ruta}${nombre}.${type}`;
            type == "js" ?
                datosTipo.atributos["src"] = fullPath :
                datosTipo.atributos["href"] = fullPath;
            $(`<${datosTipo.etiqueta}>`)
                .appendTo('head')
                .attr(datosTipo.atributos);
        }
        catch (e) {
            alert(e);
        }
    }
    static boot() {
        let me = new rfBoot();
        try {
            if (typeof rfBoot.modulosPorDefecto !== "object" || Object.keys(rfBoot.modulosPorDefecto).length <= 0)
                throw "No existen modulos por defecto, o bien el tipo de objeto no es valido";
            for (let x in rfBoot.modulosPorDefecto) {
                let cItem = rfBoot.modulosPorDefecto[x];
                me.importar(cItem.nombreModulo, "js", cItem.ruta);
                if (typeof cItem.css !== "undefined") {
                    me.importar(cItem.css, "css", cItem.ruta);
                }
            }
        }
        catch (e) {
            alert(e);
        }
    }
    static cargarModulo(optModulo) {
        let me = new rfBoot();
    }
}
class rfVelo {
    constructor(ventana) {
        console.log('Velo');
        this.html = $(`<div class='rfVelo'></div>`);
        ventana.htmlObj().before(this.html);
    }
    destruir() {
        this.html.remove();
    }
}
class rfCVentana {
    constructor(titulo = "Sin nombre", contenido, opciones, procesador = null) {
        this.titulo = "N/A";
        this.estado = 0;
        this.opciones = { ancho: 400, alto: 250, eventoCerrar: null, tipo: null, maximizar: true, minimizar: true };
        this.idElemento = null;
        this.base = null;
        this.velo = null;
        this.idElemento = rfFrameWork.generarId();
        let me = this;
        this.opciones.ancho = opciones.ancho;
        this.opciones.alto = opciones.alto;
        if (typeof opciones.eventoCerrar == "function")
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
        this.html.data({ rfCVentana: this });
        this.html.find(".cerrar").on("click", function (e) {
            e.preventDefault();
            me.cerrar();
        });
        {
            if (typeof opciones.maximizar == "boolean")
                this.opciones.maximizar = opciones.maximizar;
            !this.opciones.maximizar ? this.html.find(".maximiza").remove() : null;
            if (typeof opciones.minimizar == "boolean")
                this.opciones.minimizar = opciones.minimizar;
            !this.opciones.minimizar ? this.html.find(".minimiza").remove() : null;
        }
        this.html.find(".rfGrid.rfVentana.contenido").append(contenido);
        opciones.base.append(this.html);
        this.velo = new rfVelo(this);
        this.estado = 1;
        this.base = opciones.base;
        rfCVentana.OMGW[this.idElemento] = this;
        if (typeof procesador == "function")
            window.setTimeout(function () {
                procesador(me);
            }, 100);
    }
    control() {
        if (this.estado == 0)
            throw "La ventana no se ha iniciado";
        return this;
    }
    cerrar(eventoFinal) {
        let me = this;
        let eventoCierre = (typeof eventoFinal == "function") ?
            eventoFinal :
            this.opciones.eventoCerrar;
        this.html.fadeOut("fast", function () {
            me.velo.destruir();
            me.html.remove();
            if (typeof eventoCierre == "function") {
                try {
                    eventoCierre(me);
                }
                catch (e) {
                    alert(e);
                }
            }
        });
    }
    parentNode() {
        return this.base;
    }
    actualizarBaraInfo(data) {
        this.control();
        let baseInfo = this.html.find(".infobar");
        !baseInfo.is(":visible") ?
            baseInfo.show() : null;
        baseInfo.html(data);
        return this;
    }
    actualizarContenido(html, callBack) {
        this.html.find(".contenido").html(html);
        if (typeof callBack === "function")
            callBack(this);
    }
    htmlObj() {
        return this.html;
    }
    id() { return this.idElemento; }
    static dialogo(mensaje, opciones) {
        if (typeof opciones.tipo == "undefined" || opciones.tipo <= 0 || opciones.tipo > 3)
            throw "Debe proporcionar un tipo válido";
        opciones.maximizar = false;
        opciones.minimizar = false;
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
        let strAdvertencia = $(`
                    <div class="rfGrid rfVentana contenido advertencia">
                        <div class="rfGrid rfVentana contenido advertencia txt">
                            <div class="rfGrid rfVentana contenido advertencia txt str">${mensaje}</div>
                            <div class="rfGrid rfVentana contenido advertencia txt opts"></div>
                        </div>
                        <div class="rfGrid rfVentana contenido advertencia img1">
                        <div class="imgRf"></div>
                    </div>`);
        let imgSvg = rfFrameWork.loadSvg(img);
        strAdvertencia.find(".imgRf").append(imgSvg);
        let me = null;
        if (opciones.tipo == 3) {
            for (let dd in opciones.opcional1) {
                let cElement = opciones.opcional1[dd];
                if (typeof cElement['gui'] == "undefined") {
                    let cTmp = $(`<button name="${dd}" class="opt" >${dd}</button>`);
                    cTmp.bind('click', function () {
                        me.cerrar(cElement['evento']);
                    });
                    strAdvertencia.find(".opts").append(cTmp);
                }
                else {
                    let cTmp = cElement["gui"];
                    strAdvertencia.find(".opts").append(cTmp);
                }
            }
        }
        let opcionesDefault = { alto: 200, ancho: 400 };
        if (typeof opciones == "object") {
            typeof opciones.alto == "undefined" ? opciones.alto = opcionesDefault.alto : null;
            typeof opciones.ancho == "undefined" ? opciones.ancho = opcionesDefault.ancho : null;
        }
        else {
            opciones = opcionesDefault;
        }
        return me = new rfCVentana(cTitulo, strAdvertencia, opciones);
    }
    static ventana(titulo, contenido, opciones, proceador = null) {
        return new rfCVentana(titulo, contenido, opciones, proceador);
    }
    static controlZindex() {
    }
}
rfCVentana.zIndexDB = [];
rfCVentana.OMGW = {};
class rfCtable {
    constructor(param1, base) {
        this.colorSeleccion = "red";
        this.ordenColumnas = null;
        this.anchoInterno = 35;
        this.ctrlClick = null;
        this.paginacion = null;
        this.datos = param1;
        let me = this;
        if (typeof param1.datos !== "object")
            throw "El parámetro datos debe ser un objeto";
        if (typeof param1.columnas !== "object" || Object.keys(param1.columnas).length <= 0)
            throw "No se ha procionado un objeto válido para las columnas o éste está vacio";
        if (typeof param1.idTabla == "undefined")
            throw "Debe proporcionar un identificador para la tabla [idTabla]";
        if (typeof param1.ctrlClick == "function")
            this.ctrlClick = param1.ctrlClick;
        if (typeof param1.paginacion == "number")
            this.paginacion = param1.paginacion;
        if (typeof param1.colorSeleccion == "string")
            this.colorSeleccion = param1.colorSeleccion;
        this.initEntorno(param1.idTabla);
        this.parentNonde = base;
        let titulo = typeof this.datos.titulo == "undefined" ?
            "" :
            `<div class="rfTabla titulo" >${this.datos.titulo}</div>`;
        let tmpPaginador = $(`<div class="rfTabla paginador">
        <div class="rfTabla paginador vbuscar"></div>
        <div class="rfTabla paginador vpag"><select name="paginador"></select>  </div>
</div>`);
        let formBuscar = this.newForBusqueda(false);
        tmpPaginador.find(".vbuscar").append(formBuscar);
        this.html = $(`<div id="${rfFrameWork.generarId()}" class="rfTabla" style="width: ${this.datos.ancho}; height: ${this.datos.alto};">
                   </div>`);
        titulo += tmpPaginador.prop("outerHTML");
        if (typeof this.datos.titulo !== "undefined")
            this.html.append(titulo);
        let filaEncabezado = this.nuevaFila('encabezado');
        let chkOpt = this.nuevaCelda(`<div class="chk"><input type="checkbox"></div>`, "columna", { width: 35 }, true);
        chkOpt.on({
            click: function (w) {
                me.controlChk();
            }
        });
        filaEncabezado.append(chkOpt);
        for (let cname in this.ordenColumnas) {
            let cItem = this.ordenColumnas[cname].split("|");
            let ancho = this.datos.columnas[cItem[0]]["ancho"];
            let pegajoso = this.datos.columnas[cItem[0]]["pegajoso"];
            this.anchoInterno += parseInt(ancho);
            let cCelda = this.nuevaCelda(cItem[1], "columna", { width: ancho }, pegajoso, null, null, `data-orden='X'`);
            cCelda.on({
                click: function (e) {
                    let modoOrden = $(this).attr("data-orden");
                    me.ordenar(cname, modoOrden);
                    $(this).attr("data-orden", modoOrden == '0' ? '1' : '0');
                }
            });
            filaEncabezado.append(cCelda);
        }
        filaEncabezado.css({ width: this.anchoInterno });
        this.html.append(filaEncabezado);
        this.generaPaginador();
        let formBus = this.html.find("form[name=vbus]");
        this.eventoBuqueda(formBus);
        base.append(this.html);
        this.paginacion !== null ?
            this.rangoPaginacion(1, true) :
            this.dibujarFilas(this.datos.datos);
    }
    generaPaginador() {
        let vPagClass = this.html.find(".vpag");
        let me = this;
        let select = vPagClass.find("select");
        if (this.paginacion != null) {
            let nElementos = Object.keys(this.datos.datos).length;
            let nPag = Math.ceil(nElementos / this.paginacion);
            select.empty();
            for (let x1 = 1; x1 <= nPag; x1++) {
                select.append(`<option value="${x1}">${x1}</option>`);
            }
        }
        select.on({
            change: function () {
                let cPos = $(this).find("option:checked").val();
                me.rangoPaginacion(cPos);
            }
        });
        this.actulizarNumeroFilas();
    }
    actulizarNumeroFilas() {
        let vPagClass = this.html.find(".vpag");
        vPagClass.find("span").remove();
        vPagClass.append(`<span>Filas: ${Object.keys(this.datos.datos).length}</span>`);
    }
    dibujarFilas(tmp, limpiarGui = false) {
        if (limpiarGui == true)
            this.html.find(".filaLineal").remove();
        let me = this;
        for (let cItem in tmp) {
            let cDato = tmp[cItem];
            if (typeof cDato == "undefined")
                break;
            let cFila = this.nuevaFila("fila filaLineal", cDato, { width: this.anchoInterno });
            let chkOpt = this.nuevaCelda(`<div class="chk"><input type="checkbox"></div>`, "columna", { width: 25 }, true);
            let getChkItem = chkOpt.find(".chk input");
            getChkItem.on("click", function (e) {
                let cVal = $(e.currentTarget).is(":checked");
                me.chkStilo(cFila, cVal);
            });
            cFila.append(chkOpt);
            for (let eo in this.ordenColumnas) {
                let cOrden = this.ordenColumnas[eo].split("|");
                let cValCelda = cDato[eo];
                let pegajoso = this.datos.columnas[eo]["pegajoso"];
                let ancho_ = this.datos.columnas[eo]["ancho"];
                if (typeof this.datos.columnas[eo]["mascara"] == "function") {
                    cValCelda = this.datos.columnas[eo]["mascara"](cValCelda);
                }
                let tmpCelda = this.nuevaCelda(cValCelda, "fila celda", { width: ancho_ }, pegajoso, null, cDato);
                cFila.append(tmpCelda);
            }
            this.html.append(cFila);
        }
    }
    rangoPaginacion(pos, reiniciar = true, callBack = null) {
        this.html.find(".filaLineal").remove();
        let newPos = (pos * this.paginacion) - this.paginacion;
        let cursor = 1;
        let tmp = [];
        for (let cPos = newPos; cursor <= this.paginacion; cPos++) {
            tmp.push(this.datos.datos[cPos]);
            cursor++;
        }
        this.filasGui = tmp;
        this.dibujarFilas(tmp);
    }
    chkStilo(chkBase, orden) {
        let me = this;
        let items = chkBase.find(".rfTabla.fila.celda");
        items.each(function (index, element) {
            let cElement = $(element);
            if (orden == true) {
                cElement.attr("data-gb", cElement.css("background-color"));
                cElement.css("background-color", me.colorSeleccion);
                cElement.css("color", "black");
            }
            else {
                cElement.removeAttr("data-gb");
                cElement.css('background-color', '');
                cElement.css('color', '');
            }
        });
    }
    initOrden() {
        let leeOrden = window.localStorage.getItem("rfTaleOrden");
    }
    initEntorno(idElemento) {
        let rfVaiable = rfFrameWork.cRead(`${idElemento}_Orden`);
        if (rfVaiable == null) {
            let ordenOrganico = [];
            for (let x in this.datos.columnas) {
                ordenOrganico.push(`${x}|${this.datos.columnas[x]["nombre"]}`);
            }
            this.ordenColumnas = ordenOrganico;
            rfFrameWork.cWrite(`${idElemento}_Orden`, JSON.stringify(ordenOrganico));
        }
        else {
            this.ordenColumnas = rfFrameWork.cRead(`${idElemento}_Orden`, true);
        }
    }
    nuevaFila(clase = "fila", datos, cssExtra) {
        let fila = $(`<div id="${rfFrameWork.generarId()}" class="rfTabla ${clase}"></div>`);
        if (typeof cssExtra == "object")
            fila.css(cssExtra);
        if (typeof datos == "object") {
            fila.data(datos);
        }
        return fila;
    }
    nuevaCelda(datos = "", clase = "rfFila rfCelda", style, pegajoso = false, mascara = null, datosAdjuntos = null, htmlAttr) {
        let cloname = this;
        if (typeof mascara == "function") {
            datos = mascara(datos);
        }
        let pstyle = "pegajoso1";
        if (datos == `<div class="chk"><input type="checkbox"></div>`)
            pstyle = "pegajoso";
        let idCelda = rfFrameWork.generarId();
        let celda = $(`<div id="${idCelda}" class="rfTabla ${clase} ${pegajoso ? pstyle : ''}" ${htmlAttr} >${datos}</div>`);
        if (datosAdjuntos !== null)
            celda.data(datosAdjuntos);
        celda.on('click', function (event) {
            if (event.ctrlKey) {
                let cMe = $(this);
                cloname.ctrlClick(cMe.data());
            }
            else {
                if (celda.select()) {
                    document.execCommand("copy");
                }
            }
        });
        if (typeof style == "object")
            celda.css(style);
        return celda;
    }
    buscar(valor) {
        valor = valor.toString();
        this.tmpBusqueda = this.filasGui;
        let tmpFilas = [];
        for (let x in this.datos.datos) {
            let tmpFila = this.datos.datos[x];
            let cVal = String(tmpFila.toString());
            let reg = new RegExp(valor, "gi");
            if (reg.test(cVal))
                tmpFilas.push(tmpFila);
        }
        let spanRes = $(`<div name="resulv">Resultados: ${Object.keys(tmpFilas).length}</div>`);
        this.html.find(".vbuscar").append(spanRes);
        this.dibujarFilas(tmpFilas, true);
    }
    eventoBuqueda(html) {
        let me = this;
        html.submit(function (e) {
            e.preventDefault();
            let form = $(this);
            let parent = form.parent();
            let valor = form.find("input");
            let bttReset = parent.find("button");
            bttReset.css({ visibility: "visible" });
            let obj = bttReset.find("object");
            let dd = obj.contents().find("svg");
            bttReset.on({
                click: function (e) {
                    me.html.find("div[name=resulv]").remove();
                    form.remove();
                    me.dibujarFilas(me.tmpBusqueda, true);
                    parent.append(me.newForBusqueda());
                }
            });
            dd.focus();
            me.buscar(valor.val());
            valor.attr("disabled", "disabled");
            if (form.off()) {
                form.submit(function (dat) {
                    dat.preventDefault();
                });
            }
        });
    }
    newForBusqueda(initEventos = true) {
        let newForm = $(`<form name="vbus">
        <input type="text" class="rfTabla buscar" placeholder="Escriba aquí para buscar">
        <button type="button"><div style="width: 20px; height: 25px;" class="redo"></div></button>
        </form>`);
        let svg = rfFrameWork.loadSvg("error");
        newForm.find("button .redo").append(svg);
        if (initEventos == true)
            this.eventoBuqueda(newForm);
        return newForm;
    }
    getChkItem(control = true) {
        let tmpChk = [];
        let chkItem = this.html.find(`.chk input[type=checkbox]${control == true ? ':checked' : ''}`);
        $(chkItem).each(function (index, element) {
            let cFila = $(element).parent().parent().parent();
            if (cFila.hasClass('filaLineal'))
                tmpChk.push(control == true ? cFila.data() : element);
        });
        return tmpChk;
    }
    controlChk() {
        let chkItem = this.getChkItem(false);
        $(chkItem).each(function (index, element) {
            let c = $(element);
            c.trigger("click");
        });
    }
    ordenar(idColumna, modo) {
        $(this.html).find(".columna").attr("data-orden", "X");
        let tmpInd = {};
        let tmpObj = {};
        let tmpObjNumerico = [];
        let tipoVal = this.datos.columnas[idColumna]["tipo"];
        for (let x in this.datos.datos) {
            let cDato = this.datos.datos[x];
            let valor = String(cDato[idColumna]);
            if (tipoVal == "numero") {
                let nInd = parseFloat(valor);
                if (typeof tmpObjNumerico[nInd] == "undefined") {
                    tmpObjNumerico[nInd] = cDato;
                }
                else {
                    let xInd = nInd + 1;
                    let control = 0;
                    for (;;) {
                        if (typeof tmpObjNumerico[xInd] == "undefined") {
                            tmpObjNumerico[xInd] = cDato;
                            break;
                        }
                        else {
                            xInd++;
                            if (control > this.datos.datos.length) {
                                alert("Error de filtrado de datos");
                                break;
                            }
                        }
                        control++;
                    }
                }
            }
            else {
                if (!tmpInd.hasOwnProperty(valor)) {
                    tmpInd[valor] = 0;
                }
                else {
                    tmpInd[valor]++;
                }
                let nvoInd = `${valor}.${tmpInd[valor]}`;
                tmpObj[nvoInd] = cDato;
            }
        }
        let objOrdenado = [];
        if (tipoVal == "numero") {
            for (let cInd in tmpObjNumerico) {
                objOrdenado.push(tmpObjNumerico[cInd]);
            }
        }
        else {
            let keys = Object.keys(tmpObj).sort();
            for (let oo in keys) {
                let cInd = keys[oo];
                let cVal = tmpObj[cInd];
                objOrdenado.push(cVal);
            }
        }
        let pagNo = this.html.find("select[name=paginador] option:selected").val();
        if (modo == '1')
            objOrdenado.reverse();
        this.datos.datos = objOrdenado;
        console.log(objOrdenado);
        this.rangoPaginacion(pagNo, true);
    }
    agregarFila(datosFilas, redibujar = false) {
        eval(`this.datos.datos.push(datosFilas);`);
        this.dibujarFilas([datosFilas], redibujar);
        this.actulizarNumeroFilas();
        return this;
    }
    recargarContenido(datos, callBack) {
        this.datos.datos = datos;
        this.generaPaginador();
        this.paginacion !== null ?
            this.rangoPaginacion(1, true) :
            this.dibujarFilas(this.datos.datos, true);
        if (typeof callBack === "function")
            callBack(this);
    }
    static nueva(datos, base) {
        return new rfCtable(datos, base);
    }
    exportar() {
        return this.datos.datos;
    }
}
class rfControlGui {
    constructor() {
        this.acciones = [];
    }
    launcher(base, xhrComplemento = null, callBack = null) {
        let me = this;
        rfControlGui.xhrEvent("Espere por favor, cargando datos para ", me, function (xhrResponse, msn) {
            try {
                let complemento = me.datosComplemento;
                if (typeof complemento == "object") {
                    for (let x in complemento) {
                        let cComp = complemento[x];
                        me.tratarColumnaXhr(xhrResponse, x, cComp[0], cComp[1]);
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
            }
            catch (e) {
                alert(e);
            }
        }, xhrComplemento);
        return me;
    }
    tratarColumnaXhr(xhrData, nombreColumna, atributo, valor) {
        for (let x in xhrData) {
            let cData = xhrData[x];
            if (typeof cData[nombreColumna] == "object") {
                if (cData["nombre"] == nombreColumna)
                    cData[atributo] = valor;
            }
        }
    }
    asignarPropiedadesColumna() { }
    construir(datosTabla, base, callback = null) {
        let me = this;
        this.cargarAcciones();
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
        let refresh = rfFrameWork.loadSvg("refresh");
        this.html.find(".tituloControl .refresh").append(refresh);
        refresh.on({
            click: function (e) {
                me.recargar();
            }
        });
        let engrane = rfFrameWork.loadSvg("engrane");
        engrane.on({
            click: function () {
                me.mostrarPreferencias();
            }
        });
        this.html.find(".tituloControl .engrane").append(engrane);
        if (base.length <= 0)
            throw "No ha proporcionado una base válida";
        this.parentNode = base;
        for (let a in this.acciones) {
            let cAccion = this.acciones[a];
            this.agregarAccion(cAccion);
        }
        this.tabla = $(this.html.find(".baseTabla"))['rfTabla'](datosTabla);
        this.parentNode.append(this.html);
        if (typeof callback == "function")
            callback(me);
    }
    agregarAccion(accion) {
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
    getChkItem() {
        return this.tabla.getChkItem();
    }
    ordenar(idCol, modoOrden) {
        this.tabla.ordenar(idCol, modoOrden);
    }
    getBaseHtml() {
        return this.html;
    }
    definirAcciones(etiqueta, evento, icono) {
        let tmpAccion = {
            etiqueta: etiqueta,
            evento: evento,
            icono: icono
        };
        this.acciones.push(tmpAccion);
        return tmpAccion;
    }
    ctrlFunction(args) {
    }
    recargar(callBack) {
        let me = this;
        rfControlGui.xhrEvent("Espere actualizando información de ", this, function (xhrResponse, msn) {
            me.tabla.recargarContenido(xhrResponse["contenido"]);
            msn.cerrar();
        }, null);
    }
    exportarRfAjaxPropiedades() {
        let tmp = rfFrameWork.clonarObjeto(this.rfAjaxData);
        return { rfAjaxData: tmp, rfAjaxUrl: this.rfAjaxUrl };
    }
    static xhrEvent(mensje, me, susscessEnt, xhrComplemento) {
        let prefs = me.exportar();
        let xhrData = rfFrameWork.clonarObjeto(me.rfAjaxData, { complemento: prefs });
        console.log(prefs);
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
    agregarDatos(datos) {
        this.tabla.agregarFila(datos);
    }
}
$.fn.extend({
    rfTabla: function (datos) {
        return rfCtable.nueva(datos, this);
    },
    rfError: function (e, opciones) {
        let evnt = (typeof opciones == "object" &&
            typeof opciones["eventoCerrar"] == "function") ?
            opciones["eventoCerrar"] :
            null;
        return rfCVentana.dialogo(e, {
            tipo: 2,
            base: this,
            maximizar: false,
            minimizar: false,
            eventoCerrar: evnt
        });
    },
    rfAdvertencia: function (e, opciones) {
        let evnt = (typeof opciones == "object" &&
            typeof opciones["eventoCerrar"] == "function") ?
            opciones["eventoCerrar"] :
            null;
        return rfCVentana.dialogo(e, { tipo: 1, base: this, maximizar: false, minimizar: false, eventoCerrar: evnt });
    },
    rfTomaDecision: function (e, elementosDesiciones) {
        if (typeof elementosDesiciones !== "object")
            throw "El argumento elementosDesiciones debe ser un objeto";
        if (elementosDesiciones.length <= 0)
            throw "Debe proporcionar almenos un elemento para toma de desición";
        return rfCVentana.dialogo(e, {
            tipo: 3,
            base: this,
            maximizar: false,
            minimizar: false,
            opcional1: elementosDesiciones
        });
    },
    rfVentana: function (titulo, opciones) {
        let evnt = (typeof opciones == "object" &&
            typeof opciones["eventoCerrar"] == "function") ?
            opciones["eventoCerrar"] :
            null;
    }
});
window.setTimeout(function (e) {
    $(".rfControl .baseAcciones .accionesControl button, .rfaccion").each(function (index, element) {
        let btt = $(this);
        let arg = JSON.parse(btt.attr("data-rf"));
        let target = btt.attr("data-rf-target");
        btt.data(arg);
        $(this).on({ "click": function (element) {
                let innerOpt = $(this).data();
                let alto = typeof innerOpt['opciones']['alto'] == "string" ?
                    innerOpt['opciones']['ancho'] : '450px';
                let ancho = typeof innerOpt['opciones']['ancho'] == "string" ?
                    innerOpt['opciones']['alto'] : '610px';
                let url = arg['urlAccion'];
                let gotoOpt = innerOpt['opciones']['goto'];
                if (typeof gotoOpt != 'undefined')
                    url = url + '?goto=' + gotoOpt[0];
                switch (target) {
                    case 'self':
                        window.location.href = url;
                        break;
                    default:
                        let obj = $(`<object type="text/html" style='width: 100%; height: 100%;' data='${url}'>`);
                        rfCVentana.ventana(`<img src="${arg['icono']}"> <div style="margin: 2px;">${arg["nombreBoton"]}</div>`, obj, { ancho: ancho, alto: alto, base: $("body") }, function (ventana) {
                            let html = ventana.htmlObj();
                            obj.attr("data-rfcVentana", ventana.id());
                        });
                        break;
                }
            }
        });
    });
}, 100);
//# sourceMappingURL=rfGrid.js.map