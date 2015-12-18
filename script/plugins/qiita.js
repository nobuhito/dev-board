(function() {

  var obj = {};

  obj.name = "Qiita";
  obj.favicon = "http://qiita.com/icons/favicons/public/apple-touch-icon.png";
  obj.home = "http://qiita.com/" + config.plugins[obj.name].user;

  obj.getData = function() {
    return new Promise(function(resolve, reject) {
      var url = "https://qiita.com/api/v1/users/" + config.plugins[obj.name].user + "/items?per_page=100";
      $.ajax({
        url: url,
        dataType: "json",
        cache: true,
        error: function(data, error) {
          reject(error);
        },
        success: function(data) {
          data = data
            .map(function(item) {
              unixtime = moment(item.updated_at, "YYYY-MM-DD HH:mm:ss ZZ").unix();
              item.update_at_dev_board = unixtime;
              item.type_of_dev_board = obj.name;
              return item;
            });
          resolve({type: obj.name, data: data});
        }
      });
    });
  };

  var image_reg = /<img.*src\s?=\s?['"](http.+?)["'].*?\/?>/i;
  var code_reg = /<pre>([\s\S]*?)<\/pre>/i;
  obj.card = function(item) {
    // console.log(item);
    var card = $("<div>");
    card.addClass("card");

    $("<div>")
      .addClass("cardheader card-block")
      .append(
        $("<h4>")
          .append(
            $("<a>")
              .addClass("headertitle")
              .attr("href", item.url)
              .text(item.title)
          )
      ).appendTo(card);

    var metas = [
      "<span class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></span>",
      moment.unix(item.update_at_dev_board).fromNow(),
      "<span class=\"fa fa-comment-o\" aria-hidden=\"true\"></span>",
      item.comment_count,
      "<span class=\"fa fa-shopping-basket\" aria-hidden=\"true\"></span>",
      item.stock_count
    ].join("");

    var tags = item.tags.map(function(tag) {
      return tag.name.toLowerCase();
    }).join(", ");

    $("<div>")
      //.addClass("card-block")
      .addClass("text-center")
      .addClass("qiita")
      .addClass("meta")
      .append(
        $("<p>")
          .addClass("card-text")
          .append($("<div>").append(metas))
          .append($("<div>").append(tags))
      )
      .appendTo(card);


    var image_match = item.body.match(image_reg);
    var image = false;
    if (image_match) {
      $("<img>")
        .addClass("thumbnail")
        .attr("src", unescapeHTML(image_match[1]))
        .appendTo(card);
      image = true;
    }

    if (image === false) {
      var code_match = item.body.match(code_reg);
      if (code_match) {
        $("<div>")
          .addClass("highlight")
          .append(
            $("<pre>")
              .addClass("thumbcode")
              .html(code_match[1])
          )
          .appendTo(card);
      }
    }

    $("<div>").addClass("card-block").append(
      $("<p>")
      .addClass("text-muted")
      .addClass("qiita")
      .addClass("quote")
      .text(item.raw_body.replace(/\!?\[(.+?)\]\(.+?\)/g, "$1").substr(0, 100))
    ).appendTo(card);

    return card;
  };

  obj.dropdown = function() {
    return {
      "update_at_dev_board": "Update time",
      "comment_count": "Comment count",
      "stock_count": "Stock count"
    };
  };

  devBoard.push(obj);
})();
