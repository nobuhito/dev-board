devBoard = [];

$("body").removeClass("container");

var plugins = {};

colCount = 0;

function main() {
  console.log("main");

  $("#list").text("");

  colCount = ($(window).width() <= 640)? 1: ($(window).width() <= 800)? 2: 3;

  var cache = JSON.parse(sessionStorage.getItem("cache"));
  if (cache) {
    var expires = moment(cache.datetime, "x").add(12, 'hours').format("x");
    if (expires < moment().format("x")) {
      cache = undefined;
    }
  }

  if (cache) {
    devBoard.map(function(p) { plugins[p.name] = p; });
    datas = cache.data;
    mergeData(datas, function(cards) {
      renderData(cards);
    });
  } else {
    getData(function(datas, cb) {
      modData(datas, cb);
    });
  }
}

function getData(cb) {
  console.log("getData");
  Promise
    .all(
      devBoard
        .filter(function(p) {
          plugins[p.name] = p;
          return (plugins[p.name].hasOwnProperty("getData"));
        })
        .map(function(p) {
          return p.getData();
        })
    )
    .then(function(results) {
      cb(results, function(datas, cb) {
        mergeData(datas, cb);
      });
    });
}

function modData(datas, cb) {
  console.log("modData");
  Promise
    .all(
      devBoard
      .filter(function(p) {
        return p.hasOwnProperty("modData");
      })
      .map(function(p) {
        return p.modData(datas);
      })
    )
    .then(function(results) {
      for (var i in results) {
        var type = results[i].type;
        var isExist = false;
        for (var j in datas) {
          if (datas[j].type === type) {
            datas[j].data = results[i].data;
            isExist = true;
          }
        }
        if (!isExist) {
          datas.push(results[i]);
        }
      }

      var now = moment().format("x");
      sessionStorage.setItem("cache", JSON.stringify({datetime: now, data: datas, plugins: plugins}));
      //$("body").attr("data-cache", JSON.stringify(datas));
      cb(datas, function(cards) {
        renderData(cards);
      });
    });
}

function mergeData(datas, cb) {
  console.log("mergeData");
  var data = [];
  var since = moment().subtract(12, "M").format("x");
  var hash = location.hash;
  var type = (hash)? location.hash.replace("#", "").split("_")[0]: hash;
  var sort = (hash)? location.hash.replace("#", "").split("_").slice(1).join("_"): hash;
  console.log(type, sort);
  for (var j in datas) {
    var result = datas[j].data;
    if (type && datas[j].type.toLowerCase() !== type.toLowerCase()) continue;
    for (var k in result) {
      if (!type && result[k].update_at_dev_board < since) { continue; }
      data.push(result[k]);
    }
  }
  data = data.sort(function(a, b) {
    if (sort) {
      return (a[sort] > b[sort])? -1: 1;
    }
    return (a.update_at_dev_board > b.update_at_dev_board)? -1: 1;
  });

  cards = [];
  for (var i in data) {

    if (data.hasOwnProperty(i)) {
      var item = data[i];
      var card = plugins[item.type_of_dev_board].card(item, plugins);
      var link = (plugins[item.type_of_dev_board].hasOwnProperty("home"))?
        plugins[item.type_of_dev_board].home: "#";
      if (plugins[item.type_of_dev_board].hasOwnProperty("favicon")) {
        $("<div>")
          .addClass("favicon")
          .append(
            $("<a>")
              .attr("href", link)
              .append(
                $("<img>")
                  .attr("src", plugins[item.type_of_dev_board].favicon)
              )
          )
          .appendTo(card);
      }
      cards.push(card);
    }
  }
  cb(cards);
}

var resizeTimer = false;
function renderData(cards) {
  console.log("renderData");
  layout(cards);

  addMenu(plugins);

  $("div.highlight").each(function(i, block) {
    hljs.highlightBlock(block);
  });
  sort_bind();
  resize();
  $(window).resize(function() {
    // http://kadoppe.com/archives/2012/02/jquery-window-resize-event.html
    if (resizeTimer !== false) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(function() {
      main();
    }, 200);
    //location.reload();
    //resize();
  });
}

