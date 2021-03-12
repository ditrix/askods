<?php if(count($result)): ?>
    <div class="wTop_block_menu">
        <div class="wSize">
            <div class="menu-slider js-menu-slider">
                <div class="slider-nav">
                    <span class="prev"></span>
                    <span class="next"></span>
                </div>
                <ul class="variable-width">
                    <?php foreach($result as $obj): ?>
                        <li>
                            <a href="<?php echo \Core\HTML::link($prefix . $obj->alias, true); ?>"
                        <?php echo stristr($_SERVER['REQUEST_URI'], $prefix . $obj->alias) !== false ? ' class="curr"' : null ; ?>
    <!--                            --><?php /*echo \Core\Route::param('alias') == $obj->alias ? ' class="curr"' : null ; */?>
                            ><?php echo $obj->name; ?></a>
                        </li>
                    <?php endforeach; ?>
                </ul>                
            </div>
        </div>
    </div>
<?php endif; ?>