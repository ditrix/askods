<div class="clock_support_in">
    <div class="wTitle w_tac">
        <p><?php /*echo \Core\Config::get('main_texts.clock_support'); */?><?php echo __('Круглосуточная поддержка');?></p>
    </div>
    <div class="wBlock clock_support">
        <div class="wSize">
            <div class="clock_support__block">
                <p><?php /*echo \Core\Config::get('main_texts.call_by_phone'); */?><?php echo __('позвоните по телефону');?></p>
                <?php if($phone = \Core\Config::get('static.phone')): ?>
                    <a href="tel:<?php echo preg_replace('/\D/', '', $phone); ?>"><?php echo $phone; ?></a>
                <?php endif; ?>
					<?php $head_phone = '050-450-15-60'?>
                       <a href="tel:<?php echo preg_replace('/\D/', '', $head_phone); ?>"><?php echo $head_phone; ?></a>
                        
                <p><?php /*echo \Core\Config::get('main_texts.or_send_request'); */?>
						<?php echo __('или <span>отправьте заявку </span>с сайта');?></p>
                <div class="clock_support__btn">
                    <button data-url="/popup/insuredEvent" class="wBtn mfiA"
                            data-param="{&quot;page_name&quot;:&quot;<?php echo \Core\Config::get('pageName'); ?>&quot;,&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}">
                        <span><?php /*echo \Core\Config::get('main_texts.insured_event_button'); */?><?php echo __('Заявить о страховом случае');?></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>