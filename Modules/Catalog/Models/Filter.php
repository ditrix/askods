<?php
    namespace Modules\Catalog\Models;

    use Core\Arr;
    use Core\HTML;
    use Core\QB\DB;
    use Core\Route;
    use Core\Config;

    class Filter {

        public static $_data;

        public static function getFilteredItemsList($limit, $offset, $sort, $type) {
            if(static::$_data) {
                return static::$_data;
            }
            $filter = Config::get('filter_array');
            $result = DB::select(
                'catalog.id',
                'catalog.cost',
                'catalog.name',
                'catalog.alias',
                'catalog.image',
                'catalog.brand_alias',
                'catalog.model_alias',
                'catalog.available',
                'catalog.specifications'
            )
                ->from('catalog')
                ->where('catalog.status', '=', 1)
                ->where('catalog.parent_id', '=', (int) Route::param('group'));

            if(is_array($filter) && array_key_exists('brand', $filter) && count($filter['brand'])) {
                $result->where('catalog.brand_alias', 'IN', $filter['brand']);
                unset($filter['brand']);
            }
            if(is_array($filter) && array_key_exists('model', $filter) && count($filter['model'])) {
                $result->where('catalog.model_alias', 'IN', $filter['model']);
                unset($filter['model']);
            }
            if(is_array($filter) && array_key_exists('max_cost', $filter) && count($filter['max_cost']) && (int) $filter['max_cost'][0] > 0) {
                $result->where('catalog.cost', '<=', (int) $filter['max_cost'][0]);
                unset($filter['max_cost']);
            }
            if(is_array($filter) && array_key_exists('min_cost', $filter) && count($filter['min_cost']) && (int) $filter['min_cost'][0] >= 0) {
                $result->where('catalog.cost', '>=', (int) $filter['min_cost'][0]);
                unset($filter['min_cost']);
            }
            if(is_array($filter) && array_key_exists('available', $filter) && count($filter['available'])) {
                $result->where('catalog.available', 'IN', $filter['available']);
                unset($filter['available']);
            }

            if(is_array($filter) && count($filter)) {
                $result
                    ->select(DB::expr('COUNT(DISTINCT catalog_specifications_values.specification_alias) AS cList'))
                    ->join('catalog_specifications_values')->on('catalog_specifications_values.catalog_id', '=', 'catalog.id');
                $result->and_where_open();

                foreach($filter as $key => $val) {
                    $result
                        ->or_where_open()
                            ->where('catalog_specifications_values.specification_alias', '=', $key)
                            ->where('catalog_specifications_values.specification_value_alias', 'IN', $val)
                        ->or_where_close();
                }

                $result->and_where_close();
                $result->having('cList', '=', count($filter));
            }
            $result = $result->group_by('catalog.id')
                ->order_by('catalog.available', 'ASC')
                ->order_by('catalog.'.$sort, $type)
                ->find_all();

            static::$_data = $result;

            $items = array();
            for($i = $offset; $i < $limit + $offset; $i++) {
                if(!isset($result[$i])) {
                    break;
                }
                $items[] = $result[$i];
            }

            return array(
                'items' => $items,
                'total' => sizeof($result),
            );
        }


        // Get clickable filters and min/max costs, included current
        public static function getClickableFilterElements() {
            $filter = Config::get('filter_array');
            /*$result = DB::select(
                'catalog.cost',
                'catalog.brand_alias',
                'catalog.model_alias',
                'catalog.available',
                'catalog.id'
            )
                ->from('catalog')
                ->where('catalog.status', '=', 1)
                ->where('catalog.parent_id', '=', (int) Route::param('group'));

            $result = $result->group_by('catalog.id')->find_all();

            $params = array();
            $costs = array();
            $sortable = Config::get('sortable');
            $items = array();

            $ids = array();
            foreach($result AS $key => $value) {
                $ids[] = $value->id;
                $costs[] = $value->cost;
                $items[$value->id]['cost'][] = $value->cost;
                if($value->brand_alias) {
                    $items[$value->id]['brand'][] = $value->brand_alias;
                }
                if($value->model_alias) {
                    $items[$value->id]['model'][] = $value->model_alias;
                }
                $items[$value->id]['available'][] = $value->available;
            }

            $result = array();
            if(count($ids)) {
                $result = DB::select('csv.catalog_id', 'csv.specification_alias', 'csv.specification_value_alias')
                    ->from(array('catalog_specifications_values', 'csv'))
                    ->where('csv.catalog_id', 'IN', $ids)
                    ->find_all();
            }

            foreach($result AS $key => $value) {
                $items[$value->catalog_id][$value->specification_alias][] = $value->specification_value_alias;
            }*/

            $params = array();
            $costs = array();
            $sortable = Config::get('sortable');
            $items = array();

            $result = self::$_data;
            foreach($result AS $value) {
                $costs[] = $value->cost;
                if(!array_key_exists($value->id, $items)) {
                    $items[$value->id] = array();
                }
                $items[$value->id]['cost'][] = $value->cost;
                if($value->brand_alias) {
                    $items[$value->id]['brand'][] = $value->brand_alias;
                }
                if($value->model_alias) {
                    $items[$value->id]['model'][] = $value->model_alias;
                }
                $items[$value->id]['available'][] = $value->available;

                $specifications = json_decode($value->specifications, true);
                foreach($specifications AS $s => $v) {
                    if(!array_key_exists($s, $items[$value->id])) {
                        $items[$value->id][$s] = array();
                    }
                    if(is_array($v)) {
                        $items[$value->id][$s] = array_merge($items[$value->id][$s], $v);
                    } else {
                        $items[$value->id][$s][] = $v;
                    }
                }
            }

            foreach ($items as $item) {
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
                            if($filtered) {
                                break;
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
                ->join('catalog')->on('catalog.brand_alias', '=', 'brands.alias')
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
            if(!isset($filter['brand']) || !is_array($filter['brand']) || !isset($filter['brand'][0])) {
                return array();
            }
            return DB::select('models.name', 'models.alias', 'models.id')
                ->from('models')
                ->join('catalog')->on('catalog.model_alias', '=', 'models.alias')
                ->join('brands')->on('brands.alias', '=', 'catalog.brand_alias')
                ->where('brands.status', '=', 1)
                ->where('catalog.status', '=', 1)
                ->where('models.status', '=', 1)
                ->where('brands.alias', 'IN', $filter['brand'])
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
                ->join('catalog_specifications_values')
                    ->on('catalog_specifications_values.specification_value_alias', '=', 'specifications_values.alias')
                ->join('specifications')
                    ->on('specifications.alias', '=', 'catalog_specifications_values.specification_alias')
                ->join('catalog')
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


        // Set to memory filter as array
        public static function setFilterParameters() {
            if(!Route::param('filter')) { return false; }
            $fil    = Route::param('filter');
            $fil    = explode("&", $fil);
            $filter = array();
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
            $value = (string) $value;
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
            if( is_array($filter) && isset($filter[$key]) ) {
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
                if( isset($array[$tpl]) AND !empty($array[$tpl]) AND !(count($array[$tpl]) == 1 AND trim((string) end($array[$tpl])) == "") ) {
                    $filter[$tpl] = $array[$tpl];
                    sort($filter[$tpl]);
                    reset($filter[$tpl]);
                }
            }
            return $filter;
        }

    }