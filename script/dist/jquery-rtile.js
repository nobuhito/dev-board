// http://qiita.com/itmammoth/items/94a19f538cf812e61906
// https://github.com/itmammoth/jqueryPluginTemplateUsingClass
;(function($) {
  var settings;
  var methods = {
    init: function(options) {
      settings = $.extend({
        "minWidth": 640,
        "transition": "slideIn", // fadeIn or slideIn
        "speed": "slow",
        cb: function(){}
      }, options);

      colCount = ($(window).width() < settings.minWidth)?     1:
                 ($(window).width() < settings.minWidth * 1.5)? 2:
                                                              3;

      $(this).text("");

      for (var i=0; i<colCount; i++) {
        $(this)
          .append(
            $("<div>")
              .addClass("col_" + i)
              .addClass("rtile")
              .css({
                "width": (100/colCount) + "%",
                "float": "left"
              })
          );
      }
      $(this).data("plugin_rtile_col_count", colCount);
      $(this).data("plugin_rtile_item_count", 0);

      return this;
    },

    add: function(element) {

      if (typeof($(this).data("plugin_rtile_col_count")) !== "number") {
        $.error("Does not initialize on jQuery.rtile");
      }

      var colCount = $(this).data("plugin_rtile_col_count");
      var counter = $(this).data("plugin_rtile_item_count") || 0;
      var heights = $(this).data("plugin_rtile_heights") || [];

      var maxVal = 0;
      var minVal = heights[0];
      if (counter < colCount) {
        heights[counter] = append($(".col_" + counter), element, settings);
      } else {

        var min = 0;
        for (var i in heights) {
      	  if (heights[i] > maxVal) {
      	  	  maxVal = heights[i];
      	  }
          if (i > 0) {
            if (heights[i] < minVal) {
              minVal = heights[i];
              min = i;
            }
          }
        }
        heights[min] = heights[min] + append($(".col_" + min), element, settings);
      }

      counter++;
      $(this).data("plugin_rtile_item_count", counter);
      $(this).data("plugin_rtile_heights", heights);

      return this;
    }
  };

  $.fn.rtile = function(method) {
    if (method && methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.rtile");
    }
  };
})(jQuery);

function append(target, element, settings) {
  var height = 0;
  if (settings.transition === "fadeIn") {
    height = appendFadeIn(target, element, settings);
  } else if (settings.transition === "slideIn") {
    height = appendSlideIn(target, element, settings);
  } else {
    $.error("Transition " + settings.transition + " does not exist on jQuery.rtile");
  }
  return height;
}

function appendFadeIn(target, element, settings) {
  element.css("opacity", 0);
  target.append(element);
  setTimeout(function() {
    element.fadeTo(settings.speed, 1);
  }, 100);
  if (typeof(settings.cb) === "function") {
    settings.cb.call(element);
  }
  return element.outerHeight();
}

function appendSlideIn(target, element, settings) {
  var margin = element.css("margin-top");
  var height = $(document).height();
  element.css("margin-top", height);
  target.append(element);
  setTimeout(function() {
    element.animate(
      {"margin-top": margin},
      settings.speed,
      "swing");
  }, 100);
  if (typeof(settings.cb) === "function") {
    settings.cb.call(element);
  }
  return element.outerHeight();
}
