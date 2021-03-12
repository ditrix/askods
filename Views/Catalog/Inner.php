<!-- /Views/Catalog/Inner.php-->
<?php echo \Core\Widgets::get('SubMenu', ['result' => $kids]); ?>
<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wBlock_service">
        
<?php if($group->id == 40):?>

            <div class="wBlock_service_block_top wBlock_service_top_block_bg_usluga-<?=$group->id?>">            
         
             <?php (I18n::$lang == 'ru') ?  $lang = 'ru' :  $lang = 'ua'; ?>
              
              <div class="wTitle">
                  <h1><?php echo $group->h1 ?: $group->name; ?></h1>
              </div>
              
       
            </div>
            
            <div class="wBlock_service_block_1">
             <div class="wBlock_service_block_1_title">
                <h2><?=$group->name?></h2>
             </div>
            <div class="wBlock_service_block_wrapper">            
              <div class="wBlock_service_block_item">
                <a href="/<?=$lang?>/osago">
                    <img src="/Media/images/catalog/services/usluga<?=$group->id?>/osago_<?=$lang?>.png" alt="осаго"/>
                </a>
              </div>
              <div class="wBlock_service_block_item">
                <a href="/<?=$lang?>/elektronnyj-polis">
                  <img src="/Media/images/catalog/services/usluga<?=$group->id?>/osago_epolis_<?=$lang?>.png" alt="электронное осаго"/>
                 </a>
              </div>
              <div class="wBlock_service_block_item">
                <a href="/<?=$lang?>/kasko">
                  <img src="/Media/images/catalog/services/usluga<?=$group->id?>/kasko_<?=$lang?>.png" alt="каско"/>
                </a>
              </div>
              <div class="wBlock_service_block_item">
                <a href="/<?=$lang?>/kasko-ekonom">
                  <img src="/Media/images/catalog/services/usluga<?=$group->id?>/kasko_ekonom_<?=$lang?>.png" alt="каско эконом"/>
                </a>
              </div>
              <div class="wBlock_service_block_item">
                <a href="/<?=$lang?>/dgo">
                  <img src="/Media/images/catalog/services/usluga<?=$group->id?>/dgo_<?=$lang?>.png" alt="ДГО"/>
                </a>
              </div>
            </div>
            </div>
<?php else: ?>
            <div class="wBlock_service_top_block">            
              <div class="wTitle w_tal" >
                  <h1><?php echo $group->h1 ?: $group->name; ?></h1>
              </div>
            </div>
<?php endif; ?>
 <!-- основной контент из админки -->
            <div <?php echo $group->show_banner ? 'class="wBlock_service_center"' : null; ?>>
                <div class="wBlock_service_content wTxt">
                
                    <?php echo $group->text; ?>
                </div>
            </div>
<!-- блок-4 --> 
           <div class="wBlockUslugiContainer ContentAdvantage">
               <div class="wBlockUslugiTitle">
                <?=__('Преимущества «СК АСКО ДС»')?>
               </div>
               <div class="wBlockUslugiBenefits">
                   
                  <div class="wBlockUslugiBenefitsIcons">
                        <div class="benefits_item benefit-holder-1  trans-block">
                          <div class="benefits_item--img">
                            <span class="svgHolder"><svg><use xlink:href="#icon_benefit_1"/></svg></span>
                                  </div>
                          <div class="benefits_item--text">
                            <p><?=__('Быстрое урегулирование событий');?></p>
                          </div>
                        </div>  
                        <div class="benefits_item benefit-holder-2 trans-block">
                            <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_2"/></svg></span>
                                  </div>
                                  <div class="benefits_item--text">
                                      <p><?=__('Выплаты в полном объеме в минимальные сроки');?></p>
                                  </div>
                              </div>
                              <div class="benefits_item benefit-holder-3 trans-block">
                          
                          <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_3"/></svg></span>
                                  </div>
                                  <div class="benefits_item--text">
                                      <p><?=__('Финансовая устойчивость и выполнение всех взятых обязательств');?></p>
                                  </div>
                              </div>
                              <div class="benefits_item benefit-holder-4 trans-block">
                                  <div class="benefits_item--img">
                                      <span class="svgHolder"><svg><use xlink:href="#icon_benefit_4"/></svg></span>
                                  </div>                
                                  <div class="benefits_item--text">
                                      <p><?=__('Профессионализм работников с 25-летним опытом');?><?php /*echo nl2br(\Core\Config::get('advantages.orient_to_socium')); */?></p>
                                  </div>
                              </div>
                          </div>
                  </div>        
               <div class="wBlockUslugiContent" style="text-align: center;">
               </div>
            </div>

