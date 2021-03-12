<?php
namespace Modules\Catalog\Models;

use Core\QB\DB;

class Groups extends \Core\CommonI18n
{

    public static $table = 'catalog_tree';


    public static function getInnerGroups($parent_id, $sort = NULL, $type = NULL, $limit = NULL, $offset = NULL)
    {
        $lang = \I18n::$lang;
        static::$tableI18n = static::$table.'_i18n';
        $result = DB::select(static::$tableI18n.'.*', static::$table.'.*')
            ->from(static::$table)
            ->join(static::$tableI18n, 'LEFT')->on(static::$tableI18n.'.row_id', '=', static::$table.'.id')
            ->where(static::$tableI18n.'.language', '=', $lang)
            ->where(static::$table . '.parent_id', '=', $parent_id)
            ->where(static::$table . '.status', '=', 1);
        if ($sort !== NULL) {
            if ($type !== NULL) {
                $result->order_by(static::$table . '.' . $sort, $type);
            } else {
                $result->order_by(static::$table . '.' . $sort);
            }
        }
        if ($limit !== NULL) {
            $result->limit($limit);
            if ($offset !== NULL) {
                $result->offset($offset);
            }
        }
        return $result->find_all();
    }


    public static function countInnerGroups($parent_id)
    {
        $result = DB::select(array(DB::expr('COUNT(' . static::$table . '.id)'), 'count'))
            ->from(static::$table)
            ->where(static::$table . '.parent_id', '=', $parent_id)
            ->where(static::$table . '.status', '=', 1);
        return $result->count_all();
    }

    public static function getRowsByFlag($flagName, $flagValue, $status = null, $sort = null, $typeSort = null)
    {
        $lang = \I18n::$lang;
        static::$tableI18n = static::$table.'_i18n';
        $result = DB::select(static::$tableI18n.'.*', static::$table.'.*')
            ->from(static::$table)
            ->join(static::$tableI18n, 'LEFT')->on(static::$tableI18n.'.row_id', '=', static::$table.'.id')
            ->where(static::$tableI18n.'.language', '=', $lang)
            ->where($flagName, '=', $flagValue);
        if ($status !== null) {
            $result->where(static::$table.'.status', '=', $status);
        }
        if ($sort !== null) {
            if ($typeSort !== null) {
                $result->order_by($sort, $typeSort);
            } else {
                $result->order_by($sort);
            }
        }
        return $result->find_all();
    }

}