(function() {
  var obj = [];
  obj.name = "HOME";
  obj.home = "http://" + config.plugins.GitHub.user + ".github.io/dev-board/";
  obj.favicon = config.plugins[obj.name].favicon || "image/profile.jpg";

  obj.getData = function() {
    // http://jp.freepik.com/free-icon/personal-data-visualization-in-a-laptop-monitor_738368.htm
    var c = config.plugins[obj.name];
    return new Promise(function(resolve, reject) {
      data = {
        update_at_dev_board: moment().format("x"),
        type_of_dev_board: obj.name,
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

    var items = config.plugins[obj.name].links;
    for (var name in config.plugins) {
      var link = (config.plugins[obj.name].links[name] !== undefined)?
        config.plugins[obj.name].links[name]: config.plugins[name].home;
      items[name] = link;
    }
    home[0].items = items;

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

    var items = [];
    for (var name in item.items) {
      if (name === obj.name) { continue; }
      if (name === "Email") {
        items.push("<li><a href='mailto:" + item.items[name] + "'>" + name + "</a</li>");
      } else {
        items.push("<li><a href='" + item.items[name] + "'>" + name + "</a></li>");
      }
    }
    items = items.join("");
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
