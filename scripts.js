;(function (win, doc, $, undefined)
{
  'use strict';

  var HackerNews = new siesta.Collection('HackerNews');

  HackerNews.baseURL = 'https://hacker-news.firebaseio.com/v0/';

  // HackerNews.mapping('Stories', {
  //
  // });

  HackerNews.mapping('Item', {

    // id: 'id'

    attributes: [
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
      kids: {
        mapping: 'Item'
      , type: 'OneToMany'
      , reverse: 'parent'
      }
    }
  });

  HackerNews.descriptor({
    path: '(item/*|topstores.json)'
  , method: 'GET'
  , mapping: 'Item'
  });

  HackerNews.install(function ()
  {
    // HackerNews.GET('/topstories.json', function (err, stories)
    // {
    //   console.log('stories', stories);
    // });

    HackerNews.GET('item/8582985.json', function (err, item)
    {
      console.log('err', err);
      console.log('item', item);
    });
  });

}(window, document, jQuery));
