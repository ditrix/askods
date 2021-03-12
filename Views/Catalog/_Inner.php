<?php echo \Core\Widgets::get('SubMenu', ['result' => $kids]); ?>
<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wBlock_service">
            <div class="wTitle w_tal">
                <h1><?php echo $group->h1 ?: $group->name; ?></h1>
            </div>
            <div <?php echo $group->show_banner ? 'class="wBlock_service_center"' : null; ?>>
                <div class="wBlock_service_content wTxt">
                    <?php echo $group->text; ?>
                </div>
            </div>
            <?php if($group->show_banner): ?>
                <div class="wBlock_service_right">
                    <?php echo \Core\Widgets::get('Banner'); ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>