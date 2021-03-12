<?php
namespace Modules\Catalog\Controllers;

use Core\Route;
use Core\View;
use Core\Config;
use Modules\Base;
use Modules\Catalog\Models\Files;
use Modules\Catalog\Models\Items;
use Modules\Content\Models\Control;

class BuyInsurance extends Base
{
    public $current;

    public function before()
    {
        parent::before();
        $this->current = Control::getRowSimple('kalkulyator-online', 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
        $this->setBreadcrumbs($this->current->name, $this->current->alias);
        
    }

    // Show item inner page
    public function indexAction()
    {
        // Set seo
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        $this->_seo['seo_text'] = $this->current->text;
        // Get items
        $result = Items::getRows(1, 'sort', 'ASC');
        // Render template
        $this->_content = View::tpl(array('result' => $result, 'current' => $this->current), 'BuyInsurance/Index');
    }

    public function innerAction()
    {
        // Get item information from database
        $item = Items::getRowSimple(Route::param('alias'), 'alias', 1);
        if (!$item) {
            return Config::error();
        }
        // Seo
        $this->setSeoForItem($item);
        // Get current item specifications list
        $spec = Items::getItemSpecifications($item->id, $item->parent_id);
        // Files
        $files = Items::getItemFiles($item->id);
        // Menu
        $menu = Items::getItemSubMenu($item);

		// h1 for pages Buy insurance
		define("h1", $item->name);

        // Render template
        $this->_content = View::tpl(array(
            'current' => $this->current,
            'obj' => $item,
            'specifications' => $spec, 
            'h1' => $this->_seo['h1'],
            'files' => $files,
            'directory' => Files::$directory,
          //  'menu' => $menu,
        ), 'BuyInsurance/' . (Route::param('buy') ? 'InnerBuy' : 'InnerAbout'));
    	
    }

    // Set seo tags from template for items
    public function setSeoForItem($page)
    {
        if (Route::param('buy')) {
            $h1 = $page->buy_h1;
            $title = $page->buy_title;
            $keywords = $page->buy_keywords;
            $description = $page->buy_description;
            $this->setBreadcrumbs($page->name, $this->current->alias . '/' . $page->alias);
// ditrix comented            $this->setBreadcrumbs(__('Купить страховку'));
        } else {
            $h1 = $page->h1;
            $title = $page->title;
            $keywords = $page->keywords;
            $description = $page->description;
            $this->setBreadcrumbs($page->name);
        }

        $this->_seo['h1'] = $h1;
        $this->_seo['title'] = $title;
        $this->_seo['keywords'] = $keywords;
        $this->_seo['description'] = $description;
    }
}