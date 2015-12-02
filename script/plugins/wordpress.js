(function() {
  var obj = {};
  obj.name = "Wordpress";
  obj.favicon = "https://s1.wp.com/i/favicons/favicon-64x64.png";
  obj.getData = function() {
    return new Promise(function(resolve, reject) {
      var url = "https://public-api.wordpress.com/rest/v1.1/sites/" + config.plugins.Wordpress.user + ".wordpress.com/posts/";
      $.ajax({
        url: url,
        dataType: "json",
        cache: true,
        error: function(data, error) {
          reject(error);
        },
        success: function(data) {
          data = data.posts
            .map(function(item) {
              console.log(item.modified);
              item.update_at_dev_board = moment(item.modified, "YYYY-MM-DDTHH:mm:ssZ").format("x");
              item.type_of_dev_board = obj.name;
              item.comment_count = item.discussion.comment_count || 0;
              return item;
            });
          resolve({type: obj.name, data: data});
        }
      });
    });
  };

  var image_reg = /<img.*src\s?=\s?['"](.+?)["'].*?\/?>/i;
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
      moment(item.update_at_dev_board, "x").fromNow(),
      "<span class=\"fa fa-comment-o\" aria-hidden=\"true\"></span>",
      item.comment_count,
      "<span class=\"fa fa-heart-o\" aria-hidden=\"true\"></span>",
      item.like_count
    ].join("");

    var tags = [];
    for (var i in item.tags) {
      tags.push(i);
    }
    tags = tags.join(", ");

    $("<div>")
      //.addClass("card-block")
      .addClass("text-center")
      .addClass("meta")
      .addClass("wordpress")
      .append(
        $("<p>")
          .addClass("card-text")
          .append($("<div>").append(metas))
          .append($("<div>").append(tags))
      )
      .appendTo(card);


    var image_match = item.content.match(image_reg);
    var image = false;
    if (image_match) {
      $("<img>")
        .addClass("thumbnail")
        .attr("src", unescapeHTML(image_match[1]))
        .appendTo(card);
      image = true;
    }

    $("<div>").addClass("card-block").append(
      $("<p>")
      .addClass("text-muted")
      .addClass("quote")
      .addClass("wordpress")
      .html(item.excerpt)
    ).appendTo(card);

    return card;
  };

  obj.dropdown = function() {
    return {
      "update_at_update_at_dev_board": "Update time",
      "like_count": "Like count",
      "comment_count": "Comment count"
    };
  };

devBoard.push(obj);
})();
