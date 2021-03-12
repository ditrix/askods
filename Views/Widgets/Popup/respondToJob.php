<div class="mfiModal zoomAnim big">
    <div class="mfiModal__content">
        <div class="bottom_form__block">
            <div class="wTitle w_tac">
                <p><?php echo __('Откликнуться на вакансию');?></p>
            </div>
            <span><?php echo nl2br(\Core\Config::get('static.label_form_response_to_job')); ?></span>
            <div data-form="true" class="wForm wFormDef" data-ajax="respondToJob">
                <div class="wFormRow">
                    <div class="wFormInput">
                        <input class="wInput" required="required" type="text" name="f_name" data-name="name" id="f_name" 
                               placeholder="<?php echo __('Ваше имя');?>" data-rule-word="true" data-rule-minlength='2'/>
                        <div class="inpInfo"><?php echo __('Ваше имя');?> *</div>
                    </div>
                </div>
                <div class="wFormRow">
                    <div class="wFormInput">
                        <input class="wInput" required="required" type="email" name="f_e-mail" data-name="email" id="f_e-mail" 
                               placeholder="<?php echo __('Ваш e-mail');?>" data-rule-email="true"/>
                        <div class="inpInfo"><?php echo __('Ваш e-mail');?> *</div>
                    </div>
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" required="required" type="tel" name="f_phone" data-name="phone" id="f_phone" 
                                   placeholder="<?php echo __('Номер телефона');?>" data-rule-phoneUA="true"/>
                            <div for="f_phone" class="inpInfo"><?php echo __('Номер телефона');?> *</div>
                        </div>
                    </div>
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <textarea class="wTextarea" name="demo_textarea" id="demo_textarea" data-name="message" placeholder="<?php echo __('Текст сообщения');?>"
                                      data-rule-minlength='4'></textarea>
                            <div class="inpInfo"><?php echo __('Текст сообщения');?></div>
                        </div>
                    </div>
                    <?php if(array_key_exists('token', $_SESSION)): ?>
                        <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
                    <?php endif; ?>
                    <input type="hidden" hidden="hidden" data-name="lang" value="<?php echo I18n::$lang;?>">
                    <input type="hidden" data-name="vacancy_id" value="<?php echo $vacancyId; ?>">
                    <div class="wFormRow w_last w_tac">
                        <button class="wSubmit wBtn"> <span><?php echo __('Отправить');?></span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>