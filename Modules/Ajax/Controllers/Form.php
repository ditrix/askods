<?php
    namespace Modules\Ajax\Controllers;

    use Core\CommonI18n;
    use Core\GeoIP;
    use Core\QB\DB;
    use Core\Arr;
    use Core\User;
    use Core\Config AS conf;
    use Core\View;
    use Core\System;
    use Modules\Cart\Models\Cart;
    use Core\Log;
    use Core\Email;
    use Core\Message;
    use Core\Common;
    use Modules\Catalog\Models\Items;
    use Modules\Vacancy\Models\Vacancy;

    const EMAIL_PROGRAMMER = 'voloshin@askods.dn.ua';
    const EMAIL_SALE = 'sale@askods.dn.ua';
    const EMAIL_HR = 'ok@askods.dn.ua';
    const EMAIL_MARKETING = 'marketing@askods.dn.ua';
    const EMAIL_KOMISSAR  = 'bay@askods.dn.ua';
     const EMAIL_KOMISSAR_2  = 'avk3@askods.dn.ua';

    class Form extends \Modules\Ajax {

        protected $post;
        protected $files;

        function before() {
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
            $ips[] = $this->ip($ip, array(1,0));
            $ips[] = $this->ip($ip, array(2));
            $ips[] = $this->ip($ip, array(2,1));
            $ips[] = $this->ip($ip, array(2,1,0));
            $ips[] = $this->ip($ip, array(3));
            $ips[] = $this->ip($ip, array(3,2));
            $ips[] = $this->ip($ip, array(3,2,1));
            $ips[] = $this->ip($ip, array(3,2,1,0));
            if( count($ips) ) {
                $bans = DB::select('date')
                    ->from('blacklist')
                    ->where('status', '=', 1)
                    ->where('ip', 'IN', $ips)
                    ->and_where_open()
                        ->or_where('date', '>', time())
                        ->or_where('date', '=', NULL)
                    ->and_where_close()
                    ->find_all();
                if(sizeof($bans)) {
                    $this->error(__('К сожалению это действие недоступно, т.к. администратор ограничил доступ к сайту с Вашего IP адреса!'));
                }
            }
        }
        private function ip($ip, $arr) {
            $_ip = explode('.', $ip);
            foreach($arr AS $pos) {
                $_ip[$pos] = 'x';
            }
            $ip = implode('.', $_ip);
            return $ip;
        }
        
        public function orderItemAction(){
            // Check incoming data
            $itemId = (int)trim(Arr::get($this->post, 'item-id'));
            if (!$itemId OR !($item = Items::getRow($itemId, 'id', 1))) {
                $this->error(__('Страховка не найдена!'));
            }
            $name = Arr::get( $this->post, 'name' );
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error(__('Укажите Ваше имя!'));
            }
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->error(__('E-mail введен не верно!'));
            }
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+38\d{10}$/', $phone, $matches) ) {
                $this->error(__('Номер телефона введен неверно!'));
            }
            $regionId = (int)Arr::get($this->post, 'region');
            if (!$regionId OR !($region = Items::getRegionById($regionId))) {
                $this->error(__('Вы не указали область!'));
            }
            $cityId = (int)Arr::get($this->post, 'city');
            if (!$cityId OR !($city = Items::getCityById($cityId))) {
                $this->error(__('Вы не указали город!'));
            }
            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('COUNT(insurance_orders.id)'), 'count'))
                        ->from('insurance_orders')
                        ->where('ip', '=', $ip)
                        ->where('created_at', '>', time() - 30)
                        ->count_all();

		$more_email_boss = 'mirolese@askods.dn.ua';
		$more_email_programmer = 'dmvoloshin@gmail.com';		
			

		// добаивть информацию о заказе. название продукта
			$product_info = '';	
			switch($itemId){
				case 162: $product_info = ''; break;
				case 161: $product_info = 'Жилье «Эконом Плюс»'; break;
				case 160: $product_info = 'Жилье «Эконом»'; break;
				case 157: $product_info = 'КАСКО '; break;
				case 159: $product_info = 'ОСГПО'; break;
				case 163: $product_info = 'Автопакет'; break;
			}
				
				
            // Dynamic fields
            $allSpecifications = Items::getItemSpecifications($itemId);
            $dynamicFields = (array)Arr::get($this->post, 'FIELDS');
            $additionalFormFields = [];
            foreach($allSpecifications as $row) {
                $field = Arr::get($row, 'field');
                $values = Arr::get($row, 'values');
                if ($field->type_id == 1) {
                    if (!($value = trim(Arr::get($dynamicFields, $field->alias)))) {
                        $this->error(sprintf(__('Поле %s не может быть пустым!'), $field->name));
                    }
                    $additionalFormFields[] = ['name' => $field->name, 'value' => $value];
                } else {
                    if (!($value = trim(Arr::get($dynamicFields, $field->alias)))) {
                        $this->error(sprintf(__('Вы не выбрали вариант для %s!'), $field->name));
                    }
                    
                    foreach ($values as $dbValue) {
                        if ($dbValue->specification_value_alias == $value) {
                            $additionalFormFields[] = ['name' => $field->name, 'value' => $dbValue->name];
                        }
                    }
                }
            }
