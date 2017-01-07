const webExtension = require("sdk/webextension");

webExtension.startup().then(api => {
    const {browser} = api;

    // In WebExtension
    /*browser.runtime.sendMessage("message-from-webextension").then(reply => {
        if (reply) {
            console.log("response from legacy add-on: " + reply.content);
        }
    });*/

    browser.runtime.onMessage.addListener((msg, sender, sendReply) => {
        if (msg === 'message-from-webextension') {
            sendReply({
                content: 'reply from legacy add-on'
            });
        }
    });
});
