"use strict";

const proxyquire = require("proxyquire").noCallThru().noPreserveCache();

const serviceMessages = {
    STATUS_MESSAGE_SUCCESS: "Success",
    STATUS_MESSAGE_ERROR: "Error",
    STATUS_MESSAGE_CREATED: "Created",
    STATUS_MESSAGE_DELETED: "Deleted",
    STATUS_MESSAGE_UPDATED: "Resource updated successfully",
    ERROR_MESSAGE_BODY: "Please provide a body",
};

const LocalServiceRegistry = require("../dw/svc/LocalServiceRegistry");
const externalDataService = proxyquire(
    "../../../cartridges/int_external_data/cartridge/scripts/services/externalDataService.js",
    {
        "dw/svc/LocalServiceRegistry": LocalServiceRegistry,
        "~/cartridge/contstants/serviceMessages": serviceMessages,
    }
);

/**
 * Appends .json to endoint to satisfy firebase syntax
 * @param {String} endpoint
 * @returns {String}
 */
function modifyEndpoint(endpoint) {
    return endpoint + ".json";
}

/**
 * Calls externalData service with a get request
 * @param {String} endpoint
 * @returns {Object} api response
 */
function get(endpoint) {
    const modifiedEndpoint = modifyEndpoint(endpoint);

    const requestObject = {
        requestMethod: "GET",
        endpoint: modifiedEndpoint,
    };

    return externalDataService.setMock().call(requestObject);
}

/**
 * Calls externalData service with a post request
 * @param {String} endpoint
 * @param {Object} body
 * @returns {Object} api response
 */
function post(endpoint, body) {
    const modifiedEndpoint = modifyEndpoint(endpoint);

    const requestObject = {
        requestMethod: "POST",
        endpoint: modifiedEndpoint,
        requestBody: body,
    };

    return externalDataService.setMock().call(requestObject);
}

/**
 * Calls externalData service with a put request
 * @param {String} endpoint
 * @param {Object} body
 * @returns {Object} api response
 */
function put(endpoint, body) {
    const modifiedEndpoint = modifyEndpoint(endpoint);

    const requestObject = {
        requestMethod: "PUT",
        endpoint: modifiedEndpoint,
        requestBody: body,
    };

    return externalDataService.setMock().call(requestObject);
}

/**
 * Calls externalData service with a patch request
 * @param {String} endpoint
 * @param {Object} body
 * @returns {Object} api response
 */
function patch(endpoint, body) {
    const modifiedEndpoint = modifyEndpoint(endpoint);

    const requestObject = {
        requestMethod: "PATCH",
        endpoint: modifiedEndpoint,
        requestBody: body,
    };

    return externalDataService.setMock().call(requestObject);
}

/**
 * Calls externalData service with a delete request
 * @param {String} endpoint
 * @returns {Object} api response
 */
function remove(endpoint) {
    const modifiedEndpoint = modifyEndpoint(endpoint);

    const requestObject = {
        requestMethod: "DELETE",
        endpoint: modifiedEndpoint,
    };

    return externalDataService.setMock().call(requestObject);
}

module.exports = {
    get,
    post,
    put,
    patch,
    remove,
};
