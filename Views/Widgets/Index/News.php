<div class="wBlock list_news">
    <div class="wSize">
        <div class="wTitle w_tac">
            <p><?php /*echo \Core\Config::get('main_texts.company_news'); */?>
                <?php echo __('Новости компании');?>
            </p>
        </div>
        <?php echo \Core\View::tpl(['result' => $result], 'News/ListJustNews'); ?>
    </div>
    <div class="w_tac">
        <a href="<?php echo \Core\HTML::link('news', true); ?>" class="wBtn">
            <span><?php /*echo \Core\Config::get('main_texts.all_news_button'); */?><?php echo __('Смотреть все новости');?></span>
        </a>
    </div>
</div>


<div class="div_text 1111111111111111111">
        <?php echo ($text_page); ?>
</div>