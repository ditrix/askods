<?php
    namespace Modules\Catalog\Controllers;

    use Core\Route;
    use Core\View;
    use Core\Config;
    use Core\Pager\Pager;
    use Core\Arr;

    use Modules\Catalog\Models\Items;
    use Modules\Content\Models\Control;

    class Sale extends \Modules\Base {

        public $current;
        public $page = 1;
        public $sort;
        public $type;
        public $limit;
        public $offset;

        protected $_template = 'CatalogItemsWithoutFilter';

        public function before() {
            parent::before();
            $this->current = Control::getRow(Route::controller(), 'alias', 1);
            if (!$this->current) {
                return Config::error();
            }
            $this->setBreadcrumbs($this->current->name, $this->current->alias);
            $this->page = !(int)Route::param('page') ? 1 : (int)Route::param('page');
            $this->limit = (int)Arr::get($_GET, 'per_page') ? (int)Arr::get($_GET, 'per_page') : Config::get('basic.limit');
            $this->offset = ($this->page - 1) * $this->limit;
            $this->sort = in_array(Arr::get($_GET, 'sort'), array('name', 'created_at', 'cost')) ? Arr::get($_GET, 'sort') : 'id';
            $this->type = in_array(strtolower(Arr::get($_GET, 'type')), array('asc', 'desc')) ? strtoupper(Arr::get($_GET, 'type')) : 'DESC';
        }


        // Catalog main page with groups where parent_id = 0
        public function indexAction() {
            if (Config::get('error')) {
                return false;
            }
            // Seo
            $this->_seo['h1'] = $this->current->h1;
            $this->_seo['title'] = $this->current->title;
            $this->_seo['keywords'] = $this->current->keywords;
            $this->_seo['description'] = $this->current->description;
            // Get groups with parent_id = 0
            $result = Items::getItemsByFlag('sale', $this->sort, $this->type, $this->limit, $this->offset);
            // Count of parent groups
            $count = Items::countItemsByFlag('sale');
            // Generate pagination
            $pager = Pager::factory($this->page, $count, $this->limit)->create();
            // Render template
            $this->_content = View::tpl(array('result' => $result, 'pager' => $pager), 'Catalog/ItemsList');
        }

    }