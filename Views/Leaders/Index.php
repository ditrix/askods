<?php echo \Core\Widgets::get('SubMenu', ['result' => $kids]); ?>
<div class="wBlock_content c_light">
    <div class="wSize padding_in">
        <div class="wBlock_leadership">
            <div class="list_leadership">
                <div class="wTitle w_tal">
                    <h1><?php echo $current->h1 ?: $current->name; ?></h1>
                </div>
                <?php foreach($leaders as $obj): ?>
                    <div class="leadership__item">
                        <div class="leadership__item__center">
                            <?php if(is_file(HOST . \Core\HTML::media('images/leaders/' . $obj->image))): ?>
                                <span class="leadership__item--img">
                                    <img src="<?php echo \Core\HTML::media('images/leaders/' . $obj->image, true); ?>"
                                         alt="<?php echo $obj->name . ' ' . $obj->last_name; ?>">
                                </span>
                            <?php endif; ?>
                        </div>
                        <div class="leadership__item__left">
                            <div class="leadership__item__left__content">
                                <div class="leadership__item--name">
                                    <p> <span><?php echo $obj->name; ?> </span><?php echo $obj->last_name; ?></p>
                                </div>
                                <div class="leadership__item--position">
                                    <span><?php echo $obj->position; ?></span>
                                </div>
                            </div>
                        </div>
                        <div class="leadership__item__right">
                            <div class="leadership__item__right__content">
                                <p><?php echo nl2br($obj->text); ?></p>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            <div class="list_supervisory_board">
                <div class="wTitle w_tac">
                    <p><?php echo __('Наблюдательный совет');?></p>
                </div>
                <?php foreach($observers as $obj): ?>
                    <div class="supervisory_board__item w_clearfix">
                        <div class="supervisory_board__item--name">
                            <p> <span><?php echo $obj->name; ?></span><?php echo $obj->last_name; ?></p>
                        </div>
                        <div class="supervisory_board__item--position">
                            <span><?php echo $obj->position; ?></span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<?php echo $current->show_benefits ? \Core\Widgets::get('Benefits') : null; ?>