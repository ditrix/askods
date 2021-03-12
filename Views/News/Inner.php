<div class="wBlock_content">
    <div class="wSize padding_in">
        <div class="wTitle w_tal">
            <h1><?php echo $obj->h1 ?: $obj->name ?></h1>
        </div>
        <div class="news_article">
            <div class="news_article--date">
                <span class="svgHolder"><svg><use xlink:href="#icon_clock"/></svg></span><?php echo date('d-m-Y', $obj->date) ?>
            </div>
            <?php if ($obj->show_image AND is_file(HOST . \Core\HTML::media('images/news/big/' . $obj->image))): ?>
                <span class="news_article--img">
                    <img src="<?php echo \Core\HTML::media('images/news/big/' . $obj->image) ?>" alt="<?php echo $obj->name ?>">
                </span>
            <?php endif; ?>
            <div class="wTxt <?php echo ($obj->show_image AND is_file(HOST . \Core\HTML::media('images/news/big/' . $obj->image))) ? 'news_article--content' : null ?>">
                <?php echo $obj->text ?>
            </div>
            <div class="news_article__share">
                <script>
                    (function() {
                        if (window.pluso)if (typeof window.pluso.start == "function") return;
                        if (window.ifpluso==undefined) { window.ifpluso = 1;
                            var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
                            s.type = 'text/javascript'; s.charset='UTF-8'; s.async = true;
                            s.src = ('https:' == window.location.protocol ? 'https' : 'http')  + '://share.pluso.ru/pluso-like.js';
                            var h=d[g]('body')[0];
                            h.appendChild(s);
                        }})();
                </script><span>Поделиться новостью:</span>
                <div data-background="transparent" data-options="medium,square,line,horizontal,nocounter,theme=02" data-services="vkontakte,odnoklassniki,facebook,google,email,print" class="pluso"></div>
            </div>
        </div>
    </div>
</div>
