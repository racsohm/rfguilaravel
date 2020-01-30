<?php

$link = new mysqli("localhost","root",'1205',"RF_SOLTEPEC_DATA");
$data = $link->query("SELECT * FROM PREDIO");

$campos=[];
$tmpCampos = $data->fetch_fields();

foreach($tmpCampos as $cCampo){
    $campos[] = ["nombre"=> $cCampo->name, "ancho"=> 0, "tipo"=>"texto", "pegajoso"=> $cCampo->name=="ID_REGISTRO"];
};

foreach ($campos as &$cCampo1){

    if(in_array(
        $cCampo1["nombre"],
        ["ID_REGISTRO","SUP_TER","TOTAL","PERIODO","NO_CONT","OFICINA"]))
            $cCampo1["tipo"] = "numero";

}
$datos = $data->fetch_all(2);

$anchos = [];

foreach ($datos as $cCampo => $dato){
    foreach ($dato as $ind => $cDatos){
        $ancho = strlen($cDatos);
        $anchoTitulo =strlen($campos[$ind]["nombre"]);
        $anchoTitulo > $ancho ? $ancho = $anchoTitulo : null;

        $ccAncho = &$campos[$ind]["ancho"];
        if($ancho > $ccAncho)
            $ccAncho = $ancho * 15;
    }
}
echo json_encode(["columnas"=>$campos,"contenido"=>$datos]);