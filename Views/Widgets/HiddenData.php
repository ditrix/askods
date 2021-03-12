<!-- WezomDefs -->
<!-- script disabled message -->
<!-- <noscript>
    <input id="wzmMsg_JsClose" type="checkbox" title="Закрыть">
    <div id="wzmMsg_JsInform" class="wzmMsg_Wrapp">
        <div class="wzmMsg_Text">
            <?php echo __('<p>В Вашем браузере <strong>отключен JavaScript!</strong> Для корректной работы с сайтом необходима поддержка Javascript.</p>
            <p>Мы рекомендуем Вам включить использование JavaScript в настройках вашего браузера.</p>');?>
        </div>
        <a href="https://wezom.com.ua/" target="_blank" title="Студия Wezom" class="wzmMsg_Link">
            <img src="<?php echo \Core\HTML::media('pic/wezom-info-red.gif'); ?>" width="50" height="18" alt="Студия Wezom">
        </a>
        <label for="wzmMsg_JsClose" class="wzmMsg_Close"><span>&times;</span></label>
    </div>
</noscript> -->
<!-- old browser detect -->
<script>function $wzmOldInit(){var t=document.createElement("script");t.src="/Media/js/wold.js",document.body.appendChild(t)}try{document.addEventListener("DOMContentLoaded",$wzmOldInit,!1)}catch(e){window.attachEvent("onload",$wzmOldInit)}
</script>
<!-- svg sprite -->
<script>window.wSpriteSvg=function(t,e,i){var n={ns:"http://www.w3.org/2000/svg",initialize:function(e,i){if(this.prefix="wSpriteSvg_"+e.id,t.localSupport){var n=t.localStorage[this.prefix];if(n){var s=JSON.parse(n);this.setSprite(e,s)}else this.getJson(e,i)}else this.getJson(e,i)},getJson:function(e,i){var n=new XMLHttpRequest,s=this;n.open("GET",i,!0),n.setRequestHeader("Content-type","application/json"),n.onreadystatechange=function(){if(4==n.readyState&&200==n.status){var i=JSON.parse(n.responseText);s.setSprite(e,i),t.localSupport&&t.localWrite(s.prefix,JSON.stringify(i))}},n.send()},buildElem:function(t,i){var n,s,r;for(n in i)for(s in i[n]){var o=e.createElementNS(this.ns,s);for(r in i[n][s])"stops"===r?this.buildElem(o,i[n][s][r]):"innerHTML"==r?o.innerHTML=i[n][s][r]:o.setAttributeNS(null,r,i[n][s][r]);t.appendChild(o)}},setSprite:function(t,i){for(var n in i){var s=i[n],r=e.createElementNS(this.ns,"symbol");r.setAttributeNS(null,"id",n),r.setAttributeNS(null,"viewBox",s.viewBox),this.buildElem(r,s.symbol),s.hasOwnProperty("gradients")&&this.buildElem(t,s.gradients),t.appendChild(r)}this.isDone(t,i)},isDone:function(t,e){}};return n}(this,this.document);
</script>
<!-- изменить id у svg элемента -> #sprite_SiteName -->
<svg id="sprite_SiteName" xmlns="http://www.w3.org/2000/svg" style="height:0; width:0; visibility:hidden; position:absolute; top:0; left:0;" onload="wSpriteSvg.initialize(this,'/Media/jsons/svgsprite.json')"/>
