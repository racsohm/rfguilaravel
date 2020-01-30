class Demo extends rfControlGui {
    constructor() {
        super(...arguments);
        this.rfAjaxUrl = "./loadDemoData.php";
        this.rfAjaxData = { M: 6, P: 7, A: "chicharron" };
        this.nombreObj = "Demo Chonito";
    }
    cargarAcciones() {
        this.definirAcciones("Evento A", function (e) {
        }, null);
    }
    ctrlFunction(args) {
        super.ctrlFunction(args);
        console.log(args);
    }
    exportar() {
        let filtro = this.initExportar();
        return { filtroPago: filtro };
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
        let cvalPago = this.initExportar();
        html.find(`option[value=${cvalPago}]`).attr("selected", "selected");
        html.find("form").on({ submit: function (e) {
                e.preventDefault();
                me.initSetExportarForm(this);
            } });
        let msn = rfCVentana.ventana('Preferencias vista', html, {
            tipo: 1,
            base: $("body"),
            maximizar: false,
            minimizar: false,
            alto: 100,
            width: 300
        });
    }
    initExportar() {
        let cvalPago = rfFrameWork.cRead("filtroPago");
        if (cvalPago == null)
            rfFrameWork.cWrite("filtroPago", 1);
        cvalPago = rfFrameWork.cRead("filtroPago");
        return cvalPago;
    }
    initSetExportarForm(e) {
        let formVal = $(e).find("option:selected").val();
        rfFrameWork.cWrite("filtroPago", formVal);
        window.location.href = "tester.html";
    }
}
//# sourceMappingURL=demo.js.map