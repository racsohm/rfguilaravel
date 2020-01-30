/// <reference path="node_modules/@types/jQuery.d.ts">
interface rfFrameWork {
    generarId():string;
    cWrite(cName:string,valor:string):any;
    cRead(cName:string,toJson:boolean):string|JSON;
}
interface rfBootOpciones {
    nombreModulo:string;
    css?:any;
    otros?:any;
    ruta?:string
}
interface datosTipo {
    etiqueta:string;
    atributos:string;
}
interface rfBoot {
    modulosPorDefecto:any;
    boot():void;
    cargarModulo():void;
}
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