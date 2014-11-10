;(function (win, doc, $, undefined)
{
  'use strict';

  var HackerNews = new siesta.Collection('HackerNews');

  HackerNews.baseURL = 'https://hacker-news.firebaseio.com/v0/';

  var Item = HackerNews.mapping('Item', {

    id: 'id'

  , attributes: [
      'score'
    , 'time'
    , 'title'
    , 'type'
    , 'url'
    ]

  , relationships: {
    //   by: {
    //     mapping: 'User'
    //   , type: 'OneToMany'
    //   , reverse: 'submitted'
    //   }
    // , kids: {
    //     mapping: 'Item'
    //   , type: 'OneToMany'
    //   , reverse: 'submitted'
    //   }
    }
  });

  HackerNews.descriptor({
    path: 'item/*'
  , method: 'GET'
  , mapping: Item
  , data: 'data'
  });

  HackerNews.install();

  HackerNews.GET('item/8582985.json', function (err, item)
  {
    console.log('I got me a item!', err);
  });

}(window, document, jQuery));
