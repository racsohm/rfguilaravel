/// <reference path='node_modules/@types/jquery' />
/// <reference path='rfGrid.ts' />

class Demo extends rfControlGui{

    protected rfAjaxUrl = "./loadDemoData.php";
    protected rfAjaxData = {M:6,P:7,A:"chicharron"};

    protected nombreObj = "Demo Chonito";

    protected cargarAcciones() {
        this.definirAcciones(
            "Evento A",
            function (e) {

            },
            null
        )
    }

    protected ctrlFunction(args: any): void {
        super.ctrlFunction(args);
        console.log(args);
    }

    protected exportar() {
        let filtro = this.initExportar();
        return {filtroPago:filtro};
    }

    mostrarPreferencias() {
        let me = this;
        let html = $("<div style='padding: 10px;'><form>" +
            "<div><label>Filtro de pago:&nbsp;</label>" +
            "<select name='filtroPago'>" +
            "<option value='0'>Todos</option>" +
            "<option value='1'>Pagados</option>" +
            "<option value='2'>Sin pago</option>" +
            "</select></div>" +
            "<div><button type='submit'>Enviar</button></div>" +
            "</form></div>");

        // Buscamos si el tipo de valor esta como cookie
        let cvalPago = this.initExportar();

        // Fijamos  el valor del elemento actual seleccionado:
        html.find(`option[value=${cvalPago}]`).attr("selected","selected");
        // Evento submit:
        html.find("form").on({submit:function (e) {
            e.preventDefault();
                me.initSetExportarForm(this);
            }});
        let msn = rfCVentana.ventana('Preferencias vista',html, {
            tipo: 1,
            base: $("body"),
            maximizar: false,
            minimizar: false,
            alto:100,
            width:300
        });
    }

    /**
     * >> Datos para poder recargar
     */
    private initExportar(){
        let cvalPago = rfFrameWork.cRead("filtroPago");
        if(cvalPago==null)
            rfFrameWork.cWrite("filtroPago",1);
        cvalPago = rfFrameWork.cRead("filtroPago");
        return cvalPago;
    }

    /**
     *
     * @param e
     */
    private initSetExportarForm(e){
        let formVal = $(e).find("option:selected").val();
        rfFrameWork.cWrite("filtroPago",formVal);
        window.location.href ="tester.html";
    }

}