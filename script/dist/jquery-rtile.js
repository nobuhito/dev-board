// http://qiita.com/itmammoth/items/94a19f538cf812e61906
// https://github.com/itmammoth/jqueryPluginTemplateUsingClass
// http://www.almondlab.jp/notes/1015
// http://www.6666666.jp/design/addmaxwidth/


var settings;
var colCount = 0;
var columnWidth = 0;
var heights = [];
var counter = 0;
var items = [];
var timer = 0;

var observerl;

function run() {
  if (colCount === 0) { $.error("Does not initialize on jQuery.rtile"); }

  var element = $("<div>").append(items[0]);
  var imgs = element.find("img");

  Promise
    .all(
      imgs.get().map(function(img) {
        return new Promise(function(resolve, reject) {
          var image = new Image();
          image.src = img.src;
          $(image).bind("load", {elm: img}, function(event) {
            var $target = $(event.data.elm);
            var per = columnWidth / this.width;
            var height = $target.attr("height");
            if (height === undefined) {
              $target
                .attr("width", this.width + "px")
                .attr("height", this.height + "px")
                .css({
                  "height": ($target.css("height") === "0px")? "99%": $target.css("height"),
                  "width": ($target.css("width") === "0px")? "99%": $target.css("width")
                });
            }
            resolve();
          });
        });
      })
    )
    .then(function(results) {
      var maxVal = 0;
      var minVal = heights[0];
      var h = 0;
      if (counter < colCount) {
        h = append($(".col_" + counter), element, settings);
        heights[counter] = h;
      } else {
        var min = 0;
        for (var i in heights) {
      	  if (heights[i] > maxVal) { maxVal = heights[i]; }
          if (i === 0) { continue; }
          if (heights[i] < minVal) {
            minVal = heights[i];
            min = i;
          }
        }
        h = append($(".col_" + min), element, settings);
        heights[min] = heights[min] + h;
      }
      counter++;
      var item = items.shift();
    });
}

(function($) {
  var methods = {
    init: function(options) {
      settings = $.extend({
        "minWidth": 640,
        "transition": "fadeIn", // fadeIn or slideIn
        "speed": "slow",
        "deley": 500,
        cb: function(){}
      }, options);

      counter = 0;

      observer = new ArrayObserver(items);
      observer.open(function(splices) {
        if (splices[0].addedCount > 0 && splices[0].index === 0) {
          run();
        }
        if (splices[0].removed.length > 0 && items.length > 0) {
          timer = setTimeout(function() {
            run();
          }, settings.deley);
        }
      });


      colCount = ($(window).width() < settings.minWidth)?       1:
                 ($(window).width() < settings.minWidth * 1.5)? 2:
                                                                3;

    var column = $($(".col_0")[0]);
    columnWidth = column.width();

      $(this).text("");

      for (var i=0; i<colCount; i++) {
        $(this)
          .append(
            $("<div>")
              .addClass("rtile col_" + i)
              .css({
                "width": (100/colCount) + "%",
                "float": "left"
              })
          );
      }
      $(this).append("<div>").css("clear", "both");

      return this;
    },

    stop: function() {
      clearTimeout(timer);
      observer.close();
      items = [];
    },

    add: function(element) {
      setTimeout(function() {
        items.push(element);
      }, 1);

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
  }, 1);
  if (typeof(settings.cb) === "function") {
    settings.cb.call(element);
  }
  return element.children().first().outerHeight(true);
}

function appendSlideIn(target, element, settings) {
  var margin = element.css("margin-top");
  var height = $(document).height();
  element.css("margin-top", height);
  target.append(element);
  setTimeout(function() {
    element.animate({"margin-top": margin}, settings.speed, "swing");
  }, 1);
  if (typeof(settings.cb) === "function") {
    settings.cb.call(element);
  }
  return element.children().first().outerHeight(true);
}
