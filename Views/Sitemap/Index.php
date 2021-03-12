<div class="wSize">
    <h1 class="pageTitle">Карта сайта</h1>
    <nav class="wSitemap">
        <ul>
            <?php foreach($pages[0] AS $obj): ?>
                <li class="haveSubMenu">
                    <a href="<?php echo Core\HTML::link($obj->alias); ?>"><?php echo $obj->name; ?></a>
                    <?php echo Core\View::tpl(array('result' => $pages, 'cur' => $obj->id, 'add' => ''), 'Sitemap/Recursive'); ?>
                </li>
            <?php endforeach; ?>

            <li class="haveSubMenu">
                <a href="<?php echo Core\HTML::link('strahovye-uslugi'); ?>">Страховые услуги</a>
                <?php echo Core\View::tpl(array('result' => $groups, 'cur' => 0), 'Sitemap/Recursive'); ?>
            </li>
            <li>
                <a href="<?php echo Core\HTML::link('vacancy', true); ?>"><span>Вакансии</span></a>
            </li>
            <li class="haveSubMenu">
                <a href="<?php echo Core\HTML::link('kalkulyator-online'); ?>">Купить страховку</a>
                <?php if(count($items)): ?>
                    <ul>
                        <?php foreach($items AS $obj): ?>
                            <li><a href="<?php echo Core\HTML::link('kalkulyator-online/'.$obj->alias, true); ?>"><?php echo $obj->name; ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </li>
            <li class="haveSubMenu">
                <a href="<?php echo Core\HTML::link('news', true); ?>"><span>Новости</span></a>
                <?php if(count($news)): ?>
                    <ul>
                        <?php foreach($news AS $obj): ?>
                            <li><a href="<?php echo Core\HTML::link('news/'.$obj->alias, true); ?>"><?php echo $obj->name; ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </li>
            <li>
                <a href="<?php echo Core\HTML::link('contact', true); ?>"><span>Контакты</span></a>
            </li>
        </ul>
    </nav>
</div>
