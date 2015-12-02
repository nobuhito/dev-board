# Dev:BOARD

Dev:BOARD はカスタマイズ可能なデベロッパー向けのホワイトボードです。

Dev:BOARD is customizable board for developer.

![screenshot](https://raw.github.com/nobuhito/dev-board/gh-pages/screenshot.png)

## Description

`Dev:BOARD` はデベロッパー向けのカスタマイズ可能なホワイトボードです。

Tumblrにポストした気になるもの、Qiitaにポストしたプログラミング知識、GitHubにプッシュしたソースコードをピンタレストのようなUIで一覧表示できます。

現時点で用意されているプラグインは4つのサービスですが、API経由でデータを取得できるサービスであれば用意に追加できます(GitHub経由で公開する場合は認証情報が丸見えになりますので、認証無しで取得できるサービスのみで利用してください)。

 - GitHub
 - Tumblr
 - Qiita
 - Atom.io

「GitHubでForkして利用する」「標準で用意しているプラグインがデベロッパー寄り」ということでデベロッパー向けとしていますが、GitHub以外のWebサーバーでも動きますしプラグインを追加することで他の用途にも利用できます。


## Feature

 - Tumblrにポストした気になるもの、Qiitaにポストしたプログラミング知識、GitHubにプッシュしたソースコードを一覧表示
 - 各アイテムは画像やコードの断片、その他のメタ情報を含んだカード型で表示
 - 各サービスごとにいろいろな角度からソートして抽出表示
 - 画面サイズに合わせたカラム数でレスポンシブに表示
 - 簡単に作れるプラグインでカスタマイズが可能
 - ほぼ全ての動きがJavascriptなのでサーバー環境を問わずにデプロイ可能

## Requirement

 - GitHubアカウント
 - Tumblrアカウント(オプション)
 - Qiitaアカウント(オプション)

## Install

  1. Dev:BOARDをGitHubでFork


  1. Fork it

## Usage

  1. 各プラグインの `name` を書き換え
  1. Webブラウザで `http://#{GitHubアカウント}.github.io/dev-board/` を開く


  1. Edit name for plugins.
  1. Open `http://#{GitHub account}.github.io/dev-board/` of browser.

## TODO

## Bugs

[Issues](https://github.com/nobuhito/dev-board/issues/new) に登録してください。

## Contribution

  1. Fork it ( http://github.com/nobuhito/dev-board/fork )
  2. Create your feature branch (git checkout -b my-new-feature)
  3. Commit your changes (git commit -am 'Add some feature')
  4. Push to the branch (git push origin my-new-feature)
  5. Create new Pull Request

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

Nobuhito SATO  [Dev:BOARD](http://nobuhito.github.io/dev-board/) [Gmail](nobuhito.sato@gmail.com)
