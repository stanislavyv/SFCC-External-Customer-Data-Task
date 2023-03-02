"use strict";

const externalDataService = require("~/cartridge/scripts/services/externalDataService.js");

/**
 * Calls externalData service with a get request
 * @param {String} endpoint
 * @returns {Object} api response
 */
function get(endpoint) {
    const requestObject = {
        requestMethod: "GET",
        endpoint,
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
    const requestObject = {
        requestMethod: "POST",
        endpoint,
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
    const requestObject = {
        requestMethod: "PUT",
        endpoint,
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
    const requestObject = {
        requestMethod: "PATCH",
        endpoint,
        requestBody: body,
    };

    return externalDataService.call(requestObject);
}

module.exports = {
    get,
    post,
    put,
    patch,
};
