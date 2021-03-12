<div class="mfiModal zoomAnim big">
    <div class="mfiModal__content">
         <div class="bottom_form__block">
        <div class="wTitle w_tac">
                <p class="insure-event-title"><?php echo __('Заявить о страховом случае');?></p>
        </div>
		
        <div class="wSubTitle w_tac">
			<p class="insure-event-sub-title">
				<?php echo __('Позвоните нам');?>
			</p>	
		</div>
        <div class="event-phones-area">
        <div class="event-row">            
        <article class="event-content">
            <?php echo __('Позвонить при страховом случае имущество ответственность');?>
        </article>
        <aside class="event-phones">
            0-800-50-15-60<br>
            <span><?php echo __('или');?></span><br>
            050-450-15-60
        </aside>       
        </div>    
        <div class="clr"></div>
        
        <div class="event-row">
            
        <article class="event-content">
            <?php echo __('Позвонить по договорам корпоративного медицинского страхования');?>
        </article>
        <aside class="event-phones">
            050-864-77-10<br>
            068-354-04-12<br>
            044-599-10-31<br>
        </aside>                
        </div>        
        <div class="clr"></div>
        </div>
		<br>
		<div class="wSubTitle w_tac">
			<p class="insure-event-sub-title">
				<?php echo __('отправьте нам сообщение');?>
			</p>	
		</div>	 
        <div data-form="true" class="wForm wFormDef" data-ajax="callback">
                <div class="wFormRow">
                    <div class="wFormInput">
                        <input class="wInput" required="required" type="text" name="f_name" data-name="name" id="f_name"
                               placeholder="<?php echo __('Ваше имя');?>" data-rule-word="true" data-rule-minlength='2'/>
                        <div class="inpInfo"><?php echo __('Ваше имя');?> *</div>
                    </div>
                </div>
                <div class="wFormRow">
                    <div class="wFormInput">
                        <input class="wInput" required="required" type="email" name="f_e-mail" data-name="email"
                               id="f_e-mail" placeholder="<?php echo __('Ваш e-mail');?>" data-rule-email="true"/>
                        <div class="inpInfo"><?php echo __('Ваш e-mail');?> *</div>
                    </div>
                    
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" required="required" type="tel" name="f_phone" data-name="phone"
                                   id="f_phone" placeholder="<?php echo __('Номер телефона');?>" data-rule-phoneUA="true"/>
                            <div for="f_phone" class="inpInfo"><?php echo __('Номер телефона');?> *</div>
                        </div>
                    </div>
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" required="required" type="text" name="f_polis" data-name="polis"
                                   id="f_polis" placeholder="<?php echo __('Номер договора страхования');?>" data-rule-minlength='2'/>
                            <div for="f_polis" class="inpInfo"><?php echo __('Номер договора страхования');?> *</div>
                        </div>
                    </div>
                    
                    
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <textarea class="wTextarea" name="f_message" data-name="message" id="f_message"
                                      placeholder="<?php echo __('Текст сообщения');?>" data-rule-minlength='4'></textarea>
                            <div class="inpInfo"><?php echo __('Текст сообщения');?></div>
                        </div>
                    </div>
                    <?php if(array_key_exists('token', $_SESSION)): ?>
                        <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
                    <?php endif; ?>
                    <input type="hidden" hidden="hidden" data-name="lang" value="<?php echo I18n::$lang;?>"> 
                    <input type="hidden" data-name="page_name" value="<?php echo \Core\Arr::get($_POST, 'page_name'); ?>">
                    <div class="wFormRow w_last w_tac">
                        <button class="wSubmit wBtn"> <span><?php echo __('Отправить');?></span></button>
                    </div>            
            
        </div>
      <div>  
    </div>
</div>