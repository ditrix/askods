<?php echo \Core\Widgets::get('SubMenu', ['result' => $kids]); ?>
<div class="wBlock_content c_light">
    <div class="wSize padding_in">
        <div class="wTitle w_tal">
            <h1><?php echo $current->h1 ?: $current->name; ?></h1>
        </div>
        <div class="wTabs w_clearfix">
            <div class="wTab_nav">
                <ul>
                    <?php foreach($result as $key => $row): ?>
                        <?php $album = $row['album']; ?>
                        <li data-tab-container="tabs" data-tab-link="tab_<?php echo $key + 1; ?>" 
                            <?php echo $key == 0 ? 'class="curr"' : null; ?>
                        >
                            <span><?php echo $album->name; ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>
                <div data-form="true" class="wForm wFormDef">
                    <div class="wFormRow">
                        <div class="wFormInput">
                            <select class="sbi wSelect" name="hide_tabs_nav" id="hide_tabs_nav">
                                <?php foreach($result as $key => $row): ?>
                                    <?php $album = $row['album']; ?>
                                    <option value="<?php echo $key + 1; ?>" data-tab-container="tabs" data-tab-link="tab_<?php echo $key + 1; ?>"
                                        ><?php echo $album->name; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wTabs_conteiner tabs">
                <?php foreach($result as $key => $row): ?>
                    <?php $album = $row['album']; $photos = $row['photos']; ?>
                    <div class="wTab_block tab_<?php echo $key + 1; ?> <?php echo $key == 0 ? 'curr' : null; ?>">
                        <div class="wTab_block__content">
                            <div class="wTxt">
                                <?php echo $album->text; ?>
                            </div>
                            <ul class="list_certificates">
                                <?php foreach($photos as $photo): ?>
                                    <?php if(!is_file(HOST . \Core\HTML::media('images/gallery_images/small/' . $photo->image))) continue; ?>
                                    <li class="list_certificates__item">
                                        <span class="list_certificates__item__img">
                                            <a href="<?php echo \Core\HTML::media('images/gallery_images/big/' . $photo->image); ?>"
                                               data-fresco-group="alb_<?php echo $key + 1; ?>" class="fresco">
                                                <img src="<?php echo \Core\HTML::media('images/gallery_images/small/' . $photo->image); ?>"
                                                     alt="<?php echo $photo->name; ?>">
                                            </a>
                                        </span>
                                        <span class="list_certificates__item__title">
                                            <span><?php echo $photo->name; ?></span>
                                        </span>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<?php echo $current->show_benefits ? \Core\Widgets::get('Benefits') : null; ?>