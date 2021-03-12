<div class="novelty clearFix">
    <div class="fll">
        <div class="new_pos">последние<br>просмотры</div>
        <a href="<?php echo Core\HTML::link('viewed'); ?>" class="slide_but"><span>пререйти в раздел</span></a>
    </div>
    <div class="flr">
        <ul>
            <?php foreach( $result as $obj ): ?>
                <?php echo Core\View::tpl(array('obj' => $obj), 'Catalog/ListItemTemplate'); ?>
            <?php endforeach; ?>
        </ul>
    </div>
</div>