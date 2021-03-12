<?php echo \Core\Widgets::get('SubMenu', ['prefix' => $current->alias . '/', 'result' => $menu]); ?>
<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wBlock_service">
            <div class="wTitle w_tal">
                <h1><?php echo $h1 ?: $obj->name; ?></h1>
            </div>
            <div class="wBlock_service_wrap">
                <div class="<?php echo ($obj->show_banner OR ($obj->show_files && count($files))) ? 'wBlock_service_center' : null; ?>">
                    <div class="wBlock_service_content wTxt">
                        <?php echo $obj->text; ?>
                    </div>
                </div>

                <?php if($obj->show_banner OR ($obj->show_files && count($files))): ?>
                    <div class="wBlock_service_right">

                        <?php echo $obj->show_banner ? \Core\Widgets::get('Banner') : null; ?>

                        <?php if($obj->show_files && count($files)): ?>
                            <?php echo \Core\View::tpl(['files' => $files, 'directory' => $directory], 'BuyInsurance/Files'); ?>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

