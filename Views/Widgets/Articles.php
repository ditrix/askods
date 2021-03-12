<div class="wMiddle">
    <div class="middle_title">статьи</div>
    <div class="stat_slider_block">
        <ul class="stat_slider">
            <?php foreach ( $result as $obj ): ?>
                <li class="stat_block">
                    <?php if (is_file(HOST.Core\HTML::media('/images/articles/small/'.$obj->image))): ?>
                        <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="stat_img">
                            <img src="<?php echo Core\HTML::media('images/articles/small/'.$obj->image); ?>" alt="">
                        </a>
                    <?php endif ?>
                    <div class="opus_block">
                        <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="opus_title"><?php echo $obj->name; ?></a>
                        <p><?php echo Core\Text::limit_words( $obj->text, 40 ); ?></p>
                        <div class="clear"></div>
                        <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="opus_but">подробнее...</a>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <a href="<?php echo Core\HTML::link('articles'); ?>" class="slide_but">архив статей</a>
    <div class="prev2"><div class="arrow"></div></div>
    <div class="next2"><div class="arrow"></div></div>
</div>