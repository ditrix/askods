/*init.js*/
/*
    init.js v2.0
    Wezom wTPL v4.0.0
*/
window.wHTML = (function($){

    /* Приватные переменные */

        var varSeoIframe = 'seoIframe',
            varSeoTxt = 'seoTxt',
            varSeoClone = 'cloneSeo',
            varSeoDelay = 200;

    /* Приватные функции */

        /* проверка типа данных на объект */
        var _isObject = function(data) {
            var flag = (typeof data == 'object') && (data+'' != 'null');
            return flag;
        },

        /* создание нового элемента элемента */
        _crtEl = function(tag, classes, attrs, jq) {
            var tagName = tag || 'div';
            var element = document.createElement(tagName);
            var jQueryElement = jq || true;
            // если классы объявлены - добавляем
            if (classes) {
                var tagClasses = classes.split(' ');
                for (var i = 0; i < tagClasses.length; i++) {
                    element.classList.add(tagClasses[i]);
                }
            }
            // если атрибуты объявлены - добавляем
            if (_isObject(attrs)) {
                for (var key in attrs) {
                    var val = attrs[key];
                    element[key] = val;
                }
            }
            // возвращаем созданый елемент
            if (jQueryElement) {
                return $(element);
            } else {
                return element;
            }
        },

        /* создаем iframe для сео текста */
        _seoBuild = function(wrapper) {
            var seoTimer;
            // создаем iframe, который будет следить за resize'm окна
            var iframe = _crtEl('iframe', false, {id: varSeoIframe, name: varSeoIframe});
            iframe.css({
                'position':'absolute',
                'left':'0',
                'top':'0',
                'width':'100%',
                'height':'100%',
                'z-index':'-1'
            });
            // добавляем его в родитель сео текста
            wrapper.prepend(iframe);
            // "прослушка" ресайза
            seoIframe.onresize = function() {
                clearTimeout(seoTimer);
                seoTimer = setTimeout(function() {
                    wHTML.seoSet();
                }, varSeoDelay);
            };
            // вызываем seoSet()
            wHTML.seoSet();
        };

    /* Публичные методы */

        function Methods(){}

        Methods.prototype = {

            /* установка cео текста на странице */
            seoSet: function() {
                if ($('#'+varSeoTxt).length) {
                    var seoText = $('#'+varSeoTxt);
                    var iframe = seoText.children('#'+varSeoIframe);
                    if (iframe.length) {
                        // если iframe сущствует устанавливаем на место сео текст
                        var seoClone = $('#'+varSeoClone);
                        if (seoClone.length) {
                            // клонеру задаем высоту
                            seoClone.height(seoText.outerHeight(true));
                            // тексту задаем позицию
                            seoText.css({
                                top: seoClone.offset().top
                            });
                        } else {
                            // клонера нету - бьем в колокола !!!
                            console.error('"'+varSeoClone+'" - не найден!');
                        }
                    } else {
                        // если iframe отсутствует, создаем его и устанавливаем на место сео текст
                        _seoBuild(seoText);
                    }
                }
            },

            /* magnificPopup inline */
            mfi: function() {
                $('.mfi').magnificPopup({
                    type: 'inline',
                    closeBtnInside: true,
                    removalDelay: 300,
                    mainClass: 'zoom-in'
                });
            },

            /* magnificPopup ajax */
            mfiAjax: function() {
                $('body').magnificPopup({
                    delegate: '.mfiA',
                    callbacks: {
                        elementParse: function(item) {
                            this.st.ajax.settings = {
                                url: item.el.data('url'),
                                type: 'POST',
                                data: (typeof item.el.data('param') !== 'undefined') ? item.el.data('param') : ''
                            };
                        },
                        ajaxContentAdded: function(el) {
                            wHTML.validation();
                        }
                    },
                    type: 'ajax',
                    removalDelay: 300,
                    fixedContentPos: true,
                    fixedBgPos: false,
                    // overflowY: 'scroll',
                    mainClass: 'zoom-in'
                });
            },

            /* оборачивание iframe и video для адаптации */
            wTxtIFRAME: function() {
                var list = $('.wTxt').find('iframe').add($('.wTxt').find('video'));
                if (list.length) {
                    // в цикле для каждого
                    for (var i = 0; i < list.length; i++) {
                        var element = list[i];
                        var jqElement = $(element);
                        // если имеет класс ignoreHolder, пропускаем
                        if (jqElement.hasClass('ignoreHolder')) {
                            continue;
                        }
                        if (typeof jqElement.data('wraped') === 'undefined') {
                            // определяем соотношение сторон
                            var ratio = parseFloat((+element.offsetHeight / +element.offsetWidth * 100).toFixed(2));
                            if (isNaN(ratio)) {
                                // страховка 16:9
                                ratio = 56.25;
                            }
                            // назнчаем дату и обрачиваем блоком
                            jqElement.data('wraped', true).wrap('<div class="iframeHolder ratio_' + ratio.toFixed(0) + '" style="padding-top:'+ratio+'%;""></div>');
                        }
                    }
                    // фиксим сео текст
                    this.seoSet();
                }
            }
        };

    /* Объявление wHTML и базовые свойства */

    var wHTML = $.extend(true, Methods.prototype, {});

    return wHTML;

})(jQuery);




