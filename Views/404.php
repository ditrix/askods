<!DOCTYPE html>
<html lang="<?php echo I18n::$lang;?>" dir="ltr">
<!-- (c) студия Wezom | www.wezom.com.ua -->
<head>
    <?php echo Core\Widgets::get('Head', $_seo); ?>
    <?php foreach ( $_seo['scripts']['head'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <?php echo $GLOBAL_MESSAGE; ?>
</head>
<body class="errorPage" oncopy="return false">
    <!-- Google Tag Manager (noscript) -->

<!-- End Google Tag Manager (noscript) -->   
    <?php foreach ( $_seo['scripts']['body'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <div class="wWrapper">
        <?php echo Core\Widgets::get('Header', array('config' => $_config)); ?>
        <?php echo Core\Widgets::get('HeaderMmenu', array('config' => $_config)); ?>
        <div class="wContainer">
            <div class="errorWrapper">
                <div class="errorHolder">
                    <div class="errorContent">
                        <div class="errorHeader">404</div>
                        <div class="wTxt">
                            <h3><?php echo __('Страница не найдена');?></h3>
                            <p><em><?php echo __('К сожалению, страница, которую Вы запросили, не была найдена.');?></em> <br> <?php echo __('Вы можете перейти на');?> <a href="<?php echo Core\HTML::link('', true); ?>"><?php echo __('главную страницу');?></a>.</p>
                            <a href="<?php echo Core\HTML::link('sitemap', true); ?>"><?php echo __('Карта сайта');?></a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- .wContainer -->
        </div>
    </div>
    <?php echo Core\Widgets::get('Footer', array('counters' => Core\Arr::get($_seo['scripts'], 'counter'), 'config' => $_config)); ?>
    <?php echo Core\Widgets::get('HiddenData'); ?>
<!-- Start SiteHeart code --><script>(function(){var widget_id = 898381;_shcp =[{widget_id : widget_id}];var lang =(navigator.language || navigator.systemLanguage || navigator.userLanguage ||"en").substr(0,2).toLowerCase();var url ="widget.siteheart.com/widget/sh/"+ widget_id +"/"+ lang +"/widget.js";var hcc = document.createElement("script");hcc.type ="text/javascript";hcc.async =true;hcc.src =("https:"== document.location.protocol ?"https":"http")+"://"+ url;var s = document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hcc, s.nextSibling);})();</script><!-- End SiteHeart code -->

<!--  begin Chat CODE --->
<!--
<script type="text/javascript">
(function(w,d){
  w.HelpCrunch=function(){w.HelpCrunch.q.push(arguments)};w.HelpCrunch.q=[];
  function r(){var s=document.createElement('script');s.async=1;s.type='text/javascript';s.src='https://widget.helpcrunch.com/';(d.body||d.head).appendChild(s);}
  if(w.attachEvent){w.attachEvent('onload',r)}else{w.addEventListener('load',r,false)}
})(window, document)
</script>

<script type="text/javascript">
  HelpCrunch('init', 'drfaskods', {
    applicationId: 1,
    applicationSecret: '5Fs8BTxgG5v8Yq3qCYIVSk4xnq/6w4OqRlf/yLV4t2qK18+9e3AEy4cFevYR/l0WRv+me1BksTGmWwC/MLsXYw=='
  });

  HelpCrunch('showChatWidget');
</script>
-->
<!-- end of chat  code`-->

</body>
</html>
