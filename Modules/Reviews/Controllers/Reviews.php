<?php
    namespace Modules\Reviews\Controllers;

    use Core\Config;
    use Core\Route;
    use Core\View;
    use Modules\Base;
    use Modules\Content\Models\Control;
    use Modules\Reviews\Models\Reviews AS Model;

    
    
    class Reviews extends Base {
      

        public $current;
        public $reviews;
         public $tpl_folder = 'Reviews';
          
        function before() {
            parent::before();
              
            $this->_seo['h1'] = 'Отзывы';
            $this->_seo['title'] = 'Отзывы';
            $this->setBreadcrumbs('Отзывы', 'wezom/' . Route::controller() . '/index');
            $this->current = 'HELLO WORLD';
        }

        function indexAction () {

           $result = Model::getRows(1);
           $reviews = [];
           foreach ($result as $key => $row) {
                array_push($reviews, $row);
           }
           
           $this->reviews = $reviews;
            $this->_content = View::tpl(
            array(
                $this->_seo['h1'] = $this->current->h1,
                'result' => $result,
                'tpl_folder' => $this->tpl_folder,
                'tablename' => Model::$table,
                'pageName' => $this->_seo['h1'],
              
            ),$this->tpl_folder . '/Index');
     


        }
           

    }