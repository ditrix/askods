<?php
namespace Modules\Catalog\Controllers;

use Core\Route;
use Core\View;
use Core\Config;
use Modules\Base;
use Modules\Catalog\Models\Groups AS Model;
use Modules\Content\Models\Control;

class Catalog extends Base
{

    public $current;
    public $sort = 'sort';
    public $type = 'ASC';

    public function before()
    {
        parent::before();
        $this->current = Control::getRowSimple('strahovye-uslugi', 'alias', 1);
        if (!$this->current) {
            return Config::error();
        }
        $this->setBreadcrumbs($this->current->name, $this->current->alias);
    }


    // Catalog main page with groups where parent_id = 0
    public function indexAction()
    {
        // Seo
        $this->_seo['h1'] = $this->current->h1;
        $this->_seo['title'] = $this->current->title;
        $this->_seo['keywords'] = $this->current->keywords;
        $this->_seo['description'] = $this->current->description;
        $this->_seo['seo_text'] = $this->current->text;

        // Get groups with parent_id = 0
        $result = [];
        $parentGroups = Model::getInnerGroups(0, $this->sort, $this->type);
        foreach ($parentGroups as $key => $firstGroup) {
            $result[$key]['group'] = $firstGroup;
            $result[$key]['items'] = Model::getInnerGroups($firstGroup->id, $this->sort, $this->type);
        }
        // Render template
        $this->_content = View::tpl(array('result' => $result, 'current' => $this->current), 'Catalog/Groups');
    }


    // Page with groups list
    public function groupsAction()
    {
        // Check for existence
        $group = Model::getRowSimple(Route::param('alias'), 'alias', 1);
        if (!$group) {
            return Config::error();
        }
        // Save params
        Route::factory()->setParam('group', $group->id);
        Config::set('pageName', $group->name);
        // Seo
        $this->setSeoForGroup($group);
        // Get groups list
        $kids = Model::getInnerGroups($group->id, $this->sort, $this->type);
        if (count($kids) == 0) {
            $kids = Model::getInnerGroups($group->parent_id, $this->sort, $this->type);
        }
        
        // h1 for pages
		define("h1", $group->name);
		$_SERVER['REQUEST_URI'] = preg_replace('#/strahovye-uslugi#', '', $_SERVER['REQUEST_URI']);
		
        // Render template
        $current = $this->current;
        $this->_content = View::tpl(compact('group', 'kids', 'current'), 'Catalog/Inner');
    }


    // Set seo tags from template for items groups
    public function setSeoForGroup($page)
    {
        $this->_seo['h1'] = $page->h1;
        $this->_seo['title'] = $page->title;
        $this->_seo['keywords'] = $page->keywords;
        $this->_seo['description'] = $page->description;
        $this->_seo['seo_text'] = $page->seo_text;
        $this->generateParentBreadcrumbs($page->parent_id, 'catalog_tree', 'parent_id');
        $this->setBreadcrumbs($page->name);
    }
}
