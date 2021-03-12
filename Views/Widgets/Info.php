<div class="flc">
    <ul>
        <?php foreach ( $result AS $obj ): ?>
            <li class="<?php echo $obj->class; ?>">
                <a href="<?php echo Core\HTML::link($obj->alias); ?>" class="podsk"></a>
                <div class="podask_in"><?php echo $obj->name; ?></div>
            </li>
        <?php endforeach; ?>
    </ul>
</div>