<?php
namespace Modules\Leaders\Controllers;

use Core\Config;
use Core\View;
use Modules\Base;
use Modules\Content\Models\Content;
use Modules\Leaders\Models\Leaders as Model;
use Modules\Leaders\Models\Observers;

class Leaders extends Base
{
    public $current;
    public $_template = 'Gallery';

    public function before()
    {
        parent::before();
        $this->current = Content::getRowSimple('rukovodstvo', 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
    }

    public function indexAction()
    {
        $tplData = ['current' => $this->current];
        // Set seo
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        $this->_seo['seo_text'] = $this->current->text;
        // Set menu
        if ($this->current->parent_id == 0) {
            $tplData['kids'] = Content::getKids($this->current->id);
        } elseif (count($kids = Content::getKids($this->current->id)) == 0) {
            $tplData['kids'] = Content::getKids($this->current->parent_id);
        }
        // Get leaders
        $tplData['leaders'] = Model::getRows(1, 'sort');
        // Get observers
        $tplData['observers'] = Observers::getRows(1, 'sort');
        // Render
        $this->_content = View::tpl($tplData, 'Leaders/Index');
    }
}