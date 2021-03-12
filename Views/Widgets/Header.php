<header class="wHeader">
    <div class="wHeader__top w_clearfix">
        <div class="wSize">
            <div class="wHeader__logo">
              
                 <?php if(\Core\Route::controller() == 'index'): ?>
                    <span>
                        <?php if(I18n::$lang == 'ru'): ?>
                        <a href="/ru/">
                        <img src="<?php echo \Core\HTML::media('pic/logoru.png'); ?>" alt="АСКО ДС Страховая компания">
                        <script type="application/ld+json"> 
						{
						"@context": "https://schema.org", 
						"@type": "Organization", 
						"url": "https://askods.com/", 
						"logo": "https://askods.com/Media/pic/logoru.png" 
						} 
						</script>
                          </a>
                        <?php else: ?>
                        <a href="/">
                        <img src="<?php echo \Core\HTML::media('pic/logo.png'); ?>" alt="АСКО ДС Страхова компанія">
                        <script type="application/ld+json"> 
						{
						"@context": "https://schema.org", 
						"@type": "Organization", 
						"url": "https://askods.com/", 
						"logo": "https://askods.com/Media/pic/logo.png" 
						} 
						</script>
                        </a>
                        <?php endif; ?>
                    </span>
                <?php else: ?>
                        <?php if(I18n::$lang == 'ru'): ?>
                        <a href="/ru/">
                          <img src="<?php echo \Core\HTML::media('pic/logoru.png'); ?>" alt="АСКО ДС Страховая компания">
                        <script type="application/ld+json"> 
						{
						"@context": "https://schema.org", 
						"@type": "Organization", 
						"url": "https://askods.com/", 
						"logo": "https://askods.com/Media/pic/logoru.png" 
						} 
						</script>
                        </a>
                        <?php else: ?>
                        <a href="/">
                        <img src="<?php echo \Core\HTML::media('pic/logo.png'); ?>" alt="АСКО ДС Страхова компанія">
                        <script type="application/ld+json"> 
						{
						"@context": "https://schema.org", 
						"@type": "Organization", 
						"url": "https://askods.com/", 
						"logo": "https://askods.com/Media/pic/logo.png" 
						} 
						</script>
                        </a>
						<?php endif; ?>
				<?php endif; ?>
				
				<?php
                   $ref_order = '/ua/strahovye-uslugi'; 
                   if(I18n::$lang == 'ru'){ $ref_order = '/ru/strahovye-uslugi'; }
                   
                ?>
                <a class="wBtn dblBtn wBtnOrder top-banner-collage" style="margin-left: -10px;width: 250px; display:block; padding-top: 14px; font-size: 1.4em;" href="https://shop.askods.com/">
                    <?php echo __('Интернет - магазин АСКО ДС');?>
                </a>
            </div>
            <div class="wHeader__btn">
                <a class="wBtn dblBtn top-banner-collage" style="
                  
                  display:block; padding-top: 15px;" 
                  
                  href="https://epolis.askods.dn.ua/">
                   
                 <div>  
                 <!--
                 <img src="/Media/images/header/moment.png" alt="лови момент" style="margin-top: -6px; margin-left: -3px;
                  position: absolute; top: 0; left: 0;" />                  
                 -->
                 <span style="z-index: 999;"><?= __('Купити електронний поліс ОСГПО')?></span>  
                 
                 

                 </div>
                <!--
                 <span style="margin-left: -40px; z-index: 20px;"><?php //echo __('Купити електронний поліс ОСГПО');?></span>
                 -->
                
                  
               </a>

                <button data-url="/popup/insuredEvent" data-param="{&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}" class="wBtn mfiA">
                    <span><?php /*echo \Core\Config::get('main_texts.insured_event_button'); */?><?php echo __('Заявить о страховом случае');?></span>
                </button>
                <?php/* if(I18n::$lang === 'ru'){
                        $partners_ref='/ru/partnery/';
						$partners_banner= 'btng-serch-partners-ru.gif';
						$partners_alt = 'ищем партнеров';
                         }
                        else{
                        $partners_ref='/ua/partnery/'; 
                        $partners_banner= 'btng-serch-partners-ua.gif';
						$partners_alt = 'шукаємо партнерів';
                        }
                 * 
                 */
                ?>
				
            <!--     <a class="wBtn dblBtn top-banner-collage" style="display:block" href="https://dtp.mtsbu.ua" alt="partners">
                    <?php //echo __('Заполнить электронный<br>Европротокол');?>
                <a>
			 -->	
            </div>    <!-- костыль удаляем buy из языковых ссылок -->
            <div class="wHeader__switch_lang">
                <?php   
                    $url_ua = str_replace('/buy/','/',\Core\HTML::changeLanguage('ua'));
                    $url_ru = str_replace('/buy/','/',\Core\HTML::changeLanguage('ru'));                      
                ?>
                <a href="<?php echo $url_ua;?>" class="<?php echo \I18n::$lang == 'ua' ? 'active' : NULL; ?>">
                    <span><?php echo __('Укр');?></span>
                </a>                
				/
				<a href="<?php echo $url_ru;?>" class="<?php echo \I18n::$lang == 'ru' ? 'active' : NULL; ?>">
                    <span><?php echo __('Рус');?></span>
                </a>				
            </div>
            <div class="wHeader__contacts">
                <div>
                    <!--
                    <span class="svgHolder"><svg><use xlink:href="#icon_phone"/></svg></span>
                    -->
                    <?php if($phone = \Core\Config::get('static.phone')): ?>
                        <a href="tel:<?php echo preg_replace('/\D/', '', $phone); ?>"><?php echo $phone; ?></a>
                        <p><?php /*echo \Core\Config::get('static.phone_label'); */?><?php echo __('бесплатная многоканальная телефоная линия');?></p>
                    <?php endif; ?>                    
                </div>
                <?php $head_phone = '050-450-15-60'?>
                <div class="additional-phones">
                    <!--
                    <span class="svgHolder"><svg><use xlink:href="#icon_phone"/></svg></span>
                    -->
                       <a href="tel:<?php echo preg_replace('/\D/', '', $head_phone); ?>"><?php echo $head_phone; ?></a>
                        <p><?php /*echo \Core\Config::get('static.phone_label'); */?><?php echo __('cтоимость звонков согласно тарифов Вашего оператора');?></p>

                </div>
            </div>
            <a href="#js-menu" class="wHeader__menu_btn js-anim_menu_btn">
                <span></span><span></span><span></span><span></span><span></span><span></span>
            </a>
        </div>
    </div>
    <?php if(count($menu)): ?>
        <div class="wHeader__bottom">
            <div class="wSize">
                <div class="wHeader__menu">
                    <ul>
                        <?php foreach($menu as $link): ?>
                            <li>
                                <a <?php echo stristr($_SERVER['REQUEST_URI'], $link->url) !== false ? ' class="curr"' : null ; ?> href="<?php echo \Core\HTML::link($link->url, true); ?>"><?php echo $link->name; ?></a>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>
        </div>
    <?php endif; ?>
</header>
<!-- .wHeader -->
