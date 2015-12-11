(function() {
// http://laughingredbird.tumblr.com/api/read/json?num=50

var obj = {};

obj.name = "Tumblr";
obj.favicon = "https://secure.assets.tumblr.com/images/logo_page/img_logo_bluebg_2x.png";
obj.home = "http://" + config.plugins[obj.name].user + ".tumblr.com/";

obj.getData = function() {
  return new Promise(function(resolve, reject) {
    var url = "http://" + config.plugins[obj.name].user + ".tumblr.com/api/read/json?num=50";
    $.ajax({
      url: url,
      dataType: "jsonp",
      jsonpCallback: "tumblr",
      cache: true,
      error: function(data, error) {
        reject(error);
      },
      success: function(data) {
        // console.log(data);
        data = data.posts
          .map(function(item) {
            item.update_at_dev_board = item["unix-timestamp"];
            item.type_of_dev_board = obj.name;
            return item;
          });
        resolve({type: obj.name, data: data});
      }
    });
  });
};

var image_reg = /<img.*src\s?=\s?['"](.+?)["'].*?\/?>/i;
var code_reg = /<pre>([\s\S]*?)<\/pre>/i;
obj.card = function(item) {
  // console.log(item);
  var card = $("<div>");
  card.addClass("card");

  var title = "";
  if (item["quote-source"]) {
    title = item["quote-source"];
  } else if (item["photo-caption"]) {
    var match = item["photo-caption"].match(/(<a.*<\/a>)/);
    if (match) {
      title = match[1];
    }
  }
  $("<div>")
    .addClass("cardheader card-block")
    .append($("<h4>").html(title))
    .appendTo(card);



  var metas = [
    "<span class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></span>",
    moment.unix(item.update_at_dev_board).fromNow()
  ].join("");

  $("<div>")
    //.addClass("card-block")
    .addClass("text-center")
    .addClass("tumblr")
    .addClass("meta")
    .append(
      $("<p>")
        .addClass("card-text")
        .append($("<div>").append(metas))
    )
    .appendTo(card);



  if (item["photo-caption"]) {
    $("<a>")
      .attr("href", item["photo-url-500"])
      .append(
        $("<img>")
          .addClass("thumbnail")
          .attr("src", item["photo-url-500"])
      )
      .appendTo(card);
    image = true;
  }

  if (item["quote-text"]) {
    $("<div>").addClass("card-block").append(
      $("<p>")
      .addClass("text-muted")
      .addClass("tumblr")
      .addClass("quote")
      .html(item["quote-text"])
    ).appendTo(card);
  }

  return card;
};

devBoard.push(obj);
})();
