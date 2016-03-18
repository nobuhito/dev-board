// https://api.github.com/users/nobuhito/repos
(function() {

  var obj = {};

  obj.name = "GitHub";
  obj.favicon = "https://assets-cdn.github.com/favicon.ico";
  obj.home = "https://github.com/" + config.plugins[obj.name].user;

  obj.getData = function() {
    return new Promise(function(resolve, reject) {
      var url = "https://api.github.com/users/" + config.plugins[obj.name].user + "/repos?sort=pushed&direction=desc&per_page=100";
      $.ajax({
        url: url,
        dataType: "jsonp",
        jsonpCallback: "github",
        cache: true,
        error: function(data, error) {
          reject(error);
        },
        success: function(data) {
          // console.log(data);
          data = data.data
            .map(function(item) {
              var unixtime_pushed = moment(item.pushed_at, "YYYY-MM-DDTHH:mm:ssZ").unix();
              var unixtime_updated = moment(item.updated_at, "YYYY-MM-DDTHH:mm:ssZ").unix();
              var unixtime = (unixtime_pushed > unixtime_updated)? unixtime_pushed: unixtime_updated;
              item.update_at_dev_board = unixtime;
              item.type_of_dev_board = obj.name;
              return item;
            });
          resolve({type: obj.name, data: data});
        }
      });
    });
  };

  obj.card = function(item, plugins) {
    //console.log(item);
    var title = item.name;
    var card = $("<div>");
    card
      .attr("id", obj.name + "_" + title)
      .addClass("card");

    $("<div>")
      .addClass("cardheader card-block")
      .append(
        $("<h4>")
          .append(
            $("<a>")
              .attr("href", item.html_url)
              .text(item.name)
            )
      )
      .appendTo(card);

    var metas = [
      "<span class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></span>",
      moment.unix(item.update_at_dev_board).fromNow(),
      "<span class=\"fa fa-exclamation\" aria-hidden=\"true\"></span>",
      item.open_issues_count,
      "<span class=\"fa fa-code-fork\" aria-hidden=\"true\"></span>",
      item.forks_count,
      "<span class=\"fa fa-binoculars\" aria-hidden=\"true\"></span>",
      item.watchers_count
    ].join("");

    $("<div>")
      //.addClass("card-block")
      .addClass("metadata")
      .addClass("text-center")
      .addClass("github")
      .addClass("meta")
      .append(
        $("<p>")
          .addClass("card-text")
          .append($("<div>").append(metas))
          .append($("<div>").text(item.language))
      )
      .appendTo(card);

    if (item["photo-caption"]) {
      $("<img>")
        .addClass("thumbnail")
        .attr("src", item["photo-url-400"])
        .appendTo(card);
      image = true;
    }

    if (item.description) {
      $("<div>")
        .addClass("card-block")
        .addClass("description")
        .append(
          $("<p>")
            .addClass("text-muted")
            .addClass("github")
            .addClass("quote")
            .text(item.description)
          )
        .appendTo(card);
    }

    return card;
  };

  obj.dropdown = function() {
    return {
      "update_at_dev_board": "Update time",
      "forks_count": "Forks count",
      "watchers_count": "Watchers count",
      "open_issues": "Open issues count",
      "size": "Size"
    };
  };

  devBoard.push(obj);

})();
