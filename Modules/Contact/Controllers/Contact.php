<?php
namespace Modules\Contact\Controllers;

use Core\Route;
use Core\View;
use Core\Config;
use Modules\Base;
use Modules\Contact\Models\Branches;
use Modules\Content\Models\Control;

class Contact extends Base
{
    public $current;
    public $_template = 'Contacts';
    
    public function before()
    {
        parent::before();
        $this->current = Control::getRowSimple(Route::controller(), 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
        $this->setBreadcrumbs($this->current->name, $this->current->alias);
    }

    public function indexAction()
    {
        // Seo
        $tplData = ['current' => $this->current];
        
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        // Select branches
        $tplData['branches'] = Branches::getRows(1, 'sort');
        $tplData['countFilials'] = Config::get('static.count_filials');
        $tplData['countCities'] = Config::get('static.count_cities');
        // Render template        
        $this->_content = View::tpl($tplData, 'Contact/Index');
    }
}
    