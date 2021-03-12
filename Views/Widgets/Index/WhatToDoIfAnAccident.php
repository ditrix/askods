<div class="wBlock question_index inviewI">
    <div class="wSize">
        <div class="question_index__block">
            <div class="wTitle w_tac c_white">
                <p><?php /*echo \Core\Config::get('main_texts.what_to_do_h1'); */?>
                    <?php echo __('Что делать, если произошел страховой случай?');?>
                </p>
            </div>
            <ul>
                <?php foreach($result as $obj): ?>
                    <li>
                        <button data-url="popup/categoryIntro" data-param="{&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;,&quot;catalog_tree_id&quot;:&quot;<?php echo $obj->id;?>&quot;}" class="mfiA"
                                data-param="{&quot;catalog_tree_id&quot;:&quot;<?php echo $obj->id; ?>&quot;}">
                            <span class="svgHolder">
                                <svg><use xlink:href="#<?php echo $obj->icon; ?>"/></svg>
                            </span>
                            <span class="title"><?php echo $obj->name; ?></span>
                        </button>
                    </li>
                <?php endforeach; ?>
            </ul>
            <div class="question_index__block--man inviewI">
                <span class="question_mark--center">
                    <svg><use xlink:href="#icon_question_mark"/></svg>
                </span>
                <span class="question_mark--left">
                    <svg><use xlink:href="#icon_question_mark"/></svg>
                </span>
                <span class="question_mark--right">
                    <svg><use xlink:href="#icon_question_mark"/></svg>
                </span>
            </div>
        </div>
    </div>
    <div class="wBlock clock_support">
        <div class="wSize">
            <div class="clock_support__block">
                <p><?php /*echo \Core\Config::get('main_texts.call_by_phone'); */?>
                    <?php echo __('позвоните по телефону');?>
                </p>
                <?php if($phone = \Core\Config::get('static.phone')): ?>
                    <a href="tel:<?php echo preg_replace('/\D/', '', $phone); ?>"><?php echo $phone; ?></a>
                <?php endif; ?>
                               <?php $head_phone = '050-450-15-60'?>
                       <a href="tel:<?php echo preg_replace('/\D/', '', $head_phone); ?>"><?php echo $head_phone; ?></a>
                        
                <p><?php /*echo \Core\Config::get('main_texts.or_send_request'); */?>
                    <?php echo __('или <span>отправьте заявку </span>с сайта');?>
                </p>
                <div class="clock_support__btn">
                    <button data-url="popup/insuredEvent" data-param="{&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}" class="wBtn mfiA">
                        <span><?php /*echo \Core\Config::get('main_texts.insured_event_button'); */?>
                            <?php echo __('Заявить о страховом случае');?>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>