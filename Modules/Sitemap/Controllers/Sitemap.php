<?php
    namespace Modules\Sitemap\Controllers;

    use Core\Common;
    use Core\CommonI18n;
    use Core\Config;
    use Core\Route;
    use Core\View;

    use Modules\Content\Models\Content;
    use Modules\Content\Models\Control;
    use Modules\News\Models\News;

    class Sitemap extends \Modules\Base {

        public $current;
        public $_template = 'News';

        public function before() {
            parent::before();
            $this->current = Control::getRow(Route::controller(), 'alias', 1);
            if( !$this->current ) {
                return Config::error();
            }
            $this->setBreadcrumbs( $this->current->name, $this->current->alias );
        }

        // Search list
        public function indexAction() {
            if( Config::get('error') ) {
                return false;
            }
            // Seo
            $this->_seo['h1'] = $this->current->h1;
            $this->_seo['title'] = $this->current->title;
            $this->_seo['keywords'] = $this->current->keywords;
            $this->_seo['description'] = $this->current->description;

            // Get pages
            $result = Content::getRows(1, 'sort');
            $pages = array();
            foreach ($result as $obj) {
                $pages[$obj->parent_id][] = $obj;
            }

            // Get catalog groups
            $result = CommonI18n::factory('catalog_tree')->getRows(1, 'sort');
            $groups = array();
            foreach ($result as $obj) {
                $groups[$obj->parent_id][] = $obj;
            }

            // Get catalog items
            $items = CommonI18n::factory('catalog')->getRows(1, 'sort');

            // Get news
            $news = News::getRows(1, 'date', 'DESC');
            
            // Render page
            $this->_content = View::tpl( array('pages' => $pages, 'groups' => $groups, 'news' => $news, 'items' => $items), 'Sitemap/Index' );
        }

    }