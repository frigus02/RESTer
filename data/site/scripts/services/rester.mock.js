'use strict';

angular.module('app')
    .service('$rester', ['$timeout', function ($timeout) {
        let self = this;

        self.sendRequest = function (request) {
            return $timeout(function () {
                let mockDataJson = JSON.stringify({"id":"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik","updated":1439206560989,"items":[{"id":"G9VPRmL8EIDOrR8y/mjTCiDZ33VdAp+8FnCBs61Na2M=_14f176554dd:a5492e:22e462f","keywords":["relationships","communication","complainers","difficult people"],"fingerprint":"d27e94cf","originId":"1722790095","title":"Ask About Positive Outcomes to Cap Off Venting Sessions","published":1439206200000,"crawled":1439206560989,"alternate":[{"href":"http://feeds.gawker.com/~r/lifehacker/vip/~3/ZdZIppQU9Ms/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095","type":"text/html"}],"author":"Heather Yamada-Hosley","canonical":[{"href":"http://lifehacker.com/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095","type":"text/html"}],"origin":{"streamId":"feed/http://feeds.gawker.com/lifehacker/full","title":"Lifehacker","htmlUrl":"http://lifehacker.com"},"summary":{"content":"<p><img data-format=\"jpg\" height=\"357\" data-asset-url=\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\" alt=\"Ask About Positive Outcomes to Cap Off Venting Sessions\" width=\"636\" data-chomp-id=\"1375532394179547569\" src=\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\"></p><p>You want to be helpful and lend an ear whenever a friend needs to vent about a frustrating experience. But complaining too much <a href=\"http://lifehacker.com/291512/stop-yourself-from-complaining#_ga=1.233098142.1002445524.1433370566\">can make everyone focus on the negative</a>. When your friend is winding down, ask them about good things that resulted from the situation to get them thinking positively. <a href=\"http://lifehacker.com/291512/stop-yourself-from-complaining\">http://lifehacker.com/291512/stop-yo...</a></p><p>Make sure you frame your redirection of the chat as a question to give them the chance to think of positive outcomes rather than pointing things out for them. If they can’t come up with anything, <a href=\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426#_ga=1.233098142.1002445524.1433370566\">ask them what they plan to do about the situation</a>. Either way, you’ll have given them the chance to vent <em>and</em> helped them reflect on how to move forward.<a href=\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426\">http://lifehacker.com/handle-complai...</a></p><p><a target=\"_blank\" href=\"https://www.themuse.com/advice/7-perfect-replies-to-politely-shut-down-negative-people\">7 Perfect Replies to (Politely) Shut Down Negative People</a> | The Muse</p><p><em><small>Image from <a target=\"_blank\" href=\"https://secure.flickr.com/photos/lalagerosotrance/20217129325/\">lalagerosotrance</a>.</small></em></p><img height=\"1\" alt=\"\" width=\"1\" src=\"http://feeds.feedburner.com/~r/lifehacker/vip/~4/ZdZIppQU9Ms\">","direction":"ltr"},"visual":{"url":"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg","height":357,"width":636,"expirationDate":1441798568918,"edgeCacheUrl":"http://lh3.googleusercontent.com/0XsIgCYdBIo1K1vxGh9eyktTWFJURYw8vfEufH3D8VyttJ5XC3QXjyuTm3UreB7dprm_i4ByUjUUpN5TFwiCVz9A","processor":"feedly-nikon-v3.1","contentType":"image/jpeg"},"unread":true,"categories":[{"id":"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik","label":"Technik"}],"engagement":4,"engagementRate":0.22,"webfeeds":{"logo":"http://storage.googleapis.com/test-site-assets/6ytp7dDQylcqn9Rm8dj3stV2YoJ6Fxwe2AzgxzVkXlc_ologo-14f043902a0","relatedLayout":"card","relatedTarget":"browser"}}]}),
                    mockDataXml = "<!DOCTYPE html>\n<html>\n    <head>\n        <meta charset=\"UTF-8\">\n        <meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1\">\n        <title>Jan K&uuml;hle</title>\n\n        <script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js\"></script>\n        <script>\n            var WebFontConfig = {\n                google: { families: [ 'Pontano+Sans::latin' ] },\n                active: function() { $(document).trigger('fontloaded'); },\n                inactive: function() { $(document).trigger('fontloaded'); }\n            };\n        </script>\n        <script src=\"//ajax.googleapis.com/ajax/libs/webfont/1/webfont.js\" async></script>\n        <script>var _gaq=_gaq||[];_gaq.push([\"_setAccount\",\"UA-37982541-1\"]);_gaq.push([\"_trackPageview\"]);(function(){var e=document.createElement(\"script\");e.type=\"text/javascript\";e.async=true;e.src=(\"https:\"==document.location.protocol?\"https://ssl\":\"http://www\")+\".google-analytics.com/ga.js\";var t=document.getElementsByTagName(\"script\")[0];t.parentNode.insertBefore(e,t)})();</script>\n        \n\n        <link rel=\"stylesheet\" href=\"/static/css/base.css\" media=\"screen,handheld\">\n        <link rel=\"stylesheet\" href=\"/static/css/mobile.css\" media=\"only screen and (min-width:320px)\">\n        <link rel=\"stylesheet\" href=\"/static/css/desktop.css\" media=\"only screen and (min-width:600px)\">\n        \n\n        <link rel=\"alternate\" href=\"/feeds/posts\" title=\"Blog\" type=\"application/atom+xml\">\n    </head>\n    <body>\n        <header>\n                <h1><a href=\"/\">Jan K&uuml;hle</a></h1>\n        </header>\n            \n\n        \n    <div id=\"about\">\n        <img class=\"me\" src=\"/static/img/me.jpg\" alt=\"me\">\n\n        <div class=\"about\">\n            <p>Hi, this is me.</p>\n            <p>I'm a passionate software developer with interests in Web, Android and SharePoint.</p>\n        </div>\n\n        <div class=\"more\">\n            <p>Check out my projects and posts about things I come across while hacking on the projects:</p>\n            \n            <nav>\n                <a class=\"button\" href=\"/projects/\">Projects</a>\n                <a class=\"button\" href=\"/posts/\">Blog</a>\n            </nav>\n        </div>\n    </div>\n\n        \n        <aside id=\"social\">\n            <a href=\"https://plus.google.com/+JanKühle/about\"><img src=\"/static/img/google-plus.png\" alt=\"Google+\"></a>\n            <a href=\"https://www.facebook.com/jkuehle90\"><img src=\"/static/img/facebook.png\" alt=\"Facebook\"></a>\n            <a href=\"https://www.xing.com/profile/Jan_Kuehle2\"><img src=\"/static/img/xing.png\" alt=\"XING\"></a>\n        </aside>\n        \n        <footer>\n            <ul>\n                <li><a href=\"/contact\">Contact me</a></li>\n                <li><a href=\"/impress\">Impress</a></li>\n            </ul>\n        </footer>\n    </body>\n</html>",
                    mockData;

                if (request.headers['Content-Type'] && request.headers['Content-Type'].toLowerCase() === 'application/xml') {
                    mockData = mockDataXml;
                } else {
                    mockData = mockDataJson;
                }

                return {
                    status: 200,
                    statusText: 'OK',
                    headers: [
                        { name: 'x-ratelimit-count', value: '111560435' },
                        { name: 'X-Firefox-Spdy', value: '3.1' },
                        { name: 'x-feedly-server', value: 'ap2-sv2' },
                        { name: 'x-feedly-processing-time', value: '7' },
                        { name: 'Vary', value: 'Accept-Encoding' },
                        { name: 'Server', value: 'cloudflare-nginx' },
                        { name: 'Pragma', value: 'no-cache' },
                        { name: 'Last-Modified', value: 'Tue Aug 11 05:17:18 PDT 2015' },
                        { name: 'Date', value: 'Tue, 11 Aug 2015 12:17:18 GMT' },
                        { name: 'Content-Type', value: 'application/json;charset=UTF-8' },
                        { name: 'Content-Encoding', value: 'gzip' },
                        { name: 'CF-RAY', value: '2143e066350226d2-FRA' },
                        { name: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0 ' }
                    ],
                    body: mockData
                };
            }, 500);
        };

        self.sendBrowserRequest = function () {
            return $timeout(function () {
                return {
                    url: 'https://google.com?access_token=abc'
                };
            }, 2000);
        };
    }]);
