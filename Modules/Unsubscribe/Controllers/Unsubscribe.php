<?php
    namespace Modules\Unsubscribe\Controllers;

    use Core\Common;
    use Core\Route;
    use Core\HTTP;
    use Core\Message;

    class Unsubscribe extends \Modules\Base {

        public function indexAction() {
            $model = Common::factory('subscribers');
            $subscriber = $model->getRow(Route::param('hash'), 'hash', 1);
            if( !$subscriber ) {
                Message::GetMessage(0, 'Вы не подписаны на рассылку с нашего сайта!');
                HTTP::redirect('/');
            }
            $model->update(array('status' => 0), $subscriber->id);
            Message::GetMessage(1, 'Вы успешно отписались от рассылки новостей с нашего сайта!');
            HTTP::redirect('/');
        }

    }