//
            // Create order
            $data = array();
            $data['status'] = 0;
            $data['ip'] = $ip;
            $data['name'] = $product_info.': '.$name;
            $data['phone'] = $phone;
            $data['email'] = $email;
            $data['region'] = $region->name;
            $data['city'] = $city->name;
            $data['created_at'] = time();

            $order_id = DB::insert('insurance_orders', array_keys($data))->values(array_values($data))->execute();
            if( !$order_id ) {
                $this->error(__('К сожалению, сохранить форму не удалось. Пожалуйста повторите попытку через несколько секунд'));
            }
            $order_id = Arr::get($order_id, 0);
            // Save additional fields to DB

            foreach ($additionalFormFields as $row) {
                $fieldData = [
                    'order_id' => $order_id,
                    'name' => $row['name'],
                    'value' => $row['value'],
                ];

                DB::insert('insurance_orders_fields', array_keys($fieldData))->values(array_values($fieldData))->execute();
            }

            // Create links
            $link_admin = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/wezom/insurance/edit/' . $order_id;

            // Save log
            $qName = 'Новый заказ';
            $url = '/wezom/insurance/edit/' . $order_id;
            Log::add( $qName, $url, 8 );

            // Send message to admin if need
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(11, 'id', 1);
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 11)->where('status', '=', 1)->find();
            if( $mail ) {
                $fields = [
                    '{{site}}' => Arr::get( $_SERVER, 'HTTP_HOST' ),
                    '{{ip}}' => $ip,
                    '{{date}}' => date('d.m.Y H:i'),
                    '{{name}}' => $name,
                    '{{phone}}' => $phone,
                    '{{email}}' => $email,
                    '{{region}}' => $region->name,
                    '{{city}}' => $city->name,
                    '{{link_admin}}' => $link_admin,
                    '{{form_fields}}' => View::tpl(['result' => $additionalFormFields], 'BuyInsurance/OrderFields'),
                ];

                $subject = str_replace(array_keys($fields), array_values($fields), $mail->subject);
                $text = str_replace(array_keys($fields), array_values($fields), $mail->text);
                Email::send( 'заказ полиса '.$product_info.' : '.$subject, 'заказ полиса '.$product_info.' : '. $text );
                Email::send( 'заказ полиса '.$product_info.' : '.$subject, 'заказ полиса '.$product_info.' : '. $text,EMAIL_SALE );
                Email::send( 'заказ полиса '.$product_info.' : '.$subject, 'заказ полиса '.$product_info.' : '. $text,EMAIL_MARKETING );
                Email::send( 'заказ полиса '.$product_info.' : '.$subject, 'заказ полиса '.$product_info.' : '. $text,EMAIL_PROGRAMMER );
                Email::send( 'заказ полиса '.$product_info.' : '.$subject, 'заказ полиса '.$product_info.' : '. $text,EMAIL_POGRAMMER_2 );
            }

            // Set message and reload page
            $this->answer(['response' => __('Вы успешно отправили форму! Спасибо за то, что Вы с нами.'), 'reload' => true, 'success' => true]);
        }
        

        // Ask a question about item
        public function questionAction() {
            // Check incomming data
            $id = Arr::get( $this->post, 'id' );
            if( !$id ) {
                $this->error('Такой товар не существует!');
            }
            $item = DB::select('alias', 'name', 'id')->from('catalog')->where('status', '=', 1)->where('id', '=', $id)->as_object()->execute()->current();
            if( !$item ) {
                $this->error('Такой товар не существует!');
            }
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $text = trim( strip_tags( Arr::get( $this->post, 'text' ) ) );
            if( !$text OR mb_strlen($text, 'UTF-8') < 5 ) {
                $this->error('Слишком короткий вопрос! Нужно хотя бы 5 символов');
            }
            $name = trim( strip_tags( Arr::get( $this->post, 'name' ) ) );
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error('Слишком короткое имя! Нужно хотя бы 2 символов');
            }

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('catalog_questions.id'), 'count'))
                ->from('catalog_questions')
                ->where('ip', '=', $ip)
                ->where('catalog_id', '=', $id)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Вы только что задали вопрос по этому товару! Пожалуйста, повторите попытку через минуту');
            }

            // All ok. Save data
            $keys = array('ip', 'name', 'email', 'text', 'catalog_id', 'created_at');
            $values = array($ip, $name, $email, $text, $item->id, time());
            $lastID = DB::insert('catalog_questions', $keys)->values($values)->execute();
            $lastID = Arr::get($lastID, 0);

            // Create links
            $link = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/' . $item->alias.'/p'.$item->id;
            $link_admin = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/wezom/catalog/edit/' . $item->id;

            // Save log
            $qName = 'Вопрос о товаре';
            $url = '/wezom/questions/edit/' . $lastID;
            Log::add( $qName, $url, 5 );

            // Send message to admin if need
            $mail = DB::select()->from('mail_templates')->where('id', '=', 9)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{question}}', '{{name}}', '{{email}}', '{{link}}', '{{admin_link}}', '{{item_name}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $text, $name, $email, $link, $link_admin, $item->name,
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
            }

            // Send message to user if need
            $mail = DB::select()->from('mail_templates')->where('id', '=', 10)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{question}}', '{{name}}', '{{email}}', '{{link}}', '{{admin_link}}', '{{item_name}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $text, $name, $email, $link, $link_admin, $item->name,
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text, $email );
            }

            $this->success('Вы успешно задали вопрос! Администратор ответит Вам в ближайшее время');
        }


        // Simple order by phone number
        public function order_simpleAction(){
            // Check incomming data
            $id = Arr::get( $this->post, 'id' );
            if( !$id ) {
                $this->error('Такой товар не существует!');
            }
            $item = DB::select('alias', 'name', 'id')->from('catalog')->where('status', '=', 1)->where('id', '=', $id)->as_object()->execute()->current();
            if( !$item ) {
                $this->error('Такой товар не существует!');
            }
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+38 \(\d{3}\) \d{3}\-\d{2}\-\d{2}$/', $phone, $matches) ) {
                $this->error('Номер телефона введен неверно!');
            }

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('orders_simple.id'), 'count'))
                ->from('orders_simple')
                ->where('ip', '=', $ip)
                ->where('catalog_id', '=', $id)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Вы только что заказали этот товар! Пожалуйста, повторите попытку через минуту');
            }

            // All ok. Save data
            $keys = array('ip', 'phone', 'catalog_id', 'user_id', 'created_at');
            $values = array($ip, $phone, $item->id, User::info() ? User::info()->id : 0, time());
            $lastID = DB::insert('orders_simple', $keys)->values($values)->execute();
            $lastID = Arr::get($lastID, 0);

            // Create links
            $link = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/'.$item->alias.'/p'.$item->id;
            $link_admin = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/wezom/catalog/edit/'.$item->id;

            // Save log
            $qName = 'Заказ в один клик';
            $url = '/wezom/simple/edit/' . $lastID;
            Log::add( $qName, $url, 7 );

            // Send message to admin if need
            $mail = DB::select()->from('mail_templates')->where('id', '=', 8)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{phone}}', '{{link}}', '{{admin_link}}', '{{item_name}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $phone, $link, $link_admin, $item->name,
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
            }

            $this->success('Вы успешно оформили заказ в один клик! Оператор свяжется с Вами в скором времени');
        }


        // Add comment for item
        public function add_commentAction() {
            // Check incomming data
            $id = Arr::get( $this->post, 'id' );
            if( !$id ) {
                $this->error('Такой товар не существует!');
            }
            $item = DB::select('alias', 'name', 'id')->from('catalog')->where('status', '=', 1)->where('id', '=', $id)->as_object()->execute()->current();
            if( !$item ) {
                $this->error('Такой товар не существует!');
            }
            $name = Arr::get( $this->post, 'name' );
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error('Введено некорректное имя!');
            }
            $city = Arr::get( $this->post, 'city' );
            if( !$city OR mb_strlen($city, 'UTF-8') < 2 ) {
                $this->error('Введено некорректное название города!');
            }
            $text = trim( strip_tags( Arr::get( $this->post, 'text' ) ) );
            if( !$text OR mb_strlen($text, 'UTF-8') < 5 ) {
                $this->error('Слишком короткий коментарий! Нужно хотя бы 5 символов');
            }

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('catalog_comments.id'), 'count'))
                ->from('catalog_comments')
                ->where('ip', '=', $ip)
                ->where('catalog_id', '=', $id)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Вы только что оставили отзыв об этом товаре! Пожалуйста, повторите попытку через минуту');
            }

            // All ok. Save data
            $keys = array('date', 'ip', 'name', 'city', 'text', 'catalog_id', 'created_at');
            $values = array(time(), $ip, $name, $city, $text, $item->id, time());
            $lastID = DB::insert('catalog_comments', $keys)->values($values)->execute();
            $lastID = Arr::get($lastID, 0);

            // Create links
            $link = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/'. $item->alias.'/p'.$item->id;
            $link_admin = 'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/wezom/catalog/edit/' . $item->id;

            // Save log
            $qName = 'Отзыв к товару';
            $url = '/wezom/comments/edit/' . $lastID;
            Log::add( $qName, $url, 6 );

            // Send message to admin if need
            $mail = DB::select()->from('mail_templates')->where('id', '=', 7)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}', '{{city}}', '{{text}}', '{{link}}', '{{admin_link}}', '{{item_name}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $name, $city, $text, $link, $link_admin, $item->name,
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
            }

            $this->success('Вы успешно оставили отзыв о товаре. Он отобразится на сайте после проверки администратором');
        }


        // User authorization
        public function loginAction() {
            $email = Arr::get( $this->post, 'email' );
            $password = Arr::get( $this->post, 'password' );
            $remember = Arr::get( $this->post, 'remember' );
            if (!$password) {
                $this->error('Вы не ввели пароль!');
            }
            // Check user for existance and ban
            $user = User::factory()->get_user_by_email( $email, $password );
            if( !$user ) {
                $this->error('Вы допустили ошибку в логине и/или пароле!');
            }
            if( !$user->status ) {
                $this->error('Пользователь с указанным E-Mail адресом либо заблокирован либо не активирован. Пожалуйста обратитесь к Администратору для решения сложившейся ситуации' );
            }

            // Authorization of the user
            DB::update('users')->set(array('last_login' => time(), 'logins' => (int) $user->logins + 1, 'updated_at' => time()))->where('id', '=', $user->id)->execute();
            User::factory()->auth( $user, $remember );
            Message::GetMessage(1, 'Вы успешно авторизовались на сайте!', 3500);
            $this->success( array('redirect' => '/account', 'noclear' => 1) );
        }


        // User wants to edit some information
        public function edit_profileAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error('Введенное имя слишком короткое!');
            }
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $check = DB::select(array(DB::expr('COUNT(users.id)'), 'count'))
                ->from('users')
                ->where('email', '=', $email)
                ->where('id', '!=', User::info()->id)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Пользователь с указанным E-Mail адресом уже зарегистрирован!');
            }
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+38 \(\d{3}\) \d{3}\-\d{2}\-\d{2}$/', $phone, $matches) ) {
                $this->error('Номер телефона введен неверно!');
            }
            // Save new users data
            DB::update('users')->set(array('name' => $name, 'email' => $email, 'phone' => $phone, 'updated_at' => time()))->where('id', '=', User::info()->id)->execute();
            Message::GetMessage(1, 'Вы успешно изменили свои данные!', 3500);
            $this->success( array('redirect' => '/account/profile') );
        }


        // Change password
        public function change_passwordAction(){
            // Check incoming data
            $oldPassword = Arr::get($this->post, 'old_password');
            if( !User::factory()->check_password($oldPassword, User::info()->password) ) {
                $this->error('Старый пароль введен неверно!');
            }
            $password = trim(Arr::get($this->post, 'password'));
            if( mb_strlen($password, 'UTF-8') < conf::get('main.password_min_length') ) {
                $this->error('Пароль не может быть короче '.conf::get('main.password_min_length').' символов!');
            }
            if( User::factory()->check_password($password, User::info()->password) ) {
                $this->error('Нельзя поменять пароль на точно такой же!');
            }
            $confirm = trim(Arr::get($this->post, 'confirm'));
            if( $password != $confirm ) {
                $this->error('Поля "Новый пароль" и "Подтвердите новый пароль" должны совпадать!');
            }

            // Change password for new
            User::factory()->update_password(User::info()->id, $password);

            // Send email to user with new data
            $mail = DB::select()->from('mail_templates')->where('id', '=', 6)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{password}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), System::getRealIP(), date('d.m.Y H:i'),
                    $password
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text, User::info()->email );
            }

            $this->success( 'На указанный E-Mail адрес высланы новые данные для входа' );
        }


        // User registration
        public function registrationAction() {
            // Check incoming data
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $user = DB::select()->from('users')->where('email', '=', $email)->as_object()->execute()->current();
            if( $user ) {
                if ( $user->status ) {
                    $this->error('Пользователь с указанным E-Mail адресом уже зарегистрирован!');
                }
                $this->error('Пользователь с указанным E-Mail адресом уже зарегистрирован, но либо заблокирован либо не подтвердил свой E-Mail адрес. Пожалуйста обратитесь к Администратору для решения сложившейся ситуации');
            }
            $password = trim( Arr::get( $this->post, 'password' ) );
            if ( mb_strlen($password, 'UTF-8') < conf::get('main.password_min_length') ) {
                $this->error('Пароль не может содержать меньше '.conf::get('main.password_min_length').' символов!');
            }
            $agree = Arr::get( $this->post, 'agree' );
            if( !$agree ) {
                $this->error('Вы должны принять условия соглашения для регистрации на нашем сайте!');
            }

            // Create user data
            $data = array(
                'email' => $email,
                'password' => $password,
                'ip' => System::getRealIP(),
            );

            // Create user. Then send an email to user with confirmation link or authorize him to site
            $mail = DB::select()->from('mail_templates')->where('id', '=', 4)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                // Creating of the new user and set his status to zero. He need to confirm his email
                $data['status'] = 0;
                User::factory()->registration($data);
                $user = DB::select()->from('users')->where('email', '=', $email)->as_object()->execute()->current();

                // Save log
                $qName = 'Регистрация пользователя, требующая подтверждения';
                $url = '/wezom/users/edit/' . $user->id;
                Log::add( $qName, $url, 1 );

                // Sending letter to email
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{link}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), Arr::get( $data, 'ip' ), date('d.m.Y'),
                    'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/account/confirm/hash/' . $user->hash,
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text, $user->email );

                // Inform user if mail is sended
                $this->success('Вам отправлено письмо подтверждения со ссылкой, кликнув по которой, Вы подтвердите свой адрес и будете автоматически авторизованы на сайте.');
            } else {
                // Creating of the new user and set his status to 1. He must be redirected to his cabinet
                $data['status'] = 1;
                User::factory()->registration($data);
                $user = DB::select()->from('users')->where('email', '=', $email)->as_object()->execute()->current();

                // Save log
                $qName = 'Регистрация пользователя';
                $url = '/wezom/users/edit/' . $user->id;
                Log::add( $qName, $url, 1 );

                $mail = Common::factory('mail_templates')->getRow(13, 'id', 1);
                if( $mail ) {
                    // Sending letter to email
                    $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{email}}', '{{password}}', '{{name}}' );
                    $to = array(
                        Arr::get( $_SERVER, 'HTTP_HOST' ), Arr::get( $data, 'ip' ), date('d.m.Y'),
                        $user->email, $password, $user->name
                    );
                    $subject = str_replace($from, $to, $mail->subject);
                    $text = str_replace($from, $to, $mail->text);
                    Email::send( $subject, $text, Arr::get($data, 'email') );
                }

                // Authorization of the user
                User::factory()->auth( $user, 0 );
                Message::GetMessage(1, 'Вы успешно зарегистрировались на сайте! Пожалуйста укажите остальную информацию о себе в личном кабинете для того, что бы мы могли обращаться к Вам по имени', 5000);
                $this->success( array('redirect' => '/account') );
            }
        }


        // Forgot password
        public function forgot_passwordAction() {
            // Check incoming data
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $user = Common::factory('users')->getRow($email, 'email');
            if( !$user ) {
                $this->error('Пользователя с указанным E-Mail адресом не существует!');
            }
            if ( !$user->status ) {
                $this->error('Пользователь с указанным E-Mail адресом либо заблокирован либо не подтвердил E-Mail адрес. Пожалуйста обратитесь к Администратору для решения сложившейся ситуации');
            }

            // Generate new password for user and save it to his account
            $password = User::factory()->generate_random_password();
            User::factory()->update_password($user->id, $password);

            // Send E-Mail to user with instructions how recover password
            $mail = DB::select()->from('mail_templates')->where('id', '=', 5)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{password}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), System::getRealIP(), date('d.m.Y H:i'),
                    $password
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text, $user->email );
            }

            $this->success( 'На указанный E-Mail адрес выслан новый пароль для входа' );
            // $this->success(array('password' => $password));
        }


        // Send callback
        public function callbackAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error(__('Имя введено неверно!'));
            }
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error(__('Вы неверно ввели E-Mail!'));
            }
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+380\d{9,10}$/', $phone, $matches) ) {
                $this->error(__('Номер телефона введен неверно!'));
            }
            $message = trim( strip_tags( Arr::get( $this->post, 'message' ) ) );
            $pageName = Arr::get($this->post, 'page_name');

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('COUNT(callback.id)'), 'count'))
                ->from('callback')
                ->where('ip', '=', $ip)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error(__('Нельзя так часто отсылать заявку! Пожалуйста, повторите попытку через минуту'));
            }
            
            $polis = trim(Arr::get($this->post, 'polis'));

            // Save callback
            $data = [
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'message' => $message,
                'polis' => $polis,
                'page_name' => $pageName,
                'ip' => $ip,
                'status' => 0,
                'created_at' => time(),
            ];
            
            $lastID = DB::insert('callback', array_keys($data))->values(array_values($data))->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Заявка о страховом случае';
            $url = '/wezom/callback/edit/' . $lastID;
            Log::add( $qName, $url, 3 );

            // Send E-Mail to admin
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(3, 'id', 1);
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 3)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}', '{{email}}', '{{phone}}', '{{polis}}' ,'{{message}}', '{{page_name}}');
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $name, $email, $phone, $polis, $message, ($pageName ?: '----'),
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
                //Email::send( $subject, $text, 'voloshin@askods.dn.ua,bay@askods.dn.ua' );
                Email::send( $subject, $text, EMAIL_KOMISSAR);
                Email::send( $subject, $text, EMAIL_KOMISSAR_2);
                Email::send( $subject, $text, EMAIL_MARKETING );
                Email::send( $subject, $text, EMAIL_PROGRAMMER );
                Email::send( $subject, $text, EMAIL_POGRAMMER_2 );
            }

            $this->success( __('Администрация сайта скоро Вам перезвонит!') );
        }

        public function respondToJobAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));
            if( !$name OR mb_strlen($name, 'UTF-8') < 2 ) {
                $this->error('Имя введено неверно!');
            }
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+380\d{9,10}$/', $phone, $matches) ) {
                $this->error('Номер телефона введен неверно!');
            }
            $message = trim( strip_tags( Arr::get( $this->post, 'message' ) ) );
            if( $message AND mb_strlen($message, 'UTF-8') < 4 ) {
                $this->error('Слишком короткое сообщение! Нужно хотя бы 4 символа');
            }

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('COUNT(respond_to_job.id)'), 'count'))
                ->from('respond_to_job')
                ->where('ip', '=', $ip)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            //if( is_object($check) AND $check->count ) {
            //    $this->error('Нельзя так часто отсылать заявку! Пожалуйста, повторите попытку через минуту');
            //}

            $vacancy = Vacancy::getRowSimple((int)Arr::get($_POST, 'vacancy_id'), 'id', 1);

            if (!$vacancy) {
                $this->error('Вакансия не найдена');
            }

            // Save data
            $data = [
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'message' => $message,
                'vacancy_name' => $vacancy->job_vacancy,
                'vacancy_city' => $vacancy->city,
                'vacancy_address' => $vacancy->address,
                'ip' => $ip,
                'status' => 0,
                'created_at' => time(),
            ];

            $lastID = DB::insert('respond_to_job', array_keys($data))->values(array_values($data))->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Отклик на вакансию "' . $vacancy->job_vacancy . ' ' . $vacancy->city . '"';
            $url = '/wezom/respondToJob/edit/' . $lastID;
            Log::add( $qName, $url, 3 );

            // Send E-Mail to admin
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(27, 'id', 1);
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 27)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}', '{{email}}', '{{phone}}', '{{message}}',
                    '{{vacancy_name}}', '{{vacancy_city}}', '{{vacancy_address}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $name, $email, $phone, $message,
                    Arr::get($data, 'vacancy_name'), Arr::get($data, 'vacancy_city'), Arr::get($data, 'vacancy_address'),
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
               // Email::send( $subject, $text );
                Email::send( $subject, $text, EMAIL_HR );
                Email::send( $subject, $text,EMAIL_PROGRAMMER );
                Email::send( $subject, $text,  conf::get('main.vacansy_getter_email'));
            }

            $this->success( 'Администрация сайта скоро Вам перезвонит!' );
        }


        public function vacancyQuestionAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));
            $city = trim(Arr::get($this->post, 'city'));
            $email = Arr::get( $this->post, 'email' );
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+380\d{9,10}$/', $phone, $matches) ) {
                $this->error(__('Номер телефона введен неверно!'));
            }
            $message = trim( strip_tags( Arr::get( $this->post, 'message' ) ) );

            // Check for bot
            $ip = System::getRealIP();
            $check = DB::select(array(DB::expr('COUNT(vacancy_question.id)'), 'count'))
                ->from('vacancy_question')
                ->where('ip', '=', $ip)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error(__('Нельзя так часто отсылать заявку! Пожалуйста, повторите попытку через минуту'));
            }

            // Save data
            $data = [
                'name' => $name,
                'city' => $city,
                'email' => $email,
                'phone' => $phone,
                'message' => $message,
                'ip' => $ip,
                'status' => 0,
                'created_at' => time(),
            ];

            $lastID = DB::insert('vacancy_question', array_keys($data))->values(array_values($data))->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Вопросы по поводу вакансий';
            $url = '/wezom/vacancyQuestion/edit/' . $lastID;
            Log::add( $qName, $url, 3 );

            // Send E-Mail to admin
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(28, 'id', 1);
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 28)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}', '{{city}}', '{{email}}', '{{phone}}', '{{message}}');
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    ($name ?: '----'), ($city ?: '----'), ($email ?: '----'), $phone, $message
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text,EMAIL_PROGRAMMER );
                Email::send( $subject, $text,EMAIL_HR );
                Email::send( $subject, $text,EMAIL_MARKETING );
            
            }

            $this->success( __('Администрация сайта скоро Вам перезвонит!') );
        }

        
        

        public function askQuestionAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));

            $email = Arr::get( $this->post, 'email' );
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+380\d{9,10}$/', $phone, $matches) ) {
                $this->error(__('Номер телефона введен неверно!'));
            }
            $message = trim( strip_tags( Arr::get( $this->post, 'message' ) ) );

            // Check for bot
            $ip = System::getRealIP();
