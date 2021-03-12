<div class="alphabet">
	<?php foreach (Core\Arr::get($alphabet, 'en') as $letter): ?>
		<?php echo '<a href="#" '.( count( Core\Arr::get( Core\Arr::get( $alphabet, 'res_en' ), $letter ) ) ? '' : 'class="non-active"').' data-id="'.$letter.'1">'.$letter.'</a>'; ?>
	<?php endforeach ?>
</div>
<div class="alphabet rus">
    <?php foreach (Core\Arr::get($alphabet, 'ru') as $letter): ?>
		<?php echo '<a href="#" '.( count( Core\Arr::get( Core\Arr::get( $alphabet, 'res_ru' ), $letter ) ) ? '' : 'class="non-active"').' data-id="'.Core\Text::translit($letter).'2">'.$letter.'</a>'; ?>
	<?php endforeach ?>
</div>
<div class="bline_wrapper">
	<?php foreach (Core\Arr::get($alphabet, 'res_en') as $letter => $result): ?>
		<div class="b-line" id="<?php echo $letter.'1'; ?>">
		    <a href="#" class="alpha-link"><?php echo $letter; ?></a>
		    <div class="b-group">
		    	<?php foreach ($result as $obj): ?>
		    		<a href="<?php echo Core\HTML::link('brands/'.$obj->alias); ?>" class="b-link">
		    			<span class="b-link-name"><?php echo $obj->name; ?></span>
			            <span class="b-link-pic">
			            	<?php if(is_file(HOST.Core\HTML::media('images/brands/small/'.$obj->image))): ?>
			            		<img src="<?php echo Core\HTML::media('images/brands/small/'.$obj->image); ?>" alt="<?php echo $obj->name; ?>" title="<?php echo $obj->name; ?>" />
			            	<?php endif; ?>
			            </span>
			        </a>
		    	<?php endforeach ?>
		    </div>
		</div>
	<?php endforeach ?>

	<?php foreach (Core\Arr::get($alphabet, 'res_ru') as $letter => $result): ?>
		<div class="b-line" id="<?php echo Core\Text::translit($letter).'2'; ?>">
		    <a href="#" class="alpha-link"><?php echo $letter; ?></a>
		    <div class="b-group">
		    	<?php foreach ($result as $obj): ?>
		    		<a href="<?php echo Core\HTML::link('brands/'.$obj->alias); ?>" class="b-link">
		    			<span class="b-link-name"><?php echo $obj->name; ?></span>
			            <span class="b-link-pic">
			            	<?php if(is_file(HOST.Core\HTML::media('images/brands/small/'.$obj->image))): ?>
			            		<img src="<?php echo Core\HTML::media('images/brands/small/'.$obj->image); ?>" alt="<?php echo $obj->name; ?>" title="<?php echo $obj->name; ?>" />
			            	<?php endif; ?>
			            </span>
			        </a>
		    	<?php endforeach ?>
		    </div>
		</div>
	<?php endforeach ?>
</div>
<script>
	$(document).ready(function(){
		$('.alphabet a').on('click', function(e){
			e.preventDefault();
			if(!$(this).hasClass('non-active')) {
				var offset = $("#" + $(this).attr('data-id')).offset().top;
				$("html, body").animate({ scrollTop: offset }, 600);
			}
		});
		$('.b-line a.alpha-link').on('click', function(){
			return false;
		});
	});
</script>