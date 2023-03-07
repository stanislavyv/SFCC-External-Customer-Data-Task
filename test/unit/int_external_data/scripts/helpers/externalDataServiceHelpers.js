const assert = require("chai").assert;

const endpoints = require("../../../../../cartridges/int_external_data/cartridge/contstants/endpoints");
const serviceMessages = require("../../../../../cartridges/int_external_data/cartridge/contstants/serviceMessages.json");

const request = require("../../../../mocks/util/request");

const CUSTOMER_DATA = {
    firstName: "John",
    lastName: "Doe",
    phone: "(923) 159-8245",
    id: "000123",
    login: "test@abv.bg",
    password: "12345678%As",
    address: { id: "test_address_id"},
};

describe("externalDataServiceHelpers", function () {
    this.timeout(50000);

    it("should get all customers", function () {
        const endpoint = endpoints.CUSTOMERS;

        const result = request.get(endpoint);

        assert.equal(result.statusCode, 200);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_SUCCESS
        );
    });

    it("should get a single customer", function () {
        const endpoint = endpoints.getCustomerEndpoint(CUSTOMER_DATA.id);

        const result = request.get(endpoint);

        assert.equal(result.statusCode, 200);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_SUCCESS
        );
    });

    it("should respond with status 400 if no body is provided", function () {
        const endpoint = endpoints.CUSTOMERS;

        const result = request.post(endpoint, null);

        assert.equal(result.statusCode, 400);
        assert.equal(result.ok, false);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_ERROR
        );
        assert.equal(result.errorMessage, serviceMessages.ERROR_MESSAGE_BODY);
    });

    it("should register a customer", function () {
        const endpoint = endpoints.CUSTOMERS;

        const result = request.post(endpoint, CUSTOMER_DATA);

        assert.equal(result.statusCode, 201);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_CREATED
        );
    });

    it("should set password", function () {
        const endpoint = endpoints.getCustomerEndpoint(CUSTOMER_DATA.id);

        const result = request.patch(endpoint, {
            password: CUSTOMER_DATA.password,
            newPassword: "12345As$D",
        });

        assert.equal(result.statusCode, 204);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_UPDATED
        );
    });

    it("should edit profile", function () {
        const endpoint = endpoints.getCustomerEndpoint(CUSTOMER_DATA.id);

        const result = request.patch(endpoint, CUSTOMER_DATA);

        assert.equal(result.statusCode, 204);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_UPDATED
        );
    });

    it("should create address", function () {
        const endpoint = endpoints.getCustomerAddressBookEndpoint(CUSTOMER_DATA.id);

        const result = request.post(endpoint, CUSTOMER_DATA.address);

        assert.equal(result.statusCode, 201);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_CREATED
        );
    });

    it("should modify address", function () {
        const endpoint = endpoints.getCustomerAddressEnpoint(CUSTOMER_DATA.id, CUSTOMER_DATA.address.id);

        const result = request.patch(endpoint, CUSTOMER_DATA.address);

        assert.equal(result.statusCode, 204);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_UPDATED
        );
    });

    it("should remove address", function () {
        const endpoint = endpoints.getCustomerAddressEnpoint(CUSTOMER_DATA.id, CUSTOMER_DATA.address.id);

        const result = request.remove(endpoint);

        assert.equal(result.statusCode, 204);
        assert.equal(result.ok, true);
        assert.equal(
            result.statusMessage,
            serviceMessages.STATUS_MESSAGE_DELETED
        );
    })
});
