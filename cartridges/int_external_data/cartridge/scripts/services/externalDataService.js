"use strict";

const SERVICE_NAME = "http.externalData";

const LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

const externalDataService = LocalServiceRegistry.createService(SERVICE_NAME, {
    createRequest(svc, args) {
        svc.addHeader("Content-Type", "application/json");
        svc.setRequestMethod(args.requestMethod);
        svc.setUrl(svc.getUrl() + args.endpoint);

        const requestBody = args.requestBody
            ? JSON.stringify(args.requestBody)
            : null;
        return requestBody;
    },
    parseResponse(svc, client) {
        let result;

        try {
            result = JSON.parse(client.text);
        } catch (e) {
            result = client.text;
        }

        return result;
    },
    // filterLogMessage(msg) {
    //     return msg.replace(PHONE_NUMBERS_PATTERN, "To=**********");
    // },
});

module.exports = externalDataService;
