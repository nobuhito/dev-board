devBoard = [];

$("body").removeClass("container");

var plugins = {};


function main() {
  googleAnalytics();

  $("#logo").bind("click", function() {
    location.reload();
  });

  $("#list").text("");

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
    mergeData(datas, function(data) {
      renderData(data);
    });
  } else {
    getData(function(datas, cb) {
      modData(datas, cb);
    });
  }
}

function getData(cb) {
  Promise
    .all(
      devBoard
        .filter(function(p) {
          plugins[p.name] = p;
          config.plugins[p.name].home = p.home || "";
          return (p.hasOwnProperty("getData"));
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

      cb(datas, function(cards) {
        renderData(cards);
      });
    });
}

function mergeData(datas, cb) {
  var data = [];
  var since = moment().subtract(12, "M").format("x");
  var hash = location.hash;
  var type = (hash)? location.hash.replace("#", "").split("_")[0]: hash;
  var sort = (hash)? location.hash.replace("#", "").split("_").slice(1).join("_"): hash;

  for (var j in datas) {
    var result = datas[j].data;
    if (type !== "" && datas[j].type.toLowerCase() !== type.toLowerCase()) continue;
    for (var k in result) {
      if (type === "" && result[k].update_at_dev_board < since) { continue; }
      data.push(result[k]);
    }
  }

  var sortData = data.sort(function(a, b) {
    if (sort !== "") {
      return (a[sort] > b[sort])? -1: 1;
    }
    return (a.update_at_dev_board > b.update_at_dev_board)? -1: 1;
  });

  cb(sortData);
}

var resizeTimer = false;
function renderData(cards) {

  layout(cards);

  addMenu(plugins);

  $("div.highlight").each(function(i, block) {
    hljs.highlightBlock(block);
  });

  sort_bind();
  var windowWidth = $(window).width();
  $(window).resize(function() {
    // http://kadoppe.com/archives/2012/02/jquery-window-resize-event.html
    if (resizeTimer !== false) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(function() {
      if (windowWidth !== $(window).width()) {
        $("#list").rtile("stop");
        main();
      }
    }, 1);
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
  $("#option").find("a").each(function() {
    if ($(this).attr("href") === "#home_") {
      $(this).attr("href", "#");
    }
  });
}

function layout(data) {

  $("#list").rtile(
    {
      transition: config.core.transition || "fadeIn",
      speed: config.core.speed || "slow"
    }
  );

  for (var i in data) {
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
                .attr("width", "32px")
                .attr("height", "32px")
            )
        )
        .appendTo(card);
    }
    $("<div>").text(i).appendTo(card);
    $("#list").rtile("add", card);
  }
}

function sort_bind() {
  $(".sort_a").on("click", function() {
    setTimeout(function() {
      $("#list").rtile("stop");
      main();
      //location.reload();
    }, 1);
  });
}

function unescapeHTML(str) {
  // http://blog.tojiru.net/article/211339637.html
  return str
          .replace(/&lt;/g,'<')
          .replace(/&gt;/g,'>')
          .replace(/&amp;/g,'&');
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
function googleAnalytics() {
  ga('create', config.core.gacode, 'auto');
  ga('send', 'pageview');
}
