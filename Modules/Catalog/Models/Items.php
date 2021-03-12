<?php
    namespace Modules\Catalog\Models;

    use Core\CommonI18n;
    use Core\Cookie;
    use Core\QB\DB;

// modules/catalog/models/items.php

    class Items extends \Core\CommonI18n {

        public static $table = 'catalog';
        public static $tableImages = 'catalog_images';

        public static function getItemFiles($id)
        {
            $files = [];
            $dbFiles = Files::getItemRows($id);
            foreach($dbFiles as $fileRow) {
                if (is_file(HOST . DS . Files::$directory . DS . $fileRow->file)) {
                    $files[] = $fileRow;
                }
            }
            return $files;
        }

        public static function getItemSubMenu($item)
        {
            $aboutProduct = [
                'alias' => $item->alias,
                'name' => __('О продукте'),
            ];
            $buy = [
                'alias' => 'buy/' . $item->alias,
                'name' => __('Купить страховку'),
            ];
            
            return (object) [(object)$aboutProduct, (object)$buy];
        }

        public static function getRegions()
        {
            return CommonI18n::factory('regions')->getRows('1', 'sort');
        }

        public static function getRegionById($id)
        {
            return DB::select('regions_i18n.*', 'regions.*')
                ->from('regions')
                ->join('regions_i18n')->on('regions_i18n.row_id', '=', 'regions.id')
                ->where('regions_i18n.language', '=', \I18n::$lang)
                ->where('regions.status', '=', 1)
                ->where('regions.id', '=', $id)
                ->find();
        }

        public static function getCitiesByRegion($regionId)
        {
            return DB::select('cities_i18n.*', 'cities.*')
                ->from('cities')
                ->join('cities_i18n')->on('cities_i18n.row_id', '=', 'cities.id')
                ->where('cities_i18n.language', '=', \I18n::$lang)
                ->where('cities.region_id', '=', $regionId)
                ->where('cities.status', '=', 1)
                ->order_by('cities.sort')
                ->find_all();
        }

        public static function getCityById($id)
        {
            return DB::select('cities_i18n.*', 'cities.*')
                ->from('cities')
                ->join('cities_i18n')->on('cities_i18n.row_id', '=', 'cities.id')
                ->where('cities_i18n.language', '=', \I18n::$lang)
                ->where('cities.id', '=', $id)
                ->where('cities.status', '=', 1)
                ->find();
        }

        public static function getQueries($query) {
            $spaces = array('-', '_', '/', '\\', '=', '+', '*', '$', '@', '(', ')', '[', ']', '|', ',', '.', ';', ':', '{', '}');
            $query = str_replace($spaces, ' ', $query);
            $arr = preg_split("/[\s,]+/", $query);
            return $arr;
        }


        public static function getItemsByFlag($flag, $sort = NULL, $type = NULL, $limit = NULL, $offset = NULL) {
            $result = DB::select(static::$table.'.*')
                ->from(static::$table)
                ->where(static::$table.'.'.$flag, '=', 1)
                ->where(static::$table.'.status', '=', 1);
            if( $sort !== NULL ) {
                if( $type !== NULL ) {
                    $result->order_by(static::$table.'.'.$sort, $type);
                } else {
                    $result->order_by(static::$table.'.'.$sort);
                }
            }
            if( $limit !== NULL ) {
                $result->limit($limit);
                if( $offset !== NULL ) {
                    $result->offset($offset);
                }
            }
            return $result->find_all();
        }


        public static function countItemsByFlag($flag) {
            $result = DB::select(array(DB::expr('COUNT('.static::$table.'.id)'), 'count'))
                ->from(static::$table)
                ->where(static::$table.'.'.$flag, '=', 1)
                ->where(static::$table.'.status', '=', 1);
            return $result->count_all();
        }


        public static function addViewed( $id ) {
            $ids = static::getViewedIDs();
            if( !in_array($id, $ids) ) {
                $ids[] = $id;
                Cookie::setArray('viewed', $ids, 60*60*24*30);
            }
            return;
        }


        public static function getViewedIDs() {
            $ids = Cookie::getArray('viewed', array());
            return $ids;
        }


        public static function getViewedItems($sort = NULL, $type = NULL, $limit = NULL, $offset = NULL) {
            $ids = Items::getViewedIDs();
            if( !$ids ) {
                return array();
            }
            $result = DB::select(static::$table.'.*')
                ->from(static::$table)
                ->where(static::$table.'.id', 'IN', $ids)
                ->where(static::$table.'.status', '=', 1);
            if( $sort !== NULL ) {
                if( $type !== NULL ) {
                    $result->order_by(static::$table.'.'.$sort, $type);
                } else {
                    $result->order_by(static::$table.'.'.$sort);
                }
            }
            if( $limit !== NULL ) {
                $result->limit($limit);
                if( $offset !== NULL ) {
                    $result->offset($offset);
                }
            }
            return $result->find_all();
        }


        public static function countViewedItems() {
            $ids = Items::getViewedIDs();
            if( !$ids ) {
                return 0;
            }
            $result = DB::select(array(DB::expr('COUNT('.static::$table.'.id)'), 'count'))
                ->from(static::$table)
                ->where(static::$table.'.id', 'IN', $ids)
                ->where(static::$table.'.status', '=', 1);
            return $result->count_all();
        }
        


        public static function getItemImages($item_id) {
            $result = DB::select('image')
                ->from(static::$tableImages)
                ->where(static::$tableImages.'.catalog_id', '=', $item_id)
                ->order_by(static::$tableImages.'.sort');
            return $result->find_all();
        }


        public static function getItemSpecifications($item_id) {
            $lang = \I18n::$lang;
            $specifications = DB::select(
                'specifications.*', 

                'specifications_i18n.name')
                ->from('specifications')
                ->join('specifications_i18n', 'LEFT')
                ->on('specifications_i18n.row_id', '=', 'specifications.id')
                ->join('catalog_tree_specifications', 'LEFT')
                ->on('catalog_tree_specifications.specification_id', '=', 'specifications.id')
                ->where('specifications.status', '=', 1)
                ->where('specifications_i18n.language', '=', $lang)
                ->order_by('specifications.sort')
                ->find_all();

            $res = DB::select(
                //'catalog_specifications_values.*', 
'catalog_specifications_values.id', 
'catalog_specifications_values.catalog_id',
'catalog_specifications_values.specification_value_alias',
'catalog_specifications_values.specification_alias',



                'specifications_values_i18n.name'

            )
                ->from('catalog_specifications_values')
                ->join('specifications_values', 'LEFT')
                ->on('catalog_specifications_values.specification_value_alias', '=',
                    DB::expr('`specifications_values`.`alias` OR `catalog_specifications_values`.`specification_value_alias` = 1')
                )
                ->join('specifications_values_i18n', 'LEFT')
                ->on('specifications_values_i18n.row_id', '=', 'specifications_values.id')

                ->where('catalog_specifications_values.catalog_id', '=', $item_id)
                ->where('specifications_values.status', '=', 1)
                ->where('specifications_values_i18n.language', '=', $lang)
                ->group_by(
                //    'catalog_specifications_values.id'
'catalog_specifications_values.id', 
'catalog_specifications_values.catalog_id',
'catalog_specifications_values.specification_value_alias',
'catalog_specifications_values.specification_alias',



                'specifications_values_i18n.name'


                )
                ->find_all();

           /* $res = DB::select('')
                ->from('catalog_specifications_values')
                ->join('specifications_values', 'LEFT')
                ->on('catalog_specifications_values.specification_value_alias', '=',
                    DB::expr('`specifications_values`.`alias` OR `catalog_specifications_values`.`specification_value_alias` = 1')
                )
                ->where('catalog_specifications_values.catalog_id', '=', $item_id)
                ->where('status', '=', 1)
                ->group_by('catalog_specifications_values.id')
                ->find_all();*/

            $specValues = array();
            foreach( $res AS $obj ) {
                $specValues[$obj->specification_alias][] = $obj;
            }
            $spec = array();
            foreach ($specifications as $obj) {
                if( isset($specValues[$obj->alias]) AND is_array($specValues[$obj->alias]) AND count($specValues[$obj->alias]) ) {
                    $spec[$obj->id]['field'] = $obj;

                    if( $obj->type_id != 1 ) {
                        foreach($specValues[$obj->alias] AS $o) {
                            $spec[$obj->id]['values'][] = $o;
                        }
                    }
                }
            }
            return $spec;
        }

    }