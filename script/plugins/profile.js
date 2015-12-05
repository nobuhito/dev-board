(function() {
  var obj = [];
  obj.name = "HOME";
  obj.home = "http://" + config.plugins.GitHub.name + ".github.io/dev-board/";
  obj.favicon = config.plugins[obj.name].favicon || "image/profile.jpg";

  obj.getData = function() {
    // http://jp.freepik.com/free-icon/personal-data-visualization-in-a-laptop-monitor_738368.htm
    var c = config.plugins[obj.name];
    return new Promise(function(resolve, reject) {
      data = {
        update_at_dev_board: moment().format("x"),
        type_of_dev_board: obj.name,
        items: c.items,
        description: c.description,
        user: c.user,
        home: obj.home
      };
      resolve({type: obj.name, data: [data]});
    });
  };

  obj.modData = function(data) {
    for (var i in data) {
      if (data[i].type === obj.name) {
        home = data[i].data;
      }
    }

    var items = [];
    for (var name in config.plugins) {
      items.push({name: name, link: config.plugins[name].home});
    }
    home[0].items = $.extend(items, home[0].items);

    return {type: obj.name, data: home};
  };

  obj.card = function(item, plugins) {
    var card = $("<div>");
    card.addClass("card");

    $("<div>")
      .addClass("cardheader card-block")
      .append(
        $("<h3>")
          .css("margin-top", "0px")
          .text(item.user)
      )
      .appendTo(card);

    $("<div>")
      .addClass("text-center")
      .addClass("card-text")
      .addClass("text-muted")
      .html(item.description)
      .appendTo(card);

    var items = item.items.map(function(d) {
      return "<li><a href='" + d.link + "'>" + d.name + "</a></li>";
    }).join("");
    $("<div>")
      .addClass("card-block")
      .addClass("description")
      .append(
        $("<ul>")
          .append(items)
      )
      .appendTo(card);

    return card;
  };

  devBoard.push(obj);
})();
