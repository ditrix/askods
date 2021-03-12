<?php
namespace Modules\Content\Models;

use Core\QB\DB;

class Content extends \Core\CommonI18n {

    public static $table = 'content';

    public static function getKids($id) {
        static::$tableI18n = static::$table.'_i18n';
        $result = DB::select(
            static::$tableI18n.'.*',
            static::$table.'.*'
        )
            ->from(static::$table)
            ->join(static::$tableI18n, 'LEFT')->on(static::$tableI18n.'.row_id', '=', static::$table.'.id')
            ->where(static::$tableI18n.'.language', '=', \I18n::$lang);
        $result->where(static::$table.'.status', '=', 1);
        $result->where(static::$table.'.parent_id', '=', $id);
        $result->order_by(static::$table.'.sort', 'ASC');
        $result->order_by(static::$table.'.id', 'DESC');
        return $result->find_all();
    }

}