/*
            $check = DB::select(array(DB::expr('COUNT(vacancy_question.id)'), 'count'))
                ->from('vacancy_question')
                ->where('ip', '=', $ip)
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error(__('Нельзя так часто отсылать заявку! Пожалуйста, повторите попытку через минуту'));
            }
*/
            // Save data
      /*   
            $data = [
                'name' => $name,
                'city' => $city,
                'email' => $email,
                'phone' => $phone,
                'message' => $message,
                'ip' => $ip,
                'status' => 0,
                'created_at' => time(),
            ];

   
            $lastID = DB::insert('vacancy_question', array_keys($data))->values(array_values($data))->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Вопросы по поводу вакансий';
            $url = '/wezom/vacancyQuestion/edit/' . $lastID;
            Log::add( $qName, $url, 3 );
*/
            // Send E-Mail to admin
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(30, 'id', 1);
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 28)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}',  '{{email}}', '{{phone}}', '{{message}}');
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    ($name ?: '----'),  ($email ?: '----'), $phone, $message
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
                
            }

            $this->success( __('Администрация сайта скоро Вам перезвонит!') );
            
        }

        
        
        public function sendReviewAction() {
            // Check incoming data
            $name = trim(Arr::get($this->post, 'name'));
            //$email = trim(Arr::get($this->post, 'email'));
            if( !$name) {
                $this->error(__('Укажите Ваше имя'));
            }
            
            $message = trim( strip_tags( Arr::get( $this->post, 'message' ) ) );
            if(!$message){
              $this->error(_('Вы не внесли текст отзыва'));
            }
            
            $phone = trim(Arr::get($this->post, 'phone'));
            if( !$phone OR !preg_match('/^\+380\d{9,10}$/', $phone, $matches) ) {
                $this->error(__('Номер телефона введен неверно!'));
            }
            
            $email = trim(Arr::get($this->post, 'email'));
            if( !$email) {
                $this->error(__('E-mail введен не верно'));
            }
            
            //print_r($phone); die;
            
            // Check for bot
            $ip = System::getRealIP();

            // Send E-Mail to admin
            
            // TODO reviews добавить mail темплейт  "сообщение страницы отзывов"
            //  DB.mail_templates   DB.mail_templates_i18n0
            
            /*
            
            INSERT INTO `mail_templates_i18n` (`id`, `name`, `subject`, `text`, `row_id`, `language`) 
            VALUES ('35', 'отзыв', 'оставить отзыв {{site}}', 
            '<p>Поступила новый отзыв посетителя сайта {{site}}!</p>\r\n
            <p>данные посетителя:</p>\r\n<table>\r\n<tbody>\r\n<tr>\r\n<td>Имя:</td>\r\n<td>{{name}}</td>\r\n</tr>\r\n<tr>\r\n<td>Сообщение</td>\r\n<td>{{message}}</td>\r\n</tr>\r\n<tr>\r\n<td>IP:</td>\r\n<td>{{ip}}</td>\r\n</tr>\r\n</tbody>\r\n</table>', '31', 'ru'), (NULL, '', '', '', NULL, NULL);
            
            
            
            
            */
            
            
            
            $mail = CommonI18n::factory('mail_templates')->getRowSimple(31, 'id', 1);
            
            //$mail = DB::select()->from('mail_templates')->where('id', '=', 28)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{name}}','{{phone}}' ,'{{email}}', '{{message}}');
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ), $ip, date('d.m.Y H:i'),
                    $name,$phone, $email,$message
                );
                $subject = str_replace($from, $to, 'сообщение страницы отзывов');
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
                
            }

            $this->success( __('Спасибо. После проверки модератором мы опубликуем Ваш отзыв.') );
            
        }



        // Subscribe user for latest news and sales
        public function subscribeAction() {
            // Check incoming data
            $email = Arr::get( $this->post, 'email' );
            if( !$email OR !filter_var( $email, FILTER_VALIDATE_EMAIL ) ) {
                $this->error('Вы неверно ввели E-Mail!');
            }
            $check = DB::select(array(DB::expr('COUNT(subscribers.id)'), 'count'))
                ->from('subscribers')
                ->where('email', '=', $email)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Вы уже подписаны на нашу рассылку!');
            }
            $hash = sha1( $email . microtime() ); // Generate subscribers hash

            // Save subscriber to the database
            $ip = System::getRealIP();
            $lastID = DB::insert('subscribers', array('email', 'ip', 'status', 'hash', 'created_at'))->values(array($email, $ip, 1, $hash, time()))->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Подписчик';
            $url = '/wezom/subscribers/edit/' . $lastID;
            Log::add( $qName, $url, 4 );

            // Send E-Mail to user
            $mail = DB::select()->from('mail_templates')->where('id', '=', 2)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{link}}', '{{email}}', '{{ip}}', '{{date}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ),
                    'http://' . Arr::get( $_SERVER, 'HTTP_HOST' ) . '/unsubscribe/hash/' . $hash, $email,
                    $ip, date('d.m.Y H:i'),
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text, $email );
            }

            $this->success( 'Поздравляем! Вы успешно подписались на рассылку акций и новостей с нашего сайта!' );
        }

        public function commonAction(){
            
        }
        
        
        // User want to contact with admin and use contact form
        public function contactsAction() {
            // Check incoming data
            if( !Arr::get( $this->post, 'name' )  ) {
                $this->error('Вы не указали имя!');
            }
            if( !Arr::get( $this->post, 'text' )  ) {
                $this->error('Вы не написали текст сообщения!');
            }
            if( !filter_var( Arr::get( $this->post, 'email' ), FILTER_VALIDATE_EMAIL )  ) {
                $this->error('Вы указали неверный E-Mail!');
            }

            // Create data for saving
            $data = array();
            $data['text'] = nl2br(Arr::get($this->post, 'text'));
            $data['ip'] = System::getRealIP();
            $data['name'] = Arr::get($this->post, 'name');
            $data['email'] = Arr::get($this->post, 'email');
            $data['created_at'] = time();

            // Chec for bot
            $check = DB::select(array(DB::expr('COUNT(contacts.id)'), 'count'))
                ->from('contacts')
                ->where('ip', '=', Arr::get($data, 'ip'))
                ->where('created_at', '>', time() - 60)
                ->as_object()->execute()->current();
            if( is_object($check) AND $check->count ) {
                $this->error('Нельзя так часто отправлять сообщения! Пожалуйста, повторите попытку через минуту');
            }

            // Save contact message to database
            $keys = array(); $values = array();
            foreach ($data as $key => $value) {
                $keys[] = $key; $values[] = $value;
            }
            $lastID = DB::insert('contacts', $keys)->values($values)->execute();
            $lastID = Arr::get($lastID, 0);

            // Save log
            $qName = 'Сообщение из контактной формы';
            $url = '/wezom/contacts/edit/' . $lastID;
            Log::add( $qName, $url, 2 );

            // Send E-Mail to admin
            $mail = DB::select()->from('mail_templates')->where('id', '=', 1)->where('status', '=', 1)->as_object()->execute()->current();
            if( $mail ) {
                $from = array( '{{site}}', '{{name}}', '{{email}}', '{{text}}', '{{ip}}', '{{date}}' );
                $to = array(
                    Arr::get( $_SERVER, 'HTTP_HOST' ),
                    Arr::get( $data, 'name' ), Arr::get( $data, 'email' ), Arr::get( $data, 'text' ),
                    Arr::get( $data, 'ip' ), date('d.m.Y H:i'),
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send( $subject, $text );
            }

            $this->success( 'Спасибо за сообщение! Администрация сайта ответит Вам в кратчайшие сроки' );
        }

    }