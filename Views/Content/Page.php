<?php echo \Core\Widgets::get('SubMenu', ['result' => $kids]); ?>
<div class="wBlock_content c_light">	
    <div class="wSize padding_in">
        <div class="wTitle w_tal">
            <h1><?php echo $obj->h1 ?: $obj->name; ?></h1>
        </div>
        <div class="about_company">
            <?php if($obj->show_girl): ?>
                <span class="about_company--img">
                    <img src="<?php echo \Core\HTML::media('pic/about-company--img.png'); ?>" alt="<?php echo $obj->name; ?>">
                </span>
            <?php endif; ?>
            <div class="wTxt <?php echo $obj->show_girl ? 'about_company--content' : null; ?>">
                <?php echo $obj->text; ?>
            </div>

        </div>
    </div>
</div>
<?php echo $obj->show_benefits ? \Core\Widgets::get('Benefits') : null; ?>