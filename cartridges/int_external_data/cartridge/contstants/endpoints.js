const CUSTOMERS = "customers";
const RESET_TOKEN = "resetToken";
const RESET_PASSWORD = "resetPassword";
const ADDRESS_BOOK = "addressBook";

/**
 * Gets the endpoint for customer
 * @param {String} customerId
 * @returns {String}
 */
const getCustomerEndpoint = function (customerId) {
    return `${CUSTOMERS}/${customerId}`;
};

/**
 * Gets the endpoint for customer reset token
 * @param {String} customerId
 * @returns {String}
 */
const getCustomerResetTokenEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${RESET_TOKEN}`;
};

/**
 * Gets the endpoint for customer password reset
 * @param {String} customerId
 * @returns {String}
 */
const getCustomerResetPasswordEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${RESET_PASSWORD}`;
};

/**
 * Gets the endpoint for customer address book
 * @param {String} customerId
 * @returns {String}
 */
const getCustomerAddressBookEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${ADDRESS_BOOK}`;
};

/**
 * Gets the endpoint for customer address
 * @param {String} customerId
 * @returns {String}
 */
const getCustomerAddressEnpoint = function (customerId, addressId) {
    return `${getCustomerAddressBookEndpoint(customerId)}/${addressId}`;
};

module.exports = {
    CUSTOMERS,
    getCustomerEndpoint,
    getCustomerResetTokenEndpoint,
    getCustomerResetPasswordEndpoint,
    getCustomerAddressBookEndpoint,
    getCustomerAddressEnpoint,
};
