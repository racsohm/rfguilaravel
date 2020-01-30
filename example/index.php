<?php

include __DIR__  . "/../vendor/autoload.php";

class controlador extends racsohm\rfguilaravel\rfGui {
    protected $baseRuta = "guiControl";
    protected $modelo = 'model';
}

new controlador();