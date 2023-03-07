"use strict";

const externalDataService = require("~/cartridge/scripts/services/externalDataService.js");

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

    return externalDataService.call(requestObject);
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

    return externalDataService.call(requestObject);
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

    return externalDataService.call(requestObject);
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

    return externalDataService.call(requestObject);
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

    return externalDataService.call(requestObject);
}

module.exports = {
    get,
    post,
    put,
    patch,
    remove,
};
