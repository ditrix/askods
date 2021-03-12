<div class="wBlock_content c_light">
   <div class="wBlock_review">
 
 <div class="wSize padding_in">
 

            <div class="wTitle">
                 <h3><?php echo __('отзывы');?></h3>       
            </div>
 <div class="w_clear"></div>
 <div class="wBlock__content_left"><p><?php echo __('Каждый Ваш отзыв очень важен для Нас');?></p></div>
<div>
 <button data-url="/popup/sendReview" data-param="{&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}" class="wBtn mfiA">
                    <span><?php echo __('Оставьте Ваш отзыв о нашей работе');?></span>
</button>
</div class="wBlock__content_left">
 <hr />
<div class="wAccordeon">
            
  <?php 
  foreach ($result as $item): 
  ?>
    <div class="wAccordeon__item w_clearfix" >
    <div class="wAccordeon__item__top js-accordeon_btn">
        
        <span>
        
        <?php echo gmdate("d.m.Y",$item->date) ?>
        <?php echo " ".$item->name." "; ?>
        
        </span>
    </div>
    
    <div class="wAccordeon__item__content wReview_content">
        <p><?php echo $item->text; ?></p>
        
        <?php if($item->date_answer):?>
        
        <div class="review-answer" >
          <div class="review-item-label">
          <span><?php echo gmdate("d.m.Y",$item->date) ?>&nbsp;<?php echo __('ОТВЕТ "СК АСКО ДС"');?></span>
          </div>
          <p><?php echo $item->answer; ?></p>
        </div>
        <?php endif; ?>
    </div>
    
    
    </div>
 
  <?php endforeach; ?>
</div>
<?php //echo \Core\Widgets::get('VacancyQuestion'); ?>


            

</div><!-- eof wBlock_review -->
</div><!-- eof wSize padding_in -->
</div><!-- eof wBlock_content c_light -->