function addMenu(plugins) {
// <nav class="navbar navbar-default">
//   <div class="navbar-header">
//     <button type="button"
//             class="navbar-toggle collapsed"
//             data-toggle="collapse"
//             data-target="#option"
//             aria-expanded="true"
//             id="nav-button">
//       <span class="sr-only">Toggle navigation</span>
//     </button>
//     <a href="#" class="navbar-brand">RE:Volver</a>
//   </div>
//   <div id="option" class="navbar-collapse collapse">
//     <ul class="nav navbar-nav navbar-right" id="nav-dropdown">
//       <li class="dropdown">
//         <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
//         aria-haspopup="true" aria-expanded="false">
//           Qiita
//           <b class="caret"></b>
//         </a>
//         <ul class="dropdown-menu">
//           <li><span class="sortorder">Order by:</span></li>
//           <li><a href="#qiita_update_at_dev_board" class="sort_a">Update time</a></li>
//           <li><a href="#qiita_comment_count" class="sort_a">Comment count</a></li>
//           <li><a href="#qiita_stock_count" class="sort_a">Stock count</a></li>
//         </ul>
//       </li>
//     </ul>
//   </div>
// </nav>
  $("#nav-button").text("");
  $("#nav-dropdown").text("");
  $("<span>")
    .addClass("sr-only")
    .text("Toggle navigation");
  for (var i in plugins) {
    var menu = {};
    if (plugins[i].hasOwnProperty("dropdown")) {
      menu = plugins[i].dropdown();
    }
    var hasDropmenu = (Object.keys(menu).length > 0 )? true: false;

    var nav_button = $("#nav-button")
      .append(
        $("<span>")
          .addClass("icon-bar")
      );

    var dropdown_toggle = $("<a>")
        .addClass("dropdown-toggle")
        .text(plugins[i].name);
    if (hasDropmenu) {
      dropdown_toggle
        .attr({
          "data-toggle": "dropdown",
          "role": "button",
          "aria-haspopup": "true",
          "aria-expanded": "false"
        })
        .append(
          $("<b>")
            .addClass("caret")
        );
    } else {
      dropdown_toggle
        .addClass("sort_a")
        .attr("href", "#" + plugins[i].name.toLowerCase() + "_");
    }

    var dropdown = $("<li>")
        .addClass("dropdown")
        .append(
          dropdown_toggle
        );

    if (hasDropmenu) {
      var dropdown_menu = $("<ul>")
        .addClass("dropdown-menu")
        .append(
          $("<li>")
            .append(
              $("<span>")
                .addClass("sortorder")
                .text("Order by:")
            )
        );
        for (var key in menu) {
          dropdown_menu
            .append(
              $("<li>")
                .append(
                  $("<a>")
                    .addClass("sort_a")
                    .attr("href", "#" + plugins[i].name.toLowerCase() + "_" + key)
                    .text(menu[key])
                )
            );
        }
        dropdown_menu.appendTo(dropdown);
    }
    var nav_dropdown = $("#nav-dropdown")
      .append(
        dropdown
      );
  }
}

function layout(cards) {

  for (var i=0; i<colCount; i++) {
    $("#list")
      .addClass("row")
      .append(
        $("<div>")
        .addClass("col_" + i)
        .addClass("cols")
        .css("width", (100/colCount) + "%")
      );
  }

  cards.forEach(function(card, i) {
    heights = [];
    min = i;
    if (i >= 3) {
      for (var col=0; col<colCount; col++) {
        heights.push({key: col, val: $(".col_" + col).height()});
      }
      min = hash_min(heights);
    }
    $(".col_" + min).append(card);
  });
}

function hash_min(hash) {
  minKey = 0;
  minVal = hash[0].val;
  for (var i in hash) {
    if (i > 0) {
      if (hash[i].val < minVal) {
        minVal = hash[i].val;
        minKey = i;
       }
    }
  }
  return minKey;
}

function sort_bind() {
  $(".sort_a").on("click", function() {
    setTimeout(function() {
      main();
      //location.reload();
    }, 100);
  });
}

function resize() {
  var column = $($(".cols")[0]);
  var columnWidth = column.width() - 2;
  $(".thumbnail").each(function() {
    $(this).css("width", columnWidth);
  });
}

function unescapeHTML(str) {
  // http://blog.tojiru.net/article/211339637.html
  return str
          .replace(/&lt;/g,'<')
          .replace(/&gt;/g,'>')
          .replace(/&amp;/g,'&');
}
