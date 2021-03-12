<div class="wBlock_content c_light">
    <div class="wSize padding_in">
        <div class="wTitle w_tal">
            <h1><?php echo $current->h1 ?: $current->name; ?></h1>
        </div>
        <div class="list_services">
            <?php foreach($result as $row): ?>
                <?php extract($row); ?>
                <div class="service_item">
                    <span class="service_item--bg">
                        <?php if(is_file(HOST . \Core\HTML::media('images/catalog_tree/' . $group->image))): ?>
                            <img src="<?php echo \Core\HTML::media('images/catalog_tree/' . $group->image, true); ?>"
                                 alt="<?php echo $group->name; ?>">
                        <?php endif; ?>
                    </span>
                    <div class="service_item__left">
                        <div class="service_item__left__content">
                            <a href="<?php echo \Core\HTML::link($group->alias, true); ?>">
                                <span class="service_item__left__content--icon">
                                    <svg><use xlink:href="#<?php echo $group->icon; ?>"/></svg>
                                </span>
                                <span class="service_item__left__content--title"><?php echo $group->name; ?></span>
                            </a>
                        </div>
                    </div>
                    <div class="service_item__right">
                        <?php if(count($items)): ?>
                            <div class="service_item__right__content">
                                <ul>
                                    <?php foreach($items as $item): ?>
                                        <li>
                                            <a href="<?php echo \Core\HTML::link($item->alias, true); ?>"
                                               title="<?php echo $item->name; ?>"><?php echo $item->name; ?></a>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div> <!-- list services -->
        <div class="wBlock_uslugi__branches">
            <div class="wTxt">
               <?php echo __('спектр страховых услуг');?>
            </div>
            
            <div class="wAccordeon">
            
                <div class="wAccordeon__item w_clearfix">
                
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('Страховые услуги по защите своего авто');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            <?= __('Страховые услуги по защите своего авто подробно');?>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->
                
            
                <div class="wAccordeon__item w_clearfix">
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('Гражданско-правовая ответственность');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            <?= __('Гражданско-правовая ответственность содержимое');?>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->

            
                <div class="wAccordeon__item w_clearfix">
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('Имущественное страхование');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            <?= __('Имущественное страхование содержимое');?>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->

            
                <div class="wAccordeon__item w_clearfix">
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('Услуги по страхованию здоровья');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            <?= __('Услуги по страхованию здоровья содержимое');?>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->
                
            </div> <!-- wAccordeon -->
            <div class="wBlockUslugiContainer">
              <div class="wBlockUslugiTitle">
              <?= __('Где можно заказать страховку')?>
              </div>
              <div class="wBlockUslugiContent" style="text-align: center;">
                <div class="wBlock_uslugi__ico_container">
                <?php if(I18n::$lang == 'ru'): ?>
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_online_ru.png'); ?>"
                                                 alt="заказать онлайн или" /> 
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_phone_ru.png'); ?>"
                                                 alt="на позвонить на горячую линию" /> 
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_office_ru.png'); ?>"
                                                 alt="приобрести в отделении компании" /> 
                              <?php else: ?>
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_online_ua.png'); ?>"
                                                alt="замовити поліс онлайн" /> 
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_phone_ua.png'); ?>"
                                                 alt="зателефонувати на гарячу лінию" /> 
                  <img src="<?php echo \Core\HTML::media('images/uslugi/uslugi_office_ua.png'); ?>"
                                                 alt="придбати в відділеннях компанії" /> 
                <?php endif; ?>
                 </div>
              </div>
            </div>
            
            
            <div class="wBlockUslugiContainer ContentAdvantage">
               <div class="wBlockUslugiTitle">
                <?php echo __('Преимущества «СК АСКО ДС»')?>
               </div>
               <div class="wBlockUslugiBenefits">
                   
                  <div class="wBlockUslugiBenefitsIcons">
                        <div class="benefits_item benefit-holder-1  trans-block">
                          <div class="benefits_item--img">
                            <span class="svgHolder"><svg><use xlink:href="#icon_benefit_1"/></svg></span>
                                  </div>
                          <div class="benefits_item--text">
                            <p><?php echo __('Быстрое урегулирование событий');?></p>
                          </div>
                        </div>  
                        <div class="benefits_item benefit-holder-2 trans-block">
                            <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_2"/></svg></span>
                                  </div>
                                  <div class="benefits_item--text">
                                      <p><?php echo __('Выплаты в полном объеме в минимальные сроки');?></p>
                                  </div>
                              </div>
                              <div class="benefits_item benefit-holder-3 trans-block">
                          
                          <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_3"/></svg></span>
                                  </div>
                                  <div class="benefits_item--text">
                                      <p><?php echo __('Финансовая устойчивость и выполнение всех взятых обязательств');?></p>
                                  </div>
                              </div>
                              <div class="benefits_item benefit-holder-4 trans-block">
                                  <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_4"/></svg></span>
                                  </div>                
                                  <div class="benefits_item--text">
                                      <p><?php echo __('Профессионализм работников с 25-летним опытом');?><?php /*echo nl2br(\Core\Config::get('advantages.orient_to_socium')); */?></p>
                                  </div>
                              </div>
                          </div>


                </div>        
               <div class="wBlockUslugiContent" style="text-align: center;">
               </div>
            </div>
            
            <?php
            $ref_calc = '/ua/kalkulyator-online'; 
                   if(I18n::$lang == 'ru'){ $ref_calc = '/ru/kalkulyator-online'; }
            ?>
            
            <div class="btnUslugiCalculate">
                
                <a class="wBtn dblBtn wBtnOrder" style="padding: 12px;" href="<?=$ref_calc?>" alt="partners">
                    <?php echo __('Рассчитать цену вашей страховки');?>
                <a>
            </div>

            
            
        </div>
    </div>
</div>