jQuery(document).ready(function($) {

    // поддержка cssanimations
    transitFlag = Modernizr.cssanimations;

    // очитска localStorage
    localStorage.clear();

    // сео текст
    wHTML.seoSet();

    // magnificPopup inline
    wHTML.mfi();

    // magnificPopup ajax
    wHTML.mfiAjax();

    // валидация форм
    wHTML.validation();


    $(window).load(function() {
        // оборачивание iframe и video для адаптации
        wHTML.wTxtIFRAME();

        // wTabs        
        function wTab(t) {  
            t.parent().children('.curr').removeClass('curr');
            t.addClass('curr');
            $('.' + t.attr('data-tab-container')).children('.curr').removeClass('curr');
            $('.' + t.attr('data-tab-container')).children('.' + t.attr('data-tab-link')).addClass('curr');
        }
        $('.wTab_nav').on('click', 'li', function(event) {
            if ($(this).hasClass('curr')) {
                return false;
            } else {
                wTab($(this));
                wHTML.seoSet();
            }
        });

        /** ### Select2
         Инициализация select2, если он существует
         * @name WDOCS_FROM
        */
        if ($('.sbi').length) {
            $('.sbi').select2({
                minimumResultsForSearch: -1,
                allowClear: true                
            }).on("change", function() {
                console.log($(this).val());
                console.log($(this).closest('.wForm').data('validator').element(this));
                $(this).closest('.wForm').data('validator').element(this);
            });
        }
        //WDOCS_TO

        /** ### wAccordeon
         Инициализация wAccordeon, если он существует
         * @name WDOCS_FROM
        */
        if($('.wAccordeon').length) {
            $('.js-accordeon_btn').on('click', function(){
                var item_top = $(this).next();
                if (item_top.is(':visible')){
                    item_top.stop().slideUp(400, function(){
                        item_top.parent().removeClass('curr');
                    });    
                }
                else {
                    item_top.stop().slideDown(400, function() {
                        item_top.parent()
                            .addClass('curr')
                            .siblings().removeClass('curr')
                            .children('.wAccordeon__item__content').stop().slideUp(400);
                    });
                     
                }
            })            
        }
        //WDOCS_TO


        /** ### Mmenu
         Инициализация Mmenu
         * @name WDOCS_FROM
        */   
        var clone = $('.wFooter__social').clone();
        $("#js-menu").mmenu({
            "offCanvas": {
              "position": "right"
           },
           "extensions": [
              "theme-dark"
           ],
           counters: true,
            dividers: {
                add: true,
                addTo: "[id*='contacts-']",
                fixed: true
            },
            // searchfield: {
            //  resultsPanel: true
            // },
            navbar: {
                title: "Меню"
            },
            navbars: {
                height: 2,        
                position: 'bottom',
                content:  clone
            }
        }); 

        var api_mmenu = $('#js-menu').data('mmenu');

        $('#js-menu').on('click', '.mfiA', function (event) {
            api_mmenu.close();
        });
        //WDOCS_TO


        //scroll_top
        var top_show = 100;
        // var delay = 1000;

        $(window).scroll(function() {
            if ($(this).scrollTop() > top_show) {
                $('.wHeader__bottom').addClass('p_fixed');
                wHTML.seoSet();
            }
            else {
                $('.wHeader__bottom').removeClass('p_fixed');
                wHTML.seoSet();
            }
        });

        /** ### inView
         Инициализация inView, если он существует
         * @name WDOCS_FROM
        */
        if ($('.inviewI').length) {
            $(".inviewI").on("inview", function(event, isInView, visiblePartX, visiblePartY) {
              var el = $(this);
              el.addClass('inviewRun');
            });
        }
        //WDOCS_TO


        
        /** ### js-wTop_slider
         Инициализация слайдера carouselFred (js-wTop_slider), если он существует
         * @name WDOCS_FROM
        */
        if ($('.js-wTop_slider').length) {

            //var imgSelector = '.js-wTop_slider__item__img--back';
            var animClass = 'no_scale';

            $('.js-wTop_slider').carouFredSel({
                items: {},
                width: '100%',
                responsive: true,
                auto: {
                    play: false,
                    timeoutDuration: 5000
                },
                swipe: {
                    onTouch: true
                },
                onCreate: function(data) {
                    data.items.addClass(animClass);
                    ///$('.js-wTop_slider__item__img--back').addClass('no_scale');                        
                },
                scroll: {
                    items: 1,
                    fx: "crossfade",                   
                    duration: 1200,
                    pauseOnHover: true,
                    onBefore: function(data) {
                        data.items.visible.addClass(animClass);
                    },
                    // onAfter: function(data) {
                    //    console.log(data);
                    // }
                },
            }, {
                transition: transitFlag

            });

                              
            var $wTopSlider = $('.js-wTop_slider');
            
            $(".wTop_slider__bottom--right").find('li').on('click', function(){
                // console.log(14578);
                var scrolling = $wTopSlider.triggerHandler('isScrolling');
                var $this = $(this)
                var _index = $this.data('index');

                if (scrolling || $this.hasClass('active')){
                    return false;
                }
                $wTopSlider.trigger("slideTo", _index);
                $(".wTop_slider__bottom--right li").removeClass('active');
                $this.addClass('active');                    

                // console.log(_index);

            });
        }
        //WDOCS_TO

        //map_label
        $svgMap = $('#svgMap');
        if ($svgMap) {
            $svgMap.on('click', '.selector', function(event) {
                event.preventDefault();
                console.log(event);
            });
        }

        if ($('.js-menu-slider').length) {

            $('.js-menu-slider > ul').carouFredSel({
                // items: 5,
                width: '100%',
                // responsive: true,
                auto: {
                    play: true,
                    timeoutDuration: 5000
                },
                swipe: {
                    onTouch: true
                },
                prev: '.slider-nav .prev',
                next: '.slider-nav .next',
                scroll: {
                    items: 1,
                    fx: "scroll",                 
                    duration: 1200,
                    pauseOnHover: true
                    },
                },
             {
                transition: transitFlag

            });
        }



    // сео текст            
        wHTML.seoSet();


    });

    $(window).resize(function () {
        wHTML.seoSet();
    });

});
//# sourceMappingURL=maps/inits.js.map
