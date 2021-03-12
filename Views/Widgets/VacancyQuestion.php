<div class="wBlock bottom_form">
    <div class="wSize">
        <div class="bottom_form__block">
            <div class="wTitle w_tac">
                <p><?php echo __('У Вас возникли вопросы?');?></p>
            </div>
            <span><?php /*echo nl2br(\Core\Config::get('static.label_form_vacancy_questions')); */?>
                <?php echo __('Если вы хотите подробнее узнать о вакансиях, предлагаемых нашей компанией, вы можете: связаться с одним из наших филиалов или с Центральным офисом по телефону или по электронной почте (e-mail)');?>
            </span>
            <div data-form="true" class="wForm wFormDef" data-ajax="vacancyQuestion">
                <div class="wFormRow_2col w_clearfix">
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" type="text" name="f_name" id="f_name" data-name="name"
                                   placeholder="<?php echo __('Ваше имя');?>" data-rule-word="true" data-rule-minlength="2">
                            <div class="inpInfo"><?php echo __('Ваше имя');?> *</div>
                        </div>
                    </div>
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" type="text" name="f_city" data-name="city" id="f_name"
                                   placeholder="<?php echo __('Ваш город');?>" data-rule-word="true">
                            <div class="inpInfo"><?php echo __('Ваш город');?> *</div>
                        </div>
                    </div>
                </div>
                <div class="wFormRow_2col w_clearfix">
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" type="email" name="f_e-mail" data-name="email" id="f_e-mail"
                                   placeholder="<?php echo __('Ваш e-mail');?>" data-rule-email="true">
                            <div class="inpInfo"><?php echo __('Ваш e-mail');?> *</div>
                        </div>
                    </div>
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <input class="wInput" required type="tel" name="f_phone" data-name="phone" id="f_phone"
                                   placeholder="<?php echo __('Номер телефона');?>" data-rule-phoneua="true">
                            <div for="f_phone" class="inpInfo"><?php echo __('Номер телефона');?> *</div>
                        </div>
                    </div>
                </div>
                <div class="wFormRow">
                    <div class="wFormInput">
                        <textarea class="wTextarea" name="demo_textarea" id="demo_textarea" data-name="message"
                                  placeholder="<?php echo __('Текст сообщения');?>" data-rule-minlength="4"></textarea>
                        <div class="inpInfo"><?php echo __('Текст сообщения');?></div>
                    </div>
                </div>
                <input type="hidden" hidden="hidden" data-name="lang" value="<?php echo I18n::$lang;?>">
                <?php if(array_key_exists('token', $_SESSION)): ?>
                    <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
                <?php endif; ?>
                <div class="wFormRow w_last w_tac">
                    <button class="wSubmit wBtn"> <span><?php echo __('Отправить');?></span></button>
                </div>
            </div>
        </div>
    </div>
</div>