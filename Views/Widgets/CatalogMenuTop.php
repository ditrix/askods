<?php $controller = Core\Route::controller(); ?>
<?php $action = Core\Route::action(); ?>
<ul>
    <li <?php echo ($controller == 'catalog' AND in_array($action, array('index', 'list', 'groups', 'item'))) ? 'class="active_li_top"' : ''; ?>>
        <a href="<?php echo Core\HTML::link('products'); ?>"><div>каталог</div></a><div class="list top_list">
        <ul>
            <?php foreach( $result[0] as $main ): ?>
                <li>
                    <a href="<?php echo Core\HTML::link('products/'.$main->alias); ?>" class="title_li"><?php echo $main->name; ?></a>
                    <?php if( isset($result[$main->id]) ): ?>
                        <ul>
                            <?php foreach( $result[$main->id] as $obj ): ?>
                                <li><a href="<?php echo Core\HTML::link('products/'.$obj->alias); ?>"><?php echo $obj->name; ?></a></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div></li>
    <li <?php echo ($controller == 'catalog' AND $action == 'new') ? 'class="active_li_top"' : ''; ?>><a href="<?php echo Core\HTML::link('new'); ?>"><div>новинки</div></a></li>
    <li <?php echo ($controller == 'catalog' AND $action == 'popular') ? 'class="active_li_top"' : ''; ?>><a href="<?php echo Core\HTML::link('popular'); ?>"><div>популярные</div></a></li>
    <li <?php echo ($controller == 'catalog' AND $action == 'sale') ? 'class="active_li_top"' : ''; ?>><a href="<?php echo Core\HTML::link('sale'); ?>"><div>акции</div></a></li>
    <li <?php echo $controller == 'brands' ? 'class="active_li_top"' : ''; ?>><a href="<?php echo Core\HTML::link('brands'); ?>"><div>бренды</div></a></li>
</ul>