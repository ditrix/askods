/*validation.js*/
/*
    validation.js v2.0
    Wezom wTPL v4.0.0
*/

(function($){

    if (typeof wHTML === 'undefined') {
        window.wHTML = {};
    }

    var ValidLang = wLocalize.Validate[wLang];
    var MSGS = {};
    for (var key in ValidLang) {
        var val = ValidLang[key];
        switch(key) {
            case 'maxlength':
            case 'maxlength_checker':
            case 'maxlength_select':
            case 'minlength':
            case 'minlength_select':
            case 'minlength_checker':
            case 'rangelength':
            case 'rangelength_checker':
            case 'rangelength_select':
            case 'rangelength_select':
            case 'range':
            case 'max':
            case 'min':
            case 'filetype':
            case 'filesize':
            case 'filesizeEach':
            case 'pattern':
                MSGS[key] = $.validator.format(val);
                break;
            default:
                MSGS[key] = val;
        }
    }

    $.extend($.validator.messages, MSGS);

    wHTML.wInputDate = function() {
        if (!Modernizr.touch) {
            var dates = document.getElementsByClassName('wInputDate');
            for (var i = 0; i < dates.length; i++) {
                var el = dates[i];
                if (el.type == 'date') {
                    el.type = 'text';
                }
            }
        }
    };

    wHTML.validation = function() {
        this.wInputDate();
        $('.wForm').each(function() {
            var formValid = $(this);
            var validator = $.data(this, "validator");
            if (typeof validator === 'undefined') {
                formValid.validate({
                    showErrors: function(errorMap, errorList) {
                        if (errorList.length) {
                            var firstError = errorList.shift();
                            var newErrorList = [];
                            newErrorList.push(firstError);
                            this.errorList = newErrorList;
                        }
                        this.defaultShowErrors();
                    },
                    invalidHandler: function(form, validator) {
                        formValid
                            .addClass('no_valid')
                            .data('validator').focusInvalid();
                    },
                    submitHandler: function(form) {
                        var formJQ = $(form);
                        var preloader = false;
                        if (formJQ.hasClass('wFormPreloader')) {
                            preloader = formJQ;
                        } else if (formJQ.hasClass('wSubmitPreloader')) {
                            preloader = formJQ.find('.wSubmit');
                        }
                        formValid.removeClass('no_valid').addClass('success');
                        if (form.tagName.toLowerCase() === 'form') {
                            form.submit();
                        } else {
                            if (preloader) {
                                wPreloader.show(preloader);
                            }
                            if( formJQ.data('ajax') ) {
                                var data = new FormData();
                                var name;
                                var val;
                                var type;
                                formJQ.find('input,textarea,select').each(function(){
                                    var thisJQ = $(this);
                                    name = thisJQ.data('name');
                                    val = this.value;
                                    type = this.type;
                                    if((type != 'checkbox' && name) || (type == 'checkbox' && this.checked && name)) {
                                        if(type == 'file') {
                                            data.append(name, $(this)[0].files[0]);
                                        } else if(type == 'radio' && $(this).prop('checked')) {
                                            data.append(name, val);
                                        } else if(type != 'radio') {
                                            data.append(name, val);
                                        }
                                    }
                                });
                                var request = new XMLHttpRequest();
                                request.open("POST", '/form/' + formJQ.data('ajax'));
                                request.onreadystatechange = function() {
                                    var status;
                                    var resp;
                                    if (request.readyState == 4) {
                                        status = request.status;
                                        resp = request.response;
                                        resp = jQuery.parseJSON(resp);
                                        if (status == 200) {
                                            if( resp.success ) {
                                                if (!resp.noclear) {
                                                    formJQ.validReset();
                                                    $.magnificPopup.close();

                                                }
                                                if (resp.clear) {
                                                    for(var i = 0; i < resp.clear.length; i++) {
                                                        $('input[name="' + resp.clear[i] + '"]').val('');
                                                        $('textarea[name="' + resp.clear[i] + '"]').val('');
                                                    }
                                                }
                                                if (resp.insert && resp.insert.selector && resp.insert.html) {
                                                    $(resp.insert.selector).html(resp.insert.html);
                                                }
                                                if ( resp.response ) {
                                                    generate(resp.response, 'success', 3500);
                                                }
                                            } else {
                                                if ( resp.response ) {
                                                    generate(resp.response, 'warning', 3500);
                                                }
                                            }
                                            if( resp.redirect ) {
                                                if(window.location.href == resp.redirect) {
                                                    window.location.reload();
                                                } else {
                                                    window.location.href = resp.redirect;
                                                }
                                            }
                                        } else {
                                            alert('Something went wrong,\nbut HTML fine ;)');
                                        }
                                    }
                                    if (preloader) {
                                        wPreloader.hide(preloader);
                                    }
                                };
                                request.send(data);
                                return false;
                            } else {
                                console.warn('HTML => Форма отправлена');
                                if (preloader) {
                                    setTimeout(function() {
                                        formJQ.validReset();
                                        wPreloader.hide(preloader);
                                    }, 1000);
                                }
                            }
                        }
                    }
                });
                formValid.on('change', '.wFile', function(event) {
                    formValid.wFileVal(this);
                });

                /* Без тега FORM */
                formValid.on('click', '.wSubmit', function(event) {
                    formValid.submit();
                    // $.magnificPopup.close();
                });

                /* Сброс Без тега FORM */
                formValid.on('click', '.wReset', function(event) {
                    if (formValid.is('DIV')) {
                        formValid.validReset();
                        wHTML.wInputDate();
                    }
                });
            }
        });

    };

})(jQuery);
//# sourceMappingURL=maps/validation.js.map
