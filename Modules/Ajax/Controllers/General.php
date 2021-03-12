<?php
    namespace Modules\Ajax\Controllers;

    use Core\Arr;
    use Core\Common;
    use Core\Message;
    use Modules\Cart\Models\Cart;
    use Core\HTML;
    use Modules\Catalog\Models\Items;

    class General extends \Modules\Ajax {

        public function removeConnectionAction() {
            $id = Arr::get($_POST, 'id');
            $row = Common::factory('users_networks')->getRow($id);
            if($row) {
                Common::factory('users_networks')->delete($id);
            }
            Message::GetMessage(1, 'Вы успешно удалили связь Вашего аккаунта и соц. сети!', 5000);
            $this->success();
        }

        public function getCitiesAction()
        {
            $region = (int)Arr::get($_POST, 'region');
            if (!$region) {
                return $this->error();
            }

            $cities = [];
            $citiesDb = Items::getCitiesByRegion($region);
            foreach ($citiesDb as $row) {
                $cities[] = $row;
            }
            $this->success(['cities' => $cities]);
        }

        // Add item to cart
        public function addToCartAction() {
            // Get and check incoming data
            $catalog_id = Arr::get($this->post, 'id', 0);
            if( !$catalog_id ) {
                $this->error('No such item!');
            }
            // Add one item to cart
            Cart::factory()->add($catalog_id);
            $result = Cart::factory()->get_list_for_basket();
            $cart = array();
            foreach( $result AS $item ) {
                $obj = Arr::get($item, 'obj');
                if( $obj ) {
                    $cart[] = array(
                        'id' => $obj->id,
                        'name' => $obj->name,
                        'cost' => $obj->cost,
                        'image' => is_file(HOST.HTML::media('images/catalog/medium/'.$obj->image)) ? HTML::media('images/catalog/medium/'.$obj->image) : '',
                        'alias' => $obj->alias,
                        'count' => Arr::get($item, 'count', 1),
                    );
                }
            }
            $this->success(array('cart' => $cart));
        }


        // Edit count items in the cart
        public function editCartCountItemsAction() {
            // Get and check incoming data
            $catalog_id = Arr::get($this->post, 'id', 0);
            if( !$catalog_id ) {
                $this->error('No such item!');
            }
            $count = Arr::get($this->post, 'count', 0);
            if( !$count ) {
                $this->error('Can\'t change to zero!');
            }
            // Edit count items in cirrent position
            Cart::factory()->edit($catalog_id, $count);
            $this->success(array('count' => (int) Cart::factory()->_count_goods));
        }


        // Delete item from the cart
        public function deleteItemFromCartAction() {
            // Get and check incoming data
            $catalog_id = Arr::get($this->post, 'id', 0);
            if( !$catalog_id ) {
                $this->error('No such item!');
            }
            // Add one item to cart
            Cart::factory()->delete($catalog_id);
            $this->success(array('count' => (int) Cart::factory()->_count_goods));
        }

    }