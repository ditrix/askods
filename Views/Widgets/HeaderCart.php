<header class="wHeader">
	<div class="wSize">
		<div class="head_top">
			<div class="fll">
				<ul>
                    <li><a href="<?php echo Core\HTML::link(); ?>"><div class="gl"></div></a></li>
                    <?php foreach ( $contentMenu as $obj ): ?>
                        <li><a href="<?php echo Core\HTML::link($obj->url); ?>"><?php echo $obj->name; ?></a></li>
                    <?php endforeach; ?>
				</ul>
			</div>
			<div class="flr">
				<div class="block_p">
					<a href="tel:<?php echo Core\Config::get( 'static.phone' ); ?>?call" class="head_phone"><?php echo Core\Config::get( 'static.phone' ); ?></a>
					<a href="#enterReg2" class="call_back enterReg2"><span>ОБРАТНЫЙ ЗВОНОК</span></a>
				</div>
			</div>
			<div class="flc">
				<a href="<?php echo Core\HTML::link(); ?>"><img src="<?php echo Core\HTML::media('pic/logo.png'); ?>" alt=""></a>
			</div>
		</div>
	</div>
</header>