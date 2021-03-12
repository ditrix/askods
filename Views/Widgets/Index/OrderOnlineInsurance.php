<div class="wBlock order_insurance_online inviewI">
    <div class="wSize">
        <div class="order_insurance_online__block">
            <div class="wTitle w_tac">
                <p><?php /*echo \Core\Config::get('main_texts.order_online_h1'); */?><?php echo __('Заказать страховку online');?></p>
            </div>
            <span><?php /*echo nl2br(\Core\Config::get('main_texts.order_subtext')); */?>
                <?php echo __('в данном разделе вы можете заказать страховой продукт,<br> воспользовавшись формой обратной связи и калькулятором тарифа');?>
            </span>
            <ul>
                <?php foreach($result as $obj): ?>
                    <li>
                     
                    
                    	<? if ($obj->altlink): ?>
                            <? if ( ($obj->altlink) == 'https://shop.askods.com' ): ?>
                                <a href="https://shop.askods.com" >     
                            <? else:?>        
                    		  <a href="<?php echo \Core\HTML::link($obj->altlink, true); ?>">
                            <? endif; ?>    
					   <? else: ?>
                        	<a href="<?php echo \Core\HTML::link('strahovye-uslugi/' . $obj->alias); ?>">
						 
                     <? endif; ?>   
                                <span class="svgHolder"><svg><use xlink:href="#<?php echo $obj->icon; ?>"/></svg></span>
                                <span class="title"><?php echo $obj->name; ?></span>
                            </a>
                        
                    </li>
                <?php endforeach; ?>
            </ul>
                <a href="https://shop.askods.com" class="wBtn">
                    <span><?php echo __('Купить страховой полис');?></span>
                </a>
            </div>
        </div>
    </div>
</div>