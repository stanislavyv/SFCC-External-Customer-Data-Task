"use strict";
const serviceMessages = require("~/cartridge/contstants/serviceMessages");

const SERVICE_NAME = "http.externalData";

const PASSWORD_PATTERN = /"password"\s?[=:]\s?".*"/gm;
const PASSWORD_REPLACE_TEXT = `"password":**********`;

const LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

const mockSuccessResponse = {
    statusCode: 200,
    statusMessage: serviceMessages.STATUS_MESSAGE_SUCCESS,
    ok: true,
};

const mockErrorResponse = {
    statusCode: 400,
    statusMessage: serviceMessages.STATUS_MESSAGE_ERROR,
    ok: false,
};

const externalDataService = LocalServiceRegistry.createService(SERVICE_NAME, {
    createRequest(svc, args) {
        svc.addHeader("Content-Type", "application/json");
        svc.setRequestMethod(args.requestMethod);
        svc.setURL(svc.getURL() + args.endpoint);

        const requestBody = args.requestBody
            ? JSON.stringify(args.requestBody)
            : null;

        return requestBody;
    },
    mockCall(svc, inputBody) {
        let response = {};
        const body = JSON.parse(inputBody);

        if (
            (svc.requestMethod !== "GET" || svc.requestMethod !== "DELETE") &&
            !body
        ) {
            response = mockErrorResponse;
            response.errorMessage = serviceMessages.ERROR_MESSAGE_BODY;
        } else {
            response = mockSuccessResponse;

            switch (svc.requestMethod) {
                case "POST":
                    response.statusCode = 201;
                    response.statusMessage =
                        serviceMessages.STATUS_MESSAGE_CREATED;
                    break;
                case "PUT":
                case "PATCH":
                    response.statusCode = 204;
                    response.statusMessage =
                        serviceMessages.STATUS_MESSAGE_UPDATED;
                    break;
                default:
                    break;
            }
        }

        return response;
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
    filterLogMessage(msg) {
        return msg.replace(PASSWORD_PATTERN, PASSWORD_REPLACE_TEXT);
    },
});

module.exports = externalDataService;
