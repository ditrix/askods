<?php
namespace Modules\News\Controllers;

use Core\Route;
use Core\View;
use Core\Config;
use Core\Pager\Pager;

use Modules\Base;
use Modules\News\Models\News AS Model;
use Modules\Content\Models\Control;

class News extends Base
{

    public $current;
    public $page = 1;
    public $limit;
    public $offset;
    public $model;

    public function before()
    {
        parent::before();
        $this->current = Control::getRowSimple(Route::controller(), 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
        $this->setBreadcrumbs($this->current->name, $this->current->alias);
        $this->_template = 'News';

        $this->page = !(int)Route::param('page') ? 1 : (int)Route::param('page');
        $this->limit = (int)Config::get('basic.limit_articles');
        $this->offset = ($this->page - 1) * $this->limit;
    }

    public function indexAction()
    {
        if (Config::get('error')) {
            return false;
        }
        // Seo
        
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        $this->_seo['seo_text'] = $this->current->text;
        
         // Start Web-promo Tkach 
        $this->_seo['language'] = $this->current->language;
		if($this->page > 1){
			if($this->current->language === 'ua'){
				$this->_seo['title'] = 'Сторінка '.$this->page.': '.$this->current->h1.' – компанія АСКО ДС';
				$this->_seo['description'] = 'Сторінка '.$this->page.': '.$this->current->h1.' - компанія АСКО ДС ✓надійність ✓швидке врегулювання ✓виплати у повному обсязі ☎ 0-800-50-15-60';	
			}elseif($this->current->language === 'ru'){
				$this->_seo['title'] = 'Страница '.$this->page.': '.$this->current->h1.' – АСКО ДС';
				$this->_seo['description'] = 'Страница '.$this->page.': '.$this->current->h1.' - компания АСКО ДС ✓надежность ✓быстрое урегулирование ✓выплаты в полном объеме ☎ 0-800-50-15-60';				
			}
		}// End Web-promo        
        
        // Get Rows
        $result = Model::getRows(1, 'date', 'DESC', $this->limit, $this->offset);
        // Get full count of rows
        $count = Model::countRows(1);
        // Generate pagination
        $pager = Pager::factory($this->page, $count, $this->limit)->create();
        // Render template
        $this->_content = View::tpl(
            array(
                'current' => $this->current,
                'result' => $result,
                'pager' => $pager,
            ),
            'News/List'
        );
    }

    public function innerAction()
    {
        // Check for existence
        $obj = Model::getRowSimple(Route::param('alias'), 'alias', 1);
        if (!$obj) {
            return Config::error();
        }
        // Seo
        $this->_seo['h1'] = $obj->h1;
        $this->_seo['title'] = $obj->title;
        $this->_seo['keywords'] = $obj->keywords;
        $this->_seo['description'] = $obj->description;
        $this->setBreadcrumbs($obj->name);
        // Add plus one to views
        $obj = Model::addView($obj);
        // h1 for pages News
		define("h1", $obj->name);
        // Render template
        $this->_content = View::tpl(array('obj' => $obj), 'News/Inner');
        
    }
}