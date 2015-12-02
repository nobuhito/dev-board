// https://api.github.com/users/nobuhito/repos
(function() {

  var execlude = [
    "atom-export-html",
    "gmail-checker",
    "atom-statusbar-datetime",
    "atom-web-search",
    "hubot-typetalk",
    "sw-behavior-editor",
    "comment-dwim-light"
  ];

  var obj = {};

  obj.name = "Atom.io";
  obj.favicon = "https://atom.io/favicon.ico";
  obj.home = "https://atom.io/users/" + config.plugins[obj.name].user;

  obj.modData = function(data) {

    return new Promise(function(resolve, reject) {
      var github;
      for (var i in data) {
        if (data[i].type === "GitHub") {
          github = data[i].data;
          break;
        }
      }

      var urls = [];
      for (var j in github) {
        if (github[j].language === "CoffeeScript") {
          urls.push({name: github[j].name, url: "https://atom.io/api/packages/" + github[j].name, github: github[j]});
          if (github[j].name.match(/^atom\-/)) {
            urls.push({name: github[j].name, url: "https://atom.io/api/packages/" + github[j].name.replace(/^atom-/, ""), github: github[j]});
          }
        }
      }

      Promise
        .all(
          urls
            .filter(function(url) {
              return (execlude.indexOf(url.url.split("/").slice(-1).join("")) === -1);
            })
            .map(function(url) {
              return checkLink(url.name, url.url, url.github);
            })
        )
        .then(function(results) {
          var atomio = [];
          for (var j in results) {
            if (results[j] === undefined) continue;
            atomio.push(results[j]);
          }
          resolve({type: obj.name, data: atomio});
        });
    });
  };

  function checkLink(name, url, github) {
    //console.log(url);
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: url,
        dataType: "json",
        cache: true,
        error: function(data, err) {
          resolve(undefined);
        },
        success: function(data) {
          atom = $.cloneObject(github);
          atom.downloads = data.downloads;
          atom.stargazers_count = data.stargazers_count;
          atom.readme = data.readme;
          atom.metadata = data.metadata;
          atom.atom_url = "https://atom.io/packages/" + url.split("/").slice(-1);
          atom.atom_name = data.name;
          atom.type_of_dev_board = obj.name;
          resolve(atom);
        }
      });
    });
  }

  var image_match = /(https?.*?(?:png|gif|jpeg|jpg))/i;
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
              .attr("href", item.atom_url)
              .text(item.atom_name)
            )
      )
      .appendTo(card);

    var githubMetas = [
      "<span class=\"fa fa-pencil-square-o\" aria-hidden=\"true\"></span>",
      moment(item.update_at_dev_board, "x").fromNow(),
      "<span class=\"fa fa-exclamation\" aria-hidden=\"true\"></span>",
      item.open_issues_count,
      "<span class=\"fa fa-code-fork\" aria-hidden=\"true\"></span>",
      item.forks_count,
      "<span class=\"fa fa-binoculars\" aria-hidden=\"true\"></span>",
      item.watchers_count
    ].join("");

    var atomMetas = [
      "<span class=\"fa fa-download\" aria-hidden=\"true\"></span>",
      item.downloads,
      "<span class=\"fa fa-star-o\" aria-hidden=\"true\"></span>",
      item.stargazers_count
    ].join("");

    var tags = item.metadata.keywords.map(function(tag) {
      return tag.toLowerCase();
    }).join(", ");

    $("<div>")
      //.addClass("card-block")
      .addClass("metadata")
      .addClass("text-center")
      .addClass("github")
      .addClass("meta")
      .append(
        $("<p>")
          .addClass("card-text")
          .append($("<div>").append(githubMetas))
          .append($("<div>").text(item.language))
          .append($("<div>").append(atomMetas))
          .append($("<div>").append(tags))
      )
      .appendTo(card);

    var match = item.readme.match(image_match);
    if (match) {
      var column = $($(".cols")[0]);
      var columnWidth = column.width() - 2;
      $("<img>")
        .addClass("thumbnail")
        .attr("src", match[1])
        .appendTo(card);
    }
    if (item.readme) {
      $("<div>").addClass("card-block").append(
        $("<p>")
        .addClass("text-muted")
        .addClass("github")
        .addClass("quote")
        .text(item.readme.substr(0, 100))
      ).appendTo(card);
    } else if (item.description) {
      $("<div>")
        .addClass("card-block")
        .addClass("description")
        .append(
          $("<p>")
            .addClass("text-muted")
            .addClass("github-quote")
            .text(item.description)
          )
        .appendTo(card);
    }

    return card;
  };

  obj.dropdown = function() {
    return {
      "update_at_dev_board": "Update time",
      "downloads": "Downloads",
      "stargazers_count": "Star count"
    };
  };

  devBoard.push(obj);
})();
(function($){
    $.cloneObject = function(source,isDeep) {
        if(isDeep){
            return $.extend(true,{},source);
        }
        return $.extend({},source);
    };
})(jQuery);
