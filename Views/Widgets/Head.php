<?php use Core\HTML; 
use Modules\Catalog\Controllers;?>
<!-- (c) студия Wezom | www.wezom.com.ua-->
<!-- wTPL | v#{locals.version}-->
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<?php
if(isset($language) and $language == 'ru'){ 
$title = isset($title) && !empty($title) ? $title : (isset($h1) && !empty($h1) ? $h1 : h1 ).' – страховая компания АСКО ДС';
}else{
$title = isset($title) && !empty($title) ? $title : (isset($h1) && !empty($h1) ? $h1 : h1 ).' – страхова компанія АСКО ДС'; 
} 

if(is_readable ($_SERVER ['DOCUMENT_ROOT']."/seo/urlForMetaTagTemplate.csv")){
	$handle = fopen ($_SERVER ['DOCUMENT_ROOT']."/seo/urlForMetaTagTemplate.csv", "r");
	while(!feof ($handle))
	{
		$buffer = fgets($handle, 9999);
		$data   = explode (";", $buffer);

		if($data [0] == (strtok($_SERVER['REQUEST_URI'], '?')))
		{
			if(isset($language) and $language == 'ru')
			{			
$title = (isset($h1) && !empty($h1) ? $h1 : h1 ).' – страховая компания АСКО ДС';
			}elseif(substr($_SERVER['REQUEST_URI'], 0, 4) == '/ru/'){
$title = (isset($h1) && !empty($h1) ? $h1 : h1 ).' – страховая компания АСКО ДС';
			}else{
$title = (isset($h1) && !empty($h1) ? $h1 : h1 ).' – страхова компанія АСКО ДС';				
			}

		}
	}
	fclose ($handle);   
} ?>
<?php 
    //print_r($_SERVER['REQUEST_URI']); die;
    $no_buy_uri = str_replace('/buy/','/',$_SERVER['REQUEST_URI']);
 ?>

