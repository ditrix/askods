<div class="wBlock_service_right--banner">
    <?php if ($banner->url): ?>
        <a href="<?php echo \Core\HTML::link($banner->url, true) ?>" title="<?php echo \Core\HTML::chars($banner->text) ?>">
            <img src="<?php echo \Core\HTML::media('images/banners/' . $banner->file) ?>" alt="<?php echo \Core\HTML::chars($banner->text) ?>">
        </a>
    <?php else: ?>
        <span>
            <img src="<?php echo \Core\HTML::media('images/banners/' . $banner->file) ?>" alt="<?php echo \Core\HTML::chars($banner->text) ?>">
        </span>
    <?php endif; ?>
</div>