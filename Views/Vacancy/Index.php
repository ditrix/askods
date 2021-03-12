<div class="wBlock_content c_light">
    <div class="wSize padding_in">
        <div class="wBlock_vacancies">
            <div class="wTitle w_tal">
                <h1><?php echo $current->h1 ?: $current->name; ?></h1>
            </div>
            <?php if(is_file(HOST . \Core\HTML::media('files/control/' . $current->other))): ?>
                <a href="<?php echo \Core\HTML::media('files/control/' . $current->other); ?>" class="icon_download" target="_blank">
                    <span class="svgHolder"><svg><use xlink:href="#icon_down"/></svg></span>
                    <span><?php echo __('Скачать анкету');?></span>
                </a>
            <?php endif; ?>
            <div class="wBlock_vacancies__content wTxt">
                <?php echo $current->text; ?>
            </div>
            <div class="w_clear"></div>
            <div class="wAccordeon">
                <?php foreach($vacancies as $key => $obj): ?>
                    <div class="wAccordeon__item <?php echo $key == 0 ? 'curr' : null; ?>">
                        <div class="wAccordeon__item__top js-accordeon_btn">
                            <p><?php echo $obj->job_vacancy; ?></p><span><?php echo $obj->city; ?></span>
                        </div>
                        <div class="wAccordeon__item__content">
                            <div>
                                <p class="wAccordeon__item__content--title"><?php echo __('Адрес');?></p>
                                <div class="wAccordeon__item__content--description">
                                    <div class="wTxt">
                                        <p><?php echo $obj->address; ?></p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p class="wAccordeon__item__content--title"><?php echo __('Описание');?></p>
                                <div class="wAccordeon__item__content--description">
                                    <div class="wTxt">
                                        <?php echo $obj->text; ?>
                                    </div>
                                    <div class="w_tal">
                                        <button data-url="/popup/respondToJob" class="wBtn mfiA"
                                                data-param="{&quot;vacancy_id&quot;:&quot;<?php echo $obj->id; ?>&quot;,&quot;lang&quot;:&quot;<?php echo I18n::$lang;?>&quot;}">
                                            <span><?php echo __('Откликнуться на вакансию');?></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<?php echo \Core\Widgets::get('VacancyQuestion'); ?>