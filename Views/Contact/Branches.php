<div class="wBlock_contacts__branches c_light">
    <div class="wSize padding_in">
        <div class="wTitle">
            <p><?php echo __('Филиалы');?></p>
        </div>
        <div class="wAccordeon">
            <?php foreach($result as $key => $obj): ?>
                <div class="wAccordeon__item <?php echo $key == 0 ? 'curr' : null; ?> w_clearfix">
                    <div class="wAccordeon__item__top js-accordeon_btn"><span><?php echo $obj->name; ?></span></div>
                    <div class="wAccordeon__item__content">
                        <div class="wTxt">
                            <?php echo $obj->text; ?>
                        </div>
                        <div class="wAccordeon__item__content--map">
                            <div class="map">
                                <?php echo $obj->map; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>