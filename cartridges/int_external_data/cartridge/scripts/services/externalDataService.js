"use strict";

const SERVICE_NAME = "http.externalData";
const PASSWORD_PATTERN = /"password"\s?[=:]\s?".*"/gm;

const LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

const mockSuccessResponse = {
    statusCode: 200,
    statusMessage: "Success",
    ok: true,
};

const mockErrorResponse = {
    statusCode: 400,
    statusMessage: "Error",
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
            response.errorMessage = "Please provide a body";
        } else {
            response = mockSuccessResponse;

            switch (svc.requestMethod) {
                case "POST":
                    response.statusCode = 201;
                    response.statusMessage = "Created";
                    break;
                case "PUT":
                case "PATCH":
                    response.statusCode = 204;
                    response.statusMessage = "Resource updated successfully";
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
        return msg.replace(PASSWORD_PATTERN, `"password":**********`);
    },
});

module.exports = externalDataService;
