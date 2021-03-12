<?php 
//echo \Core\Widgets::get('SubMenu', ['prefix' => $current->alias . '/buy/', 'result' => $result]); 
echo \Core\Widgets::get('SubMenu', ['prefix' => $current->alias . '/', 'result' => $result]); 
?>
<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wTitle w_tal">
            <h1><?php echo $current->h1 ?: $current->name; ?></h1>
        </div>
        <div class="about_company">
            <div class="wTxt">
                <?php echo $current->text; ?>
            </div>
        </div>
    </div>
</div>

