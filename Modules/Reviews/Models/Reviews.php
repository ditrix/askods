<?php
namespace Modules\Reviews\Models;

use Core\Common;
use Core\QB\DB;

class Reviews extends \Core\Common
{
    public static $table = 'reviews';

        public static function getRows($status = NULL) {
            $result = DB::select()->from(static::$table);
            if( $status !== NULL ) {
                $result->where(static::$table.'.status', '=', $status);
            }

            $result->order_by('id', 'DESC');
    
        
            return $result->find_all();
        }    
}