<?php
    namespace Modules;

    use Core\Arr;
    use Core\Config;
    use Core\Encrypt;
    use Core\GeoIP;
    use Core\HTTP;
    use Core\Route;
    use Core\View;
    use Core\System;
    use Core\Cron;
    use Core\HTML;
    use Core\QB\DB;
    use Core\User;

    class Base {

        protected $_template = 'Text';
        protected $_content;
        protected $_config = array();
        protected $_seo = array();
        protected $_breadcrumbs = array();
        protected $_method;

        public function before() {
            $this->setLanguage();
            $this->_languages = Config::get('languages') ? Config::get('languages') : array();
            $_POST = Arr::clearArray($_POST);
            $_GET = Arr::clearArray($_GET);
            $this->CSRF();
            $this->_method = $_SERVER['REQUEST_METHOD'];
            $this->config();
            $this->access();
            $this->redirects();
            User::factory()->is_remember();
            $cron = new Cron;
            $cron->check();

          
        }


        public function after() {
            $this->seo();
            $this->visitors();
            $this->render();
        }

        private function setLanguage() {
            $lang = Route::param('lang');
            if (isset($lang)) {
                \I18n::lang(Route::param('lang'));
            }
        }

        private function CSRF() {
            $_SESSION['token'] = Encrypt::instance()->encode(hash('sha256', Config::get('main.token')));
            if(Route::controller() != 'form') {
                return true;
            }
            if($_POST) {
                if(!array_key_exists('token', $_POST)) {
                    die('Error!');
                }
                $token = Encrypt::instance()->decode($_POST['token']);
                if($token != hash('sha256', Config::get('main.token'))) {
                    die('Error!');
                }
            }
        }


        private function access() {
            if( !Config::get('security.auth') || !Config::get('security.username') || !Config::get('security.password') ) {
                return false;
            }
            if (
                Arr::get($_SERVER, 'PHP_AUTH_USER') != Config::get('security.username') ||
                Arr::get($_SERVER, 'PHP_AUTH_PW') != Config::get('security.password')
            ) {
                header('HTTP/1.0 401 Unauthorized');
                header('WWW-Authenticate: Basic realm="My Realm"');
                echo "<h1>Authorization Required</h1><p>This server could not verify that you are authorized to access the document requested.  Either you supplied the wrong credentials (e.g., bad password), or your browser doesn't understand how to supply the credentials required.</p>";
                exit;
            }
        }


        public function redirects() {
            $row = DB::select('link_to', 'type')->from('seo_redirects')->where('link_from', '=', strip_tags($_SERVER['REQUEST_URI']))->where('status', '=', 1)->find();
            if($row) {
                HTTP::redirect($row->link_to, $row->type);
            }
        }


        public function visitors() {
            if( !Config::get('main.visitor') ) { return false; }
            GeoIP::factory()->save();
        }


        private function config() {
            $result = DB::select('key', 'zna', 'group')
                ->from('config')
                ->join('config_groups')->on('config.group', '=', 'config_groups.alias')
                ->where('config.status', '=', 1)
                ->where('config_groups.status', '=', 1)
                ->find_all();
            $groups = array();
            foreach($result AS $obj) {
                $groups[$obj->group][$obj->key] = $obj->zna;
            }
            foreach($groups AS $key => $value) {
                Config::set($key, $value);
            }
            $result = DB::select('script', 'place')->from('seo_scripts')->where('status', '=', 1)->as_object()->execute();
            $this->_seo['scripts'] = array('body' => array(), 'head' => array(), 'counter' => array());
            foreach ( $result AS $obj ) {
                $this->_seo['scripts'][ $obj->place ][] = $obj->script;
            }
            $this->setBreadcrumbs(__('Главная'), '');
        }


        private function seo() {
            if ( !Config::get( 'error' ) ) {
                $seo = DB::select('h1', 'title', 'keywords', 'description', 'text')
                    ->from('seo_links')
                    ->where('status', '=', 1)
                    ->where('link', '=', Arr::get( $_SERVER, 'REQUEST_URI' ))
                    ->as_object()->execute()->current();
                if ($seo) {
                    $this->_seo['h1'] = $seo->h1;
                    $this->_seo['title'] = $seo->title;
                    $this->_seo['keywords'] = $seo->keywords;
                    $this->_seo['description'] = $seo->description;
                    $this->_seo['seo_text'] = $seo->text;
                }
            } else {
                $this->_seo['h1'] = __('Ошибка 404! Страница не найдена');
                $this->_seo['title'] = __('Ошибка 404! Страница не найдена');
                $this->_seo['keywords'] = __('Ошибка 404! Страница не найдена');
                $this->_seo['description'] = __('Ошибка 404! Страница не найдена');
                $this->_seo['seo_text'] = NULL;
            }
        }


        private function render() {
            if( Config::get( 'error' ) ) {
                $this->_template = '404';
            }
            $this->_breadcrumbs = HTML::breadcrumbs($this->_breadcrumbs);
            $data = array();
            foreach ($this as $key => $value) {
                $data[$key] = $value;
            }
            $data['GLOBAL_MESSAGE'] = System::global_massage();
            echo HTML::compress(View::tpl($data, $this->_template));
        }


        protected function setBreadcrumbs( $name, $link = NULL ) {
            $this->_breadcrumbs[] = array('name' => $name, 'link' => $link);
        }


        protected function generateParentBreadcrumbs( $id, $table, $parentAlias, $pre = '/' ) {
            $bread = $this->generateParentBreadcrumbsElement( $id, $table, $parentAlias, array() );
            if ( $bread ) {
                $bread = array_reverse( $bread );
            }
            foreach ( $bread as $obj ) {
                $this->setBreadcrumbs( $obj->name, $pre.$obj->alias );
            }
        }


        protected function generateParentBreadcrumbsElement( $id, $table, $parentAlias, $bread ) {
            $tableI18n = $table.'_i18n';
            $page = DB::select($table.'.id', $table.'.'.$parentAlias, $table.'.alias', $table.'.status', $tableI18n.'.name')
                ->from($table)
                ->join($tableI18n)->on($table.'.id', '=', $tableI18n.'.row_id')
                ->where($tableI18n.'.language', '=', \I18n::$lang)
                ->where($table.'.id', '=', $id)
                ->find();
            if( is_object($page) AND $page->status ) {
                $bread[] = $page;
            }
            if( is_object($page) AND (int) $page->$parentAlias > 0 ) {
                return $this->generateParentBreadcrumbsElement( $page->$parentAlias, $table, $parentAlias, $bread );
            }
            return $bread;
        }

    }
