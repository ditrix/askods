<?php
namespace Modules\Vacancy\Controllers;

use Core\Config;
use Core\Route;
use Core\View;
use Modules\Base;
use Modules\Content\Models\Control;
use Modules\Vacancy\Models\Vacancy as Model;

class Vacancy extends Base
{
    public $current;
    public $_template = 'Gallery';

    public function before()
    {
        parent::before();
        $this->current = Control::getRowSimple(Route::controller(), 'alias', 1);
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
        // Get jobs
        $tplData['vacancies'] = Model::getRows(1, 'sort');
        // Render
        $this->_content = View::tpl($tplData, 'Vacancy/Index');
    }
}