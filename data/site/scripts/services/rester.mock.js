'use strict';

angular.module('app')
    .service('$rester', ['$window', function ($window) {
        var self = this;

        self.load = function (request) {
            return new Promise(function(resolve, reject) {
                $window.setTimeout(function() {
                    var mockData = {"id":"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik","updated":1439206560989,"items":[{"id":"G9VPRmL8EIDOrR8y/mjTCiDZ33VdAp+8FnCBs61Na2M=_14f176554dd:a5492e:22e462f","keywords":["relationships","communication","complainers","difficult people"],"fingerprint":"d27e94cf","originId":"1722790095","title":"Ask About Positive Outcomes to Cap Off Venting Sessions","published":1439206200000,"crawled":1439206560989,"alternate":[{"href":"http://feeds.gawker.com/~r/lifehacker/vip/~3/ZdZIppQU9Ms/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095","type":"text/html"}],"author":"Heather Yamada-Hosley","canonical":[{"href":"http://lifehacker.com/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095","type":"text/html"}],"origin":{"streamId":"feed/http://feeds.gawker.com/lifehacker/full","title":"Lifehacker","htmlUrl":"http://lifehacker.com"},"summary":{"content":"<p><img data-format=\"jpg\" height=\"357\" data-asset-url=\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\" alt=\"Ask About Positive Outcomes to Cap Off Venting Sessions\" width=\"636\" data-chomp-id=\"1375532394179547569\" src=\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\"></p><p>You want to be helpful and lend an ear whenever a friend needs to vent about a frustrating experience. But complaining too much <a href=\"http://lifehacker.com/291512/stop-yourself-from-complaining#_ga=1.233098142.1002445524.1433370566\">can make everyone focus on the negative</a>. When your friend is winding down, ask them about good things that resulted from the situation to get them thinking positively. <a href=\"http://lifehacker.com/291512/stop-yourself-from-complaining\">http://lifehacker.com/291512/stop-yo...</a></p><p>Make sure you frame your redirection of the chat as a question to give them the chance to think of positive outcomes rather than pointing things out for them. If they can’t come up with anything, <a href=\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426#_ga=1.233098142.1002445524.1433370566\">ask them what they plan to do about the situation</a>. Either way, you’ll have given them the chance to vent <em>and</em> helped them reflect on how to move forward.<a href=\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426\">http://lifehacker.com/handle-complai...</a></p><p><a target=\"_blank\" href=\"https://www.themuse.com/advice/7-perfect-replies-to-politely-shut-down-negative-people\">7 Perfect Replies to (Politely) Shut Down Negative People</a> | The Muse</p><p><em><small>Image from <a target=\"_blank\" href=\"https://secure.flickr.com/photos/lalagerosotrance/20217129325/\">lalagerosotrance</a>.</small></em></p><img height=\"1\" alt=\"\" width=\"1\" src=\"http://feeds.feedburner.com/~r/lifehacker/vip/~4/ZdZIppQU9Ms\">","direction":"ltr"},"visual":{"url":"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg","height":357,"width":636,"expirationDate":1441798568918,"edgeCacheUrl":"http://lh3.googleusercontent.com/0XsIgCYdBIo1K1vxGh9eyktTWFJURYw8vfEufH3D8VyttJ5XC3QXjyuTm3UreB7dprm_i4ByUjUUpN5TFwiCVz9A","processor":"feedly-nikon-v3.1","contentType":"image/jpeg"},"unread":true,"categories":[{"id":"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik","label":"Technik"}],"engagement":4,"engagementRate":0.22,"webfeeds":{"logo":"http://storage.googleapis.com/test-site-assets/6ytp7dDQylcqn9Rm8dj3stV2YoJ6Fxwe2AzgxzVkXlc_ologo-14f043902a0","relatedLayout":"card","relatedTarget":"browser"}}]};
                    resolve({
                        text: JSON.stringify(mockData),
                        json: mockData,
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json;charset=UTF-8'
                        }
                    });
                }, 100);
            });
        };
    }]);