<?php
namespace Modules\Ajax\Controllers;

use Core\Arr;
use Core\GeoIP;
use Core\QB\DB;
use Core\Widgets;
use Modules\Ajax;
use Modules\Catalog\Models\Groups;

class Popup extends \Modules\Ajax
{
    function before()
    {
        parent::before();
        $lang = Arr::get( $this->post, 'lang' );
        if($lang){
            \I18n::lang($lang);
        } else{
            $this->error(__('Сообщение о языке'));
        }
        // Check for bans in blacklist
        $ip = GeoIP::ip();
        $ips = array();
        $ips[] = $ip;
        $ips[] = $this->ip($ip, array(0));
        $ips[] = $this->ip($ip, array(1));
        $ips[] = $this->ip($ip, array(1, 0));
        $ips[] = $this->ip($ip, array(2));
        $ips[] = $this->ip($ip, array(2, 1));
        $ips[] = $this->ip($ip, array(2, 1, 0));
        $ips[] = $this->ip($ip, array(3));
        $ips[] = $this->ip($ip, array(3, 2));
        $ips[] = $this->ip($ip, array(3, 2, 1));
        $ips[] = $this->ip($ip, array(3, 2, 1, 0));
        if (count($ips)) {
            $bans = DB::select('date')
                ->from('blacklist')
                ->where('status', '=', 1)
                ->where('ip', 'IN', $ips)
                ->and_where_open()
                ->or_where('date', '>', time())
                ->or_where('date', '=', NULL)
                ->and_where_close()
                ->find_all();
            if (sizeof($bans)) {
                $this->error('К сожалению это действие недоступно, т.к. администратор ограничил доступ к сайту с Вашего IP адреса!');
            }
        }
    }
    protected $post;
    protected $files;



    public function insuredEventAction()
    {
        echo Widgets::get('Popup_InsuredEvent');
    }

    public function respondToJobAction()
    {
        echo Widgets::get('Popup_respondToJob', ['vacancyId' => Arr::get($this->post, 'vacancy_id')]);
    }

    public function askQuestionAction()
    {
      //  echo Widgets::get('Popup_askQuestion', ['vacancyId' => Arr::get($this->post, 'vacancy_id')]);
 //echo Widgets::get('Popup_respondToJob', ['vacancyId' => Arr::get($this->post, 'vacancy_id')]);
        echo Widgets::get('Popup_askQuestion', [Arr::get($this->post,0)]);
        //echo Widgets::get('Popup_askQuestion',[Arr::get($this->post),4]);

    }    
    
    public function sendReviewAction(){
        echo Widgets::get('Popup_sendReview', [Arr::get($this->post,0)]);
    }
    
    public function categoryIntroAction()
    {
        $obj = Groups::getRowSimple(Arr::get($this->post, 'catalog_tree_id'), 'id', 1);
        if (!$obj) {
            echo 'Ошибка поиска информации!';
            return false;
        }

        echo Widgets::get('Popup_CategoryIntro', ['obj' => $obj]);
    }



    private function ip($ip, $arr)
    {
        $_ip = explode('.', $ip);
        foreach ($arr AS $pos) {
            $_ip[$pos] = 'x';
        }
        $ip = implode('.', $_ip);
        return $ip;
    }

    function after()
    {
        die();
    }

}