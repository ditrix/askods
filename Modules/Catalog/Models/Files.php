<?php
namespace Modules\Catalog\Models;

use Core\QB\DB;
use Core\Common;

class Files extends Common
{
    public static $table = 'catalog_files';
    public static $directory = 'Media/files/catalog';

    /**
     * @param null $itemId
     * @param null $sort
     * @param null $type
     * @param null $limit
     * @param null $offset
     * @param bool $filter
     * @return object
     */
    public static function getITemRows($itemId, $sort = NULL, $type = NULL, $limit = NULL, $offset = NULL, $filter = true) {
        $result = DB::select()->from(static::$table)
            ->where('catalog_id', '=', $itemId);
        if( $filter ) {
            $result = static::setFilter($result);
        }
        if( $sort !== NULL ) {
            if( $type !== NULL ) {
                $result->order_by($sort, $type);
            } else {
                $result->order_by($sort);
            }
        }
        $result->order_by('id', 'DESC');
        if( $limit !== NULL ) {
            $result->limit($limit);
            if( $offset !== NULL ) {
                $result->offset($offset);
            }
        }
        return $result->find_all();
    }
}