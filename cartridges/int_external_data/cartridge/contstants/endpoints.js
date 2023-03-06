const CUSTOMERS = "customers";
const RESET_TOKEN = "resetToken";
const RESET_PASSWORD = "resetPassword";
const ADDRESS_BOOK = "addressBook";

exports.CUSTOMERS = CUSTOMERS;

/**
 * Gets the endpoint for customer
 * @param {String} customerId
 * @returns {String}
 */
exports.getCustomerEndpoint = function (customerId) {
    return `${CUSTOMERS}/${customerId}`;
};

/**
 * Gets the endpoint for customer reset token
 * @param {String} customerId
 * @returns {String}
 */
exports.getCustomerResetTokenEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${RESET_TOKEN}`;
};

/**
 * Gets the endpoint for customer password reset
 * @param {String} customerId
 * @returns {String}
 */
exports.getCustomerResetPasswordEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${RESET_PASSWORD}`;
};

/**
 * Gets the endpoint for customer address book
 * @param {String} customerId
 * @returns {String}
 */
exports.getCustomerAddressBookEndpoint = function (customerId) {
    return `${getCustomerEndpoint(customerId)}/${ADDRESS_BOOK}`;
};

/**
 * Gets the endpoint for customer address
 * @param {String} customerId
 * @returns {String}
 */
exports.getCustomerAddressEnpoint = function (customerId, addressId) {
    return `${getCustomerAddressBookEndpoint(customerId)}/${addressId}`;
};
