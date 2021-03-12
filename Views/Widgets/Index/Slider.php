<div class="wTop_slider_container">
    <div class="wTop_slider js-wTop_slider">
        <div class="wTop_slider__item">
            <div class="wTop_slider__item__left">
                <div>
                    <div class="wTop_slider__item--logo">
                        <img alt="аско лого" src="<?php echo \Core\HTML::media('pic/top-slider--item--logo-img.png'); ?>">
                    </div>
                    <div class="wTop_slider__item--title">
						<span><?php echo __('Придаем<br> увереность');?></span>
					  
					<!--// echo $result[14]->description; -->
					<span style="font-size: 38px;"><?php echo __('компенсируем убытки')?></span>
					
					</div>
                    <?php if($result[14]->url): ?>
                        <a href="<?php //echo \Core\HTML::link($result[14]->url, true); ?>https://shop.askods.com"
                           class="wTop_slider__item--btn wBtn w_tac"><span><?php echo __('Купить страховой полис');?></span></a>
                        <div><br /></div>
                        <a href="<?php //echo \Core\HTML::link($result[14]->url, true); ?>https://epolis.askods.dn.ua/osago/"
                           class="wTop_slider__item--btn wBtn w_tac"><span><?php echo __('Купити електронний поліс ОСГПО');?></span></a>

                    <?php endif; ?>
                </div>
            </div>
            <div class="wTop_slider__item__img">
                <div class="wTop_slider__item__img--front">
                    <img alt="аскоds" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-1.png'); ?>">
                </div>
                <div class="wTop_slider__item__img--back">
                    <img alt="аскоds" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-1-2.png'); ?>">
                </div>
            </div>
        </div>
        <div class="wTop_slider__item">
            <div class="wTop_slider__item__left">
                <div>
                    <div class="wTop_slider__item--logo">
                        <img alt="аско лого" src="<?php echo \Core\HTML::media('pic/top-slider--item--logo-img.png'); ?>">
                    </div>
                    <div class="wTop_slider__item--title"><span><?php echo $result[13]->description; ?></span></div>
                    <?php if($result[13]->url): ?>
                        <a href="<?php echo \Core\HTML::link($result[13]->url, true); ?>"
                           class="wTop_slider__item--btn wBtn w_tac"><span><?php echo __('Купить страховой полис');?></span></a>
                        <div ></div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="wTop_slider__item__img">
                <div class="wTop_slider__item__img--front">
                    <img alt="аскоds" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-2.png'); ?>">
                </div>
                <div class="wTop_slider__item__img--back">
                    <img alt="аскоds" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-2-2.png'); ?>">
                </div>

            </div>
        </div>

        <div class="wTop_slider__item">
            <div class="wTop_slider__item__left">
                <div>
                    <div class="wTop_slider__item--logo">
                        <img alt="аско лого"  src="<?php echo \Core\HTML::media('pic/top-slider--item--logo-img.png'); ?>">
                    </div>
                    <div class="wTop_slider__item--title"><span><?php echo $result[15]->description; ?></span></div>
                    <?php if($result[15]->url): ?>
                        <a href="<?php echo \Core\HTML::link($result[15]->url, true); ?>"
                           class="wTop_slider__item--btn wBtn w_tac"><span><?php echo __('Купить страховой полис');?></span></a>
                        <div ></div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="wTop_slider__item__img">
                <div class="wTop_slider__item__img--front">
                    <img alt="askods" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-3.png'); ?>">
                </div>
                <div class="wTop_slider__item__img--back">
                    <img alt="askods" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-3-2.png'); ?>">
                </div>
            </div>
        </div>
        <div class="wTop_slider__item">
            <div class="wTop_slider__item__left">
                <div>
                    <div class="wTop_slider__item--logo">
                        <img alt="аско лого"  src="<?php echo \Core\HTML::media('pic/top-slider--item--logo-img.png'); ?>">
                    </div>
                    <div class="wTop_slider__item--title"><span><?php echo $result[16]->description; ?></span></div>
                    <?php if($result[16]->url): ?>
                        <a href="<?php echo \Core\HTML::link($result[16]->url, true); ?>"
                           class="wTop_slider__item--btn wBtn w_tac"><span><?php echo __('Купить страховой полис');?></span></a>
                        <div ></div>
                    <?php endif; ?>
                </div>
            </div>
            <div class="wTop_slider__item__img">
                <div class="wTop_slider__item__img--front">
                    <img alt="askods" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-4.png'); ?>">
                </div>
                <div class="wTop_slider__item__img--back">
                    <img alt="askods" src="<?php echo \Core\HTML::media('pic/wtop-slider--item--img-4-2.png'); ?>">
                </div>
            </div>
        </div>
    </div>
    <div class="wTop_slider__bottom">
        <div class="wSize">
            <div class="wTop_slider__bottom--right">
                <ul class="inviewI">

                    <li data-index="1" >
                        <span>
                            <span class="svgHolder"><svg><use xlink:href="#icon_health"/></svg></span>
                            <span class="title"><?php echo $result[13]->name; ?></span>
                        </span>
                    </li>

                    <li data-index="2">
                        <span>
                            <span class="svgHolder"><svg><use xlink:href="#icon_car"/></svg></span>
                            <span class="title"><?php echo $result[15]->name; ?></span>
                        </span>
                    </li>
                    <li data-index="3">
                        <span>
                            <span class="svgHolder"><svg><use xlink:href="#icon_motorthird"/></svg></span>
                            <span class="title"><?php echo $result[16]->name; ?></span>
                        </span>
                    </li>
                    <li data-index="0">
                        <span>
                            <span class="svgHolder"><svg><use xlink:href="#icon_property"/></svg></span>
                            <span class="title"><?php echo $result[14]->name; ?></span>
                        </span>
                    </li>					
                </ul>
            </div>
            <div class="wTop_slider__bottom--left">
                <div>
                    <a href="" class="default_view_home">
					  <p><?php echo __('Узнайте больше');?></p>
					</a>
					<span><?php echo __('о возможностях вашей страховки');?></span>
                </div>
            </div>
        </div>
    </div>
</div>
