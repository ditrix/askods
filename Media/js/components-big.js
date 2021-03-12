/*carouselfred.js*/
/*-------------------------------  carouFredSel   ------------------------------------*/



    (function($) {


        //  LOCAL

        if ($.fn.carouFredSel) {
            return;
        }

        $.fn.caroufredsel = $.fn.carouFredSel = function(options, configs) {

            //  no element
            if (this.length == 0) {
                debug(true, 'No element found for "' + this.selector + '".');
                return this;
            }

            //  multiple elements
            if (this.length > 1) {
                return this.each(function() {
                    $(this).carouFredSel(options, configs);
                });
            }


            var $cfs = this,
                $tt0 = this[0],
                starting_position = false;

            if ($cfs.data('_cfs_isCarousel')) {
                starting_position = $cfs.triggerHandler('_cfs_triggerEvent', 'currentPosition');
                $cfs.trigger('_cfs_triggerEvent', ['destroy', true]);
            }

            var FN = {};

            FN._cfs_init = function(o, setOrig, start) {
                o = go_getObject($tt0, o);

                o.items = go_getItemsObject($tt0, o.items);
                o.scroll = go_getScrollObject($tt0, o.scroll);
                o.auto = go_getAutoObject($tt0, o.auto);
                o.prev = go_getPrevNextObject($tt0, o.prev);
                o.next = go_getPrevNextObject($tt0, o.next);
                o.pagination = go_getPaginationObject($tt0, o.pagination);
                o.swipe = go_getSwipeObject($tt0, o.swipe);
                o.mousewheel = go_getMousewheelObject($tt0, o.mousewheel);

                if (setOrig) {
                    opts_orig = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
                }

                opts = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
                opts.d = cf_getDimensions(opts);

                crsl.direction = (opts.direction == 'up' || opts.direction == 'left') ? 'next' : 'prev';

                var a_itm = $cfs.children(),
                    avail_primary = ms_getParentSize($wrp, opts, 'width');

                if (is_true(opts.cookie)) {
                    opts.cookie = 'caroufredsel_cookie_' + conf.serialNumber;
                }

                opts.maxDimension = ms_getMaxDimension(opts, avail_primary);

                //  complement items and sizes
                opts.items = in_complementItems(opts.items, opts, a_itm, start);
                opts[opts.d['width']] = in_complementPrimarySize(opts[opts.d['width']], opts, a_itm);
                opts[opts.d['height']] = in_complementSecondarySize(opts[opts.d['height']], opts, a_itm);

                //  primary size not set for a responsive carousel
                if (opts.responsive) {
                    if (!is_percentage(opts[opts.d['width']])) {
                        opts[opts.d['width']] = '100%';
                    }
                }

                //  primary size is percentage
                if (is_percentage(opts[opts.d['width']])) {
                    crsl.upDateOnWindowResize = true;
                    crsl.primarySizePercentage = opts[opts.d['width']];
                    opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
                    if (!opts.items.visible) {
                        opts.items.visibleConf.variable = true;
                    }
                }

                if (opts.responsive) {
                    opts.usePadding = false;
                    opts.padding = [0, 0, 0, 0];
                    opts.align = false;
                    opts.items.visibleConf.variable = false;
                } else {
                    //  visible-items not set
                    if (!opts.items.visible) {
                        opts = in_complementVisibleItems(opts, avail_primary);
                    }

                    //  primary size not set -> calculate it or set to "variable"
                    if (!opts[opts.d['width']]) {
                        if (!opts.items.visibleConf.variable && is_number(opts.items[opts.d['width']]) && opts.items.filter == '*') {
                            opts[opts.d['width']] = opts.items.visible * opts.items[opts.d['width']];
                            opts.align = false;
                        } else {
                            opts[opts.d['width']] = 'variable';
                        }
                    }
                    //  align not set -> set to center if primary size is number
                    if (is_undefined(opts.align)) {
                        opts.align = (is_number(opts[opts.d['width']])) ? 'center' : false;
                    }
                    //  set variabe visible-items
                    if (opts.items.visibleConf.variable) {
                        opts.items.visible = gn_getVisibleItemsNext(a_itm, opts, 0);
                    }
                }

                //  set visible items by filter
                if (opts.items.filter != '*' && !opts.items.visibleConf.variable) {
                    opts.items.visibleConf.org = opts.items.visible;
                    opts.items.visible = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
                }

                opts.items.visible = cf_getItemsAdjust(opts.items.visible, opts, opts.items.visibleConf.adjust, $tt0);
                opts.items.visibleConf.old = opts.items.visible;

                if (opts.responsive) {
                    if (!opts.items.visibleConf.min) {
                        opts.items.visibleConf.min = opts.items.visible;
                    }
                    if (!opts.items.visibleConf.max) {
                        opts.items.visibleConf.max = opts.items.visible;
                    }
                    opts = in_getResponsiveValues(opts, a_itm, avail_primary);
                } else {
                    opts.padding = cf_getPadding(opts.padding);

                    if (opts.align == 'top') {
                        opts.align = 'left';
                    } else if (opts.align == 'bottom') {
                        opts.align = 'right';
                    }

                    switch (opts.align) {
                        //  align: center, left or right
                        case 'center':
                        case 'left':
                        case 'right':
                            if (opts[opts.d['width']] != 'variable') {
                                opts = in_getAlignPadding(opts, a_itm);
                                opts.usePadding = true;
                            }
                            break;

                            //  padding
                        default:
                            opts.align = false;
                            opts.usePadding = (
                                opts.padding[0] == 0 &&
                                opts.padding[1] == 0 &&
                                opts.padding[2] == 0 &&
                                opts.padding[3] == 0
                            ) ? false : true;
                            break;
                    }
                }

                if (!is_number(opts.scroll.duration)) {
                    opts.scroll.duration = 500;
                }
                if (is_undefined(opts.scroll.items)) {
                    opts.scroll.items = (opts.responsive || opts.items.visibleConf.variable || opts.items.filter != '*') ? 'visible' : opts.items.visible;
                }

                opts.auto = $.extend(true, {}, opts.scroll, opts.auto);
                opts.prev = $.extend(true, {}, opts.scroll, opts.prev);
                opts.next = $.extend(true, {}, opts.scroll, opts.next);
                opts.pagination = $.extend(true, {}, opts.scroll, opts.pagination);
                //  swipe and mousewheel extend later on, per direction

                opts.auto = go_complementAutoObject($tt0, opts.auto);
                opts.prev = go_complementPrevNextObject($tt0, opts.prev);
                opts.next = go_complementPrevNextObject($tt0, opts.next);
                opts.pagination = go_complementPaginationObject($tt0, opts.pagination);
                opts.swipe = go_complementSwipeObject($tt0, opts.swipe);
                opts.mousewheel = go_complementMousewheelObject($tt0, opts.mousewheel);

                if (opts.synchronise) {
                    opts.synchronise = cf_getSynchArr(opts.synchronise);
                }


                //  DEPRECATED
                if (opts.auto.onPauseStart) {
                    opts.auto.onTimeoutStart = opts.auto.onPauseStart;
                    deprecated('auto.onPauseStart', 'auto.onTimeoutStart');
                }
                if (opts.auto.onPausePause) {
                    opts.auto.onTimeoutPause = opts.auto.onPausePause;
                    deprecated('auto.onPausePause', 'auto.onTimeoutPause');
                }
                if (opts.auto.onPauseEnd) {
                    opts.auto.onTimeoutEnd = opts.auto.onPauseEnd;
                    deprecated('auto.onPauseEnd', 'auto.onTimeoutEnd');
                }
                if (opts.auto.pauseDuration) {
                    opts.auto.timeoutDuration = opts.auto.pauseDuration;
                    deprecated('auto.pauseDuration', 'auto.timeoutDuration');
                }
                //  /DEPRECATED


            }; //  /init


            FN._cfs_build = function() {
                $cfs.data('_cfs_isCarousel', true);

                var a_itm = $cfs.children(),
                    orgCSS = in_mapCss($cfs, ['textAlign', 'float', 'position', 'top', 'right', 'bottom', 'left', 'zIndex', 'width', 'height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']),
                    newPosition = 'relative';

                switch (orgCSS.position) {
                    case 'absolute':
                    case 'fixed':
                        newPosition = orgCSS.position;
                        break;
                }

                if (conf.wrapper == 'parent') {
                    sz_storeOrigCss($wrp);
                } else {
                    $wrp.css(orgCSS);
                }
                $wrp.css({
                    'overflow': 'hidden',
                    'position': newPosition
                });

                sz_storeOrigCss($cfs);
                $cfs.data('_cfs_origCssZindex', orgCSS.zIndex);
                $cfs.css({
                    'textAlign': 'left',
                    'float': 'none',
                    'position': 'absolute',
                    'top': 0,
                    'right': 'auto',
                    'bottom': 'auto',
                    'left': 0,
                    'marginTop': 0,
                    'marginRight': 0,
                    'marginBottom': 0,
                    'marginLeft': 0
                });

                sz_storeMargin(a_itm, opts);
                sz_storeOrigCss(a_itm);
                if (opts.responsive) {
                    sz_setResponsiveSizes(opts, a_itm);
                }

            }; //  /build


            FN._cfs_bind_events = function() {
                FN._cfs_unbind_events();


                //  stop event
                $cfs.bind(cf_e('stop', conf), function(e, imm) {
                    e.stopPropagation();

                    //  button
                    if (!crsl.isStopped) {
                        if (opts.auto.button) {
                            opts.auto.button.addClass(cf_c('stopped', conf));
                        }
                    }

                    //  set stopped
                    crsl.isStopped = true;

                    if (opts.auto.play) {
                        opts.auto.play = false;
                        $cfs.trigger(cf_e('pause', conf), imm);
                    }
                    return true;
                });


                //  finish event
                $cfs.bind(cf_e('finish', conf), function(e) {
                    e.stopPropagation();
                    if (crsl.isScrolling) {
                        sc_stopScroll(scrl);
                    }
                    return true;
                });


                //  pause event
                $cfs.bind(cf_e('pause', conf), function(e, imm, res) {
                    e.stopPropagation();
                    tmrs = sc_clearTimers(tmrs);

                    //  immediately pause
                    if (imm && crsl.isScrolling) {
                        scrl.isStopped = true;
                        var nst = getTime() - scrl.startTime;
                        scrl.duration -= nst;
                        if (scrl.pre) {
                            scrl.pre.duration -= nst;
                        }
                        if (scrl.post) {
                            scrl.post.duration -= nst;
                        }
                        sc_stopScroll(scrl, false);
                    }

                    //  update remaining pause-time
                    if (!crsl.isPaused && !crsl.isScrolling) {
                        if (res) {
                            tmrs.timePassed += getTime() - tmrs.startTime;
                        }
                    }

                    //  button
                    if (!crsl.isPaused) {
                        if (opts.auto.button) {
                            opts.auto.button.addClass(cf_c('paused', conf));
                        }
                    }

                    //  set paused
                    crsl.isPaused = true;

                    //  pause pause callback
                    if (opts.auto.onTimeoutPause) {
                        var dur1 = opts.auto.timeoutDuration - tmrs.timePassed,
                            perc = 100 - Math.ceil(dur1 * 100 / opts.auto.timeoutDuration);

                        opts.auto.onTimeoutPause.call($tt0, perc, dur1);
                    }
                    return true;
                });


                //  play event
                $cfs.bind(cf_e('play', conf), function(e, dir, del, res) {
                    e.stopPropagation();
                    tmrs = sc_clearTimers(tmrs);

                    //  sort params
                    var v = [dir, del, res],
                        t = ['string', 'number', 'boolean'],
                        a = cf_sortParams(v, t);

                    dir = a[0];
                    del = a[1];
                    res = a[2];

                    if (dir != 'prev' && dir != 'next') {
                        dir = crsl.direction;
                    }
                    if (!is_number(del)) {
                        del = 0;
                    }
                    if (!is_boolean(res)) {
                        res = false;
                    }

                    //  stopped?
                    if (res) {
                        crsl.isStopped = false;
                        opts.auto.play = true;
                    }
                    if (!opts.auto.play) {
                        e.stopImmediatePropagation();
                        return debug(conf, 'Carousel stopped: Not scrolling.');
                    }

                    //  button
                    if (crsl.isPaused) {
                        if (opts.auto.button) {
                            opts.auto.button.removeClass(cf_c('stopped', conf));
                            opts.auto.button.removeClass(cf_c('paused', conf));
                        }
                    }

                    //  set playing
                    crsl.isPaused = false;
                    tmrs.startTime = getTime();

                    //  timeout the scrolling
                    var dur1 = opts.auto.timeoutDuration + del;
                    dur2 = dur1 - tmrs.timePassed;
                    perc = 100 - Math.ceil(dur2 * 100 / dur1);

                    if (opts.auto.progress) {
                        tmrs.progress = setInterval(function() {
                            var pasd = getTime() - tmrs.startTime + tmrs.timePassed,
                                perc = Math.ceil(pasd * 100 / dur1);
                            opts.auto.progress.updater.call(opts.auto.progress.bar[0], perc);
                        }, opts.auto.progress.interval);
                    }

                    tmrs.auto = setTimeout(function() {
                        if (opts.auto.progress) {
                            opts.auto.progress.updater.call(opts.auto.progress.bar[0], 100);
                        }
                        if (opts.auto.onTimeoutEnd) {
                            opts.auto.onTimeoutEnd.call($tt0, perc, dur2);
                        }
                        if (crsl.isScrolling) {
                            $cfs.trigger(cf_e('play', conf), dir);
                        } else {
                            $cfs.trigger(cf_e(dir, conf), opts.auto);
                        }
                    }, dur2);

                    //  pause start callback
                    if (opts.auto.onTimeoutStart) {
                        opts.auto.onTimeoutStart.call($tt0, perc, dur2);
                    }

                    return true;
                });


                //  resume event
                $cfs.bind(cf_e('resume', conf), function(e) {
                    e.stopPropagation();
                    if (scrl.isStopped) {
                        scrl.isStopped = false;
                        crsl.isPaused = false;
                        crsl.isScrolling = true;
                        scrl.startTime = getTime();
                        sc_startScroll(scrl, conf);
                    } else {
                        $cfs.trigger(cf_e('play', conf));
                    }
                    return true;
                });


                //  prev + next events
                $cfs.bind(cf_e('prev', conf) + ' ' + cf_e('next', conf), function(e, obj, num, clb, que) {
                    e.stopPropagation();

                    //  stopped or hidden carousel, don't scroll, don't queue
                    if (crsl.isStopped || $cfs.is(':hidden')) {
                        e.stopImmediatePropagation();
                        return debug(conf, 'Carousel stopped or hidden: Not scrolling.');
                    }

                    //  not enough items
                    var minimum = (is_number(opts.items.minimum)) ? opts.items.minimum : opts.items.visible + 1;
                    if (minimum > itms.total) {
                        e.stopImmediatePropagation();
                        return debug(conf, 'Not enough items (' + itms.total + ' total, ' + minimum + ' needed): Not scrolling.');
                    }

                    //  get config
                    var v = [obj, num, clb, que],
                        t = ['object', 'number/string', 'function', 'boolean'],
                        a = cf_sortParams(v, t);

                    obj = a[0];
                    num = a[1];
                    clb = a[2];
                    que = a[3];

                    var eType = e.type.slice(conf.events.prefix.length);

                    if (!is_object(obj)) {
                        obj = {};
                    }
                    if (is_function(clb)) {
                        obj.onAfter = clb;
                    }
                    if (is_boolean(que)) {
                        obj.queue = que;
                    }
                    obj = $.extend(true, {}, opts[eType], obj);

                    //  test conditions callback
                    if (obj.conditions && !obj.conditions.call($tt0, eType)) {
                        e.stopImmediatePropagation();
                        return debug(conf, 'Callback "conditions" returned false.');
                    }

                    if (!is_number(num)) {
                        if (opts.items.filter != '*') {
                            num = 'visible';
                        } else {
                            var arr = [num, obj.items, opts[eType].items];
                            for (var a = 0, l = arr.length; a < l; a++) {
                                if (is_number(arr[a]) || arr[a] == 'page' || arr[a] == 'visible') {
                                    num = arr[a];
                                    break;
                                }
                            }
                        }
                        switch (num) {
                            case 'page':
                                e.stopImmediatePropagation();
                                return $cfs.triggerHandler(cf_e(eType + 'Page', conf), [obj, clb]);
                                break;

                            case 'visible':
                                if (!opts.items.visibleConf.variable && opts.items.filter == '*') {
                                    num = opts.items.visible;
                                }
                                break;
                        }
                    }

                    //  resume animation, add current to queue
                    if (scrl.isStopped) {
                        $cfs.trigger(cf_e('resume', conf));
                        $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
                        e.stopImmediatePropagation();
                        return debug(conf, 'Carousel resumed scrolling.');
                    }

                    //  queue if scrolling
                    if (obj.duration > 0) {
                        if (crsl.isScrolling) {
                            if (obj.queue) {
                                if (obj.queue == 'last') {
                                    queu = [];
                                }
                                if (obj.queue != 'first' || queu.length == 0) {
                                    $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
                                }
                            }
                            e.stopImmediatePropagation();
                            return debug(conf, 'Carousel currently scrolling.');
                        }
                    }

                    tmrs.timePassed = 0;
                    $cfs.trigger(cf_e('slide_' + eType, conf), [obj, num]);

                    //  synchronise
                    if (opts.synchronise) {
                        var s = opts.synchronise,
                            c = [obj, num];

                        for (var j = 0, l = s.length; j < l; j++) {
                            var d = eType;
                            if (!s[j][2]) {
                                d = (d == 'prev') ? 'next' : 'prev';
                            }
                            if (!s[j][1]) {
                                c[0] = s[j][0].triggerHandler('_cfs_triggerEvent', ['configuration', d]);
                            }
                            c[1] = num + s[j][3];
                            s[j][0].trigger('_cfs_triggerEvent', ['slide_' + d, c]);
                        }
                    }
                    return true;
                });


                //  prev event
                $cfs.bind(cf_e('slide_prev', conf), function(e, sO, nI) {
                    e.stopPropagation();
                    var a_itm = $cfs.children();

                    //  non-circular at start, scroll to end
                    if (!opts.circular) {
                        if (itms.first == 0) {
                            if (opts.infinite) {
                                $cfs.trigger(cf_e('next', conf), itms.total - 1);
                            }
                            return e.stopImmediatePropagation();
                        }
                    }

                    sz_resetMargin(a_itm, opts);

                    //  find number of items to scroll
                    if (!is_number(nI)) {
                        if (opts.items.visibleConf.variable) {
                            nI = gn_getVisibleItemsPrev(a_itm, opts, itms.total - 1);
                        } else if (opts.items.filter != '*') {
                            var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
                            nI = gn_getScrollItemsPrevFilter(a_itm, opts, itms.total - 1, xI);
                        } else {
                            nI = opts.items.visible;
                        }
                        nI = cf_getAdjust(nI, opts, sO.items, $tt0);
                    }

                    //  prevent non-circular from scrolling to far
                    if (!opts.circular) {
                        if (itms.total - nI < itms.first) {
                            nI = itms.total - itms.first;
                        }
                    }

                    //  set new number of visible items
                    opts.items.visibleConf.old = opts.items.visible;
                    if (opts.items.visibleConf.variable) {
                        var vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total - nI), opts, opts.items.visibleConf.adjust, $tt0);
                        if (opts.items.visible + nI <= vI && nI < itms.total) {
                            nI++;
                            vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total - nI), opts, opts.items.visibleConf.adjust, $tt0);
                        }
                        opts.items.visible = vI;
                    } else if (opts.items.filter != '*') {
                        var vI = gn_getVisibleItemsNextFilter(a_itm, opts, itms.total - nI);
                        opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                    }

                    sz_resetMargin(a_itm, opts, true);

                    //  scroll 0, don't scroll
                    if (nI == 0) {
                        e.stopImmediatePropagation();
                        return debug(conf, '0 items to scroll: Not scrolling.');
                    }
                    debug(conf, 'Scrolling ' + nI + ' items backward.');


                    //  save new config
                    itms.first += nI;
                    while (itms.first >= itms.total) {
                        itms.first -= itms.total;
                    }

                    //  non-circular callback
                    if (!opts.circular) {
                        if (itms.first == 0 && sO.onEnd) {
                            sO.onEnd.call($tt0, 'prev');
                        }
                        if (!opts.infinite) {
                            nv_enableNavi(opts, itms.first, conf);
                        }
                    }

                    //  rearrange items
                    $cfs.children().slice(itms.total - nI, itms.total).prependTo($cfs);
                    if (itms.total < opts.items.visible + nI) {
                        $cfs.children().slice(0, (opts.items.visible + nI) - itms.total).clone(true).appendTo($cfs);
                    }

                    //  the needed items
                    var a_itm = $cfs.children(),
                        i_old = gi_getOldItemsPrev(a_itm, opts, nI),
                        i_new = gi_getNewItemsPrev(a_itm, opts),
                        i_cur_l = a_itm.eq(nI - 1),
                        i_old_l = i_old.last(),
                        i_new_l = i_new.last();

                    sz_resetMargin(a_itm, opts);

                    var pL = 0,
                        pR = 0;

                    if (opts.align) {
                        var p = cf_getAlignPadding(i_new, opts);
                        pL = p[0];
                        pR = p[1];
                    }
                    var oL = (pL < 0) ? opts.padding[opts.d[3]] : 0;

                    //  hide items for fx directscroll
                    var hiddenitems = false,
                        i_skp = $();
                    if (opts.items.visible < nI) {
                        i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
                        if (sO.fx == 'directscroll') {
                            var orgW = opts.items[opts.d['width']];
                            hiddenitems = i_skp;
                            i_cur_l = i_new_l;
                            sc_hideHiddenItems(hiddenitems);
                            opts.items[opts.d['width']] = 'variable';
                        }
                    }

                    //  save new sizes
                    var $cf2 = false,
                        i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
                        w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
                        i_siz_vis = 0,
                        a_cfs = {},
                        a_wsz = {},
                        a_cur = {},
                        a_old = {},
                        a_new = {},
                        a_lef = {},
                        a_lef_vis = {},
                        a_dur = sc_getDuration(sO, opts, nI, i_siz);

                    switch (sO.fx) {
                        case 'cover':
                        case 'cover-fade':
                            i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visible), opts, 'width');
                            break;
                    }

                    if (hiddenitems) {
                        opts.items[opts.d['width']] = orgW;
                    }

                    sz_resetMargin(a_itm, opts, true);
                    if (pR >= 0) {
                        sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);
                    }
                    if (pL >= 0) {
                        sz_resetMargin(i_cur_l, opts, opts.padding[opts.d[3]]);
                    }

                    if (opts.align) {
                        opts.padding[opts.d[1]] = pR;
                        opts.padding[opts.d[3]] = pL;
                    }

                    a_lef[opts.d['left']] = -(i_siz - oL);
                    a_lef_vis[opts.d['left']] = -(i_siz_vis - oL);
                    a_wsz[opts.d['left']] = w_siz[opts.d['width']];

                    //  scrolling functions
                    var _s_wrapper = function() {},
                        _a_wrapper = function() {},
                        _s_paddingold = function() {},
                        _a_paddingold = function() {},
                        _s_paddingnew = function() {},
                        _a_paddingnew = function() {},
                        _s_paddingcur = function() {},
                        _a_paddingcur = function() {},
                        _onafter = function() {},
                        _moveitems = function() {},
                        _position = function() {};

                    //  clone carousel
                    switch (sO.fx) {
                        case 'crossfade':
                        case 'cover':
                        case 'cover-fade':
                        case 'uncover':
                        case 'uncover-fade':
                            $cf2 = $cfs.clone(true).appendTo($wrp);
                            break;
                    }
                    switch (sO.fx) {
                        case 'crossfade':
                        case 'uncover':
                        case 'uncover-fade':
                            $cf2.children().slice(0, nI).remove();
                            $cf2.children().slice(opts.items.visibleConf.old).remove();
                            break;

                        case 'cover':
                        case 'cover-fade':
                            $cf2.children().slice(opts.items.visible).remove();
                            $cf2.css(a_lef_vis);
                            break;
                    }

                    $cfs.css(a_lef);

                    //  reset all scrolls
                    scrl = sc_setScroll(a_dur, sO.easing, conf);

                    //  animate / set carousel
                    a_cfs[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

                    //  animate / set wrapper
                    if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable') {
                        _s_wrapper = function() {
                            $wrp.css(w_siz);
                        };
                        _a_wrapper = function() {
                            scrl.anims.push([$wrp, w_siz]);
                        };
                    }

                    //  animate / set items
                    if (opts.usePadding) {
                        if (i_new_l.not(i_cur_l).length) {
                            a_cur[opts.d['marginRight']] = i_cur_l.data('_cfs_origCssMargin');

                            if (pL < 0) {
                                i_cur_l.css(a_cur);
                            } else {
                                _s_paddingcur = function() {
                                    i_cur_l.css(a_cur);
                                };
                                _a_paddingcur = function() {
                                    scrl.anims.push([i_cur_l, a_cur]);
                                };
                            }
                        }
                        switch (sO.fx) {
                            case 'cover':
                            case 'cover-fade':
                                $cf2.children().eq(nI - 1).css(a_cur);
                                break;
                        }

                        if (i_new_l.not(i_old_l).length) {
                            a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
                            _s_paddingold = function() {
                                i_old_l.css(a_old);
                            };
                            _a_paddingold = function() {
                                scrl.anims.push([i_old_l, a_old]);
                            };
                        }

                        if (pR >= 0) {
                            a_new[opts.d['marginRight']] = i_new_l.data('_cfs_origCssMargin') + opts.padding[opts.d[1]];
                            _s_paddingnew = function() {
                                i_new_l.css(a_new);
                            };
                            _a_paddingnew = function() {
                                scrl.anims.push([i_new_l, a_new]);
                            };
                        }
                    }

                    //  set position
                    _position = function() {
                        $cfs.css(a_cfs);
                    };


                    var overFill = opts.items.visible + nI - itms.total;

                    //  rearrange items
                    _moveitems = function() {
                        if (overFill > 0) {
                            $cfs.children().slice(itms.total).remove();
                            i_old = $($cfs.children().slice(itms.total - (opts.items.visible - overFill)).get().concat($cfs.children().slice(0, overFill).get()));
                        }
                        sc_showHiddenItems(hiddenitems);

                        if (opts.usePadding) {
                            var l_itm = $cfs.children().eq(opts.items.visible + nI - 1);
                            l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
                        }
                    };


                    var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'prev', a_dur, w_siz);

                    //  fire onAfter callbacks
                    _onafter = function() {
                        sc_afterScroll($cfs, $cf2, sO);
                        crsl.isScrolling = false;
                        clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
                        queu = sc_fireQueue($cfs, queu, conf);

                        if (!crsl.isPaused) {
                            $cfs.trigger(cf_e('play', conf));
                        }
                    };

                    //  fire onBefore callback
                    crsl.isScrolling = true;
                    tmrs = sc_clearTimers(tmrs);
                    clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

                    switch (sO.fx) {
                        case 'none':
                            $cfs.css(a_cfs);
                            _s_wrapper();
                            _s_paddingold();
                            _s_paddingnew();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            _onafter();
                            break;

                        case 'fade':
                            scrl.anims.push([$cfs, {
                                    'opacity': 0
                                },
                                function() {
                                    _s_wrapper();
                                    _s_paddingold();
                                    _s_paddingnew();
                                    _s_paddingcur();
                                    _position();
                                    _moveitems();
                                    scrl = sc_setScroll(a_dur, sO.easing, conf);
                                    scrl.anims.push([$cfs, {
                                            'opacity': 1
                                        },
                                        _onafter
                                    ]);
                                    sc_startScroll(scrl, conf);
                                }
                            ]);
                            break;

                        case 'crossfade':
                            $cfs.css({
                                'opacity': 0
                            });
                            scrl.anims.push([$cf2, {
                                'opacity': 0
                            }]);
                            scrl.anims.push([$cfs, {
                                    'opacity': 1
                                },
                                _onafter
                            ]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingnew();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        case 'cover':
                            scrl.anims.push([$cf2, a_cfs,
                                function() {
                                    _s_paddingold();
                                    _s_paddingnew();
                                    _s_paddingcur();
                                    _position();
                                    _moveitems();
                                    _onafter();
                                }
                            ]);
                            _a_wrapper();
                            break;

                        case 'cover-fade':
                            scrl.anims.push([$cfs, {
                                'opacity': 0
                            }]);
                            scrl.anims.push([$cf2, a_cfs,
                                function() {
                                    $cfs.css({
                                        'opacity': 1
                                    });
                                    _s_paddingold();
                                    _s_paddingnew();
                                    _s_paddingcur();
                                    _position();
                                    _moveitems();
                                    _onafter();
                                }
                            ]);
                            _a_wrapper();
                            break;

                        case 'uncover':
                            scrl.anims.push([$cf2, a_wsz, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingnew();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        case 'uncover-fade':
                            $cfs.css({
                                'opacity': 0
                            });
                            scrl.anims.push([$cfs, {
                                'opacity': 1
                            }]);
                            scrl.anims.push([$cf2, a_wsz, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingnew();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        default:
                            scrl.anims.push([$cfs, a_cfs,
                                function() {
                                    _moveitems();
                                    _onafter();
                                }
                            ]);
                            _a_wrapper();
                            _a_paddingold();
                            _a_paddingnew();
                            _a_paddingcur();
                            break;
                    }

                    sc_startScroll(scrl, conf);
                    cf_setCookie(opts.cookie, $cfs, conf);

                    $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

                    return true;
                });


                //  next event
                $cfs.bind(cf_e('slide_next', conf), function(e, sO, nI) {
                    e.stopPropagation();
                    var a_itm = $cfs.children();

                    //  non-circular at end, scroll to start
                    if (!opts.circular) {
                        if (itms.first == opts.items.visible) {
                            if (opts.infinite) {
                                $cfs.trigger(cf_e('prev', conf), itms.total - 1);
                            }
                            return e.stopImmediatePropagation();
                        }
                    }

                    sz_resetMargin(a_itm, opts);

                    //  find number of items to scroll
                    if (!is_number(nI)) {
                        if (opts.items.filter != '*') {
                            var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
                            nI = gn_getScrollItemsNextFilter(a_itm, opts, 0, xI);
                        } else {
                            nI = opts.items.visible;
                        }
                        nI = cf_getAdjust(nI, opts, sO.items, $tt0);
                    }

                    var lastItemNr = (itms.first == 0) ? itms.total : itms.first;

                    //  prevent non-circular from scrolling to far
                    if (!opts.circular) {
                        if (opts.items.visibleConf.variable) {
                            var vI = gn_getVisibleItemsNext(a_itm, opts, nI),
                                xI = gn_getVisibleItemsPrev(a_itm, opts, lastItemNr - 1);
                        } else {
                            var vI = opts.items.visible,
                                xI = opts.items.visible;
                        }

                        if (nI + vI > lastItemNr) {
                            nI = lastItemNr - xI;
                        }
                    }

                    //  set new number of visible items
                    opts.items.visibleConf.old = opts.items.visible;
                    if (opts.items.visibleConf.variable) {
                        var vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
                        while (opts.items.visible - nI >= vI && nI < itms.total) {
                            nI++;
                            vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
                        }
                        opts.items.visible = vI;
                    } else if (opts.items.filter != '*') {
                        var vI = gn_getVisibleItemsNextFilter(a_itm, opts, nI);
                        opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                    }

                    sz_resetMargin(a_itm, opts, true);

                    //  scroll 0, don't scroll
                    if (nI == 0) {
                        e.stopImmediatePropagation();
                        return debug(conf, '0 items to scroll: Not scrolling.');
                    }
                    debug(conf, 'Scrolling ' + nI + ' items forward.');


                    //  save new config
                    itms.first -= nI;
                    while (itms.first < 0) {
                        itms.first += itms.total;
                    }

                    //  non-circular callback
                    if (!opts.circular) {
                        if (itms.first == opts.items.visible && sO.onEnd) {
                            sO.onEnd.call($tt0, 'next');
                        }
                        if (!opts.infinite) {
                            nv_enableNavi(opts, itms.first, conf);
                        }
                    }

                    //  rearrange items
                    if (itms.total < opts.items.visible + nI) {
                        $cfs.children().slice(0, (opts.items.visible + nI) - itms.total).clone(true).appendTo($cfs);
                    }

                    //  the needed items
                    var a_itm = $cfs.children(),
                        i_old = gi_getOldItemsNext(a_itm, opts),
                        i_new = gi_getNewItemsNext(a_itm, opts, nI),
                        i_cur_l = a_itm.eq(nI - 1),
                        i_old_l = i_old.last(),
                        i_new_l = i_new.last();

                    sz_resetMargin(a_itm, opts);

                    var pL = 0,
                        pR = 0;

                    if (opts.align) {
                        var p = cf_getAlignPadding(i_new, opts);
                        pL = p[0];
                        pR = p[1];
                    }

                    //  hide items for fx directscroll
                    var hiddenitems = false,
                        i_skp = $();
                    if (opts.items.visibleConf.old < nI) {
                        i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
                        if (sO.fx == 'directscroll') {
                            var orgW = opts.items[opts.d['width']];
                            hiddenitems = i_skp;
                            i_cur_l = i_old_l;
                            sc_hideHiddenItems(hiddenitems);
                            opts.items[opts.d['width']] = 'variable';
                        }
                    }

                    //  save new sizes
                    var $cf2 = false,
                        i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
                        w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
                        i_siz_vis = 0,
                        a_cfs = {},
                        a_cfs_vis = {},
                        a_cur = {},
                        a_old = {},
                        a_lef = {},
                        a_dur = sc_getDuration(sO, opts, nI, i_siz);

                    switch (sO.fx) {
                        case 'uncover':
                        case 'uncover-fade':
                            i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visibleConf.old), opts, 'width');
                            break;
                    }

                    if (hiddenitems) {
                        opts.items[opts.d['width']] = orgW;
                    }

                    if (opts.align) {
                        if (opts.padding[opts.d[1]] < 0) {
                            opts.padding[opts.d[1]] = 0;
                        }
                    }
                    sz_resetMargin(a_itm, opts, true);
                    sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);

                    if (opts.align) {
                        opts.padding[opts.d[1]] = pR;
                        opts.padding[opts.d[3]] = pL;
                    }

                    a_lef[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

                    //  scrolling functions
                    var _s_wrapper = function() {},
                        _a_wrapper = function() {},
                        _s_paddingold = function() {},
                        _a_paddingold = function() {},
                        _s_paddingcur = function() {},
                        _a_paddingcur = function() {},
                        _onafter = function() {},
                        _moveitems = function() {},
                        _position = function() {};

                    //  clone carousel
                    switch (sO.fx) {
                        case 'crossfade':
                        case 'cover':
                        case 'cover-fade':
                        case 'uncover':
                        case 'uncover-fade':
                            $cf2 = $cfs.clone(true).appendTo($wrp);
                            $cf2.children().slice(opts.items.visibleConf.old).remove();
                            break;
                    }
                    switch (sO.fx) {
                        case 'crossfade':
                        case 'cover':
                        case 'cover-fade':
                            $cfs.css('zIndex', 1);
                            $cf2.css('zIndex', 0);
                            break;
                    }

                    //  reset all scrolls
                    scrl = sc_setScroll(a_dur, sO.easing, conf);

                    //  animate / set carousel
                    a_cfs[opts.d['left']] = -i_siz;
                    a_cfs_vis[opts.d['left']] = -i_siz_vis;

                    if (pL < 0) {
                        a_cfs[opts.d['left']] += pL;
                    }

                    //  animate / set wrapper
                    if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable') {
                        _s_wrapper = function() {
                            $wrp.css(w_siz);
                        };
                        _a_wrapper = function() {
                            scrl.anims.push([$wrp, w_siz]);
                        };
                    }

                    //  animate / set items
                    if (opts.usePadding) {
                        var i_new_l_m = i_new_l.data('_cfs_origCssMargin');

                        if (pR >= 0) {
                            i_new_l_m += opts.padding[opts.d[1]];
                        }
                        i_new_l.css(opts.d['marginRight'], i_new_l_m);

                        if (i_cur_l.not(i_old_l).length) {
                            a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
                        }
                        _s_paddingold = function() {
                            i_old_l.css(a_old);
                        };
                        _a_paddingold = function() {
                            scrl.anims.push([i_old_l, a_old]);
                        };

                        var i_cur_l_m = i_cur_l.data('_cfs_origCssMargin');
                        if (pL > 0) {
                            i_cur_l_m += opts.padding[opts.d[3]];
                        }

                        a_cur[opts.d['marginRight']] = i_cur_l_m;

                        _s_paddingcur = function() {
                            i_cur_l.css(a_cur);
                        };
                        _a_paddingcur = function() {
                            scrl.anims.push([i_cur_l, a_cur]);
                        };
                    }

                    //  set position
                    _position = function() {
                        $cfs.css(a_lef);
                    };


                    var overFill = opts.items.visible + nI - itms.total;

                    //  rearrange items
                    _moveitems = function() {
                        if (overFill > 0) {
                            $cfs.children().slice(itms.total).remove();
                        }
                        var l_itm = $cfs.children().slice(0, nI).appendTo($cfs).last();
                        if (overFill > 0) {
                            i_new = gi_getCurrentItems(a_itm, opts);
                        }
                        sc_showHiddenItems(hiddenitems);

                        if (opts.usePadding) {
                            if (itms.total < opts.items.visible + nI) {
                                var i_cur_l = $cfs.children().eq(opts.items.visible - 1);
                                i_cur_l.css(opts.d['marginRight'], i_cur_l.data('_cfs_origCssMargin') + opts.padding[opts.d[1]]);
                            }
                            l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
                        }
                    };


                    var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'next', a_dur, w_siz);

                    //  fire onAfter callbacks
                    _onafter = function() {
                        $cfs.css('zIndex', $cfs.data('_cfs_origCssZindex'));
                        sc_afterScroll($cfs, $cf2, sO);
                        crsl.isScrolling = false;
                        clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
                        queu = sc_fireQueue($cfs, queu, conf);

                        if (!crsl.isPaused) {
                            $cfs.trigger(cf_e('play', conf));
                        }
                    };

                    //  fire onBefore callbacks
                    crsl.isScrolling = true;
                    tmrs = sc_clearTimers(tmrs);
                    clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

                    switch (sO.fx) {
                        case 'none':
                            $cfs.css(a_cfs);
                            _s_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            _onafter();
                            break;

                        case 'fade':
                            scrl.anims.push([$cfs, {
                                    'opacity': 0
                                },
                                function() {
                                    _s_wrapper();
                                    _s_paddingold();
                                    _s_paddingcur();
                                    _position();
                                    _moveitems();
                                    scrl = sc_setScroll(a_dur, sO.easing, conf);
                                    scrl.anims.push([$cfs, {
                                            'opacity': 1
                                        },
                                        _onafter
                                    ]);
                                    sc_startScroll(scrl, conf);
                                }
                            ]);
                            break;

                        case 'crossfade':
                            $cfs.css({
                                'opacity': 0
                            });
                            scrl.anims.push([$cf2, {
                                'opacity': 0
                            }]);
                            scrl.anims.push([$cfs, {
                                    'opacity': 1
                                },
                                _onafter
                            ]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        case 'cover':
                            $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
                            scrl.anims.push([$cfs, a_lef, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _moveitems();
                            break;

                        case 'cover-fade':
                            $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
                            scrl.anims.push([$cf2, {
                                'opacity': 0
                            }]);
                            scrl.anims.push([$cfs, a_lef, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _moveitems();
                            break;

                        case 'uncover':
                            scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        case 'uncover-fade':
                            $cfs.css({
                                'opacity': 0
                            });
                            scrl.anims.push([$cfs, {
                                'opacity': 1
                            }]);
                            scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
                            _a_wrapper();
                            _s_paddingold();
                            _s_paddingcur();
                            _position();
                            _moveitems();
                            break;

                        default:
                            scrl.anims.push([$cfs, a_cfs,
                                function() {
                                    _position();
                                    _moveitems();
                                    _onafter();
                                }
                            ]);
                            _a_wrapper();
                            _a_paddingold();
                            _a_paddingcur();
                            break;
                    }

                    sc_startScroll(scrl, conf);
                    cf_setCookie(opts.cookie, $cfs, conf);

                    $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

                    return true;
                });


                //  slideTo event
                $cfs.bind(cf_e('slideTo', conf), function(e, num, dev, org, obj, dir, clb) {
                    e.stopPropagation();

                    var v = [num, dev, org, obj, dir, clb],
                        t = ['string/number/object', 'number', 'boolean', 'object', 'string', 'function'],
                        a = cf_sortParams(v, t);

                    obj = a[3];
                    dir = a[4];
                    clb = a[5];

                    num = gn_getItemIndex(a[0], a[1], a[2], itms, $cfs);

                    if (num == 0) {
                        return false;
                    }
                    if (!is_object(obj)) {
                        obj = false;
                    }

                    if (dir != 'prev' && dir != 'next') {
                        if (opts.circular) {
                            dir = (num <= itms.total / 2) ? 'next' : 'prev';
                        } else {
                            dir = (itms.first == 0 || itms.first > num) ? 'next' : 'prev';
                        }
                    }

                    if (dir == 'prev') {
                        num = itms.total - num;
                    }
                    $cfs.trigger(cf_e(dir, conf), [obj, num, clb]);

                    return true;
                });


                //  prevPage event
                $cfs.bind(cf_e('prevPage', conf), function(e, obj, clb) {
                    e.stopPropagation();
                    var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
                    return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur - 1, obj, 'prev', clb]);
                });


                //  nextPage event
                $cfs.bind(cf_e('nextPage', conf), function(e, obj, clb) {
                    e.stopPropagation();
                    var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
                    return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur + 1, obj, 'next', clb]);
                });


                //  slideToPage event
                $cfs.bind(cf_e('slideToPage', conf), function(e, pag, obj, dir, clb) {
                    e.stopPropagation();
                    if (!is_number(pag)) {
                        pag = $cfs.triggerHandler(cf_e('currentPage', conf));
                    }
                    var ipp = opts.pagination.items || opts.items.visible,
                        max = Math.ceil(itms.total / ipp) - 1;

                    if (pag < 0) {
                        pag = max;
                    }
                    if (pag > max) {
                        pag = 0;
                    }
                    return $cfs.triggerHandler(cf_e('slideTo', conf), [pag * ipp, 0, true, obj, dir, clb]);
                });

                //  jumpToStart event
                $cfs.bind(cf_e('jumpToStart', conf), function(e, s) {
                    e.stopPropagation();
                    if (s) {
                        s = gn_getItemIndex(s, 0, true, itms, $cfs);
                    } else {
                        s = 0;
                    }

                    s += itms.first;
                    if (s != 0) {
                        if (itms.total > 0) {
                            while (s > itms.total) {
                                s -= itms.total;
                            }
                        }
                        $cfs.prepend($cfs.children().slice(s, itms.total));
                    }
                    return true;
                });


                //  synchronise event
                $cfs.bind(cf_e('synchronise', conf), function(e, s) {
                    e.stopPropagation();
                    if (s) {
                        s = cf_getSynchArr(s);
                    } else if (opts.synchronise) {
                        s = opts.synchronise;
                    } else {
                        return debug(conf, 'No carousel to synchronise.');
                    }

                    var n = $cfs.triggerHandler(cf_e('currentPosition', conf)),
                        x = true;

                    for (var j = 0, l = s.length; j < l; j++) {
                        if (!s[j][0].triggerHandler(cf_e('slideTo', conf), [n, s[j][3], true])) {
                            x = false;
                        }
                    }
                    return x;
                });


                //  queue event
                $cfs.bind(cf_e('queue', conf), function(e, dir, opt) {
                    e.stopPropagation();
                    if (is_function(dir)) {
                        dir.call($tt0, queu);
                    } else if (is_array(dir)) {
                        queu = dir;
                    } else if (!is_undefined(dir)) {
                        queu.push([dir, opt]);
                    }
                    return queu;
                });


                //  insertItem event
                $cfs.bind(cf_e('insertItem', conf), function(e, itm, num, org, dev) {
                    e.stopPropagation();

                    var v = [itm, num, org, dev],
                        t = ['string/object', 'string/number/object', 'boolean', 'number'],
                        a = cf_sortParams(v, t);

                    itm = a[0];
                    num = a[1];
                    org = a[2];
                    dev = a[3];

                    if (is_object(itm) && !is_jquery(itm)) {
                        itm = $(itm);
                    } else if (is_string(itm)) {
                        itm = $(itm);
                    }
                    if (!is_jquery(itm) || itm.length == 0) {
                        return debug(conf, 'Not a valid object.');
                    }

                    if (is_undefined(num)) {
                        num = 'end';
                    }

                    sz_storeMargin(itm, opts);
                    sz_storeOrigCss(itm);

                    var orgNum = num,
                        before = 'before';

                    if (num == 'end') {
                        if (org) {
                            if (itms.first == 0) {
                                num = itms.total - 1;
                                before = 'after';
                            } else {
                                num = itms.first;
                                itms.first += itm.length;
                            }
                            if (num < 0) {
                                num = 0;
                            }
                        } else {
                            num = itms.total - 1;
                            before = 'after';
                        }
                    } else {
                        num = gn_getItemIndex(num, dev, org, itms, $cfs);
                    }

                    var $cit = $cfs.children().eq(num);
                    if ($cit.length) {
                        $cit[before](itm);
                    } else {
                        debug(conf, 'Correct insert-position not found! Appending item to the end.');
                        $cfs.append(itm);
                    }

                    if (orgNum != 'end' && !org) {
                        if (num < itms.first) {
                            itms.first += itm.length;
                        }
                    }
                    itms.total = $cfs.children().length;
                    if (itms.first >= itms.total) {
                        itms.first -= itms.total;
                    }

                    $cfs.trigger(cf_e('updateSizes', conf));
                    $cfs.trigger(cf_e('linkAnchors', conf));

                    return true;
                });


                //  removeItem event
                $cfs.bind(cf_e('removeItem', conf), function(e, num, org, dev) {
                    e.stopPropagation();

                    var v = [num, org, dev],
                        t = ['string/number/object', 'boolean', 'number'],
                        a = cf_sortParams(v, t);

                    num = a[0];
                    org = a[1];
                    dev = a[2];

                    var removed = false;

                    if (num instanceof $ && num.length > 1) {
                        $removed = $();
                        num.each(function(i, el) {
                            var $rem = $cfs.trigger(cf_e('removeItem', conf), [$(this), org, dev]);
                            if ($rem) {
                                $removed = $removed.add($rem);
                            }
                        });
                        return $removed;
                    }

                    if (is_undefined(num) || num == 'end') {
                        $removed = $cfs.children().last();
                    } else {
                        num = gn_getItemIndex(num, dev, org, itms, $cfs);
                        var $removed = $cfs.children().eq(num);
                        if ($removed.length) {
                            if (num < itms.first) {
                                itms.first -= $removed.length;
                            }
                        }
                    }
                    if ($removed && $removed.length) {
                        $removed.detach();
                        itms.total = $cfs.children().length;
                        $cfs.trigger(cf_e('updateSizes', conf));
                    }

                    return $removed;
                });


                //  onBefore and onAfter event
                $cfs.bind(cf_e('onBefore', conf) + ' ' + cf_e('onAfter', conf), function(e, fn) {
                    e.stopPropagation();
                    var eType = e.type.slice(conf.events.prefix.length);
                    if (is_array(fn)) {
                        clbk[eType] = fn;
                    }
                    if (is_function(fn)) {
                        clbk[eType].push(fn);
                    }
                    return clbk[eType];
                });


                //  currentPosition event
                $cfs.bind(cf_e('currentPosition', conf), function(e, fn) {
                    e.stopPropagation();
                    if (itms.first == 0) {
                        var val = 0;
                    } else {
                        var val = itms.total - itms.first;
                    }
                    if (is_function(fn)) {
                        fn.call($tt0, val);
                    }
                    return val;
                });


                //  currentPage event
                $cfs.bind(cf_e('currentPage', conf), function(e, fn) {
                    e.stopPropagation();
                    var ipp = opts.pagination.items || opts.items.visible,
                        max = Math.ceil(itms.total / ipp - 1),
                        nr;
                    if (itms.first == 0) {
                        nr = 0;
                    } else if (itms.first < itms.total % ipp) {
                        nr = 0;
                    } else if (itms.first == ipp && !opts.circular) {
                        nr = max;
                    } else {
                        nr = Math.round((itms.total - itms.first) / ipp);
                    }
                    if (nr < 0) {
                        nr = 0;
                    }
                    if (nr > max) {
                        nr = max;
                    }
                    if (is_function(fn)) {
                        fn.call($tt0, nr);
                    }
                    return nr;
                });


                //  currentVisible event
                $cfs.bind(cf_e('currentVisible', conf), function(e, fn) {
                    e.stopPropagation();
                    var $i = gi_getCurrentItems($cfs.children(), opts);
                    if (is_function(fn)) {
                        fn.call($tt0, $i);
                    }
                    return $i;
                });


                //  slice event
                $cfs.bind(cf_e('slice', conf), function(e, f, l, fn) {
                    e.stopPropagation();

                    if (itms.total == 0) {
                        return false;
                    }

                    var v = [f, l, fn],
                        t = ['number', 'number', 'function'],
                        a = cf_sortParams(v, t);

                    f = (is_number(a[0])) ? a[0] : 0;
                    l = (is_number(a[1])) ? a[1] : itms.total;
                    fn = a[2];

                    f += itms.first;
                    l += itms.first;

                    if (items.total > 0) {
                        while (f > itms.total) {
                            f -= itms.total;
                        }
                        while (l > itms.total) {
                            l -= itms.total;
                        }
                        while (f < 0) {
                            f += itms.total;
                        }
                        while (l < 0) {
                            l += itms.total;
                        }
                    }
                    var $iA = $cfs.children(),
                        $i;

                    if (l > f) {
                        $i = $iA.slice(f, l);
                    } else {
                        $i = $($iA.slice(f, itms.total).get().concat($iA.slice(0, l).get()));
                    }

                    if (is_function(fn)) {
                        fn.call($tt0, $i);
                    }
                    return $i;
                });


                //  isPaused, isStopped and isScrolling events
                $cfs.bind(cf_e('isPaused', conf) + ' ' + cf_e('isStopped', conf) + ' ' + cf_e('isScrolling', conf), function(e, fn) {
                    e.stopPropagation();
                    var eType = e.type.slice(conf.events.prefix.length),
                        value = crsl[eType];
                    if (is_function(fn)) {
                        fn.call($tt0, value);
                    }
                    return value;
                });


                //  configuration event
                $cfs.bind(cf_e('configuration', conf), function(e, a, b, c) {
                    e.stopPropagation();
                    var reInit = false;

                    //  return entire configuration-object
                    if (is_function(a)) {
                        a.call($tt0, opts);
                    }
                    //  set multiple options via object
                    else if (is_object(a)) {
                        opts_orig = $.extend(true, {}, opts_orig, a);
                        if (b !== false) reInit = true;
                        else opts = $.extend(true, {}, opts, a);

                    } else if (!is_undefined(a)) {

                        //  callback function for specific option
                        if (is_function(b)) {
                            var val = eval('opts.' + a);
                            if (is_undefined(val)) {
                                val = '';
                            }
                            b.call($tt0, val);
                        }
                        //  set individual option
                        else if (!is_undefined(b)) {
                            if (typeof c !== 'boolean') c = true;
                            eval('opts_orig.' + a + ' = b');
                            if (c !== false) reInit = true;
                            else eval('opts.' + a + ' = b');
                        }
                        //  return value for specific option
                        else {
                            return eval('opts.' + a);
                        }
                    }
                    if (reInit) {
                        sz_resetMargin($cfs.children(), opts);
                        FN._cfs_init(opts_orig);
                        FN._cfs_bind_buttons();
                        var sz = sz_setSizes($cfs, opts);
                        $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
                    }
                    return opts;
                });


                //  linkAnchors event
                $cfs.bind(cf_e('linkAnchors', conf), function(e, $con, sel) {
                    e.stopPropagation();

                    if (is_undefined($con)) {
                        $con = $('body');
                    } else if (is_string($con)) {
                        $con = $($con);
                    }
                    if (!is_jquery($con) || $con.length == 0) {
                        return debug(conf, 'Not a valid object.');
                    }
                    if (!is_string(sel)) {
                        sel = 'a.caroufredsel';
                    }

                    $con.find(sel).each(function() {
                        var h = this.hash || '';
                        if (h.length > 0 && $cfs.children().index($(h)) != -1) {
                            $(this).unbind('click').click(function(e) {
                                e.preventDefault();
                                $cfs.trigger(cf_e('slideTo', conf), h);
                            });
                        }
                    });
                    return true;
                });


                //  updatePageStatus event
                $cfs.bind(cf_e('updatePageStatus', conf), function(e, build, sizes) {
                    e.stopPropagation();
                    if (!opts.pagination.container) {
                        return;
                    }

                    var ipp = opts.pagination.items || opts.items.visible,
                        pgs = Math.ceil(itms.total / ipp);

                    if (build) {
                        if (opts.pagination.anchorBuilder) {
                            opts.pagination.container.children().remove();
                            opts.pagination.container.each(function() {
                                for (var a = 0; a < pgs; a++) {
                                    var i = $cfs.children().eq(gn_getItemIndex(a * ipp, 0, true, itms, $cfs));
                                    $(this).append(opts.pagination.anchorBuilder.call(i[0], a + 1));
                                }
                            });
                        }
                        opts.pagination.container.each(function() {
                            $(this).children().unbind(opts.pagination.event).each(function(a) {
                                $(this).bind(opts.pagination.event, function(e) {
                                    e.preventDefault();
                                    $cfs.trigger(cf_e('slideTo', conf), [a * ipp, -opts.pagination.deviation, true, opts.pagination]);
                                });
                            });
                        });
                    }

                    var selected = $cfs.triggerHandler(cf_e('currentPage', conf)) + opts.pagination.deviation;
                    if (selected >= pgs) {
                        selected = 0;
                    }
                    if (selected < 0) {
                        selected = pgs - 1;
                    }
                    opts.pagination.container.each(function() {
                        $(this).children().removeClass(cf_c('selected', conf)).eq(selected).addClass(cf_c('selected', conf));
                    });
                    return true;
                });


                //  updateSizes event
                $cfs.bind(cf_e('updateSizes', conf), function(e) {
                    var vI = opts.items.visible,
                        a_itm = $cfs.children(),
                        avail_primary = ms_getParentSize($wrp, opts, 'width');

                    itms.total = a_itm.length;

                    if (crsl.primarySizePercentage) {
                        opts.maxDimension = avail_primary;
                        opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
                    } else {
                        opts.maxDimension = ms_getMaxDimension(opts, avail_primary);
                    }

                    if (opts.responsive) {
                        opts.items.width = opts.items.sizesConf.width;
                        opts.items.height = opts.items.sizesConf.height;
                        opts = in_getResponsiveValues(opts, a_itm, avail_primary);
                        vI = opts.items.visible;
                        sz_setResponsiveSizes(opts, a_itm);
                    } else if (opts.items.visibleConf.variable) {
                        vI = gn_getVisibleItemsNext(a_itm, opts, 0);
                    } else if (opts.items.filter != '*') {
                        vI = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
                    }

                    if (!opts.circular && itms.first != 0 && vI > itms.first) {
                        if (opts.items.visibleConf.variable) {
                            var nI = gn_getVisibleItemsPrev(a_itm, opts, itms.first) - itms.first;
                        } else if (opts.items.filter != '*') {
                            var nI = gn_getVisibleItemsPrevFilter(a_itm, opts, itms.first) - itms.first;
                        } else {
                            var nI = opts.items.visible - itms.first;
                        }
                        debug(conf, 'Preventing non-circular: sliding ' + nI + ' items backward.');
                        $cfs.trigger(cf_e('prev', conf), nI);
                    }

                    opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                    opts.items.visibleConf.old = opts.items.visible;
                    opts = in_getAlignPadding(opts, a_itm);

                    var sz = sz_setSizes($cfs, opts);
                    $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
                    nv_showNavi(opts, itms.total, conf);
                    nv_enableNavi(opts, itms.first, conf);

                    return sz;
                });


                //  destroy event
                $cfs.bind(cf_e('destroy', conf), function(e, orgOrder) {
                    e.stopPropagation();
                    tmrs = sc_clearTimers(tmrs);

                    $cfs.data('_cfs_isCarousel', false);
                    $cfs.trigger(cf_e('finish', conf));
                    if (orgOrder) {
                        $cfs.trigger(cf_e('jumpToStart', conf));
                    }
                    sz_restoreOrigCss($cfs.children());
                    sz_restoreOrigCss($cfs);
                    FN._cfs_unbind_events();
                    FN._cfs_unbind_buttons();
                    if (conf.wrapper == 'parent') {
                        sz_restoreOrigCss($wrp);
                    } else {
                        $wrp.replaceWith($cfs);
                    }

                    return true;
                });


                //  debug event
                $cfs.bind(cf_e('debug', conf), function(e) {
                    debug(conf, 'Carousel width: ' + opts.width);
                    debug(conf, 'Carousel height: ' + opts.height);
                    debug(conf, 'Item widths: ' + opts.items.width);
                    debug(conf, 'Item heights: ' + opts.items.height);
                    debug(conf, 'Number of items visible: ' + opts.items.visible);
                    if (opts.auto.play) {
                        debug(conf, 'Number of items scrolled automatically: ' + opts.auto.items);
                    }
                    if (opts.prev.button) {
                        debug(conf, 'Number of items scrolled backward: ' + opts.prev.items);
                    }
                    if (opts.next.button) {
                        debug(conf, 'Number of items scrolled forward: ' + opts.next.items);
                    }
                    return conf.debug;
                });


                //  triggerEvent, making prefixed and namespaced events accessible from outside
                $cfs.bind('_cfs_triggerEvent', function(e, n, o) {
                    e.stopPropagation();
                    return $cfs.triggerHandler(cf_e(n, conf), o);
                });
            }; //  /bind_events


            FN._cfs_unbind_events = function() {
                $cfs.unbind(cf_e('', conf));
                $cfs.unbind(cf_e('', conf, false));
                $cfs.unbind('_cfs_triggerEvent');
            }; //  /unbind_events


            FN._cfs_bind_buttons = function() {
                FN._cfs_unbind_buttons();
                nv_showNavi(opts, itms.total, conf);
                nv_enableNavi(opts, itms.first, conf);

                if (opts.auto.pauseOnHover) {
                    var pC = bt_pauseOnHoverConfig(opts.auto.pauseOnHover);
                    $wrp.bind(cf_e('mouseenter', conf, false), function() {
                        $cfs.trigger(cf_e('pause', conf), pC);
                    })
                        .bind(cf_e('mouseleave', conf, false), function() {
                            $cfs.trigger(cf_e('resume', conf));
                        });
                }

                //  play button
                if (opts.auto.button) {
                    opts.auto.button.bind(cf_e(opts.auto.event, conf, false), function(e) {
                        e.preventDefault();
                        var ev = false,
                            pC = null;

                        if (crsl.isPaused) {
                            ev = 'play';
                        } else if (opts.auto.pauseOnEvent) {
                            ev = 'pause';
                            pC = bt_pauseOnHoverConfig(opts.auto.pauseOnEvent);
                        }
                        if (ev) {
                            $cfs.trigger(cf_e(ev, conf), pC);
                        }
                    });
                }

                //  prev button
                if (opts.prev.button) {
                    opts.prev.button.bind(cf_e(opts.prev.event, conf, false), function(e) {
                        e.preventDefault();
                        $cfs.trigger(cf_e('prev', conf));
                    });
                    if (opts.prev.pauseOnHover) {
                        var pC = bt_pauseOnHoverConfig(opts.prev.pauseOnHover);
                        opts.prev.button.bind(cf_e('mouseenter', conf, false), function() {
                            $cfs.trigger(cf_e('pause', conf), pC);
                        })
                            .bind(cf_e('mouseleave', conf, false), function() {
                                $cfs.trigger(cf_e('resume', conf));
                            });
                    }
                }

                //  next butotn
                if (opts.next.button) {
                    opts.next.button.bind(cf_e(opts.next.event, conf, false), function(e) {
                        e.preventDefault();
                        $cfs.trigger(cf_e('next', conf));
                    });
                    if (opts.next.pauseOnHover) {
                        var pC = bt_pauseOnHoverConfig(opts.next.pauseOnHover);
                        opts.next.button.bind(cf_e('mouseenter', conf, false), function() {
                            $cfs.trigger(cf_e('pause', conf), pC);
                        })
                            .bind(cf_e('mouseleave', conf, false), function() {
                                $cfs.trigger(cf_e('resume', conf));
                            });
                    }
                }

                //  pagination
                if (opts.pagination.container) {
                    if (opts.pagination.pauseOnHover) {
                        var pC = bt_pauseOnHoverConfig(opts.pagination.pauseOnHover);
                        opts.pagination.container.bind(cf_e('mouseenter', conf, false), function() {
                            $cfs.trigger(cf_e('pause', conf), pC);
                        })
                            .bind(cf_e('mouseleave', conf, false), function() {
                                $cfs.trigger(cf_e('resume', conf));
                            });
                    }
                }

                //  prev/next keys
                if (opts.prev.key || opts.next.key) {
                    $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
                        var k = e.keyCode;
                        if (k == opts.next.key) {
                            e.preventDefault();
                            $cfs.trigger(cf_e('next', conf));
                        }
                        if (k == opts.prev.key) {
                            e.preventDefault();
                            $cfs.trigger(cf_e('prev', conf));
                        }
                    });
                }

                //  pagination keys
                if (opts.pagination.keys) {
                    $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
                        var k = e.keyCode;
                        if (k >= 49 && k < 58) {
                            k = (k - 49) * opts.items.visible;
                            if (k <= itms.total) {
                                e.preventDefault();
                                $cfs.trigger(cf_e('slideTo', conf), [k, 0, true, opts.pagination]);
                            }
                        }
                    });
                }

                //  swipe
                if ($.fn.swipe) {
                    var isTouch = 'ontouchstart' in window;
                    if ((isTouch && opts.swipe.onTouch) || (!isTouch && opts.swipe.onMouse)) {
                        var scP = $.extend(true, {}, opts.prev, opts.swipe),
                            scN = $.extend(true, {}, opts.next, opts.swipe),
                            swP = function() {
                                $cfs.trigger(cf_e('prev', conf), [scP])
                            },
                            swN = function() {
                                $cfs.trigger(cf_e('next', conf), [scN])
                            };

                        switch (opts.direction) {
                            case 'up':
                            case 'down':
                                opts.swipe.options.swipeUp = swN;
                                opts.swipe.options.swipeDown = swP;
                                break;
                            default:
                                opts.swipe.options.swipeLeft = swN;
                                opts.swipe.options.swipeRight = swP;
                        }
                        if (crsl.swipe) {
                            $cfs.swipe('destroy');
                        }
                        $wrp.swipe(opts.swipe.options);
                        $wrp.css('cursor', 'move');
                        crsl.swipe = true;
                    }
                }

                //  mousewheel
                if ($.fn.mousewheel) {

                    if (opts.mousewheel) {
                        var mcP = $.extend(true, {}, opts.prev, opts.mousewheel),
                            mcN = $.extend(true, {}, opts.next, opts.mousewheel);

                        if (crsl.mousewheel) {
                            $wrp.unbind(cf_e('mousewheel', conf, false));
                        }
                        $wrp.bind(cf_e('mousewheel', conf, false), function(e, delta) {
                            e.preventDefault();
                            if (delta > 0) {
                                $cfs.trigger(cf_e('prev', conf), [mcP]);
                            } else {
                                $cfs.trigger(cf_e('next', conf), [mcN]);
                            }
                        });
                        crsl.mousewheel = true;
                    }
                }

                if (opts.auto.play) {
                    $cfs.trigger(cf_e('play', conf), opts.auto.delay);
                }

                if (crsl.upDateOnWindowResize) {
                    var resizeFn = function(e) {
                        $cfs.trigger(cf_e('finish', conf));
                        if (opts.auto.pauseOnResize && !crsl.isPaused) {
                            $cfs.trigger(cf_e('play', conf));
                        }
                        sz_resetMargin($cfs.children(), opts);
                        $cfs.trigger(cf_e('updateSizes', conf));
                    };

                    var $w = $(window),
                        onResize = null;

                    if ($.debounce && conf.onWindowResize == 'debounce') {
                        onResize = $.debounce(200, resizeFn);
                    } else if ($.throttle && conf.onWindowResize == 'throttle') {
                        onResize = $.throttle(300, resizeFn);
                    } else {
                        var _windowWidth = 0,
                            _windowHeight = 0;

                        onResize = function() {
                            var nw = $w.width(),
                                nh = $w.height();

                            if (nw != _windowWidth || nh != _windowHeight) {
                                resizeFn();
                                _windowWidth = nw;
                                _windowHeight = nh;
                            }
                        };
                    }
                    $w.bind(cf_e('resize', conf, false, true, true), onResize);
                }
            }; //  /bind_buttons


            FN._cfs_unbind_buttons = function() {
                var ns1 = cf_e('', conf),
                    ns2 = cf_e('', conf, false);
                ns3 = cf_e('', conf, false, true, true);

                $(document).unbind(ns3);
                $(window).unbind(ns3);
                $wrp.unbind(ns2);

                if (opts.auto.button) {
                    opts.auto.button.unbind(ns2);
                }
                if (opts.prev.button) {
                    opts.prev.button.unbind(ns2);
                }
                if (opts.next.button) {
                    opts.next.button.unbind(ns2);
                }
                if (opts.pagination.container) {
                    opts.pagination.container.unbind(ns2);
                    if (opts.pagination.anchorBuilder) {
                        opts.pagination.container.children().remove();
                    }
                }
                if (crsl.swipe) {
                    $cfs.swipe('destroy');
                    $wrp.css('cursor', 'default');
                    crsl.swipe = false;
                }
                if (crsl.mousewheel) {
                    crsl.mousewheel = false;
                }

                nv_showNavi(opts, 'hide', conf);
                nv_enableNavi(opts, 'removeClass', conf);

            }; //  /unbind_buttons



            //  START

            if (is_boolean(configs)) {
                configs = {
                    'debug': configs
                };
            }

            //  set vars
            var crsl = {
                    'direction': 'next',
                    'isPaused': true,
                    'isScrolling': false,
                    'isStopped': false,
                    'mousewheel': false,
                    'swipe': false
                },
                itms = {
                    'total': $cfs.children().length,
                    'first': 0
                },
                tmrs = {
                    'auto': null,
                    'progress': null,
                    'startTime': getTime(),
                    'timePassed': 0
                },
                scrl = {
                    'isStopped': false,
                    'duration': 0,
                    'startTime': 0,
                    'easing': '',
                    'anims': []
                },
                clbk = {
                    'onBefore': [],
                    'onAfter': []
                },
                queu = [],
                conf = $.extend(true, {}, $.fn.carouFredSel.configs, configs),
                opts = {},
                opts_orig = $.extend(true, {}, options),
                $wrp = (conf.wrapper == 'parent') ? $cfs.parent() : $cfs.wrap('<' + conf.wrapper.element + ' class="' + conf.wrapper.classname + '" />').parent();


            conf.selector = $cfs.selector;
            conf.serialNumber = $.fn.carouFredSel.serialNumber++;

            conf.transition = (conf.transition && $.fn.transition) ? 'transition' : 'animate';

            //  create carousel
            FN._cfs_init(opts_orig, true, starting_position);
            FN._cfs_build();
            FN._cfs_bind_events();
            FN._cfs_bind_buttons();

            //  find item to start
            if (is_array(opts.items.start)) {
                var start_arr = opts.items.start;
            } else {
                var start_arr = [];
                if (opts.items.start != 0) {
                    start_arr.push(opts.items.start);
                }
            }
            if (opts.cookie) {
                start_arr.unshift(parseInt(cf_getCookie(opts.cookie), 10));
            }

            if (start_arr.length > 0) {
                for (var a = 0, l = start_arr.length; a < l; a++) {
                    var s = start_arr[a];
                    if (s == 0) {
                        continue;
                    }
                    if (s === true) {
                        s = window.location.hash;
                        if (s.length < 1) {
                            continue;
                        }
                    } else if (s === 'random') {
                        s = Math.floor(Math.random() * itms.total);
                    }
                    if ($cfs.triggerHandler(cf_e('slideTo', conf), [s, 0, true, {
                        fx: 'none'
                    }])) {
                        break;
                    }
                }
            }
            var siz = sz_setSizes($cfs, opts),
                itm = gi_getCurrentItems($cfs.children(), opts);

            if (opts.onCreate) {
                opts.onCreate.call($tt0, {
                    'width': siz.width,
                    'height': siz.height,
                    'items': itm
                });
            }

            $cfs.trigger(cf_e('updatePageStatus', conf), [true, siz]);
            $cfs.trigger(cf_e('linkAnchors', conf));

            if (conf.debug) {
                $cfs.trigger(cf_e('debug', conf));
            }

            return $cfs;
        };



        //  GLOBAL PUBLIC

        $.fn.carouFredSel.serialNumber = 1;
        $.fn.carouFredSel.defaults = {
            'synchronise': false,
            'infinite': true,
            'circular': true,
            'responsive': false,
            'direction': 'left',
            'items': {
                'start': 0
            },
            'scroll': {
                'easing': 'swing',
                'duration': 500,
                'pauseOnHover': false,
                'event': 'click',
                'queue': false
            }
        };
        $.fn.carouFredSel.configs = {
            'debug': false,
            'transition': false,
            'onWindowResize': 'throttle',
            'events': {
                'prefix': '',
                'namespace': 'cfs'
            },
            'wrapper': {
                'element': 'div',
                'classname': 'caroufredsel_wrapper'
            },
            'classnames': {}
        };
        $.fn.carouFredSel.pageAnchorBuilder = function(nr) {
            return '<a href="#"><span>' + nr + '</span></a>';
        };
        $.fn.carouFredSel.progressbarUpdater = function(perc) {
            $(this).css('width', perc + '%');
        };

        $.fn.carouFredSel.cookie = {
            get: function(n) {
                n += '=';
                var ca = document.cookie.split(';');
                for (var a = 0, l = ca.length; a < l; a++) {
                    var c = ca[a];
                    while (c.charAt(0) == ' ') {
                        c = c.slice(1);
                    }
                    if (c.indexOf(n) == 0) {
                        return c.slice(n.length);
                    }
                }
                return 0;
            },
            set: function(n, v, d) {
                var e = "";
                if (d) {
                    var date = new Date();
                    date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));
                    e = "; expires=" + date.toGMTString();
                }
                document.cookie = n + '=' + v + e + '; path=/';
            },
            remove: function(n) {
                $.fn.carouFredSel.cookie.set(n, "", -1);
            }
        };


        //  GLOBAL PRIVATE

        //  scrolling functions
        function sc_setScroll(d, e, c) {
            if (c.transition == 'transition') {
                if (e == 'swing') {
                    e = 'ease';
                }
            }
            return {
                anims: [],
                duration: d,
                orgDuration: d,
                easing: e,
                startTime: getTime()
            };
        }

        function sc_startScroll(s, c) {
            for (var a = 0, l = s.anims.length; a < l; a++) {
                var b = s.anims[a];
                if (!b) {
                    continue;
                }
                b[0][c.transition](b[1], s.duration, s.easing, b[2]);
            }
        }

        function sc_stopScroll(s, finish) {
            if (!is_boolean(finish)) {
                finish = true;
            }
            if (is_object(s.pre)) {
                sc_stopScroll(s.pre, finish);
            }
            for (var a = 0, l = s.anims.length; a < l; a++) {
                var b = s.anims[a];
                b[0].stop(true);
                if (finish) {
                    b[0].css(b[1]);
                    if (is_function(b[2])) {
                        b[2]();
                    }
                }
            }
            if (is_object(s.post)) {
                sc_stopScroll(s.post, finish);
            }
        }

        function sc_afterScroll($c, $c2, o) {
            if ($c2) {
                $c2.remove();
            }

            switch (o.fx) {
                case 'fade':
                case 'crossfade':
                case 'cover-fade':
                case 'uncover-fade':
                    $c.css('filter', '');
                    $c.css('opacity', 1);
                    break;
            }
        }

        function sc_fireCallbacks($t, o, b, a, c) {
            if (o[b]) {
                o[b].call($t, a);
            }
            if (c[b].length) {
                for (var i = 0, l = c[b].length; i < l; i++) {
                    c[b][i].call($t, a);
                }
            }
            return [];
        }

        function sc_fireQueue($c, q, c) {

            if (q.length) {
                $c.trigger(cf_e(q[0][0], c), q[0][1]);
                q.shift();
            }
            return q;
        }

        function sc_hideHiddenItems(hiddenitems) {
            hiddenitems.each(function() {
                var hi = $(this);
                hi.data('_cfs_isHidden', hi.is(':hidden')).hide();
            });
        }

        function sc_showHiddenItems(hiddenitems) {
            if (hiddenitems) {
                hiddenitems.each(function() {
                    var hi = $(this);
                    if (!hi.data('_cfs_isHidden')) {
                        hi.show();
                    }
                });
            }
        }

        function sc_clearTimers(t) {
            if (t.auto) {
                clearTimeout(t.auto);
            }
            if (t.progress) {
                clearInterval(t.progress);
            }
            return t;
        }

        function sc_mapCallbackArguments(i_old, i_skp, i_new, s_itm, s_dir, s_dur, w_siz) {
            return {
                'width': w_siz.width,
                'height': w_siz.height,
                'items': {
                    'old': i_old,
                    'skipped': i_skp,
                    'visible': i_new
                },
                'scroll': {
                    'items': s_itm,
                    'direction': s_dir,
                    'duration': s_dur
                }
            };
        }

        function sc_getDuration(sO, o, nI, siz) {
            var dur = sO.duration;
            if (sO.fx == 'none') {
                return 0;
            }
            if (dur == 'auto') {
                dur = o.scroll.duration / o.scroll.items * nI;
            } else if (dur < 10) {
                dur = siz / dur;
            }
            if (dur < 1) {
                return 0;
            }
            if (sO.fx == 'fade') {
                dur = dur / 2;
            }
            return Math.round(dur);
        }

        //  navigation functions
        function nv_showNavi(o, t, c) {
            var minimum = (is_number(o.items.minimum)) ? o.items.minimum : o.items.visible + 1;
            if (t == 'show' || t == 'hide') {
                var f = t;
            } else if (minimum > t) {
                debug(c, 'Not enough items (' + t + ' total, ' + minimum + ' needed): Hiding navigation.');
                var f = 'hide';
            } else {
                var f = 'show';
            }
            var s = (f == 'show') ? 'removeClass' : 'addClass',
                h = cf_c('hidden', c);

            if (o.auto.button) {
                o.auto.button[f]()[s](h);
            }
            if (o.prev.button) {
                o.prev.button[f]()[s](h);
            }
            if (o.next.button) {
                o.next.button[f]()[s](h);
            }
            if (o.pagination.container) {
                o.pagination.container[f]()[s](h);
            }
        }

        function nv_enableNavi(o, f, c) {
            if (o.circular || o.infinite) return;
            var fx = (f == 'removeClass' || f == 'addClass') ? f : false,
                di = cf_c('disabled', c);

            if (o.auto.button && fx) {
                o.auto.button[fx](di);
            }
            if (o.prev.button) {
                var fn = fx || (f == 0) ? 'addClass' : 'removeClass';
                o.prev.button[fn](di);
            }
            if (o.next.button) {
                var fn = fx || (f == o.items.visible) ? 'addClass' : 'removeClass';
                o.next.button[fn](di);
            }
        }

        //  get object functions
        function go_getObject($tt, obj) {
            if (is_function(obj)) {
                obj = obj.call($tt);
            } else if (is_undefined(obj)) {
                obj = {};
            }
            return obj;
        }

        function go_getItemsObject($tt, obj) {
            obj = go_getObject($tt, obj);
            if (is_number(obj)) {
                obj = {
                    'visible': obj
                };
            } else if (obj == 'variable') {
                obj = {
                    'visible': obj,
                    'width': obj,
                    'height': obj
                };
            } else if (!is_object(obj)) {
                obj = {};
            }
            return obj;
        }

        function go_getScrollObject($tt, obj) {
            obj = go_getObject($tt, obj);
            if (is_number(obj)) {
                if (obj <= 50) {
                    obj = {
                        'items': obj
                    };
                } else {
                    obj = {
                        'duration': obj
                    };
                }
            } else if (is_string(obj)) {
                obj = {
                    'easing': obj
                };
            } else if (!is_object(obj)) {
                obj = {};
            }
            return obj;
        }

        function go_getNaviObject($tt, obj) {
            obj = go_getObject($tt, obj);
            if (is_string(obj)) {
                var temp = cf_getKeyCode(obj);
                if (temp == -1) {
                    obj = $(obj);
                } else {
                    obj = temp;
                }
            }
            return obj;
        }

        function go_getAutoObject($tt, obj) {
            obj = go_getNaviObject($tt, obj);
            if (is_jquery(obj)) {
                obj = {
                    'button': obj
                };
            } else if (is_boolean(obj)) {
                obj = {
                    'play': obj
                };
            } else if (is_number(obj)) {
                obj = {
                    'timeoutDuration': obj
                };
            }
            if (obj.progress) {
                if (is_string(obj.progress) || is_jquery(obj.progress)) {
                    obj.progress = {
                        'bar': obj.progress
                    };
                }
            }
            return obj;
        }

        function go_complementAutoObject($tt, obj) {
            if (is_function(obj.button)) {
                obj.button = obj.button.call($tt);
            }
            if (is_string(obj.button)) {
                obj.button = $(obj.button);
            }
            if (!is_boolean(obj.play)) {
                obj.play = true;
            }
            if (!is_number(obj.delay)) {
                obj.delay = 0;
            }
            if (is_undefined(obj.pauseOnEvent)) {
                obj.pauseOnEvent = true;
            }
            if (!is_boolean(obj.pauseOnResize)) {
                obj.pauseOnResize = true;
            }
            if (!is_number(obj.timeoutDuration)) {
                obj.timeoutDuration = (obj.duration < 10) ? 2500 : obj.duration * 5;
            }
            if (obj.progress) {
                if (is_function(obj.progress.bar)) {
                    obj.progress.bar = obj.progress.bar.call($tt);
                }
                if (is_string(obj.progress.bar)) {
                    obj.progress.bar = $(obj.progress.bar);
                }
                if (obj.progress.bar) {
                    if (!is_function(obj.progress.updater)) {
                        obj.progress.updater = $.fn.carouFredSel.progressbarUpdater;
                    }
                    if (!is_number(obj.progress.interval)) {
                        obj.progress.interval = 50;
                    }
                } else {
                    obj.progress = false;
                }
            }
            return obj;
        }

        function go_getPrevNextObject($tt, obj) {
            obj = go_getNaviObject($tt, obj);
            if (is_jquery(obj)) {
                obj = {
                    'button': obj
                };
            } else if (is_number(obj)) {
                obj = {
                    'key': obj
                };
            }
            return obj;
        }

        function go_complementPrevNextObject($tt, obj) {
            if (is_function(obj.button)) {
                obj.button = obj.button.call($tt);
            }
            if (is_string(obj.button)) {
                obj.button = $(obj.button);
            }
            if (is_string(obj.key)) {
                obj.key = cf_getKeyCode(obj.key);
            }
            return obj;
        }

        function go_getPaginationObject($tt, obj) {
            obj = go_getNaviObject($tt, obj);
            if (is_jquery(obj)) {
                obj = {
                    'container': obj
                };
            } else if (is_boolean(obj)) {
                obj = {
                    'keys': obj
                };
            }
            return obj;
        }

        function go_complementPaginationObject($tt, obj) {
            if (is_function(obj.container)) {
                obj.container = obj.container.call($tt);
            }
            if (is_string(obj.container)) {
                obj.container = $(obj.container);
            }
            if (!is_number(obj.items)) {
                obj.items = false;
            }
            if (!is_boolean(obj.keys)) {
                obj.keys = false;
            }
            if (!is_function(obj.anchorBuilder) && !is_false(obj.anchorBuilder)) {
                obj.anchorBuilder = $.fn.carouFredSel.pageAnchorBuilder;
            }
            if (!is_number(obj.deviation)) {
                obj.deviation = 0;
            }
            return obj;
        }

        function go_getSwipeObject($tt, obj) {
            if (is_function(obj)) {
                obj = obj.call($tt);
            }
            if (is_undefined(obj)) {
                obj = {
                    'onTouch': false
                };
            }
            if (is_true(obj)) {
                obj = {
                    'onTouch': obj
                };
            } else if (is_number(obj)) {
                obj = {
                    'items': obj
                };
            }
            return obj;
        }

        function go_complementSwipeObject($tt, obj) {
            if (!is_boolean(obj.onTouch)) {
                obj.onTouch = true;
            }
            if (!is_boolean(obj.onMouse)) {
                obj.onMouse = false;
            }
            if (!is_object(obj.options)) {
                obj.options = {};
            }
            if (!is_boolean(obj.options.triggerOnTouchEnd)) {
                obj.options.triggerOnTouchEnd = false;
            }
            return obj;
        }

        function go_getMousewheelObject($tt, obj) {
            if (is_function(obj)) {
                obj = obj.call($tt);
            }
            if (is_true(obj)) {
                obj = {};
            } else if (is_number(obj)) {
                obj = {
                    'items': obj
                };
            } else if (is_undefined(obj)) {
                obj = false;
            }
            return obj;
        }

        function go_complementMousewheelObject($tt, obj) {
            return obj;
        }

        //  get number functions
        function gn_getItemIndex(num, dev, org, items, $cfs) {
            if (is_string(num)) {
                num = $(num, $cfs);
            }

            if (is_object(num)) {
                num = $(num, $cfs);
            }
            if (is_jquery(num)) {
                num = $cfs.children().index(num);
                if (!is_boolean(org)) {
                    org = false;
                }
            } else {
                if (!is_boolean(org)) {
                    org = true;
                }
            }
            if (!is_number(num)) {
                num = 0;
            }
            if (!is_number(dev)) {
                dev = 0;
            }

            if (org) {
                num += items.first;
            }
            num += dev;
            if (items.total > 0) {
                while (num >= items.total) {
                    num -= items.total;
                }
                while (num < 0) {
                    num += items.total;
                }
            }
            return num;
        }

        //  items prev
        function gn_getVisibleItemsPrev(i, o, s) {
            var t = 0,
                x = 0;

            for (var a = s; a >= 0; a--) {
                var j = i.eq(a);
                t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
                if (t > o.maxDimension) {
                    return x;
                }
                if (a == 0) {
                    a = i.length;
                }
                x++;
            }
        }

        function gn_getVisibleItemsPrevFilter(i, o, s) {
            return gn_getItemsPrevFilter(i, o.items.filter, o.items.visibleConf.org, s);
        }

        function gn_getScrollItemsPrevFilter(i, o, s, m) {
            return gn_getItemsPrevFilter(i, o.items.filter, m, s);
        }

        function gn_getItemsPrevFilter(i, f, m, s) {
            var t = 0,
                x = 0;

            for (var a = s, l = i.length; a >= 0; a--) {
                x++;
                if (x == l) {
                    return x;
                }

                var j = i.eq(a);
                if (j.is(f)) {
                    t++;
                    if (t == m) {
                        return x;
                    }
                }
                if (a == 0) {
                    a = l;
                }
            }
        }

        function gn_getVisibleOrg($c, o) {
            return o.items.visibleConf.org || $c.children().slice(0, o.items.visible).filter(o.items.filter).length;
        }

        //  items next
        function gn_getVisibleItemsNext(i, o, s) {
            var t = 0,
                x = 0;

            for (var a = s, l = i.length - 1; a <= l; a++) {
                var j = i.eq(a);

                t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
                if (t > o.maxDimension) {
                    return x;
                }

                x++;
                if (x == l + 1) {
                    return x;
                }
                if (a == l) {
                    a = -1;
                }
            }
        }

        function gn_getVisibleItemsNextTestCircular(i, o, s, l) {
            var v = gn_getVisibleItemsNext(i, o, s);
            if (!o.circular) {
                if (s + v > l) {
                    v = l - s;
                }
            }
            return v;
        }

        function gn_getVisibleItemsNextFilter(i, o, s) {
            return gn_getItemsNextFilter(i, o.items.filter, o.items.visibleConf.org, s, o.circular);
        }

        function gn_getScrollItemsNextFilter(i, o, s, m) {
            return gn_getItemsNextFilter(i, o.items.filter, m + 1, s, o.circular) - 1;
        }

        function gn_getItemsNextFilter(i, f, m, s, c) {
            var t = 0,
                x = 0;

            for (var a = s, l = i.length - 1; a <= l; a++) {
                x++;
                if (x >= l) {
                    return x;
                }

                var j = i.eq(a);
                if (j.is(f)) {
                    t++;
                    if (t == m) {
                        return x;
                    }
                }
                if (a == l) {
                    a = -1;
                }
            }
        }

        //  get items functions
        function gi_getCurrentItems(i, o) {
            return i.slice(0, o.items.visible);
        }

        function gi_getOldItemsPrev(i, o, n) {
            return i.slice(n, o.items.visibleConf.old + n);
        }

        function gi_getNewItemsPrev(i, o) {
            return i.slice(0, o.items.visible);
        }

        function gi_getOldItemsNext(i, o) {
            return i.slice(0, o.items.visibleConf.old);
        }

        function gi_getNewItemsNext(i, o, n) {
            return i.slice(n, o.items.visible + n);
        }

        //  sizes functions
        function sz_storeMargin(i, o, d) {
            if (o.usePadding) {
                if (!is_string(d)) {
                    d = '_cfs_origCssMargin';
                }
                i.each(function() {
                    var j = $(this),
                        m = parseInt(j.css(o.d['marginRight']), 10);
                    if (!is_number(m)) {
                        m = 0;
                    }
                    j.data(d, m);
                });
            }
        }

        function sz_resetMargin(i, o, m) {
            if (o.usePadding) {
                var x = (is_boolean(m)) ? m : false;
                if (!is_number(m)) {
                    m = 0;
                }
                sz_storeMargin(i, o, '_cfs_tempCssMargin');
                i.each(function() {
                    var j = $(this);
                    j.css(o.d['marginRight'], ((x) ? j.data('_cfs_tempCssMargin') : m + j.data('_cfs_origCssMargin')));
                });
            }
        }

        function sz_storeOrigCss(i) {
            i.each(function() {
                var j = $(this);
                j.data('_cfs_origCss', j.attr('style') || '');
            });
        }

        function sz_restoreOrigCss(i) {
            i.each(function() {
                var j = $(this);
                j.attr('style', j.data('_cfs_origCss') || '');
            });
        }

        function sz_setResponsiveSizes(o, all) {
            var visb = o.items.visible,
                newS = o.items[o.d['width']],
                seco = o[o.d['height']],
                secp = is_percentage(seco);

            all.each(function() {
                var $t = $(this),
                    nw = newS - ms_getPaddingBorderMargin($t, o, 'Width');

                $t[o.d['width']](nw);
                if (secp) {
                    $t[o.d['height']](ms_getPercentage(nw, seco));
                }
            });
        }

        function sz_setSizes($c, o) {
            var $w = $c.parent(),
                $i = $c.children(),
                $v = gi_getCurrentItems($i, o),
                sz = cf_mapWrapperSizes(ms_getSizes($v, o, true), o, false);

            $w.css(sz);

            if (o.usePadding) {
                var p = o.padding,
                    r = p[o.d[1]];

                if (o.align && r < 0) {
                    r = 0;
                }
                var $l = $v.last();
                $l.css(o.d['marginRight'], $l.data('_cfs_origCssMargin') + r);
                $c.css(o.d['top'], p[o.d[0]]);
                $c.css(o.d['left'], p[o.d[3]]);
            }

            $c.css(o.d['width'], sz[o.d['width']] + (ms_getTotalSize($i, o, 'width') * 2));
            $c.css(o.d['height'], ms_getLargestSize($i, o, 'height'));
            return sz;
        }

        //  measuring functions
        function ms_getSizes(i, o, wrapper) {
            return [ms_getTotalSize(i, o, 'width', wrapper), ms_getLargestSize(i, o, 'height', wrapper)];
        }

        function ms_getLargestSize(i, o, dim, wrapper) {
            if (!is_boolean(wrapper)) {
                wrapper = false;
            }
            if (is_number(o[o.d[dim]]) && wrapper) {
                return o[o.d[dim]];
            }
            if (is_number(o.items[o.d[dim]])) {
                return o.items[o.d[dim]];
            }
            dim = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight';
            return ms_getTrueLargestSize(i, o, dim);
        }

        function ms_getTrueLargestSize(i, o, dim) {
            var s = 0;

            for (var a = 0, l = i.length; a < l; a++) {
                var j = i.eq(a);

                var m = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
                if (s < m) {
                    s = m;
                }
            }
            return s;
        }

        function ms_getTotalSize(i, o, dim, wrapper) {
            if (!is_boolean(wrapper)) {
                wrapper = false;
            }
            if (is_number(o[o.d[dim]]) && wrapper) {
                return o[o.d[dim]];
            }
            if (is_number(o.items[o.d[dim]])) {
                return o.items[o.d[dim]] * i.length;
            }

            var d = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight',
                s = 0;

            for (var a = 0, l = i.length; a < l; a++) {
                var j = i.eq(a);
                s += (j.is(':visible')) ? j[o.d[d]](true) : 0;
            }
            return s;
        }

        function ms_getParentSize($w, o, d) {
            var isVisible = $w.is(':visible');
            if (isVisible) {
                $w.hide();
            }
            var s = $w.parent()[o.d[d]]();
            if (isVisible) {
                $w.show();
            }
            return s;
        }

        function ms_getMaxDimension(o, a) {
            return (is_number(o[o.d['width']])) ? o[o.d['width']] : a;
        }

        function ms_hasVariableSizes(i, o, dim) {
            var s = false,
                v = false;

            for (var a = 0, l = i.length; a < l; a++) {
                var j = i.eq(a);

                var c = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
                if (s === false) {
                    s = c;
                } else if (s != c) {
                    v = true;
                }
                if (s == 0) {
                    v = true;
                }
            }
            return v;
        }

        function ms_getPaddingBorderMargin(i, o, d) {
            return i[o.d['outer' + d]](true) - i[o.d[d.toLowerCase()]]();
        }

        function ms_getPercentage(s, o) {
            if (is_percentage(o)) {
                o = parseInt(o.slice(0, -1), 10);
                if (!is_number(o)) {
                    return s;
                }
                s *= o / 100;
            }
            return s;
        }

        //  config functions
        function cf_e(n, c, pf, ns, rd) {
            if (!is_boolean(pf)) {
                pf = true;
            }
            if (!is_boolean(ns)) {
                ns = true;
            }
            if (!is_boolean(rd)) {
                rd = false;
            }

            if (pf) {
                n = c.events.prefix + n;
            }
            if (ns) {
                n = n + '.' + c.events.namespace;
            }
            if (ns && rd) {
                n += c.serialNumber;
            }

            return n;
        }

        function cf_c(n, c) {
            return (is_string(c.classnames[n])) ? c.classnames[n] : n;
        }

        function cf_mapWrapperSizes(ws, o, p) {
            if (!is_boolean(p)) {
                p = true;
            }
            var pad = (o.usePadding && p) ? o.padding : [0, 0, 0, 0];
            var wra = {};

            wra[o.d['width']] = ws[0] + pad[1] + pad[3];
            wra[o.d['height']] = ws[1] + pad[0] + pad[2];

            return wra;
        }

        function cf_sortParams(vals, typs) {
            var arr = [];
            for (var a = 0, l1 = vals.length; a < l1; a++) {
                for (var b = 0, l2 = typs.length; b < l2; b++) {
                    if (typs[b].indexOf(typeof vals[a]) > -1 && is_undefined(arr[b])) {
                        arr[b] = vals[a];
                        break;
                    }
                }
            }
            return arr;
        }

        function cf_getPadding(p) {
            if (is_undefined(p)) {
                return [0, 0, 0, 0];
            }
            if (is_number(p)) {
                return [p, p, p, p];
            }
            if (is_string(p)) {
                p = p.split('px').join('').split('em').join('').split(' ');
            }

            if (!is_array(p)) {
                return [0, 0, 0, 0];
            }
            for (var i = 0; i < 4; i++) {
                p[i] = parseInt(p[i], 10);
            }
            switch (p.length) {
                case 0:
                    return [0, 0, 0, 0];
                case 1:
                    return [p[0], p[0], p[0], p[0]];
                case 2:
                    return [p[0], p[1], p[0], p[1]];
                case 3:
                    return [p[0], p[1], p[2], p[1]];
                default:
                    return [p[0], p[1], p[2], p[3]];
            }
        }

        function cf_getAlignPadding(itm, o) {
            var x = (is_number(o[o.d['width']])) ? Math.ceil(o[o.d['width']] - ms_getTotalSize(itm, o, 'width')) : 0;
            switch (o.align) {
                case 'left':
                    return [0, x];
                case 'right':
                    return [x, 0];
                case 'center':
                default:
                    return [Math.ceil(x / 2), Math.floor(x / 2)];
            }
        }

        function cf_getDimensions(o) {
            var dm = [
                ['width', 'innerWidth', 'outerWidth', 'height', 'innerHeight', 'outerHeight', 'left', 'top', 'marginRight', 0, 1, 2, 3],
                ['height', 'innerHeight', 'outerHeight', 'width', 'innerWidth', 'outerWidth', 'top', 'left', 'marginBottom', 3, 2, 1, 0]
            ];

            var dl = dm[0].length,
                dx = (o.direction == 'right' || o.direction == 'left') ? 0 : 1;

            var dimensions = {};
            for (var d = 0; d < dl; d++) {
                dimensions[dm[0][d]] = dm[dx][d];
            }
            return dimensions;
        }

        function cf_getAdjust(x, o, a, $t) {
            var v = x;
            if (is_function(a)) {
                v = a.call($t, v);

            } else if (is_string(a)) {
                var p = a.split('+'),
                    m = a.split('-');

                if (m.length > p.length) {
                    var neg = true,
                        sta = m[0],
                        adj = m[1];
                } else {
                    var neg = false,
                        sta = p[0],
                        adj = p[1];
                }

                switch (sta) {
                    case 'even':
                        v = (x % 2 == 1) ? x - 1 : x;
                        break;
                    case 'odd':
                        v = (x % 2 == 0) ? x - 1 : x;
                        break;
                    default:
                        v = x;
                        break;
                }
                adj = parseInt(adj, 10);
                if (is_number(adj)) {
                    if (neg) {
                        adj = -adj;
                    }
                    v += adj;
                }
            }
            if (!is_number(v) || v < 1) {
                v = 1;
            }
            return v;
        }

        function cf_getItemsAdjust(x, o, a, $t) {
            return cf_getItemAdjustMinMax(cf_getAdjust(x, o, a, $t), o.items.visibleConf);
        }

        function cf_getItemAdjustMinMax(v, i) {
            if (is_number(i.min) && v < i.min) {
                v = i.min;
            }
            if (is_number(i.max) && v > i.max) {
                v = i.max;
            }
            if (v < 1) {
                v = 1;
            }
            return v;
        }

        function cf_getSynchArr(s) {
            if (!is_array(s)) {
                s = [
                    [s]
                ];
            }
            if (!is_array(s[0])) {
                s = [s];
            }
            for (var j = 0, l = s.length; j < l; j++) {
                if (is_string(s[j][0])) {
                    s[j][0] = $(s[j][0]);
                }
                if (!is_boolean(s[j][1])) {
                    s[j][1] = true;
                }
                if (!is_boolean(s[j][2])) {
                    s[j][2] = true;
                }
                if (!is_number(s[j][3])) {
                    s[j][3] = 0;
                }
            }
            return s;
        }

        function cf_getKeyCode(k) {
            if (k == 'right') {
                return 39;
            }
            if (k == 'left') {
                return 37;
            }
            if (k == 'up') {
                return 38;
            }
            if (k == 'down') {
                return 40;
            }
            return -1;
        }

        function cf_setCookie(n, $c, c) {
            if (n) {
                var v = $c.triggerHandler(cf_e('currentPosition', c));
                $.fn.carouFredSel.cookie.set(n, v);
            }
        }

        function cf_getCookie(n) {
            var c = $.fn.carouFredSel.cookie.get(n);
            return (c == '') ? 0 : c;
        }

        //  init function
        function in_mapCss($elem, props) {
            var css = {};
            for (var p = 0, l = props.length; p < l; p++) {
                css[props[p]] = $elem.css(props[p]);
            }
            return css;
        }

        function in_complementItems(obj, opt, itm, sta) {
            if (!is_object(obj.visibleConf)) {
                obj.visibleConf = {};
            }
            if (!is_object(obj.sizesConf)) {
                obj.sizesConf = {};
            }

            if (obj.start == 0 && is_number(sta)) {
                obj.start = sta;
            }

            //  visible items
            if (is_object(obj.visible)) {
                obj.visibleConf.min = obj.visible.min;
                obj.visibleConf.max = obj.visible.max;
                obj.visible = false;
            } else if (is_string(obj.visible)) {
                //  variable visible items
                if (obj.visible == 'variable') {
                    obj.visibleConf.variable = true;
                }
                //  adjust string visible items
                else {
                    obj.visibleConf.adjust = obj.visible;
                }
                obj.visible = false;
            } else if (is_function(obj.visible)) {
                obj.visibleConf.adjust = obj.visible;
                obj.visible = false;
            }

            //  set items filter
            if (!is_string(obj.filter)) {
                obj.filter = (itm.filter(':hidden').length > 0) ? ':visible' : '*';
            }

            //  primary item-size not set
            if (!obj[opt.d['width']]) {
                //  responsive carousel -> set to largest
                if (opt.responsive) {
                    debug(true, 'Set a ' + opt.d['width'] + ' for the items!');
                    obj[opt.d['width']] = ms_getTrueLargestSize(itm, opt, 'outerWidth');
                }
                //   non-responsive -> measure it or set to "variable"
                else {
                    obj[opt.d['width']] = (ms_hasVariableSizes(itm, opt, 'outerWidth')) ? 'variable' : itm[opt.d['outerWidth']](true);
                }
            }

            //  secondary item-size not set -> measure it or set to "variable"
            if (!obj[opt.d['height']]) {
                obj[opt.d['height']] = (ms_hasVariableSizes(itm, opt, 'outerHeight')) ? 'variable' : itm[opt.d['outerHeight']](true);
            }

            obj.sizesConf.width = obj.width;
            obj.sizesConf.height = obj.height;
            return obj;
        }

        function in_complementVisibleItems(opt, avl) {
            //  primary item-size variable -> set visible items variable
            if (opt.items[opt.d['width']] == 'variable') {
                opt.items.visibleConf.variable = true;
            }
            if (!opt.items.visibleConf.variable) {
                //  primary size is number -> calculate visible-items
                if (is_number(opt[opt.d['width']])) {
                    opt.items.visible = Math.floor(opt[opt.d['width']] / opt.items[opt.d['width']]);
                }
                //  measure and calculate primary size and visible-items
                else {
                    opt.items.visible = Math.floor(avl / opt.items[opt.d['width']]);
                    opt[opt.d['width']] = opt.items.visible * opt.items[opt.d['width']];
                    if (!opt.items.visibleConf.adjust) {
                        opt.align = false;
                    }
                }
                if (opt.items.visible == 'Infinity' || opt.items.visible < 1) {
                    debug(true, 'Not a valid number of visible items: Set to "variable".');
                    opt.items.visibleConf.variable = true;
                }
            }
            return opt;
        }

        function in_complementPrimarySize(obj, opt, all) {
            //  primary size set to auto -> measure largest item-size and set it
            if (obj == 'auto') {
                obj = ms_getTrueLargestSize(all, opt, 'outerWidth');
            }
            return obj;
        }

        function in_complementSecondarySize(obj, opt, all) {
            //  secondary size set to auto -> measure largest item-size and set it
            if (obj == 'auto') {
                obj = ms_getTrueLargestSize(all, opt, 'outerHeight');
            }
            //  secondary size not set -> set to secondary item-size
            if (!obj) {
                obj = opt.items[opt.d['height']];
            }
            return obj;
        }

        function in_getAlignPadding(o, all) {
            var p = cf_getAlignPadding(gi_getCurrentItems(all, o), o);
            o.padding[o.d[1]] = p[1];
            o.padding[o.d[3]] = p[0];
            return o;
        }

        function in_getResponsiveValues(o, all, avl) {

            var visb = cf_getItemAdjustMinMax(Math.ceil(o[o.d['width']] / o.items[o.d['width']]), o.items.visibleConf);
            if (visb > all.length) {
                visb = all.length;
            }

            var newS = Math.floor(o[o.d['width']] / visb);

            o.items.visible = visb;
            o.items[o.d['width']] = newS;
            o[o.d['width']] = visb * newS;
            return o;
        }


        //  buttons functions
        function bt_pauseOnHoverConfig(p) {
            if (is_string(p)) {
                var i = (p.indexOf('immediate') > -1) ? true : false,
                    r = (p.indexOf('resume') > -1) ? true : false;
            } else {
                var i = r = false;
            }
            return [i, r];
        }

        function bt_mousesheelNumber(mw) {
            return (is_number(mw)) ? mw : null
        }

        //  helper functions
        function is_null(a) {
            return (a === null);
        }

        function is_undefined(a) {
            return (is_null(a) || typeof a == 'undefined' || a === '' || a === 'undefined');
        }

        function is_array(a) {
            return (a instanceof Array);
        }

        function is_jquery(a) {
            return (a instanceof jQuery);
        }

        function is_object(a) {
            return ((a instanceof Object || typeof a == 'object') && !is_null(a) && !is_jquery(a) && !is_array(a));
        }

        function is_number(a) {
            return ((a instanceof Number || typeof a == 'number') && !isNaN(a));
        }

        function is_string(a) {
            return ((a instanceof String || typeof a == 'string') && !is_undefined(a) && !is_true(a) && !is_false(a));
        }

        function is_function(a) {
            return (a instanceof Function || typeof a == 'function');
        }

        function is_boolean(a) {
            return (a instanceof Boolean || typeof a == 'boolean' || is_true(a) || is_false(a));
        }

        function is_true(a) {
            return (a === true || a === 'true');
        }

        function is_false(a) {
            return (a === false || a === 'false');
        }

        function is_percentage(x) {
            return (is_string(x) && x.slice(-1) == '%');
        }


        function getTime() {
            return new Date().getTime();
        }

        function deprecated(o, n) {
            debug(true, o + ' is DEPRECATED, support for it will be removed. Use ' + n + ' instead.');
        }

        function debug(d, m) {
            if (!is_undefined(window.console) && !is_undefined(window.console.log)) {
                if (is_object(d)) {
                    var s = ' (' + d.selector + ')';
                    d = d.debug;
                } else {
                    var s = '';
                }
                if (!d) {
                    return false;
                }

                if (is_string(m)) {
                    m = 'carouFredSel' + s + ': ' + m;
                } else {
                    m = ['carouFredSel' + s + ':', m];
                }
                window.console.log(m);
            }
            return false;
        }



        //  EASING FUNCTIONS
        $.extend($.easing, {
            'quadratic': function(t) {
                var t2 = t * t;
                return t * (-t2 * t + 4 * t2 - 6 * t + 4);
            },
            'cubic': function(t) {
                return t * (4 * t * t - 9 * t + 6);
            },
            'elastic': function(t) {
                var t2 = t * t;
                return t * (33 * t2 * t2 - 106 * t2 * t + 126 * t2 - 67 * t + 15);
            }
        });


    })(jQuery);
/*-------------------------------  jQuery Transit  ------------------------------------*/

    (function(d) {
        function m(a) {
            if (a in j.style) return a;
            var b = ["Moz", "Webkit", "O", "ms"],
                c = a.charAt(0).toUpperCase() + a.substr(1);
            if (a in j.style) return a;
            for (a = 0; a < b.length; ++a) {
                var d = b[a] + c;
                if (d in j.style) return d
            }
        }

        function l(a) {
            "string" === typeof a && this.parse(a);
            return this
        }

        function q(a, b, c, e) {
            var h = [];
            d.each(a, function(a) {
                a = d.camelCase(a);
                a = d.transit.propertyMap[a] || d.cssProps[a] || a;
                a = a.replace(/([A-Z])/g, function(a) {
                    return "-" + a.toLowerCase()
                }); - 1 === d.inArray(a, h) && h.push(a)
            });
            d.cssEase[c] && (c = d.cssEase[c]);
            var f = "" + n(b) + " " + c;
            0 < parseInt(e, 10) && (f += " " + n(e));
            var g = [];
            d.each(h, function(a, b) {
                g.push(b + " " + f)
            });
            return g.join(", ")
        }

        function f(a, b) {
            b || (d.cssNumber[a] = !0);
            d.transit.propertyMap[a] = e.transform;
            d.cssHooks[a] = {
                get: function(b) {
                    return d(b).css("transit:transform").get(a)
                },
                set: function(b, e) {
                    var h = d(b).css("transit:transform");
                    h.setFromString(a, e);
                    d(b).css({
                        "transit:transform": h
                    })
                }
            }
        }

        function g(a, b) {
            return "string" === typeof a && !a.match(/^[\-0-9\.]+$/) ? a : "" + a + b
        }

        function n(a) {
            d.fx.speeds[a] && (a = d.fx.speeds[a]);
            return g(a, "ms")
        }
        d.transit = {
            version: "0.9.9",
            propertyMap: {
                marginLeft: "margin",
                marginRight: "margin",
                marginBottom: "margin",
                marginTop: "margin",
                paddingLeft: "padding",
                paddingRight: "padding",
                paddingBottom: "padding",
                paddingTop: "padding"
            },
            enabled: !0,
            useTransitionEnd: !1
        };
        var j = document.createElement("div"),
            e = {},
            r = -1 < navigator.userAgent.toLowerCase().indexOf("chrome");
        e.transition = m("transition");
        e.transitionDelay = m("transitionDelay");
        e.transform = m("transform");
        e.transformOrigin = m("transformOrigin");
        j.style[e.transform] =
            "";
        j.style[e.transform] = "rotateY(90deg)";
        e.transform3d = "" !== j.style[e.transform];
        var p = e.transitionEnd = {
                transition: "transitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd",
                WebkitTransition: "webkitTransitionEnd",
                msTransition: "MSTransitionEnd"
            }[e.transition] || null,
            k;
        for (k in e) e.hasOwnProperty(k) && "undefined" === typeof d.support[k] && (d.support[k] = e[k]);
        j = null;
        d.cssEase = {
            _default: "ease",
            "in": "ease-in",
            out: "ease-out",
            "in-out": "ease-in-out",
            snap: "cubic-bezier(0,1,.5,1)",
            easeOutCubic: "cubic-bezier(.215,.61,.355,1)",
            easeInOutCubic: "cubic-bezier(.645,.045,.355,1)",
            easeInCirc: "cubic-bezier(.6,.04,.98,.335)",
            easeOutCirc: "cubic-bezier(.075,.82,.165,1)",
            easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)",
            easeInExpo: "cubic-bezier(.95,.05,.795,.035)",
            easeOutExpo: "cubic-bezier(.19,1,.22,1)",
            easeInOutExpo: "cubic-bezier(1,0,0,1)",
            easeInQuad: "cubic-bezier(.55,.085,.68,.53)",
            easeOutQuad: "cubic-bezier(.25,.46,.45,.94)",
            easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)",
            easeInQuart: "cubic-bezier(.895,.03,.685,.22)",
            easeOutQuart: "cubic-bezier(.165,.84,.44,1)",
            easeInOutQuart: "cubic-bezier(.77,0,.175,1)",
            easeInQuint: "cubic-bezier(.755,.05,.855,.06)",
            easeOutQuint: "cubic-bezier(.23,1,.32,1)",
            easeInOutQuint: "cubic-bezier(.86,0,.07,1)",
            easeInSine: "cubic-bezier(.47,0,.745,.715)",
            easeOutSine: "cubic-bezier(.39,.575,.565,1)",
            easeInOutSine: "cubic-bezier(.445,.05,.55,.95)",
            easeInBack: "cubic-bezier(.6,-.28,.735,.045)",
            easeOutBack: "cubic-bezier(.175, .885,.32,1.275)",
            easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"
        };
        d.cssHooks["transit:transform"] = {
            get: function(a) {
                return d(a).data("transform") ||
                    new l
            },
            set: function(a, b) {
                var c = b;
                c instanceof l || (c = new l(c));
                a.style[e.transform] = "WebkitTransform" === e.transform && !r ? c.toString(!0) : c.toString();
                d(a).data("transform", c)
            }
        };
        d.cssHooks.transform = {
            set: d.cssHooks["transit:transform"].set
        };
        "1.8" > d.fn.jquery && (d.cssHooks.transformOrigin = {
            get: function(a) {
                return a.style[e.transformOrigin]
            },
            set: function(a, b) {
                a.style[e.transformOrigin] = b
            }
        }, d.cssHooks.transition = {
            get: function(a) {
                return a.style[e.transition]
            },
            set: function(a, b) {
                a.style[e.transition] = b
            }
        });
        f("scale");
        f("translate");
        f("rotate");
        f("rotateX");
        f("rotateY");
        f("rotate3d");
        f("perspective");
        f("skewX");
        f("skewY");
        f("x", !0);
        f("y", !0);
        l.prototype = {
            setFromString: function(a, b) {
                var c = "string" === typeof b ? b.split(",") : b.constructor === Array ? b : [b];
                c.unshift(a);
                l.prototype.set.apply(this, c)
            },
            set: function(a) {
                var b = Array.prototype.slice.apply(arguments, [1]);
                this.setter[a] ? this.setter[a].apply(this, b) : this[a] = b.join(",")
            },
            get: function(a) {
                return this.getter[a] ? this.getter[a].apply(this) : this[a] || 0
            },
            setter: {
                rotate: function(a) {
                    this.rotate =
                        g(a, "deg")
                },
                rotateX: function(a) {
                    this.rotateX = g(a, "deg")
                },
                rotateY: function(a) {
                    this.rotateY = g(a, "deg")
                },
                scale: function(a, b) {
                    void 0 === b && (b = a);
                    this.scale = a + "," + b
                },
                skewX: function(a) {
                    this.skewX = g(a, "deg")
                },
                skewY: function(a) {
                    this.skewY = g(a, "deg")
                },
                perspective: function(a) {
                    this.perspective = g(a, "px")
                },
                x: function(a) {
                    this.set("translate", a, null)
                },
                y: function(a) {
                    this.set("translate", null, a)
                },
                translate: function(a, b) {
                    void 0 === this._translateX && (this._translateX = 0);
                    void 0 === this._translateY && (this._translateY = 0);
                    null !== a && void 0 !== a && (this._translateX = g(a, "px"));
                    null !== b && void 0 !== b && (this._translateY = g(b, "px"));
                    this.translate = this._translateX + "," + this._translateY
                }
            },
            getter: {
                x: function() {
                    return this._translateX || 0
                },
                y: function() {
                    return this._translateY || 0
                },
                scale: function() {
                    var a = (this.scale || "1,1").split(",");
                    a[0] && (a[0] = parseFloat(a[0]));
                    a[1] && (a[1] = parseFloat(a[1]));
                    return a[0] === a[1] ? a[0] : a
                },
                rotate3d: function() {
                    for (var a = (this.rotate3d || "0,0,0,0deg").split(","), b = 0; 3 >= b; ++b) a[b] && (a[b] = parseFloat(a[b]));
                    a[3] && (a[3] = g(a[3], "deg"));
                    return a
                }
            },
            parse: function(a) {
                var b = this;
                a.replace(/([a-zA-Z0-9]+)\((.*?)\)/g, function(a, d, e) {
                    b.setFromString(d, e)
                })
            },
            toString: function(a) {
                var b = [],
                    c;
                for (c in this)
                    if (this.hasOwnProperty(c) && (e.transform3d || !("rotateX" === c || "rotateY" === c || "perspective" === c || "transformOrigin" === c))) "_" !== c[0] && (a && "scale" === c ? b.push(c + "3d(" + this[c] + ",1)") : a && "translate" === c ? b.push(c + "3d(" + this[c] + ",0)") : b.push(c + "(" + this[c] + ")"));
                return b.join(" ")
            }
        };
        d.fn.transition = d.fn.transit = function(a,
            b, c, f) {
            var h = this,
                g = 0,
                j = !0;
            "function" === typeof b && (f = b, b = void 0);
            "function" === typeof c && (f = c, c = void 0);
            "undefined" !== typeof a.easing && (c = a.easing, delete a.easing);
            "undefined" !== typeof a.duration && (b = a.duration, delete a.duration);
            "undefined" !== typeof a.complete && (f = a.complete, delete a.complete);
            "undefined" !== typeof a.queue && (j = a.queue, delete a.queue);
            "undefined" !== typeof a.delay && (g = a.delay, delete a.delay);
            "undefined" === typeof b && (b = d.fx.speeds._default);
            "undefined" === typeof c && (c = d.cssEase._default);
            b = n(b);
            var l = q(a, b, c, g),
                k = d.transit.enabled && e.transition ? parseInt(b, 10) + parseInt(g, 10) : 0;
            if (0 === k) return b = j, c = function(b) {
                h.css(a);
                f && f.apply(h);
                b && b()
            }, !0 === b ? h.queue(c) : b ? h.queue(b, c) : c(), h;
            var m = {};
            b = j;
            c = function(b) {
                this.offsetWidth;
                var c = !1,
                    g = function() {
                        c && h.unbind(p, g);
                        0 < k && h.each(function() {
                            this.style[e.transition] = m[this] || null
                        });
                        "function" === typeof f && f.apply(h);
                        "function" === typeof b && b()
                    };
                0 < k && p && d.transit.useTransitionEnd ? (c = !0, h.bind(p, g)) : window.setTimeout(g, k);
                h.each(function() {
                    0 < k &&
                        (this.style[e.transition] = l);
                    d(this).css(a)
                })
            };
            !0 === b ? h.queue(c) : b ? h.queue(b, c) : c();
            return this
        };
        d.transit.getTransitionValue = q
    })(jQuery);
/*-------------------------------  Touch Swipe  ------------------------------------*/




    (function(factory) {
        if (typeof define === 'function' && define.amd && define.amd.jQuery) {
            // AMD. Register as anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals.
            factory(jQuery);
        }
    }(function($) {
        "use strict";

        //Constants
        var LEFT = "left",
            RIGHT = "right",
            UP = "up",
            DOWN = "down",
            IN = "in",
            OUT = "out",

            NONE = "none",
            AUTO = "auto",

            SWIPE = "swipe",
            PINCH = "pinch",
            TAP = "tap",
            DOUBLE_TAP = "doubletap",
            LONG_TAP = "longtap",
            HOLD = "hold",

            HORIZONTAL = "horizontal",
            VERTICAL = "vertical",

            ALL_FINGERS = "all",

            DOUBLE_TAP_THRESHOLD = 10,

            PHASE_START = "start",
            PHASE_MOVE = "move",
            PHASE_END = "end",
            PHASE_CANCEL = "cancel",

            SUPPORTS_TOUCH = 'ontouchstart' in window,

            SUPPORTS_POINTER_IE10 = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled,

            SUPPORTS_POINTER = window.navigator.pointerEnabled || window.navigator.msPointerEnabled,

            PLUGIN_NS = 'TouchSwipe';



        /**
            * The default configuration, and available options to configure touch swipe with.
            * You can set the default values by updating any of the properties prior to instantiation.
            * @name $.fn.swipe.defaults
            * @namespace
            * @property {int} [fingers=1] The number of fingers to detect in a swipe. Any swipes that do not meet this requirement will NOT trigger swipe handlers.
            * @property {int} [threshold=75] The number of pixels that the user must move their finger by before it is considered a swipe. 
            * @property {int} [cancelThreshold=null] The number of pixels that the user must move their finger back from the original swipe direction to cancel the gesture.
            * @property {int} [pinchThreshold=20] The number of pixels that the user must pinch their finger by before it is considered a pinch. 
            * @property {int} [maxTimeThreshold=null] Time, in milliseconds, between touchStart and touchEnd must NOT exceed in order to be considered a swipe. 
            * @property {int} [fingerReleaseThreshold=250] Time in milliseconds between releasing multiple fingers.  If 2 fingers are down, and are released one after the other, if they are within this threshold, it counts as a simultaneous release. 
            * @property {int} [longTapThreshold=500] Time in milliseconds between tap and release for a long tap
            * @property {int} [doubleTapThreshold=200] Time in milliseconds between 2 taps to count as a double tap
            * @property {function} [swipe=null] A handler to catch all swipes. See {@link $.fn.swipe#event:swipe}
            * @property {function} [swipeLeft=null] A handler that is triggered for "left" swipes. See {@link $.fn.swipe#event:swipeLeft}
            * @property {function} [swipeRight=null] A handler that is triggered for "right" swipes. See {@link $.fn.swipe#event:swipeRight}
            * @property {function} [swipeUp=null] A handler that is triggered for "up" swipes. See {@link $.fn.swipe#event:swipeUp}
            * @property {function} [swipeDown=null] A handler that is triggered for "down" swipes. See {@link $.fn.swipe#event:swipeDown}
            * @property {function} [swipeStatus=null] A handler triggered for every phase of the swipe. See {@link $.fn.swipe#event:swipeStatus}
            * @property {function} [pinchIn=null] A handler triggered for pinch in events. See {@link $.fn.swipe#event:pinchIn}
            * @property {function} [pinchOut=null] A handler triggered for pinch out events. See {@link $.fn.swipe#event:pinchOut}
            * @property {function} [pinchStatus=null] A handler triggered for every phase of a pinch. See {@link $.fn.swipe#event:pinchStatus}
            * @property {function} [tap=null] A handler triggered when a user just taps on the item, rather than swipes it. If they do not move, tap is triggered, if they do move, it is not. 
            * @property {function} [doubleTap=null] A handler triggered when a user double taps on the item. The delay between taps can be set with the doubleTapThreshold property. See {@link $.fn.swipe.defaults#doubleTapThreshold}
            * @property {function} [longTap=null] A handler triggered when a user long taps on the item. The delay between start and end can be set with the longTapThreshold property. See {@link $.fn.swipe.defaults#longTapThreshold}
            * @property (function) [hold=null] A handler triggered when a user reaches longTapThreshold on the item. See {@link $.fn.swipe.defaults#longTapThreshold}
            * @property {boolean} [triggerOnTouchEnd=true] If true, the swipe events are triggered when the touch end event is received (user releases finger).  If false, it will be triggered on reaching the threshold, and then cancel the touch event automatically. 
            * @property {boolean} [triggerOnTouchLeave=false] If true, then when the user leaves the swipe object, the swipe will end and trigger appropriate handlers. 
            * @property {string|undefined} [allowPageScroll='auto'] How the browser handles page scrolls when the user is swiping on a touchSwipe object. See {@link $.fn.swipe.pageScroll}.  <br/><br/>
                                                <code>"auto"</code> : all undefined swipes will cause the page to scroll in that direction. <br/>
                                                <code>"none"</code> : the page will not scroll when user swipes. <br/>
                                                <code>"horizontal"</code> : will force page to scroll on horizontal swipes. <br/>
                                                <code>"vertical"</code> : will force page to scroll on vertical swipes. <br/>
            * @property {boolean} [fallbackToMouseEvents=true] If true mouse events are used when run on a non touch device, false will stop swipes being triggered by mouse events on non tocuh devices. 
            * @property {string} [excludedElements="button, input, select, textarea, a, .noSwipe"] A jquery selector that specifies child elements that do NOT trigger swipes. By default this excludes all form, input, select, button, anchor and .noSwipe elements. 
            
            */
        var defaults = {
            fingers: 1,
            threshold: 75,
            cancelThreshold: null,
            pinchThreshold: 20,
            maxTimeThreshold: null,
            fingerReleaseThreshold: 250,
            longTapThreshold: 500,
            doubleTapThreshold: 200,
            swipe: null,
            swipeLeft: null,
            swipeRight: null,
            swipeUp: null,
            swipeDown: null,
            swipeStatus: null,
            pinchIn: null,
            pinchOut: null,
            pinchStatus: null,
            click: null, //Deprecated since 1.6.2
            tap: null,
            doubleTap: null,
            longTap: null,
            hold: null,
            triggerOnTouchEnd: true,
            triggerOnTouchLeave: false,
            allowPageScroll: "auto",
            fallbackToMouseEvents: true,
            excludedElements: "label, button, input, select, textarea, a, .noSwipe"
        };



        /**
         * Applies TouchSwipe behaviour to one or more jQuery objects.
         * The TouchSwipe plugin can be instantiated via this method, or methods within
         * TouchSwipe can be executed via this method as per jQuery plugin architecture.
         * @see TouchSwipe
         * @class
         * @param {Mixed} method If the current DOMNode is a TouchSwipe object, and <code>method</code> is a TouchSwipe method, then
         * the <code>method</code> is executed, and any following arguments are passed to the TouchSwipe method.
         * If <code>method</code> is an object, then the TouchSwipe class is instantiated on the current DOMNode, passing the
         * configuration properties defined in the object. See TouchSwipe
         *
         */
        $.fn.swipe = function(method) {
            var $this = $(this),
                plugin = $this.data(PLUGIN_NS);

            //Check if we are already instantiated and trying to execute a method   
            if (plugin && typeof method === 'string') {
                if (plugin[method]) {
                    return plugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
                } else {
                    $.error('Method ' + method + ' does not exist on jQuery.swipe');
                }
            }
            //Else not instantiated and trying to pass init object (or nothing)
            else if (!plugin && (typeof method === 'object' || !method)) {
                return init.apply(this, arguments);
            }

            return $this;
        };

        //Expose our defaults so a user could override the plugin defaults
        $.fn.swipe.defaults = defaults;

        /**
         * The phases that a touch event goes through.  The <code>phase</code> is passed to the event handlers.
         * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
         * @namespace
         * @readonly
         * @property {string} PHASE_START Constant indicating the start phase of the touch event. Value is <code>"start"</code>.
         * @property {string} PHASE_MOVE Constant indicating the move phase of the touch event. Value is <code>"move"</code>.
         * @property {string} PHASE_END Constant indicating the end phase of the touch event. Value is <code>"end"</code>.
         * @property {string} PHASE_CANCEL Constant indicating the cancel phase of the touch event. Value is <code>"cancel"</code>.
         */
        $.fn.swipe.phases = {
            PHASE_START: PHASE_START,
            PHASE_MOVE: PHASE_MOVE,
            PHASE_END: PHASE_END,
            PHASE_CANCEL: PHASE_CANCEL
        };

        /**
         * The direction constants that are passed to the event handlers.
         * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
         * @namespace
         * @readonly
         * @property {string} LEFT Constant indicating the left direction. Value is <code>"left"</code>.
         * @property {string} RIGHT Constant indicating the right direction. Value is <code>"right"</code>.
         * @property {string} UP Constant indicating the up direction. Value is <code>"up"</code>.
         * @property {string} DOWN Constant indicating the down direction. Value is <code>"cancel"</code>.
         * @property {string} IN Constant indicating the in direction. Value is <code>"in"</code>.
         * @property {string} OUT Constant indicating the out direction. Value is <code>"out"</code>.
         */
        $.fn.swipe.directions = {
            LEFT: LEFT,
            RIGHT: RIGHT,
            UP: UP,
            DOWN: DOWN,
            IN: IN,
            OUT: OUT
        };

        /**
         * The page scroll constants that can be used to set the value of <code>allowPageScroll</code> option
         * These properties are read only
         * @namespace
         * @readonly
         * @see $.fn.swipe.defaults#allowPageScroll
         * @property {string} NONE Constant indicating no page scrolling is allowed. Value is <code>"none"</code>.
         * @property {string} HORIZONTAL Constant indicating horizontal page scrolling is allowed. Value is <code>"horizontal"</code>.
         * @property {string} VERTICAL Constant indicating vertical page scrolling is allowed. Value is <code>"vertical"</code>.
         * @property {string} AUTO Constant indicating either horizontal or vertical will be allowed, depending on the swipe handlers registered. Value is <code>"auto"</code>.
         */
        $.fn.swipe.pageScroll = {
            NONE: NONE,
            HORIZONTAL: HORIZONTAL,
            VERTICAL: VERTICAL,
            AUTO: AUTO
        };

        /**
         * Constants representing the number of fingers used in a swipe.  These are used to set both the value of <code>fingers</code> in the
         * options object, as well as the value of the <code>fingers</code> event property.
         * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
         * @namespace
         * @readonly
         * @see $.fn.swipe.defaults#fingers
         * @property {string} ONE Constant indicating 1 finger is to be detected / was detected. Value is <code>1</code>.
         * @property {string} TWO Constant indicating 2 fingers are to be detected / were detected. Value is <code>1</code>.
         * @property {string} THREE Constant indicating 3 finger are to be detected / were detected. Value is <code>1</code>.
         * @property {string} ALL Constant indicating any combination of finger are to be detected.  Value is <code>"all"</code>.
         */
        $.fn.swipe.fingers = {
            ONE: 1,
            TWO: 2,
            THREE: 3,
            ALL: ALL_FINGERS
        };

        /**
         * Initialise the plugin for each DOM element matched
         * This creates a new instance of the main TouchSwipe class for each DOM element, and then
         * saves a reference to that instance in the elements data property.
         * @internal
         */
        function init(options) {
            //Prep and extend the options
            if (options && (options.allowPageScroll === undefined && (options.swipe !== undefined || options.swipeStatus !== undefined))) {
                options.allowPageScroll = NONE;
            }

            //Check for deprecated options
            //Ensure that any old click handlers are assigned to the new tap, unless we have a tap
            if (options.click !== undefined && options.tap === undefined) {
                options.tap = options.click;
            }

            if (!options) {
                options = {};
            }

            //pass empty object so we dont modify the defaults
            options = $.extend({}, $.fn.swipe.defaults, options);

            //For each element instantiate the plugin
            return this.each(function() {
                var $this = $(this);

                //Check we havent already initialised the plugin
                var plugin = $this.data(PLUGIN_NS);

                if (!plugin) {
                    plugin = new TouchSwipe(this, options);
                    $this.data(PLUGIN_NS, plugin);
                }
            });
        }

        /**
         * Main TouchSwipe Plugin Class.
         * Do not use this to construct your TouchSwipe object, use the jQuery plugin method $.fn.swipe(); {@link $.fn.swipe}
         * @private
         * @name TouchSwipe
         * @param {DOMNode} element The HTML DOM object to apply to plugin to
         * @param {Object} options The options to configure the plugin with.  @link {$.fn.swipe.defaults}
         * @see $.fh.swipe.defaults
         * @see $.fh.swipe
         * @class
         */
        function TouchSwipe(element, options) {
            var useTouchEvents = (SUPPORTS_TOUCH || SUPPORTS_POINTER || !options.fallbackToMouseEvents),
                START_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerDown' : 'pointerdown') : 'touchstart') : 'mousedown',
                MOVE_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerMove' : 'pointermove') : 'touchmove') : 'mousemove',
                END_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerUp' : 'pointerup') : 'touchend') : 'mouseup',
                LEAVE_EV = useTouchEvents ? null : 'mouseleave', //we manually detect leave on touch devices, so null event here
                CANCEL_EV = (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerCancel' : 'pointercancel') : 'touchcancel');



            //touch properties
            var distance = 0,
                direction = null,
                duration = 0,
                startTouchesDistance = 0,
                endTouchesDistance = 0,
                pinchZoom = 1,
                pinchDistance = 0,
                pinchDirection = 0,
                maximumsMap = null;



            //jQuery wrapped element for this instance
            var $element = $(element);

            //Current phase of th touch cycle
            var phase = "start";

            // the current number of fingers being used.
            var fingerCount = 0;

            //track mouse points / delta
            var fingerData = null;

            //track times
            var startTime = 0,
                endTime = 0,
                previousTouchEndTime = 0,
                previousTouchFingerCount = 0,
                doubleTapStartTime = 0;

            //Timeouts
            var singleTapTimeout = null,
                holdTimeout = null;

            // Add gestures to all swipable areas if supported
            try {
                $element.bind(START_EV, touchStart);
                $element.bind(CANCEL_EV, touchCancel);
            } catch (e) {
                $.error('events not supported ' + START_EV + ',' + CANCEL_EV + ' on jQuery.swipe');
            }

            //
            //Public methods
            //

            /**
             * re-enables the swipe plugin with the previous configuration
             * @function
             * @name $.fn.swipe#enable
             * @return {DOMNode} The Dom element that was registered with TouchSwipe
             * @example $("#element").swipe("enable");
             */
            this.enable = function() {
                $element.bind(START_EV, touchStart);
                $element.bind(CANCEL_EV, touchCancel);
                return $element;
            };

            /**
             * disables the swipe plugin
             * @function
             * @name $.fn.swipe#disable
             * @return {DOMNode} The Dom element that is now registered with TouchSwipe
             * @example $("#element").swipe("disable");
             */
            this.disable = function() {
                removeListeners();
                return $element;
            };

            /**
             * Destroy the swipe plugin completely. To use any swipe methods, you must re initialise the plugin.
             * @function
             * @name $.fn.swipe#destroy
             * @return {DOMNode} The Dom element that was registered with TouchSwipe
             * @example $("#element").swipe("destroy");
             */
            this.destroy = function() {
                removeListeners();
                $element.data(PLUGIN_NS, null);
                return $element;
            };


            /**
             * Allows run time updating of the swipe configuration options.
             * @function
             * @name $.fn.swipe#option
             * @param {String} property The option property to get or set
             * @param {Object} [value] The value to set the property to
             * @return {Object} If only a property name is passed, then that property value is returned.
             * @example $("#element").swipe("option", "threshold"); // return the threshold
             * @example $("#element").swipe("option", "threshold", 100); // set the threshold after init
             * @see $.fn.swipe.defaults
             *
             */
            this.option = function(property, value) {
                if (options[property] !== undefined) {
                    if (value === undefined) {
                        return options[property];
                    } else {
                        options[property] = value;
                    }
                } else {
                    $.error('Option ' + property + ' does not exist on jQuery.swipe.options');
                }

                return null;
            }

            //
            // Private methods
            //

            //
            // EVENTS
            //
            /**
             * Event handler for a touch start event.
             * Stops the default click event from triggering and stores where we touched
             * @inner
             * @param {object} jqEvent The normalised jQuery event object.
             */
            function touchStart(jqEvent) {
                //If we already in a touch event (a finger already in use) then ignore subsequent ones..
                if (getTouchInProgress())
                    return;

                //Check if this element matches any in the excluded elements selectors,  or its parent is excluded, if so, DON'T swipe
                if ($(jqEvent.target).closest(options.excludedElements, $element).length > 0)
                    return;

                //As we use Jquery bind for events, we need to target the original event object
                //If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
                var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

                var ret,
                    evt = SUPPORTS_TOUCH ? event.touches[0] : event;

                phase = PHASE_START;

                //If we support touches, get the finger count
                if (SUPPORTS_TOUCH) {
                    // get the total number of fingers touching the screen
                    fingerCount = event.touches.length;
                }
                //Else this is the desktop, so stop the browser from dragging the image
                else {
                    jqEvent.preventDefault(); //call this on jq event so we are cross browser
                }

                //clear vars..
                distance = 0;
                direction = null;
                pinchDirection = null;
                duration = 0;
                startTouchesDistance = 0;
                endTouchesDistance = 0;
                pinchZoom = 1;
                pinchDistance = 0;
                fingerData = createAllFingerData();
                maximumsMap = createMaximumsData();
                cancelMultiFingerRelease();


                // check the number of fingers is what we are looking for, or we are capturing pinches
                if (!SUPPORTS_TOUCH || (fingerCount === options.fingers || options.fingers === ALL_FINGERS) || hasPinches()) {
                    // get the coordinates of the touch
                    createFingerData(0, evt);
                    startTime = getTimeStamp();

                    if (fingerCount == 2) {
                        //Keep track of the initial pinch distance, so we can calculate the diff later
                        //Store second finger data as start
                        createFingerData(1, event.touches[1]);
                        startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
                    }

                    if (options.swipeStatus || options.pinchStatus) {
                        ret = triggerHandler(event, phase);
                    }
                } else {
                    //A touch with more or less than the fingers we are looking for, so cancel
                    ret = false;
                }

                //If we have a return value from the users handler, then return and cancel
                if (ret === false) {
                    phase = PHASE_CANCEL;
                    triggerHandler(event, phase);
                    return ret;
                } else {
                    if (options.hold) {
                        holdTimeout = setTimeout($.proxy(function() {
                            //Trigger the event
                            $element.trigger('hold', [event.target]);
                            //Fire the callback
                            if (options.hold) {
                                ret = options.hold.call($element, event, event.target);
                            }
                        }, this), options.longTapThreshold);
                    }

                    setTouchInProgress(true);
                }

                return null;
            };



            /**
             * Event handler for a touch move event.
             * If we change fingers during move, then cancel the event
             * @inner
             * @param {object} jqEvent The normalised jQuery event object.
             */
            function touchMove(jqEvent) {

                //As we use Jquery bind for events, we need to target the original event object
                //If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
                var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

                //If we are ending, cancelling, or within the threshold of 2 fingers being released, don't track anything..
                if (phase === PHASE_END || phase === PHASE_CANCEL || inMultiFingerRelease())
                    return;

                var ret,
                    evt = SUPPORTS_TOUCH ? event.touches[0] : event;


                //Update the  finger data 
                var currentFinger = updateFingerData(evt);
                endTime = getTimeStamp();

                if (SUPPORTS_TOUCH) {
                    fingerCount = event.touches.length;
                }

                if (options.hold)
                    clearTimeout(holdTimeout);

                phase = PHASE_MOVE;

                //If we have 2 fingers get Touches distance as well
                if (fingerCount == 2) {

                    //Keep track of the initial pinch distance, so we can calculate the diff later
                    //We do this here as well as the start event, in case they start with 1 finger, and the press 2 fingers
                    if (startTouchesDistance == 0) {
                        //Create second finger if this is the first time...
                        createFingerData(1, event.touches[1]);

                        startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
                    } else {
                        //Else just update the second finger
                        updateFingerData(event.touches[1]);

                        endTouchesDistance = calculateTouchesDistance(fingerData[0].end, fingerData[1].end);
                        pinchDirection = calculatePinchDirection(fingerData[0].end, fingerData[1].end);
                    }


                    pinchZoom = calculatePinchZoom(startTouchesDistance, endTouchesDistance);
                    pinchDistance = Math.abs(startTouchesDistance - endTouchesDistance);
                }


                if ((fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH || hasPinches()) {

                    direction = calculateDirection(currentFinger.start, currentFinger.end);

                    //Check if we need to prevent default event (page scroll / pinch zoom) or not
                    validateDefaultEvent(jqEvent, direction);

                    //Distance and duration are all off the main finger
                    distance = calculateDistance(currentFinger.start, currentFinger.end);
                    duration = calculateDuration();

                    //Cache the maximum distance we made in this direction
                    setMaxDistance(direction, distance);


                    if (options.swipeStatus || options.pinchStatus) {
                        ret = triggerHandler(event, phase);
                    }


                    //If we trigger end events when threshold are met, or trigger events when touch leaves element
                    if (!options.triggerOnTouchEnd || options.triggerOnTouchLeave) {

                        var inBounds = true;

                        //If checking if we leave the element, run the bounds check (we can use touchleave as its not supported on webkit)
                        if (options.triggerOnTouchLeave) {
                            var bounds = getbounds(this);
                            inBounds = isInBounds(currentFinger.end, bounds);
                        }

                        //Trigger end handles as we swipe if thresholds met or if we have left the element if the user has asked to check these..
                        if (!options.triggerOnTouchEnd && inBounds) {
                            phase = getNextPhase(PHASE_MOVE);
                        }
                        //We end if out of bounds here, so set current phase to END, and check if its modified 
                        else if (options.triggerOnTouchLeave && !inBounds) {
                            phase = getNextPhase(PHASE_END);
                        }

                        if (phase == PHASE_CANCEL || phase == PHASE_END) {
                            triggerHandler(event, phase);
                        }
                    }
                } else {
                    phase = PHASE_CANCEL;
                    triggerHandler(event, phase);
                }

                if (ret === false) {
                    phase = PHASE_CANCEL;
                    triggerHandler(event, phase);
                }
            }



            /**
             * Event handler for a touch end event.
             * Calculate the direction and trigger events
             * @inner
             * @param {object} jqEvent The normalised jQuery event object.
             */
            function touchEnd(jqEvent) {
                //As we use Jquery bind for events, we need to target the original event object
                var event = jqEvent.originalEvent;


                //If we are still in a touch with another finger return
                //This allows us to wait a fraction and see if the other finger comes up, if it does within the threshold, then we treat it as a multi release, not a single release.
                if (SUPPORTS_TOUCH) {
                    if (event.touches.length > 0) {
                        startMultiFingerRelease();
                        return true;
                    }
                }

                //If a previous finger has been released, check how long ago, if within the threshold, then assume it was a multifinger release.
                //This is used to allow 2 fingers to release fractionally after each other, whilst maintainig the event as containg 2 fingers, not 1
                if (inMultiFingerRelease()) {
                    fingerCount = previousTouchFingerCount;
                }

                //Set end of swipe
                endTime = getTimeStamp();

                //Get duration incase move was never fired
                duration = calculateDuration();

                //If we trigger handlers at end of swipe OR, we trigger during, but they didnt trigger and we are still in the move phase
                if (didSwipeBackToCancel() || !validateSwipeDistance()) {
                    phase = PHASE_CANCEL;
                    triggerHandler(event, phase);
                } else if (options.triggerOnTouchEnd || (options.triggerOnTouchEnd == false && phase === PHASE_MOVE)) {
                    //call this on jq event so we are cross browser 
                    jqEvent.preventDefault();
                    phase = PHASE_END;
                    triggerHandler(event, phase);
                }
                //Special cases - A tap should always fire on touch end regardless,
                //So here we manually trigger the tap end handler by itself
                //We dont run trigger handler as it will re-trigger events that may have fired already
                else if (!options.triggerOnTouchEnd && hasTap()) {
                    //Trigger the pinch events...
                    phase = PHASE_END;
                    triggerHandlerForGesture(event, phase, TAP);
                } else if (phase === PHASE_MOVE) {
                    phase = PHASE_CANCEL;
                    triggerHandler(event, phase);
                }

                setTouchInProgress(false);

                return null;
            }



            /**
             * Event handler for a touch cancel event.
             * Clears current vars
             * @inner
             */
            function touchCancel() {
                // reset the variables back to default values
                fingerCount = 0;
                endTime = 0;
                startTime = 0;
                startTouchesDistance = 0;
                endTouchesDistance = 0;
                pinchZoom = 1;

                //If we were in progress of tracking a possible multi touch end, then re set it.
                cancelMultiFingerRelease();

                setTouchInProgress(false);
            }


            /**
             * Event handler for a touch leave event.
             * This is only triggered on desktops, in touch we work this out manually
             * as the touchleave event is not supported in webkit
             * @inner
             */
            function touchLeave(jqEvent) {
                var event = jqEvent.originalEvent;

                //If we have the trigger on leave property set....
                if (options.triggerOnTouchLeave) {
                    phase = getNextPhase(PHASE_END);
                    triggerHandler(event, phase);
                }
            }

            /**
             * Removes all listeners that were associated with the plugin
             * @inner
             */
            function removeListeners() {
                $element.unbind(START_EV, touchStart);
                $element.unbind(CANCEL_EV, touchCancel);
                $element.unbind(MOVE_EV, touchMove);
                $element.unbind(END_EV, touchEnd);

                //we only have leave events on desktop, we manually calculate leave on touch as its not supported in webkit
                if (LEAVE_EV) {
                    $element.unbind(LEAVE_EV, touchLeave);
                }

                setTouchInProgress(false);
            }


            /**
             * Checks if the time and distance thresholds have been met, and if so then the appropriate handlers are fired.
             */
            function getNextPhase(currentPhase) {

                var nextPhase = currentPhase;

                // Ensure we have valid swipe (under time and over distance  and check if we are out of bound...)
                var validTime = validateSwipeTime();
                var validDistance = validateSwipeDistance();
                var didCancel = didSwipeBackToCancel();

                //If we have exceeded our time, then cancel 
                if (!validTime || didCancel) {
                    nextPhase = PHASE_CANCEL;
                }
                //Else if we are moving, and have reached distance then end
                else if (validDistance && currentPhase == PHASE_MOVE && (!options.triggerOnTouchEnd || options.triggerOnTouchLeave)) {
                    nextPhase = PHASE_END;
                }
                //Else if we have ended by leaving and didn't reach distance, then cancel
                else if (!validDistance && currentPhase == PHASE_END && options.triggerOnTouchLeave) {
                    nextPhase = PHASE_CANCEL;
                }

                return nextPhase;
            }


            /**
             * Trigger the relevant event handler
             * The handlers are passed the original event, the element that was swiped, and in the case of the catch all handler, the direction that was swiped, "left", "right", "up", or "down"
             * @param {object} event the original event object
             * @param {string} phase the phase of the swipe (start, end cancel etc) {@link $.fn.swipe.phases}
             * @inner
             */
            function triggerHandler(event, phase) {

                var ret = undefined;

                // SWIPE GESTURES
                if (didSwipe() || hasSwipes()) { //hasSwipes as status needs to fire even if swipe is invalid
                    //Trigger the swipe events...
                    ret = triggerHandlerForGesture(event, phase, SWIPE);
                }

                // PINCH GESTURES (if the above didn't cancel)
                else if ((didPinch() || hasPinches()) && ret !== false) {
                    //Trigger the pinch events...
                    ret = triggerHandlerForGesture(event, phase, PINCH);
                }

                // CLICK / TAP (if the above didn't cancel)
                if (didDoubleTap() && ret !== false) {
                    //Trigger the tap events...
                    ret = triggerHandlerForGesture(event, phase, DOUBLE_TAP);
                }

                // CLICK / TAP (if the above didn't cancel)
                else if (didLongTap() && ret !== false) {
                    //Trigger the tap events...
                    ret = triggerHandlerForGesture(event, phase, LONG_TAP);
                }

                // CLICK / TAP (if the above didn't cancel)
                else if (didTap() && ret !== false) {
                    //Trigger the tap event..
                    ret = triggerHandlerForGesture(event, phase, TAP);
                }



                // If we are cancelling the gesture, then manually trigger the reset handler
                if (phase === PHASE_CANCEL) {
                    touchCancel(event);
                }

                // If we are ending the gesture, then manually trigger the reset handler IF all fingers are off
                if (phase === PHASE_END) {
                    //If we support touch, then check that all fingers are off before we cancel
                    if (SUPPORTS_TOUCH) {
                        if (event.touches.length == 0) {
                            touchCancel(event);
                        }
                    } else {
                        touchCancel(event);
                    }
                }

                return ret;
            }



            /**
             * Trigger the relevant event handler
             * The handlers are passed the original event, the element that was swiped, and in the case of the catch all handler, the direction that was swiped, "left", "right", "up", or "down"
             * @param {object} event the original event object
             * @param {string} phase the phase of the swipe (start, end cancel etc) {@link $.fn.swipe.phases}
             * @param {string} gesture the gesture to trigger a handler for : PINCH or SWIPE {@link $.fn.swipe.gestures}
             * @return Boolean False, to indicate that the event should stop propagation, or void.
             * @inner
             */
            function triggerHandlerForGesture(event, phase, gesture) {

                var ret = undefined;

                //SWIPES....
                if (gesture == SWIPE) {
                    //Trigger status every time..

                    //Trigger the event...
                    $element.trigger('swipeStatus', [phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData]);

                    //Fire the callback
                    if (options.swipeStatus) {
                        ret = options.swipeStatus.call($element, event, phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData);
                        //If the status cancels, then dont run the subsequent event handlers..
                        if (ret === false) return false;
                    }




                    if (phase == PHASE_END && validateSwipe()) {
                        //Fire the catch all event
                        $element.trigger('swipe', [direction, distance, duration, fingerCount, fingerData]);

                        //Fire catch all callback
                        if (options.swipe) {
                            ret = options.swipe.call($element, event, direction, distance, duration, fingerCount, fingerData);
                            //If the status cancels, then dont run the subsequent event handlers..
                            if (ret === false) return false;
                        }

                        //trigger direction specific event handlers 
                        switch (direction) {
                            case LEFT:
                                //Trigger the event
                                $element.trigger('swipeLeft', [direction, distance, duration, fingerCount, fingerData]);

                                //Fire the callback
                                if (options.swipeLeft) {
                                    ret = options.swipeLeft.call($element, event, direction, distance, duration, fingerCount, fingerData);
                                }
                                break;

                            case RIGHT:
                                //Trigger the event
                                $element.trigger('swipeRight', [direction, distance, duration, fingerCount, fingerData]);

                                //Fire the callback
                                if (options.swipeRight) {
                                    ret = options.swipeRight.call($element, event, direction, distance, duration, fingerCount, fingerData);
                                }
                                break;

                            case UP:
                                //Trigger the event
                                $element.trigger('swipeUp', [direction, distance, duration, fingerCount, fingerData]);

                                //Fire the callback
                                if (options.swipeUp) {
                                    ret = options.swipeUp.call($element, event, direction, distance, duration, fingerCount, fingerData);
                                }
                                break;

                            case DOWN:
                                //Trigger the event
                                $element.trigger('swipeDown', [direction, distance, duration, fingerCount, fingerData]);

                                //Fire the callback
                                if (options.swipeDown) {
                                    ret = options.swipeDown.call($element, event, direction, distance, duration, fingerCount, fingerData);
                                }
                                break;
                        }
                    }
                }


                //PINCHES....
                if (gesture == PINCH) {
                    //Trigger the event
                    $element.trigger('pinchStatus', [phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                    //Fire the callback
                    if (options.pinchStatus) {
                        ret = options.pinchStatus.call($element, event, phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                        //If the status cancels, then dont run the subsequent event handlers..
                        if (ret === false) return false;
                    }

                    if (phase == PHASE_END && validatePinch()) {

                        switch (pinchDirection) {
                            case IN:
                                //Trigger the event
                                $element.trigger('pinchIn', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                                //Fire the callback
                                if (options.pinchIn) {
                                    ret = options.pinchIn.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                                }
                                break;

                            case OUT:
                                //Trigger the event
                                $element.trigger('pinchOut', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                                //Fire the callback
                                if (options.pinchOut) {
                                    ret = options.pinchOut.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                                }
                                break;
                        }
                    }
                }





                if (gesture == TAP) {
                    if (phase === PHASE_CANCEL || phase === PHASE_END) {


                        //Cancel any existing double tap
                        clearTimeout(singleTapTimeout);
                        //Cancel hold timeout
                        clearTimeout(holdTimeout);

                        //If we are also looking for doubelTaps, wait incase this is one...
                        if (hasDoubleTap() && !inDoubleTap()) {
                            //Cache the time of this tap
                            doubleTapStartTime = getTimeStamp();

                            //Now wait for the double tap timeout, and trigger this single tap
                            //if its not cancelled by a double tap
                            singleTapTimeout = setTimeout($.proxy(function() {
                                doubleTapStartTime = null;
                                //Trigger the event
                                $element.trigger('tap', [event.target]);


                                //Fire the callback
                                if (options.tap) {
                                    ret = options.tap.call($element, event, event.target);
                                }
                            }, this), options.doubleTapThreshold);

                        } else {
                            doubleTapStartTime = null;

                            //Trigger the event
                            $element.trigger('tap', [event.target]);


                            //Fire the callback
                            if (options.tap) {
                                ret = options.tap.call($element, event, event.target);
                            }
                        }
                    }
                } else if (gesture == DOUBLE_TAP) {
                    if (phase === PHASE_CANCEL || phase === PHASE_END) {
                        //Cancel any pending singletap 
                        clearTimeout(singleTapTimeout);
                        doubleTapStartTime = null;

                        //Trigger the event
                        $element.trigger('doubletap', [event.target]);

                        //Fire the callback
                        if (options.doubleTap) {
                            ret = options.doubleTap.call($element, event, event.target);
                        }
                    }
                } else if (gesture == LONG_TAP) {
                    if (phase === PHASE_CANCEL || phase === PHASE_END) {
                        //Cancel any pending singletap (shouldnt be one)
                        clearTimeout(singleTapTimeout);
                        doubleTapStartTime = null;

                        //Trigger the event
                        $element.trigger('longtap', [event.target]);

                        //Fire the callback
                        if (options.longTap) {
                            ret = options.longTap.call($element, event, event.target);
                        }
                    }
                }

                return ret;
            }




            //
            // GESTURE VALIDATION
            //

            /**
             * Checks the user has swipe far enough
             * @return Boolean if <code>threshold</code> has been set, return true if the threshold was met, else false.
             * If no threshold was set, then we return true.
             * @inner
             */
            function validateSwipeDistance() {
                var valid = true;
                //If we made it past the min swipe distance..
                if (options.threshold !== null) {
                    valid = distance >= options.threshold;
                }

                return valid;
            }

            /**
             * Checks the user has swiped back to cancel.
             * @return Boolean if <code>cancelThreshold</code> has been set, return true if the cancelThreshold was met, else false.
             * If no cancelThreshold was set, then we return true.
             * @inner
             */
            function didSwipeBackToCancel() {
                var cancelled = false;
                if (options.cancelThreshold !== null && direction !== null) {
                    cancelled = (getMaxDistance(direction) - distance) >= options.cancelThreshold;
                }

                return cancelled;
            }

            /**
             * Checks the user has pinched far enough
             * @return Boolean if <code>pinchThreshold</code> has been set, return true if the threshold was met, else false.
             * If no threshold was set, then we return true.
             * @inner
             */
            function validatePinchDistance() {
                if (options.pinchThreshold !== null) {
                    return pinchDistance >= options.pinchThreshold;
                }
                return true;
            }

            /**
             * Checks that the time taken to swipe meets the minimum / maximum requirements
             * @return Boolean
             * @inner
             */
            function validateSwipeTime() {
                var result;
                //If no time set, then return true

                if (options.maxTimeThreshold) {
                    if (duration >= options.maxTimeThreshold) {
                        result = false;
                    } else {
                        result = true;
                    }
                } else {
                    result = true;
                }

                return result;
            }


            /**
             * Checks direction of the swipe and the value allowPageScroll to see if we should allow or prevent the default behaviour from occurring.
             * This will essentially allow page scrolling or not when the user is swiping on a touchSwipe object.
             * @param {object} jqEvent The normalised jQuery representation of the event object.
             * @param {string} direction The direction of the event. See {@link $.fn.swipe.directions}
             * @see $.fn.swipe.directions
             * @inner
             */
            function validateDefaultEvent(jqEvent, direction) {
                if (options.allowPageScroll === NONE || hasPinches()) {
                    jqEvent.preventDefault();
                } else {
                    var auto = options.allowPageScroll === AUTO;

                    switch (direction) {
                        case LEFT:
                            if ((options.swipeLeft && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
                                jqEvent.preventDefault();
                            }
                            break;

                        case RIGHT:
                            if ((options.swipeRight && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
                                jqEvent.preventDefault();
                            }
                            break;

                        case UP:
                            if ((options.swipeUp && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
                                jqEvent.preventDefault();
                            }
                            break;

                        case DOWN:
                            if ((options.swipeDown && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
                                jqEvent.preventDefault();
                            }
                            break;
                    }
                }

            }


            // PINCHES
            /**
             * Returns true of the current pinch meets the thresholds
             * @return Boolean
             * @inner
             */
            function validatePinch() {
                var hasCorrectFingerCount = validateFingers();
                var hasEndPoint = validateEndPoint();
                var hasCorrectDistance = validatePinchDistance();
                return hasCorrectFingerCount && hasEndPoint && hasCorrectDistance;

            }

            /**
             * Returns true if any Pinch events have been registered
             * @return Boolean
             * @inner
             */
            function hasPinches() {
                //Enure we dont return 0 or null for false values
                return !!(options.pinchStatus || options.pinchIn || options.pinchOut);
            }

            /**
             * Returns true if we are detecting pinches, and have one
             * @return Boolean
             * @inner
             */
            function didPinch() {
                //Enure we dont return 0 or null for false values
                return !!(validatePinch() && hasPinches());
            }




            // SWIPES
            /**
             * Returns true if the current swipe meets the thresholds
             * @return Boolean
             * @inner
             */
            function validateSwipe() {
                //Check validity of swipe
                var hasValidTime = validateSwipeTime();
                var hasValidDistance = validateSwipeDistance();
                var hasCorrectFingerCount = validateFingers();
                var hasEndPoint = validateEndPoint();
                var didCancel = didSwipeBackToCancel();

                // if the user swiped more than the minimum length, perform the appropriate action
                // hasValidDistance is null when no distance is set 
                var valid = !didCancel && hasEndPoint && hasCorrectFingerCount && hasValidDistance && hasValidTime;

                return valid;
            }

            /**
             * Returns true if any Swipe events have been registered
             * @return Boolean
             * @inner
             */
            function hasSwipes() {
                //Enure we dont return 0 or null for false values
                return !!(options.swipe || options.swipeStatus || options.swipeLeft || options.swipeRight || options.swipeUp || options.swipeDown);
            }


            /**
             * Returns true if we are detecting swipes and have one
             * @return Boolean
             * @inner
             */
            function didSwipe() {
                //Enure we dont return 0 or null for false values
                return !!(validateSwipe() && hasSwipes());
            }

            /**
             * Returns true if we have matched the number of fingers we are looking for
             * @return Boolean
             * @inner
             */
            function validateFingers() {
                //The number of fingers we want were matched, or on desktop we ignore
                return ((fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH);
            }

            /**
             * Returns true if we have an end point for the swipe
             * @return Boolean
             * @inner
             */
            function validateEndPoint() {
                //We have an end value for the finger
                return fingerData[0].end.x !== 0;
            }

            // TAP / CLICK
            /**
             * Returns true if a click / tap events have been registered
             * @return Boolean
             * @inner
             */
            function hasTap() {
                //Enure we dont return 0 or null for false values
                return !!(options.tap);
            }

            /**
             * Returns true if a double tap events have been registered
             * @return Boolean
             * @inner
             */
            function hasDoubleTap() {
                //Enure we dont return 0 or null for false values
                return !!(options.doubleTap);
            }

            /**
             * Returns true if any long tap events have been registered
             * @return Boolean
             * @inner
             */
            function hasLongTap() {
                //Enure we dont return 0 or null for false values
                return !!(options.longTap);
            }

            /**
             * Returns true if we could be in the process of a double tap (one tap has occurred, we are listening for double taps, and the threshold hasn't past.
             * @return Boolean
             * @inner
             */
            function validateDoubleTap() {
                if (doubleTapStartTime == null) {
                    return false;
                }
                var now = getTimeStamp();
                return (hasDoubleTap() && ((now - doubleTapStartTime) <= options.doubleTapThreshold));
            }

            /**
             * Returns true if we could be in the process of a double tap (one tap has occurred, we are listening for double taps, and the threshold hasn't past.
             * @return Boolean
             * @inner
             */
            function inDoubleTap() {
                return validateDoubleTap();
            }


            /**
             * Returns true if we have a valid tap
             * @return Boolean
             * @inner
             */
            function validateTap() {
                return ((fingerCount === 1 || !SUPPORTS_TOUCH) && (isNaN(distance) || distance < options.threshold));
            }

            /**
             * Returns true if we have a valid long tap
             * @return Boolean
             * @inner
             */
            function validateLongTap() {
                //slight threshold on moving finger
                return ((duration > options.longTapThreshold) && (distance < DOUBLE_TAP_THRESHOLD));
            }

            /**
             * Returns true if we are detecting taps and have one
             * @return Boolean
             * @inner
             */
            function didTap() {
                //Enure we dont return 0 or null for false values
                return !!(validateTap() && hasTap());
            }


            /**
             * Returns true if we are detecting double taps and have one
             * @return Boolean
             * @inner
             */
            function didDoubleTap() {
                //Enure we dont return 0 or null for false values
                return !!(validateDoubleTap() && hasDoubleTap());
            }

            /**
             * Returns true if we are detecting long taps and have one
             * @return Boolean
             * @inner
             */
            function didLongTap() {
                //Enure we dont return 0 or null for false values
                return !!(validateLongTap() && hasLongTap());
            }




            // MULTI FINGER TOUCH
            /**
             * Starts tracking the time between 2 finger releases, and keeps track of how many fingers we initially had up
             * @inner
             */
            function startMultiFingerRelease() {
                previousTouchEndTime = getTimeStamp();
                previousTouchFingerCount = event.touches.length + 1;
            }

            /**
             * Cancels the tracking of time between 2 finger releases, and resets counters
             * @inner
             */
            function cancelMultiFingerRelease() {
                previousTouchEndTime = 0;
                previousTouchFingerCount = 0;
            }

            /**
             * Checks if we are in the threshold between 2 fingers being released
             * @return Boolean
             * @inner
             */
            function inMultiFingerRelease() {

                var withinThreshold = false;

                if (previousTouchEndTime) {
                    var diff = getTimeStamp() - previousTouchEndTime
                    if (diff <= options.fingerReleaseThreshold) {
                        withinThreshold = true;
                    }
                }

                return withinThreshold;
            }


            /**
             * gets a data flag to indicate that a touch is in progress
             * @return Boolean
             * @inner
             */
            function getTouchInProgress() {
                //strict equality to ensure only true and false are returned
                return !!($element.data(PLUGIN_NS + '_intouch') === true);
            }

            /**
             * Sets a data flag to indicate that a touch is in progress
             * @param {boolean} val The value to set the property to
             * @inner
             */
            function setTouchInProgress(val) {

                //Add or remove event listeners depending on touch status
                if (val === true) {
                    $element.bind(MOVE_EV, touchMove);
                    $element.bind(END_EV, touchEnd);

                    //we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
                    if (LEAVE_EV) {
                        $element.bind(LEAVE_EV, touchLeave);
                    }
                } else {
                    $element.unbind(MOVE_EV, touchMove, false);
                    $element.unbind(END_EV, touchEnd, false);

                    //we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
                    if (LEAVE_EV) {
                        $element.unbind(LEAVE_EV, touchLeave, false);
                    }
                }


                //strict equality to ensure only true and false can update the value
                $element.data(PLUGIN_NS + '_intouch', val === true);
            }


            /**
             * Creates the finger data for the touch/finger in the event object.
             * @param {int} index The index in the array to store the finger data (usually the order the fingers were pressed)
             * @param {object} evt The event object containing finger data
             * @return finger data object
             * @inner
             */
            function createFingerData(index, evt) {
                var id = evt.identifier !== undefined ? evt.identifier : 0;

                fingerData[index].identifier = id;
                fingerData[index].start.x = fingerData[index].end.x = evt.pageX || evt.clientX;
                fingerData[index].start.y = fingerData[index].end.y = evt.pageY || evt.clientY;

                return fingerData[index];
            }

            /**
             * Updates the finger data for a particular event object
             * @param {object} evt The event object containing the touch/finger data to upadte
             * @return a finger data object.
             * @inner
             */
            function updateFingerData(evt) {

                var id = evt.identifier !== undefined ? evt.identifier : 0;
                var f = getFingerData(id);

                f.end.x = evt.pageX || evt.clientX;
                f.end.y = evt.pageY || evt.clientY;

                return f;
            }

            /**
             * Returns a finger data object by its event ID.
             * Each touch event has an identifier property, which is used
             * to track repeat touches
             * @param {int} id The unique id of the finger in the sequence of touch events.
             * @return a finger data object.
             * @inner
             */
            function getFingerData(id) {
                for (var i = 0; i < fingerData.length; i++) {
                    if (fingerData[i].identifier == id) {
                        return fingerData[i];
                    }
                }
            }

            /**
             * Creats all the finger onjects and returns an array of finger data
             * @return Array of finger objects
             * @inner
             */
            function createAllFingerData() {
                var fingerData = [];
                for (var i = 0; i <= 5; i++) {
                    fingerData.push({
                        start: {
                            x: 0,
                            y: 0
                        },
                        end: {
                            x: 0,
                            y: 0
                        },
                        identifier: 0
                    });
                }

                return fingerData;
            }

            /**
             * Sets the maximum distance swiped in the given direction.
             * If the new value is lower than the current value, the max value is not changed.
             * @param {string}  direction The direction of the swipe
             * @param {int}  distance The distance of the swipe
             * @inner
             */
            function setMaxDistance(direction, distance) {
                distance = Math.max(distance, getMaxDistance(direction));
                maximumsMap[direction].distance = distance;
            }

            /**
             * gets the maximum distance swiped in the given direction.
             * @param {string}  direction The direction of the swipe
             * @return int  The distance of the swipe
             * @inner
             */
            function getMaxDistance(direction) {
                if (maximumsMap[direction]) return maximumsMap[direction].distance;
                return undefined;
            }

            /**
             * Creats a map of directions to maximum swiped values.
             * @return Object A dictionary of maximum values, indexed by direction.
             * @inner
             */
            function createMaximumsData() {
                var maxData = {};
                maxData[LEFT] = createMaximumVO(LEFT);
                maxData[RIGHT] = createMaximumVO(RIGHT);
                maxData[UP] = createMaximumVO(UP);
                maxData[DOWN] = createMaximumVO(DOWN);

                return maxData;
            }

            /**
             * Creates a map maximum swiped values for a given swipe direction
             * @param {string} The direction that these values will be associated with
             * @return Object Maximum values
             * @inner
             */
            function createMaximumVO(dir) {
                return {
                    direction: dir,
                    distance: 0
                }
            }


            //
            // MATHS / UTILS
            //

            /**
             * Calculate the duration of the swipe
             * @return int
             * @inner
             */
            function calculateDuration() {
                return endTime - startTime;
            }

            /**
             * Calculate the distance between 2 touches (pinch)
             * @param {point} startPoint A point object containing x and y co-ordinates
             * @param {point} endPoint A point object containing x and y co-ordinates
             * @return int;
             * @inner
             */
            function calculateTouchesDistance(startPoint, endPoint) {
                var diffX = Math.abs(startPoint.x - endPoint.x);
                var diffY = Math.abs(startPoint.y - endPoint.y);

                return Math.round(Math.sqrt(diffX * diffX + diffY * diffY));
            }

            /**
             * Calculate the zoom factor between the start and end distances
             * @param {int} startDistance Distance (between 2 fingers) the user started pinching at
             * @param {int} endDistance Distance (between 2 fingers) the user ended pinching at
             * @return float The zoom value from 0 to 1.
             * @inner
             */
            function calculatePinchZoom(startDistance, endDistance) {
                var percent = (endDistance / startDistance) * 1;
                return percent.toFixed(2);
            }


            /**
             * Returns the pinch direction, either IN or OUT for the given points
             * @return string Either {@link $.fn.swipe.directions.IN} or {@link $.fn.swipe.directions.OUT}
             * @see $.fn.swipe.directions
             * @inner
             */
            function calculatePinchDirection() {
                if (pinchZoom < 1) {
                    return OUT;
                } else {
                    return IN;
                }
            }


            /**
             * Calculate the length / distance of the swipe
             * @param {point} startPoint A point object containing x and y co-ordinates
             * @param {point} endPoint A point object containing x and y co-ordinates
             * @return int
             * @inner
             */
            function calculateDistance(startPoint, endPoint) {
                return Math.round(Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)));
            }

            /**
             * Calculate the angle of the swipe
             * @param {point} startPoint A point object containing x and y co-ordinates
             * @param {point} endPoint A point object containing x and y co-ordinates
             * @return int
             * @inner
             */
            function calculateAngle(startPoint, endPoint) {
                var x = startPoint.x - endPoint.x;
                var y = endPoint.y - startPoint.y;
                var r = Math.atan2(y, x); //radians
                var angle = Math.round(r * 180 / Math.PI); //degrees

                //ensure value is positive
                if (angle < 0) {
                    angle = 360 - Math.abs(angle);
                }

                return angle;
            }

            /**
             * Calculate the direction of the swipe
             * This will also call calculateAngle to get the latest angle of swipe
             * @param {point} startPoint A point object containing x and y co-ordinates
             * @param {point} endPoint A point object containing x and y co-ordinates
             * @return string Either {@link $.fn.swipe.directions.LEFT} / {@link $.fn.swipe.directions.RIGHT} / {@link $.fn.swipe.directions.DOWN} / {@link $.fn.swipe.directions.UP}
             * @see $.fn.swipe.directions
             * @inner
             */
            function calculateDirection(startPoint, endPoint) {
                var angle = calculateAngle(startPoint, endPoint);

                if ((angle <= 45) && (angle >= 0)) {
                    return LEFT;
                } else if ((angle <= 360) && (angle >= 315)) {
                    return LEFT;
                } else if ((angle >= 135) && (angle <= 225)) {
                    return RIGHT;
                } else if ((angle > 45) && (angle < 135)) {
                    return DOWN;
                } else {
                    return UP;
                }
            }


            /**
             * Returns a MS time stamp of the current time
             * @return int
             * @inner
             */
            function getTimeStamp() {
                var now = new Date();
                return now.getTime();
            }



            /**
             * Returns a bounds object with left, right, top and bottom properties for the element specified.
             * @param {DomNode} The DOM node to get the bounds for.
             */
            function getbounds(el) {
                el = $(el);
                var offset = el.offset();

                var bounds = {
                    left: offset.left,
                    right: offset.left + el.outerWidth(),
                    top: offset.top,
                    bottom: offset.top + el.outerHeight()
                }

                return bounds;
            }


            /**
             * Checks if the point object is in the bounds object.
             * @param {object} point A point object.
             * @param {int} point.x The x value of the point.
             * @param {int} point.y The x value of the point.
             * @param {object} bounds The bounds object to test
             * @param {int} bounds.left The leftmost value
             * @param {int} bounds.right The righttmost value
             * @param {int} bounds.top The topmost value
             * @param {int} bounds.bottom The bottommost value
             */
            function isInBounds(point, bounds) {
                return (point.x > bounds.left && point.x < bounds.right && point.y > bounds.top && point.y < bounds.bottom);
            };


        }




        /**
         * A catch all handler that is triggered for all swipe directions.
         * @name $.fn.swipe#swipe
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */




        /**
         * A handler that is triggered for "left" swipes.
         * @name $.fn.swipe#swipeLeft
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler that is triggered for "right" swipes.
         * @name $.fn.swipe#swipeRight
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler that is triggered for "up" swipes.
         * @name $.fn.swipe#swipeUp
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler that is triggered for "down" swipes.
         * @name $.fn.swipe#swipeDown
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler triggered for every phase of the swipe. This handler is constantly fired for the duration of the pinch.
         * This is triggered regardless of swipe thresholds.
         * @name $.fn.swipe#swipeStatus
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {string} phase The phase of the swipe event. See {@link $.fn.swipe.phases}
         * @param {string} direction The direction the user swiped in. This is null if the user has yet to move. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user swiped. This is 0 if the user has yet to move.
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler triggered for pinch in events.
         * @name $.fn.swipe#pinchIn
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user pinched
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler triggered for pinch out events.
         * @name $.fn.swipe#pinchOut
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user pinched
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A handler triggered for all pinch events. This handler is constantly fired for the duration of the pinch. This is triggered regardless of thresholds.
         * @name $.fn.swipe#pinchStatus
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
         * @param {int} distance The distance the user pinched
         * @param {int} duration The duration of the swipe in milliseconds
         * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
         * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
         * @param {object} fingerData The coordinates of fingers in event
         */

        /**
         * A click handler triggered when a user simply clicks, rather than swipes on an element.
         * This is deprecated since version 1.6.2, any assignment to click will be assigned to the tap handler.
         * You cannot use <code>on</code> to bind to this event as the default jQ <code>click</code> event will be triggered.
         * Use the <code>tap</code> event instead.
         * @name $.fn.swipe#click
         * @event
         * @deprecated since version 1.6.2, please use {@link $.fn.swipe#tap} instead
         * @default null
         * @param {EventObject} event The original event object
         * @param {DomObject} target The element clicked on.
         */

        /**
         * A click / tap handler triggered when a user simply clicks or taps, rather than swipes on an element.
         * @name $.fn.swipe#tap
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {DomObject} target The element clicked on.
         */

        /**
         * A double tap handler triggered when a user double clicks or taps on an element.
         * You can set the time delay for a double tap with the {@link $.fn.swipe.defaults#doubleTapThreshold} property.
         * Note: If you set both <code>doubleTap</code> and <code>tap</code> handlers, the <code>tap</code> event will be delayed by the <code>doubleTapThreshold</code>
         * as the script needs to check if its a double tap.
         * @name $.fn.swipe#doubleTap
         * @see  $.fn.swipe.defaults#doubleTapThreshold
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {DomObject} target The element clicked on.
         */

        /**
         * A long tap handler triggered once a tap has been release if the tap was longer than the longTapThreshold.
         * You can set the time delay for a long tap with the {@link $.fn.swipe.defaults#longTapThreshold} property.
         * @name $.fn.swipe#longTap
         * @see  $.fn.swipe.defaults#longTapThreshold
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {DomObject} target The element clicked on.
         */

        /**
         * A hold tap handler triggered as soon as the longTapThreshold is reached
         * You can set the time delay for a long tap with the {@link $.fn.swipe.defaults#longTapThreshold} property.
         * @name $.fn.swipe#hold
         * @see  $.fn.swipe.defaults#longTapThreshold
         * @event
         * @default null
         * @param {EventObject} event The original event object
         * @param {DomObject} target The element clicked on.
         */

    }));
/*fresco.js*/
/*
 * Fresco - A Beautiful Responsive Lightbox - v1.1.2
 * (c) 2012 Nick Stakenburg
 *
 * http://www.frescojs.com
 *
 * License: http://www.frescojs.com/license
 */;
var Fresco = {
    version: '1.1.2'
};
Fresco.skins = {
    'base': {
        effects: {
            content: {
                show: 0,
                hide: 0,
                sync: true
            },
            loading: {
                show: 0,
                hide: 300,
                delay: 250
            },
            thumbnails: {
                show: 200,
                slide: 0,
                load: 300,
                delay: 250
            },
            window: {
                show: 440,
                hide: 300,
                position: 180
            },
            ui: {
                show: 250,
                hide: 200,
                delay: 3000
            }
        },
        touchEffects: {
            ui: {
                show: 175,
                hide: 175,
                delay: 5000
            }
        },
        fit: 'both',
        keyboard: {
            left: true,
            right: true,
            esc: true
        },
        loop: false,
        onClick: 'previous-next',
        overlay: {
            close: true
        },
        position: false,
        preload: true,
        spacing: {
            both: {
                horizontal: 20,
                vertical: 20
            },
            width: {
                horizontal: 0,
                vertical: 0
            },
            height: {
                horizontal: 0,
                vertical: 0
            },
            none: {
                horizontal: 0,
                vertical: 0
            }
        },
        thumbnails: true,
        ui: 'outside',
        vimeo: {
            autoplay: 1,
            title: 1,
            byline: 1,
            portrait: 0,
            loop: 0
        },
        youtube: {
            autoplay: 1,
            controls: 1,
            enablejsapi: 1,
            hd: 1,
            iv_load_policy: 3,
            loop: 0,
            modestbranding: 1,
            rel: 0
        },
        initialTypeOptions: {
            'image': {},
            'youtube': {
                width: 640,
                height: 360
            },
            'vimeo': {
                width: 640,
                height: 360
            }
        }
    },
    'reset': {},
    'fresco': {},
    'IE6': {}
};
(function ($) {
    (function () {
        function wheel(a) {
            var b;
            if (a.originalEvent.wheelDelta) {
                b = a.originalEvent.wheelDelta / 120
            } else {
                if (a.originalEvent.detail) {
                    b = -a.originalEvent.detail / 3
                }
            }
            if (!b) {
                return
            }
            var c = $.Event("fresco:mousewheel");
            $(a.target).trigger(c, b);
            if (c.isPropagationStopped()) {
                a.stopPropagation()
            }
            if (c.isDefaultPrevented()) {
                a.preventDefault()
            }
        }
        $(document.documentElement).bind("mousewheel DOMMouseScroll", wheel)
    })();
    var q = Array.prototype.slice;
    var _ = {
        isElement: function (a) {
            return a && a.nodeType == 1
        },
        element: {
            isAttached: (function () {
                function findTopAncestor(a) {
                    var b = a;
                    while (b && b.parentNode) {
                        b = b.parentNode
                    }
                    return b
                }
                return function (a) {
                    var b = findTopAncestor(a);
                    return !!(b && b.body)
                }
            })()
        }
    };
    var r = (function (c) {
        function getVersion(a) {
            var b = new RegExp(a + "([\\d.]+)").exec(c);
            return b ? parseFloat(b[1]) : true
        }
        return {
            IE: !! (window.attachEvent && c.indexOf("Opera") === -1) && getVersion("MSIE "),
            Opera: c.indexOf("Opera") > -1 && (( !! window.opera && opera.version && parseFloat(opera.version())) || 7.55),
            WebKit: c.indexOf("AppleWebKit/") > -1 && getVersion("AppleWebKit/"),
            Gecko: c.indexOf("Gecko") > -1 && c.indexOf("KHTML") === -1 && getVersion("rv:"),
            MobileSafari: !! c.match(/Apple.*Mobile.*Safari/),
            Chrome: c.indexOf("Chrome") > -1 && getVersion("Chrome/"),
            Android: c.indexOf("Android") > -1 && getVersion("Android "),
            IEMobile: c.indexOf("IEMobile") > -1 && getVersion("IEMobile/")
        }
    })(navigator.userAgent);

    function px(a) {
        var b = {};
        for (var c in a) {
            b[c] = a[c] + "px"
        }
        return b
    }
    var t = {};
    (function () {
        var c = {};
        $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, a) {
            c[a] = function (p) {
                return Math.pow(p, i + 2)
            }
        });
        $.extend(c, {
            Sine: function (p) {
                return 1 - Math.cos(p * Math.PI / 2)
            }
        });
        $.each(c, function (a, b) {
            t["easeIn" + a] = b;
            t["easeOut" + a] = function (p) {
                return 1 - b(1 - p)
            };
            t["easeInOut" + a] = function (p) {
                return p < 0.5 ? b(p * 2) / 2 : 1 - b(p * -2 + 2) / 2
            }
        });
        $.each(t, function (a, b) {
            if (!$.easing[a]) {
                $.easing[a] = b
            }
        })
    })();

    function sfcc(c) {
        return String.fromCharCode.apply(String, c.split(","))
    }
    function warn(a) {
        if ( !! window.console) {
            console[console.warn ? "warn" : "log"](a)
        }
    }
    var u = {
        scripts: {
            jQuery: {
                required: "1.4.4",
                available: window.jQuery && jQuery.fn.jquery
            }
        },
        check: (function () {
            var c = /^(\d+(\.?\d+){0,3})([A-Za-z_-]+[A-Za-z0-9]+)?/;

            function convertVersionString(a) {
                var b = a.match(c),
                    nA = b && b[1] && b[1].split(".") || [],
                    v = 0;
                for (var i = 0, l = nA.length; i < l; i++) {
                    v += parseInt(nA[i] * Math.pow(10, 6 - i * 2))
                }
                return b && b[3] ? v - 1 : v
            }
            return function require(a) {
                if (!this.scripts[a].available || (convertVersionString(this.scripts[a].available) < convertVersionString(this.scripts[a].required)) && !this.scripts[a].notified) {
                    this.scripts[a].notified = true;
                    warn("Fresco requires " + a + " >= " + this.scripts[a].required)
                }
            }
        })()
    };
    var w = (function () {
        return {
            canvas: (function () {
                var a = document.createElement("canvas");
                return !!(a.getContext && a.getContext("2d"))
            })(),
            touch: (function () {
                try {
                    return !!(("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch)
                } catch (e) {
                    return false
                }
            })()
        }
    })();
    w.mobileTouch = w.touch && (r.MobileSafari || r.Android || r.IEMobile || !/^(Win|Mac|Linux)/.test(navigator.platform));
    var A;
    (function ($) {
        var e = ".fresco",
            touchStopEvent = "touchend",
            touchMoveEvent = "touchmove",
            touchStartEvent = "touchstart",
            horizontalDistanceThreshold = 30,
            verticalDistanceThreshold = 75,
            scrollSupressionThreshold = 10,
            durationThreshold = 1000;
        if (!w.mobileTouch) {
            A = function () {};
            return
        }
        A = function (a, b, c) {
            if (c) {
                $(a).data("stopPropagation" + e, true)
            }
            if (b) {
                swipe(a, b)
            }
        };

        function swipe(a, b) {
            if (!$(a).data("fresco-swipe" + e)) {
                $(a).data("fresco-swipe", b)
            }
            addSwipe(a)
        }
        function addSwipe(a) {
            $(a).bind(touchStartEvent, touchStart)
        }
        function touchStart(c) {
            if ($(this).hasClass("fr-prevent-swipe")) {
                return
            }
            var d = new Date().getTime(),
                data = c.originalEvent.touches ? c.originalEvent.touches[0] : c,
                $this = $(this).bind(touchMoveEvent, moveHandler).one(touchStopEvent, touchEnded),
                pageX = data.pageX,
                pageY = data.pageY,
                newPageX, newPageY, newTime;
            if ($this.data("stopPropagation" + e)) {
                c.stopImmediatePropagation()
            }
            function touchEnded(a) {
                $this.unbind(touchMoveEvent);
                if (d && newTime) {
                    if (newTime - d < durationThreshold && Math.abs(pageX - newPageX) > horizontalDistanceThreshold && Math.abs(pageY - newPageY) < verticalDistanceThreshold) {
                        var b = $this.data("fresco-swipe");
                        if (pageX > newPageX) {
                            if (b) {
                                b("left")
                            }
                        } else {
                            if (b) {
                                b("right")
                            }
                        }
                    }
                }
                d = newTime = null
            }
            function moveHandler(a) {
                if (d) {
                    data = a.originalEvent.touches ? a.originalEvent.touches[0] : a;
                    newTime = new Date().getTime();
                    newPageX = data.pageX;
                    newPageY = data.pageY;
                    if (Math.abs(pageX - newPageX) > scrollSupressionThreshold) {
                        a.preventDefault()
                    }
                }
            }
        }
    })(jQuery);

    function deepExtend(a, b) {
        for (var c in b) {
            if (b[c] && b[c].constructor && b[c].constructor === Object) {
                a[c] = $.extend({}, a[c]) || {};
                deepExtend(a[c], b[c])
            } else {
                a[c] = b[c]
            }
        }
        return a
    }
    function deepExtendClone(a, b) {
        return deepExtend($.extend({}, a), b)
    }
    var B = (function () {
        var j = Fresco.skins.base,
            RESET = deepExtendClone(j, Fresco.skins.reset);

        function create(d, e, f) {
            d = d || {};
            f = f || {};
            d.skin = d.skin || (Fresco.skins[C.defaultSkin] ? C.defaultSkin : "fresco");
            if (r.IE && r.IE < 7) {
                d.skin = "IE6"
            }
            var g = d.skin ? $.extend({}, Fresco.skins[d.skin] || Fresco.skins[C.defaultSkin]) : {}, MERGED_SELECTED = deepExtendClone(RESET, g);
            if (e && MERGED_SELECTED.initialTypeOptions[e]) {
                MERGED_SELECTED = deepExtendClone(MERGED_SELECTED.initialTypeOptions[e], MERGED_SELECTED);
                delete MERGED_SELECTED.initialTypeOptions
            }
            var h = deepExtendClone(MERGED_SELECTED, d);
            if (1 != 0 + 1) {
                $.extend(h, {
                    fit: "both",
                    ui: "outside",
                    thumbnails: false
                })
            }
            if (h.fit) {
                if ($.type(h.fit) == "boolean") {
                    h.fit = "both"
                }
            } else {
                h.fit = "none"
            }
            if (h.controls) {
                if ($.type(h.controls) == "string") {
                    h.controls = deepExtendClone(MERGED_SELECTED.controls || RESET.controls || j.controls, {
                        type: h.controls
                    })
                } else {
                    h.controls = deepExtendClone(j.controls, h.controls)
                }
            }
            if (!h.effects || (w.mobileTouch && !h.touchEffects)) {
                h.effects = {};
                $.each(j.effects, function (b, c) {
                    $.each((h.effects[b] = $.extend({}, c)), function (a) {
                        h.effects[b][a] = 0
                    })
                })
            } else {
                if (w.mobileTouch && h.touchEffects) {
                    h.effects = deepExtendClone(h.effects, h.touchEffects)
                }
            }
            if (r.IE && r.IE < 9) {
                deepExtend(h.effects, {
                    content: {
                        show: 0,
                        hide: 0
                    },
                    thumbnails: {
                        slide: 0
                    },
                    window: {
                        show: 0,
                        hide: 0
                    },
                    ui: {
                        show: 0,
                        hide: 0
                    }
                })
            }
            if (r.IE && r.IE < 7) {
                h.thumbnails = false
            }
            if (h.keyboard && e != "image") {
                $.extend(h.keyboard, {
                    left: false,
                    right: false
                })
            }
            if (!h.thumbnail && $.type(h.thumbnail) != "boolean") {
                var i = false;
                switch (e) {
                    case "youtube":
                        i = "http://img.youtube.com/vi/" + f.id + "/0.jpg";
                        break;
                    case "image":
                        i = true;
                        break
                }
                h.thumbnail = i
            }
            return h
        }
        return {
            create: create
        }
    })();

    function Overlay() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(Overlay.prototype, {
        initialize: function (a) {
            this.options = $.extend({
                className: "fr-overlay"
            }, arguments[1] || {});
            this.Window = a;
            this.build();
            if (r.IE && r.IE < 9) {
                $(window).bind("resize", $.proxy(function () {
                    if (this.element && this.element.is(":visible")) {
                        this.max()
                    }
                }, this))
            }
            this.draw()
        },
        build: function () {
            this.element = $("<div>").addClass(this.options.className).append(this.background = $("<div>").addClass(this.options.className + "-background"));
            $(document.body).prepend(this.element);
            if (r.IE && r.IE < 7) {
                this.element.css({
                    position: "absolute"
                });
                var s = this.element[0].style;
                s.setExpression("top", "((!!window.jQuery ? jQuery(window).scrollTop() : 0) + 'px')");
                s.setExpression("left", "((!!window.jQuery ? jQuery(window).scrollLeft() : 0) + 'px')")
            }
            this.element.hide();
            this.element.bind("click", $.proxy(function () {
                if (this.Window.view && this.Window.view.options && this.Window.view.options.overlay && !this.Window.view.options.overlay.close) {
                    return
                }
                this.Window.hide()
            }, this));
            this.element.bind("fresco:mousewheel", function (a) {
                a.preventDefault()
            })
        },
        setSkin: function (a) {
            this.element[0].className = this.options.className + " " + this.options.className + "-" + a
        },
        setOptions: function (a) {
            this.options = a;
            this.draw()
        },
        draw: function () {
            this.max()
        },
        show: function (a) {
            this.max();
            this.element.stop(1, 0);
            var b = H._frames && H._frames[H._position - 1];
            this.setOpacity(1, b ? b.view.options.effects.window.show : 0, a);
            return this
        },
        hide: function (a) {
            var b = H._frames && H._frames[H._position - 1];
            this.element.stop(1, 0).fadeOut(b ? b.view.options.effects.window.hide || 0 : 0, "easeInOutSine", a);
            return this
        },
        setOpacity: function (a, b, c) {
            this.element.fadeTo(b || 0, a, "easeInOutSine", c)
        },
        getScrollDimensions: function () {
            var a = {};
            $.each(["width", "height"], function (i, d) {
                var D = d.substr(0, 1).toUpperCase() + d.substr(1),
                    ddE = document.documentElement;
                a[d] = (r.IE ? Math.max(ddE["offset" + D], ddE["scroll" + D]) : r.WebKit ? document.body["scroll" + D] : ddE["scroll" + D]) || 0
            });
            return a
        },
        max: function () {
            if ((r.MobileSafari && (r.WebKit && r.WebKit < 533.18))) {
                this.element.css(px(getScrollDimensions()))
            }
            if (r.IE) {
                this.element.css(px({
                    height: $(window).height(),
                    width: $(window).width()
                }))
            }
        }
    });

    function Loading() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(Loading.prototype, {
        initialize: function (a) {
            this.Window = a;
            this.options = $.extend({
                thumbnails: J,
                className: "fr-loading"
            }, arguments[1] || {});
            if (this.options.thumbnails) {
                this.thumbnails = this.options.thumbnails
            }
            this.build();
            this.startObserving()
        },
        build: function () {
            $(document.body).append(this.element = $("<div>").addClass(this.options.className).hide().append(this.offset = $("<div>").addClass(this.options.className + "-offset").append($("<div>").addClass(this.options.className + "-background")).append($("<div>").addClass(this.options.className + "-icon"))));
            if (r.IE && r.IE < 7) {
                var s = this.element[0].style;
                s.position = "absolute";
                s.setExpression("top", "((!!window.jQuery ? jQuery(window).scrollTop() + (.5 * jQuery(window).height()) : 0) + 'px')");
                s.setExpression("left", "((!!window.jQuery ? jQuery(window).scrollLeft() + (.5 * jQuery(window).width()): 0) + 'px')")
            }
        },
        setSkin: function (a) {
            this.element[0].className = this.options.className + " " + this.options.className + "-" + a
        },
        startObserving: function () {
            this.element.bind("click", $.proxy(function (a) {
                this.Window.hide()
            }, this))
        },
        start: function (a) {
            this.center();
            var b = H._frames && H._frames[H._position - 1];
            this.element.stop(1, 0).fadeTo(b ? b.view.options.effects.loading.show : 0, 1, a)
        },
        stop: function (a, b) {
            var c = H._frames && H._frames[H._position - 1];
            this.element.stop(1, 0).delay(b ? 0 : c ? c.view.options.effects.loading.dela : 0).fadeOut(c.view.options.effects.loading.hide, a)
        },
        center: function () {
            var a = 0;
            if (this.thumbnails) {
                this.thumbnails.updateVars();
                var a = this.thumbnails._vars.thumbnails.height
            }
            this.offset.css({
                "margin-top": (this.Window.view.options.thumbnails ? (a * -0.5) : 0) + "px"
            })
        }
    });
    var C = {
        defaultSkin: "fresco",
        initialize: function () {
            this.queues = [];
            this.queues.showhide = $({});
            this.queues.update = $({});
            this.states = new States();
            this.timeouts = new Timeouts();
            this.build();
            this.startObserving();
            this.setSkin(this.defaultSkin)
        },
        build: function () {
            this.overlay = new Overlay(this);
            $(document.body).prepend(this.element = $("<div>").addClass("fr-window").append(this.bubble = $("<div>").addClass("fr-bubble").hide().append(this.frames = $("<div>").addClass("fr-frames")).append(this.thumbnails = $("<div>").addClass("fr-thumbnails"))));
            this.loading = new Loading(this);
            if (r.IE && r.IE < 7) {
                var s = this.element[0].style;
                s.position = "absolute";
                s.setExpression("top", "((!!window.jQuery ? jQuery(window).scrollTop() : 0) + 'px')");
                s.setExpression("left", "((!!window.jQuery ? jQuery(window).scrollLeft() : 0) + 'px')")
            }
            if (r.IE) {
                if (r.IE < 9) {
                    this.element.addClass("fr-oldIE")
                }
                for (var i = 6; i <= 9; i++) {
                    if (r.IE < i) {
                        this.element.addClass("fr-ltIE" + i)
                    }
                }
            }
            if (w.touch) {
                this.element.addClass("fr-touch-enabled")
            }
            if (w.mobileTouch) {
                this.element.addClass("fr-mobile-touch-enabled")
            }
            this.element.data("class-skinless", this.element[0].className);
            J.initialize(this.element);
            H.initialize(this.element);
            G.initialize();
            this.element.hide()
        },
        setSkin: function (a, b) {
            b = b || {};
            if (a) {
                b.skin = a
            }
            this.overlay.setSkin(a);
            var c = this.element.data("class-skinless");
            this.element[0].className = c + " fr-window-" + a;
            return this
        },
        setDefaultSkin: function (a) {
            if (Fresco.skins[a]) {
                this.defaultSkin = a
            }
        },
        startObserving: function () {
            $(document.documentElement).delegate(".fresco[href]", "click", function (a, b) {
                a.stopPropagation();
                a.preventDefault();
                var b = a.currentTarget;
                H.setXY({
                    x: a.pageX,
                    y: a.pageY
                });
                K.show(b)
            });
            $(document.documentElement).bind("click", function (a) {
                H.setXY({
                    x: a.pageX,
                    y: a.pageY
                })
            });
            this.element.delegate(".fr-ui-spacer, .fr-box-spacer", "click", $.proxy(function (a) {
                a.stopPropagation()
            }, this));
            $(document.documentElement).delegate(".fr-overlay, .fr-ui, .fr-frame, .fr-bubble", "click", $.proxy(function (a) {
                if (C.view && C.view.options && C.view.options.overlay && !C.view.options.overlay.close) {
                    return
                }
                a.preventDefault();
                a.stopPropagation();
                C.hide()
            }, this));
            this.element.bind("fresco:mousewheel", function (a) {
                a.preventDefault()
            })
        },
        load: function (b, c) {
            var d = $.extend({}, arguments[2] || {});
            this._reset();
            var e = false;
            $.each(b, function (i, a) {
                if (!a.options.thumbnail) {
                    e = true;
                    return false
                }
            });
            if (e) {
                $.each(b, function (i, a) {
                    a.options.thumbnail = false;
                    a.options.thumbnails = false
                })
            }
            if (b.length < 2) {
                var f = b[0].options.onClick;
                if (f && f != "close") {
                    b[0].options.onClick = "close"
                }
            }
            this.views = b;
            J.load(b);
            H.load(b);
            if (c) {
                this.setPosition(c, function () {
                    if (d.callback) {
                        d.callback()
                    }
                })
            }
        },
        hideOverlapping: function () {
            if (this.states.get("overlapping")) {
                return
            }
            var c = $("embed, object, select");
            var d = [];
            c.each(function (i, a) {
                var b;
                if ($(a).is("object, embed") && ((b = $(a).find('param[name="wmode"]')[0]) && b.value && b.value.toLowerCase() == "transparent") || $(a).is("[wmode='transparent']")) {
                    return
                }
                d.push({
                    element: a,
                    visibility: $(a).css("visibility")
                })
            });
            $.each(d, function (i, a) {
                $(a.element).css({
                    visibility: "hidden"
                })
            });
            this.states.set("overlapping", d)
        },
        restoreOverlapping: function () {
            var b = this.states.get("overlapping");
            if (b && b.length > 0) {
                $.each(b, function (i, a) {
                    $(a.element).css({
                        visibility: a.visibility
                    })
                })
            }
            this.states.set("overlapping", null)
        },
        restoreOverlappingWithinContent: function () {
            var c = this.states.get("overlapping");
            if (!c) {
                return
            }
            $.each(c, $.proxy(function (i, a) {
                var b;
                if ((b = $(a.element).closest(".fs-content")[0]) && b == this.content[0]) {
                    $(a.element).css({
                        visibility: a.visibility
                    })
                }
            }, this))
        },
        show: (function () {
            var e = function () {};
            return function (b) {
                var c = H._frames && H._frames[H._position - 1],
                    shq = this.queues.showhide,
                    duration = (c && c.view.options.effects.window.hide) || 0;
                if (this.states.get("visible")) {
                    if ($.type(b) == "function") {
                        b()
                    }
                    return
                }
                this.states.set("visible", true);
                shq.queue([]);
                this.hideOverlapping();
                if (c && $.type(c.view.options.onShow) == "function") {
                    c.view.options.onShow.call(Fresco)
                }
                var d = 2;
                shq.queue($.proxy(function (a) {
                    if (c.view.options.overlay) {
                        this.overlay.show($.proxy(function () {
                            if (--d < 1) {
                                a()
                            }
                        }, this))
                    }
                    this.timeouts.set("show-window", $.proxy(function () {
                        this._show(function () {
                            if (--d < 1) {
                                a()
                            }
                        })
                    }, this), duration > 1 ? Math.min(duration * 0.5, 50) : 1)
                }, this));
                e();
                shq.queue($.proxy(function (a) {
                    G.enable();
                    a()
                }, this));
                if ($.type(b) == "function") {
                    shq.queue($.proxy(function (a) {
                        b();
                        a()
                    }), this)
                }
            }
        })(),
        _show: function (a) {
            H.resize();
            this.element.show();
            this.bubble.stop(true);
            var b = H._frames && H._frames[H._position - 1];
            this.setOpacity(1, b.view.options.effects.window.show, $.proxy(function () {
                if (a) {
                    a()
                }
            }, this));
            return this
        },
        hide: function () {
            var c = H._frames && H._frames[H._position - 1],
                shq = this.queues.showhide;
            shq.queue([]);
            this.stopQueues();
            this.loading.stop(null, true);
            var d = 1;
            shq.queue($.proxy(function (a) {
                var b = c.view.options.effects.window.hide || 0;
                this.bubble.stop(true, true).fadeOut(b, "easeInSine", $.proxy(function () {
                    this.element.hide();
                    H.hideAll();
                    if (--d < 1) {
                        this._hide();
                        a()
                    }
                }, this));
                if (c.view.options.overlay) {
                    d++;
                    this.timeouts.set("hide-overlay", $.proxy(function () {
                        this.overlay.hide($.proxy(function () {
                            if (--d < 1) {
                                this._hide();
                                a()
                            }
                        }, this))
                    }, this), b > 1 ? Math.min(b * 0.5, 150) : 1)
                }
            }, this))
        },
        _hide: function () {
            this.states.set("visible", false);
            this.restoreOverlapping();
            G.disable();
            var a = H._frames && H._frames[H._position - 1];
            if (a && $.type(a.view.options.afterHide) == "function") {
                a.view.options.afterHide.call(Fresco)
            }
            this.timeouts.clear();
            this._reset()
        },
        _reset: function () {
            var a = $.extend({
                after: false,
                before: false
            }, arguments[0] || {});
            if ($.type(a.before) == "function") {
                a.before.call(Fresco)
            }
            this.stopQueues();
            this.timeouts.clear();
            this.position = -1;
            this._pinchZoomed = false;
            C.states.set("_m", false);
            if (this._m) {
                $(this._m).stop().remove();
                this._m = null
            }
            if (this._s) {
                $(this._s).stop().remove();
                this._s = null
            }
            if ($.type(a.after) == "function") {
                a.after.call(Fresco)
            }
        },
        setOpacity: function (a, b, c) {
            this.bubble.stop(true, true).fadeTo(b || 0, a || 1, "easeOutSine", c)
        },
        stopQueues: function () {
            this.queues.update.queue([]);
            this.bubble.stop(true)
        },
        setPosition: function (a, b) {
            if (!a || this.position == a) {
                return
            }
            this.timeouts.clear("_m");
            var c = this._position;
            this.position = a;
            this.view = this.views[a - 1];
            this.setSkin(this.view.options && this.view.options.skin, this.view.options);
            H.setPosition(a, b)
        }
    };
    var E = {
        viewport: function () {
            var a = {
                height: $(window).height(),
                width: $(window).width()
            };
            if (r.MobileSafari) {
                a.width = window.innerWidth;
                a.height = window.innerHeight
            }
            return a
        }
    };
    var F = {
        within: function (a) {
            var b = $.extend({
                fit: "both",
                ui: "inside"
            }, arguments[1] || {});
            if (!b.bounds) {
                b.bounds = $.extend({}, H._boxDimensions)
            }
            var c = b.bounds,
                size = $.extend({}, a),
                f = 1,
                attempts = 5;
            if (b.border) {
                c.width -= 2 * b.border;
                c.height -= 2 * b.border
            }
            var d = {
                height: true,
                width: true
            };
            switch (b.fit) {
                case "none":
                    d = {};
                case "width":
                case "height":
                    d = {};
                    d[b.fit] = true;
                    break
            }
            while (attempts > 0 && ((d.width && size.width > c.width) || (d.height && size.height > c.height))) {
                var e = 1,
                    scaleY = 1;
                if (d.width && size.width > c.width) {
                    e = (c.width / size.width)
                }
                if (d.height && size.height > c.height) {
                    scaleY = (c.height / size.height)
                }
                var f = Math.min(e, scaleY);
                size = {
                    width: Math.round(a.width * f),
                    height: Math.round(a.height * f)
                };
                attempts--
            }
            size.width = Math.max(size.width, 0);
            size.height = Math.max(size.height, 0);
            return size
        }
    };
    var G = {
        enabled: false,
        keyCode: {
            left: 37,
            right: 39,
            esc: 27
        },
        enable: function () {
            this.fetchOptions()
        },
        disable: function () {
            this.enabled = false
        },
        initialize: function () {
            this.fetchOptions();
            $(document).keydown($.proxy(this.onkeydown, this)).keyup($.proxy(this.onkeyup, this));
            G.disable()
        },
        fetchOptions: function () {
            var a = H._frames && H._frames[H._position - 1];
            this.enabled = a && a.view.options.keyboard
        },
        onkeydown: function (a) {
            if (!this.enabled || !C.element.is(":visible")) {
                return
            }
            var b = this.getKeyByKeyCode(a.keyCode);
            if (!b || (b && this.enabled && !this.enabled[b])) {
                return
            }
            a.preventDefault();
            a.stopPropagation();
            switch (b) {
                case "left":
                    H.previous();
                    break;
                case "right":
                    H.next();
                    break
            }
        },
        onkeyup: function (a) {
            if (!this.enabled || !C.element.is(":visible")) {
                return
            }
            var b = this.getKeyByKeyCode(a.keyCode);
            if (!b || (b && this.enabled && !this.enabled[b])) {
                return
            }
            switch (b) {
                case "esc":
                    C.hide();
                    break
            }
        },
        getKeyByKeyCode: function (a) {
            for (var b in this.keyCode) {
                if (this.keyCode[b] == a) {
                    return b
                }
            }
            return null
        }
    };
    var H = {
        initialize: function (a) {
            if (!a) {
                return
            }
            this.element = a;
            this._position = -1;
            this._visible = [];
            this._sideWidth = 0;
            this._tracking = [];
            this.queues = [];
            this.queues.sides = $({});
            this.frames = this.element.find(".fr-frames:first");
            this.uis = this.element.find(".fr-uis:first");
            this.updateDimensions();
            this.startObserving()
        },
        startObserving: function () {
            $(window).bind("resize orientationchange", $.proxy(function () {
                if (C.states.get("visible")) {
                    this.resize()
                }
            }, this));
            this.frames.delegate(".fr-side", "click", $.proxy(function (a) {
                a.stopPropagation();
                this.setXY({
                    x: a.pageX,
                    y: a.pageY
                });
                var b = $(a.target).closest(".fr-side").data("side");
                this[b]()
            }, this))
        },
        load: function (b) {
            if (this._frames) {
                $.each(this._frames, function (i, a) {
                    a.remove()
                });
                this._frames = null;
                this._tracking = []
            }
            this._sideWidth = 0;
            this._frames = [];
            $.each(b, $.proxy(function (i, a) {
                this._frames.push(new Frame(a, i + 1))
            }, this));
            this.updateDimensions()
        },
        handleTracking: function (a) {
            if (r.IE && r.IE < 9) {
                this.setXY({
                    x: a.pageX,
                    y: a.pageY
                });
                this.position()
            } else {
                this._tracking_timer = setTimeout($.proxy(function () {
                    this.setXY({
                        x: a.pageX,
                        y: a.pageY
                    });
                    this.position()
                }, this), 30)
            }
        },
        clearTrackingTimer: function () {
            if (this._tracking_timer) {
                clearTimeout(this._tracking_timer);
                this._tracking_timer = null
            }
        },
        startTracking: function () {
            if (w.mobileTouch || this._handleTracking) {
                return
            }
            this.element.bind("mousemove", this._handleTracking = $.proxy(this.handleTracking, this))
        },
        stopTracking: function () {
            if (w.mobileTouch || !this._handleTracking) {
                return
            }
            this.element.unbind("mousemove", this._handleTracking);
            this._handleTracking = null;
            this.clearTrackingTimer()
        },
        setPosition: function (a, b) {
            this.clearLoads();
            this._position = a;
            var c = this._frames[a - 1];
            this.frames.append(c.frame);
            J.setPosition(a);
            c.load($.proxy(function () {
                this.show(a, function () {
                    if (b) {
                        b()
                    }
                    if ($.type(c.view.options.afterPosition) == "function") {
                        c.view.options.afterPosition.call(Fresco, a)
                    }
                })
            }, this));
            this.preloadSurroundingImages()
        },
        preloadSurroundingImages: function () {
            if (!(this._frames && this._frames.length > 1)) {
                return
            }
            var c = this.getSurroundingIndexes(),
                previous = c.previous,
                next = c.next,
                images = {
                    previous: previous != this._position && this._frames[previous - 1].view,
                    next: next != this._position && this._frames[next - 1].view
                };
            if (this._position == 1) {
                images.previous = null
            }
            if (this._position == this._frames.length) {
                images.next = null
            }
            $.each(images, function (a, b) {
                if (b && b.type == "image" && b.options.preload) {
                    I.preload(images[a].url, {
                        once: true
                    })
                }
            })
        },
        getSurroundingIndexes: function () {
            if (!this._frames) {
                return {}
            }
            var a = this._position,
                length = this._frames.length;
            var b = (a <= 1) ? length : a - 1,
                next = (a >= length) ? 1 : a + 1;
            return {
                previous: b,
                next: next
            }
        },
        mayPrevious: function () {
            var a = H._frames && H._frames[H._position - 1];
            return (a && a.view.options.loop && this._frames && this._frames.length > 1) || this._position != 1
        },
        previous: function (a) {
            if (a || this.mayPrevious()) {
                C.setPosition(this.getSurroundingIndexes().previous)
            }
        },
        mayNext: function () {
            var a = H._frames && H._frames[H._position - 1];
            return (a && a.view.options.loop && this._frames && this._frames.length > 1) || (this._frames && this._frames.length > 1 && this.getSurroundingIndexes().next != 1)
        },
        next: function (a) {
            if (a || this.mayNext()) {
                C.setPosition(this.getSurroundingIndexes().next)
            }
        },
        setVisible: function (a) {
            if (!this.isVisible(a)) {
                this._visible.push(a)
            }
        },
        setHidden: function (b) {
            this._visible = $.grep(this._visible, function (a) {
                return a != b
            })
        },
        isVisible: function (a) {
            return $.inArray(a, this._visible) > -1
        },
        resize: function () {
            if (!(r.IE && r.IE < 7)) {
                J.resize()
            }
            this.updateDimensions();
            this.frames.css(px(this._dimensions));
            $.each(this._frames, function (i, a) {
                a.resize()
            })
        },
        position: function () {
            if (this._tracking.length < 1) {
                return
            }
            $.each(this._tracking, function (i, a) {
                a.position()
            })
        },
        setXY: function (a) {
            a.y -= $(window).scrollTop();
            a.x -= $(window).scrollLeft();
            var b = {
                y: Math.min(Math.max(a.y / this._dimensions.height, 0), 1),
                x: Math.min(Math.max(a.x / this._dimensions.width, 0), 1)
            };
            var c = 20;
            var d = {
                x: "width",
                y: "height"
            };
            var e = {};
            $.each("x y".split(" "), $.proxy(function (i, z) {
                e[z] = Math.min(Math.max(c / this._dimensions[d[z]], 0), 1);
                b[z] *= 1 + 2 * e[z];
                b[z] -= e[z];
                b[z] = Math.min(Math.max(b[z], 0), 1)
            }, this));
            this.setXYP(b)
        },
        setXYP: function (a) {
            this._xyp = a
        },
        updateDimensions: function (e) {
            var f = E.viewport();
            if (J.visible()) {
                J.updateVars();
                f.height -= J._vars.thumbnails.height
            }
            this._sideWidth = 0;
            if (this._frames) {
                $.each(this._frames, $.proxy(function (i, b) {
                    if (b.view.options.ui == "outside") {
                        var c = b.close;
                        if (this._frames.length > 1) {
                            if (b._pos) {
                                c = c.add(b._pos)
                            }
                            if (b._next_button) {
                                c = c.add(b._next_button)
                            }
                        }
                        var d = 0;
                        b._whileVisible(function () {
                            $.each(c, function (i, a) {
                                d = Math.max(d, $(a).outerWidth(true))
                            })
                        });
                        this._sideWidth = Math.max(this._sideWidth, d) || 0
                    }
                }, this))
            }
            var g = $.extend({}, f, {
                width: f.width - 2 * (this._sideWidth || 0)
            });
            this._dimensions = f;
            this._boxDimensions = g
        },
        pn: function () {
            return {
                previous: this._position - 1 > 0,
                next: this._position + 1 <= this._frames.length
            }
        },
        show: function (b, c) {
            var d = [];
            $.each(this._frames, function (i, a) {
                if (a._position != b) {
                    d.push(a)
                }
            });
            var e = d.length + 1;
            var f = this._frames[this._position - 1];
            J[f.view.options.thumbnails ? "show" : "hide"]();
            this.resize();
            var g = f.view.options.effects.content.sync;
            $.each(d, $.proxy(function (i, a) {
                a.hide($.proxy(function () {
                    if (!g) {
                        if (e-- <= 2) {
                            this._frames[b - 1].show(c)
                        }
                    } else {
                        if (c && e-- <= 1) {
                            c()
                        }
                    }
                }, this))
            }, this));
            if (g) {
                this._frames[b - 1].show(function () {
                    if (c && e-- <= 1) {
                        c()
                    }
                })
            }
        },
        hideAll: function () {
            $.each(this._visible, $.proxy(function (j, i) {
                this._frames[i - 1].hide()
            }, this));
            J.hide();
            this.setXY({
                x: 0,
                y: 0
            })
        },
        hideAllBut: function (b) {
            $.each(this._frames, $.proxy(function (i, a) {
                if (a.position != b) {
                    a.hide()
                }
            }, this))
        },
        setTracking: function (a) {
            if (!this.isTracking(a)) {
                this._tracking.push(this._frames[a - 1]);
                if (this._tracking.length == 1) {
                    this.startTracking()
                }
            }
        },
        clearTracking: function () {
            this._tracking = []
        },
        removeTracking: function (b) {
            this._tracking = $.grep(this._tracking, function (a) {
                return a._position != b
            });
            if (this._tracking.length < 1) {
                this.stopTracking()
            }
        },
        isTracking: function (b) {
            var c = false;
            $.each(this._tracking, function (i, a) {
                if (a._position == b) {
                    c = true;
                    return false
                }
            });
            return c
        },
        bounds: function () {
            var a = this._dimensions;
            if (C._scrollbarWidth) {
                a.width -= scrollbarWidth
            }
            return a
        },
        clearLoads: function () {
            $.each(this._frames, $.proxy(function (i, a) {
                a.clearLoad()
            }, this))
        }
    };

    function Frame() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(Frame.prototype, {
        initialize: function (a, b) {
            this.view = a;
            this._position = b;
            this._dimensions = {};
            this.build()
        },
        remove: function () {
            this.clearUITimer();
            if (this._track) {
                H.removeTracking(this._position);
                this._track = false
            }
            this.frame.remove();
            this.frame = null;
            this.ui.remove();
            this.ui = null;
            this.view = null;
            this._dimensions = {};
            this._reset();
            if (this._interval_load) {
                clearInterval(this._interval_load);
                this._interval_load = null
            }
        },
        build: function () {
            var b = this.view.options.ui,
                positions = C.views.length;
            H.frames.append(this.frame = $("<div>").addClass("fr-frame").append(this.box = $("<div>").addClass("fr-box").addClass("fr-box-has-ui-" + this.view.options.ui)).hide());
            var c = this.view.options.onClick;
            if (this.view.type == "image" && ((c == "next" && (this.view.options.loop || (!this.view.options.loop && this._position != C.views.length))) || c == "close")) {
                this.frame.addClass("fr-frame-onclick-" + c.toLowerCase())
            }
            if (this.view.options.ui == "outside") {
                this.frame.prepend(this.ui = $("<div>").addClass("fr-ui fr-ui-outside"))
            } else {
                this.frame.append(this.ui = $("<div>").addClass("fr-ui fr-ui-inside"))
            }
            this.box.append(this.box_spacer = $("<div>").addClass("fr-box-spacer").append(this.box_padder = $("<div>").addClass("fr-box-padder").append(this.box_outer_border = $("<div>").addClass("fr-box-outer-border").append(this.box_wrapper = $("<div>").addClass("fr-box-wrapper")))));
            if (w.mobileTouch) {
                A(this.box, function (a) {
                    H[a == "left" ? "next" : "previous"]()
                }, false)
            }
            this.box_spacer.bind("click", $.proxy(function (a) {
                if (a.target == this.box_spacer[0] && this.view.options.overlay && this.view.options.overlay.close) {
                    C.hide()
                }
            }, this));
            this.spacers = this.box_spacer;
            this.wrappers = this.box_wrapper;
            this.padders = this.box_padder;
            if (this.view.options.ui == "outside") {
                this.ui.append(this.ui_wrapper = $("<div>").addClass("fr-ui-wrapper-outside"))
            } else {
                this.ui.append(this.ui_spacer = $("<div>").addClass("fr-ui-spacer").append(this.ui_padder = $("<div>").addClass("fr-ui-padder").append(this.ui_outer_border = $("<div>").addClass("fr-ui-outer-border").append(this.ui_toggle = $("<div>").addClass("fr-ui-toggle").append(this.ui_wrapper = $("<div>").addClass("fr-ui-wrapper"))))));
                this.spacers = this.spacers.add(this.ui_spacer);
                this.wrapper = this.wrappers.add(this.ui_wrapper);
                this.padders = this.padders.add(this.ui_padder)
            }
            if (positions > 1) {
                this.ui_wrapper.append(this._next = $("<div>").addClass("fr-side fr-side-next").append(this._next_button = $("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-icon"))).data("side", "next"));
                if (this._position == positions && !this.view.options.loop) {
                    this._next.addClass("fr-side-disabled");
                    this._next_button.addClass("fr-side-button-disabled")
                }
                this.ui_wrapper.append(this._previous = $("<div>").addClass("fr-side fr-side-previous").append(this._previous_button = $("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-icon"))).data("side", "previous"));
                if (this._position == 1 && !this.view.options.loop) {
                    this._previous.addClass("fr-side-disabled");
                    this._previous_button.addClass("fr-side-button-disabled")
                }
            }
            this.frame.addClass("fr-no-caption");
            if (this.view.caption || (this.view.options.ui == "inside" && !this.view.caption)) {
                this[this.view.options.ui == "inside" ? "ui_wrapper" : "frame"].append(this.info = $("<div>").addClass("fr-info fr-info-" + this.view.options.ui).append(this.info_background = $("<div>").addClass("fr-info-background")).append(this.info_padder = $("<div>").addClass("fr-info-padder")));
                this.info.bind("click", function (a) {
                    a.stopPropagation()
                })
            }
            if (this.view.caption) {
                this.frame.removeClass("fr-no-caption").addClass("fr-has-caption");
                this.info_padder.append(this.caption = $("<div>").addClass("fr-caption").html(this.view.caption))
            }
            if (positions > 1 && this.view.options.position) {
                var d = this._position + " / " + positions;
                this.frame.addClass("fr-has-position");
                var b = this.view.options.ui;
                this[b == "inside" ? "info_padder" : "ui_wrapper"][b == "inside" ? "prepend" : "append"](this._pos = $("<div>").addClass("fr-position").append($("<div>").addClass("fr-position-background")).append($("<span>").addClass("fr-position-text").html(d)))
            }
            this.ui_wrapper.append(this.close = $("<div>").addClass("fr-close").bind("click", function () {
                C.hide()
            }).append($("<span>").addClass("fr-close-background")).append($("<span>").addClass("fr-close-icon")));
            if (this.view.type == "image" && this.view.options.onClick == "close") {
                this[this.view.options.ui == "outside" ? "box_wrapper" : "ui_padder"].bind("click", function (a) {
                    a.preventDefault();
                    a.stopPropagation();
                    C.hide()
                })
            }
            this.frame.hide()
        },
        _getInfoHeight: function (a) {
            if (!this.view.caption) {
                return 0
            }
            if (this.view.options.ui == "outside") {
                a = Math.min(a, H._boxDimensions.width)
            }
            var b, info_pw = this.info.css("width");
            this.info.css({
                width: a + "px"
            });
            b = parseFloat(this.info.css("height"));
            this.info.css({
                width: info_pw
            });
            return b
        },
        _whileVisible: function (b, c) {
            var d = [];
            var e = C.element.add(C.bubble).add(this.frame).add(this.ui);
            if (c) {
                e = e.add(c)
            }
            $.each(e, function (i, a) {
                d.push({
                    visible: $(a).is(":visible"),
                    element: $(a).show()
                })
            });
            b();
            $.each(d, function (i, a) {
                if (!a.visible) {
                    a.element.hide()
                }
            })
        },
        getLayout: function () {
            this.updateVars();
            var d = this._dimensions.max,
                ui = this.view.options.ui,
                fit = this._fit,
                i = this._spacing,
                border = this._border;
            var e = F.within(d, {
                fit: fit,
                ui: ui,
                border: border
            });
            var f = $.extend({}, e),
                contentPosition = {
                    top: 0,
                    left: 0
                };
            if (border) {
                f = F.within(f, {
                    bounds: e,
                    ui: ui
                });
                e.width += 2 * border;
                e.height += 2 * border
            }
            if (i.horizontal || i.vertical) {
                var g = $.extend({}, H._boxDimensions);
                if (border) {
                    g.width -= 2 * border;
                    g.height -= 2 * border
                }
                g = {
                    width: Math.max(g.width - 2 * i.horizontal, 0),
                    height: Math.max(g.height - 2 * i.vertical, 0)
                };
                f = F.within(f, {
                    fit: fit,
                    bounds: g,
                    ui: ui
                })
            }
            var h = {
                caption: true
            }, cfitted = false;
            if (ui == "outside") {
                var i = {
                    height: e.height - f.height,
                    width: e.width - f.width
                };
                var j = $.extend({}, f),
                    noCaptionClass = this.caption && this.frame.hasClass("fr-no-caption");
                var k;
                if (this.caption) {
                    k = this.caption;
                    this.info.removeClass("fr-no-caption");
                    var l = this.frame.hasClass("fr-no-caption");
                    this.frame.removeClass("fr-no-caption");
                    var m = this.frame.hasClass("fr-has-caption");
                    this.frame.addClass("fr-has-caption")
                }
                C.element.css({
                    visibility: "visible"
                });
                this._whileVisible($.proxy(function () {
                    var a = 0,
                        attempts = 2;
                    while ((a < attempts)) {
                        h.height = this._getInfoHeight(f.width);
                        var b = 0.5 * (H._boxDimensions.height - 2 * border - (i.vertical ? i.vertical * 2 : 0) - f.height);
                        if (b < h.height) {
                            f = F.within(f, {
                                bounds: $.extend({}, {
                                    width: f.width,
                                    height: Math.max(f.height - h.height, 0)
                                }),
                                fit: fit,
                                ui: ui
                            })
                        }
                        a++
                    }
                    h.height = this._getInfoHeight(f.width);
                    var c = E.viewport();
                    if (((c.height <= 320 && c.width <= 568) || (c.width <= 320 && c.height <= 568)) || (h.height >= 0.5 * f.height) || (h.height >= 0.6 * f.width)) {
                        h.caption = false;
                        h.height = 0;
                        f = j
                    }
                }, this), k);
                C.element.css({
                    visibility: "visible"
                });
                if (l) {
                    this.frame.addClass("fr-no-caption")
                }
                if (m) {
                    this.frame.addClass("fr-has-caption")
                }
                var n = {
                    height: e.height - f.height,
                    width: e.width - f.width
                };
                e.height += (i.height - n.height);
                e.width += (i.width - n.width);
                if (f.height != j.height) {
                    cfitted = true
                }
            } else {
                h.height = 0
            }
            var o = {
                width: f.width + 2 * border,
                height: f.height + 2 * border
            };
            if (h.height) {
                e.height += h.height
            }
            if (ui == "inside") {
                h.height = 0
            }
            var p = {
                spacer: {
                    dimensions: e
                },
                padder: {
                    dimensions: o
                },
                wrapper: {
                    dimensions: f,
                    bounds: o,
                    margin: {
                        top: 0.5 * (e.height - o.height) - (0.5 * h.height),
                        left: 0.5 * (e.width - o.width)
                    }
                },
                content: {
                    dimensions: f
                },
                info: h
            };
            if (ui == "outside") {
                p.info.top = p.wrapper.margin.top;
                h.width = Math.min(f.width, H._boxDimensions.width)
            }
            var g = $.extend({}, H._boxDimensions);
            if (ui == "outside") {
                p.box = {
                    dimensions: {
                        width: H._boxDimensions.width
                    },
                    position: {
                        left: 0.5 * (H._dimensions.width - H._boxDimensions.width)
                    }
                }
            }
            p.ui = {
                spacer: {
                    dimensions: {
                        width: Math.min(e.width, g.width),
                        height: Math.min(e.height, g.height)
                    }
                },
                padder: {
                    dimensions: o
                },
                wrapper: {
                    dimensions: {
                        width: Math.min(p.wrapper.dimensions.width, g.width - 2 * border),
                        height: Math.min(p.wrapper.dimensions.height, g.height - 2 * border)
                    },
                    margin: {
                        top: p.wrapper.margin.top + border,
                        left: p.wrapper.margin.left + border
                    }
                }
            };
            return p
        },
        updateVars: function () {
            var a = $.extend({}, this._dimensions.max);
            var b = parseInt(this.box_outer_border.css("border-top-width"));
            this._border = b;
            if (b) {
                a.width -= 2 * b;
                a.height -= 2 * b
            }
            var c = this.view.options.fit;
            if (c == "smart") {
                if (a.width > a.height) {
                    c = "height"
                } else {
                    if (a.height > a.width) {
                        c = "width"
                    } else {
                        c = "none"
                    }
                }
            } else {
                if (!c) {
                    c = "none"
                }
            }
            this._fit = c;
            var d = this.view.options.spacing[this._fit];
            this._spacing = d
        },
        clearLoadTimer: function () {
            if (this._loadTimer) {
                clearTimeout(this._loadTimer);
                this._loadTimer = null
            }
        },
        clearLoad: function () {
            if (this._loadTimer && this._loading && !this._loaded) {
                this.clearLoadTimer();
                this._loading = false
            }
        },
        load: function (i) {
            if (this._loaded || this._loading) {
                if (this._loaded) {
                    this.afterLoad(i)
                }
                return
            }
            if (!(I.cache.get(this.view.url) || I.preloaded.getDimensions(this.view.url))) {
                C.loading.start()
            }
            this._loading = true;
            this._loadTimer = setTimeout($.proxy(function () {
                this.clearLoadTimer();
                switch (this.view.type) {
                    case "image":
                        I.get(this.view.url, $.proxy(function (c, d) {
                            this._dimensions._max = c;
                            this._dimensions.max = c;
                            this._loaded = true;
                            this._loading = false;
                            this.updateVars();
                            var e = this.getLayout();
                            this._dimensions.spacer = e.spacer.dimensions;
                            this._dimensions.content = e.content.dimensions;
                            this.content = $("<img>").attr({
                                src: this.view.url
                            });
                            this.box_wrapper.append(this.content.addClass("fr-content fr-content-image"));
                            this.box_wrapper.append($("<div>").addClass("fr-content-image-overlay "));
                            var f;
                            if (this.view.options.ui == "outside" && ((f = this.view.options.onClick) && f == "next" || f == "previous-next")) {
                                if (!this.view.options.loop && this._position != H._frames.length) {
                                    this.box_wrapper.append($("<div>").addClass("fr-onclick-side fr-onclick-next").data("side", "next"))
                                }
                                if (f == "previous-next" && (!this.view.options.loop && this._position != 1)) {
                                    this.box_wrapper.append($("<div>").addClass("fr-onclick-side fr-onclick-previous").data("side", "previous"))
                                }
                                this.frame.delegate(".fr-onclick-side", "click", $.proxy(function (a) {
                                    var b = $(a.target).data("side");
                                    H[b]()
                                }, this));
                                this.frame.delegate(".fr-onclick-side", "mouseenter", $.proxy(function (a) {
                                    var b = $(a.target).data("side"),
                                        button = b && this["_" + b + "_button"];
                                    if (!button) {
                                        return
                                    }
                                    this["_" + b + "_button"].addClass("fr-side-button-active")
                                }, this));
                                this.frame.delegate(".fr-onclick-side", "mouseleave", $.proxy(function (a) {
                                    var b = $(a.target).data("side"),
                                        button = b && this["_" + b + "_button"];
                                    if (!button) {
                                        return
                                    }
                                    this["_" + b + "_button"].removeClass("fr-side-button-active")
                                }, this))
                            }
                            this.afterLoad(i)
                        }, this));
                        break;
                    case "youtube":
                    case "vimeo":
                        var g = {
                            width: this.view.options.width,
                            height: this.view.options.height
                        };
                        if (this.view.type == "youtube" && this.view.options.youtube && this.view.options.youtube.hd) {
                            this.view._data.quality = (g.width > 720) ? "hd1080" : "hd720"
                        }
                        this._dimensions._max = g;
                        this._dimensions.max = g;
                        this._loaded = true;
                        this._loading = false;
                        this.updateVars();
                        var h = this.getLayout();
                        this._dimensions.spacer = h.spacer.dimensions;
                        this._dimensions.content = h.content.dimensions;
                        this.box_wrapper.append(this.content = $("<div>").addClass("fr-content fr-content-" + this.view.type));
                        this.afterLoad(i);
                        break
                }
            }, this), 10)
        },
        afterLoad: function (a) {
            this.resize();
            if (this.view.options.ui == "inside") {
                this.ui_outer_border.bind("mouseenter", $.proxy(this.showUI, this)).bind("mouseleave", $.proxy(this.hideUI, this))
            }
            if (!w.mobileTouch) {
                this.ui.delegate(".fr-ui-padder", "mousemove", $.proxy(function () {
                    if (!this.ui_wrapper.is(":visible")) {
                        this.showUI()
                    }
                    this.startUITimer()
                }, this))
            } else {
                this.box.bind("click", $.proxy(function () {
                    if (!this.ui_wrapper.is(":visible")) {
                        this.showUI()
                    }
                    this.startUITimer()
                }, this))
            }
            var b;
            if (H._frames && (b = H._frames[H._position - 1]) && b.view.url == this.view.url) {
                C.loading.stop()
            }
            if (a) {
                a()
            }
        },
        resize: function () {
            if (this.content) {
                var a = this.getLayout();
                this._dimensions.spacer = a.spacer.dimensions;
                this._dimensions.content = a.content.dimensions;
                this.box_spacer.css(px(a.spacer.dimensions));
                if (this.view.options.ui == "inside") {
                    this.ui_spacer.css(px(a.ui.spacer.dimensions))
                }
                this.box_wrapper.add(this.box_outer_border).css(px(a.wrapper.dimensions));
                var b = 0;
                if (this.view.options.ui == "outside" && a.info.caption) {
                    b = a.info.height
                }
                this.box_outer_border.css({
                    "padding-bottom": b + "px"
                });
                this.box_padder.css(px({
                    width: a.padder.dimensions.width,
                    height: a.padder.dimensions.height + b
                }));
                if (a.spacer.dimensions.width > (this.view.options.ui == "outside" ? a.box.dimensions.width : E.viewport().width)) {
                    this.box.addClass("fr-prevent-swipe")
                } else {
                    this.box.removeClass("fr-prevent-swipe")
                }
                if (this.view.options.ui == "outside") {
                    if (this.caption) {
                        this.info.css(px({
                            width: a.info.width
                        }))
                    }
                } else {
                    this.ui_wrapper.add(this.ui_outer_border).add(this.ui_toggle).css(px(a.ui.wrapper.dimensions));
                    this.ui_padder.css(px(a.ui.padder.dimensions));
                    var c = 0;
                    if (this.caption) {
                        var d = this.frame.hasClass("fr-no-caption"),
                            has_hascap = this.frame.hasClass("fr-has-caption");
                        this.frame.removeClass("fr-no-caption");
                        this.frame.addClass("fr-has-caption");
                        var c = 0;
                        this._whileVisible($.proxy(function () {
                            c = this.info.outerHeight()
                        }, this), this.ui_wrapper.add(this.caption));
                        var e = E.viewport();
                        if (c >= 0.45 * a.wrapper.dimensions.height || ((e.height <= 320 && e.width <= 568) || (e.width <= 320 && e.height <= 568))) {
                            a.info.caption = false
                        }
                        if (d) {
                            this.frame.addClass("fr-no-caption")
                        }
                        if (!has_hascap) {
                            this.frame.removeClass("fr-has-caption")
                        }
                    }
                }
                if (this.caption) {
                    var f = a.info.caption;
                    this.caption[f ? "show" : "hide"]();
                    this.frame[(!f ? "add" : "remove") + "Class"]("fr-no-caption");
                    this.frame[(!f ? "remove" : "add") + "Class"]("fr-has-caption")
                }
                this.box_padder.add(this.ui_padder).css(px(a.wrapper.margin));
                var g = H._boxDimensions,
                    spacer_dimensions = this._dimensions.spacer;
                this.overlap = {
                    y: spacer_dimensions.height - g.height,
                    x: spacer_dimensions.width - g.width
                };
                this._track = this.overlap.x > 0 || this.overlap.y > 0;
                H[(this._track ? "set" : "remove") + "Tracking"](this._position);
                if (r.IE && r.IE < 8 && this.view.type == "image") {
                    this.content.css(px(a.wrapper.dimensions))
                }
                if (/^(vimeo|youtube)$/.test(this.view.type)) {
                    var h = a.wrapper.dimensions;
                    if (this.player) {
                        this.player.setSize(h.width, h.height)
                    } else {
                        if (this.player_iframe) {
                            this.player_iframe.attr(h)
                        }
                    }
                }
            }
            this.position()
        },
        position: function () {
            if (!this.content) {
                return
            }
            var a = H._xyp;
            var b = H._boxDimensions,
                spacer_dimensions = this._dimensions.spacer;
            var c = {
                top: 0,
                left: 0
            };
            var d = this.overlap;
            this.frame.removeClass("fr-frame-touch");
            if (d.x || d.y) {
                if (w.scroll) {
                    this.frame.addClass("fr-frame-touch")
                }
            }
            if (d.y > 0) {
                c.top = 0 - a.y * d.y
            } else {
                c.top = b.height * 0.5 - spacer_dimensions.height * 0.5
            }
            if (d.x > 0) {
                c.left = 0 - a.x * d.x
            } else {
                c.left = b.width * 0.5 - spacer_dimensions.width * 0.5
            }
            if (w.mobileTouch) {
                if (d.y > 0) {
                    c.top = 0
                }
                if (d.x > 0) {
                    c.left = 0
                }
                this.box_spacer.css({
                    position: "relative"
                })
            }
            this._style = c;
            this.box_spacer.css({
                top: c.top + "px",
                left: c.left + "px"
            });
            var e = $.extend({}, c);
            if (e.top < 0) {
                e.top = 0
            }
            if (e.left < 0) {
                e.left = 0
            }
            if (this.view.options.ui == "outside") {
                var f = this.getLayout();
                this.box.css(px(f.box.dimensions)).css(px(f.box.position));
                if (this.view.caption) {
                    var g = c.top + f.wrapper.margin.top + f.wrapper.dimensions.height + this._border;
                    if (g > H._boxDimensions.height - f.info.height) {
                        g = H._boxDimensions.height - f.info.height
                    }
                    var h = H._sideWidth + c.left + f.wrapper.margin.left + this._border;
                    if (h < H._sideWidth) {
                        h = H._sideWidth
                    }
                    if (h + f.info.width > H._sideWidth + f.box.dimensions.width) {
                        h = H._sideWidth
                    }
                    this.info.css({
                        top: g + "px",
                        left: h + "px"
                    })
                }
            } else {
                this.ui_spacer.css({
                    left: e.left + "px",
                    top: e.top + "px"
                })
            }
        },
        setDimensions: function (a) {
            this.dimensions = a
        },
        _preShow: function () {
            switch (this.view.type) {
                case "youtube":
                    var b = r.IE && r.IE < 8,
                        d = this.getLayout(),
                        lwd = d.wrapper.dimensions;
                    if ( !! window.YT) {
                        var p;
                        this.content.append(this.player_div = $("<div>").append(p = $("<div>")[0]));
                        this.player = new YT.Player(p, {
                            height: lwd.height,
                            width: lwd.width,
                            videoId: this.view._data.id,
                            playerVars: this.view.options.youtube,
                            events: b ? {} : {
                                onReady: $.proxy(function (a) {
                                    if (this.view.options.youtube.hd) {
                                        try {
                                            a.target.setPlaybackQuality(this.view._data.quality)
                                        } catch (e) {}
                                    }
                                    this.resize()
                                }, this)
                            }
                        })
                    } else {
                        var c = $.param(this.view.options.youtube || {});
                        this.content.append(this.player_iframe = $("<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen>").attr({
                            src: "http://www.youtube.com/embed/" + this.view._data.id + "?" + c,
                            height: lwd.height,
                            width: lwd.width,
                            frameborder: 0
                        }))
                    }
                    break;
                case "vimeo":
                    var d = this.getLayout(),
                        lwd = d.wrapper.dimensions;
                    var c = $.param(this.view.options.vimeo || {});
                    this.content.append(this.player_iframe = $("<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen>").attr({
                        src: "http://player.vimeo.com/video/" + this.view._data.id + "?" + c,
                        height: lwd.height,
                        width: lwd.width,
                        frameborder: 0
                    }));
                    break
            }
        },
        show: function (a) {
            var b = r.IE && r.IE < 8;
            this._preShow();
            H.setVisible(this._position);
            this.frame.stop(1, 0);
            this.ui.stop(1, 0);
            this.showUI(null, true);
            if (this._track) {
                H.setTracking(this._position)
            }
            this.setOpacity(1, Math.max(this.view.options.effects.content.show, r.IE && r.IE < 9 ? 0 : 10), $.proxy(function () {
                if (a) {
                    a()
                }
            }, this))
        },
        _postHide: function () {
            if (this.player_iframe) {
                this.player_iframe.remove();
                this.player_iframe = null
            }
            if (this.player) {
                this.player.destroy();
                this.player = null
            }
            if (this.player_div) {
                this.player_div.remove();
                this.player_div = null
            }
        },
        _reset: function () {
            H.removeTracking(this._position);
            H.setHidden(this._position);
            this._postHide()
        },
        hide: function (a) {
            var b = Math.max(this.view.options.effects.content.hide || 0, r.IE && r.IE < 9 ? 0 : 10);
            var c = this.view.options.effects.content.sync ? "easeInQuad" : "easeOutSine";
            this.frame.stop(1, 0).fadeOut(b, c, $.proxy(function () {
                this._reset();
                if (a) {
                    a()
                }
            }, this))
        },
        setOpacity: function (a, b, c) {
            var d = this.view.options.effects.content.sync ? "easeOutQuart" : "easeInSine";
            this.frame.stop(1, 0).fadeTo(b || 0, a, d, c)
        },
        showUI: function (a, b) {
            if (!b) {
                this.ui_wrapper.stop(1, 0).fadeTo(b ? 0 : this.view.options.effects.ui.show, 1, "easeInSine", $.proxy(function () {
                    this.startUITimer();
                    if ($.type(a) == "function") {
                        a()
                    }
                }, this))
            } else {
                this.ui_wrapper.show();
                this.startUITimer();
                if ($.type(a) == "function") {
                    a()
                }
            }
        },
        hideUI: function (a, b) {
            if (this.view.options.ui == "outside") {
                return
            }
            if (!b) {
                this.ui_wrapper.stop(1, 0).fadeOut(b ? 0 : this.view.options.effects.ui.hide, "easeOutSine", function () {
                    if ($.type(a) == "function") {
                        a()
                    }
                })
            } else {
                this.ui_wrapper.hide();
                if ($.type(a) == "function") {
                    a()
                }
            }
        },
        clearUITimer: function () {
            if (this._ui_timer) {
                clearTimeout(this._ui_timer);
                this._ui_timer = null
            }
        },
        startUITimer: function () {
            this.clearUITimer();
            this._ui_timer = setTimeout($.proxy(function () {
                this.hideUI()
            }, this), this.view.options.effects.ui.delay)
        },
        hideUIDelayed: function () {
            this.clearUITimer();
            this._ui_timer = setTimeout($.proxy(function () {
                this.hideUI()
            }, this), this.view.options.effects.ui.delay)
        }
    });

    function Timeouts() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(Timeouts.prototype, {
        initialize: function () {
            this._timeouts = {};
            this._count = 0
        },
        set: function (a, b, c) {
            if ($.type(a) == "string") {
                this.clear(a)
            }
            if ($.type(a) == "function") {
                c = b;
                b = a;
                while (this._timeouts["timeout_" + this._count]) {
                    this._count++
                }
                a = "timeout_" + this._count
            }
            this._timeouts[a] = window.setTimeout($.proxy(function () {
                if (b) {
                    b()
                }
                this._timeouts[a] = null;
                delete this._timeouts[a]
            }, this), c)
        },
        get: function (a) {
            return this._timeouts[a]
        },
        clear: function (b) {
            if (!b) {
                $.each(this._timeouts, $.proxy(function (i, a) {
                    window.clearTimeout(a);
                    this._timeouts[i] = null;
                    delete this._timeouts[i]
                }, this));
                this._timeouts = {}
            }
            if (this._timeouts[b]) {
                window.clearTimeout(this._timeouts[b]);
                this._timeouts[b] = null;
                delete this._timeouts[b]
            }
        }
    });

    function States() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(States.prototype, {
        initialize: function () {
            this._states = {}
        },
        set: function (a, b) {
            this._states[a] = b
        },
        get: function (a) {
            return this._states[a] || false
        }
    });

    function View() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(View.prototype, {
        initialize: function (a) {
            var b = arguments[1] || {};
            var c = {};
            if ($.type(a) == "string") {
                a = {
                    url: a
                }
            } else {
                if (a && a.nodeType == 1) {
                    var d = $(a);
                    a = {
                        element: d[0],
                        url: d.attr("href"),
                        caption: d.data("fresco-caption"),
                        group: d.data("fresco-group"),
                        extension: d.data("fresco-extension"),
                        type: d.data("fresco-type"),
                        options: (d.data("fresco-options") && eval("({" + d.data("fresco-options") + "})")) || {}
                    }
                }
            }
            if (a) {
                if (!a.extension) {
                    a.extension = detectExtension(a.url)
                }
                if (!a.type) {
                    var c = getURIData(a.url);
                    a._data = c;
                    a.type = c.type
                }
            }
            if (!a._data) {
                a._data = getURIData(a.url)
            }
            if (a && a.options) {
                a.options = $.extend(true, $.extend({}, b), $.extend({}, a.options))
            } else {
                a.options = $.extend({}, b)
            }
            a.options = B.create(a.options, a.type, a._data);
            $.extend(this, a);
            return this
        }
    });
    var I = {
        get: function (a, b, c) {
            if ($.type(b) == "function") {
                c = b;
                b = {}
            }
            b = $.extend({
                track: true,
                type: false,
                lifetime: 1000 * 60 * 5
            }, b || {});
            var d = I.cache.get(a),
                type = b.type || getURIData(a).type,
                data = {
                    type: type,
                    callback: c
                };
            if (!d && type == "image") {
                var e;
                if ((e = I.preloaded.get(a)) && e.dimensions) {
                    d = e;
                    I.cache.set(a, e.dimensions, e.data)
                }
            }
            if (!d) {
                if (b.track) {
                    I.loading.clear(a)
                }
                switch (type) {
                    case "image":
                        var f = new Image();
                        f.onload = function () {
                            f.onload = function () {};
                            d = {
                                dimensions: {
                                    width: f.width,
                                    height: f.height
                                }
                            };
                            data.image = f;
                            I.cache.set(a, d.dimensions, data);
                            if (b.track) {
                                I.loading.clear(a)
                            }
                            if (c) {
                                c(d.dimensions, data)
                            }
                        };
                        f.src = a;
                        if (b.track) {
                            I.loading.set(a, {
                                image: f,
                                type: type
                            })
                        }
                        break
                }
            } else {
                if (c) {
                    c($.extend({}, d.dimensions), d.data)
                }
            }
        }
    };
    I.Cache = function () {
        return this.initialize.apply(this, q.call(arguments))
    };
    $.extend(I.Cache.prototype, {
        initialize: function () {
            this.cache = []
        },
        get: function (a) {
            var b = null;
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == a) {
                    b = this.cache[i]
                }
            }
            return b
        },
        set: function (a, b, c) {
            this.remove(a);
            this.cache.push({
                url: a,
                dimensions: b,
                data: c
            })
        },
        remove: function (a) {
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == a) {
                    delete this.cache[i]
                }
            }
        },
        inject: function (a) {
            var b = get(a.url);
            if (b) {
                $.extend(b, a)
            } else {
                this.cache.push(a)
            }
        }
    });
    I.cache = new I.Cache();
    I.Loading = function () {
        return this.initialize.apply(this, q.call(arguments))
    };
    $.extend(I.Loading.prototype, {
        initialize: function () {
            this.cache = []
        },
        set: function (a, b) {
            this.clear(a);
            this.cache.push({
                url: a,
                data: b
            })
        },
        get: function (a) {
            var b = null;
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == a) {
                    b = this.cache[i]
                }
            }
            return b
        },
        clear: function (a) {
            var b = this.cache;
            for (var i = 0; i < b.length; i++) {
                if (b[i] && b[i].url == a && b[i].data) {
                    var c = b[i].data;
                    switch (c.type) {
                        case "image":
                            if (c.image && c.image.onload) {
                                c.image.onload = function () {}
                            }
                            break
                    }
                    delete b[i]
                }
            }
        }
    });
    I.loading = new I.Loading();
    I.preload = function (a, b, c) {
        if ($.type(b) == "function") {
            c = b;
            b = {}
        }
        b = $.extend({
            once: false
        }, b || {});
        if (b.once && I.preloaded.get(a)) {
            return
        }
        var d;
        if ((d = I.preloaded.get(a)) && d.dimensions) {
            if ($.type(c) == "function") {
                c($.extend({}, d.dimensions), d.data)
            }
            return
        }
        var e = {
            url: a,
            data: {
                type: "image"
            }
        }, image = new Image();
        e.data.image = image;
        image.onload = function () {
            image.onload = function () {};
            e.dimensions = {
                width: image.width,
                height: image.height
            };
            if ($.type(c) == "function") {
                c(e.dimensions, e.data)
            }
        };
        I.preloaded.cache.add(e);
        image.src = a
    };
    I.preloaded = {
        get: function (a) {
            return I.preloaded.cache.get(a)
        },
        getDimensions: function (a) {
            var b = this.get(a);
            return b && b.dimensions
        }
    };
    I.preloaded.cache = (function () {
        var c = [];

        function get(a) {
            var b = null;
            for (var i = 0, l = c.length; i < l; i++) {
                if (c[i] && c[i].url && c[i].url == a) {
                    b = c[i]
                }
            }
            return b
        }
        function add(a) {
            c.push(a)
        }
        return {
            get: get,
            add: add
        }
    })();
    var J = {
        initialize: function (a) {
            this.element = a;
            this._thumbnails = [];
            this._vars = {
                thumbnail: {
                    height: 0,
                    outerWidth: 0
                },
                thumbnails: {
                    height: 0

                }
            };
            this.thumbnails = this.element.find(".fr-thumbnails:first");
            this.build();
            this.hide();
            this.startObserving()
        },
        build: function () {
            this.thumbnails.append(this.wrapper = $("<div>").addClass("fr-thumbnails-wrapper").append(this.slider = $("<div>").addClass("fr-thumbnails-slider").append(this._previous = $("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-previous").append(this._previous_button = $("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon")))).append(this._thumbs = $("<div>").addClass("fr-thumbnails-thumbs").append(this.slide = $("<div>").addClass("fr-thumbnails-slide"))).append(this._next = $("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-next").append(this._next_button = $("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon"))))));
            this.resize()
        },
        startObserving: function () {
            this.slider.delegate(".fr-thumbnail", "click", $.proxy(function (b) {
                b.stopPropagation();
                var c = $(b.target).closest(".fr-thumbnail")[0];
                var d = -1;
                this.slider.find(".fr-thumbnail").each(function (i, a) {
                    if (a == c) {
                        d = i + 1
                    }
                });
                if (d) {
                    this.setActive(d);
                    C.setPosition(d)
                }
            }, this));
            this.slider.bind("click", function (a) {
                a.stopPropagation()
            });
            this._previous.bind("click", $.proxy(this.previousPage, this));
            this._next.bind("click", $.proxy(this.nextPage, this));
            if (w.mobileTouch) {
                A(this.wrapper, $.proxy(function (a) {
                    this[(a == "left" ? "next" : "previous") + "Page"]()
                }, this), false)
            }
        },
        load: function (b) {
            this.clear();
            this._thumbnails = [];
            $.each(b, $.proxy(function (i, a) {
                this._thumbnails.push(new Thumbnail(this.slide, a, i + 1))
            }, this));
            if (!(r.IE && r.IE < 7)) {
                this.resize()
            }
        },
        clear: function () {
            $.each(this._thumbnails, function (i, a) {
                a.remove()
            });
            this._thumbnails = [];
            this._position = -1;
            this._page = -1
        },
        updateVars: function () {
            var a = C.element,
                bubble = C.bubble,
                vars = this._vars;
            var b = a.is(":visible");
            if (!b) {
                a.show()
            }
            var c = bubble.is(":visible");
            if (!c) {
                bubble.show()
            }
            var d = this.thumbnails.innerHeight() - (parseInt(this.thumbnails.css("padding-top")) || 0) - (parseInt(this.thumbnails.css("padding-bottom")) || 0);
            vars.thumbnail.height = d;
            var e = this.slide.find(".fr-thumbnail:first"),
                hasThumbnail = !! e[0],
                margin = 0;
            if (!hasThumbnail) {
                this._thumbs.append(e = $("<div>").addClass("fr-thumbnail").append($("<div>").addClass("fr-thumbnail-wrapper")))
            }
            margin = parseInt(e.css("margin-left"));
            if (!hasThumbnail) {
                e.remove()
            }
            vars.thumbnail.outerWidth = d + (margin * 2);
            vars.thumbnails.height = this.thumbnails.innerHeight();
            vars.sides = {
                previous: this._previous.outerWidth(true),
                next: this._next.outerWidth(true)
            };
            var f = E.viewport().width,
                tw = vars.thumbnail.outerWidth,
                thumbs = this._thumbnails.length;
            vars.sides.enabled = (thumbs * tw) / f > 1;
            var g = f,
                sides_width = vars.sides.previous + vars.sides.next;
            if (vars.sides.enabled) {
                g -= sides_width
            }
            g = Math.floor(g / tw) * tw;
            var h = thumbs * tw;
            if (h < g) {
                g = h
            }
            var i = g + (vars.sides.enabled ? sides_width : 0);
            vars.ipp = g / tw;
            this._mode = "page";
            if (vars.ipp <= 1) {
                g = f;
                i = f;
                vars.sides.enabled = false;
                this._mode = "center"
            }
            vars.pages = Math.ceil((thumbs * tw) / g);
            vars.thumbnails.width = g;
            vars.wrapper = {
                width: i
            };
            if (!c) {
                bubble.hide()
            }
            if (!b) {
                a.hide()
            }
        },
        disable: function () {
            this._disabled = true
        },
        enable: function () {
            this._disabled = false
        },
        enabled: function () {
            return !this._disabled
        },
        show: function () {
            if (this._thumbnails.length < 2) {
                return
            }
            this.enable();
            this.thumbnails.show();
            this._visible = true
        },
        hide: function () {
            this.disable();
            this.thumbnails.hide();
            this._visible = false
        },
        visible: function () {
            return !!this._visible
        },
        resize: function () {
            this.updateVars();
            var b = this._vars;
            $.each(this._thumbnails, function (i, a) {
                a.resize()
            });
            this._previous[b.sides.enabled ? "show" : "hide"]();
            this._next[b.sides.enabled ? "show" : "hide"]();
            var c = b.thumbnails.width;
            if (r.IE && r.IE < 9) {
                C.timeouts.clear("ie-resizing-thumbnails");
                C.timeouts.set("ie-resizing-thumbnails", $.proxy(function () {
                    this.updateVars();
                    var a = b.thumbnails.width;
                    this._thumbs.css({
                        width: a + "px"
                    });
                    this.slide.css({
                        width: ((this._thumbnails.length * b.thumbnail.outerWidth) + 1) + "px"
                    })
                }, this), 500)
            }
            this._thumbs.css({
                width: c + "px"
            });
            this.slide.css({
                width: ((this._thumbnails.length * b.thumbnail.outerWidth) + 1) + "px"
            });
            var d = b.wrapper.width + 1;
            this.wrapper.css({
                width: d + "px",
                "margin-left": -0.5 * d + "px"
            });
            this._previous.add(this._next).css({
                height: b.thumbnail.height + "px"
            });
            if (this._position) {
                this.moveTo(this._position, true)
            }
            if (r.IE && r.IE < 9) {
                var e = C.element,
                    bubble = C.bubble;
                var f = e.is(":visible");
                if (!f) {
                    e.show()
                }
                var g = bubble.is(":visible");
                if (!g) {
                    bubble.show()
                }
                this._thumbs.height("100%");
                this._thumbs.css({
                    height: this._thumbs.innerHeight() + "px"
                });
                this.thumbnails.find(".fr-thumbnail-overlay-border").hide();
                if (!g) {
                    bubble.hide()
                }
                if (!f) {
                    e.hide()
                }
            }
        },
        moveToPage: function (a) {
            if (a < 1 || a > this._vars.pages || a == this._page) {
                return
            }
            var b = this._vars.ipp * (a - 1) + 1;
            this.moveTo(b)
        },
        previousPage: function () {
            this.moveToPage(this._page - 1)
        },
        nextPage: function () {
            this.moveToPage(this._page + 1)
        },
        adjustToViewport: function () {
            var a = E.viewport();
            return a
        },
        setPosition: function (a) {
            if (r.IE && r.IE < 7) {
                return
            }
            var b = this._position < 0;
            if (a < 1) {
                a = 1
            }
            var c = this._thumbnails.length;
            if (a > c) {
                a = c
            }
            this._position = a;
            this.setActive(a);
            if (this._mode == "page" && this._page == Math.ceil(a / this._vars.ipp)) {
                return
            }
            this.moveTo(a, b)
        },
        moveTo: function (a, b) {
            this.updateVars();
            var c;
            var d = E.viewport().width,
                vp_center = d * 0.5,
                t_width = this._vars.thumbnail.outerWidth;
            if (this._mode == "page") {
                var e = Math.ceil(a / this._vars.ipp);
                this._page = e;
                c = -1 * (t_width * (this._page - 1) * this._vars.ipp);
                var f = "fr-thumbnails-side-button-disabled";
                this._previous_button[(e < 2 ? "add" : "remove") + "Class"](f);
                this._next_button[(e >= this._vars.pages ? "add" : "remove") + "Class"](f)
            } else {
                c = vp_center + (-1 * (t_width * (a - 1) + t_width * 0.5))
            }
            var g = H._frames && H._frames[H._position - 1];
            this.slide.stop(1, 0).animate({
                left: c + "px"
            }, b ? 0 : (g ? g.view.options.effects.thumbnails.slide : 0), $.proxy(function () {
                this.loadCurrentPage()
            }, this))
        },
        loadCurrentPage: function () {
            var a, max;
            if (!this._position || !this._vars.thumbnail.outerWidth || this._thumbnails.length < 1) {
                return
            }
            if (this._mode == "page") {
                if (this._page < 1) {
                    return
                }
                a = (this._page - 1) * this._vars.ipp + 1;
                max = Math.min((a - 1) + this._vars.ipp, this._thumbnails.length)
            } else {
                var b = Math.ceil(E.viewport().width / this._vars.thumbnail.outerWidth);
                a = Math.max(Math.floor(Math.max(this._position - b * 0.5, 0)), 1);
                max = Math.ceil(Math.min(this._position + b * 0.5));
                if (this._thumbnails.length < max) {
                    max = this._thumbnails.length
                }
            }
            for (var i = a; i <= max; i++) {
                this._thumbnails[i - 1].load()
            }
        },
        setActive: function (b) {
            $.each(this._thumbnails, function (i, a) {
                a.deactivate()
            });
            var c = b && this._thumbnails[b - 1];
            if (c) {
                c.activate()
            }
        },
        refresh: function () {
            if (this._position) {
                this.setPosition(this._position)
            }
        }
    };

    function Thumbnail() {
        this.initialize.apply(this, q.call(arguments))
    }
    $.extend(Thumbnail.prototype, {
        initialize: function (a, b, c) {
            this.element = a;
            this.view = b;
            this._dimension = {};
            this._position = c;
            this.build()
        },
        build: function () {
            var a = this.view.options;
            this.element.append(this.thumbnail = $("<div>").addClass("fr-thumbnail").append(this.thumbnail_wrapper = $("<div>").addClass("fr-thumbnail-wrapper")));
            if (this.view.type == "image") {
                this.thumbnail.addClass("fr-load-thumbnail").data("thumbnail", {
                    view: this.view,
                    src: a.thumbnail || this.view.url
                })
            }
            var b = a.thumbnail && a.thumbnail.icon;
            if (b) {
                this.thumbnail.append($("<div>").addClass("fr-thumbnail-icon fr-thumbnail-icon-" + b))
            }
            var c;
            this.thumbnail.append(c = $("<div>").addClass("fr-thumbnail-overlay").append($("<div>").addClass("fr-thumbnail-overlay-background")).append(this.loading = $("<div>").addClass("fr-thumbnail-loading").append($("<div>").addClass("fr-thumbnail-loading-background")).append($("<div>").addClass("fr-thumbnail-loading-icon"))).append($("<div>").addClass("fr-thumbnail-overlay-border")));
            this.thumbnail.append($("<div>").addClass("fr-thumbnail-state"))
        },
        remove: function () {
            this.thumbnail.remove();
            this.thumbnail = null;
            this.thumbnail_image = null
        },
        load: function () {
            if (this._loaded || this._loading || !J.visible()) {
                return
            }
            this._loading = true;
            var b = this.view.options.thumbnail;
            var c = (b && $.type(b) == "boolean") ? this.view.url : b || this.view.url;
            this._url = c;
            if (c) {
                if (this.view.type == "vimeo") {
                    $.getJSON("http://vimeo.com/api/v2/video/" + this.view._data.id + ".json?callback=?", $.proxy(function (a) {
                        if (a && a[0] && a[0].thumbnail_medium) {
                            this._url = a[0].thumbnail_medium;
                            I.preload(this._url, {
                                type: "image"
                            }, $.proxy(this._afterLoad, this))
                        } else {
                            this._loaded = true;
                            this._loading = false;
                            this.loading.stop(1, 0).delay(this.view.options.effects.thumbnails.delay).fadeTo(this.view.options.effects.thumbnails.load, 0)
                        }
                    }, this))
                } else {
                    I.preload(this._url, {
                        type: "image"
                    }, $.proxy(this._afterLoad, this))
                }
            }
        },
        _afterLoad: function (a, b) {
            if (!this.thumbnail) {
                return
            }
            this._loaded = true;
            this._loading = false;
            this._dimensions = a;
            this.image = $("<img>").attr({
                src: this._url
            });
            this.thumbnail_wrapper.prepend(this.image);
            this.resize();
            this.loading.stop(1, 0).delay(this.view.options.effects.thumbnails.delay).fadeTo(this.view.options.effects.thumbnails.load, 0)
        },
        resize: function () {
            var a = J._vars.thumbnail.height;
            this.thumbnail.css({
                width: a + "px",
                height: a + "px"
            });
            if (!this.image) {
                return
            }
            var b = {
                width: a,
                height: a
            };
            var c = Math.max(b.width, b.height);
            var d;
            var e = $.extend({}, this._dimensions);
            if (e.width > b.width && e.height > b.height) {
                d = F.within(e, {
                    bounds: b
                });
                var f = 1,
                    scaleY = 1;
                if (d.width < b.width) {
                    f = b.width / d.width
                }
                if (d.height < b.height) {
                    scaleY = b.height / d.height
                }
                var g = Math.max(f, scaleY);
                if (g > 1) {
                    d.width *= g;
                    d.height *= g
                }
                $.each("width height".split(" "), function (i, z) {
                    d[z] = Math.round(d[z])
                })
            } else {
                d = F.within((e.width < b.width || e.height < b.height) ? {
                    width: c,
                    height: c
                } : b, {
                    bounds: this._dimensions
                })
            }
            var x = Math.round(b.width * 0.5 - d.width * 0.5),
                y = Math.round(b.height * 0.5 - d.height * 0.5);
            this.image.css(px(d)).css(px({
                top: y,
                left: x
            }))
        },
        activate: function () {
            this.thumbnail.addClass("fr-thumbnail-active")
        },
        deactivate: function () {
            this.thumbnail.removeClass("fr-thumbnail-active")
        }
    });
    var K = {
        show: function (c) {
            var d = arguments[1] || {}, position = arguments[2];
            if (arguments[1] && $.type(arguments[1]) == "number") {
                position = arguments[1];
                d = B.create({})
            }
            var e = [],
                object_type;
            switch ((object_type = $.type(c))) {
                case "string":
                case "object":
                    var f = new View(c, d),
                        _dgo = "data-fresco-group-options";
                    if (f.group) {
                        if (_.isElement(c)) {
                            var g = $('.fresco[data-fresco-group="' + $(c).data("fresco-group") + '"]');
                            var h = {};
                            g.filter("[" + _dgo + "]").each(function (i, a) {
                                $.extend(h, eval("({" + ($(a).attr(_dgo) || "") + "})"))
                            });
                            g.each(function (i, a) {
                                if (!position && a == c) {
                                    position = i + 1
                                }
                                e.push(new View(a, $.extend({}, h, d)))
                            })
                        }
                    } else {
                        var h = {};
                        if (_.isElement(c) && $(c).is("[" + _dgo + "]")) {
                            $.extend(h, eval("({" + ($(c).attr(_dgo) || "") + "})"));
                            f = new View(c, $.extend({}, h, d))
                        }
                        e.push(f)
                    }
                    break;
                case "array":
                    $.each(c, function (i, a) {
                        var b = new View(a, d);
                        e.push(b)
                    });
                    break
            }
            if (!position || position < 1) {
                position = 1
            }
            if (position > e.length) {
                position = e.length
            }
            if (!H._xyp) {
                H.setXY({
                    x: 0,
                    y: 0
                })
            }
            C.load(e, position, {
                callback: function () {
                    C.show(function () {})
                }
            })
        }
    };
    $.extend(Fresco, {
        initialize: function () {
            u.check("jQuery");
            C.initialize()
        },
        show: function (a) {
            K.show.apply(K, q.call(arguments))
        },
        hide: function () {
            C.hide()
        },
        setDefaultSkin: function (a) {
            C.setDefaultSkin(a)
        }
    });
    
    
    /*
    var L = document.domain,
        _t_dreg = ")moc.\\grubnekatskcin|moc.\\sjocserf(".split("").reverse().join("");
        
        console.log(_t_dreg)
        console.log($.type(L))
        console.log(new RegExp(_t_dreg).test(L))
        
    if ($.type(L) == "string" && !new RegExp(_t_dreg).test(L)) {

        $.each("initialize show hide load".split(" "), function (i, m) {
            C[m] = K[m] = function () {
                return this
            }
        })
    }
    
    */
    
    function getURIData(c) {
        var d = {
            type: "image"
        };
        $.each(M, function (i, a) {
            var b = a.data(c);
            if (b) {
                d = b;
                d.type = i;
                d.url = c
            }
        });
        return d
    }
    function detectExtension(a) {
        var b = (a || "").replace(/\?.*/g, "").match(/\.([^.]{3,4})$/);
        return b ? b[1].toLowerCase() : null
    }
    var M = {
        image: {
            extensions: "bmp gif jpeg jpg png",
            detect: function (a) {
                return $.inArray(detectExtension(a), this.extensions.split(" ")) > -1
            },
            data: function (a) {
                if (!this.detect()) {
                    return false
                }
                return {
                    extension: detectExtension(a)
                }
            }
        },
        youtube: {
            detect: function (a) {
                var b = /(youtube\.com|youtu\.be)\/watch\?(?=.*vi?=([a-zA-Z0-9-_]+))(?:\S+)?$/.exec(a);
                if (b && b[2]) {
                    return b[2]
                }
                b = /(youtube\.com|youtu\.be)\/(vi?\/|u\/|embed\/)?([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a);
                if (b && b[3]) {
                    return b[3]
                }
                return false
            },
            data: function (a) {
                var b = this.detect(a);
                if (!b) {
                    return false
                }
                return {
                    id: b
                }
            }
        },
        vimeo: {
            detect: function (a) {
                var b = /(vimeo\.com)\/([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a);
                if (b && b[2]) {
                    return b[2]
                }
                return false
            },
            data: function (a) {
                var b = this.detect(a);
                if (!b) {
                    return false
                }
                return {
                    id: b
                }
            }
        }
    };
    if (r.Android && r.Android < 3) {
        $.each(C, function (a, b) {
            if ($.type(b) == "function") {
                C[a] = function () {
                    return this
                }
            }
        });
        Fresco.show = (function () {
            function getUrl(a) {
                var b, type = $.type(a);
                if (type == "string") {
                    b = a
                } else {
                    if (type == "array" && a[0]) {
                        b = getUrl(a[0])
                    } else {
                        if (_.isElement(a) && $(a).attr("href")) {
                            var b = $(a).attr("href")
                        } else {
                            if (a.url) {
                                b = a.url
                            } else {
                                b = false
                            }
                        }
                    }
                }
                return b
            }
            return function (a) {
                var b = getUrl(a);
                if (b) {
                    window.location.href = b
                }
            }
        })()
    }
    window.Fresco = Fresco;
    $(document).ready(function () {
        Fresco.initialize()
    })
})(jQuery);;
/*inview.js*/
/*--------------------------inView----------------------------------*/


        (function(d) {
            var p = {},
                e, a, h = document,
                i = window,
                f = h.documentElement,
                j = d.expando;
            d.event.special.inview = {
                add: function(a) {
                    p[a.guid + "-" + this[j]] = {
                        data: a,
                        $element: d(this)
                    }
                },
                remove: function(a) {
                    try {
                        delete p[a.guid + "-" + this[j]]
                    } catch (d) {}
                }
            };
            d(i).bind("scroll resize", function() {
                e = a = null
            });
            !f.addEventListener && f.attachEvent && f.attachEvent("onfocusin", function() {
                a = null
            });
            setInterval(function() {
                var k = d(),
                    j, n = 0;
                d.each(p, function(a, b) {
                    var c = b.data.selector,
                        d = b.$element;
                    k = k.add(c ? d.find(c) : d)
                });
                if (j = k.length) {
                    var b;
                    if (!(b = e)) {
                        var g = {
                            height: i.innerHeight,
                            width: i.innerWidth
                        };
                        if (!g.height && ((b = h.compatMode) || !d.support.boxModel)) b = "CSS1Compat" === b ? f : h.body, g = {
                            height: b.clientHeight,
                            width: b.clientWidth
                        };
                        b = g
                    }
                    e = b;
                    for (a = a || {
                        top: i.pageYOffset || f.scrollTop || h.body.scrollTop,
                        left: i.pageXOffset || f.scrollLeft || h.body.scrollLeft
                    }; n < j; n++)
                        if (d.contains(f, k[n])) {
                            b = d(k[n]);
                            var l = b.height(),
                                m = b.width(),
                                c = b.offset(),
                                g = b.data("inview");
                            if (!a || !e) break;
                            c.top + l > a.top && c.top < a.top + e.height && c.left + m > a.left && c.left < a.left + e.width ?
                                (m = a.left > c.left ? "right" : a.left + e.width < c.left + m ? "left" : "both", l = a.top > c.top ? "bottom" : a.top + e.height < c.top + l ? "top" : "both", c = m + "-" + l, (!g || g !== c) && b.data("inview", c).trigger("inview", [!0, m, l])) : g && b.data("inview", !1).trigger("inview", [!1])
                        }
                }
            }, 250)
        })(jQuery);
/*jquery-magnific-popup.js*/
/*! Magnific Popup - v1.0.0 - 2015-09-17
	* http://dimsemenov.com/plugins/magnific-popup/
</div>
* Copyright (c) 2015 Dmitry Semenov; */
;(function (factory) { 
if (typeof define === 'function' && define.amd) { 
 // AMD. Register as an anonymous module. 
 define(['jquery'], factory); 
 } else if (typeof exports === 'object') { 
 // Node/CommonJS 
 factory(require('jquery')); 
 } else { 
 // Browser globals 
 factory(window.jQuery || window.Zepto); 
 } 
 }(function($) { 

/*>>core*/
/**
 * 
 * Magnific Popup Core JS file
 * 
 */


var wLocalizeMagnific = {
    tClose: 'Закрыть (ESC)',
    tLoading: 'Загрузка контента ...',
    tNotFound: 'Контент не найден',
    tError: 'Невозможно загрузить <a href="%url%" target="_blank">Контент</a>.',
    tErrorImage: 'Невозможно загрузить <a href="%url%" target="_blank">Изображение #%curr%</a>.',
    tPrev: 'Предыдущая (клавиша Left)',
    tNext: 'Следующая (клавиша Right)',
    tCounter: '%curr% из %total%'
};

if (wLocalize) {
	if (wLocalize.hasOwnProperty('Magnific')) {
		$.extend(true, wLocalizeMagnific, wLocalize.Magnific[wLang]);
	}
}



/**
 * Private static constants
 */
var CLOSE_EVENT = 'Close',
	BEFORE_CLOSE_EVENT = 'BeforeClose',
	AFTER_CLOSE_EVENT = 'AfterClose',
	BEFORE_APPEND_EVENT = 'BeforeAppend',
	MARKUP_PARSE_EVENT = 'MarkupParse',
	OPEN_EVENT = 'Open',
	CHANGE_EVENT = 'Change',
	NS = 'mfp',
	EVENT_NS = '.' + NS,
	READY_CLASS = 'mfp-ready',
	REMOVING_CLASS = 'mfp-removing',
	PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


/**
 * Private vars 
 */
/*jshint -W079 */
var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
	MagnificPopup = function(){},
	_isJQ = !!(window.jQuery),
	_prevStatus,
	_window = $(window),
	_document,
	_prevContentType,
	_wrapClasses,
	_currPopupType;


/**
 * Private functions
 */
var _mfpOn = function(name, f) {
		mfp.ev.on(NS + name + EVENT_NS, f);
	},
	_getEl = function(className, appendTo, html, raw) {
		var el = document.createElement('div');
		el.className = 'mfp-'+className;
		if(html) {
			el.innerHTML = html;
		}
		if(!raw) {
			el = $(el);
			if(appendTo) {
				el.appendTo(appendTo);
			}
		} else if(appendTo) {
			appendTo.appendChild(el);
		}
		return el;
	},
	_mfpTrigger = function(e, data) {
		mfp.ev.triggerHandler(NS + e, data);

		if(mfp.st.callbacks) {
			// converts "mfpEventName" to "eventName" callback and triggers it if it's present
			e = e.charAt(0).toLowerCase() + e.slice(1);
			if(mfp.st.callbacks[e]) {
				mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
			}
		}
	},
	_getCloseBtn = function(type) {
		if(type !== _currPopupType || !mfp.currTemplate.closeBtn) {
			mfp.currTemplate.closeBtn = $( mfp.st.closeMarkup.replace('%title%', mfp.st.tClose ) );
			_currPopupType = type;
		}
		return mfp.currTemplate.closeBtn;
	},
	// Initialize Magnific Popup only when called at least once
	_checkInstance = function() {
		if(!$.magnificPopup.instance) {
			/*jshint -W020 */
			mfp = new MagnificPopup();
			mfp.init();
			$.magnificPopup.instance = mfp;
		}
	},
	// CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
	supportsTransitions = function() {
		var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
			v = ['ms','O','Moz','Webkit']; // 'v' for vendor

		if( s['transition'] !== undefined ) {
			return true; 
		}
			
		while( v.length ) {
			if( v.pop() + 'Transition' in s ) {
				return true;
			}
		}
				
		return false;
	};



/**
 * Public functions
 */
MagnificPopup.prototype = {

	constructor: MagnificPopup,

	/**
	 * Initializes Magnific Popup plugin. 
	 * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
	 */
	init: function() {
		var appVersion = navigator.appVersion;
		mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1; 
		mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
		mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
		mfp.isAndroid = (/android/gi).test(appVersion);
		mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
		mfp.supportsTransition = supportsTransitions();

		// We disable fixed positioned lightbox on devices that don't handle it nicely.
		// If you know a better way of detecting this - let me know.
		mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent) );
		_document = $(document);

		mfp.popupsCache = {};
	},

	/**
	 * Opens popup
	 * @param  data [description]
	 */
	open: function(data) {

		var i;

		if(data.isObj === false) { 
			// convert jQuery collection to array to avoid conflicts later
			mfp.items = data.items.toArray();

			mfp.index = 0;
			var items = data.items,
				item;
			for(i = 0; i < items.length; i++) {
				item = items[i];
				if(item.parsed) {
					item = item.el[0];
				}
				if(item === data.el[0]) {
					mfp.index = i;
					break;
				}
			}
		} else {
			mfp.items = $.isArray(data.items) ? data.items : [data.items];
			mfp.index = data.index || 0;
		}

		// if popup is already opened - we just update the content
		if(mfp.isOpen) {
			mfp.updateItemHTML();
			return;
		}
		
		mfp.types = []; 
		_wrapClasses = '';
		if(data.mainEl && data.mainEl.length) {
			mfp.ev = data.mainEl.eq(0);
		} else {
			mfp.ev = _document;
		}

		if(data.key) {
			if(!mfp.popupsCache[data.key]) {
				mfp.popupsCache[data.key] = {};
			}
			mfp.currTemplate = mfp.popupsCache[data.key];
		} else {
			mfp.currTemplate = {};
		}



		mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data ); 
		mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

		if(mfp.st.modal) {
			mfp.st.closeOnContentClick = false;
			mfp.st.closeOnBgClick = false;
			mfp.st.showCloseBtn = false;
			mfp.st.enableEscapeKey = false;
		}
		

		// Building markup
		// main containers are created only once
		if(!mfp.bgOverlay) {

			// Dark overlay
			mfp.bgOverlay = _getEl('bg').on('click'+EVENT_NS, function() {
				mfp.close();
			});

			mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click'+EVENT_NS, function(e) {
				if(mfp._checkIfClose(e.target)) {
					mfp.close();
				}
			});

			mfp.container = _getEl('container', mfp.wrap);
		}

		mfp.contentContainer = _getEl('content');
		if(mfp.st.preloader) {
			mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
		}


		// Initializing modules
		var modules = $.magnificPopup.modules;
		for(i = 0; i < modules.length; i++) {
			var n = modules[i];
			n = n.charAt(0).toUpperCase() + n.slice(1);
			mfp['init'+n].call(mfp);
		}
		_mfpTrigger('BeforeOpen');


		if(mfp.st.showCloseBtn) {
			// Close button
			if(!mfp.st.closeBtnInside) {
				mfp.wrap.append( _getCloseBtn() );
			} else {
				_mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
					values.close_replaceWith = _getCloseBtn(item.type);
				});
				_wrapClasses += ' mfp-close-btn-in';
			}
		}

		if(mfp.st.alignTop) {
			_wrapClasses += ' mfp-align-top';
		}

	

		if(mfp.fixedContentPos) {
			mfp.wrap.css({
				overflow: mfp.st.overflowY,
				overflowX: 'hidden',
				overflowY: mfp.st.overflowY
			});
		} else {
			mfp.wrap.css({ 
				top: _window.scrollTop(),
				position: 'absolute'
			});
		}
		if( mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) ) {
			mfp.bgOverlay.css({
				height: _document.height(),
				position: 'absolute'
			});
		}

		

		if(mfp.st.enableEscapeKey) {
			// Close on ESC key
			_document.on('keyup' + EVENT_NS, function(e) {
				if(e.keyCode === 27) {
					mfp.close();
				}
			});
		}

		_window.on('resize' + EVENT_NS, function() {
			mfp.updateSize();
		});


		if(!mfp.st.closeOnContentClick) {
			_wrapClasses += ' mfp-auto-cursor';
		}
		
		if(_wrapClasses)
			mfp.wrap.addClass(_wrapClasses);


		// this triggers recalculation of layout, so we get it once to not to trigger twice
		var windowHeight = mfp.wH = _window.height();

		
		var windowStyles = {};

		if( mfp.fixedContentPos ) {
            if(mfp._hasScrollBar(windowHeight)){
                var s = mfp._getScrollbarSize();
                if(s) {
                    windowStyles.marginRight = s;
                }
            }
        }

		if(mfp.fixedContentPos) {
			if(!mfp.isIE7) {
				windowStyles.overflow = 'hidden';
			} else {
				// ie7 double-scroll bug
				$('body, html').css('overflow', 'hidden');
			}
		}

		
		
		var classesToadd = mfp.st.mainClass;
		if(mfp.isIE7) {
			classesToadd += ' mfp-ie7';
		}
		if(classesToadd) {
			mfp._addClassToMFP( classesToadd );
		}

		// add content
		mfp.updateItemHTML();

		_mfpTrigger('BuildControls');

		// remove scrollbar, add margin e.t.c
		$('html').css(windowStyles);
		
		// add everything to DOM
		mfp.bgOverlay.add(mfp.wrap).prependTo( mfp.st.prependTo || $(document.body) );

		// Save last focused element
		mfp._lastFocusedEl = document.activeElement;
		
		// Wait for next cycle to allow CSS transition
		setTimeout(function() {
			
			if(mfp.content) {
				mfp._addClassToMFP(READY_CLASS);
				mfp._setFocus();
			} else {
				// if content is not defined (not loaded e.t.c) we add class only for BG
				mfp.bgOverlay.addClass(READY_CLASS);
			}
			
			// Trap the focus in popup
			_document.on('focusin' + EVENT_NS, mfp._onFocusIn);

		}, 16);

		mfp.isOpen = true;
		mfp.updateSize(windowHeight);
		_mfpTrigger(OPEN_EVENT);

		return data;
	},

	/**
	 * Closes the popup
	 */
	close: function() {
		if(!mfp.isOpen) return;
		_mfpTrigger(BEFORE_CLOSE_EVENT);

		mfp.isOpen = false;
		// for CSS3 animation
		if(mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition )  {
			mfp._addClassToMFP(REMOVING_CLASS);
			setTimeout(function() {
				mfp._close();
			}, mfp.st.removalDelay);
		} else {
			mfp._close();
		}
	},

	/**
	 * Helper for close() function
	 */
	_close: function() {
		_mfpTrigger(CLOSE_EVENT);

		var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

		mfp.bgOverlay.detach();
		mfp.wrap.detach();
		mfp.container.empty();

		if(mfp.st.mainClass) {
			classesToRemove += mfp.st.mainClass + ' ';
		}

		mfp._removeClassFromMFP(classesToRemove);

		if(mfp.fixedContentPos) {
			var windowStyles = {marginRight: ''};
			if(mfp.isIE7) {
				$('body, html').css('overflow', '');
			} else {
				windowStyles.overflow = '';
			}
			$('html').css(windowStyles);
		}
		
		_document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
		mfp.ev.off(EVENT_NS);

		// clean up DOM elements that aren't removed
		mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
		mfp.bgOverlay.attr('class', 'mfp-bg');
		mfp.container.attr('class', 'mfp-container');

		// remove close button from target element
		if(mfp.st.showCloseBtn &&
		(!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
			if(mfp.currTemplate.closeBtn)
				mfp.currTemplate.closeBtn.detach();
		}


		if(mfp._lastFocusedEl) {
			$(mfp._lastFocusedEl).focus(); // put tab focus back
		}
		mfp.currItem = null;	
		mfp.content = null;
		mfp.currTemplate = null;
		mfp.prevHeight = 0;

		_mfpTrigger(AFTER_CLOSE_EVENT);
	},
	
	updateSize: function(winHeight) {

		if(mfp.isIOS) {
			// fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
			var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
			var height = window.innerHeight * zoomLevel;
			mfp.wrap.css('height', height);
			mfp.wH = height;
		} else {
			mfp.wH = winHeight || _window.height();
		}
		// Fixes #84: popup incorrectly positioned with position:relative on body
		if(!mfp.fixedContentPos) {
			mfp.wrap.css('height', mfp.wH);
		}

		_mfpTrigger('Resize');

	},

	/**
	 * Set content of popup based on current index
	 */
	updateItemHTML: function() {
		var item = mfp.items[mfp.index];

		// Detach and perform modifications
		mfp.contentContainer.detach();

		if(mfp.content)
			mfp.content.detach();

		if(!item.parsed) {
			item = mfp.parseEl( mfp.index );
		}

		var type = item.type;	

		_mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
		// BeforeChange event works like so:
		// _mfpOn('BeforeChange', function(e, prevType, newType) { });
		
		mfp.currItem = item;

		

		

		if(!mfp.currTemplate[type]) {
			var markup = mfp.st[type] ? mfp.st[type].markup : false;

			// allows to modify markup
			_mfpTrigger('FirstMarkupParse', markup);

			if(markup) {
				mfp.currTemplate[type] = $(markup);
			} else {
				// if there is no markup found we just define that template is parsed
				mfp.currTemplate[type] = true;
			}
		}

		if(_prevContentType && _prevContentType !== item.type) {
			mfp.container.removeClass('mfp-'+_prevContentType+'-holder');
		}
		
		var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
		mfp.appendContent(newContent, type);

		item.preloaded = true;

		_mfpTrigger(CHANGE_EVENT, item);
		_prevContentType = item.type;
		
		// Append container back after its content changed
		mfp.container.prepend(mfp.contentContainer);

		_mfpTrigger('AfterChange');
	},


	/**
	 * Set HTML content of popup
	 */
	appendContent: function(newContent, type) {
		mfp.content = newContent;
		
		if(newContent) {
			if(mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
				mfp.currTemplate[type] === true) {
				// if there is no markup, we just append close button element inside
				if(!mfp.content.find('.mfp-close').length) {
					mfp.content.append(_getCloseBtn());
				}
			} else {
				mfp.content = newContent;
			}
		} else {
			mfp.content = '';
		}

		_mfpTrigger(BEFORE_APPEND_EVENT);
		mfp.container.addClass('mfp-'+type+'-holder');

		mfp.contentContainer.append(mfp.content);
	},



	
	/**
	 * Creates Magnific Popup data object based on given data
	 * @param  {int} index Index of item to parse
	 */
	parseEl: function(index) {
		var item = mfp.items[index],
			type;

		if(item.tagName) {
			item = { el: $(item) };
		} else {
			type = item.type;
			item = { data: item, src: item.src };
		}

		if(item.el) {
			var types = mfp.types;

			// check for 'mfp-TYPE' class
			for(var i = 0; i < types.length; i++) {
				if( item.el.hasClass('mfp-'+types[i]) ) {
					type = types[i];
					break;
				}
			}

			item.src = item.el.attr('data-mfp-src');
			if(!item.src) {
				item.src = item.el.attr('href');
			}
		}

		item.type = type || mfp.st.type || 'inline';
		item.index = index;
		item.parsed = true;
		mfp.items[index] = item;
		_mfpTrigger('ElementParse', item);

		return mfp.items[index];
	},


	/**
	 * Initializes single popup or a group of popups
	 */
	addGroup: function(el, options) {
		var eHandler = function(e) {
			e.mfpEl = this;
			mfp._openClick(e, el, options);
		};

		if(!options) {
			options = {};
		} 

		var eName = 'click.magnificPopup';
		options.mainEl = el;
		
		if(options.items) {
			options.isObj = true;
			el.off(eName).on(eName, eHandler);
		} else {
			options.isObj = false;
			if(options.delegate) {
				el.off(eName).on(eName, options.delegate , eHandler);
			} else {
				options.items = el;
				el.off(eName).on(eName, eHandler);
			}
		}
	},
	_openClick: function(e, el, options) {
		var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


		if(!midClick && ( e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey ) ) {
			return;
		}

		var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

		if(disableOn) {
			if($.isFunction(disableOn)) {
				if( !disableOn.call(mfp) ) {
					return true;
				}
			} else { // else it's number
				if( _window.width() < disableOn ) {
					return true;
				}
			}
		}
		
		if(e.type) {
			e.preventDefault();

			// This will prevent popup from closing if element is inside and popup is already opened
			if(mfp.isOpen) {
				e.stopPropagation();
			}
		}
			

		options.el = $(e.mfpEl);
		if(options.delegate) {
			options.items = el.find(options.delegate);
		}
		mfp.open(options);
	},


	/**
	 * Updates text on preloader
	 */
	updateStatus: function(status, text) {

		if(mfp.preloader) {
			if(_prevStatus !== status) {
				mfp.container.removeClass('mfp-s-'+_prevStatus);
			}

			if(!text && status === 'loading') {
				text = mfp.st.tLoading;
			}

			var data = {
				status: status,
				text: text
			};
			// allows to modify status
			_mfpTrigger('UpdateStatus', data);

			status = data.status;
			text = data.text;

			mfp.preloader.html(text);

			mfp.preloader.find('a').on('click', function(e) {
				e.stopImmediatePropagation();
			});

			mfp.container.addClass('mfp-s-'+status);
			_prevStatus = status;
		}
	},


	/*
		"Private" helpers that aren't private at all
	 */
	// Check to close popup or not
	// "target" is an element that was clicked
	_checkIfClose: function(target) {

		if($(target).hasClass(PREVENT_CLOSE_CLASS)) {
			return;
		}

		var closeOnContent = mfp.st.closeOnContentClick;
		var closeOnBg = mfp.st.closeOnBgClick;

		if(closeOnContent && closeOnBg) {
			return true;
		} else {

			// We close the popup if click is on close button or on preloader. Or if there is no content.
			if(!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0]) ) {
				return true;
			}

			// if click is outside the content
			if(  (target !== mfp.content[0] && !$.contains(mfp.content[0], target))  ) {
				if(closeOnBg) {
					// last check, if the clicked element is in DOM, (in case it's removed onclick)
					if( $.contains(document, target) ) {
						return true;
					}
				}
			} else if(closeOnContent) {
				return true;
			}

		}
		return false;
	},
	_addClassToMFP: function(cName) {
		mfp.bgOverlay.addClass(cName);
		mfp.wrap.addClass(cName);
	},
	_removeClassFromMFP: function(cName) {
		this.bgOverlay.removeClass(cName);
		mfp.wrap.removeClass(cName);
	},
	_hasScrollBar: function(winHeight) {
		return (  (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()) );
	},
	_setFocus: function() {
		(mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
	},
	_onFocusIn: function(e) {
		if( e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target) ) {
			mfp._setFocus();
			return false;
		}
	},
	_parseMarkup: function(template, values, item) {
		var arr;
		if(item.data) {
			values = $.extend(item.data, values);
		}
		_mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item] );

		$.each(values, function(key, value) {
			if(value === undefined || value === false) {
				return true;
			}
			arr = key.split('_');
			if(arr.length > 1) {
				var el = template.find(EVENT_NS + '-'+arr[0]);

				if(el.length > 0) {
					var attr = arr[1];
					if(attr === 'replaceWith') {
						if(el[0] !== value[0]) {
							el.replaceWith(value);
						}
					} else if(attr === 'img') {
						if(el.is('img')) {
							el.attr('src', value);
						} else {
							el.replaceWith( '<img src="'+value+'" class="' + el.attr('class') + '" />' );
						}
					} else {
						el.attr(arr[1], value);
					}
				}

			} else {
				template.find(EVENT_NS + '-'+key).html(value);
			}
		});
	},

	_getScrollbarSize: function() {
		// thx David
		if(mfp.scrollbarSize === undefined) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(scrollDiv);
			mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
		}
		return mfp.scrollbarSize;
	}

}; /* MagnificPopup core prototype end */




/**
 * Public static functions
 */
$.magnificPopup = {
	instance: null,
	proto: MagnificPopup.prototype,
	modules: [],

	open: function(options, index) {
		_checkInstance();	

		if(!options) {
			options = {};
		} else {
			options = $.extend(true, {}, options);
		}
			

		options.isObj = true;
		options.index = index || 0;
		return this.instance.open(options);
	},

	close: function() {
		return $.magnificPopup.instance && $.magnificPopup.instance.close();
	},

	registerModule: function(name, module) {
		if(module.options) {
			$.magnificPopup.defaults[name] = module.options;
		}
		$.extend(this.proto, module.proto);			
		this.modules.push(name);
	},

	defaults: {   

		// Info about options is in docs:
		// http://dimsemenov.com/plugins/magnific-popup/documentation.html#options
		
		disableOn: 0,	

		key: null,

		midClick: false,

		mainClass: '',

		preloader: true,

		focus: '', // CSS selector of input to focus after popup is opened
		
		closeOnContentClick: false,

		closeOnBgClick: true,

		closeBtnInside: true, 

		showCloseBtn: true,

		enableEscapeKey: true,

		modal: false,

		alignTop: false,
	
		removalDelay: 0,

		prependTo: null,
		
		fixedContentPos: 'auto', 
	
		fixedBgPos: 'auto',

		overflowY: 'auto',

		closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',

		tClose: wLocalizeMagnific.tClose,

		tLoading: wLocalizeMagnific.tLoading

	}
};



$.fn.magnificPopup = function(options) {
	_checkInstance();

	var jqEl = $(this);

	// We call some API method of first param is a string
	if (typeof options === "string" ) {

		if(options === 'open') {
			var items,
				itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
				index = parseInt(arguments[1], 10) || 0;

			if(itemOpts.items) {
				items = itemOpts.items[index];
			} else {
				items = jqEl;
				if(itemOpts.delegate) {
					items = items.find(itemOpts.delegate);
				}
				items = items.eq( index );
			}
			mfp._openClick({mfpEl:items}, jqEl, itemOpts);
		} else {
			if(mfp.isOpen)
				mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
		}

	} else {
		// clone options obj
		options = $.extend(true, {}, options);
		
		/*
		 * As Zepto doesn't support .data() method for objects 
		 * and it works only in normal browsers
		 * we assign "options" object directly to the DOM element. FTW!
		 */
		if(_isJQ) {
			jqEl.data('magnificPopup', options);
		} else {
			jqEl[0].magnificPopup = options;
		}

		mfp.addGroup(jqEl, options);

	}
	return jqEl;
};


//Quick benchmark
/*
var start = performance.now(),
	i,
	rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


/*>>core*/

/*>>inline*/

var INLINE_NS = 'inline',
	_hiddenClass,
	_inlinePlaceholder, 
	_lastInlineElement,
	_putInlineElementsBack = function() {
		if(_lastInlineElement) {
			_inlinePlaceholder.after( _lastInlineElement.addClass(_hiddenClass) ).detach();
			_lastInlineElement = null;
		}
	};

$.magnificPopup.registerModule(INLINE_NS, {
	options: {
		hiddenClass: 'hide', // will be appended with `mfp-` prefix
		markup: '',
		tNotFound: wLocalizeMagnific.tNotFound
	},
	proto: {

		initInline: function() {
			mfp.types.push(INLINE_NS);

			_mfpOn(CLOSE_EVENT+'.'+INLINE_NS, function() {
				_putInlineElementsBack();
			});
		},

		getInline: function(item, template) {

			_putInlineElementsBack();

			if(item.src) {
				var inlineSt = mfp.st.inline,
					el = $(item.src);

				if(el.length) {

					// If target element has parent - we replace it with placeholder and put it back after popup is closed
					var parent = el[0].parentNode;
					if(parent && parent.tagName) {
						if(!_inlinePlaceholder) {
							_hiddenClass = inlineSt.hiddenClass;
							_inlinePlaceholder = _getEl(_hiddenClass);
							_hiddenClass = 'mfp-'+_hiddenClass;
						}
						// replace target inline element with placeholder
						_lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
					}

					mfp.updateStatus('ready');
				} else {
					mfp.updateStatus('error', inlineSt.tNotFound);
					el = $('<div>');
				}

				item.inlineElement = el;
				return el;
			}

			mfp.updateStatus('ready');
			mfp._parseMarkup(template, {}, item);
			return template;
		}
	}
});

/*>>inline*/

/*>>ajax*/
var AJAX_NS = 'ajax',
	_ajaxCur,
	_removeAjaxCursor = function() {
		if(_ajaxCur) {
			$(document.body).removeClass(_ajaxCur);
		}
	},
	_destroyAjaxRequest = function() {
		_removeAjaxCursor();
		if(mfp.req) {
			mfp.req.abort();
		}
	};

$.magnificPopup.registerModule(AJAX_NS, {

	options: {
		settings: null,
		cursor: 'mfp-ajax-cur',
		tError: wLocalizeMagnific.tError
	},

	proto: {
		initAjax: function() {
			mfp.types.push(AJAX_NS);
			_ajaxCur = mfp.st.ajax.cursor;

			_mfpOn(CLOSE_EVENT+'.'+AJAX_NS, _destroyAjaxRequest);
			_mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
		},
		getAjax: function(item) {

			if(_ajaxCur) {
				$(document.body).addClass(_ajaxCur);
			}

			mfp.updateStatus('loading');

			var opts = $.extend({
				url: item.src,
				success: function(data, textStatus, jqXHR) {
					var temp = {
						data:data,
						xhr:jqXHR
					};

					_mfpTrigger('ParseAjax', temp);

					mfp.appendContent( $(temp.data), AJAX_NS );

					item.finished = true;

					_removeAjaxCursor();

					mfp._setFocus();

					setTimeout(function() {
						mfp.wrap.addClass(READY_CLASS);
					}, 16);

					mfp.updateStatus('ready');

					_mfpTrigger('AjaxContentAdded');
				},
				error: function() {
					_removeAjaxCursor();
					item.finished = item.loadError = true;
					mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
				}
			}, mfp.st.ajax.settings);

			mfp.req = $.ajax(opts);

			return '';
		}
	}
});





	

/*>>ajax*/

/*>>image*/
var _imgInterval,
	_getTitle = function(item) {
		if(item.data && item.data.title !== undefined) 
			return item.data.title;

		var src = mfp.st.image.titleSrc;

		if(src) {
			if($.isFunction(src)) {
				return src.call(mfp, item);
			} else if(item.el) {
				return item.el.attr(src) || '';
			}
		}
		return '';
	};

$.magnificPopup.registerModule('image', {

	options: {
		markup: '<div class="mfp-figure">'+
					'<div class="mfp-close"></div>'+
					'<figure>'+
						'<div class="mfp-img"></div>'+
						'<figcaption>'+
							'<div class="mfp-bottom-bar">'+
								'<div class="mfp-title"></div>'+
								'<div class="mfp-counter"></div>'+
							'</div>'+
						'</figcaption>'+
					'</figure>'+
				'</div>',
		cursor: 'mfp-zoom-out-cur',
		titleSrc: 'title', 
		verticalFit: true,
		tError: wLocalizeMagnific.tErrorImage
	},

	proto: {
		initImage: function() {
			var imgSt = mfp.st.image,
				ns = '.image';

			mfp.types.push('image');

			_mfpOn(OPEN_EVENT+ns, function() {
				if(mfp.currItem.type === 'image' && imgSt.cursor) {
					$(document.body).addClass(imgSt.cursor);
				}
			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(imgSt.cursor) {
					$(document.body).removeClass(imgSt.cursor);
				}
				_window.off('resize' + EVENT_NS);
			});

			_mfpOn('Resize'+ns, mfp.resizeImage);
			if(mfp.isLowIE) {
				_mfpOn('AfterChange', mfp.resizeImage);
			}
		},
		resizeImage: function() {
			var item = mfp.currItem;
			if(!item || !item.img) return;

			if(mfp.st.image.verticalFit) {
				var decr = 0;
				// fix box-sizing in ie7/8
				if(mfp.isLowIE) {
					decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'),10);
				}
				item.img.css('max-height', mfp.wH-decr);
			}
		},
		_onImageHasSize: function(item) {
			if(item.img) {
				
				item.hasSize = true;

				if(_imgInterval) {
					clearInterval(_imgInterval);
				}
				
				item.isCheckingImgSize = false;

				_mfpTrigger('ImageHasSize', item);

				if(item.imgHidden) {
					if(mfp.content)
						mfp.content.removeClass('mfp-loading');
					
					item.imgHidden = false;
				}

			}
		},

		/**
		 * Function that loops until the image has size to display elements that rely on it asap
		 */
		findImageSize: function(item) {

			var counter = 0,
				img = item.img[0],
				mfpSetInterval = function(delay) {

					if(_imgInterval) {
						clearInterval(_imgInterval);
					}
					// decelerating interval that checks for size of an image
					_imgInterval = setInterval(function() {
						if(img.naturalWidth > 0) {
							mfp._onImageHasSize(item);
							return;
						}

						if(counter > 200) {
							clearInterval(_imgInterval);
						}

						counter++;
						if(counter === 3) {
							mfpSetInterval(10);
						} else if(counter === 40) {
							mfpSetInterval(50);
						} else if(counter === 100) {
							mfpSetInterval(500);
						}
					}, delay);
				};

			mfpSetInterval(1);
		},

		getImage: function(item, template) {

			var guard = 0,

				// image load complete handler
				onLoadComplete = function() {
					if(item) {
						if (item.img[0].complete) {
							item.img.off('.mfploader');
							
							if(item === mfp.currItem){
								mfp._onImageHasSize(item);

								mfp.updateStatus('ready');
							}

							item.hasSize = true;
							item.loaded = true;

							_mfpTrigger('ImageLoadComplete');
							
						}
						else {
							// if image complete check fails 200 times (20 sec), we assume that there was an error.
							guard++;
							if(guard < 200) {
								setTimeout(onLoadComplete,100);
							} else {
								onLoadError();
							}
						}
					}
				},

				// image error handler
				onLoadError = function() {
					if(item) {
						item.img.off('.mfploader');
						if(item === mfp.currItem){
							mfp._onImageHasSize(item);
							mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
						}

						item.hasSize = true;
						item.loaded = true;
						item.loadError = true;
					}
				},
				imgSt = mfp.st.image;


			var el = template.find('.mfp-img');
			if(el.length) {
				var img = document.createElement('img');
				img.className = 'mfp-img';
				if(item.el && item.el.find('img').length) {
					img.alt = item.el.find('img').attr('alt');
				}
				item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
				img.src = item.src;

				// without clone() "error" event is not firing when IMG is replaced by new IMG
				// TODO: find a way to avoid such cloning
				if(el.is('img')) {
					item.img = item.img.clone();
				}

				img = item.img[0];
				if(img.naturalWidth > 0) {
					item.hasSize = true;
				} else if(!img.width) {										
					item.hasSize = false;
				}
			}

			mfp._parseMarkup(template, {
				title: _getTitle(item),
				img_replaceWith: item.img
			}, item);

			mfp.resizeImage();

			if(item.hasSize) {
				if(_imgInterval) clearInterval(_imgInterval);

				if(item.loadError) {
					template.addClass('mfp-loading');
					mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src) );
				} else {
					template.removeClass('mfp-loading');
					mfp.updateStatus('ready');
				}
				return template;
			}

			mfp.updateStatus('loading');
			item.loading = true;

			if(!item.hasSize) {
				item.imgHidden = true;
				template.addClass('mfp-loading');
				mfp.findImageSize(item);
			} 

			return template;
		}
	}
});



/*>>image*/

/*>>zoom*/
var hasMozTransform,
	getHasMozTransform = function() {
		if(hasMozTransform === undefined) {
			hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
		}
		return hasMozTransform;		
	};

$.magnificPopup.registerModule('zoom', {

	options: {
		enabled: false,
		easing: 'ease-in-out',
		duration: 300,
		opener: function(element) {
			return element.is('img') ? element : element.find('img');
		}
	},

	proto: {

		initZoom: function() {
			var zoomSt = mfp.st.zoom,
				ns = '.zoom',
				image;
				
			if(!zoomSt.enabled || !mfp.supportsTransition) {
				return;
			}

			var duration = zoomSt.duration,
				getElToAnimate = function(image) {
					var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
						transition = 'all '+(zoomSt.duration/1000)+'s ' + zoomSt.easing,
						cssObj = {
							position: 'fixed',
							zIndex: 9999,
							left: 0,
							top: 0,
							'-webkit-backface-visibility': 'hidden'
						},
						t = 'transition';

					cssObj['-webkit-'+t] = cssObj['-moz-'+t] = cssObj['-o-'+t] = cssObj[t] = transition;

					newImg.css(cssObj);
					return newImg;
				},
				showMainContent = function() {
					mfp.content.css('visibility', 'visible');
				},
				openTimeout,
				animatedImg;

			_mfpOn('BuildControls'+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);
					mfp.content.css('visibility', 'hidden');

					// Basically, all code below does is clones existing image, puts in on top of the current one and animated it
					
					image = mfp._getItemToZoom();

					if(!image) {
						showMainContent();
						return;
					}

					animatedImg = getElToAnimate(image); 
					
					animatedImg.css( mfp._getOffset() );

					mfp.wrap.append(animatedImg);

					openTimeout = setTimeout(function() {
						animatedImg.css( mfp._getOffset( true ) );
						openTimeout = setTimeout(function() {

							showMainContent();

							setTimeout(function() {
								animatedImg.remove();
								image = animatedImg = null;
								_mfpTrigger('ZoomAnimationEnded');
							}, 16); // avoid blink when switching images 

						}, duration); // this timeout equals animation duration

					}, 16); // by adding this timeout we avoid short glitch at the beginning of animation


					// Lots of timeouts...
				}
			});
			_mfpOn(BEFORE_CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {

					clearTimeout(openTimeout);

					mfp.st.removalDelay = duration;

					if(!image) {
						image = mfp._getItemToZoom();
						if(!image) {
							return;
						}
						animatedImg = getElToAnimate(image);
					}
					
					
					animatedImg.css( mfp._getOffset(true) );
					mfp.wrap.append(animatedImg);
					mfp.content.css('visibility', 'hidden');
					
					setTimeout(function() {
						animatedImg.css( mfp._getOffset() );
					}, 16);
				}

			});

			_mfpOn(CLOSE_EVENT+ns, function() {
				if(mfp._allowZoom()) {
					showMainContent();
					if(animatedImg) {
						animatedImg.remove();
					}
					image = null;
				}	
			});
		},

		_allowZoom: function() {
			return mfp.currItem.type === 'image';
		},

		_getItemToZoom: function() {
			if(mfp.currItem.hasSize) {
				return mfp.currItem.img;
			} else {
				return false;
			}
		},

		// Get element postion relative to viewport
		_getOffset: function(isLarge) {
			var el;
			if(isLarge) {
				el = mfp.currItem.img;
			} else {
				el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
			}

			var offset = el.offset();
			var paddingTop = parseInt(el.css('padding-top'),10);
			var paddingBottom = parseInt(el.css('padding-bottom'),10);
			offset.top -= ( $(window).scrollTop() - paddingTop );


			/*
			
			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

			 */
			var obj = {
				width: el.width(),
				// fix Zepto height+padding issue
				height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
			};

			// I hate to do this, but there is no another option
			if( getHasMozTransform() ) {
				obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
			} else {
				obj.left = offset.left;
				obj.top = offset.top;
			}
			return obj;
		}

	}
});



/*>>zoom*/

/*>>iframe*/

var IFRAME_NS = 'iframe',
	_emptyPage = '//about:blank',
	
	_fixIframeBugs = function(isShowing) {
		if(mfp.currTemplate[IFRAME_NS]) {
			var el = mfp.currTemplate[IFRAME_NS].find('iframe');
			if(el.length) { 
				// reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
				if(!isShowing) {
					el[0].src = _emptyPage;
				}

				// IE8 black screen bug fix
				if(mfp.isIE8) {
					el.css('display', isShowing ? 'block' : 'none');
				}
			}
		}
	};

$.magnificPopup.registerModule(IFRAME_NS, {

	options: {
		markup: '<div class="mfp-iframe-scaler">'+
					'<div class="mfp-close"></div>'+
					'<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>'+
				'</div>',

		srcAction: 'iframe_src',

		// we don't care and support only one default type of URL by default
		patterns: {
			youtube: {
				index: 'youtube.com', 
				id: 'v=', 
				src: '//www.youtube.com/embed/%id%?autoplay=1'
			},
			vimeo: {
				index: 'vimeo.com/',
				id: '/',
				src: '//player.vimeo.com/video/%id%?autoplay=1'
			},
			gmaps: {
				index: '//maps.google.',
				src: '%id%&output=embed'
			}
		}
	},

	proto: {
		initIframe: function() {
			mfp.types.push(IFRAME_NS);

			_mfpOn('BeforeChange', function(e, prevType, newType) {
				if(prevType !== newType) {
					if(prevType === IFRAME_NS) {
						_fixIframeBugs(); // iframe if removed
					} else if(newType === IFRAME_NS) {
						_fixIframeBugs(true); // iframe is showing
					} 
				}// else {
					// iframe source is switched, don't do anything
				//}
			});

			_mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
				_fixIframeBugs();
			});
		},

		getIframe: function(item, template) {
			var embedSrc = item.src;
			var iframeSt = mfp.st.iframe;
				
			$.each(iframeSt.patterns, function() {
				if(embedSrc.indexOf( this.index ) > -1) {
					if(this.id) {
						if(typeof this.id === 'string') {
							embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id)+this.id.length, embedSrc.length);
						} else {
							embedSrc = this.id.call( this, embedSrc );
						}
					}
					embedSrc = this.src.replace('%id%', embedSrc );
					return false; // break;
				}
			});
			
			var dataObj = {};
			if(iframeSt.srcAction) {
				dataObj[iframeSt.srcAction] = embedSrc;
			}
			mfp._parseMarkup(template, dataObj, item);

			mfp.updateStatus('ready');

			return template;
		}
	}
});



/*>>iframe*/

/*>>gallery*/
/**
 * Get looped index depending on number of slides
 */
var _getLoopedId = function(index) {
		var numSlides = mfp.items.length;
		if(index > numSlides - 1) {
			return index - numSlides;
		} else  if(index < 0) {
			return numSlides + index;
		}
		return index;
	},
	_replaceCurrTotal = function(text, curr, total) {
		return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
	};

$.magnificPopup.registerModule('gallery', {

	options: {
		enabled: false,
		arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
		preload: [0,2],
		navigateByImgClick: true,
		arrows: true,

		tPrev: wLocalizeMagnific.tPrev,
		tNext: wLocalizeMagnific.tNext,
		tCounter: wLocalizeMagnific.tCounter
	},

	proto: {
		initGallery: function() {

			var gSt = mfp.st.gallery,
				ns = '.mfp-gallery',
				supportsFastClick = Boolean($.fn.mfpFastClick);

			mfp.direction = true; // true - next, false - prev
			
			if(!gSt || !gSt.enabled ) return false;

			_wrapClasses += ' mfp-gallery';

			_mfpOn(OPEN_EVENT+ns, function() {

				if(gSt.navigateByImgClick) {
					mfp.wrap.on('click'+ns, '.mfp-img', function() {
						if(mfp.items.length > 1) {
							mfp.next();
							return false;
						}
					});
				}

				_document.on('keydown'+ns, function(e) {
					if (e.keyCode === 37) {
						mfp.prev();
					} else if (e.keyCode === 39) {
						mfp.next();
					}
				});
			});

			_mfpOn('UpdateStatus'+ns, function(e, data) {
				if(data.text) {
					data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
				}
			});

			_mfpOn(MARKUP_PARSE_EVENT+ns, function(e, element, values, item) {
				var l = mfp.items.length;
				values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
			});

			_mfpOn('BuildControls' + ns, function() {
				if(mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
					var markup = gSt.arrowMarkup,
						arrowLeft = mfp.arrowLeft = $( markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left') ).addClass(PREVENT_CLOSE_CLASS),			
						arrowRight = mfp.arrowRight = $( markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right') ).addClass(PREVENT_CLOSE_CLASS);

					var eName = supportsFastClick ? 'mfpFastClick' : 'click';
					arrowLeft[eName](function() {
						mfp.prev();
					});			
					arrowRight[eName](function() {
						mfp.next();
					});	

					// Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
					if(mfp.isIE7) {
						_getEl('b', arrowLeft[0], false, true);
						_getEl('a', arrowLeft[0], false, true);
						_getEl('b', arrowRight[0], false, true);
						_getEl('a', arrowRight[0], false, true);
					}

					mfp.container.append(arrowLeft.add(arrowRight));
				}
			});

			_mfpOn(CHANGE_EVENT+ns, function() {
				if(mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

				mfp._preloadTimeout = setTimeout(function() {
					mfp.preloadNearbyImages();
					mfp._preloadTimeout = null;
				}, 16);		
			});


			_mfpOn(CLOSE_EVENT+ns, function() {
				_document.off(ns);
				mfp.wrap.off('click'+ns);
			
				if(mfp.arrowLeft && supportsFastClick) {
					mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
				}
				mfp.arrowRight = mfp.arrowLeft = null;
			});

		}, 
		next: function() {
			mfp.direction = true;
			mfp.index = _getLoopedId(mfp.index + 1);
			mfp.updateItemHTML();
		},
		prev: function() {
			mfp.direction = false;
			mfp.index = _getLoopedId(mfp.index - 1);
			mfp.updateItemHTML();
		},
		goTo: function(newIndex) {
			mfp.direction = (newIndex >= mfp.index);
			mfp.index = newIndex;
			mfp.updateItemHTML();
		},
		preloadNearbyImages: function() {
			var p = mfp.st.gallery.preload,
				preloadBefore = Math.min(p[0], mfp.items.length),
				preloadAfter = Math.min(p[1], mfp.items.length),
				i;

			for(i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
				mfp._preloadItem(mfp.index+i);
			}
			for(i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
				mfp._preloadItem(mfp.index-i);
			}
		},
		_preloadItem: function(index) {
			index = _getLoopedId(index);

			if(mfp.items[index].preloaded) {
				return;
			}

			var item = mfp.items[index];
			if(!item.parsed) {
				item = mfp.parseEl( index );
			}

			_mfpTrigger('LazyLoad', item);

			if(item.type === 'image') {
				item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
					item.hasSize = true;
				}).on('error.mfploader', function() {
					item.hasSize = true;
					item.loadError = true;
					_mfpTrigger('LazyLoadError', item);
				}).attr('src', item.src);
			}


			item.preloaded = true;
		}
	}
});

/*
Touch Support that might be implemented some day

addSwipeGesture: function() {
	var startX,
		moved,
		multipleTouches;

		return;

	var namespace = '.mfp',
		addEventNames = function(pref, down, move, up, cancel) {
			mfp._tStart = pref + down + namespace;
			mfp._tMove = pref + move + namespace;
			mfp._tEnd = pref + up + namespace;
			mfp._tCancel = pref + cancel + namespace;
		};

	if(window.navigator.msPointerEnabled) {
		addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
	} else if('ontouchstart' in window) {
		addEventNames('touch', 'start', 'move', 'end', 'cancel');
	} else {
		return;
	}
	_window.on(mfp._tStart, function(e) {
		var oE = e.originalEvent;
		multipleTouches = moved = false;
		startX = oE.pageX || oE.changedTouches[0].pageX;
	}).on(mfp._tMove, function(e) {
		if(e.originalEvent.touches.length > 1) {
			multipleTouches = e.originalEvent.touches.length;
		} else {
			//e.preventDefault();
			moved = true;
		}
	}).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
		if(moved && !multipleTouches) {
			var oE = e.originalEvent,
				diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

			if(diff > 20) {
				mfp.next();
			} else if(diff < -20) {
				mfp.prev();
			}
		}
	});
},
*/


/*>>gallery*/

/*>>retina*/

var RETINA_NS = 'retina';

$.magnificPopup.registerModule(RETINA_NS, {
	options: {
		replaceSrc: function(item) {
			return item.src.replace(/\.\w+$/, function(m) { return '@2x' + m; });
		},
		ratio: 1 // Function or number.  Set to 1 to disable.
	},
	proto: {
		initRetina: function() {
			if(window.devicePixelRatio > 1) {

				var st = mfp.st.retina,
					ratio = st.ratio;

				ratio = !isNaN(ratio) ? ratio : ratio();

				if(ratio > 1) {
					_mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
						item.img.css({
							'max-width': item.img[0].naturalWidth / ratio,
							'width': '100%'
						});
					});
					_mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
						item.src = st.replaceSrc(item, ratio);
					});
				}
			}

		}
	}
});

/*>>retina*/

/*>>fastclick*/
/**
 * FastClick event implementation. (removes 300ms delay on touch devices)
 * Based on https://developers.google.com/mobile/articles/fast_buttons
 *
 * You may use it outside the Magnific Popup by calling just:
 *
 * $('.your-el').mfpFastClick(function() {
 *     console.log('Clicked!');
 * });
 *
 * To unbind:
 * $('.your-el').destroyMfpFastClick();
 * 
 * 
 * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
 * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
 * 
 */

(function() {
	var ghostClickDelay = 1000,
		supportsTouch = 'ontouchstart' in window,
		unbindTouchMove = function() {
			_window.off('touchmove'+ns+' touchend'+ns);
		},
		eName = 'mfpFastClick',
		ns = '.'+eName;


	// As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
	$.fn.mfpFastClick = function(callback) {

		return $(this).each(function() {

			var elem = $(this),
				lock;

			if( supportsTouch ) {

				var timeout,
					startX,
					startY,
					pointerMoved,
					point,
					numPointers;

				elem.on('touchstart' + ns, function(e) {
					pointerMoved = false;
					numPointers = 1;

					point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
					startX = point.clientX;
					startY = point.clientY;

					_window.on('touchmove'+ns, function(e) {
						point = e.originalEvent ? e.originalEvent.touches : e.touches;
						numPointers = point.length;
						point = point[0];
						if (Math.abs(point.clientX - startX) > 10 ||
							Math.abs(point.clientY - startY) > 10) {
							pointerMoved = true;
							unbindTouchMove();
						}
					}).on('touchend'+ns, function(e) {
						unbindTouchMove();
						if(pointerMoved || numPointers > 1) {
							return;
						}
						lock = true;
						e.preventDefault();
						clearTimeout(timeout);
						timeout = setTimeout(function() {
							lock = false;
						}, ghostClickDelay);
						callback();
					});
				});

			}

			elem.on('click' + ns, function() {
				if(!lock) {
					callback();
				}
			});
		});
	};

	$.fn.destroyMfpFastClick = function() {
		$(this).off('touchstart' + ns + ' click' + ns);
		if(supportsTouch) _window.off('touchmove'+ns+' touchend'+ns);
	};
})();

/*>>fastclick*/
 _checkInstance(); }));
/*jquery.mmenu.all.min.js*/
/*
 * jQuery mmenu v5.6.3
 * @requires jQuery 1.7.0 or later
 *
 * mmenu.frebsite.nl
 *	
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * License: CC-BY-NC-4.0
 * http://creativecommons.org/licenses/by-nc/4.0/
 */
!function(e){function t(){e[n].glbl||(r={$wndw:e(window),$docu:e(document),$html:e("html"),$body:e("body")},i={},a={},o={},e.each([i,a,o],function(e,t){t.add=function(e){e=e.split(" ");for(var n=0,s=e.length;s>n;n++)t[e[n]]=t.mm(e[n])}}),i.mm=function(e){return"mm-"+e},i.add("wrapper menu panels panel nopanel current highest opened subopened navbar hasnavbar title btn prev next listview nolistview inset vertical selected divider spacer hidden fullsubopen"),i.umm=function(e){return"mm-"==e.slice(0,3)&&(e=e.slice(3)),e},a.mm=function(e){return"mm-"+e},a.add("parent sub"),o.mm=function(e){return e+".mm"},o.add("transitionend webkitTransitionEnd click scroll keydown mousedown mouseup touchstart touchmove touchend orientationchange"),e[n]._c=i,e[n]._d=a,e[n]._e=o,e[n].glbl=r)}var n="mmenu",s="5.6.3";if(!(e[n]&&e[n].version>s)){e[n]=function(e,t,n){this.$menu=e,this._api=["bind","init","update","setSelected","getInstance","openPanel","closePanel","closeAllPanels"],this.opts=t,this.conf=n,this.vars={},this.cbck={},"function"==typeof this.___deprecated&&this.___deprecated(),this._initMenu(),this._initAnchors();var s=this.$pnls.children();return this._initAddons(),this.init(s),"function"==typeof this.___debug&&this.___debug(),this},e[n].version=s,e[n].addons={},e[n].uniqueId=0,e[n].defaults={extensions:[],navbar:{add:!0,title:"Menu",titleLink:"panel"},onClick:{setSelected:!0},slidingSubmenus:!0},e[n].configuration={classNames:{divider:"Divider",inset:"Inset",panel:"Panel",selected:"Selected",spacer:"Spacer",vertical:"Vertical"},clone:!1,openingInterval:25,panelNodetype:"ul, ol, div",transitionDuration:400},e[n].prototype={init:function(e){e=e.not("."+i.nopanel),e=this._initPanels(e),this.trigger("init",e),this.trigger("update")},update:function(){this.trigger("update")},setSelected:function(e){this.$menu.find("."+i.listview).children().removeClass(i.selected),e.addClass(i.selected),this.trigger("setSelected",e)},openPanel:function(t){var s=t.parent(),a=this;if(s.hasClass(i.vertical)){var o=s.parents("."+i.subopened);if(o.length)return void this.openPanel(o.first());s.addClass(i.opened),this.trigger("openPanel",t),this.trigger("openingPanel",t),this.trigger("openedPanel",t)}else{if(t.hasClass(i.current))return;var r=this.$pnls.children("."+i.panel),l=r.filter("."+i.current);r.removeClass(i.highest).removeClass(i.current).not(t).not(l).not("."+i.vertical).addClass(i.hidden),e[n].support.csstransitions||l.addClass(i.hidden),t.hasClass(i.opened)?t.nextAll("."+i.opened).addClass(i.highest).removeClass(i.opened).removeClass(i.subopened):(t.addClass(i.highest),l.addClass(i.subopened)),t.removeClass(i.hidden).addClass(i.current),a.trigger("openPanel",t),setTimeout(function(){t.removeClass(i.subopened).addClass(i.opened),a.trigger("openingPanel",t),a.__transitionend(t,function(){a.trigger("openedPanel",t)},a.conf.transitionDuration)},this.conf.openingInterval)}},closePanel:function(e){var t=e.parent();t.hasClass(i.vertical)&&(t.removeClass(i.opened),this.trigger("closePanel",e),this.trigger("closingPanel",e),this.trigger("closedPanel",e))},closeAllPanels:function(){this.$menu.find("."+i.listview).children().removeClass(i.selected).filter("."+i.vertical).removeClass(i.opened);var e=this.$pnls.children("."+i.panel),t=e.first();this.$pnls.children("."+i.panel).not(t).removeClass(i.subopened).removeClass(i.opened).removeClass(i.current).removeClass(i.highest).addClass(i.hidden),this.openPanel(t)},togglePanel:function(e){var t=e.parent();t.hasClass(i.vertical)&&this[t.hasClass(i.opened)?"closePanel":"openPanel"](e)},getInstance:function(){return this},bind:function(e,t){this.cbck[e]=this.cbck[e]||[],this.cbck[e].push(t)},trigger:function(){var e=this,t=Array.prototype.slice.call(arguments),n=t.shift();if(this.cbck[n])for(var s=0,i=this.cbck[n].length;i>s;s++)this.cbck[n][s].apply(e,t)},_initMenu:function(){this.$menu.attr("id",this.$menu.attr("id")||this.__getUniqueId()),this.conf.clone&&(this.$menu=this.$menu.clone(!0),this.$menu.add(this.$menu.find("[id]")).filter("[id]").each(function(){e(this).attr("id",i.mm(e(this).attr("id")))})),this.$menu.contents().each(function(){3==e(this)[0].nodeType&&e(this).remove()}),this.$pnls=e('<div class="'+i.panels+'" />').append(this.$menu.children(this.conf.panelNodetype)).prependTo(this.$menu),this.$menu.parent().addClass(i.wrapper);var t=[i.menu];this.opts.slidingSubmenus||t.push(i.vertical),this.opts.extensions=this.opts.extensions.length?"mm-"+this.opts.extensions.join(" mm-"):"",this.opts.extensions&&t.push(this.opts.extensions),this.$menu.addClass(t.join(" "))},_initPanels:function(t){var n=this,s=this.__findAddBack(t,"ul, ol");this.__refactorClass(s,this.conf.classNames.inset,"inset").addClass(i.nolistview+" "+i.nopanel),s.not("."+i.nolistview).addClass(i.listview);var o=this.__findAddBack(t,"."+i.listview).children();this.__refactorClass(o,this.conf.classNames.selected,"selected"),this.__refactorClass(o,this.conf.classNames.divider,"divider"),this.__refactorClass(o,this.conf.classNames.spacer,"spacer"),this.__refactorClass(this.__findAddBack(t,"."+this.conf.classNames.panel),this.conf.classNames.panel,"panel");var r=e(),l=t.add(t.find("."+i.panel)).add(this.__findAddBack(t,"."+i.listview).children().children(this.conf.panelNodetype)).not("."+i.nopanel);this.__refactorClass(l,this.conf.classNames.vertical,"vertical"),this.opts.slidingSubmenus||l.addClass(i.vertical),l.each(function(){var t=e(this),s=t;t.is("ul, ol")?(t.wrap('<div class="'+i.panel+'" />'),s=t.parent()):s.addClass(i.panel);var a=t.attr("id");t.removeAttr("id"),s.attr("id",a||n.__getUniqueId()),t.hasClass(i.vertical)&&(t.removeClass(n.conf.classNames.vertical),s.add(s.parent()).addClass(i.vertical)),r=r.add(s)});var d=e("."+i.panel,this.$menu);r.each(function(t){var s,o,r=e(this),l=r.parent(),d=l.children("a, span").first();if(l.is("."+i.panels)||(l.data(a.sub,r),r.data(a.parent,l)),l.children("."+i.next).length||l.parent().is("."+i.listview)&&(s=r.attr("id"),o=e('<a class="'+i.next+'" href="#'+s+'" data-target="#'+s+'" />').insertBefore(d),d.is("span")&&o.addClass(i.fullsubopen)),!r.children("."+i.navbar).length&&!l.hasClass(i.vertical)){l.parent().is("."+i.listview)?l=l.closest("."+i.panel):(d=l.closest("."+i.panel).find('a[href="#'+r.attr("id")+'"]').first(),l=d.closest("."+i.panel));var c=e('<div class="'+i.navbar+'" />');if(l.length){switch(s=l.attr("id"),n.opts.navbar.titleLink){case"anchor":_url=d.attr("href");break;case"panel":case"parent":_url="#"+s;break;default:_url=!1}c.append('<a class="'+i.btn+" "+i.prev+'" href="#'+s+'" data-target="#'+s+'" />').append(e('<a class="'+i.title+'"'+(_url?' href="'+_url+'"':"")+" />").text(d.text())).prependTo(r),n.opts.navbar.add&&r.addClass(i.hasnavbar)}else n.opts.navbar.title&&(c.append('<a class="'+i.title+'">'+n.opts.navbar.title+"</a>").prependTo(r),n.opts.navbar.add&&r.addClass(i.hasnavbar))}});var c=this.__findAddBack(t,"."+i.listview).children("."+i.selected).removeClass(i.selected).last().addClass(i.selected);c.add(c.parentsUntil("."+i.menu,"li")).filter("."+i.vertical).addClass(i.opened).end().each(function(){e(this).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).addClass(i.subopened)}),c.children("."+i.panel).not("."+i.vertical).addClass(i.opened).parentsUntil("."+i.menu,"."+i.panel).not("."+i.vertical).first().addClass(i.opened).addClass(i.subopened);var h=d.filter("."+i.opened);return h.length||(h=r.first()),h.addClass(i.opened).last().addClass(i.current),r.not("."+i.vertical).not(h.last()).addClass(i.hidden).end().filter(function(){return!e(this).parent().hasClass(i.panels)}).appendTo(this.$pnls),r},_initAnchors:function(){var t=this;r.$body.on(o.click+"-oncanvas","a[href]",function(s){var a=e(this),o=!1,r=t.$menu.find(a).length;for(var l in e[n].addons)if(e[n].addons[l].clickAnchor.call(t,a,r)){o=!0;break}var d=a.attr("href");if(!o&&r&&d.length>1&&"#"==d.slice(0,1))try{var c=e(d,t.$menu);c.is("."+i.panel)&&(o=!0,t[a.parent().hasClass(i.vertical)?"togglePanel":"openPanel"](c))}catch(h){}if(o&&s.preventDefault(),!o&&r&&a.is("."+i.listview+" > li > a")&&!a.is('[rel="external"]')&&!a.is('[target="_blank"]')){t.__valueOrFn(t.opts.onClick.setSelected,a)&&t.setSelected(e(s.target).parent());var u=t.__valueOrFn(t.opts.onClick.preventDefault,a,"#"==d.slice(0,1));u&&s.preventDefault(),t.__valueOrFn(t.opts.onClick.close,a,u)&&t.close()}})},_initAddons:function(){var t;for(t in e[n].addons)e[n].addons[t].add.call(this),e[n].addons[t].add=function(){};for(t in e[n].addons)e[n].addons[t].setup.call(this)},_getOriginalMenuId:function(){var e=this.$menu.attr("id");return e&&e.length&&this.conf.clone&&(e=i.umm(e)),e},__api:function(){var t=this,n={};return e.each(this._api,function(e){var s=this;n[s]=function(){var e=t[s].apply(t,arguments);return"undefined"==typeof e?n:e}}),n},__valueOrFn:function(e,t,n){return"function"==typeof e?e.call(t[0]):"undefined"==typeof e&&"undefined"!=typeof n?n:e},__refactorClass:function(e,t,n){return e.filter("."+t).removeClass(t).addClass(i[n])},__findAddBack:function(e,t){return e.find(t).add(e.filter(t))},__filterListItems:function(e){return e.not("."+i.divider).not("."+i.hidden)},__transitionend:function(e,t,n){var s=!1,i=function(){s||t.call(e[0]),s=!0};e.one(o.transitionend,i),e.one(o.webkitTransitionEnd,i),setTimeout(i,1.1*n)},__getUniqueId:function(){return i.mm(e[n].uniqueId++)}},e.fn[n]=function(s,i){return t(),s=e.extend(!0,{},e[n].defaults,s),i=e.extend(!0,{},e[n].configuration,i),this.each(function(){var t=e(this);if(!t.data(n)){var a=new e[n](t,s,i);a.$menu.data(n,a.__api())}})},e[n].support={touch:"ontouchstart"in window||navigator.msMaxTouchPoints||!1,csstransitions:function(){if("undefined"!=typeof Modernizr&&"undefined"!=typeof Modernizr.csstransitions)return Modernizr.csstransitions;var e=document.body||document.documentElement,t=e.style,n="transition";if("string"==typeof t[n])return!0;var s=["Moz","webkit","Webkit","Khtml","O","ms"];n=n.charAt(0).toUpperCase()+n.substr(1);for(var i=0;i<s.length;i++)if("string"==typeof t[s[i]+n])return!0;return!1}()};var i,a,o,r}}(jQuery),/*	
 * jQuery mmenu offCanvas addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="offCanvas";e[t].addons[n]={setup:function(){if(this.opts[n]){var i=this.opts[n],a=this.conf[n];o=e[t].glbl,this._api=e.merge(this._api,["open","close","setPage"]),("top"==i.position||"bottom"==i.position)&&(i.zposition="front"),"string"!=typeof a.pageSelector&&(a.pageSelector="> "+a.pageNodetype),o.$allMenus=(o.$allMenus||e()).add(this.$menu),this.vars.opened=!1;var r=[s.offcanvas];"left"!=i.position&&r.push(s.mm(i.position)),"back"!=i.zposition&&r.push(s.mm(i.zposition)),this.$menu.addClass(r.join(" ")).parent().removeClass(s.wrapper),this.setPage(o.$page),this._initBlocker(),this["_initWindow_"+n](),this.$menu[a.menuInjectMethod+"To"](a.menuWrapperSelector);var l=window.location.hash;if(l){var d=this._getOriginalMenuId();d&&d==l.slice(1)&&this.open()}}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("offcanvas slideout blocking modal background opening blocker page"),i.add("style"),a.add("resize")},clickAnchor:function(e,t){if(!this.opts[n])return!1;var s=this._getOriginalMenuId();if(s&&e.is('[href="#'+s+'"]'))return this.open(),!0;if(o.$page)return s=o.$page.first().attr("id"),s&&e.is('[href="#'+s+'"]')?(this.close(),!0):!1}},e[t].defaults[n]={position:"left",zposition:"back",blockUI:!0,moveBackground:!0},e[t].configuration[n]={pageNodetype:"div",pageSelector:null,noPageSelector:[],wrapPageIfNeeded:!0,menuWrapperSelector:"body",menuInjectMethod:"prepend"},e[t].prototype.open=function(){if(!this.vars.opened){var e=this;this._openSetup(),setTimeout(function(){e._openFinish()},this.conf.openingInterval),this.trigger("open")}},e[t].prototype._openSetup=function(){var t=this,r=this.opts[n];this.closeAllOthers(),o.$page.each(function(){e(this).data(i.style,e(this).attr("style")||"")}),o.$wndw.trigger(a.resize+"-"+n,[!0]);var l=[s.opened];r.blockUI&&l.push(s.blocking),"modal"==r.blockUI&&l.push(s.modal),r.moveBackground&&l.push(s.background),"left"!=r.position&&l.push(s.mm(this.opts[n].position)),"back"!=r.zposition&&l.push(s.mm(this.opts[n].zposition)),this.opts.extensions&&l.push(this.opts.extensions),o.$html.addClass(l.join(" ")),setTimeout(function(){t.vars.opened=!0},this.conf.openingInterval),this.$menu.addClass(s.current+" "+s.opened)},e[t].prototype._openFinish=function(){var e=this;this.__transitionend(o.$page.first(),function(){e.trigger("opened")},this.conf.transitionDuration),o.$html.addClass(s.opening),this.trigger("opening")},e[t].prototype.close=function(){if(this.vars.opened){var t=this;this.__transitionend(o.$page.first(),function(){t.$menu.removeClass(s.current).removeClass(s.opened),o.$html.removeClass(s.opened).removeClass(s.blocking).removeClass(s.modal).removeClass(s.background).removeClass(s.mm(t.opts[n].position)).removeClass(s.mm(t.opts[n].zposition)),t.opts.extensions&&o.$html.removeClass(t.opts.extensions),o.$page.each(function(){e(this).attr("style",e(this).data(i.style))}),t.vars.opened=!1,t.trigger("closed")},this.conf.transitionDuration),o.$html.removeClass(s.opening),this.trigger("close"),this.trigger("closing")}},e[t].prototype.closeAllOthers=function(){o.$allMenus.not(this.$menu).each(function(){var n=e(this).data(t);n&&n.close&&n.close()})},e[t].prototype.setPage=function(t){var i=this,a=this.conf[n];t&&t.length||(t=o.$body.find(a.pageSelector),a.noPageSelector.length&&(t=t.not(a.noPageSelector.join(", "))),t.length>1&&a.wrapPageIfNeeded&&(t=t.wrapAll("<"+this.conf[n].pageNodetype+" />").parent())),t.each(function(){e(this).attr("id",e(this).attr("id")||i.__getUniqueId())}),t.addClass(s.page+" "+s.slideout),o.$page=t,this.trigger("setPage",t)},e[t].prototype["_initWindow_"+n]=function(){o.$wndw.off(a.keydown+"-"+n).on(a.keydown+"-"+n,function(e){return o.$html.hasClass(s.opened)&&9==e.keyCode?(e.preventDefault(),!1):void 0});var e=0;o.$wndw.off(a.resize+"-"+n).on(a.resize+"-"+n,function(t,n){if(1==o.$page.length&&(n||o.$html.hasClass(s.opened))){var i=o.$wndw.height();(n||i!=e)&&(e=i,o.$page.css("minHeight",i))}})},e[t].prototype._initBlocker=function(){var t=this;this.opts[n].blockUI&&(o.$blck||(o.$blck=e('<div id="'+s.blocker+'" class="'+s.slideout+'" />')),o.$blck.appendTo(o.$body).off(a.touchstart+"-"+n+" "+a.touchmove+"-"+n).on(a.touchstart+"-"+n+" "+a.touchmove+"-"+n,function(e){e.preventDefault(),e.stopPropagation(),o.$blck.trigger(a.mousedown+"-"+n)}).off(a.mousedown+"-"+n).on(a.mousedown+"-"+n,function(e){e.preventDefault(),o.$html.hasClass(s.modal)||(t.closeAllOthers(),t.close())}))};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu scrollBugFix addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="scrollBugFix";e[t].addons[n]={setup:function(){var i=this,r=this.opts[n];this.conf[n];if(o=e[t].glbl,e[t].support.touch&&this.opts.offCanvas&&this.opts.offCanvas.blockUI&&("boolean"==typeof r&&(r={fix:r}),"object"!=typeof r&&(r={}),r=this.opts[n]=e.extend(!0,{},e[t].defaults[n],r),r.fix)){var l=this.$menu.attr("id"),d=!1;this.bind("opening",function(){this.$pnls.children("."+s.current).scrollTop(0)}),o.$docu.on(a.touchmove,function(e){i.vars.opened&&e.preventDefault()}),o.$body.on(a.touchstart,"#"+l+"> ."+s.panels+"> ."+s.current,function(e){i.vars.opened&&(d||(d=!0,0===e.currentTarget.scrollTop?e.currentTarget.scrollTop=1:e.currentTarget.scrollHeight===e.currentTarget.scrollTop+e.currentTarget.offsetHeight&&(e.currentTarget.scrollTop-=1),d=!1))}).on(a.touchmove,"#"+l+"> ."+s.panels+"> ."+s.current,function(t){i.vars.opened&&e(this)[0].scrollHeight>e(this).innerHeight()&&t.stopPropagation()}),o.$wndw.on(a.orientationchange,function(){i.$pnls.children("."+s.current).scrollTop(0).css({"-webkit-overflow-scrolling":"auto"}).css({"-webkit-overflow-scrolling":"touch"})})}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e},clickAnchor:function(e,t){}},e[t].defaults[n]={fix:!0};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu autoHeight addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="autoHeight";e[t].addons[n]={setup:function(){if(this.opts.offCanvas){var i=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof i&&i&&(i={height:"auto"}),"string"==typeof i&&(i={height:i}),"object"!=typeof i&&(i={}),i=this.opts[n]=e.extend(!0,{},e[t].defaults[n],i),"auto"==i.height||"highest"==i.height){this.$menu.addClass(s.autoheight);var a=function(t){if(this.vars.opened){var n=parseInt(this.$pnls.css("top"),10)||0,a=parseInt(this.$pnls.css("bottom"),10)||0,o=0;this.$menu.addClass(s.measureheight),"auto"==i.height?(t=t||this.$pnls.children("."+s.current),t.is("."+s.vertical)&&(t=t.parents("."+s.panel).not("."+s.vertical).first()),o=t.outerHeight()):"highest"==i.height&&this.$pnls.children().each(function(){var t=e(this);t.is("."+s.vertical)&&(t=t.parents("."+s.panel).not("."+s.vertical).first()),o=Math.max(o,t.outerHeight())}),this.$menu.height(o+n+a).removeClass(s.measureheight)}};this.bind("opening",a),"highest"==i.height&&this.bind("init",a),"auto"==i.height&&(this.bind("update",a),this.bind("openPanel",a),this.bind("closePanel",a))}}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("autoheight measureheight"),a.add("resize")},clickAnchor:function(e,t){}},e[t].defaults[n]={height:"default"};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu backButton addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="backButton";e[t].addons[n]={setup:function(){if(this.opts.offCanvas){var i=this,a=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof a&&(a={close:a}),"object"!=typeof a&&(a={}),a=e.extend(!0,{},e[t].defaults[n],a),a.close){var r="#"+i.$menu.attr("id");this.bind("opened",function(e){location.hash!=r&&history.pushState(null,document.title,r)}),e(window).on("popstate",function(e){o.$html.hasClass(s.opened)?(e.stopPropagation(),i.close()):location.hash==r&&(e.stopPropagation(),i.open())})}}},add:function(){return window.history&&window.history.pushState?(s=e[t]._c,i=e[t]._d,void(a=e[t]._e)):void(e[t].addons[n].setup=function(){})},clickAnchor:function(e,t){}},e[t].defaults[n]={close:!1};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu columns addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="columns";e[t].addons[n]={setup:function(){var i=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof i&&(i={add:i}),"number"==typeof i&&(i={add:!0,visible:i}),"object"!=typeof i&&(i={}),"number"==typeof i.visible&&(i.visible={min:i.visible,max:i.visible}),i=this.opts[n]=e.extend(!0,{},e[t].defaults[n],i),i.add){i.visible.min=Math.max(1,Math.min(6,i.visible.min)),i.visible.max=Math.max(i.visible.min,Math.min(6,i.visible.max)),this.$menu.addClass(s.columns);for(var a=this.opts.offCanvas?this.$menu.add(o.$html):this.$menu,r=[],l=0;l<=i.visible.max;l++)r.push(s.columns+"-"+l);r=r.join(" ");var d=function(e){u.call(this,this.$pnls.children("."+s.current)),i.hideNavbars&&e.removeClass(s.hasnavbar)},c=function(){var e=this.$pnls.children("."+s.panel).filter("."+s.opened).length;e=Math.min(i.visible.max,Math.max(i.visible.min,e)),a.removeClass(r).addClass(s.columns+"-"+e)},h=function(){this.opts.offCanvas&&o.$html.removeClass(r)},u=function(t){this.$pnls.children("."+s.panel).removeClass(r).filter("."+s.subopened).removeClass(s.hidden).add(t).slice(-i.visible.max).each(function(t){e(this).addClass(s.columns+"-"+t)})};this.bind("open",c),this.bind("close",h),this.bind("init",d),this.bind("openPanel",u),this.bind("openingPanel",c),this.bind("openedPanel",c),this.opts.offCanvas||c.call(this)}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("columns")},clickAnchor:function(t,i){if(!this.opts[n].add)return!1;if(i){var a=t.attr("href");if(a.length>1&&"#"==a.slice(0,1))try{var o=e(a,this.$menu);if(o.is("."+s.panel))for(var r=parseInt(t.closest("."+s.panel).attr("class").split(s.columns+"-")[1].split(" ")[0],10)+1;r!==!1;){var l=this.$pnls.children("."+s.columns+"-"+r);if(!l.length){r=!1;break}r++,l.removeClass(s.subopened).removeClass(s.opened).removeClass(s.current).removeClass(s.highest).addClass(s.hidden)}}catch(d){}}}},e[t].defaults[n]={add:!1,visible:{min:1,max:3},hideNavbars:!1};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu counters addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="counters";e[t].addons[n]={setup:function(){var a=this,r=this.opts[n];this.conf[n];o=e[t].glbl,"boolean"==typeof r&&(r={add:r,update:r}),"object"!=typeof r&&(r={}),r=this.opts[n]=e.extend(!0,{},e[t].defaults[n],r),this.bind("init",function(t){this.__refactorClass(e("em",t),this.conf.classNames[n].counter,"counter")}),r.add&&this.bind("init",function(t){var n;switch(r.addTo){case"panels":n=t;break;default:n=t.filter(r.addTo)}n.each(function(){var t=e(this).data(i.parent);t&&(t.children("em."+s.counter).length||t.prepend(e('<em class="'+s.counter+'" />')))})}),r.update&&this.bind("update",function(){this.$pnls.children("."+s.panel).each(function(){var t=e(this),n=t.data(i.parent);if(n){var o=n.children("em."+s.counter);o.length&&(t=t.children("."+s.listview),t.length&&o.html(a.__filterListItems(t.children()).length))}})})},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("counter search noresultsmsg")},clickAnchor:function(e,t){}},e[t].defaults[n]={add:!1,addTo:"panels",update:!1},e[t].configuration.classNames[n]={counter:"Counter"};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu dividers addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="dividers";e[t].addons[n]={setup:function(){var i=this,r=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof r&&(r={add:r,fixed:r}),"object"!=typeof r&&(r={}),r=this.opts[n]=e.extend(!0,{},e[t].defaults[n],r),this.bind("init",function(t){this.__refactorClass(e("li",this.$menu),this.conf.classNames[n].collapsed,"collapsed")}),r.add&&this.bind("init",function(t){var n;switch(r.addTo){case"panels":n=t;break;default:n=t.filter(r.addTo)}e("."+s.divider,n).remove(),n.find("."+s.listview).not("."+s.vertical).each(function(){var t="";i.__filterListItems(e(this).children()).each(function(){var n=e.trim(e(this).children("a, span").text()).slice(0,1).toLowerCase();n!=t&&n.length&&(t=n,e('<li class="'+s.divider+'">'+n+"</li>").insertBefore(this))})})}),r.collapse&&this.bind("init",function(t){e("."+s.divider,t).each(function(){var t=e(this),n=t.nextUntil("."+s.divider,"."+s.collapsed);n.length&&(t.children("."+s.subopen).length||(t.wrapInner("<span />"),t.prepend('<a href="#" class="'+s.subopen+" "+s.fullsubopen+'" />')))})}),r.fixed){var l=function(t){t=t||this.$pnls.children("."+s.current);var n=t.find("."+s.divider).not("."+s.hidden);if(n.length){this.$menu.addClass(s.hasdividers);var i=t.scrollTop()||0,a="";t.is(":visible")&&t.find("."+s.divider).not("."+s.hidden).each(function(){e(this).position().top+i<i+1&&(a=e(this).text())}),this.$fixeddivider.text(a)}else this.$menu.removeClass(s.hasdividers)};this.$fixeddivider=e('<ul class="'+s.listview+" "+s.fixeddivider+'"><li class="'+s.divider+'"></li></ul>').prependTo(this.$pnls).children(),this.bind("openPanel",l),this.bind("update",l),this.bind("init",function(t){t.off(a.scroll+"-dividers "+a.touchmove+"-dividers").on(a.scroll+"-dividers "+a.touchmove+"-dividers",function(t){l.call(i,e(this))})})}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("collapsed uncollapsed fixeddivider hasdividers"),a.add("scroll")},clickAnchor:function(e,t){if(this.opts[n].collapse&&t){var i=e.parent();if(i.is("."+s.divider)){var a=i.nextUntil("."+s.divider,"."+s.collapsed);return i.toggleClass(s.opened),a[i.hasClass(s.opened)?"addClass":"removeClass"](s.uncollapsed),!0}}return!1}},e[t].defaults[n]={add:!1,addTo:"panels",fixed:!1,collapse:!1},e[t].configuration.classNames[n]={collapsed:"Collapsed"};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu dragOpen addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){function t(e,t,n){return t>e&&(e=t),e>n&&(e=n),e}var n="mmenu",s="dragOpen";e[n].addons[s]={setup:function(){if(this.opts.offCanvas){var a=this,o=this.opts[s],l=this.conf[s];if(r=e[n].glbl,"boolean"==typeof o&&(o={open:o}),"object"!=typeof o&&(o={}),o=this.opts[s]=e.extend(!0,{},e[n].defaults[s],o),o.open){var d,c,h,u,p,f={},v=0,m=!1,g=!1,b=0,_=0;switch(this.opts.offCanvas.position){case"left":case"right":f.events="panleft panright",f.typeLower="x",f.typeUpper="X",g="width";break;case"top":case"bottom":f.events="panup pandown",f.typeLower="y",f.typeUpper="Y",g="height"}switch(this.opts.offCanvas.position){case"right":case"bottom":f.negative=!0,u=function(e){e>=r.$wndw[g]()-o.maxStartPos&&(v=1)};break;default:f.negative=!1,u=function(e){e<=o.maxStartPos&&(v=1)}}switch(this.opts.offCanvas.position){case"left":f.open_dir="right",f.close_dir="left";break;case"right":f.open_dir="left",f.close_dir="right";break;case"top":f.open_dir="down",f.close_dir="up";break;case"bottom":f.open_dir="up",f.close_dir="down"}switch(this.opts.offCanvas.zposition){case"front":p=function(){return this.$menu};break;default:p=function(){return e("."+i.slideout)}}var C=this.__valueOrFn(o.pageNode,this.$menu,r.$page);"string"==typeof C&&(C=e(C));var $=new Hammer(C[0],o.vendors.hammer);$.on("panstart",function(e){u(e.center[f.typeLower]),r.$slideOutNodes=p(),m=f.open_dir}).on(f.events+" panend",function(e){v>0&&e.preventDefault()}).on(f.events,function(e){if(d=e["delta"+f.typeUpper],f.negative&&(d=-d),d!=b&&(m=d>=b?f.open_dir:f.close_dir),b=d,b>o.threshold&&1==v){if(r.$html.hasClass(i.opened))return;v=2,a._openSetup(),a.trigger("opening"),r.$html.addClass(i.dragging),_=t(r.$wndw[g]()*l[g].perc,l[g].min,l[g].max)}2==v&&(c=t(b,10,_)-("front"==a.opts.offCanvas.zposition?_:0),f.negative&&(c=-c),h="translate"+f.typeUpper+"("+c+"px )",r.$slideOutNodes.css({"-webkit-transform":"-webkit-"+h,transform:h}))}).on("panend",function(e){2==v&&(r.$html.removeClass(i.dragging),r.$slideOutNodes.css("transform",""),a[m==f.open_dir?"_openFinish":"close"]()),v=0})}}},add:function(){return"function"!=typeof Hammer||Hammer.VERSION<2?void(e[n].addons[s].setup=function(){}):(i=e[n]._c,a=e[n]._d,o=e[n]._e,void i.add("dragging"))},clickAnchor:function(e,t){}},e[n].defaults[s]={open:!1,maxStartPos:100,threshold:50,vendors:{hammer:{}}},e[n].configuration[s]={width:{perc:.8,min:140,max:440},height:{perc:.8,min:140,max:880}};var i,a,o,r}(jQuery),/*	
 * jQuery mmenu dropdown addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="dropdown";e[t].addons[n]={setup:function(){if(this.opts.offCanvas){var r=this,l=this.opts[n],d=this.conf[n];if(o=e[t].glbl,"boolean"==typeof l&&l&&(l={drop:l}),"object"!=typeof l&&(l={}),"string"==typeof l.position&&(l.position={of:l.position}),l=this.opts[n]=e.extend(!0,{},e[t].defaults[n],l),l.drop){if("string"!=typeof l.position.of){var c=this.$menu.attr("id");c&&c.length&&(this.conf.clone&&(c=s.umm(c)),l.position.of='[href="#'+c+'"]')}if("string"==typeof l.position.of){var h=e(l.position.of);if(h.length){this.$menu.addClass(s.dropdown),l.tip&&this.$menu.addClass(s.tip),l.event=l.event.split(" "),1==l.event.length&&(l.event[1]=l.event[0]),"hover"==l.event[0]&&h.on(a.mouseenter+"-dropdown",function(){r.open()}),"hover"==l.event[1]&&this.$menu.on(a.mouseleave+"-dropdown",function(){r.close()}),this.bind("opening",function(){this.$menu.data(i.style,this.$menu.attr("style")||""),o.$html.addClass(s.dropdown)}),this.bind("closed",function(){this.$menu.attr("style",this.$menu.data(i.style)),o.$html.removeClass(s.dropdown)});var u=function(i,a){var r=a[0],c=a[1],u="x"==i?"scrollLeft":"scrollTop",p="x"==i?"outerWidth":"outerHeight",f="x"==i?"left":"top",v="x"==i?"right":"bottom",m="x"==i?"width":"height",g="x"==i?"maxWidth":"maxHeight",b=null,_=o.$wndw[u](),C=h.offset()[f]-=_,$=C+h[p](),y=o.$wndw[m](),x=d.offset.button[i]+d.offset.viewport[i];if(l.position[i])switch(l.position[i]){case"left":case"bottom":b="after";break;case"right":case"top":b="before"}null===b&&(b=y/2>C+($-C)/2?"after":"before");var w,k;return"after"==b?(w="x"==i?C:$,k=y-(w+x),r[f]=w+d.offset.button[i],r[v]="auto",c.push(s["x"==i?"tipleft":"tiptop"])):(w="x"==i?$:C,k=w-x,r[v]="calc( 100% - "+(w-d.offset.button[i])+"px )",r[f]="auto",c.push(s["x"==i?"tipright":"tipbottom"])),r[g]=Math.min(e[t].configuration[n][m].max,k),[r,c]},p=function(e){if(this.vars.opened){this.$menu.attr("style",this.$menu.data(i.style));var t=[{},[]];t=u.call(this,"y",t),t=u.call(this,"x",t),this.$menu.css(t[0]),l.tip&&this.$menu.removeClass(s.tipleft+" "+s.tipright+" "+s.tiptop+" "+s.tipbottom).addClass(t[1].join(" "))}};this.bind("opening",p),o.$wndw.on(a.resize+"-dropdown",function(e){p.call(r)}),this.opts.offCanvas.blockUI||o.$wndw.on(a.scroll+"-dropdown",function(e){p.call(r)})}}}}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("dropdown tip tipleft tipright tiptop tipbottom"),a.add("mouseenter mouseleave resize scroll")},clickAnchor:function(e,t){}},e[t].defaults[n]={drop:!1,event:"click",position:{},tip:!0},e[t].configuration[n]={offset:{button:{x:-10,y:10},viewport:{x:20,y:20}},height:{max:880},width:{max:440}};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu fixedElements addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="fixedElements";e[t].addons[n]={setup:function(){if(this.opts.offCanvas){var s=this.opts[n];this.conf[n];o=e[t].glbl,s=this.opts[n]=e.extend(!0,{},e[t].defaults[n],s);var i=function(e){var t=this.conf.classNames[n].fixed;this.__refactorClass(e.find("."+t),t,"slideout").appendTo(o.$body)};i.call(this,o.$page),this.bind("setPage",i)}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("fixed")},clickAnchor:function(e,t){}},e[t].configuration.classNames[n]={fixed:"Fixed"};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu iconPanels addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="iconPanels";e[t].addons[n]={setup:function(){var i=this,a=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof a&&(a={add:a}),"number"==typeof a&&(a={add:!0,visible:a}),"object"!=typeof a&&(a={}),a=this.opts[n]=e.extend(!0,{},e[t].defaults[n],a),a.visible++,a.add){this.$menu.addClass(s.iconpanel);for(var r=[],l=0;l<=a.visible;l++)r.push(s.iconpanel+"-"+l);r=r.join(" ");var d=function(t){t.hasClass(s.vertical)||i.$pnls.children("."+s.panel).removeClass(r).filter("."+s.subopened).removeClass(s.hidden).add(t).not("."+s.vertical).slice(-a.visible).each(function(t){e(this).addClass(s.iconpanel+"-"+t)})};this.bind("openPanel",d),this.bind("init",function(t){d.call(i,i.$pnls.children("."+s.current)),a.hideNavbars&&t.removeClass(s.hasnavbar),t.not("."+s.vertical).each(function(){e(this).children("."+s.subblocker).length||e(this).prepend('<a href="#'+e(this).closest("."+s.panel).attr("id")+'" class="'+s.subblocker+'" />')})})}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("iconpanel subblocker")},clickAnchor:function(e,t){}},e[t].defaults[n]={add:!1,visible:3,hideNavbars:!1};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu navbar addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars";e[t].addons[n]={setup:function(){var i=this,a=this.opts[n],r=this.conf[n];if(o=e[t].glbl,"undefined"!=typeof a){a instanceof Array||(a=[a]);var l={};e.each(a,function(o){var d=a[o];"boolean"==typeof d&&d&&(d={}),"object"!=typeof d&&(d={}),"undefined"==typeof d.content&&(d.content=["prev","title"]),d.content instanceof Array||(d.content=[d.content]),d=e.extend(!0,{},i.opts.navbar,d);var c=d.position,h=d.height;"number"!=typeof h&&(h=1),h=Math.min(4,Math.max(1,h)),"bottom"!=c&&(c="top"),l[c]||(l[c]=0),l[c]++;var u=e("<div />").addClass(s.navbar+" "+s.navbar+"-"+c+" "+s.navbar+"-"+c+"-"+l[c]+" "+s.navbar+"-size-"+h);l[c]+=h-1;for(var p=0,f=0,v=d.content.length;v>f;f++){var m=e[t].addons[n][d.content[f]]||!1;m?p+=m.call(i,u,d,r):(m=d.content[f],m instanceof e||(m=e(d.content[f])),u.append(m))}p+=Math.ceil(u.children().not("."+s.btn).not("."+s.title+"-prev").length/h),p>1&&u.addClass(s.navbar+"-content-"+p),u.children("."+s.btn).length&&u.addClass(s.hasbtns),u.prependTo(i.$menu)});for(var d in l)i.$menu.addClass(s.hasnavbar+"-"+d+"-"+l[d])}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("close hasbtns")},clickAnchor:function(e,t){}},e[t].configuration[n]={breadcrumbSeparator:"/"},e[t].configuration.classNames[n]={};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu navbar addon breadcrumbs content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="breadcrumbs";e[t].addons[n][s]=function(n,s,i){var a=e[t]._c,o=e[t]._d;a.add("breadcrumbs separator");var r=e('<span class="'+a.breadcrumbs+'" />').appendTo(n);this.bind("init",function(t){t.removeClass(a.hasnavbar).each(function(){for(var t=[],n=e(this),s=e('<span class="'+a.breadcrumbs+'"></span>'),r=e(this).children().first(),l=!0;r&&r.length;){r.is("."+a.panel)||(r=r.closest("."+a.panel));var d=r.children("."+a.navbar).children("."+a.title).text();t.unshift(l?"<span>"+d+"</span>":'<a href="#'+r.attr("id")+'">'+d+"</a>"),l=!1,r=r.data(o.parent)}s.append(t.join('<span class="'+a.separator+'">'+i.breadcrumbSeparator+"</span>")).appendTo(n.children("."+a.navbar))})});var l=function(){r.html(this.$pnls.children("."+a.current).children("."+a.navbar).children("."+a.breadcrumbs).html())};return this.bind("openPanel",l),this.bind("init",l),0}}(jQuery),/*	
 * jQuery mmenu navbar addon close content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="close";e[t].addons[n][s]=function(n,s){var i=e[t]._c,a=e[t].glbl,o=e('<a class="'+i.close+" "+i.btn+'" href="#" />').appendTo(n),r=function(e){o.attr("href","#"+e.attr("id"))};return r.call(this,a.$page),this.bind("setPage",r),-1}}(jQuery),/*	
 * jQuery mmenu navbar addon next content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="next";e[t].addons[n][s]=function(s,i){var a,o,r=e[t]._c,l=e('<a class="'+r.next+" "+r.btn+'" href="#" />').appendTo(s),d=function(e){e=e||this.$pnls.children("."+r.current);var t=e.find("."+this.conf.classNames[n].panelNext);a=t.attr("href"),o=t.html(),l[a?"attr":"removeAttr"]("href",a),l[a||o?"removeClass":"addClass"](r.hidden),l.html(o)};return this.bind("openPanel",d),this.bind("init",function(){d.call(this)}),-1},e[t].configuration.classNames[n].panelNext="Next"}(jQuery),/*	
 * jQuery mmenu navbar addon prev content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="prev";e[t].addons[n][s]=function(s,i){var a=e[t]._c,o=e('<a class="'+a.prev+" "+a.btn+'" href="#" />').appendTo(s);this.bind("init",function(e){e.removeClass(a.hasnavbar).children("."+a.navbar).addClass(a.hidden)});var r,l,d=function(e){if(e=e||this.$pnls.children("."+a.current),!e.hasClass(a.vertical)){var t=e.find("."+this.conf.classNames[n].panelPrev);t.length||(t=e.children("."+a.navbar).children("."+a.prev)),r=t.attr("href"),l=t.html(),o[r?"attr":"removeAttr"]("href",r),o[r||l?"removeClass":"addClass"](a.hidden),o.html(l)}};return this.bind("openPanel",d),this.bind("init",function(){d.call(this)}),-1},e[t].configuration.classNames[n].panelPrev="Prev"}(jQuery),/*	
 * jQuery mmenu navbar addon searchfield content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="searchfield";e[t].addons[n][s]=function(n,s){var i=e[t]._c,a=e('<div class="'+i.search+'" />').appendTo(n);return"object"!=typeof this.opts.searchfield&&(this.opts.searchfield={}),this.opts.searchfield.add=!0,this.opts.searchfield.addTo=a,0}}(jQuery),/*	
 * jQuery mmenu navbar addon title content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="navbars",s="title";e[t].addons[n][s]=function(s,i){var a,o,r=e[t]._c,l=e('<a class="'+r.title+'" />').appendTo(s),d=function(e){if(e=e||this.$pnls.children("."+r.current),!e.hasClass(r.vertical)){var t=e.find("."+this.conf.classNames[n].panelTitle);t.length||(t=e.children("."+r.navbar).children("."+r.title)),a=t.attr("href"),o=t.html()||i.title,l[a?"attr":"removeAttr"]("href",a),l[a||o?"removeClass":"addClass"](r.hidden),l.html(o)}};return this.bind("openPanel",d),this.bind("init",function(e){d.call(this)}),0},e[t].configuration.classNames[n].panelTitle="Title"}(jQuery),/*	
 * jQuery mmenu screenReader addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){function t(e,t,n){e.prop("aria-"+t,n)[n?"attr":"removeAttr"]("aria-"+t,"true")}function n(e){return'<span class="'+a.sronly+'">'+e+"</span>"}var s="mmenu",i="screenReader";e[s].addons[i]={setup:function(){var o=this.opts[i],r=this.conf[i];if(l=e[s].glbl,"boolean"==typeof o&&(o={aria:o,text:o}),"object"!=typeof o&&(o={}),o=this.opts[i]=e.extend(!0,{},e[s].defaults[i],o),o.aria){if(this.opts.offCanvas){var d=function(){t(this.$menu,"hidden",!1)},c=function(){t(this.$menu,"hidden",!0)};this.bind("open",d),this.bind("close",c),c.call(this)}var h=function(){t(this.$menu.find("."+a.hidden),"hidden",!0),t(this.$menu.find('[aria-hidden="true"]').not("."+a.hidden),"hidden",!1)},u=function(e){t(this.$pnls.children("."+a.panel).not(e).not("."+a.hidden),"hidden",!0),t(e,"hidden",!1)};this.bind("update",h),this.bind("openPanel",h),this.bind("openPanel",u);var p=function(e){t(e.find("."+a.prev+", ."+a.next),"haspopup",!0)};this.bind("init",p),p.call(this,this.$menu.children("."+a.navbar))}if(o.text){var f=function(t){t.children("."+a.navbar).children("."+a.prev).html(n(r.text.closeSubmenu)).end().children("."+a.next).html(n(r.text.openSubmenu)).end().children("."+a.close).html(n(r.text.closeMenu)),t.is("."+a.panel)&&t.find("."+a.listview).find("."+a.next).each(function(){e(this).html(n(r.text[e(this).parent().is("."+a.vertical)?"toggleSubmenu":"openSubmenu"]))})};this.bind("init",f),f.call(this,this.$menu)}},add:function(){a=e[s]._c,o=e[s]._d,r=e[s]._e,a.add("sronly")},clickAnchor:function(e,t){}},e[s].defaults[i]={aria:!1,text:!1},e[s].configuration[i]={text:{closeMenu:"Close menu",closeSubmenu:"Close submenu",openSubmenu:"Open submenu",toggleSubmenu:"Toggle submenu"}};var a,o,r,l}(jQuery),/*	
 * jQuery mmenu searchfield addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){function t(e){switch(e){case 9:case 16:case 17:case 18:case 37:case 38:case 39:case 40:return!0}return!1}var n="mmenu",s="searchfield";e[n].addons[s]={setup:function(){var l=this,d=this.opts[s],c=this.conf[s];r=e[n].glbl,"boolean"==typeof d&&(d={add:d}),"object"!=typeof d&&(d={}),"boolean"==typeof d.resultsPanel&&(d.resultsPanel={add:d.resultsPanel}),d=this.opts[s]=e.extend(!0,{},e[n].defaults[s],d),c=this.conf[s]=e.extend(!0,{},e[n].configuration[s],c),this.bind("close",function(){this.$menu.find("."+i.search).find("input").blur()}),this.bind("init",function(n){if(d.add){var r;switch(d.addTo){case"panels":r=n;break;default:r=this.$menu.find(d.addTo)}if(r.each(function(){var t=e(this);if(!t.is("."+i.panel)||!t.is("."+i.vertical)){if(!t.children("."+i.search).length){var n=l.__valueOrFn(c.clear,t),s=l.__valueOrFn(c.form,t),a=l.__valueOrFn(c.input,t),r=l.__valueOrFn(c.submit,t),h=e("<"+(s?"form":"div")+' class="'+i.search+'" />'),u=e('<input placeholder="'+d.placeholder+'" type="text" autocomplete="off" />');h.append(u);var p;if(a)for(p in a)u.attr(p,a[p]);if(n&&e('<a class="'+i.btn+" "+i.clear+'" href="#" />').appendTo(h).on(o.click+"-searchfield",function(e){e.preventDefault(),u.val("").trigger(o.keyup+"-searchfield")}),s){for(p in s)h.attr(p,s[p]);r&&!n&&e('<a class="'+i.btn+" "+i.next+'" href="#" />').appendTo(h).on(o.click+"-searchfield",function(e){e.preventDefault(),h.submit()})}t.hasClass(i.search)?t.replaceWith(h):t.prepend(h).addClass(i.hassearch)}if(d.noResults){var f=t.closest("."+i.panel).length;if(f||(t=l.$pnls.children("."+i.panel).first()),!t.children("."+i.noresultsmsg).length){var v=t.children("."+i.listview).first();e('<div class="'+i.noresultsmsg+" "+i.hidden+'" />').append(d.noResults)[v.length?"insertAfter":"prependTo"](v.length?v:t)}}}}),d.search){if(d.resultsPanel.add){d.showSubPanels=!1;var h=this.$pnls.children("."+i.resultspanel);h.length||(h=e('<div class="'+i.panel+" "+i.resultspanel+" "+i.hidden+'" />').appendTo(this.$pnls).append('<div class="'+i.navbar+" "+i.hidden+'"><a class="'+i.title+'">'+d.resultsPanel.title+"</a></div>").append('<ul class="'+i.listview+'" />').append(this.$pnls.find("."+i.noresultsmsg).first().clone()),this.init(h))}this.$menu.find("."+i.search).each(function(){var n,r,c=e(this),u=c.closest("."+i.panel).length;u?(n=c.closest("."+i.panel),r=n):(n=e("."+i.panel,l.$menu),r=l.$menu),d.resultsPanel.add&&(n=n.not(h));var p=c.children("input"),f=l.__findAddBack(n,"."+i.listview).children("li"),v=f.filter("."+i.divider),m=l.__filterListItems(f),g="a",b=g+", span",_="",C=function(){var t=p.val().toLowerCase();if(t!=_){if(_=t,d.resultsPanel.add&&h.children("."+i.listview).empty(),n.scrollTop(0),m.add(v).addClass(i.hidden).find("."+i.fullsubopensearch).removeClass(i.fullsubopen+" "+i.fullsubopensearch),m.each(function(){var t=e(this),n=g;(d.showTextItems||d.showSubPanels&&t.find("."+i.next))&&(n=b);var s=t.data(a.searchtext)||t.children(n).text();s.toLowerCase().indexOf(_)>-1&&t.add(t.prevAll("."+i.divider).first()).removeClass(i.hidden)}),d.showSubPanels&&n.each(function(t){var n=e(this);l.__filterListItems(n.find("."+i.listview).children()).each(function(){var t=e(this),n=t.data(a.sub);t.removeClass(i.nosubresults),n&&n.find("."+i.listview).children().removeClass(i.hidden)})}),d.resultsPanel.add)if(""===_)this.closeAllPanels(),this.openPanel(this.$pnls.children("."+i.subopened).last());else{var s=e();n.each(function(){var t=l.__filterListItems(e(this).find("."+i.listview).children()).not("."+i.hidden).clone(!0);t.length&&(d.resultsPanel.dividers&&(s=s.add('<li class="'+i.divider+'">'+e(this).children("."+i.navbar).text()+"</li>")),s=s.add(t))}),s.find("."+i.next).remove(),h.children("."+i.listview).append(s),this.openPanel(h)}else e(n.get().reverse()).each(function(t){var n=e(this),s=n.data(a.parent);s&&(l.__filterListItems(n.find("."+i.listview).children()).length?(s.hasClass(i.hidden)&&s.children("."+i.next).not("."+i.fullsubopen).addClass(i.fullsubopen).addClass(i.fullsubopensearch),s.removeClass(i.hidden).removeClass(i.nosubresults).prevAll("."+i.divider).first().removeClass(i.hidden)):u||(n.hasClass(i.opened)&&setTimeout(function(){l.openPanel(s.closest("."+i.panel))},(t+1)*(1.5*l.conf.openingInterval)),s.addClass(i.nosubresults)))});r.find("."+i.noresultsmsg)[m.not("."+i.hidden).length?"addClass":"removeClass"](i.hidden),this.update()}};p.off(o.keyup+"-"+s+" "+o.change+"-"+s).on(o.keyup+"-"+s,function(e){t(e.keyCode)||C.call(l)}).on(o.change+"-"+s,function(e){C.call(l)});var $=c.children("."+i.btn);$.length&&p.on(o.keyup+"-"+s,function(e){$[p.val().length?"removeClass":"addClass"](i.hidden)}),p.trigger(o.keyup+"-"+s)})}}})},add:function(){i=e[n]._c,a=e[n]._d,o=e[n]._e,i.add("clear search hassearch resultspanel noresultsmsg noresults nosubresults fullsubopensearch"),a.add("searchtext"),o.add("change keyup")},clickAnchor:function(e,t){}},e[n].defaults[s]={add:!1,addTo:"panels",placeholder:"Search",noResults:"No results found.",resultsPanel:{add:!1,dividers:!0,title:"Search results"},search:!0,showTextItems:!1,showSubPanels:!0},e[n].configuration[s]={clear:!1,form:!1,input:!1,submit:!1};var i,a,o,r}(jQuery),/*	
 * jQuery mmenu sectionIndexer addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="sectionIndexer";e[t].addons[n]={setup:function(){var i=this,r=this.opts[n];this.conf[n];o=e[t].glbl,"boolean"==typeof r&&(r={add:r}),"object"!=typeof r&&(r={}),r=this.opts[n]=e.extend(!0,{},e[t].defaults[n],r),this.bind("init",function(t){if(r.add){var n;switch(r.addTo){case"panels":n=t;break;default:n=e(r.addTo,this.$menu).filter("."+s.panel)}n.find("."+s.divider).closest("."+s.panel).addClass(s.hasindexer)}if(!this.$indexer&&this.$pnls.children("."+s.hasindexer).length){this.$indexer=e('<div class="'+s.indexer+'" />').prependTo(this.$pnls).append('<a href="#a">a</a><a href="#b">b</a><a href="#c">c</a><a href="#d">d</a><a href="#e">e</a><a href="#f">f</a><a href="#g">g</a><a href="#h">h</a><a href="#i">i</a><a href="#j">j</a><a href="#k">k</a><a href="#l">l</a><a href="#m">m</a><a href="#n">n</a><a href="#o">o</a><a href="#p">p</a><a href="#q">q</a><a href="#r">r</a><a href="#s">s</a><a href="#t">t</a><a href="#u">u</a><a href="#v">v</a><a href="#w">w</a><a href="#x">x</a><a href="#y">y</a><a href="#z">z</a>'),this.$indexer.children().on(a.mouseover+"-sectionindexer "+s.touchstart+"-sectionindexer",function(t){var n=e(this).attr("href").slice(1),a=i.$pnls.children("."+s.current),o=a.find("."+s.listview),r=!1,l=a.scrollTop();a.scrollTop(0),o.children("."+s.divider).not("."+s.hidden).each(function(){r===!1&&n==e(this).text().slice(0,1).toLowerCase()&&(r=e(this).position().top)}),a.scrollTop(r!==!1?r:l)});var o=function(e){i.$menu[(e.hasClass(s.hasindexer)?"add":"remove")+"Class"](s.hasindexer)};this.bind("openPanel",o),o.call(this,this.$pnls.children("."+s.current))}})},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("indexer hasindexer"),a.add("mouseover touchstart")},clickAnchor:function(e,t){return e.parent().is("."+s.indexer)?!0:void 0}},e[t].defaults[n]={add:!1,addTo:"panels"};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu setSelected addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="setSelected";e[t].addons[n]={setup:function(){var a=this.opts[n];this.conf[n];if(o=e[t].glbl,"boolean"==typeof a&&(a={hover:a,parent:a}),"object"!=typeof a&&(a={}),a=this.opts[n]=e.extend(!0,{},e[t].defaults[n],a),a.current||this.bind("init",function(e){e.find("."+s.listview).children("."+s.selected).removeClass(s.selected)}),a.hover&&this.$menu.addClass(s.hoverselected),a.parent){this.$menu.addClass(s.parentselected);var r=function(e){this.$pnls.find("."+s.listview).find("."+s.next).removeClass(s.selected);for(var t=e.data(i.parent);t&&t.length;)t=t.children("."+s.next).addClass(s.selected).closest("."+s.panel).data(i.parent)};this.bind("openedPanel",r),this.bind("init",function(e){r.call(this,this.$pnls.children("."+s.current))})}},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("hoverselected parentselected")},clickAnchor:function(e,t){}},e[t].defaults[n]={current:!0,hover:!1,parent:!1};var s,i,a,o}(jQuery),/*	
 * jQuery mmenu toggles addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(e){var t="mmenu",n="toggles";e[t].addons[n]={setup:function(){var i=this;this.opts[n],this.conf[n];o=e[t].glbl,this.bind("init",function(t){this.__refactorClass(e("input",t),this.conf.classNames[n].toggle,"toggle"),this.__refactorClass(e("input",t),this.conf.classNames[n].check,"check"),e("input."+s.toggle+", input."+s.check,t).each(function(){var t=e(this),n=t.closest("li"),a=t.hasClass(s.toggle)?"toggle":"check",o=t.attr("id")||i.__getUniqueId();n.children('label[for="'+o+'"]').length||(t.attr("id",o),n.prepend(t),e('<label for="'+o+'" class="'+s[a]+'"></label>').insertBefore(n.children("a, span").last()))})})},add:function(){s=e[t]._c,i=e[t]._d,a=e[t]._e,s.add("toggle check")},clickAnchor:function(e,t){}},e[t].configuration.classNames[n]={toggle:"Toggle",check:"Check"};var s,i,a,o}(jQuery);
/*modernizr.js*/
/* Modernizr 2.7.1 (Custom Build) | rePack WEZOM | Oleg Dutchenko | 18.05.2015 */

window.Modernizr = (function(window, document, undefined) {
    var version = '2.7.1', Modernizr = {}, enableClasses = true, docElement = document.documentElement, mod = 'modernizr', modElem = document.createElement(mod), mStyle = modElem.style, inputElem = document.createElement('input'), smile = ':)', toString = {}.toString, prefixes = ' -webkit- -moz- -o- -ms- '.split(' '), omPrefixes = 'Webkit Moz O ms', cssomPrefixes = omPrefixes.split(' '), domPrefixes = omPrefixes.toLowerCase().split(' '), ns = {'svg': 'http://www.w3.org/2000/svg'}, tests = {}, inputs = {}, attrs = {}, classes = [], slice = classes.slice, featureName, injectElementWithStyles = function(rule, callback, nodes, testnames) {var style, ret, node, docOverflow, div = document.createElement('div'), body = document.body, fakeBody = body || document.createElement('body'); if (parseInt(nodes, 10)) {while (nodes--) {node = document.createElement('div'); node.id = testnames ? testnames[nodes] : mod + (nodes + 1); div.appendChild(node); } } style = ['&#173;', '<style id="s', mod, '">', rule, '</style>'].join(''); div.id = mod; (body ? div : fakeBody).innerHTML += style; fakeBody.appendChild(div); if (!body) {fakeBody.style.background = ''; fakeBody.style.overflow = 'hidden'; docOverflow = docElement.style.overflow; docElement.style.overflow = 'hidden'; docElement.appendChild(fakeBody); } ret = callback(div, rule); if (!body) {fakeBody.parentNode.removeChild(fakeBody); docElement.style.overflow = docOverflow; } else {div.parentNode.removeChild(div); } return !!ret; }, testMediaQuery = function(mq) {var matchMedia = window.matchMedia || window.msMatchMedia; if (matchMedia) {return matchMedia(mq).matches; } var bool; injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function(node) {bool = (window.getComputedStyle ? getComputedStyle(node, null) : node.currentStyle)['position'] == 'absolute'; }); return bool; }, isEventSupported = (function() {var TAGNAMES = {'select': 'input', 'change': 'input', 'submit': 'form', 'reset': 'form', 'error': 'img', 'load': 'img', 'abort': 'img'}; function isEventSupported(eventName, element) {element = element || document.createElement(TAGNAMES[eventName] || 'div'); eventName = 'on' + eventName; var isSupported = eventName in element; if (!isSupported) {if (!element.setAttribute) {element = document.createElement('div'); } if (element.setAttribute && element.removeAttribute) {element.setAttribute(eventName, ''); isSupported = is(element[eventName], 'function'); if (!is(element[eventName], 'undefined')) {element[eventName] = undefined; } element.removeAttribute(eventName); } } element = null; return isSupported; } return isEventSupported; })(), _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if (!is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined')) {hasOwnProp = function(object, property) {return _hasOwnProperty.call(object, property); }; } else {hasOwnProp = function(object, property) {return ((property in object) && is(object.constructor.prototype[property], 'undefined')); }; }
    if (!Function.prototype.bind) {Function.prototype.bind = function bind(that) {var target = this; if (typeof target != "function") {throw new TypeError(); } var args = slice.call(arguments, 1), bound = function() {if (this instanceof bound) {var F = function() {}; F.prototype = target.prototype; var self = new F(); var result = target.apply(self, args.concat(slice.call(arguments)) ); if (Object(result) === result) {return result; } return self; } else {return target.apply(that, args.concat(slice.call(arguments)) ); } }; return bound; }; }

    function setCss(str) {mStyle.cssText = str; }
    function setCssAll(str1, str2) {return setCss(prefixes.join(str1 + ';') + (str2 || '')); }
    function is(obj, type) {return typeof obj === type; }
    function contains(str, substr) {return !!~('' + str).indexOf(substr); }
    function testProps(props, prefixed) {for (var i in props) {var prop = props[i]; if (!contains(prop, "-") && mStyle[prop] !== undefined) {return prefixed == 'pfx' ? prop : true; } } return false; }
    function testDOMProps(props, obj, elem) {for (var i in props) {var item = obj[props[i]]; if (item !== undefined) {if (elem === false) return props[i]; if (is(item, 'function')) {return item.bind(elem || obj); } return item; } } return false; }
    function testPropsAll(prop, prefixed, elem) {var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1), props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' '); if (is(prefixed, "string") || is(prefixed, "undefined")) {return testProps(props, prefixed); } else {props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' '); return testDOMProps(props, prefixed, elem); } }

    tests['touch'] = function() {var bool; if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {bool = true; } else {injectElementWithStyles(['@media (', prefixes.join('touch-enabled),('), mod, ')', '{#modernizr{top:9px;position:absolute}}'].join(''), function(node) {bool = node.offsetTop === 9; }); } return bool; };
    tests['mobile'] = function() {var mobile = navigator.userAgent.toLowerCase(); var bool = mobile.indexOf('mobile') > 0; return bool; };
    tests['flexbox'] = function() {return testPropsAll('flexWrap'); };
    tests['flexboxlegacy'] = function() {return testPropsAll('boxDirection'); };
    tests['canvas'] = function() {var elem = document.createElement('canvas'); return !!(elem.getContext && elem.getContext('2d')); };
    //tests['canvastext'] = function() {return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function')); };
    tests['webgl'] = function() {return !!window.WebGLRenderingContext; };
    //tests['geolocation'] = function() {return 'geolocation' in navigator; };
    //tests['postmessage'] = function() {return !!window.postMessage; };
    //tests['websqldatabase'] = function() {return !!window.openDatabase; };
    //tests['indexedDB'] = function() {return !!testPropsAll("indexedDB", window); };
    //tests['hashchange'] = function() {return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7); };
    //tests['history'] = function() {return !!(window.history && history.pushState); };
    //tests['draganddrop'] = function() {var div = document.createElement('div'); return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div); };
    tests['websockets'] = function() {return 'WebSocket' in window || 'MozWebSocket' in window; };
    //tests['rgba'] = function() {setCss('background-color:rgba(150,255,150,.5)'); return contains(mStyle.backgroundColor, 'rgba'); };
    //tests['hsla'] = function() {setCss('background-color:hsla(120,40%,100%,.5)'); return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla'); };
    //tests['multiplebgs'] = function() {setCss('background:url(https://),url(https://),red url(https://)'); return (/(url\s*\(.*?){3}/).test(mStyle.background); };
    //tests['backgroundsize'] = function() {return testPropsAll('backgroundSize'); };
    tests['borderimage'] = function() {return testPropsAll('borderImage'); };
    //tests['borderradius'] = function() {return testPropsAll('borderRadius'); };
    //tests['boxshadow'] = function() {return testPropsAll('boxShadow'); };
    //tests['textshadow'] = function() {return document.createElement('div').style.textShadow === ''; };
    //tests['opacity'] = function() {setCssAll('opacity:.55'); return (/^0.55$/).test(mStyle.opacity); };
    tests['cssanimations'] = function() {return testPropsAll('animationName'); };
    tests['csscolumns'] = function() {return testPropsAll('columnCount'); };
    //tests['cssgradients'] = function() {var str1 = 'background-image:', str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));', str3 = 'linear-gradient(left top,#9f9, white);'; setCss((str1 + '-webkit- '.split(' ').join(str2 + str1) + prefixes.join(str3 + str1)).slice(0, -str1.length) ); return contains(mStyle.backgroundImage, 'gradient'); };
    tests['cssreflections'] = function() {return testPropsAll('boxReflect'); };
    //tests['csstransforms'] = function() {return !!testPropsAll('transform'); };
    //tests['csstransforms3d'] = function() {var ret = !!testPropsAll('perspective'); if (ret && 'webkitPerspective' in docElement.style) {injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function(node, rule) {ret = node.offsetLeft === 9 && node.offsetHeight === 3; }); } return ret; };
    //tests['csstransitions'] = function() {return testPropsAll('transition'); };
    //tests['fontface'] = function() {var bool; injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function(node, rule) {var style = document.getElementById('smodernizr'), sheet = style.sheet || style.styleSheet, cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : ''; bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0; }); return bool; };
    //tests['generatedcontent'] = function() {var bool; injectElementWithStyles(['#', mod, '{font:0/0 a}#', mod, ':after{content:"', smile, '";visibility:hidden;font:3px/1 a}'].join(''), function(node) {bool = node.offsetHeight >= 3; }); return bool; };
    tests['video'] = function() {var elem = document.createElement('video'), bool = false; try {if (bool = !!elem.canPlayType) {bool = new Boolean(bool); bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ''); bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ''); bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ''); } } catch (e) {} return bool; };
    tests['audio'] = function() {var elem = document.createElement('audio'), bool = false; try {if (bool = !!elem.canPlayType) {bool = new Boolean(bool); bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''); bool.mp3 = elem.canPlayType('audio/mpeg;').replace(/^no$/, ''); bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''); bool.m4a = (elem.canPlayType('audio/x-m4a;') || elem.canPlayType('audio/aac;')).replace(/^no$/, ''); } } catch (e) {} return bool; };
    tests['localstorage'] = function() {try {localStorage.setItem(mod, mod); localStorage.removeItem(mod); return true; } catch (e) {return false; } };
    tests['sessionstorage'] = function() {try {sessionStorage.setItem(mod, mod); sessionStorage.removeItem(mod); return true; } catch (e) {return false; } };
    tests['webworkers'] = function() {return !!window.Worker; };
    //tests['applicationcache'] = function() {return !!window.applicationCache; };
    tests['svg'] = function() {return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect; };
    tests['inlinesvg'] = function() {var div = document.createElement('div'); div.innerHTML = '<svg/>'; return (div.firstChild && div.firstChild.namespaceURI) == ns.svg; };
    //tests['smil'] = function() {return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate'))); };
    //tests['svgclippaths'] = function() {return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath'))); };
    // retina test
    tests['retina'] = function() {var dpr = window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI) || 1; var flag = dpr > 1;  return !!flag;};
    // @wezom browser test's
    tests['moz'] = function() {return typeof InstallTrigger !== 'undefined'; };
    tests['safari'] = function() {return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; };
    tests['o'] = function() {return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; };
    tests['chrome'] = function() {return !!window.chrome && !window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; };
    tests['webkit'] = function() {return 'WebkitAppearance' in docElement.style; };
    tests['ie'] = function() {return /*@cc_on!@*/ false || document.documentMode; };
    tests['ie8'] = function() {return (document.all && !document.addEventListener); };
    tests['ie9'] = function() {return (document.all && !window.atob && !!document.addEventListener); };
    tests['ie10'] = function() {return (document.all && !!window.atob && !!document.addEventListener); };
    tests['ie11']=function(){return !!navigator.userAgent.match(/Trident.*rv[ :]*11\./); };
    // platform
    function returnPlatform(str){return navigator.platform.toLowerCase().indexOf(str)>=0;}
    tests['win']=function(){return returnPlatform('win');};
    tests['linux']=function(){return returnPlatform('linux');};
    tests['mac']=function(){return returnPlatform('mac');};
    tests['maclike']=function(){return navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;};
    tests['ios']=function(){return navigator.platform.match(/(iPhone|iPod|iPad)/i) ? true : false; };
    // @wezom device tests
    var vendors = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tv|tablet|opera mini|nexus 7)/i);
    if (vendors !== null && vendors[0].length) {
        var vName = vendors[0];
        tests[vName] = function() {
            return true; //sdfsdfsdf
        };
        var vObj = {
            Android:[['Android 2.','2'],['Android 3.','3'],['Android 4.','4'],['Android 5.','5'],['Android 6.','6']],
            iPad:[['OS 4','2'],['OS 7','4']],
            iPhone:[['OS 4','4'],['OS 7', '5'],['OS 8','6']],
            Tablet:[['OS 1','1'],['OS 2', '2']],
            Mobi:[['Windows Phone','windows-phone']]
        };
        if (!!vObj[vName]) {
            for (var i = 0; i < vObj[vName].length; i++) {
                if (navigator.userAgent.match(vObj[vName][i][0])) {
                    if (vObj[vName][i][0] === 'Windows Phone') {
                        tests[vObj[vName][i][1]] = function() {
                            return true;
                        };
                    } else {
                        tests[vName + '' + vObj[vName][i][1]] = function() {
                            return true;
                        };
                    }
                }
            }
        }
    }

    function webforms() {Modernizr['input'] = (function(props) {for (var i = 0, len = props.length; i < len; i++) {attrs[props[i]] = !! (props[i] in inputElem); } if (attrs.list) {attrs.list = !! (document.createElement('datalist') && window.HTMLDataListElement); } return attrs; })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' ')); Modernizr['inputtypes'] = (function(props) {for (var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {inputElem.setAttribute('type', inputElemType = props[i]); bool = inputElem.type !== 'text'; if (bool) {inputElem.value = smile; inputElem.style.cssText = 'position:absolute;visibility:hidden;'; if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {docElement.appendChild(inputElem); defaultView = document.defaultView; bool = defaultView.getComputedStyle && defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' && (inputElem.offsetHeight !== 0); docElement.removeChild(inputElem); } else if (/^(search|tel)$/.test(inputElemType)) {} else if (/^(url|email)$/.test(inputElemType)) {bool = inputElem.checkValidity && inputElem.checkValidity() === false; } else {bool = inputElem.value != smile; } } inputs[props[i]] = !! bool; } return inputs; })('search tel url email datetime date month week time datetime-local number range color'.split(' ')); }
    for (var feature in tests) {if (hasOwnProp(tests, feature)) {featureName = feature.toLowerCase(); Modernizr[featureName] = tests[feature](); classes.push((Modernizr[featureName] ? '' : 'no-') + featureName); } }
    Modernizr.input || webforms();
    Modernizr.addTest = function(feature, test) {if (typeof feature == 'object') {for (var key in feature) {if (hasOwnProp(feature, key)) {Modernizr.addTest(key, feature[key]); } } } else {feature = feature.toLowerCase(); if (Modernizr[feature] !== undefined) {return Modernizr; } test = typeof test == 'function' ? test() : test; if (typeof enableClasses !== "undefined" && enableClasses) {docElement.className += ' ' + (test ? '' : 'no-') + feature; } Modernizr[feature] = test; } return Modernizr; };
    setCss('');
    modElem = inputElem = null;

    (function(window, document) {
        var version = '3.7.0';
        var options = window.html5 || {};
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;
        var supportsHtml5Styles;
        var expando = '_html5shiv';
        var expanID = 0;
        var expandoData = {};
        var supportsUnknownElements;
        (function() {try {var a = document.createElement('a'); a.innerHTML = '<xyz></xyz>'; supportsHtml5Styles = ('hidden' in a); supportsUnknownElements = a.childNodes.length == 1 || (function() {(document.createElement)('a'); var frag = document.createDocumentFragment(); return (typeof frag.cloneNode == 'undefined' || typeof frag.createDocumentFragment == 'undefined' || typeof frag.createElement == 'undefined'); }()); } catch (e) {supportsHtml5Styles = true; supportsUnknownElements = true; } }());
        function addStyleSheet(ownerDocument, cssText) {var p = ownerDocument.createElement('p'), parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement; p.innerHTML = 'x<style>' + cssText + '</style>'; return parent.insertBefore(p.lastChild, parent.firstChild); }
        function getElements() {var elements = html5.elements; return typeof elements == 'string' ? elements.split(' ') : elements; }
        function getExpandoData(ownerDocument) {var data = expandoData[ownerDocument[expando]]; if (!data) {data = {}; expanID++; ownerDocument[expando] = expanID; expandoData[expanID] = data; } return data; }
        function createElement(nodeName, ownerDocument, data) {if (!ownerDocument) {ownerDocument = document; } if (supportsUnknownElements) {return ownerDocument.createElement(nodeName); } if (!data) {data = getExpandoData(ownerDocument); } var node; if (data.cache[nodeName]) {node = data.cache[nodeName].cloneNode(); } else if (saveClones.test(nodeName)) {node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode(); } else {node = data.createElem(nodeName); } return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node; }
        function createDocumentFragment(ownerDocument, data) {if (!ownerDocument) {ownerDocument = document; } if (supportsUnknownElements) {return ownerDocument.createDocumentFragment(); } data = data || getExpandoData(ownerDocument); var clone = data.frag.cloneNode(), i = 0, elems = getElements(), l = elems.length; for (; i < l; i++) {clone.createElement(elems[i]); } return clone; }
        function shivMethods(ownerDocument, data) {if (!data.cache) {data.cache = {}; data.createElem = ownerDocument.createElement; data.createFrag = ownerDocument.createDocumentFragment; data.frag = data.createFrag(); } ownerDocument.createElement = function(nodeName) {if (!html5.shivMethods) {return data.createElem(nodeName); } return createElement(nodeName, ownerDocument, data); }; ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' + 'var n=f.cloneNode(),c=n.createElement;' + 'h.shivMethods&&(' + getElements().join().replace(/[\w\-]+/g, function(nodeName) {data.createElem(nodeName); data.frag.createElement(nodeName); return 'c("' + nodeName + '")'; }) + ');return n}')(html5, data.frag); }
        function shivDocument(ownerDocument) {if (!ownerDocument) {ownerDocument = document; } var data = getExpandoData(ownerDocument); if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {data.hasCSS = !! addStyleSheet(ownerDocument, 'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' + 'mark{background:#FF0;color:#000}' + 'template{display:none}'); } if (!supportsUnknownElements) {shivMethods(ownerDocument, data); } return ownerDocument; }
        var html5 = {'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video', 'version': version, 'shivCSS': (options.shivCSS !== false), 'supportsUnknownElements': supportsUnknownElements, 'shivMethods': (options.shivMethods !== false), 'type': 'default', 'shivDocument': shivDocument, createElement: createElement, createDocumentFragment: createDocumentFragment };
        window.html5 = html5;
        shivDocument(document);
    }(this, document));

    Modernizr._version = version;
    Modernizr._prefixes = prefixes;
    Modernizr._domPrefixes = domPrefixes;
    Modernizr._cssomPrefixes = cssomPrefixes;
    Modernizr.mq = testMediaQuery;
    Modernizr.hasEvent = isEventSupported;
    Modernizr.testProp = function(prop) {return testProps([prop]); };
    Modernizr.testAllProps = testPropsAll;
    Modernizr.testStyles = injectElementWithStyles;
    Modernizr.prefixed = function(prop, obj, elem) {if (!obj) {return testPropsAll(prop, 'pfx'); } else {return testPropsAll(prop, obj, elem); } };
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') + (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);
/*yepnope1.5.4|WTFPL*/
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);
Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0));};

/*test add*/
    Modernizr.addTest("viewport",function(){var bool; Modernizr.testStyles("#modernizr { width: 50vw; }",function(elem,rule){var width=parseInt(window.innerWidth/2,10),compStyle=parseInt((window.getComputedStyle ? getComputedStyle(elem,null) : elem.currentStyle)["width"],10); bool=!!(compStyle==width);}); return bool; });
    Modernizr.addTest('csscalc', function() {var prop='width:',value='calc(10px);',el=document.createElement('div'); el.style.cssText=prop+Modernizr._prefixes.join(value+prop); return !!el.style.length; });;
    // windows OS
    var winOS=[['win2000','5.0'],['winxp','5.1'],['winvista','6.0'],['win7','6.1'],['win8','6.2'],['win10','10']];
    for (var i=0;i<winOS.length;i++){var tName=winOS[i][0]; var tVal=winOS[i][1]; Modernizr.addTest(tName,function(){var ua=navigator.userAgent.toLowerCase(); var wos=ua.indexOf('windows nt '+tVal)>0; if(tName==='win8'&&!wos){wos=ua.indexOf('windows nt 6.3')>0; } return wos; }); }
/*select2.min.js*/
/*! Select2 4.0.2 | https://github.com/select2/select2/blob/master/LICENSE.md */!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a("object"==typeof exports?require("jquery"):jQuery)}(function(a){var b=function(){if(a&&a.fn&&a.fn.select2&&a.fn.select2.amd)var b=a.fn.select2.amd;var b;return function(){if(!b||!b.requirejs){b?c=b:b={};var a,c,d;!function(b){function e(a,b){return u.call(a,b)}function f(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=b&&b.split("/"),o=s.map,p=o&&o["*"]||{};if(a&&"."===a.charAt(0))if(b){for(a=a.split("/"),g=a.length-1,s.nodeIdCompat&&w.test(a[g])&&(a[g]=a[g].replace(w,"")),a=n.slice(0,n.length-1).concat(a),k=0;k<a.length;k+=1)if(m=a[k],"."===m)a.splice(k,1),k-=1;else if(".."===m){if(1===k&&(".."===a[2]||".."===a[0]))break;k>0&&(a.splice(k-1,2),k-=2)}a=a.join("/")}else 0===a.indexOf("./")&&(a=a.substring(2));if((n||p)&&o){for(c=a.split("/"),k=c.length;k>0;k-=1){if(d=c.slice(0,k).join("/"),n)for(l=n.length;l>0;l-=1)if(e=o[n.slice(0,l).join("/")],e&&(e=e[d])){f=e,h=k;break}if(f)break;!i&&p&&p[d]&&(i=p[d],j=k)}!f&&i&&(f=i,h=j),f&&(c.splice(0,h,f),a=c.join("/"))}return a}function g(a,c){return function(){var d=v.call(arguments,0);return"string"!=typeof d[0]&&1===d.length&&d.push(null),n.apply(b,d.concat([a,c]))}}function h(a){return function(b){return f(b,a)}}function i(a){return function(b){q[a]=b}}function j(a){if(e(r,a)){var c=r[a];delete r[a],t[a]=!0,m.apply(b,c)}if(!e(q,a)&&!e(t,a))throw new Error("No "+a);return q[a]}function k(a){var b,c=a?a.indexOf("!"):-1;return c>-1&&(b=a.substring(0,c),a=a.substring(c+1,a.length)),[b,a]}function l(a){return function(){return s&&s.config&&s.config[a]||{}}}var m,n,o,p,q={},r={},s={},t={},u=Object.prototype.hasOwnProperty,v=[].slice,w=/\.js$/;o=function(a,b){var c,d=k(a),e=d[0];return a=d[1],e&&(e=f(e,b),c=j(e)),e?a=c&&c.normalize?c.normalize(a,h(b)):f(a,b):(a=f(a,b),d=k(a),e=d[0],a=d[1],e&&(c=j(e))),{f:e?e+"!"+a:a,n:a,pr:e,p:c}},p={require:function(a){return g(a)},exports:function(a){var b=q[a];return"undefined"!=typeof b?b:q[a]={}},module:function(a){return{id:a,uri:"",exports:q[a],config:l(a)}}},m=function(a,c,d,f){var h,k,l,m,n,s,u=[],v=typeof d;if(f=f||a,"undefined"===v||"function"===v){for(c=!c.length&&d.length?["require","exports","module"]:c,n=0;n<c.length;n+=1)if(m=o(c[n],f),k=m.f,"require"===k)u[n]=p.require(a);else if("exports"===k)u[n]=p.exports(a),s=!0;else if("module"===k)h=u[n]=p.module(a);else if(e(q,k)||e(r,k)||e(t,k))u[n]=j(k);else{if(!m.p)throw new Error(a+" missing "+k);m.p.load(m.n,g(f,!0),i(k),{}),u[n]=q[k]}l=d?d.apply(q[a],u):void 0,a&&(h&&h.exports!==b&&h.exports!==q[a]?q[a]=h.exports:l===b&&s||(q[a]=l))}else a&&(q[a]=d)},a=c=n=function(a,c,d,e,f){if("string"==typeof a)return p[a]?p[a](c):j(o(a,c).f);if(!a.splice){if(s=a,s.deps&&n(s.deps,s.callback),!c)return;c.splice?(a=c,c=d,d=null):a=b}return c=c||function(){},"function"==typeof d&&(d=e,e=f),e?m(b,a,c,d):setTimeout(function(){m(b,a,c,d)},4),n},n.config=function(a){return n(a)},a._defined=q,d=function(a,b,c){if("string"!=typeof a)throw new Error("See almond README: incorrect module build, no module name");b.splice||(c=b,b=[]),e(q,a)||e(r,a)||(r[a]=[a,b,c])},d.amd={jQuery:!0}}(),b.requirejs=a,b.require=c,b.define=d}}(),b.define("almond",function(){}),b.define("jquery",[],function(){var b=a||$;return null==b&&console&&console.error&&console.error("Select2: An instance of jQuery or a jQuery-compatible library was not found. Make sure that you are including jQuery before Select2 on your web page."),b}),b.define("select2/utils",["jquery"],function(a){function b(a){var b=a.prototype,c=[];for(var d in b){var e=b[d];"function"==typeof e&&"constructor"!==d&&c.push(d)}return c}var c={};c.Extend=function(a,b){function c(){this.constructor=a}var d={}.hasOwnProperty;for(var e in b)d.call(b,e)&&(a[e]=b[e]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},c.Decorate=function(a,c){function d(){var b=Array.prototype.unshift,d=c.prototype.constructor.length,e=a.prototype.constructor;d>0&&(b.call(arguments,a.prototype.constructor),e=c.prototype.constructor),e.apply(this,arguments)}function e(){this.constructor=d}var f=b(c),g=b(a);c.displayName=a.displayName,d.prototype=new e;for(var h=0;h<g.length;h++){var i=g[h];d.prototype[i]=a.prototype[i]}for(var j=(function(a){var b=function(){};a in d.prototype&&(b=d.prototype[a]);var e=c.prototype[a];return function(){var a=Array.prototype.unshift;return a.call(arguments,b),e.apply(this,arguments)}}),k=0;k<f.length;k++){var l=f[k];d.prototype[l]=j(l)}return d};var d=function(){this.listeners={}};return d.prototype.on=function(a,b){this.listeners=this.listeners||{},a in this.listeners?this.listeners[a].push(b):this.listeners[a]=[b]},d.prototype.trigger=function(a){var b=Array.prototype.slice;this.listeners=this.listeners||{},a in this.listeners&&this.invoke(this.listeners[a],b.call(arguments,1)),"*"in this.listeners&&this.invoke(this.listeners["*"],arguments)},d.prototype.invoke=function(a,b){for(var c=0,d=a.length;d>c;c++)a[c].apply(this,b)},c.Observable=d,c.generateChars=function(a){for(var b="",c=0;a>c;c++){var d=Math.floor(36*Math.random());b+=d.toString(36)}return b},c.bind=function(a,b){return function(){a.apply(b,arguments)}},c._convertData=function(a){for(var b in a){var c=b.split("-"),d=a;if(1!==c.length){for(var e=0;e<c.length;e++){var f=c[e];f=f.substring(0,1).toLowerCase()+f.substring(1),f in d||(d[f]={}),e==c.length-1&&(d[f]=a[b]),d=d[f]}delete a[b]}}return a},c.hasScroll=function(b,c){var d=a(c),e=c.style.overflowX,f=c.style.overflowY;return e!==f||"hidden"!==f&&"visible"!==f?"scroll"===e||"scroll"===f?!0:d.innerHeight()<c.scrollHeight||d.innerWidth()<c.scrollWidth:!1},c.escapeMarkup=function(a){var b={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return"string"!=typeof a?a:String(a).replace(/[&<>"'\/\\]/g,function(a){return b[a]})},c.appendMany=function(b,c){if("1.7"===a.fn.jquery.substr(0,3)){var d=a();a.map(c,function(a){d=d.add(a)}),c=d}b.append(c)},c}),b.define("select2/results",["jquery","./utils"],function(a,b){function c(a,b,d){this.$element=a,this.data=d,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<ul class="select2-results__options" role="tree"></ul>');return this.options.get("multiple")&&b.attr("aria-multiselectable","true"),this.$results=b,b},c.prototype.clear=function(){this.$results.empty()},c.prototype.displayMessage=function(b){var c=this.options.get("escapeMarkup");this.clear(),this.hideLoading();var d=a('<li role="treeitem" aria-live="assertive" class="select2-results__option"></li>'),e=this.options.get("translations").get(b.message);d.append(c(e(b.args))),d[0].className+=" select2-results__message",this.$results.append(d)},c.prototype.hideMessages=function(){this.$results.find(".select2-results__message").remove()},c.prototype.append=function(a){this.hideLoading();var b=[];if(null==a.results||0===a.results.length)return void(0===this.$results.children().length&&this.trigger("results:message",{message:"noResults"}));a.results=this.sort(a.results);for(var c=0;c<a.results.length;c++){var d=a.results[c],e=this.option(d);b.push(e)}this.$results.append(b)},c.prototype.position=function(a,b){var c=b.find(".select2-results");c.append(a)},c.prototype.sort=function(a){var b=this.options.get("sorter");return b(a)},c.prototype.setClasses=function(){var b=this;this.data.current(function(c){var d=a.map(c,function(a){return a.id.toString()}),e=b.$results.find(".select2-results__option[aria-selected]");e.each(function(){var b=a(this),c=a.data(this,"data"),e=""+c.id;null!=c.element&&c.element.selected||null==c.element&&a.inArray(e,d)>-1?b.attr("aria-selected","true"):b.attr("aria-selected","false")});var f=e.filter("[aria-selected=true]");f.length>0?f.first().trigger("mouseenter"):e.first().trigger("mouseenter")})},c.prototype.showLoading=function(a){this.hideLoading();var b=this.options.get("translations").get("searching"),c={disabled:!0,loading:!0,text:b(a)},d=this.option(c);d.className+=" loading-results",this.$results.prepend(d)},c.prototype.hideLoading=function(){this.$results.find(".loading-results").remove()},c.prototype.option=function(b){var c=document.createElement("li");c.className="select2-results__option";var d={role:"treeitem","aria-selected":"false"};b.disabled&&(delete d["aria-selected"],d["aria-disabled"]="true"),null==b.id&&delete d["aria-selected"],null!=b._resultId&&(c.id=b._resultId),b.title&&(c.title=b.title),b.children&&(d.role="group",d["aria-label"]=b.text,delete d["aria-selected"]);for(var e in d){var f=d[e];c.setAttribute(e,f)}if(b.children){var g=a(c),h=document.createElement("strong");h.className="select2-results__group";a(h);this.template(b,h);for(var i=[],j=0;j<b.children.length;j++){var k=b.children[j],l=this.option(k);i.push(l)}var m=a("<ul></ul>",{"class":"select2-results__options select2-results__options--nested"});m.append(i),g.append(h),g.append(m)}else this.template(b,c);return a.data(c,"data",b),c},c.prototype.bind=function(b,c){var d=this,e=b.id+"-results";this.$results.attr("id",e),b.on("results:all",function(a){d.clear(),d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("results:append",function(a){d.append(a.data),b.isOpen()&&d.setClasses()}),b.on("query",function(a){d.hideMessages(),d.showLoading(a)}),b.on("select",function(){b.isOpen()&&d.setClasses()}),b.on("unselect",function(){b.isOpen()&&d.setClasses()}),b.on("open",function(){d.$results.attr("aria-expanded","true"),d.$results.attr("aria-hidden","false"),d.setClasses(),d.ensureHighlightVisible()}),b.on("close",function(){d.$results.attr("aria-expanded","false"),d.$results.attr("aria-hidden","true"),d.$results.removeAttr("aria-activedescendant")}),b.on("results:toggle",function(){var a=d.getHighlightedResults();0!==a.length&&a.trigger("mouseup")}),b.on("results:select",function(){var a=d.getHighlightedResults();if(0!==a.length){var b=a.data("data");"true"==a.attr("aria-selected")?d.trigger("close",{}):d.trigger("select",{data:b})}}),b.on("results:previous",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a);if(0!==c){var e=c-1;0===a.length&&(e=0);var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top,h=f.offset().top,i=d.$results.scrollTop()+(h-g);0===e?d.$results.scrollTop(0):0>h-g&&d.$results.scrollTop(i)}}),b.on("results:next",function(){var a=d.getHighlightedResults(),b=d.$results.find("[aria-selected]"),c=b.index(a),e=c+1;if(!(e>=b.length)){var f=b.eq(e);f.trigger("mouseenter");var g=d.$results.offset().top+d.$results.outerHeight(!1),h=f.offset().top+f.outerHeight(!1),i=d.$results.scrollTop()+h-g;0===e?d.$results.scrollTop(0):h>g&&d.$results.scrollTop(i)}}),b.on("results:focus",function(a){a.element.addClass("select2-results__option--highlighted")}),b.on("results:message",function(a){d.displayMessage(a)}),a.fn.mousewheel&&this.$results.on("mousewheel",function(a){var b=d.$results.scrollTop(),c=d.$results.get(0).scrollHeight-b+a.deltaY,e=a.deltaY>0&&b-a.deltaY<=0,f=a.deltaY<0&&c<=d.$results.height();e?(d.$results.scrollTop(0),a.preventDefault(),a.stopPropagation()):f&&(d.$results.scrollTop(d.$results.get(0).scrollHeight-d.$results.height()),a.preventDefault(),a.stopPropagation())}),this.$results.on("mouseup",".select2-results__option[aria-selected]",function(b){var c=a(this),e=c.data("data");return"true"===c.attr("aria-selected")?void(d.options.get("multiple")?d.trigger("unselect",{originalEvent:b,data:e}):d.trigger("close",{})):void d.trigger("select",{originalEvent:b,data:e})}),this.$results.on("mouseenter",".select2-results__option[aria-selected]",function(b){var c=a(this).data("data");d.getHighlightedResults().removeClass("select2-results__option--highlighted"),d.trigger("results:focus",{data:c,element:a(this)})})},c.prototype.getHighlightedResults=function(){var a=this.$results.find(".select2-results__option--highlighted");return a},c.prototype.destroy=function(){this.$results.remove()},c.prototype.ensureHighlightVisible=function(){var a=this.getHighlightedResults();if(0!==a.length){var b=this.$results.find("[aria-selected]"),c=b.index(a),d=this.$results.offset().top,e=a.offset().top,f=this.$results.scrollTop()+(e-d),g=e-d;f-=2*a.outerHeight(!1),2>=c?this.$results.scrollTop(0):(g>this.$results.outerHeight()||0>g)&&this.$results.scrollTop(f)}},c.prototype.template=function(b,c){var d=this.options.get("templateResult"),e=this.options.get("escapeMarkup"),f=d(b,c);null==f?c.style.display="none":"string"==typeof f?c.innerHTML=e(f):a(c).append(f)},c}),b.define("select2/keys",[],function(){var a={BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,ESC:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46};return a}),b.define("select2/selection/base",["jquery","../utils","../keys"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,b.Observable),d.prototype.render=function(){var b=a('<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>');return this._tabindex=0,null!=this.$element.data("old-tabindex")?this._tabindex=this.$element.data("old-tabindex"):null!=this.$element.attr("tabindex")&&(this._tabindex=this.$element.attr("tabindex")),b.attr("title",this.$element.attr("title")),b.attr("tabindex",this._tabindex),this.$selection=b,b},d.prototype.bind=function(a,b){var d=this,e=(a.id+"-container",a.id+"-results");this.container=a,this.$selection.on("focus",function(a){d.trigger("focus",a)}),this.$selection.on("blur",function(a){d._handleBlur(a)}),this.$selection.on("keydown",function(a){d.trigger("keypress",a),a.which===c.SPACE&&a.preventDefault()}),a.on("results:focus",function(a){d.$selection.attr("aria-activedescendant",a.data._resultId)}),a.on("selection:update",function(a){d.update(a.data)}),a.on("open",function(){d.$selection.attr("aria-expanded","true"),d.$selection.attr("aria-owns",e),d._attachCloseHandler(a)}),a.on("close",function(){d.$selection.attr("aria-expanded","false"),d.$selection.removeAttr("aria-activedescendant"),d.$selection.removeAttr("aria-owns"),d.$selection.focus(),d._detachCloseHandler(a)}),a.on("enable",function(){d.$selection.attr("tabindex",d._tabindex)}),a.on("disable",function(){d.$selection.attr("tabindex","-1")})},d.prototype._handleBlur=function(b){var c=this;window.setTimeout(function(){document.activeElement==c.$selection[0]||a.contains(c.$selection[0],document.activeElement)||c.trigger("blur",b)},1)},d.prototype._attachCloseHandler=function(b){a(document.body).on("mousedown.select2."+b.id,function(b){var c=a(b.target),d=c.closest(".select2"),e=a(".select2.select2-container--open");e.each(function(){var b=a(this);if(this!=d[0]){var c=b.data("element");c.select2("close")}})})},d.prototype._detachCloseHandler=function(b){a(document.body).off("mousedown.select2."+b.id)},d.prototype.position=function(a,b){var c=b.find(".selection");c.append(a)},d.prototype.destroy=function(){this._detachCloseHandler(this.container)},d.prototype.update=function(a){throw new Error("The `update` method must be defined in child classes.")},d}),b.define("select2/selection/single",["jquery","./base","../utils","../keys"],function(a,b,c,d){function e(){e.__super__.constructor.apply(this,arguments)}return c.Extend(e,b),e.prototype.render=function(){var a=e.__super__.render.call(this);return a.addClass("select2-selection--single"),a.html('<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'),a},e.prototype.bind=function(a,b){var c=this;e.__super__.bind.apply(this,arguments);var d=a.id+"-container";this.$selection.find(".select2-selection__rendered").attr("id",d),this.$selection.attr("aria-labelledby",d),this.$selection.on("mousedown",function(a){1===a.which&&c.trigger("toggle",{originalEvent:a})}),this.$selection.on("focus",function(a){}),this.$selection.on("blur",function(a){}),a.on("selection:update",function(a){c.update(a.data)})},e.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},e.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},e.prototype.selectionContainer=function(){return a("<span></span>")},e.prototype.update=function(a){if(0===a.length)return void this.clear();var b=a[0],c=this.$selection.find(".select2-selection__rendered"),d=this.display(b,c);c.empty().append(d),c.prop("title",b.title||b.text)},e}),b.define("select2/selection/multiple",["jquery","./base","../utils"],function(a,b,c){function d(a,b){d.__super__.constructor.apply(this,arguments)}return c.Extend(d,b),d.prototype.render=function(){var a=d.__super__.render.call(this);return a.addClass("select2-selection--multiple"),a.html('<ul class="select2-selection__rendered"></ul>'),a},d.prototype.bind=function(b,c){var e=this;d.__super__.bind.apply(this,arguments),this.$selection.on("click",function(a){e.trigger("toggle",{originalEvent:a})}),this.$selection.on("click",".select2-selection__choice__remove",function(b){if(!e.options.get("disabled")){var c=a(this),d=c.parent(),f=d.data("data");e.trigger("unselect",{originalEvent:b,data:f})}})},d.prototype.clear=function(){this.$selection.find(".select2-selection__rendered").empty()},d.prototype.display=function(a,b){var c=this.options.get("templateSelection"),d=this.options.get("escapeMarkup");return d(c(a,b))},d.prototype.selectionContainer=function(){var b=a('<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>');return b},d.prototype.update=function(a){if(this.clear(),0!==a.length){for(var b=[],d=0;d<a.length;d++){var e=a[d],f=this.selectionContainer(),g=this.display(e,f);f.append(g),f.prop("title",e.title||e.text),f.data("data",e),b.push(f)}var h=this.$selection.find(".select2-selection__rendered");c.appendMany(h,b)}},d}),b.define("select2/selection/placeholder",["../utils"],function(a){function b(a,b,c){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c)}return b.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},b.prototype.createPlaceholder=function(a,b){var c=this.selectionContainer();return c.html(this.display(b)),c.addClass("select2-selection__placeholder").removeClass("select2-selection__choice"),c},b.prototype.update=function(a,b){var c=1==b.length&&b[0].id!=this.placeholder.id,d=b.length>1;if(d||c)return a.call(this,b);this.clear();var e=this.createPlaceholder(this.placeholder);this.$selection.find(".select2-selection__rendered").append(e)},b}),b.define("select2/selection/allowClear",["jquery","../keys"],function(a,b){function c(){}return c.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),null==this.placeholder&&this.options.get("debug")&&window.console&&console.error&&console.error("Select2: The `allowClear` option should be used in combination with the `placeholder` option."),this.$selection.on("mousedown",".select2-selection__clear",function(a){d._handleClear(a)}),b.on("keypress",function(a){d._handleKeyboardClear(a,b)})},c.prototype._handleClear=function(a,b){if(!this.options.get("disabled")){var c=this.$selection.find(".select2-selection__clear");if(0!==c.length){b.stopPropagation();for(var d=c.data("data"),e=0;e<d.length;e++){var f={data:d[e]};if(this.trigger("unselect",f),f.prevented)return}this.$element.val(this.placeholder.id).trigger("change"),this.trigger("toggle",{})}}},c.prototype._handleKeyboardClear=function(a,c,d){d.isOpen()||(c.which==b.DELETE||c.which==b.BACKSPACE)&&this._handleClear(c)},c.prototype.update=function(b,c){if(b.call(this,c),!(this.$selection.find(".select2-selection__placeholder").length>0||0===c.length)){var d=a('<span class="select2-selection__clear">&times;</span>');d.data("data",c),this.$selection.find(".select2-selection__rendered").prepend(d)}},c}),b.define("select2/selection/search",["jquery","../utils","../keys"],function(a,b,c){function d(a,b,c){a.call(this,b,c)}return d.prototype.render=function(b){var c=a('<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" aria-autocomplete="list" /></li>');this.$searchContainer=c,this.$search=c.find("input");var d=b.call(this);return this._transferTabIndex(),d},d.prototype.bind=function(a,b,d){var e=this;a.call(this,b,d),b.on("open",function(){e.$search.trigger("focus")}),b.on("close",function(){e.$search.val(""),e.$search.removeAttr("aria-activedescendant"),e.$search.trigger("focus")}),b.on("enable",function(){e.$search.prop("disabled",!1),e._transferTabIndex()}),b.on("disable",function(){e.$search.prop("disabled",!0)}),b.on("focus",function(a){e.$search.trigger("focus")}),b.on("results:focus",function(a){e.$search.attr("aria-activedescendant",a.id)}),this.$selection.on("focusin",".select2-search--inline",function(a){e.trigger("focus",a)}),this.$selection.on("focusout",".select2-search--inline",function(a){e._handleBlur(a)}),this.$selection.on("keydown",".select2-search--inline",function(a){a.stopPropagation(),e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented();var b=a.which;if(b===c.BACKSPACE&&""===e.$search.val()){var d=e.$searchContainer.prev(".select2-selection__choice");if(d.length>0){var f=d.data("data");e.searchRemoveChoice(f),a.preventDefault()}}});var f=document.documentMode,g=f&&11>=f;this.$selection.on("input.searchcheck",".select2-search--inline",function(a){return g?void e.$selection.off("input.search input.searchcheck"):void e.$selection.off("keyup.search")}),this.$selection.on("keyup.search input.search",".select2-search--inline",function(a){if(g&&"input"===a.type)return void e.$selection.off("input.search input.searchcheck");var b=a.which;b!=c.SHIFT&&b!=c.CTRL&&b!=c.ALT&&b!=c.TAB&&e.handleSearch(a)})},d.prototype._transferTabIndex=function(a){this.$search.attr("tabindex",this.$selection.attr("tabindex")),this.$selection.attr("tabindex","-1")},d.prototype.createPlaceholder=function(a,b){this.$search.attr("placeholder",b.text)},d.prototype.update=function(a,b){var c=this.$search[0]==document.activeElement;this.$search.attr("placeholder",""),a.call(this,b),this.$selection.find(".select2-selection__rendered").append(this.$searchContainer),this.resizeSearch(),c&&this.$search.focus()},d.prototype.handleSearch=function(){if(this.resizeSearch(),!this._keyUpPrevented){var a=this.$search.val();this.trigger("query",{term:a})}this._keyUpPrevented=!1},d.prototype.searchRemoveChoice=function(a,b){this.trigger("unselect",{data:b}),this.$search.val(b.text),this.handleSearch()},d.prototype.resizeSearch=function(){this.$search.css("width","25px");var a="";if(""!==this.$search.attr("placeholder"))a=this.$selection.find(".select2-selection__rendered").innerWidth();else{var b=this.$search.val().length+1;a=.75*b+"em"}this.$search.css("width",a)},d}),b.define("select2/selection/eventRelay",["jquery"],function(a){function b(){}return b.prototype.bind=function(b,c,d){var e=this,f=["open","opening","close","closing","select","selecting","unselect","unselecting"],g=["opening","closing","selecting","unselecting"];b.call(this,c,d),c.on("*",function(b,c){if(-1!==a.inArray(b,f)){c=c||{};var d=a.Event("select2:"+b,{params:c});e.$element.trigger(d),-1!==a.inArray(b,g)&&(c.prevented=d.isDefaultPrevented())}})},b}),b.define("select2/translation",["jquery","require"],function(a,b){function c(a){this.dict=a||{}}return c.prototype.all=function(){return this.dict},c.prototype.get=function(a){return this.dict[a]},c.prototype.extend=function(b){this.dict=a.extend({},b.all(),this.dict)},c._cache={},c.loadPath=function(a){if(!(a in c._cache)){var d=b(a);c._cache[a]=d}return new c(c._cache[a])},c}),b.define("select2/diacritics",[],function(){var a={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return a}),b.define("select2/data/base",["../utils"],function(a){function b(a,c){b.__super__.constructor.call(this)}return a.Extend(b,a.Observable),b.prototype.current=function(a){throw new Error("The `current` method must be defined in child classes.")},b.prototype.query=function(a,b){throw new Error("The `query` method must be defined in child classes.")},b.prototype.bind=function(a,b){},b.prototype.destroy=function(){},b.prototype.generateResultId=function(b,c){var d=b.id+"-result-";return d+=a.generateChars(4),d+=null!=c.id?"-"+c.id.toString():"-"+a.generateChars(4)},b}),b.define("select2/data/select",["./base","../utils","jquery"],function(a,b,c){function d(a,b){this.$element=a,this.options=b,d.__super__.constructor.call(this)}return b.Extend(d,a),d.prototype.current=function(a){var b=[],d=this;this.$element.find(":selected").each(function(){var a=c(this),e=d.item(a);b.push(e)}),a(b)},d.prototype.select=function(a){var b=this;if(a.selected=!0,c(a.element).is("option"))return a.element.selected=!0,void this.$element.trigger("change");if(this.$element.prop("multiple"))this.current(function(d){var e=[];a=[a],a.push.apply(a,d);for(var f=0;f<a.length;f++){var g=a[f].id;-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")});else{var d=a.id;this.$element.val(d),this.$element.trigger("change")}},d.prototype.unselect=function(a){var b=this;if(this.$element.prop("multiple"))return a.selected=!1,
c(a.element).is("option")?(a.element.selected=!1,void this.$element.trigger("change")):void this.current(function(d){for(var e=[],f=0;f<d.length;f++){var g=d[f].id;g!==a.id&&-1===c.inArray(g,e)&&e.push(g)}b.$element.val(e),b.$element.trigger("change")})},d.prototype.bind=function(a,b){var c=this;this.container=a,a.on("select",function(a){c.select(a.data)}),a.on("unselect",function(a){c.unselect(a.data)})},d.prototype.destroy=function(){this.$element.find("*").each(function(){c.removeData(this,"data")})},d.prototype.query=function(a,b){var d=[],e=this,f=this.$element.children();f.each(function(){var b=c(this);if(b.is("option")||b.is("optgroup")){var f=e.item(b),g=e.matches(a,f);null!==g&&d.push(g)}}),b({results:d})},d.prototype.addOptions=function(a){b.appendMany(this.$element,a)},d.prototype.option=function(a){var b;a.children?(b=document.createElement("optgroup"),b.label=a.text):(b=document.createElement("option"),void 0!==b.textContent?b.textContent=a.text:b.innerText=a.text),a.id&&(b.value=a.id),a.disabled&&(b.disabled=!0),a.selected&&(b.selected=!0),a.title&&(b.title=a.title);var d=c(b),e=this._normalizeItem(a);return e.element=b,c.data(b,"data",e),d},d.prototype.item=function(a){var b={};if(b=c.data(a[0],"data"),null!=b)return b;if(a.is("option"))b={id:a.val(),text:a.text(),disabled:a.prop("disabled"),selected:a.prop("selected"),title:a.prop("title")};else if(a.is("optgroup")){b={text:a.prop("label"),children:[],title:a.prop("title")};for(var d=a.children("option"),e=[],f=0;f<d.length;f++){var g=c(d[f]),h=this.item(g);e.push(h)}b.children=e}return b=this._normalizeItem(b),b.element=a[0],c.data(a[0],"data",b),b},d.prototype._normalizeItem=function(a){c.isPlainObject(a)||(a={id:a,text:a}),a=c.extend({},{text:""},a);var b={selected:!1,disabled:!1};return null!=a.id&&(a.id=a.id.toString()),null!=a.text&&(a.text=a.text.toString()),null==a._resultId&&a.id&&null!=this.container&&(a._resultId=this.generateResultId(this.container,a)),c.extend({},b,a)},d.prototype.matches=function(a,b){var c=this.options.get("matcher");return c(a,b)},d}),b.define("select2/data/array",["./select","../utils","jquery"],function(a,b,c){function d(a,b){var c=b.get("data")||[];d.__super__.constructor.call(this,a,b),this.addOptions(this.convertToOptions(c))}return b.Extend(d,a),d.prototype.select=function(a){var b=this.$element.find("option").filter(function(b,c){return c.value==a.id.toString()});0===b.length&&(b=this.option(a),this.addOptions(b)),d.__super__.select.call(this,a)},d.prototype.convertToOptions=function(a){function d(a){return function(){return c(this).val()==a.id}}for(var e=this,f=this.$element.find("option"),g=f.map(function(){return e.item(c(this)).id}).get(),h=[],i=0;i<a.length;i++){var j=this._normalizeItem(a[i]);if(c.inArray(j.id,g)>=0){var k=f.filter(d(j)),l=this.item(k),m=c.extend(!0,{},j,l),n=this.option(m);k.replaceWith(n)}else{var o=this.option(j);if(j.children){var p=this.convertToOptions(j.children);b.appendMany(o,p)}h.push(o)}}return h},d}),b.define("select2/data/ajax",["./array","../utils","jquery"],function(a,b,c){function d(a,b){this.ajaxOptions=this._applyDefaults(b.get("ajax")),null!=this.ajaxOptions.processResults&&(this.processResults=this.ajaxOptions.processResults),d.__super__.constructor.call(this,a,b)}return b.Extend(d,a),d.prototype._applyDefaults=function(a){var b={data:function(a){return c.extend({},a,{q:a.term})},transport:function(a,b,d){var e=c.ajax(a);return e.then(b),e.fail(d),e}};return c.extend({},b,a,!0)},d.prototype.processResults=function(a){return a},d.prototype.query=function(a,b){function d(){var d=f.transport(f,function(d){var f=e.processResults(d,a);e.options.get("debug")&&window.console&&console.error&&(f&&f.results&&c.isArray(f.results)||console.error("Select2: The AJAX results did not return an array in the `results` key of the response.")),b(f)},function(){e.trigger("results:message",{message:"errorLoading"})});e._request=d}var e=this;null!=this._request&&(c.isFunction(this._request.abort)&&this._request.abort(),this._request=null);var f=c.extend({type:"GET"},this.ajaxOptions);"function"==typeof f.url&&(f.url=f.url.call(this.$element,a)),"function"==typeof f.data&&(f.data=f.data.call(this.$element,a)),this.ajaxOptions.delay&&""!==a.term?(this._queryTimeout&&window.clearTimeout(this._queryTimeout),this._queryTimeout=window.setTimeout(d,this.ajaxOptions.delay)):d()},d}),b.define("select2/data/tags",["jquery"],function(a){function b(b,c,d){var e=d.get("tags"),f=d.get("createTag");void 0!==f&&(this.createTag=f);var g=d.get("insertTag");if(void 0!==g&&(this.insertTag=g),b.call(this,c,d),a.isArray(e))for(var h=0;h<e.length;h++){var i=e[h],j=this._normalizeItem(i),k=this.option(j);this.$element.append(k)}}return b.prototype.query=function(a,b,c){function d(a,f){for(var g=a.results,h=0;h<g.length;h++){var i=g[h],j=null!=i.children&&!d({results:i.children},!0),k=i.text===b.term;if(k||j)return f?!1:(a.data=g,void c(a))}if(f)return!0;var l=e.createTag(b);if(null!=l){var m=e.option(l);m.attr("data-select2-tag",!0),e.addOptions([m]),e.insertTag(g,l)}a.results=g,c(a)}var e=this;return this._removeOldTags(),null==b.term||null!=b.page?void a.call(this,b,c):void a.call(this,b,d)},b.prototype.createTag=function(b,c){var d=a.trim(c.term);return""===d?null:{id:d,text:d}},b.prototype.insertTag=function(a,b,c){b.unshift(c)},b.prototype._removeOldTags=function(b){var c=(this._lastTag,this.$element.find("option[data-select2-tag]"));c.each(function(){this.selected||a(this).remove()})},b}),b.define("select2/data/tokenizer",["jquery"],function(a){function b(a,b,c){var d=c.get("tokenizer");void 0!==d&&(this.tokenizer=d),a.call(this,b,c)}return b.prototype.bind=function(a,b,c){a.call(this,b,c),this.$search=b.dropdown.$search||b.selection.$search||c.find(".select2-search__field")},b.prototype.query=function(a,b,c){function d(a){e.trigger("select",{data:a})}var e=this;b.term=b.term||"";var f=this.tokenizer(b,this.options,d);f.term!==b.term&&(this.$search.length&&(this.$search.val(f.term),this.$search.focus()),b.term=f.term),a.call(this,b,c)},b.prototype.tokenizer=function(b,c,d,e){for(var f=d.get("tokenSeparators")||[],g=c.term,h=0,i=this.createTag||function(a){return{id:a.term,text:a.term}};h<g.length;){var j=g[h];if(-1!==a.inArray(j,f)){var k=g.substr(0,h),l=a.extend({},c,{term:k}),m=i(l);null!=m?(e(m),g=g.substr(h+1)||"",h=0):h++}else h++}return{term:g}},b}),b.define("select2/data/minimumInputLength",[],function(){function a(a,b,c){this.minimumInputLength=c.get("minimumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",b.term.length<this.minimumInputLength?void this.trigger("results:message",{message:"inputTooShort",args:{minimum:this.minimumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumInputLength",[],function(){function a(a,b,c){this.maximumInputLength=c.get("maximumInputLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){return b.term=b.term||"",this.maximumInputLength>0&&b.term.length>this.maximumInputLength?void this.trigger("results:message",{message:"inputTooLong",args:{maximum:this.maximumInputLength,input:b.term,params:b}}):void a.call(this,b,c)},a}),b.define("select2/data/maximumSelectionLength",[],function(){function a(a,b,c){this.maximumSelectionLength=c.get("maximumSelectionLength"),a.call(this,b,c)}return a.prototype.query=function(a,b,c){var d=this;this.current(function(e){var f=null!=e?e.length:0;return d.maximumSelectionLength>0&&f>=d.maximumSelectionLength?void d.trigger("results:message",{message:"maximumSelected",args:{maximum:d.maximumSelectionLength}}):void a.call(d,b,c)})},a}),b.define("select2/dropdown",["jquery","./utils"],function(a,b){function c(a,b){this.$element=a,this.options=b,c.__super__.constructor.call(this)}return b.Extend(c,b.Observable),c.prototype.render=function(){var b=a('<span class="select2-dropdown"><span class="select2-results"></span></span>');return b.attr("dir",this.options.get("dir")),this.$dropdown=b,b},c.prototype.bind=function(){},c.prototype.position=function(a,b){},c.prototype.destroy=function(){this.$dropdown.remove()},c}),b.define("select2/dropdown/search",["jquery","../utils"],function(a,b){function c(){}return c.prototype.render=function(b){var c=b.call(this),d=a('<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" role="textbox" /></span>');return this.$searchContainer=d,this.$search=d.find("input"),c.prepend(d),c},c.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),this.$search.on("keydown",function(a){e.trigger("keypress",a),e._keyUpPrevented=a.isDefaultPrevented()}),this.$search.on("input",function(b){a(this).off("keyup")}),this.$search.on("keyup input",function(a){e.handleSearch(a)}),c.on("open",function(){e.$search.attr("tabindex",0),e.$search.focus(),window.setTimeout(function(){e.$search.focus()},0)}),c.on("close",function(){e.$search.attr("tabindex",-1),e.$search.val("")}),c.on("results:all",function(a){if(null==a.query.term||""===a.query.term){var b=e.showSearch(a);b?e.$searchContainer.removeClass("select2-search--hide"):e.$searchContainer.addClass("select2-search--hide")}})},c.prototype.handleSearch=function(a){if(!this._keyUpPrevented){var b=this.$search.val();this.trigger("query",{term:b})}this._keyUpPrevented=!1},c.prototype.showSearch=function(a,b){return!0},c}),b.define("select2/dropdown/hidePlaceholder",[],function(){function a(a,b,c,d){this.placeholder=this.normalizePlaceholder(c.get("placeholder")),a.call(this,b,c,d)}return a.prototype.append=function(a,b){b.results=this.removePlaceholder(b.results),a.call(this,b)},a.prototype.normalizePlaceholder=function(a,b){return"string"==typeof b&&(b={id:"",text:b}),b},a.prototype.removePlaceholder=function(a,b){for(var c=b.slice(0),d=b.length-1;d>=0;d--){var e=b[d];this.placeholder.id===e.id&&c.splice(d,1)}return c},a}),b.define("select2/dropdown/infiniteScroll",["jquery"],function(a){function b(a,b,c,d){this.lastParams={},a.call(this,b,c,d),this.$loadingMore=this.createLoadingMore(),this.loading=!1}return b.prototype.append=function(a,b){this.$loadingMore.remove(),this.loading=!1,a.call(this,b),this.showLoadingMore(b)&&this.$results.append(this.$loadingMore)},b.prototype.bind=function(b,c,d){var e=this;b.call(this,c,d),c.on("query",function(a){e.lastParams=a,e.loading=!0}),c.on("query:append",function(a){e.lastParams=a,e.loading=!0}),this.$results.on("scroll",function(){var b=a.contains(document.documentElement,e.$loadingMore[0]);if(!e.loading&&b){var c=e.$results.offset().top+e.$results.outerHeight(!1),d=e.$loadingMore.offset().top+e.$loadingMore.outerHeight(!1);c+50>=d&&e.loadMore()}})},b.prototype.loadMore=function(){this.loading=!0;var b=a.extend({},{page:1},this.lastParams);b.page++,this.trigger("query:append",b)},b.prototype.showLoadingMore=function(a,b){return b.pagination&&b.pagination.more},b.prototype.createLoadingMore=function(){var b=a('<li class="select2-results__option select2-results__option--load-more"role="treeitem" aria-disabled="true"></li>'),c=this.options.get("translations").get("loadingMore");return b.html(c(this.lastParams)),b},b}),b.define("select2/dropdown/attachBody",["jquery","../utils"],function(a,b){function c(b,c,d){this.$dropdownParent=d.get("dropdownParent")||a(document.body),b.call(this,c,d)}return c.prototype.bind=function(a,b,c){var d=this,e=!1;a.call(this,b,c),b.on("open",function(){d._showDropdown(),d._attachPositioningHandler(b),e||(e=!0,b.on("results:all",function(){d._positionDropdown(),d._resizeDropdown()}),b.on("results:append",function(){d._positionDropdown(),d._resizeDropdown()}))}),b.on("close",function(){d._hideDropdown(),d._detachPositioningHandler(b)}),this.$dropdownContainer.on("mousedown",function(a){a.stopPropagation()})},c.prototype.destroy=function(a){a.call(this),this.$dropdownContainer.remove()},c.prototype.position=function(a,b,c){b.attr("class",c.attr("class")),b.removeClass("select2"),b.addClass("select2-container--open"),b.css({position:"absolute",top:-999999}),this.$container=c},c.prototype.render=function(b){var c=a("<span></span>"),d=b.call(this);return c.append(d),this.$dropdownContainer=c,c},c.prototype._hideDropdown=function(a){this.$dropdownContainer.detach()},c.prototype._attachPositioningHandler=function(c,d){var e=this,f="scroll.select2."+d.id,g="resize.select2."+d.id,h="orientationchange.select2."+d.id,i=this.$container.parents().filter(b.hasScroll);i.each(function(){a(this).data("select2-scroll-position",{x:a(this).scrollLeft(),y:a(this).scrollTop()})}),i.on(f,function(b){var c=a(this).data("select2-scroll-position");a(this).scrollTop(c.y)}),a(window).on(f+" "+g+" "+h,function(a){e._positionDropdown(),e._resizeDropdown()})},c.prototype._detachPositioningHandler=function(c,d){var e="scroll.select2."+d.id,f="resize.select2."+d.id,g="orientationchange.select2."+d.id,h=this.$container.parents().filter(b.hasScroll);h.off(e),a(window).off(e+" "+f+" "+g)},c.prototype._positionDropdown=function(){var b=a(window),c=this.$dropdown.hasClass("select2-dropdown--above"),d=this.$dropdown.hasClass("select2-dropdown--below"),e=null,f=this.$container.offset();f.bottom=f.top+this.$container.outerHeight(!1);var g={height:this.$container.outerHeight(!1)};g.top=f.top,g.bottom=f.top+g.height;var h={height:this.$dropdown.outerHeight(!1)},i={top:b.scrollTop(),bottom:b.scrollTop()+b.height()},j=i.top<f.top-h.height,k=i.bottom>f.bottom+h.height,l={left:f.left,top:g.bottom},m=this.$dropdownParent;"static"===m.css("position")&&(m=m.offsetParent());var n=m.offset();l.top-=n.top,l.left-=n.left,c||d||(e="below"),k||!j||c?!j&&k&&c&&(e="below"):e="above",("above"==e||c&&"below"!==e)&&(l.top=g.top-h.height),null!=e&&(this.$dropdown.removeClass("select2-dropdown--below select2-dropdown--above").addClass("select2-dropdown--"+e),this.$container.removeClass("select2-container--below select2-container--above").addClass("select2-container--"+e)),this.$dropdownContainer.css(l)},c.prototype._resizeDropdown=function(){var a={width:this.$container.outerWidth(!1)+"px"};this.options.get("dropdownAutoWidth")&&(a.minWidth=a.width,a.width="auto"),this.$dropdown.css(a)},c.prototype._showDropdown=function(a){this.$dropdownContainer.appendTo(this.$dropdownParent),this._positionDropdown(),this._resizeDropdown()},c}),b.define("select2/dropdown/minimumResultsForSearch",[],function(){function a(b){for(var c=0,d=0;d<b.length;d++){var e=b[d];e.children?c+=a(e.children):c++}return c}function b(a,b,c,d){this.minimumResultsForSearch=c.get("minimumResultsForSearch"),this.minimumResultsForSearch<0&&(this.minimumResultsForSearch=1/0),a.call(this,b,c,d)}return b.prototype.showSearch=function(b,c){return a(c.data.results)<this.minimumResultsForSearch?!1:b.call(this,c)},b}),b.define("select2/dropdown/selectOnClose",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("close",function(){d._handleSelectOnClose()})},a.prototype._handleSelectOnClose=function(){var a=this.getHighlightedResults();if(!(a.length<1)){var b=a.data("data");null!=b.element&&b.element.selected||null==b.element&&b.selected||this.trigger("select",{data:b})}},a}),b.define("select2/dropdown/closeOnSelect",[],function(){function a(){}return a.prototype.bind=function(a,b,c){var d=this;a.call(this,b,c),b.on("select",function(a){d._selectTriggered(a)}),b.on("unselect",function(a){d._selectTriggered(a)})},a.prototype._selectTriggered=function(a,b){var c=b.originalEvent;c&&c.ctrlKey||this.trigger("close",{})},a}),b.define("select2/i18n/en",[],function(){return{errorLoading:function(){return"The results could not be loaded."},inputTooLong:function(a){var b=a.input.length-a.maximum,c="Please delete "+b+" character";return 1!=b&&(c+="s"),c},inputTooShort:function(a){var b=a.minimum-a.input.length,c="Please enter "+b+" or more characters";return c},loadingMore:function(){return"Loading more results…"},maximumSelected:function(a){var b="You can only select "+a.maximum+" item";return 1!=a.maximum&&(b+="s"),b},noResults:function(){return"No results found"},searching:function(){return"Searching…"}}}),b.define("select2/defaults",["jquery","require","./results","./selection/single","./selection/multiple","./selection/placeholder","./selection/allowClear","./selection/search","./selection/eventRelay","./utils","./translation","./diacritics","./data/select","./data/array","./data/ajax","./data/tags","./data/tokenizer","./data/minimumInputLength","./data/maximumInputLength","./data/maximumSelectionLength","./dropdown","./dropdown/search","./dropdown/hidePlaceholder","./dropdown/infiniteScroll","./dropdown/attachBody","./dropdown/minimumResultsForSearch","./dropdown/selectOnClose","./dropdown/closeOnSelect","./i18n/en"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C){function D(){this.reset()}D.prototype.apply=function(l){if(l=a.extend(!0,{},this.defaults,l),null==l.dataAdapter){if(null!=l.ajax?l.dataAdapter=o:null!=l.data?l.dataAdapter=n:l.dataAdapter=m,l.minimumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,r)),l.maximumInputLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,s)),l.maximumSelectionLength>0&&(l.dataAdapter=j.Decorate(l.dataAdapter,t)),l.tags&&(l.dataAdapter=j.Decorate(l.dataAdapter,p)),(null!=l.tokenSeparators||null!=l.tokenizer)&&(l.dataAdapter=j.Decorate(l.dataAdapter,q)),null!=l.query){var C=b(l.amdBase+"compat/query");l.dataAdapter=j.Decorate(l.dataAdapter,C)}if(null!=l.initSelection){var D=b(l.amdBase+"compat/initSelection");l.dataAdapter=j.Decorate(l.dataAdapter,D)}}if(null==l.resultsAdapter&&(l.resultsAdapter=c,null!=l.ajax&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,x)),null!=l.placeholder&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,w)),l.selectOnClose&&(l.resultsAdapter=j.Decorate(l.resultsAdapter,A))),null==l.dropdownAdapter){if(l.multiple)l.dropdownAdapter=u;else{var E=j.Decorate(u,v);l.dropdownAdapter=E}if(0!==l.minimumResultsForSearch&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,z)),l.closeOnSelect&&(l.dropdownAdapter=j.Decorate(l.dropdownAdapter,B)),null!=l.dropdownCssClass||null!=l.dropdownCss||null!=l.adaptDropdownCssClass){var F=b(l.amdBase+"compat/dropdownCss");l.dropdownAdapter=j.Decorate(l.dropdownAdapter,F)}l.dropdownAdapter=j.Decorate(l.dropdownAdapter,y)}if(null==l.selectionAdapter){if(l.multiple?l.selectionAdapter=e:l.selectionAdapter=d,null!=l.placeholder&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,f)),l.allowClear&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,g)),l.multiple&&(l.selectionAdapter=j.Decorate(l.selectionAdapter,h)),null!=l.containerCssClass||null!=l.containerCss||null!=l.adaptContainerCssClass){var G=b(l.amdBase+"compat/containerCss");l.selectionAdapter=j.Decorate(l.selectionAdapter,G)}l.selectionAdapter=j.Decorate(l.selectionAdapter,i)}if("string"==typeof l.language)if(l.language.indexOf("-")>0){var H=l.language.split("-"),I=H[0];l.language=[l.language,I]}else l.language=[l.language];if(a.isArray(l.language)){var J=new k;l.language.push("en");for(var K=l.language,L=0;L<K.length;L++){var M=K[L],N={};try{N=k.loadPath(M)}catch(O){try{M=this.defaults.amdLanguageBase+M,N=k.loadPath(M)}catch(P){l.debug&&window.console&&console.warn&&console.warn('Select2: The language file for "'+M+'" could not be automatically loaded. A fallback will be used instead.');continue}}J.extend(N)}l.translations=J}else{var Q=k.loadPath(this.defaults.amdLanguageBase+"en"),R=new k(l.language);R.extend(Q),l.translations=R}return l},D.prototype.reset=function(){function b(a){function b(a){return l[a]||a}return a.replace(/[^\u0000-\u007E]/g,b)}function c(d,e){if(""===a.trim(d.term))return e;if(e.children&&e.children.length>0){for(var f=a.extend(!0,{},e),g=e.children.length-1;g>=0;g--){var h=e.children[g],i=c(d,h);null==i&&f.children.splice(g,1)}return f.children.length>0?f:c(d,f)}var j=b(e.text).toUpperCase(),k=b(d.term).toUpperCase();return j.indexOf(k)>-1?e:null}this.defaults={amdBase:"./",amdLanguageBase:"./i18n/",closeOnSelect:!0,debug:!1,dropdownAutoWidth:!1,escapeMarkup:j.escapeMarkup,language:C,matcher:c,minimumInputLength:0,maximumInputLength:0,maximumSelectionLength:0,minimumResultsForSearch:0,selectOnClose:!1,sorter:function(a){return a},templateResult:function(a){return a.text},templateSelection:function(a){return a.text},theme:"default",width:"resolve"}},D.prototype.set=function(b,c){var d=a.camelCase(b),e={};e[d]=c;var f=j._convertData(e);a.extend(this.defaults,f)};var E=new D;return E}),b.define("select2/options",["require","jquery","./defaults","./utils"],function(a,b,c,d){function e(b,e){if(this.options=b,null!=e&&this.fromElement(e),this.options=c.apply(this.options),e&&e.is("input")){var f=a(this.get("amdBase")+"compat/inputData");this.options.dataAdapter=d.Decorate(this.options.dataAdapter,f)}}return e.prototype.fromElement=function(a){var c=["select2"];null==this.options.multiple&&(this.options.multiple=a.prop("multiple")),null==this.options.disabled&&(this.options.disabled=a.prop("disabled")),null==this.options.language&&(a.prop("lang")?this.options.language=a.prop("lang").toLowerCase():a.closest("[lang]").prop("lang")&&(this.options.language=a.closest("[lang]").prop("lang"))),null==this.options.dir&&(a.prop("dir")?this.options.dir=a.prop("dir"):a.closest("[dir]").prop("dir")?this.options.dir=a.closest("[dir]").prop("dir"):this.options.dir="ltr"),a.prop("disabled",this.options.disabled),a.prop("multiple",this.options.multiple),a.data("select2Tags")&&(this.options.debug&&window.console&&console.warn&&console.warn('Select2: The `data-select2-tags` attribute has been changed to use the `data-data` and `data-tags="true"` attributes and will be removed in future versions of Select2.'),a.data("data",a.data("select2Tags")),a.data("tags",!0)),a.data("ajaxUrl")&&(this.options.debug&&window.console&&console.warn&&console.warn("Select2: The `data-ajax-url` attribute has been changed to `data-ajax--url` and support for the old attribute will be removed in future versions of Select2."),a.attr("ajax--url",a.data("ajaxUrl")),a.data("ajax--url",a.data("ajaxUrl")));var e={};e=b.fn.jquery&&"1."==b.fn.jquery.substr(0,2)&&a[0].dataset?b.extend(!0,{},a[0].dataset,a.data()):a.data();var f=b.extend(!0,{},e);f=d._convertData(f);for(var g in f)b.inArray(g,c)>-1||(b.isPlainObject(this.options[g])?b.extend(this.options[g],f[g]):this.options[g]=f[g]);return this},e.prototype.get=function(a){return this.options[a]},e.prototype.set=function(a,b){this.options[a]=b},e}),b.define("select2/core",["jquery","./options","./utils","./keys"],function(a,b,c,d){var e=function(a,c){null!=a.data("select2")&&a.data("select2").destroy(),this.$element=a,this.id=this._generateId(a),c=c||{},this.options=new b(c,a),e.__super__.constructor.call(this);var d=a.attr("tabindex")||0;a.data("old-tabindex",d),a.attr("tabindex","-1");var f=this.options.get("dataAdapter");this.dataAdapter=new f(a,this.options);var g=this.render();this._placeContainer(g);var h=this.options.get("selectionAdapter");this.selection=new h(a,this.options),this.$selection=this.selection.render(),this.selection.position(this.$selection,g);var i=this.options.get("dropdownAdapter");this.dropdown=new i(a,this.options),this.$dropdown=this.dropdown.render(),this.dropdown.position(this.$dropdown,g);var j=this.options.get("resultsAdapter");this.results=new j(a,this.options,this.dataAdapter),this.$results=this.results.render(),this.results.position(this.$results,this.$dropdown);var k=this;this._bindAdapters(),this._registerDomEvents(),this._registerDataEvents(),this._registerSelectionEvents(),this._registerDropdownEvents(),this._registerResultsEvents(),this._registerEvents(),this.dataAdapter.current(function(a){k.trigger("selection:update",{data:a})}),a.addClass("select2-hidden-accessible"),a.attr("aria-hidden","true"),this._syncAttributes(),a.data("select2",this)};return c.Extend(e,c.Observable),e.prototype._generateId=function(a){var b="";return b=null!=a.attr("id")?a.attr("id"):null!=a.attr("name")?a.attr("name")+"-"+c.generateChars(2):c.generateChars(4),b=b.replace(/(:|\.|\[|\]|,)/g,""),b="select2-"+b},e.prototype._placeContainer=function(a){a.insertAfter(this.$element);var b=this._resolveWidth(this.$element,this.options.get("width"));null!=b&&a.css("width",b)},e.prototype._resolveWidth=function(a,b){var c=/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;if("resolve"==b){var d=this._resolveWidth(a,"style");return null!=d?d:this._resolveWidth(a,"element")}if("element"==b){var e=a.outerWidth(!1);return 0>=e?"auto":e+"px"}if("style"==b){var f=a.attr("style");if("string"!=typeof f)return null;for(var g=f.split(";"),h=0,i=g.length;i>h;h+=1){var j=g[h].replace(/\s/g,""),k=j.match(c);if(null!==k&&k.length>=1)return k[1]}return null}return b},e.prototype._bindAdapters=function(){this.dataAdapter.bind(this,this.$container),this.selection.bind(this,this.$container),this.dropdown.bind(this,this.$container),this.results.bind(this,this.$container)},e.prototype._registerDomEvents=function(){var b=this;this.$element.on("change.select2",function(){b.dataAdapter.current(function(a){b.trigger("selection:update",{data:a})})}),this._sync=c.bind(this._syncAttributes,this),this.$element[0].attachEvent&&this.$element[0].attachEvent("onpropertychange",this._sync);var d=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;null!=d?(this._observer=new d(function(c){a.each(c,b._sync)}),this._observer.observe(this.$element[0],{attributes:!0,subtree:!1})):this.$element[0].addEventListener&&this.$element[0].addEventListener("DOMAttrModified",b._sync,!1)},e.prototype._registerDataEvents=function(){var a=this;this.dataAdapter.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerSelectionEvents=function(){var b=this,c=["toggle","focus"];this.selection.on("toggle",function(){b.toggleDropdown()}),this.selection.on("focus",function(a){b.focus(a)}),this.selection.on("*",function(d,e){-1===a.inArray(d,c)&&b.trigger(d,e)})},e.prototype._registerDropdownEvents=function(){var a=this;this.dropdown.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerResultsEvents=function(){var a=this;this.results.on("*",function(b,c){a.trigger(b,c)})},e.prototype._registerEvents=function(){var a=this;this.on("open",function(){a.$container.addClass("select2-container--open")}),this.on("close",function(){a.$container.removeClass("select2-container--open")}),this.on("enable",function(){a.$container.removeClass("select2-container--disabled")}),this.on("disable",function(){a.$container.addClass("select2-container--disabled")}),this.on("blur",function(){a.$container.removeClass("select2-container--focus")}),this.on("query",function(b){a.isOpen()||a.trigger("open",{}),this.dataAdapter.query(b,function(c){a.trigger("results:all",{data:c,query:b})})}),this.on("query:append",function(b){this.dataAdapter.query(b,function(c){a.trigger("results:append",{data:c,query:b})})}),this.on("keypress",function(b){var c=b.which;a.isOpen()?c===d.ESC||c===d.TAB||c===d.UP&&b.altKey?(a.close(),b.preventDefault()):c===d.ENTER?(a.trigger("results:select",{}),b.preventDefault()):c===d.SPACE&&b.ctrlKey?(a.trigger("results:toggle",{}),b.preventDefault()):c===d.UP?(a.trigger("results:previous",{}),b.preventDefault()):c===d.DOWN&&(a.trigger("results:next",{}),b.preventDefault()):(c===d.ENTER||c===d.SPACE||c===d.DOWN&&b.altKey)&&(a.open(),b.preventDefault())})},e.prototype._syncAttributes=function(){this.options.set("disabled",this.$element.prop("disabled")),this.options.get("disabled")?(this.isOpen()&&this.close(),this.trigger("disable",{})):this.trigger("enable",{})},e.prototype.trigger=function(a,b){var c=e.__super__.trigger,d={open:"opening",close:"closing",select:"selecting",unselect:"unselecting"};if(void 0===b&&(b={}),a in d){var f=d[a],g={prevented:!1,name:a,args:b};if(c.call(this,f,g),g.prevented)return void(b.prevented=!0)}c.call(this,a,b)},e.prototype.toggleDropdown=function(){this.options.get("disabled")||(this.isOpen()?this.close():this.open())},e.prototype.open=function(){this.isOpen()||this.trigger("query",{})},e.prototype.close=function(){this.isOpen()&&this.trigger("close",{})},e.prototype.isOpen=function(){return this.$container.hasClass("select2-container--open")},e.prototype.hasFocus=function(){return this.$container.hasClass("select2-container--focus")},e.prototype.focus=function(a){this.hasFocus()||(this.$container.addClass("select2-container--focus"),this.trigger("focus",{}))},e.prototype.enable=function(a){this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("enable")` method has been deprecated and will be removed in later Select2 versions. Use $element.prop("disabled") instead.'),(null==a||0===a.length)&&(a=[!0]);var b=!a[0];this.$element.prop("disabled",b)},e.prototype.data=function(){this.options.get("debug")&&arguments.length>0&&window.console&&console.warn&&console.warn('Select2: Data can no longer be set using `select2("data")`. You should consider setting the value instead using `$element.val()`.');var a=[];return this.dataAdapter.current(function(b){a=b}),a},e.prototype.val=function(b){if(this.options.get("debug")&&window.console&&console.warn&&console.warn('Select2: The `select2("val")` method has been deprecated and will be removed in later Select2 versions. Use $element.val() instead.'),null==b||0===b.length)return this.$element.val();var c=b[0];a.isArray(c)&&(c=a.map(c,function(a){return a.toString()})),this.$element.val(c).trigger("change")},e.prototype.destroy=function(){this.$container.remove(),this.$element[0].detachEvent&&this.$element[0].detachEvent("onpropertychange",this._sync),null!=this._observer?(this._observer.disconnect(),this._observer=null):this.$element[0].removeEventListener&&this.$element[0].removeEventListener("DOMAttrModified",this._sync,!1),this._sync=null,this.$element.off(".select2"),this.$element.attr("tabindex",this.$element.data("old-tabindex")),this.$element.removeClass("select2-hidden-accessible"),this.$element.attr("aria-hidden","false"),this.$element.removeData("select2"),this.dataAdapter.destroy(),this.selection.destroy(),this.dropdown.destroy(),this.results.destroy(),this.dataAdapter=null,this.selection=null,this.dropdown=null,this.results=null},e.prototype.render=function(){var b=a('<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>');return b.attr("dir",this.options.get("dir")),this.$container=b,this.$container.addClass("select2-container--"+this.options.get("theme")),b.data("element",this.$element),b},e}),b.define("jquery-mousewheel",["jquery"],function(a){return a}),b.define("jquery.select2",["jquery","jquery-mousewheel","./select2/core","./select2/defaults"],function(a,b,c,d){if(null==a.fn.select2){var e=["open","close","destroy"];a.fn.select2=function(b){if(b=b||{},"object"==typeof b)return this.each(function(){var d=a.extend(!0,{},b);new c(a(this),d)}),this;if("string"==typeof b){var d;return this.each(function(){var c=a(this).data("select2");null==c&&window.console&&console.error&&console.error("The select2('"+b+"') method was called on an element that is not using Select2.");var e=Array.prototype.slice.call(arguments,1);d=c[b].apply(c,e)}),a.inArray(b,e)>-1?this:d}throw new Error("Invalid arguments for Select2: "+b)}}return null==a.fn.select2.defaults&&(a.fn.select2.defaults=d),c}),{define:b.define,require:b.require}}(),c=b.require("jquery.select2");return a.fn.select2.amd=b,c});
/*slick.js*/
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.6.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows > 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }


        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }

        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick',
                '*:not(.slick-arrow)', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            })
                .first().attr('aria-selected', 'true').end()
                .find('button').attr('role', 'button').end()
                .closest('div').attr('role', 'toolbar');
        }
        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if ( _.options.dots === true && _.options.pauseOnDotsHover === true ) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {
                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            _.setPosition();

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

                    _.$slides
                        .slice(index - centerOffset, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .attr('aria-hidden', 'true');

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active')
                .attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));
/*wpreloader.js*/
/*
    wPreloader v3.0 / core js file
    WEZOM Studio / Oleg Dutchenko
*/

window.wPreloader = (function(window, document, undefined) {

    /* Приватные переменные */

        var wpr = Object.create(null),
            _pref = 'wpreloader_',
            _timer,
            _array = ['wraper', 'holder', 'ready', 'show', 'block', 'removing'];
            _options = {
                delay: 300,
                block: false,
                mainClass: false,
                markup: '<div class="wpreloader_logo"><ul><li><span></span><span></span></li><li><span></span><span></span></li></ul></div>'
            };

    /* Приватные функции */

        var _getEl = function(where, who) {
                return where.getElementsByClassName(who);
            },

            _crtEl = function(className) {
                var div = document.createElement('div');
                if (className) {
                    div.classList.add(className);
                }
                return div;
            },

            _className = function(num) {
                return _pref + _array[num];
            },

            _showNow = function(wraper, options) {
                wraper.classList.add(_className(3));
                if (options.block) {
                    wraper.classList.add(_className(4));
                }
                if (options.mainClass) {
                    wraper.setAttribute('data-mainclass', options.mainClass);
                    wraper.classList.add(options.mainClass);
                }
                setTimeout(function() {
                    wraper.classList.add(_className(2));
                }, 10);
            },

            _findPreloader = function(wraper) {
                var preloader, elem = _getEl(wraper, _className(0));
                if (elem[0]) {
                    preloader = elem[0];
                } else {
                    preloader = false;
                }
                return preloader;
            },

            _cloneObj = function(object) {
                var newObj = {}, key;
                for (key in object) {
                    newObj[key] = object[key];
                }
                return newObj;
            },

            _extend = function(options) {
                var opts = _cloneObj(_options);
                if (typeof options === 'object') {
                    for (var key in options) {
                        if (_options.hasOwnProperty(key)) {
                            opts[key] = options[key];
                        }
                    }
                }
                return opts;
            },

            _build = function(wraper, options) {
                var holderWraper = _crtEl(_className(0));
                var holder = _crtEl(_className(1));
                holder.innerHTML = options.markup;
                holderWraper.setAttribute('data-delay', options.delay);
                holderWraper.appendChild(holder);
                wraper.appendChild(holderWraper);
                _showNow(wraper, options);
            },

            _remove = function(wraper, callback) {
                var preloader = _findPreloader(wraper);
                if (preloader) {
                    var out = preloader.getAttribute('data-delay');
                    var mClass = wraper.getAttribute('data-mainclass');
                    wraper.classList.add(_className(5));
                    clearTimeout(_timer);
                    _timer = setTimeout(function() {
                        if (typeof mClass != 'undefined') {
                            wraper.classList.remove(mClass);
                            wraper.removeAttribute('data-mainclass');
                        }
                        for (var i = 2; i < _array.length; i++) {
                            wraper.classList.remove(_className(i));
                        }
                        wpr.open = false;
                        preloader.remove();
                        if (typeof callback === 'function') {
                            callback.call();
                        }
                    }, out);
                }
            };


    /* методы */

        wpr.show = function(wraper, options) {
            if (wpr.open) {
                console.warn('wpreloader - is open');
                return false;
            } else {
                wpr.open = false;
                var opts = _extend(options);
                var wrapperElement;
                if (opts.block) {
                    wrapperElement = document.body;
                } else {
                    wrapperElement = wraper || document.body;
                }
                if (wrapperElement.length) {
                    for (var i = 0; i < wrapperElement.length; i++) {
                        _build(wrapperElement[i], opts);
                    }
                } else {
                    _build(wrapperElement, opts);
                }
            }
        };

        wpr.hide = function(wraper, callback) {
            var wrapperElement = wraper || document.body;
            if (wrapperElement.length) {
                for (var i = 0; i < wrapperElement.length; i++) {
                    _remove(wrapperElement[i], callback);
                }
            } else {
                _remove(wrapperElement, callback);
            }
        };

        wpr.config = function(obj) {
            for (var key in obj) {
                if (_options.hasOwnProperty(key)) {
                    _options[key] = obj[key];
                }
            }
        };

    return wpr;

})(this, this.document);
//# sourceMappingURL=maps/components.js.map
