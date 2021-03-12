var closePopup = function( it ) {
    it.fadeOut(650);
    setTimeout(function(){
        it.remove();
    }, 700);
};
var generate = function( message, type, time ) {
    var mainBlock = $('#fPopUp');
    var current;
    if(!mainBlock.length) {
        $('<div id="fPopUp"></div>').appendTo('body');
        mainBlock = $('#fPopUp');
    }
    var i = 1;
    var count = 0;
    mainBlock.find('.content').each(function(){
        current = parseInt($(this).data('i'));
        if(current + 1 > i) {
            i = current + 1;
        }
        count++;
    });
    if(count >= 5) {
        mainBlock.find('div.content:first-child').remove();
    }
    $('<div class="content ' + type + '" data-i="' + i + '" style="display: none;">' + message + '</div>').appendTo(mainBlock);
    mainBlock.find('div.content[data-i="' + i + '"]').fadeIn(200);
    if(time) {
        setTimeout(function(){
            closePopup(mainBlock.find('div.content[data-i="' + i + '"]'));
        }, time);
    }
};

$(function(){
    $('body').on('click', '#fPopUp div.content', function(){ closePopup($(this)); });

   if ($('#f_region').length) {
       $('#f_region').change(function(e){
            var region = $(this).val();
            if (!region) {
                return false;
            }

           $.post(
               '/ajax/getCities',
               {
                   region: region
               },
               function(data) {
                   var html = '<option value="" selected disabled>Выберите пункт</option>';
                   if(data.success) {
                        for(var i = 0; i < data.cities.length; i++) {
                            var row = data.cities[i];
                            
                            html += '<option value="' + row.id + '">' + row.name + '</option>';
                        }
                   }

                   $('#f_city').html(html);
               },
               'JSON'
           );

       }).trigger('change');
   }
});
