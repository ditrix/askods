<footer class="wFooter">
    <div class="wFooter__top w_clearfix">
        <div class="wSize">
            <div class="wFooter__top--left">
                <div class="wFooter__logo">
                    <span>
                        <img src="<?php echo \Core\HTML::media('pic/logo.png'); ?>" alt="<?php echo $_SERVER['HTTP_HOST']; ?>">
                    </span>
                </div>
                <div class="wFooter__social">
                    <ul>
                        <?php if($socialFb = \Core\Config::get('socials.fb')): ?>
                            <li>
                                <a href="<?php echo $socialFb; ?>">
                                    <span class="svgHolder"><svg><use xlink:href="#icon_soc_fb"/></svg></span>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php if($socialTw = \Core\Config::get('socials.tw')): ?>
                            <li>
                                <a href="<?php echo $socialTw; ?>">
                                    <span class="svgHolder"><svg><use xlink:href="#icon_soc_tw"/></svg></span>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php if($socialVk = \Core\Config::get('socials.vk')): ?>
                            <li>
                                <a href="<?php echo $socialVk; ?>">
                                    <span class="svgHolder"><svg><use xlink:href="#icon_soc_vk"/></svg></span>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php if($socialYt = \Core\Config::get('socials.yt')): ?>
                            <li>
                                <a href="<?php echo $socialYt; ?>">
                                    <span class="svgHolder"><svg><use xlink:href="#icon_soc_yt"/></svg></span>
                                </a>
                            </li>
                        <?php endif; ?>
                        <?php if($socialIg = \Core\Config::get('socials.ig')): ?>
                            <li>
                                <a href="<?php echo $socialIg; ?>">
                                    <span class="svgHolder"><svg><use xlink:href="#icon_soc_ig"/></svg></span>
                                </a>
                            </li>
                        <?php endif; ?>
                    </ul>
                    
                    
                   
                  
                    
                    
                    
                    <script type="application/ld+json"> 
					{
						"@context" : "https://schema.org", 
						"@type" : "Organization", 
						"name" : "Страховая компания АСКО ДС", 
						"url" : "https://askods.com/", 
						"sameAs" : [
									"https://www.facebook.com/askods/",	
									"https://twitter.com/ASKO_DS",
									"https://www.youtube.com/channel/UCMSyunAkGI8GBNFJto82pMA"
									] 
					} 
					</script>
				</div>

            </div>
            <div class="wFooter__top--right">

                <?php if($phone = \Core\Config::get('static.phone')): ?>
                    <div class="wFooter__contacts">
                        <div>
                            <span class="svgHolder">
                                <svg>
                                    <use xlink:href="#icon_phone"/>
                                </svg>
                            </span>
                            <a href="tel:<?php echo preg_replace('/\D/', '', $phone); ?>"><?php echo $phone; ?></a>
                            <p><?php /*echo \Core\Config::get('static.phone_label'); */?><?php echo __('бесплатная многоканальная телефоная линия');?></p>
                        </div>
                        <div>
                            <!-- <span class="svgHolder">
                                <svg>
                                    <use xlink:href="#icon_phone"/>
                                </svg>
                            </span> -->
                         <?php $footer_phone = '050-450-15-60'?>   
                         <a href="tel:<?php echo preg_replace('/\D/', '', $footer_phone); ?>"><?php echo $footer_phone; ?></a>
                         
                        <p><?php /*echo \Core\Config::get('static.phone_label'); */?><?php echo __('cтоимость звонков согласно тарифов Вашего оператора');?></p>

                        </div>
                    </div>
                <?php endif; ?>
                <div class="wFooter__btn">
                    <?php
                   $ref_order = '/ua/strahovye-uslugi'; 
                   if(I18n::$lang == 'ru'){ $ref_order = '/ru/strahovye-uslugi'; }
                   
                ?>
                <a class="wBtn dblBtn wBtnOrder" style="padding: 12px;" href="<?=$ref_order?>">
                    <?php echo __('Заказать страховку');?>
                </a><!-- 
                    <button data-url="/popup/insuredEvent" data-param="{&quot;lang&quot;:&quot;<?php //echo I18n::$lang;?>&quot;}" class="wBtn mfiA">
                        <span><?php /*echo \Core\Config::get('main_texts.insured_event_button'); */?><?php // echo __('Заявить о страховом случае');?></span>
                    </button> -->
                </div>
                <div class="counters">
                    <?php if (isset($counters)): ?>
                        <?php foreach ($counters as $counter): ?>
                            <div class="counter">
                                <?php echo $counter; ?>
                            </div>
                        <?php endforeach ?>
                    <?php endif ?>
                </div>
            </div>
            <div class="wFooter__top--center">
                <div class="wFooter__top__column public-info" >
                    <p><?php echo __('Публичная информация');?></p>
                    <ul>
                      <li><a href="https://www.nfp.gov.ua/" target="_blank"> <?php echo __('Нацкомфинпослуг');?></a></li>
                      <li><a href="/doc/upload/osago_offer.pdf"  target="_blank"> <?php echo __('Оферты');?></a></li>
                       <li><a href="/doc/upload/privacy_policy.pdf"  target="_blank"> <?php echo __('Конфиденциальность');?></a></li>
                    </ul>
                </div>
                <?php foreach($menu[0] as $link): ?>
                    <?php if(count($menu[$link->id])): ?>
                        <div class="wFooter__top__column">
                            <p><?php echo $link->name; ?></p>
                            <ul>
                                <?php foreach($menu[$link->id] as $subMenu): ?>
                                    <li>
                                        <a href="<?php echo preg_replace('#/strahovye-uslugi#', '', \Core\HTML::link($subMenu->url, true)); ?>"><?php echo $subMenu->name; ?></a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <div class="wFooter__bottom w_clearfix">
        <div class="wSize">
            <div class="wFooter__copy">
                <p>&copy; <?php echo date('Y') . ' ' . __('Страховая компания АСКО ДС'); ?></p>
            </div>
        
        </div>
    </div>
</footer>
<!-- .wFooter -->

        
