<?php
    namespace Modules\Articles\Controllers;

    use Core\Common;
    use Core\Route;
    use Core\View;
    use Core\Config;
    use Core\Pager\Pager;

    use Modules\Content\Models\Control;

    class Articles extends \Modules\Base {

        public $current;
        public $page = 1;
        public $limit;
        public $offset;
        public $model;

        public function before() {
            parent::before();
            $this->current = Control::getRow(Route::controller(), 'alias', 1);
            if( !$this->current ) {
                return Config::error();
            }
            $this->setBreadcrumbs( $this->current->name, $this->current->alias );
            $this->_template = 'Text';

            $this->page = !(int) Route::param('page') ? 1 : (int) Route::param('page');
            $this->limit = (int) Config::get('basic.limit_articles');
            $this->offset = ($this->page - 1) * $this->limit;
            $this->model = Common::factory('articles');
        }

        public function indexAction() {
            if( Config::get('error') ) {
                return false;
            }
            // Seo
            $this->_seo['h1'] = $this->current->h1;
            $this->_seo['title'] = $this->current->title;
            $this->_seo['keywords'] = $this->current->keywords;
            $this->_seo['description'] = $this->current->description;
            // Get Rows
            $result = $this->model->getRows(1, 'id', 'DESC', $this->limit, $this->offset);
            // Get full count of rows
            $count = $this->model->countRows(1);
            // Generate pagination
            $pager = Pager::factory($this->page, $count, $this->limit)->create();
            // Render template
            $this->_content = View::tpl( array( 'result' => $result, 'pager' => $pager ), 'Articles/List' );
        }

        public function innerAction() {
            if( Config::get('error') ) {
                return false;
            }
            // Check for existance
            $obj = $this->model->getRow(Route::param('alias'), 'alias', 1);
            if( !$obj ) { return Config::error(); }
            // Seo
            $this->_seo['h1'] = $obj->h1;
            $this->_seo['title'] = $obj->title;
            $this->_seo['keywords'] = $obj->keywords;
            $this->_seo['description'] = $obj->description;
            $this->setBreadcrumbs( $obj->name );
            // Add plus one to views
            $obj = $this->model->addView($obj);
            // Render template
            $this->_content = View::tpl( array( 'obj' => $obj ), 'Articles/Inner' );
        }
        
    }