<!DOCTYPE html>
<html lang="ru-ru" dir="ltr">
<!-- (c) студия Wezom | www.wezom.com.ua -->
<head>  
    <?php echo Core\Widgets::get('Head', $_seo); ?>
    <?php foreach ( $_seo['scripts']['head'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <?php echo $GLOBAL_MESSAGE; ?>
</head>
<body oncopy="return false">
<!-- Google Tag Manager (noscript) -->
<!-- End Google Tag Manager (noscript) -->   
    <?php foreach ( $_seo['scripts']['body'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <div class="wWrapper">
        <?php echo Core\Widgets::get('Header'); ?>
        <div class="wConteiner">
            <div class="wSize">
                <?php echo $_breadcrumbs; ?>
                <?php echo Core\Widgets::get('UserMenu'); ?>
                <div class="lk_content">
                    <div class="title"><?php echo Core\Config::get('h1'); ?></div>
                    <div class="lkMainContent">
                        <?php echo $_content; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php echo Core\Widgets::get('HiddenData'); ?>
    <?php echo Core\Widgets::get('Footer', array('counters' => Core\Arr::get($_seo, 'counters'), 'config' => $_config)); ?>
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