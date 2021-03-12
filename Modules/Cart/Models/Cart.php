<?php
    namespace Modules\Cart\Models;

    use Core\Common;
    use Core\QB\Database;
    use Core\QB\DB;
    use Core\Cookie;
    use Core\Arr;
    use Core\Text;

    class Cart {

        static    $_instance;

        public    $_cart_id = 0; // Cart ID in our system
        public    $_cart = array(); // Items in our cart
        public    $_count_goods = 0; // Count of items in our cart

        function __construct() {
            $this->clearCarts();
            $this->set_cart_id();
            $this->check_cart();
            $this->recount();
        }

        static function factory() {
            if(self::$_instance == NULL) { self::$_instance = new self(); }
            return self::$_instance;
        }


        public function clearCarts() {
            DB::query(Database::DELETE, 'DELETE FROM carts WHERE carts.id NOT IN (SELECT DISTINCT cart_id FROM carts_items) AND created_at < "'.(time() - 24 * 60 * 60).'"')->execute();
        }


        // Get goods list for basket from database
        public function get_list_for_basket() {
            $ids = array();
            foreach($this->_cart AS $key => $item) {
                $ids[] = $item['id'];
            }
            if(!count($ids)) { $ids = array(0); }
            $result = DB::select('catalog.*')
                        ->from('catalog')
                        ->join('carts_items', 'LEFT')
                            ->on('carts_items.catalog_id', '=', 'catalog.id')
                        ->where('carts_items.cart_id', '=', $this->_cart_id)
                        ->where('catalog.status', '=', 1)
                        ->where('catalog.id', 'IN', $ids)
                        ->find_all();
            $basket = $this->_cart;
            foreach($result AS $obj) {
                $basket[$obj->id]['obj'] = $obj;
            }
            return $basket;
        }


        // Setting cart ID
        public function set_cart_id(){
            // Check cookie for existance of the cart
            $hash = Cookie::get('cart');
            if( !$hash ) { return $this->create_cart(); }
            // Check if our cookie not bad
            $cart = Common::factory('carts')->getRow($hash, 'hash');
            if( !$cart ) { return $this->create_cart(); }
            // Set cart_id
            $this->_cart_id = $cart->id;
            return true;
        }


        // Creation of the new cart
        public function create_cart() {
            // Generate hash of new cart for cookie
            $hash = sha1(microtime().Text::random());
            // Save cart into database
            $this->_cart_id = Common::factory('carts')->insert(array('hash' => $hash));
            // Save cart to cookie
            Cookie::set('cart', $hash, 60*60*24*365);
            return true;
        }


        // Check existance of cart
        public function check_cart() {
            if(!$this->_cart_id) { return false; }
            $result = DB::select(array('carts_items.catalog_id', 'catalog_id'), array('carts_items.count', 'count'))
                        ->from('carts_items')
                        ->join('catalog', 'LEFT')->on('catalog.id', '=', 'carts_items.catalog_id')
                        ->where('catalog.status', '=', 1)
                        ->where('carts_items.cart_id', '=', $this->_cart_id)
                        ->order_by('carts_items.id', 'DESC')
                        ->find_all();
            foreach($result AS $obj) {
                $this->_cart[$obj->catalog_id] = Array(
                    "id" => $obj->catalog_id,
                    "count" => $obj->count,
                );
            }
            return true;
        }


        // Count goods in cart
        public function recount() {
            $count = 0;
            foreach($this->_cart AS $b) {
                $count += (int) $b['count'];
            }
            $this->_count_goods = $count;
        }


        // Get full cost of all cart
        public function get_summa() {
            $summa = 0;
            if(empty($this->_cart)) { return 0; }
            $ids = array();
            foreach($this->_cart AS $b) {
                if(!in_array($b['id'], $ids)) {
                    $ids[] = $b['id'];
                }
            }
            $result = DB::select('cost', 'id')->from("catalog")->where("status", "=", 1)->where("id", "IN", $ids)->find_all();
            $items = array();
            foreach($result AS $obj) {
                $items[$obj->id] = $obj;
            }
            foreach($this->_cart AS $b) {
                $summa += $items[$b['id']]->cost * $b['count'];
            }
            return $summa;
        }


        /**
         *      Add goods to cart
         *      @param int $catalog_id - goods ID
         *      @param int $count - count goods in the cart
         *      @return boolean
         */
        public function add($catalog_id, $count = 1) {
            if(!Arr::get($this->_cart, $catalog_id, false)) {
                $this->_cart[$catalog_id] = array(
                    'id' => $catalog_id,
                    'count' => $count,
                );
                Common::factory('carts_items')->insert(array(
                    'catalog_id' => $catalog_id,
                    'cart_id' => $this->_cart_id,
                    'count' => $count,
                ));
            } else {
                $this->_cart[$catalog_id]['count'] = $this->_cart[$catalog_id]['count'] + $count;
                DB::update('carts_items')
                    ->set(array('count' => $this->_cart[$catalog_id]['count']))
                    ->where('cart_id', '=', $this->_cart_id)
                    ->where('catalog_id', '=', $catalog_id)
                    ->execute();
            }
            $this->recount();
            return true;
        }


        /**
         *      Change count in the cart
         *      @param int $catalog_id - goods ID
         *      @param int $count - new count in the cart
         *      @return boolean
         */
        public function edit($catalog_id, $count) {
            if(!Arr::get($this->_cart, $catalog_id, false)) {
                return false;
            }
            $this->_cart[$catalog_id]['count'] = $count;
            DB::update('carts_items')
                ->set(array('count' => $count))
                ->where('cart_id', '=', $this->_cart_id)
                ->where('catalog_id', '=', $catalog_id)
                ->execute();
            $this->recount();
            return true;
        }


        /**
         *      Delete goods from the cart
         *      @param $catalog_id - goods ID
         *      @return boolean
         */
        public function delete($catalog_id) {
            if(Arr::get($this->_cart, $catalog_id, false)) {
                unset($this->_cart[$catalog_id]);
                DB::delete('carts_items')
                    ->where("catalog_id", "=", $catalog_id)
                    ->where("cart_id", "=", $this->_cart_id)
                    ->execute();
                $this->recount();
                return true;
            }
            return false;
        }


        // Total cleaning of the cart
        public function clear() {
            Common::factory('carts')->delete($this->_cart_id);
            $this->_cart_id = 0;
            $this->_cart = Array();
            Cookie::delete('cart');
            $this->recount();
        }

    }