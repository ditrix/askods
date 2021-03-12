<div class="wBlock_contacts">
    <div class="wBlock_contacts__top">
        <div class="wSize padding_in">
            <div class="wTitle w_tal c_white">
                <h1><?php echo $current->h1 ?: $current->name; ?></h1>
            </div>
            <?php echo \Core\View::tpl(['countFilials' => $countFilials, 'countCities' => $countCities], 'Contact/Map'); ?>
            <div class="wBlock_contacts__top--left wTxt">
                <?php echo $current->text; ?>
            </div>
        </div>
    </div>
    <?php if(count($branches)): ?>
        <?php echo \Core\View::tpl(['result' => $branches], 'Contact/Branches'); ?>
    <?php endif; ?>
</div>

<?php echo \Core\Widgets::get('VacancyQuestion'); ?>
