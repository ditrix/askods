<?php
    namespace Modules\Catalog\Models;

    use Core\QB\DB;
    use Core\Route;
    use Core\Config;
    use Core\Arr;
    use Core\HTML;

    class __Filter {

        static $_items = array(); // Array of all items in group
        static $_data = array();
        static $_ids = array(0);
        static $_tmp = array();

        // Instance method. I use it for not execute same big sql query twice ( filter, catalog items list )
        static function getFilteredItems() {
            if(!self::$_items) {
                self::$_tmp[] = DB::select(
                    'catalog.id', 'catalog.available', 'catalog.cost',
                    array('brands.alias', 'brand_alias'),
                    array(DB::expr('NULL'), 'model_alias'),
                    array(DB::expr('NULL'), 'specification_alias'),
                    array(DB::expr('NULL'), 'specification_value_alias')
                )
                    ->from('catalog')
                    ->join('brands', 'LEFT')->on('brands.id', '=', 'catalog.brand_id')->on('brands.status', '=', DB::expr('"1"'))
                    ->where('catalog.status', '=', '1')
                    ->where('catalog.parent_id', '=', (int) Route::param('group'))
                    ->find_all();
                self::$_tmp[] = DB::select(
                    'catalog.id', 'catalog.available', 'catalog.cost',
                    array(DB::expr('NULL'), 'brand_alias'),
                    array('models.alias', 'model_alias'),
                    array(DB::expr('NULL'), 'specification_alias'),
                    array(DB::expr('NULL'), 'specification_value_alias')
                )
                    ->from('catalog')
                    ->join('models', 'LEFT')->on('models.id', '=', 'catalog.model_id')->on('models.status', '=', DB::expr('"1"'))
                    ->where('catalog.status', '=', '1')
                    ->where('catalog.parent_id', '=', (int) Route::param('group'))
                    ->find_all();
                self::$_tmp[] = DB::select(
                    'catalog.id', 'catalog.available', 'catalog.cost',
                    array(DB::expr('NULL'), 'brand_alias'),
                    array(DB::expr('NULL'), 'model_alias'),
                    array('specifications.alias', 'specification_alias'),
                    array('specifications_values.alias', 'specification_value_alias')
                )
                    ->from('catalog')
                    ->join('catalog_specifications_values', 'LEFT')
                        ->on('catalog_specifications_values.catalog_id', '=', 'catalog.id')
                    ->join('specifications', 'LEFT')
                        ->on('specifications.id', '=', 'catalog_specifications_values.specification_id')
                        ->on('specifications.status', '=', DB::expr('"1"'))
                    ->join('specifications_values', 'LEFT')
                        ->on('catalog_specifications_values.specification_value_id', '=', 'specifications_values.id')
                        ->on('specifications_values.status', '=', DB::expr('"1"'))
                    ->where('catalog.status', '=', '1')
                    ->where('catalog.parent_id', '=', (int) Route::param('group'))
                    ->find_all();
                foreach (self::$_tmp as $array) {
                    if ($array) {
                        foreach ($array as $key => $item) {
                            self::$_ids[$item->id] = $item->id;
                            self::$_items[$item->id] = $item;
                            if ($item->brand_alias) {
                                self::$_data[$item->id]['brand'][] = $item->brand_alias;
                            }
                            if ($item->model_alias) {
                                self::$_data[$item->id]['model'][] = $item->model_alias;
                            }
                            if ($item->cost) {
                                self::$_data[$item->id]['cost'][] = $item->cost;
                            }
                            self::$_data[$item->id]['available'][] = $item->available;
                            if($item->specification_value_alias AND $item->specification_alias) {
                                self::$_data[$item->id][$item->specification_alias][] = $item->specification_value_alias;
                            }
                        }
                    }
                }
                self::$_tmp = array();
            }
            return self::$_items;
        }

        /**
         * Generate link with filter parameters
         * @param  string $key   [specification alias]
         * @param  string $value [specification value alias]
         * @return string        [link]
         */
        public static function generateLinkWithFilter($key, $value) {
            // Devide url from GET parameters
            $uri = Arr::get($_SERVER, 'REQUEST_URI');
            $uri = explode('?', $uri);
            $link = $uri[0];
            $get = '';
            if (count($uri) > 1) {
                $get = '?'.$uri[1];
            }
            // Clear link from pagination
            if( (int) Route::param('page') ) {
                $link = str_replace('/page/'.(int) Route::param('page'), '', $link);
            }
            // If filter is empty - create it and return
            $filter = Config::get('filter_array');
            // Clear link from filter
            $link = str_replace('/filter/'.Route::param('filter'), '', $link);
            // Setup filter
            if( isset($filter[$key]) ) {
                if( !in_array($value, $filter[$key]) ) {
                    $filter[$key][] = $value;
                } else {
                    unset($filter[$key][array_search($value, $filter[$key])]);
                    if( empty($filter[$key]) OR (count($filter[$key]) == 1 AND !trim(end($filter[$key])))) {
                        unset($filter[$key]);
                    }
                }
            } else {
                $filter[$key] = array($value);
            }
            // Generate link with filter
            $filter = Filter::generateFilter($filter);
            // Return link
            if($filter) {
                return $link.'/filter/'.$filter.$get;
            }
            return $link.$get;
        }


        /**
         *  Create filter part of URI
         *  @param  array  $array [associative array with filter elements]
         *  @return string        [part of new URI]
         */
        public static function generateFilter( $array ) {
            // Sort filter elements
            $array = Filter::sortFilter( $array );
            // Generate and return filters part
            $link = array();
            foreach($array AS $key => $values) {
                $link[] = $key.'='.implode(',', $values);
            }
            return implode('&', $link);
        }


        /**
         *  Sort our filter
         *  @param  array $array  Our filter in array
         *  @return array         Our filter but sorted!
         */
        public static function sortFilter( $array ) {
            $template = Config::get('sortable');
            $filter = array();
            foreach( $template AS $tpl ) {
                if( isset($array[$tpl]) AND !empty($array[$tpl]) AND !(count($array[$tpl]) == 1 AND !trim(end($array[$tpl]))) ) {
                    $filter[$tpl] = $array[$tpl];
                    sort($filter[$tpl]);
                    reset($filter[$tpl]);
                }
            }
            return $filter;
        }


        /**
         *  Check for existance parameter in the filter
         *  @param  string $element       alias of element of the filter
         *  @param  string $specification alias of the filter
         *  @return string                Word 'checked' or NULL
         */
        public static function checked($element, $specification) {
            $filter = array();
            if( Config::get('filter_array') ) {
                $filter = Config::get('filter_array');
            }
            if( in_array($element, Arr::get($filter, $specification, array())) ) {
                return 'checked';
            }
            return NULL;
        }


        /**
         *  Get a minimal number for price filter
         *  @param  int $realMin  real minimal number for current catalog group
         *  @return int           minimal number for value in price filter
         */
        public static function min( $realMin ) {
            if( !Config::get('filter_array') ) {
                return $realMin;
            }
            $filter = Config::get('filter_array');
            if( !isset($filter['min_cost']) ) {
                return $realMin;
            }
            $min = (int) $filter['min_cost'][0];
            if( $min < $realMin ) {
                return $realMin;
            }
            return $min;
        }


        /**
         *  Get a maximum number for price filter
         *  @param  [int] $realMin  real maximum number for current catalog group
         *  @return [int]           maximum number for value in price filter
         */
        public static function max( $realMax ) {
            if( !Config::get('filter_array') ) {
                return $realMax;
            }
            $filter = Config::get('filter_array');
            if( !isset($filter['max_cost']) ) {
                return $realMax;
            }
            $max = $filter['max_cost'][0];
            if( $max > $realMax ) {
                return $realMax;
            }
            return $max;
        }


        // Set to memory the algorithm of filter elements
        public static function setSortElements() {
            $sortable = array('brand', 'model', 'available', 'min_cost', 'max_cost');
            $result = DB::select('alias')->from('specifications')->where('status', '=', 1)->order_by('alias')->find_all();
            foreach($result AS $obj) {
                $sortable[] = $obj->alias;
            }
            Config::set('sortable', $sortable);
        }


        // Set to memory filter as array
        public static function setFilterParameters() {
            if(!Route::param('filter')) { return false; }
            $fil    = Route::param('filter');
            $fil    = explode("&", $fil);
            $filter = Array();
            foreach($fil AS $g) {
                $g  = urldecode($g);
                $g  = strip_tags($g);
                $g  = stripslashes($g);
                $g  = trim($g);
                $s  = explode("=", $g);
                $filter[$s[0]] = explode(",", $s[1]);
            }
            Config::set('filter_array', $filter);
            return true;
        }


        // Get items list
        public static function getFilteredItemsList( $limit = 15, $offset = 0, $sort = 'sort', $type = 'DESC' ) {
            static::getFilteredItems();
            $list = array();
            $filter = is_array(Config::get('filter_array')) ? Config::get('filter_array') : array();
            foreach (self::$_data as $item_id => $item) {
                $filtered = 0;
                if( $filter ) {
                    foreach ($filter as $key => $value) {
                        if( !isset($item[$key]) AND !in_array($key, array('min_cost', 'max_cost')) ) {
                            $filtered = 1;
                        } else {
                            switch ($key) {
                                case 'min_cost':
                                    if( $item['cost'][0] < $value[0] ) {
                                        $filtered = 1;
                                    }
                                    break;
                                case 'max_cost':
                                    if( $item['cost'][0] > $value[0] ) {
                                        $filtered = 1;
                                    }
                                    break;
                                default:
                                    $flag = 0;
                                    foreach ($item[$key] AS $element) {
                                        if( in_array($element, $value) ) {
                                            $flag = 1;
                                        }
                                    }
                                    if( !$flag ) {
                                        $filtered = 1;
                                    }
                                    break;
                            }
                        }
                    }
                }
                if( !$filtered ) {
                    $list[] = $item_id;
                }
            }
            $total = count($list);
            if (!$total) {
                return array(
                    'result' => array(),
                    'total' => 0,
                );
            }
            $result = DB::select('catalog.*', array('catalog_images.image', 'image'), array('brands.name', 'brand_name'), array('brands.alias', 'brand_alias'))
                    ->from('catalog')
                    ->join('catalog_images', 'LEFT')
                        ->on('catalog.id', '=', 'catalog_images.catalog_id')
                        ->on('catalog_images.main', '=', DB::expr('1'))
                    ->join('brands', 'LEFT')
                        ->on('brands.id', '=', 'catalog.brand_id')
                    ->where('catalog.status', '=', 1)
                    ->where('catalog.id', 'IN', $list)
                    ->order_by('catalog.available', 'ASC')
                    ->order_by('catalog.'.$sort, $type)
                    ->limit($limit)
                    ->offset($offset)
                    ->find_all();
            $response = array(
                'items' => $result,
                'total' => $total,
            );
            return $response;
        }


        // Get clickable filters and min/max costs, included current
        public static function getClickableFilterElements() {
            static::getFilteredItems();
            $filter = Config::get('filter_array');
            $params = array();
            $costs = array();
            $sortable = Config::get('sortable');
            foreach (self::$_data as $item_id => $item) {
                $costs[] = $item['cost'][0];
                foreach ($sortable as $sort) {
                    $filtered = 0;
                    $f = $filter;
                    if( isset($f[$sort]) ) {
                        unset($f[$sort]);
                    }
                    if( $f ) {
                        foreach ($f as $key => $value) {
                            if( !isset($item[$key]) AND !in_array($key, array('min_cost', 'max_cost')) ) {
                                $filtered = 1;
                            } else {
                                switch ($key) {
                                    case 'min_cost':
                                        if( $item['cost'][0] < $value[0] ) {
                                            $filtered = 1;
                                        }
                                        break;
                                    case 'max_cost':
                                        if( $item['cost'][0] > $value[0] ) {
                                            $filtered = 1;
                                        }
                                        break;
                                    default:
                                        $flag = 0;
                                        foreach ($item[$key] AS $element) {
                                            if( in_array($element, $value) ) {
                                                $flag = 1;
                                            }
                                        }
                                        if( !$flag ) {
                                            $filtered = 1;
                                        }
                                        break;
                                }
                            }
                        }
                    }
                    if( !$filtered AND isset($item[$sort]) ) {
                        foreach ($item[$sort] AS $value) {
                            if( !in_array($value, Arr::get($params, $sort, array())) ) {
                                $params[$sort][] = $value;
                            }
                        }
                    }
                }
            }
            $min = $costs ? min($costs) : 0;
            $max = $costs ? max($costs) : 0;
            return array(
                'filter' => $params,
                'min' => $min,
                'max' => $max,
            );
        }


        // Get brands list for filter
        public static function getBrandsWidget() {
            return DB::select('brands.name', 'brands.alias', 'brands.id')
                ->from('brands')
                ->join('catalog', 'LEFT')->on('catalog.brand_id', '=', 'brands.id')
                ->where('catalog.status', '=', 1)
                ->where('brands.status', '=', 1)
                ->where('catalog.parent_id', '=', Route::param('group'))
                ->group_by('brands.id')
                ->order_by('brands.name')
                ->find_all();
        }


        // Get models list for filter
        public static function getModelsWidget() {
            $filter = Config::get('filter_array');
            return DB::select('models.name', 'models.alias', 'models.id')
                ->from('models')
                ->join('catalog', 'LEFT')->on('catalog.model_id', '=', 'models.id')
                ->join('brands', 'LEFT')->on('brands.id', '=', 'catalog.brand_id')->on('brands.status', '=', DB::expr('1'))
                ->where('catalog.status', '=', 1)
                ->where('models.status', '=', 1)
                ->where('brands.alias', 'IN', Arr::get($filter, 'brand', array()))
                ->where('catalog.parent_id', '=', Route::param('group'))
                ->group_by('models.id')
                ->order_by('models.name')
                ->find_all();
        }


        // Get specifications values list for filter
        public static function getSpecificationsWidget() {
            $result = DB::select(
                'specifications_values.id',
                'specifications_values.name',
                'specifications_values.color',
                'specifications_values.alias',
                array('specifications.name', 'specification_name'),
                array('specifications.alias', 'specification_alias'),
                array('specifications.id', 'specification_id'),
                array('specifications.type_id', 'specification_type_id')
            )
                ->from('specifications_values')
                ->join('catalog_specifications_values', 'LEFT')
                    ->on('catalog_specifications_values.specification_value_id', '=', 'specifications_values.id')
                ->join('specifications', 'LEFT')
                    ->on('specifications.id', '=', 'catalog_specifications_values.specification_id')
                ->join('catalog', 'LEFT')
                    ->on('catalog_specifications_values.catalog_id', '=', 'catalog.id')
                ->where('catalog.status', '=', 1)
                ->where('specifications.status', '=', 1)
                ->where('catalog.parent_id', '=', Route::param('group'))
                ->group_by('specifications.alias')
                ->group_by('specifications_values.alias')
                ->order_by('specifications.name')
                ->find_all();
            $specifications = array();
            $values = array();
            foreach( $result as $obj ) {
                $values[$obj->specification_alias][] = $obj;
                $specifications[$obj->specification_alias] = $obj->specification_name;
            }
            return array(
                'list' => $specifications,
                'values' => $values,
            );
        }


        // Generate input for filter
        public static function generateInput($filter, $obj, $alias, $type = 'simple') {
            $check = (isset($filter[$alias]) AND in_array($obj->alias, $filter[$alias]));
            $checked = Filter::checked($obj->alias, $alias);
            $disabled = (!$check AND !$checked) ? 'disabled' : '';
            $input = '';
            switch($type) {
                case 'color':
                    if( !$disabled ) {
                        $input .= '<a class="toolTip" href="'.Filter::generateLinkWithFilter($alias, $obj->alias).'" data-title="'.$obj->name.'">';
                    }
                    $input .= '<input  id="'.$alias.$obj->alias.'" value="'.$obj->alias.'" type="checkbox" '.$checked.$disabled.' />';
                    $input .= '<ins><div style="background-color:'.$obj->color.'"></div></ins>';
                    if( !$disabled ) {
                        $input .= '</a>';
                    }
                    break;
                default:
                    $input .= '<label class="checkBlock" for="'.$alias.$obj->id.'">';
                    if( !$disabled ) {
                        $input .= '<a href="'.Filter::generateLinkWithFilter($alias, $obj->alias).'">';
                    }
                    $input .= '<input  id="'.$alias.$obj->alias.'" value="'.$obj->alias.'" type="checkbox" '.$checked.$disabled.' />';
                    $input .= '<ins></ins>';
                    $input .= '<p>'.$obj->name.'</p>';
                    if( !$disabled ) {
                        $input .= '</a>';
                    }
                    $input .= '</label>';
                    break;
            }
            return $input;
        }


        // Generate unique input for filter
        public static function generateElseInput($filter, $name, $value, $alias) {
            $check = (isset($filter[$alias]) AND in_array($value, $filter[$alias]));
            $checked = Filter::checked($value, $alias);
            $disabled = (!$check AND !$checked) ? 'disabled' : '';
            $input = '';

            $input .= '<label class="checkBlock" for="'.$alias.$value.'">';
            if( !$disabled ) {
                $input .= '<a href="'.Filter::generateLinkWithFilter($alias, $value).'">';
            }
            $input .= '<input  id="'.$alias.$value.'" value="'.$value.'" type="checkbox" '.$checked.$disabled.' />';
            $input .= '<ins></ins>';
            $input .= '<p>'.$name.'</p>';
            if( !$disabled ) {
                $input .= '</a>';
            }
            $input .= '</label>';

            return $input;
        }


        // Sort link in items list
        public static function setSortLink($sort = NULL, $type = NULL) {
            $arr = explode('?', $_SERVER['REQUEST_URI']);
            $link = $arr[0];
            $_get = explode('&', $arr[1]);
            $get = array();
            foreach( $_get AS $k ) {
                $r = explode('=', $k);
                $get[$r[0]] = $r[1];
            }
            if( isset($get['sort']) ) {
                unset($get['sort']);
            }
            if( isset($get['type']) ) {
                unset($get['type']);
            }
            if( $sort !== NULL ) {
                $get['sort'] = $sort;
                if( $type !== NULL ) {
                    $get['type'] = $type;
                }
            }
            if( count($get) ) {
                $add = array();
                foreach( $get AS $key => $value ) {
                    if( $key && $value ) {
                        $add[] = $key.'='.$value;
                    }
                }
                if( $add ) {
                    $link .= '?'.implode('&', $add);
                }
            }
            return $link;
        }


        // Check if this is current sortable
        public static function isThisSort($sort = NULL, $type = NULL) {
            if( Arr::get($_GET, 'sort') == $sort AND Arr::get($_GET, 'type') == $type ) {
                return 'active';
            }
            return NULL;
        }


        // Link with per page argument
        public static function setPerPageLink($number) {
            $arr = explode('?', $_SERVER['REQUEST_URI']);
            $link = $arr[0];
            $_get = explode('&', $arr[1]);
            $get = array();
            foreach( $_get AS $k ) {
                $r = explode('=', $k);
                $get[$r[0]] = $r[1];
            }
            if( isset($get['per_page']) ) {
                unset($get['per_page']);
            }
            $get['per_page'] = $number;
            $add = array();
            foreach( $get AS $key => $value ) {
                if( $key && $value ) {
                    $add[] = $key.'='.$value;
                }
            }
            if( $add ) {
                $link .= '?'.implode('&', $add);
            }
            return $link;
        }

    }
