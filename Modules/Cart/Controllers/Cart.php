<?php
    namespace Modules\Cart\Controllers;

    use Core\Route;
    use Modules\Content\Models\Control;
    use Modules\Cart\Models\Cart AS C;
    use Core\View;
    use Core\Config;
    
    class Cart extends \Modules\Base {

        public $current;

        public function before() {
            parent::before();
            $this->current = Control::getRow(Route::controller(), 'alias', 1);
            if( !$this->current ) {
                return Config::error();
            }
            $this->setBreadcrumbs( $this->current->name, $this->current->alias );
            $this->_template = 'Cart';
        }

        // Cart page with order form
        public function indexAction() {
            if( Config::get('error') ) {
                return false;
            }
            // Seo
            $this->_seo['h1'] = $this->current->h1;
            $this->_seo['title'] = $this->current->title;
            $this->_seo['keywords'] = $this->current->keywords;
            $this->_seo['description'] = $this->current->description;
            // Get cart items
            $cart = C::factory()->get_list_for_basket();
            // Render template
            $this->_content = View::tpl( array('cart' => $cart, 'payment' => Config::get('order.payment'), 'delivery' => Config::get('order.delivery')), 'Cart/Index' );
        }

    }