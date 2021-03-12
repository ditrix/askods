<div class="list" style="text-align: center;">
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
</div>