(function($) {
  jQuery.fn.extend({
      rotate:function(degrees, rotate, reflect) {
          let rotation = `rotate(${degrees}deg)`;
          if (!rotate) rotation = '';
          let reflection = '';
          if (reflect && degrees > 90 && degrees < 270) reflection = ' scale(1, -1)';
          $(this).css({'-webkit-transform' : `${rotation}${reflection}`,
                       '-moz-transform' : `${rotation}${reflection}`,
                       '-ms-transform' : `${rotation}${reflection}`,
                       'transform' : `${rotation}${reflection}`});
          return $(this);
      },
      // other jquery extensions unused
      rotateflipped:function(degrees) {
          $(this).css({'-webkit-transform': 'rotate('+ degrees +'deg) scale(1, -1)',
                       '-moz-transform': 'rotate('+ degrees +'deg) scale(1, -1)',
                       '-ms-transform': 'rotate('+ degrees +'deg) scale(1, -1)',
                       'transform': 'rotate('+ degrees +'deg) scale(1, -1)'});
          return $(this);
      },      reflectx:function() {
          $(this).css({'-webkit-transform': 'scale(1, -1)',
                       '-moz-transform': 'scale(1, -1)',
                       '-ms-transform': 'scale(1, -1)',
                       'transform': 'scale(1, -1)'});
          return $(this);
      },
      reflecty:function() {
          $(this).css({'-webkit-transform': 'scale(-1, 1)',
                       '-moz-transform': 'scale(-1, 1)',
                       '-ms-transform': 'scale(-1, 1)',
                       'transform': 'scale(-1, 1)'});
          return $(this);
      },
      reflect:function() {
          $(this).css({'-webkit-transform': 'scale(-1, -1)',
                       '-moz-transform': 'scale(-1, -1)',
                       '-ms-transform': 'scale(-1, -1)',
                       'transform': 'scale(-1, -1)'});
          return $(this);
      }
  });
})(jQuery);
