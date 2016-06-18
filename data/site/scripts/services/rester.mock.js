'use strict';

angular.module('app')
    .decorator('$rester', ['$delegate', '$timeout', '$window', function ($delegate, $timeout, $window) {

        // Only use mock implementations, when we are running on localhost, because
        // this means the extension is not installed and we are just testing the
        // website.
        if ($window.location.hostname !== '127.0.0.1' && $window.location.hostname !== 'localhost') {
            return $delegate;
        }

        $delegate.getInfo = function () {
            return $timeout(function () {
                return {
                    version: 'local'
                };
            }, 100);
        };

        $delegate.sendRequest = function (request) {
            const timeStart = new Date();
            return $timeout(function () {
                let mockDataJson = "{\"id\":\"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik\",\"updated\":1439206560989,\"items\":[{\"id\":\"G9VPRmL8EIDOrR8y/mjTCiDZ33VdAp+8FnCBs61Na2M=_14f176554dd:a5492e:22e462f\",\"keywords\":[\"relationships\",\"communication\",\"complainers\",\"difficult people\"],\"fingerprint\":\"d27e94cf\",\"originId\":\"1722790095\",\"title\":\"Ask About Positive Outcomes to Cap Off Venting Sessions\",\"published\":1439206200000,\"crawled\":1439206560989,\"alternate\":[{\"href\":\"http://feeds.gawker.com/~r/lifehacker/vip/~3/ZdZIppQU9Ms/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095\",\"type\":\"text/html\"}],\"author\":\"Heather Yamada-Hosley\",\"canonical\":[{\"href\":\"http://lifehacker.com/ask-about-positive-outcomes-to-cap-off-venting-sessions-1722790095\",\"type\":\"text/html\"}],\"origin\":{\"streamId\":\"feed/http://feeds.gawker.com/lifehacker/full\",\"title\":\"Lifehacker\",\"htmlUrl\":\"http://lifehacker.com\"},\"summary\":{\"content\":\"<p><img data-format=\\\"jpg\\\" height=\\\"357\\\" data-asset-url=\\\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\\\" alt=\\\"Ask About Positive Outcomes to Cap Off Venting Sessions\\\" width=\\\"636\\\" data-chomp-id=\\\"1375532394179547569\\\" src=\\\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\\\"></p><p>You want to be helpful and lend an ear whenever a friend needs to vent about a frustrating experience. But complaining too much <a href=\\\"http://lifehacker.com/291512/stop-yourself-from-complaining#_ga=1.233098142.1002445524.1433370566\\\">can make everyone focus on the negative</a>. When your friend is winding down, ask them about good things that resulted from the situation to get them thinking positively. <a href=\\\"http://lifehacker.com/291512/stop-yourself-from-complaining\\\">http://lifehacker.com/291512/stop-yo...</a></p><p>Make sure you frame your redirection of the chat as a question to give them the chance to think of positive outcomes rather than pointing things out for them. If they can’t come up with anything, <a href=\\\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426#_ga=1.233098142.1002445524.1433370566\\\">ask them what they plan to do about the situation</a>. Either way, you’ll have given them the chance to vent <em>and</em> helped them reflect on how to move forward.<a href=\\\"http://lifehacker.com/handle-complainers-by-asking-them-how-they-intend-to-fi-1651470426\\\">http://lifehacker.com/handle-complai...</a></p><p><a target=\\\"_blank\\\" href=\\\"https://www.themuse.com/advice/7-perfect-replies-to-politely-shut-down-negative-people\\\">7 Perfect Replies to (Politely) Shut Down Negative People</a> | The Muse</p><p><em><small>Image from <a target=\\\"_blank\\\" href=\\\"https://secure.flickr.com/photos/lalagerosotrance/20217129325/\\\">lalagerosotrance</a>.</small></em></p><img height=\\\"1\\\" alt=\\\"\\\" width=\\\"1\\\" src=\\\"http://feeds.feedburner.com/~r/lifehacker/vip/~4/ZdZIppQU9Ms\\\">\",\"direction\":\"ltr\"},\"visual\":{\"url\":\"http://i.kinja-img.com/gawker-media/image/upload/s--4emBj4EF--/1375532394179547569.jpg\",\"height\":357,\"width\":636,\"expirationDate\":1441798568918,\"edgeCacheUrl\":\"http://lh3.googleusercontent.com/0XsIgCYdBIo1K1vxGh9eyktTWFJURYw8vfEufH3D8VyttJ5XC3QXjyuTm3UreB7dprm_i4ByUjUUpN5TFwiCVz9A\",\"processor\":\"feedly-nikon-v3.1\",\"contentType\":\"image/jpeg\"},\"unread\":true,\"categories\":[{\"id\":\"user/776a7a0a-bccd-4abe-bc2e-0d716ae6d63d/category/Technik\",\"label\":\"Technik\"}],\"engagement\":4,\"engagementRate\":0.22,\"webfeeds\":{\"logo\":\"http://storage.googleapis.com/test-site-assets/6ytp7dDQylcqn9Rm8dj3stV2YoJ6Fxwe2AzgxzVkXlc_ologo-14f043902a0\",\"relatedLayout\":\"card\",\"relatedTarget\":\"browser\"}}]}",
                    mockDataXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><anagrafica><testata><nomemercato id=\"007\">Mercato di test</nomemercato><data>Giovedi 18 dicembre 2003 16.05.29</data></testata><record><codice_cliente>5</codice_cliente><rag_soc>Miami American Cafe</rag_soc><codice_fiscale>IT07654930130</codice_fiscale><indirizzo tipo=\"casa\">Viale Carlo Espinasse 5, Como</indirizzo><num_prodotti>13</num_prodotti></record><record><codice_cliente>302</codice_cliente><rag_soc>Filiberto Gilardi</rag_soc><codice_fiscale>IT87654770157</codice_fiscale><indirizzo tipo=\"ufficio\">Via Biancospini 20, Messina</indirizzo><num_prodotti>8</num_prodotti></record><record><codice_cliente>1302</codice_cliente><rag_soc>Eidon</rag_soc><codice_fiscale>IT887511231</codice_fiscale><indirizzo tipo=\"ufficio\">Via Bassini 17/2, Milano</indirizzo><num_prodotti>18</num_prodotti></record><record><codice_cliente>202</codice_cliente><rag_soc>SkillNet</rag_soc><codice_fiscale>IT887642131</codice_fiscale><indirizzo tipo=\"ufficio\">Via Chiasserini 11A, Milano</indirizzo><num_prodotti>24</num_prodotti></record><record><codice_cliente>12</codice_cliente><rag_soc>Eidon</rag_soc><codice_fiscale>IT04835710965</codice_fiscale><indirizzo tipo=\"casa\">Via Cignoli 17/2, Roma</indirizzo><num_prodotti>1112</num_prodotti></record><record><codice_cliente>5</codice_cliente><rag_soc>Miami American Cafe</rag_soc><codice_fiscale>IT07654930130</codice_fiscale><indirizzo tipo=\"casa\">Viale Carlo Espinasse 5, Como</indirizzo><num_prodotti>13</num_prodotti></record><record><codice_cliente>302</codice_cliente><rag_soc>Filiberto Gilardi</rag_soc><codice_fiscale>IT87654770157</codice_fiscale><indirizzo tipo=\"ufficio\">Via Biancospini 20, Messina</indirizzo><num_prodotti>8</num_prodotti></record><record><codice_cliente>1302</codice_cliente><rag_soc>Eidon</rag_soc><codice_fiscale>IT887511231</codice_fiscale><indirizzo tipo=\"ufficio\">Via Bassini 17/2, Milano</indirizzo><num_prodotti>18</num_prodotti></record><record><codice_cliente>202</codice_cliente><rag_soc>SkillNet</rag_soc><codice_fiscale>IT887642131</codice_fiscale><indirizzo tipo=\"ufficio\">Via Chiasserini 11A, Milano</indirizzo><num_prodotti>24</num_prodotti></record><record><codice_cliente>202</codice_cliente><rag_soc>SkillNet</rag_soc><codice_fiscale>IT887642131</codice_fiscale><indirizzo tipo=\"ufficio\">Via Chiasserini 11A, Milano</indirizzo><num_prodotti>24</num_prodotti></record><record><codice_cliente>12</codice_cliente><rag_soc>Eidon</rag_soc><codice_fiscale>IT04835710965</codice_fiscale><indirizzo tipo=\"casa\">Via Cignoli 17/2, Roma</indirizzo><num_prodotti>1112</num_prodotti></record></anagrafica>",
                    mockDataHtml = '<h1>Test</h1>\n\n<p>Lorem ipsum dolor sit amet, <em>consetetur sadipscing</em> elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur <strong>sadipscing</strong> elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna <span class="blue">aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum</span> dolor sit amet.</p>\n\n<img src="http://lorempixel.com/400/200/" alt="Lorempixel">\n\n<p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>\n\n<h2>Links</h2>\n<ul>\n    <li><a href="http://example.com">Example</a></li>\n</ul>\n\n<style type="text/css">.blue{color:blue;}</style>',
                    mockDataText = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
                    mockData,
                    acceptHeader = request.headers.find(h => h.name === 'Accept'),
                    errorHeader = request.headers.find(h => h.name === 'X-Error'),
                    contentType;

                if (errorHeader) {
                    throw new Error('Error');
                } else if (acceptHeader) {
                    if (acceptHeader.value.toLowerCase() === 'application/xml' || acceptHeader.value.toLowerCase() === 'text/xml') {
                        contentType = acceptHeader.value.toLowerCase();
                        mockData = mockDataXml;
                    } else if (acceptHeader.value.toLowerCase() === 'application/json') {
                        contentType = 'application/json';
                        mockData = mockDataJson;
                    } else if (acceptHeader.value.toLowerCase() === 'text/html') {
                        contentType = 'text/html';
                        mockData = mockDataHtml;
                    }
                } else {
                    contentType = 'text/plain';
                    mockData = mockDataText;
                }

                return {
                    status: 200,
                    statusText: 'OK',
                    headers: [
                        { name: 'Vary', value: 'Accept-Encoding' },
                        { name: 'Server', value: 'cloudflare-nginx' },
                        { name: 'Pragma', value: 'no-cache' },
                        { name: 'Last-Modified', value: 'Tue Aug 11 05:17:18 PDT 2015' },
                        { name: 'Date', value: 'Tue, 11 Aug 2015 12:17:18 GMT' },
                        { name: 'Content-Type', value: contentType },
                        { name: 'Content-Encoding', value: 'gzip' },
                        { name: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0 ' }
                    ],
                    body: mockData,
                    timeStart: timeStart,
                    timeEnd: new Date()
                };
            }, 500);
        };

        $delegate.sendBrowserRequest = function () {
            return $timeout(function () {
                return {
                    url: 'https://google.com?access_token=abc&token_type=Bearer'
                };
            }, 1000);
        };

        return $delegate;

    }]);
