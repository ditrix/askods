<div class="mfiModal zoomAnim big">
    <div class="mfiModal__content">
        <div class="bottom_form__block wFormReview">
            <div class="wTitle w_tac">
                <div class="middle_title"><!-- был заголовок отзыва на вакансию -->
                <h1><?php echo __('отправить отзыв');?></h1>
                </div>
            </div>
            <p>
              <?php echo __('Убедительная просьба предоставить действующие контактные данные для того, чтобы сотрудники “СК АСКО ДС” могли связаться с Вами для решения Вашей проблемы! Ваши контакты будут доступны только сотрудникам компании и использоваться в соответствии с Законом Украины о Персональных данных.')?>
            </p>
            <div data-form="true" class="wForm wFormDef" data-ajax="sendReview">
                <div class="wFormReviewRow">
                    <div class="_wFormInput  wReviewInput">
                        <input class="wInput" required="required" type="text" name="f_name" data-name="name" id="f_name" 
                               placeholder="<?php echo __('Ваше имя');?>" data-rule-word="true" data-rule-minlength='2'/>
                        <div class="inpInfo"><?php echo __('Ваше имя');?> *</div>
                    </div>
                </div> <!-- wFormReviewRow -->
                
                <div class="wFormReviewRow">
                    <div class="wReviewInput">
                        <input class="wInput" type="tel" name="f_phone" data-name="phone"
                               required="required"
                               id="f_phone" placeholder="<?php echo __('Номер телефона');?>" data-rule-phoneua="true"/>
                        <div class="inpInfo"><?php echo __('Номер телефона');?> *</div>
                    </div>    
                </div> <!-- wFormReviewRow -->
                
                <div class="wFormReviewRow">
                    <div class="wReviewInput">
                        <input class="wInput" type="email" name="f_e-mail" data-name="email"
                               required="required"
                               id="f_e-mail" placeholder="<?php echo __('Ваш e-mail');?>" data-rule-email="true"/>
                        <div class="inpInfo"><?php echo __('Ваш e-mail');?> *</div>
                    </div>    
                </div> <!-- wFormReviewRow -->
                
                
                 <div class="wFormReviewRow">
                    <div class="wReviewInput">
                      <textarea class="wTextarea wReviewTextarea" name="demo_textarea" id="demo_textarea" data-name="message" placeholder="<?php echo __('отзыв');?>"
                           data-rule-minlength='4' required="required"></textarea>
                            <div class="inpInfo"><?php echo __('отзыв');?></div>
                    </div>
                 </div>
                    <?php if(array_key_exists('token', $_SESSION)): ?>
                        <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
                    <?php endif; ?>
                    <input type="hidden" hidden="hidden" data-name="lang" value="<?php echo I18n::$lang;?>">
                    <div class="wFormReviewRow w_last w_tac">
                        <button class="wSubmit wBtn"> <span><?php echo __('Отправить');?></span></button>
                    </div>
                
            </div>
        </div>
    </div>
</div>