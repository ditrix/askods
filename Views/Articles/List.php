<?php foreach ( $result as $obj ): ?>
    <div class="news clearFix">
        <?php if ( is_file( HOST.Core\HTML::media('/images/articles/big/'.$obj->image) ) ): ?>
            <div class="fll">
                <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="news_img">
                    <img src="<?php echo Core\HTML::media('/images/articles/big/'.$obj->image); ?>" alt="" />
                </a>
            </div>
        <?php endif ?>
        <div class="flr">
            <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="name_news"><?php echo $obj->name; ?></a>
            <p><?php echo Core\Text::limit_words( strip_tags( $obj->text ), 100 ); ?></p>
            <a href="<?php echo Core\HTML::link('articles/'.$obj->alias); ?>" class="slide_but">подробнее</a>
        </div>
    </div>
<?php endforeach; ?>
<?php echo $pager; ?>