;(function (win, doc, $, undefined)
{
  'use strict';

  var HackerNews = new siesta.Collection('HackerNews');

  HackerNews.baseURL = 'https://hacker-news.firebaseio.com/v0/';

  // HackerNews.mapping('Stories', {
  //
  // });

  HackerNews.mapping('Item', {

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
    // , kids: {
    //     mapping: 'Item'
    //   , type: 'ManyToOne'
    //   , reverse: 'parent'
    //   }
    }
  });

  HackerNews.descriptor({
    path: 'item/*'
  , method: 'GET'
  , mapping: 'Item'
  });

  HackerNews.install(function ()
  {
    HackerNews.GET('/topstories.json', function (err, stories)
    {
      console.log('stories', stories);
    });

    // HackerNews.GET('item/8582985.json', function (err, item)
    // {
    //   console.log('item', item);
    // });
  });

}(window, document, jQuery));
