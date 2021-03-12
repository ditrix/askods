<?php
    namespace Modules\Catalog\Controllers;

    use Core\Common;
    use Core\HTTP;
    use Core\Route;
    use Core\View;
    use Core\Config;
    use Modules\Catalog\Models\Items;


    class Product extends \Modules\Base {

        public function before() {
            parent::before();
            $this->_template = 'Item';
        }

        // Show item inner page
        public function indexAction() {
            // Get item information from database
            $item = Items::getRow(Route::param('id'));
            if($item->alias != Route::param('alias')) {
                unset($_POST);
                HTTP::redirect($item->alias.'/p'.$item->id, 301);
            }
            if( !$item ) { return Config::error(); }
            Route::factory()->setParam('id', $item->id);
            Route::factory()->setParam('group', $item->parent_id);
            // Add to cookie viewed list
            Items::addViewed($item->id);
            // Add plus one to views
            $item = Items::addView($item);
            // Seo
            $this->setSeoForItem($item);
            // Get images
            $images = Items::getItemImages($item->id);
            // Get current item specifications list
            $spec = Items::getItemSpecifications($item->id, $item->parent_id);
            // Render template
            $this->_content = View::tpl( array('obj' => $item, 'images' => $images, 'specifications' => $spec), 'Catalog/Item' );
        }

        // Set seo tags from template for items
        public function setSeoForItem($page) {
            $tpl = Common::factory('seo_templates')->getRow(2);
            $from = array('{{name}}', '{{group}}', '{{brand}}', '{{model}}');
            $to = array($page->name, $page->parent_name, $page->brand_name, $page->model_name);
            $this->_seo['h1'] = $page->h1 ? str_replace($from, $to, $page->h1) : str_replace($from, $to, $tpl->h1);
            $this->_seo['title'] = $page->title ? str_replace($from, $to, $page->title) : str_replace($from, $to, $tpl->title);
            $this->_seo['keywords'] = $page->keywords ? str_replace($from, $to, $page->keywords) : str_replace($from, $to, $tpl->keywords);
            $this->_seo['description'] = $page->description ? str_replace($from, $to, $page->description) : str_replace($from, $to, $tpl->description);
            $this->setBreadcrumbs( 'Каталог', '/products' );
            $this->generateParentBreadcrumbs( $page->parent_id, 'catalog_tree', 'parent_id', '/products/' );
            $this->setBreadcrumbs( $page->name );
        }

    }