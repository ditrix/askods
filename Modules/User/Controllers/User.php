<?php
    namespace Modules\User\Controllers;

    use Core\Arr;
    use Core\Common;
    use Core\Email;
    use Core\Encrypt;
    use Core\GeoIP;
    use Core\HTML;
    use Core\QB\DB;
    use Core\Route;
    use Core\Validation\Rules;
    use Core\View;
    use Core\Config;
    use Core\User AS U;
    use Core\HTTP;
    use Core\Message;

    use Modules\Cart\Models\Orders;
    use Modules\User\Models\Users AS Model;
    
    class User extends \Modules\Base {

        public function before() {
            parent::before();
            $this->setBreadcrumbs( 'Личный кабинет', 'account' );
            $this->_template = 'Cabinet';
            $this->_seo['h1'] = 'Личный кабинет';
            $this->_seo['title'] = 'Личный кабинет';
            $this->_seo['keywords'] = 'Личный кабинет';
            $this->_seo['description'] = 'Личный кабинет';
        }


        public function fastAuthAction() {
            if(!array_key_exists('admin', $_SESSION)) {
                return Config::error();
            }
            $admin = DB::select('users.*', array('users_roles.alias', 'role'))
                ->from('users')
                ->join('users_roles')->on('users.role_id', '=', 'users_roles.id')
                ->where('users.id', '=', (int) $_SESSION['admin'])
                ->where('users.status', '=', 1)
                ->find();
            if(!$admin) {
                return Config::error();
            }
            $user_id = Encrypt::instance()->decode(Route::param('hash'));
            $user = Common::factory('users')->getRow($user_id, 'id', 1);
            if(!$user) {
                return Config::error();
            }
            U::factory()->auth($user);
            $name = trim($user->last_name.' '.$user->name);
            $name = $name ?: '#'.$user->id;
            Message::GetMessage(1, 'Вы успешно авторизовались как пользователь '.$name);
            HTTP::redirect('account');
        }


        public function socialsAction() {
            // $s = file_get_contents('http://ulogin.ru/token.php?token=' . $_POST['token']);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://ulogin.ru/token.php?token=' . $_POST['token']);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            $html = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($html, true);
            if( !Rules::email(Arr::get($data, 'email')) ) {
                Message::GetMessage(0, 'E-Mail некорректен или скрыт!', 3500);
                HTTP::redirect('/');
            }
            $row = DB::select()->from('users_networks')->where('network', '=', Arr::get($data, 'network'))->where('uid', '=', Arr::get($data, 'uid'))->find();
            if( $row ) {
                $user = Common::factory('users')->getRow($row->user_id);
                if( $user ) {
                    U::factory()->auth( $user );
                    Message::GetMessage(1, 'Вы успешно авторизовались на сайте!', 3500);
                    HTTP::redirect('account');
                }
                Common::factory('users')->delete($row->id);
            }

            $user = Common::factory('users')->getRow(Arr::get($data, 'email'), 'email');
            if( !$user ) {
                $password = U::generate_random_password();
                $id = Common::factory('users')->insert(array(
                    'email' => Arr::get($data, 'email'),
                    'name' => Arr::get($data, 'first_name'),
                    'last_name' => Arr::get($data, 'last_name'),
                    'status' => 1,
                    'last_login' => time(),
                    'logins' => 1,
                    'role_id' => 1,
                    'ip' => GeoIP::ip(),
                    'hash' => U::factory()->hash_user(Arr::get($data, 'email'), $password),
                    'password' => U::factory()->hash_password($password),
                ));
                if( !$id ) {
                    Message::GetMessage(0, 'К сожалению, Вас не удалось зарегистрировать! Попробуйте позже', 3500);
                    HTTP::redirect('/');
                }
                $mail = Common::factory('mail_templates')->getRow(13, 'id', 1);
                if( $mail ) {
                    // Sending letter to email
                    $from = array( '{{site}}', '{{ip}}', '{{date}}', '{{email}}', '{{password}}', '{{name}}' );
                    $to = array(
                        Arr::get( $_SERVER, 'HTTP_HOST' ), Arr::get( $data, 'ip' ), date('d.m.Y'),
                        Arr::get($data, 'email'), $password, trim(Arr::get($data, 'first_name').' '.Arr::get($data, 'last_name'))
                    );
                    $subject = str_replace($from, $to, $mail->subject);
                    $text = str_replace($from, $to, $mail->text);
                    Email::send( $subject, $text, Arr::get($data, 'email') );
                }
                $user = Common::factory('users')->getRow($id);
            }
            Common::factory('users_networks')->insert(array(
                'user_id' => $user->id,
                'network' => Arr::get($data, 'network'),
                'uid' => Arr::get($data, 'uid'),
                'profile' => Arr::get($data, 'profile'),
                'first_name' => Arr::get($data, 'first_name'),
                'last_name' => Arr::get($data, 'last_name'),
                'email' => Arr::get($data, 'email'),
            ));
            U::factory()->auth( $user );
            Message::GetMessage(1, 'Вы успешно авторизовались на сайте!', 3500);
            HTTP::redirect('account');
        }


        public function addSocialsAction() {
            if(!U::info()) {
                return Config::error();
            }
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://ulogin.ru/token.php?token=' . $_POST['token']);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            $html = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($html, true);
            if( !Rules::email(Arr::get($data, 'email')) ) {
                Message::GetMessage(0, 'E-Mail некорректен или скрыт!', 3500);
                HTTP::redirect('/');
            }
            $row = DB::select()->from('users_networks')->where('network', '=', Arr::get($data, 'network'))->where('uid', '=', Arr::get($data, 'uid'))->find();
            if( $row ) {
                if($row->user_id == U::info()->id) {
                    Message::GetMessage(0, 'Эта соц. сеть уже прикреплена к Вашему аккаунту!', 3500);
                    HTTP::redirect('account');
                }
                Common::factory('users_networks')->update(array(
                    'user_id' => U::info()->id,
                    'network' => Arr::get($data, 'network'),
                    'uid' => Arr::get($data, 'uid'),
                    'profile' => Arr::get($data, 'profile'),
                    'first_name' => Arr::get($data, 'first_name'),
                    'last_name' => Arr::get($data, 'last_name'),
                    'email' => Arr::get($data, 'email'),
                ), $row->id);
            } else {
                Common::factory('users_networks')->insert(array(
                    'user_id' => U::info()->id,
                    'network' => Arr::get($data, 'network'),
                    'uid' => Arr::get($data, 'uid'),
                    'profile' => Arr::get($data, 'profile'),
                    'first_name' => Arr::get($data, 'first_name'),
                    'last_name' => Arr::get($data, 'last_name'),
                    'email' => Arr::get($data, 'email'),
                ));
            }
            Message::GetMessage(1, 'Вы успешно добавили соц. сеть к своему аккаунту!', 3500);
            HTTP::redirect('account');
        }


        public function indexAction() {
            if( !U::info() ) { return Config::error(); }
            $arr = array('vkontakte' => array(), 'facebook' => array(), 'odnoklassniki' => array(), 'mailru' => array());
            $socials = DB::select()->from('users_networks')->where('user_id', '=', U::info()->id)->find_all();
            foreach($socials AS $key => $value) {
                $arr[$value->network] = $value;
            }
            $this->_content = View::tpl( array( 'user' => U::info(), 'socials' => $arr ), 'User/Index' );
        }


        public function logoutAction() {
            if( !U::info() ) { return Config::error(); }
            U::factory()->logout();
            Message::GetMessage(1, 'Возвращайтесь еще!');
            HTTP::redirect('/');
        }


        public function confirmAction() {
            if( U::info() ) { return Config::error(); }
            if( !Route::param('hash') ) { return Config::error(); }

            $user = Model::getRow(Route::param('hash'), 'hash');
            if( !$user ) { return Config::error(); }
            if( $user->status ) {
                Message::GetMessage(0, 'Вы уже подтвердили свой E-Mail!');
                HTTP::redirect('/');
            }

            Model::update(array('status' => 1), $user->id);

            $mail = DB::select()->from('mail_templates')->where('id', '=', 13)->where('status', '=', 1)->find();
            if($mail) {
                $from = array('{{site}}', '{{ip}}', '{{date}}');
                $to = array(
                    Arr::get($_SERVER, 'HTTP_HOST'), GeoIP::ip(), date('d.m.Y')
                );
                $subject = str_replace($from, $to, $mail->subject);
                $text = str_replace($from, $to, $mail->text);
                Email::send($subject, $text, $user->email);
            }

            U::factory()->auth( $user, 0 );
            Message::GetMessage(1, 'Вы успешно зарегистрировались на сайте! Пожалуйста укажите остальную информацию о себе в личном кабинете для того, что бы мы могли обращаться к Вам по имени');
            HTTP::redirect('account');
        }


        public function profileAction() {
            if( !U::info() ) { return Config::error(); }
            $this->addMeta('Редактирование личных данных');
            $this->_content = View::tpl( array( 'user' => U::info() ), 'User/Profile' );
        }


        public function ordersAction() {
            if( !U::info() ) { return Config::error(); }
            $this->addMeta('Мои заказы');
            $orders = Orders::getUserOrders(U::info()->id);
            $this->_content = View::tpl( array( 'orders' => $orders, 'statuses' => Config::get('order.statuses') ), 'User/Orders' );
        }


        public function orderAction() {
            if( !U::info() ) { return Config::error(); }
            $this->addMeta('Заказ №' . Route::param('id'), true);
            $result = Orders::getOrder(Route::param('id'));
            $cart = Orders::getOrderItems(Route::param('id'));
            $this->_content = View::tpl( array( 
                        'obj' => $result,
                        'cart' => $cart,
                        'payment' => Config::get('order.payment'),
                        'delivery' => Config::get('order.delivery'),
                        'statuses' => Config::get('order.statuses'),
            ), 'User/Order' );
        }


        public function printAction() {
            $this->_template = 'Print';
            if( !U::info() ) { return Config::error(); }
            $result = Orders::getOrder(Route::param('id'));
            $cart = Orders::getOrderItems(Route::param('id'));
            $this->_content = View::tpl( array(
                'order' => $result,
                'list' => $cart,
                'payment' => Config::get('order.payment'),
                'delivery' => Config::get('order.delivery'),
                'statuses' => Config::get('order.statuses'),
            ), 'User/Print' );
        }


        public function change_passwordAction() {
            if( !U::info() ) { return Config::error(); }
            $this->addMeta('Изменить пароль');
            $this->_content = View::tpl( array(), 'User/ChangePassword' );
        }


        public function addMeta( $name, $order = false ) {
            Config::set( 'h1', $name );
            Config::set( 'title', $name );
            Config::set( 'keywords', $name );
            Config::set( 'description', $name );
            if( $order ) {
                $this->setBreadcrumbs( 'Мои заказы', 'account/orders' );
            }
            $this->setBreadcrumbs( $name );
        }
        
    }