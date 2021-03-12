<!DOCTYPE html>
<html lang="<?php echo I18n::$lang;?>" dir="ltr">
<!-- (c) студия Wezom | www.wezom.com.ua -->
<head>
    <?php echo Core\Widgets::get('Head', $_seo); ?>
    <?php foreach ( $_seo['scripts']['head'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <?php echo $GLOBAL_MESSAGE; ?>
	<!-- Google Tag Manager --><!-- 
	
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K4H2544');</script>

 -->
<!-- End Google Tag Manager -->

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-139531876-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-139531876-1');
</script>

	
</head>
<body class="indexPage" oncopy="return false">
    <!-- Google Tag Manager (noscript) -->
<!-- End Google Tag Manager (noscript) -->   
    
<!-- Start SiteHeart code --><script>(function(){var widget_id = 898381;_shcp =[{widget_id : widget_id}];var lang =(navigator.language || navigator.systemLanguage || navigator.userLanguage ||"en").substr(0,2).toLowerCase();var url ="widget.siteheart.com/widget/sh/"+ widget_id +"/"+ lang +"/widget.js";var hcc = document.createElement("script");hcc.type ="text/javascript";hcc.async =true;hcc.src =("https:"== document.location.protocol ?"https":"http")+"://"+ url;var s = document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hcc, s.nextSibling);})();</script><!-- End SiteHeart code -->


    <?php foreach ( $_seo['scripts']['body'] as $script ): ?>
        <?php echo $script; ?>
    <?php endforeach ?>
    <div class="wWrapper">
        <?php echo Core\Widgets::get('Header', array('config' => $_config)); ?>
        <?php echo Core\Widgets::get('HeaderMmenu', array('config' => $_config)); ?>
        <div class="wContainer wHomeHomePageContainer" style="padding: 0px;">
            <?php echo Core\Widgets::get('Index_Slider'); ?>
            <?php //echo Core\Widgets::get('Presentation'); ?>
            <?php echo Core\Widgets::get('Index_OrderOnlineInsurance'); ?>
            <?php echo Core\Widgets::get('Index_WhatToDoIfAnAccident'); ?>
            <?php echo Core\Widgets::get('Index_News'); ?>

            <?php echo Core\Widgets::get('Index_Hands'); ?>
            <!-- .wContainer -->
        </div>
    </div>
    <div class="main-footer">
    <?php echo Core\Widgets::get('Footer', array('counters' => Core\Arr::get($_seo['scripts'], 'counter'), 'config' => $_config)); ?>  
    </div>
    <?php echo Core\Widgets::get('HiddenData'); ?>
<!--  begin Chat CODE -->
<!-- end of chat  code`

<script type="text/javascript">
(function(w,d){
  w.HelpCrunch=function(){w.HelpCrunch.q.push(arguments)};w.HelpCrunch.q=[];
  function r(){var s=document.createElement('script');s.async=1;s.type='text/javascript';s.src='https://widget.helpcrunch.com/';(d.body||d.head).appendChild(s);}
  if(w.attachEvent){w.attachEvent('onload',r)}else{w.addEventListener('load',r,false)}
})(window, document)
</script>

<script type="text/javascript">
  HelpCrunch('init', 'askodschat', {
    applicationId: 1,
    applicationSecret: 'O2c9Pnx0mpV9MURn0eOC4GYfd8G+JlZwB9KSR6pwakOZY3wzk6MH8SE4d6SDd+v5u5J7ChQJubOFJ5CU8uh2pw=='
  });

  HelpCrunch('showChatWidget');
</script>



 end of chat  code`-->
 
 <link rel="stylesheet" href="https://cdn.envybox.io/widget/cbk.css">
<script type="text/javascript" src="https://cdn.envybox.io/widget/cbk.js?wcb_code=1f6cf6bda829be73e6d57b71308fafcd" charset="UTF-8" async></script>
 
 
</body>
</html>