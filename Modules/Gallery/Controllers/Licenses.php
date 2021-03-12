<?php
namespace Modules\Gallery\Controllers;

use Core\View;
use Core\Config;
use Modules\Base;
use Modules\Content\Models\Content;
use Modules\Content\Models\Control;
use Modules\Gallery\Models\License AS Model;
use Modules\Gallery\Models\LicenseImages AS Images;

class Licenses extends Base
{
    public $current;
    public $_template = 'Gallery';
    
    public function before()
    {
        parent::before();
        $this->current = Content::getRowSimple('litsenzii', 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
        $this->setBreadcrumbs($this->current->name, $this->current->alias);
    }

    public function indexAction()
    {
        // Seo
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        $this->_seo['seo_text'] = $this->current->text;
        if ($this->current->parent_id == 0) {
            $kids = Content::getKids($this->current->id);
        } elseif (count($kids = Content::getKids($this->current->id)) == 0) {
            $kids = Content::getKids($this->current->parent_id);
        }
        // Get Rows
        $albums = Model::getRows(1, 'sort', 'ASC', $this->limit, $this->offset);
        $result = [];
        foreach ($albums as $key => $album) {
            $result[$key]['album'] = $album;
            $result[$key]['photos'] = Images::getRowsByParentId($album->id, 'sort');
        }
        // Render template
        $this->_content = View::tpl(array('result' => $result, 'current' => $this->current, 'kids' => $kids), 'Gallery/Index');
    }
}