<!-- блок-5 -->

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


<!-- EOF  блок-5 --> 


<?php  if($group->id == 40): ?>
      <!-- блок 4 -->
      <div class="wBlock_service_content wTxt service-block-6">
          <div class="block-title">
              <h5><?php echo __('Мы рекомендуем дополнительно');?></h5>
          </div>
          <div class="service-block-6-40">
              <div class="service-block-6-40-content">
                  <img src="/Media/images/catalog/services/extramed.png" alt="<?php echo __('личное страхование');?>"/>
                  <h6><?php echo __('Личное страхование');?></h6>
                  <a href="/<?=$lang?>/lichnoe-strahovanie"><?php echo __('Узнайте больше');?></a>
              </div>
              <div class="service-block-6-40-content">
                  <img src="/Media/images/catalog/services/extradom.png" alt="<?php echo __('Имущество');?>"/>
                  <h6><?php echo __('Имущество');?></h6>               
                   <a href="/<?=$lang?>/imuschestvo"><?php echo __('Узнайте больше');?></a>
              </div>
              <div class="service-block-6-40-content">
                  <img src="/Media/images/catalog/services/extravzr.png" alt="<?php echo __('Путешествия');?>"/>
                  <h6><?php echo __('Путешествия');?></h6>               
                  <a href="/<?=$lang?>/puteshestvie"><?php echo __('Узнайте больше');?></a>
              </div>
          </div>          
      </div>    
<?php endif; ?>          
   
<?php  if($group->id == 40): ?>
      <!-- блок 4 -->
      <div class="wBlock_service_content wTxt service-block-7">
          <div class="wAccordeon">
            
                <div class="wAccordeon__item w_clearfix wAccordeon__service_block_7">
                
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('ПОЛЕЗНАЯ ИНФОРМАЦИЯ');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            
                            <a href="/doc/upload/services/40/blank_zayava_pro_pripinennya_diyi_dogovory_OSAGO.pdf" target="_blank"><?= __('Бланк заявление о прекращении действия договора ОСАГО');?></a>
                            
                            <a href="/doc/upload/services/40/blank_povidomlennya_pro_DTP.doc" target="_blank"><?= __('Бланк сообщения о ДТП');?></a>
                            
                            <a href="/doc/upload/services/40/zyava_pro_vidachy_dublikata_dogovory_strahuvannya.pdf" target="_blank"><?= __('Заявление о выдаче дубликата договора страхования');?></a>
                            
                            <a href="/doc/upload/services/40/instrukcia_po_rozirvanniuy_dogovory_OSAGO.doc" target="_blank"><?= __('Инструкция о расторжении договора страхования ОСАГО');?></a>
                             
                            <a href="/doc/upload/services/40/evroprotokol_zrazok.pdf" target="_blank"><?= __('Бланк европротокола');?></a>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->
                
                <div class="wAccordeon__item w_clearfix wAccordeon__service_block_7">
                    <div class="wAccordeon__item__top js-accordeon_btn" >
                       <span><?= __('ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ');?></span>
                    </div><!-- wAccordeon__item__top -->
                    <div class="wAccordeon__item__content">
                        <div class="wText">
                            <?= __('ВОПРОС-ОТВЕТ');?>
                        </div>
                    </div>
                </div><!-- wAccordeon__item -->

         </div> <!-- wAccordeon -->      
      </div>    
<?php endif; ?>          
   
<?php if($group->show_banner): ?>
       <div class="wBlock_service_right">
           <?php echo \Core\Widgets::get('Banner'); ?>
       </div>
<?php endif; ?>
        </div>
    </div>
</div>