<title><?php echo $title; ?></title>
<?php if(isset($language) and $language == 'ru'){ ?>
<meta name="description" lang="ru-ru" content="<?php echo isset($description) && !empty($description) ? $description : (isset($h1) && !empty($h1) ? $h1 : h1 ).' - страховые услуги компании АСКО ДС ✓надежность ✓быстрое урегулирование ✓выплаты в полном объеме ☎ 0-800-50-15-60'; ?>">
<?php }else{?>
<meta name="description" lang="ru-ru" content="<?php echo isset($description) && !empty($description) ? $description : (isset($h1) && !empty($h1) ? $h1 : h1 ).' - послуги страхування від АСКО ДС ✓надійність ✓швидке врегулювання ✓виплати у повному обсязі ☎ 0-800-50-15-60'; ?>">
<?php } ?>
<meta name="author" lang="ru-ru" content="<?php echo $_SERVER['HTTP_HOST']; ?>">
<!-- Open Graph -->
<meta property="og:title" content="<?php echo isset($title) ? $title : NULL; ?>">
<meta property="og:type" content="website">
<meta property="og:site_name" content="<?php echo $_SERVER['HTTP_HOST']; ?>">
<meta property="og:url" content="https://<?php echo $_SERVER['HTTP_HOST'] . HTML::chars($no_buy_uri); ?>">
<meta property="og:description" content="<?php echo isset($description) ? $description : NULL; ?>">
<!-- Touch -->
<meta name="format-detection" content="telephone=no">
<meta name="format-detection" content="address=no">
<!--Responsive-->
<meta name="HandheldFriendly" content="True">
<meta name="MobileOptimized" content="320">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="viewport" content="target-densitydpi=device-dpi">
<meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
<!-- saved from url=(0014)about:internet -->
<!--[if IE]><meta http-equiv="imagetoolbar" content="no"><![endif]-->
<!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
<!-- localStorage test -->
<script>!function(t){function r(){var t=navigator.userAgent,r=!window.addEventListener||t.match(/(Android (2|3|4.0|4.1|4.2|4.3))|(Opera (Mini|Mobi))/)&&!t.match(/Chrome/);if(r)return!1;var e="test";try{return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch(o){return!1}}t.localSupport=r(),t.localWrite=function(t,r){try{localStorage.setItem(t,r)}catch(e){if(e==QUOTA_EXCEEDED_ERR)return!1}}}(window);
</script>
<!-- Внешние css файлы-->
<?php $css = Minify\Core::factory('css')->minify($styles); ?>
<?php foreach ($css as $file_style): ?>
    <?php echo HTML::style($file_style) . "\n"; ?>
<?php endforeach; ?>
<!-- Внешние js файлы-->
<?php $js = Minify\Core::factory('js')->minify($scripts); ?>
<?php foreach ($js as $file_script): ?>
    <?php echo HTML::script($file_script) . "\n"; ?>
<?php endforeach; ?>
<!-- Favicons -->
<link rel="apple-touch-icon" sizes="57x57" href="<?php echo HTML::media('favicons/apple-touch-icon-57x57.png') ?>">
<link rel="apple-touch-icon" sizes="60x60" href="<?php echo HTML::media('favicons/apple-touch-icon-60x60.png') ?>">
<link rel="apple-touch-icon" sizes="72x72" href="<?php echo HTML::media('favicons/apple-touch-icon-72x72.png') ?>">
<link rel="apple-touch-icon" sizes="76x76" href="<?php echo HTML::media('favicons/apple-touch-icon-76x76.png') ?>">
<link rel="apple-touch-icon" sizes="114x114" href="<?php echo HTML::media('favicons/apple-touch-icon-114x114.png') ?>">
<link rel="apple-touch-icon" sizes="120x120" href="<?php echo HTML::media('favicons/apple-touch-icon-120x120.png') ?>">
<link rel="apple-touch-icon" sizes="144x144" href="<?php echo HTML::media('favicons/apple-touch-icon-144x144.png') ?>">
<link rel="apple-touch-icon" sizes="152x152" href="<?php echo HTML::media('favicons/apple-touch-icon-152x152.png') ?>">
<link rel="apple-touch-icon" sizes="180x180" href="<?php echo HTML::media('favicons/apple-touch-icon-180x180.png') ?>">
<link rel="icon" type="image/png" href="<?php echo HTML::media('favicons/favicon-32x32.png') ?>" sizes="32x32">
<link rel="icon" type="image/png" href="<?php echo HTML::media('favicons/android-chrome-192x192.png') ?>" sizes="192x192">
<link rel="icon" type="image/png" href="<?php echo HTML::media('favicons/favicon-96x96.png') ?>" sizes="96x96">
<link rel="icon" type="image/png" href="<?php echo HTML::media('favicons/favicon-16x16.png') ?>" sizes="16x16">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="<?php echo HTML::media('favicons/safari-pinned-tab.svg') ?>" color="#5bbad5">
<!-- <link rel="shortcut icon" href="/favicon.ico"> -->
<link rel="shortcut icon" href="/askods.ico">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="msapplication-TileImage" content="<?php echo HTML::media('favicons/mstile-144x144.png') ?>">
<meta name="msapplication-config" content="/browserconfig.xml">
<meta name="theme-color" content="#ffffff">

<?php
// Start Web-promo Tkach
$findInUrl = strstr($_SERVER['REQUEST_URI'], '?');
if($findInUrl){
	$canonical = strstr($_SERVER['REQUEST_URI'], '?', true);
}else{
	$canonical = $_SERVER['REQUEST_URI'];
}
$langUrl= str_replace(array('/ua','/ru'),'',$canonical);

if($canonical === '/'){$langRu = '/ru';}else{$langRu = '/ru'.$langUrl;}
if($canonical === '/ua'){$canonical = '/';}
if($canonical === '/'){$langUa	= '/';}else{$langUa	= '/ua'.$langUrl;}

// End Web-promo

?>
<?php $no_buy_canonical = str_replace('/buy/','/',$canonical); ?>
<link rel="canonical" href="https://askods.com<?=$no_buy_canonical;?>" />

<?php  
    $fixed_alternateRu  = str_replace('/buy/','/',$langRu);
    $fixed_alternateUa   = str_replace('/buy/','/',$langUa);
   
   if($fixed_alternateRu == '/rukovodstvo') $fixed_alternateRu = '/ru/rukovodstvo';
   if($fixed_alternateUa == '/uakovodstvo') $fixed_alternateUa = '/ua/rukovodstvo';
?>

<link rel="alternate" href="https://askods.com<?=$fixed_alternateRu;?>" hreflang="ru-ua" />
<link rel="alternate" href="https://askods.com<?=$fixed_alternateUa;?>" hreflang="uk-ua" />



<!-- Yandex.Metrika counter -->
<!--
<script type="text/javascript">
    (function (d, w, c) {
        (w[c] = w[c] || []).push(function() {
            try {
                w.yaCounter44219359 = new Ya.Metrika({
                    id:44219359,
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true
                });
            } catch(e) { }
        });

        var n = d.getElementsByTagName("script")[0],
            s = d.createElement("script"),
            f = function () { n.parentNode.insertBefore(s, n); };
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://mc.yandex.ru/metrika/watch.js";

        if (w.opera == "[object Opera]") {
            d.addEventListener("DOMContentLoaded", f, false);
        } else { f(); }
    })(document, window, "yandex_metrika_callbacks");
</script>
-->

<!-- /Yandex.Metrika counter -->