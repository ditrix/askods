<div class="wSize">
    <nav id="js-menu" class="wMenu">
        <ul>
            <?php foreach($menu[0] as $link): ?>
                <li>
                    <a href="<?php echo \Core\HTML::link($link->url, true); ?>"><?php echo $link->name; ?></a>
                    <?php if(count($menu[$link->id])): ?>
                        <ul>
                            <?php foreach($menu[$link->id] as $subLink): ?>
                                <li>
                                    <a href="<?php echo \Core\HTML::link($subLink->url, true); ?>"><span><?php echo $subLink->name; ?></span></a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
            <li class="to_declare">
                <button data-url="/popup/insuredEvent" data-param="{&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}" class="wBtn mfiA">
                    <span><?php echo __('Заявить о страховом случае');?></span>
                </button>
            </li>
        </ul>
    </nav>
    <!-- wMenu -->
</div>
