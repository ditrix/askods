<?php
namespace Modules\Gallery\Models;

use Core\QB\DB;
use Core\Common;

class LicenseImages extends Common
{
    public static $table = 'licenses_images';

    /**
     * @param integer $parentId
     * @param null /string $sort
     * @param null /string $type - ASC or DESC. No $sort - no $type
     * @param null /integer $limit
     * @param null /integer $offset - no $limit - no $offset
     * @return object
     */
    public static function getRowsByParentId($parentId, $sort = NULL, $type = NULL, $limit = NULL, $offset = NULL)
    {
        $result = DB::select()->from(static::$table)
            ->where(static::$table . '.gallery_id', '=', (int)$parentId);

        if ($sort !== NULL) {
            if ($type !== NULL) {
                $result->order_by($sort, $type);
            } else {
                $result->order_by($sort);
            }
        }
        $result->order_by('id', 'DESC');
        if ($limit !== NULL) {
            $result->limit($limit);
            if ($offset !== NULL) {
                $result->offset($offset);
            }
        }
        return $result->find_all();
    }

    /**
     * @param integer $parentId
     *
     * @return int
     */
    public static function countRowsByParentId($parentId)
    {
        $result = DB::select(array(DB::expr('COUNT(' . static::$table . '.id)'), 'count'))
            ->from(static::$table)
            ->where(static::$table . '.gallery_id', '=', (int)$parentId);
       
        return $result->count_all();
    }
}