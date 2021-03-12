<div class="wBlock_service__form">
   
 
    <div data-form="true" class="wForm wFormDef" data-ajax="orderItem">
        <div class="contact-data">
         
<?php  if(!($item->id == 159)):  ?> 
        <div class="wFormRow">
            <label for="f_name" class="wLabel">
				<span class="wLabelContent"><?php echo __('Ваше имя');?> *</span></label>
            <div class="wFormInput">
                <input class="wInput" required type="text" name="f_name" data-name="name" id="f_name" placeholder="" data-rule-word="true" data-rule-minlength="2">
                <div class="inpInfo"><?php echo __('Ваше имя');?> *</div>
            </div>
        </div>

        <div class="wFormRow">
            <label for="f_e-mail" class="wLabel"><span class="wLabelContent"><?php echo __('Ваш e-mail');?> *</span></label>
            <div class="wFormInput">
                <input class="wInput" required type="email" name="f_e-mail" data-name="email" id="f_e-mail" placeholder="" data-rule-email="true">
                <div class="inpInfo"><?php echo __('Ваш e-mail');?> *</div>
            </div>
        </div>
        <div class="wFormRow">
            <label for="f_phone" class="wLabel"><span class="wLabelContent"><?php echo __('Мобильный телефон');?> *</span></label>
            <div class="wFormInput">
                <input class="wInput" required type="tel" name="f_phone" data-name="phone" id="f_phone" placeholder="" data-rule-phoneua="true">
                <div for="f_phone" class="inpInfo"><?php echo __('Мобильный телефон');?> *</div>
            </div>
        </div>
        <div class="wFormRow">
            <label for="f_region" class="wLabel"><span class="wLabelContent"><?php echo __('Область');?> *</span></label>
            <div class="wFormInput">
                <select class="sbi wSelect" required name="f_region" data-name="region" id="f_region" onchange="calc_pay(<?php echo $item->id; ?>)">
                    <option value="" selected disabled><span class="wLabelContent"><?php echo __('Выберите пункт');?></span></option>
                    <?php foreach($regions as $region): ?>
                        <option value="<?php echo $region->id; ?>"><?php echo $region->name; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
        </div>
        <div class="wFormRow">
            <label for="f_city" class="wLabel"><span class="wLabelContent"><?php echo __('Город');?> *</span></label>
            <div class="wFormInput">
                <select class="sbi wSelect" required name="f_city" data-name="city" id="f_city">
                    <option value="" selected disabled><?php echo __('Выберите пункт');?></option>
                </select>
            </div>
        </div>
    </div> 
<?php endif ?>

        <?php foreach($fields as $row): ?>
            <?php $field = \Core\Arr::get($row, 'field'); $values = \Core\Arr::get($row, 'values'); ?>
            <?php if($field->type_id == 1): ?>
                <div class="wFormRow">
                    <label for="f_<?php echo $field->alias; ?>" class="wLabel"><span class="wLabelContent"><?php echo $field->name; ?> *</span></label>
                    <div class="wFormInput">
                        <input class="wInput" type="text" name="f_<?php echo $field->alias; ?>" data-name="FIELDS[<?php echo $field->alias; ?>]"
                               id="f_<?php echo $field->alias; ?>" required="required">
                        <div class="inpInfo"><?php echo $field->name; ?> *</div>
                    </div>
                </div>
            <?php else: ?>
                <div class="wFormRow">
                    <label for="f_<?php echo $field->alias; ?>" class="wLabel"><span class="wLabelContent"><?php echo $field->name; ?> *</span></label>
                    <div class="wFormInput">
                        <select class="sbi wSelect" name="f_<?php echo $field->alias; ?>" data-name="FIELDS[<?php echo $field->alias; ?>]"
                                id="f_<?php echo $field->alias; ?>" required="required" onchange="calc_pay(<?php echo $item->id; ?>)">
                            <option value="" selected disabled><?php echo __('Выберите пункт');?></option>
                            <?php foreach($values as $value): ?>
                                <option value="<?php echo $value->specification_value_alias; ?>"><?php echo $value->name; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
        <?php if(array_key_exists('token', $_SESSION)): ?>
            <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>">
        <?php endif; ?>
        <input type="hidden" hidden="hidden" data-name="lang" value="<?php echo I18n::$lang;?>">
        <input type="hidden" data-name="item-id" value="<?php echo $item->id; ?>">
         <div class="wFormRow w_last w_tac">
    
            <?php if($item->id == 159): ?>
                <a href="https://shop.askods.com" class="wSubmit wBtn" target="_blank"> <span><?php echo __('ПРОДОЛЖИТЬ ПОКУПКУ');?></span></a>
            <?php else: ?>
                <button class="wSubmit wBtn"> <span><?php echo __('Заказать');?></span></button>                
            <?php endif ?>
          </div>
    </div>
</div>
