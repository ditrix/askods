<div class="brand-top-wrap wTxt">
	<div class="bt-text">
    	<?php echo $brand->text; ?>
    </div>
    <?php if( is_file(HOST.Core\HTML::media('images/brands/small/'.$brand->image)) ): ?>
    	<a class="bt-pic fresco" data-fresco-group="gr1" href="<?php echo Core\HTML::media('images/brands/original/'.$brand->image); ?>">
			<img src="<?php echo Core\HTML::media('images/brands/small/'.$brand->image); ?>" alt="<?php echo $brand->name; ?>" title="<?php echo $brand->name; ?>" class="floatleft brandInnerPic" />
		</a>
    <?php endif ?>
</div>
