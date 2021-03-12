<?php
namespace Modules\Content\Controllers;

use Core\Route;
use Core\View;
use Core\Config;

use Modules\Content\Models\Content AS Model;

class Content extends \Modules\Base
{

    public function indexAction()
    {
        // Check for existence
        $page = Model::getRowSimple(Route::param('alias'), 'alias', 1);
        if (!$page) {
            return Config::error();
        }
        // Seo
        $this->_seo['h1'] = $page->h1;
        $this->_seo['title'] = $page->title;
        $this->_seo['keywords'] = $page->keywords;
        $this->_seo['description'] = $page->description;
        $this->generateParentBreadcrumbs($page->parent_id, 'content', 'parent_id');
        $this->setBreadcrumbs($page->name);
        // Add plus one to views
        $page = Model::addView($page);
        // Get content page children
        if ($page->parent_id == 0) {
            $kids = Model::getKids($page->id);
        } elseif (count($kids = Model::getKids($page->id)) == 0) {
            $kids = Model::getKids($page->parent_id);
        }
         // h1 for pages Buy insurance
		define("h1", $page->name);
        // Render template
        $this->_content = View::tpl(array('obj' => $page, 'kids' => $kids), 'Content/Page');
    }
}
