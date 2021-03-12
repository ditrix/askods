<ul>
    <?php foreach ($result as $obj): ?>
        <li class="list_news__item">
            <span class="list_news__item__img">
                <a href="<?php echo \Core\HTML::link('news/' . $obj->alias) ?>" title="<?php echo $obj->name ?>">
                    <?php if (is_file(HOST . \Core\HTML::media('images/news/small/' . $obj->image))): ?>
                        <img src="<?php echo \Core\HTML::media('images/news/small/' . $obj->image) ?>" alt="<?php echo $obj->name ?>">
                    <?php else: ?>
                        <img src="<?php echo \Core\HTML::media('pic/no-news-small-image.png') ?>">
                    <?php endif; ?>
                </a>
            </span>
            <span class="list_news__item__bottom">
                <span class="list_news__item__bottom--date"><?php echo date('d-m-Y', $obj->date) ?></span>
                <a href="<?php echo \Core\HTML::link('news/' . $obj->alias) ?>" title="<?php echo $obj->name ?>"
                   class="list_news__item__bottom--title"><span><?php echo $obj->name ?></span></a>
            </span>
        </li>
    <?php endforeach; ?>
</ul>