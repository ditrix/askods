<div class="accordeon">
    <ul>
        <?php foreach( $result[0] as $main ): ?>
            <li>
                <a href="<?php echo Core\HTML::link('products/'.$main->alias); ?>" class="cat_raz_name"><?php echo $main->name; ?></a>
                <?php if( isset($result[$main->id]) ): ?>
                    <span><?php echo $main->id == $root ? '-' : '+'; ?></span>
                    <ul class="<?php echo $main->id == $root ? 'show_acc' : ''; ?>">
                        <?php foreach( $result[$main->id] as $obj ): ?>
                            <li><a href="<?php echo Core\HTML::link('products/'.$obj->alias); ?>"><?php echo $obj->name; ?></a></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif ?>
            </li>
        <?php endforeach; ?>
    </ul>
</div>