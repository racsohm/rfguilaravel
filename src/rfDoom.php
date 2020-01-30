<?php
namespace racsohm\rfguilaravel;

class rfDoom extends \DOMDocument{
    public $DOMXpath;

    public function __construct($version = '', $encoding = '')
    {
        parent::__construct($version, $encoding);

        $this->DOMXpath = new \DOMXPath($this);
    }

    /**
     * Busca un elemento dentro del objeto DOMDocument usando una cosnulta:
     * @param $consulta
     * @return \DOMNodeList|false
     */
    function buscar($consulta){
        return $this->DOMXpath->query($consulta);
    }
}
