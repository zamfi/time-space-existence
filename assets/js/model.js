$( document ).ready(function() {

    var markers = $('.markers').children();

    // clone each animated circle element to create a static (non-pulsing) element with the animations removed
    $.each(markers, function(i, marker) {
      var initialClass = $(marker).attr("class").split(' ')[0];
      ["static"].map(function(newClass) {
         $(marker).clone().attr("class", initialClass + " static").insertAfter('.' + initialClass);

         $.each($("." + initialClass + ".static").children(), function(i, animation) {
           $(animation).remove();
         });
      });
    });

});
