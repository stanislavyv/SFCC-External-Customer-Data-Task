/**
 * Externally registers a customer
 * @param {Object} customerData
 * @returns {Object} service response
 */
function register(customerData) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    return request.post(endpoints.CUSTOMERS, customerData);
}

/**
 * Sets a new password for the current customer
 * @param {String} customerId
 * @param {String} currentPassword
 * @param {String} newPassword
 * @returns {Object} service response
 */
function setPassword(customerId, currentPassword, newPassword) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    return request.patch(endpoints.getCustomerEndpoint(customerId), {
        currentPassword,
        newPassword,
    });
}

/**
 * Sets the password reset token for the current customer
 * @param {String} customerId
 * @param {String} token
 * @returns {Object} service response
 */
function setPasswordResetToken(customerId, token) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    return request.post(endpoints.getCustomerResetTokenEndpoint(customerId), {
        token,
    });
}

/**
 * Resets a customer's password
 * @param {String} customerId
 * @param {String} token
 * @param {String} newPassword
 * @returns {Object} service response
 */
function resetPassword(customerId, token, newPassword) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    return request.post(
        endpoints.getCustomerResetPasswordEndpoint(customerId),
        {
            token,
            newPassword,
        }
    );
}

/**
 * Modifies current customer's credentials
 * @param {String} customerId
 * @param {Object} formInfo
 * @returns {Object} service response
 */
function editProfile(customerId, formInfo) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    const customerData = {
        fistName: formInfo.firstName,
        lastName: formInfo.lastName,
        email: formInfo.email,
        phone: formInfo.phone,
    };

    return request.patch(
        endpoints.getCustomerEndpoint(customerId),
        customerData
    );
}

/**
 * Adds a new address in customer's address book
 * @param {String} customerId
 * @param {Object | String} addressData address object or address id
 * @returns {Object} service result
 */
function createAddress(customerId, addressData) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    let address;

    if (typeof addressData === "string") {
        address = { addressId: addressData };
    } else {
        address = addressData;
    }

    return request.post(endpoints.getCustomerAddressBookEndpoint(customerId), {
        address,
    });
}

/**
 * Modifies a customer's address or creates new if it doesn't exist
 * @param {String} customerId
 * @param {String} addressId
 * @param {Object} addressData
 * @returns {Object} service result
 */
function saveAddress(customerId, addressId, addressData) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    const result = request.patch(
        endpoints.getCustomerAddressEnpoint(customerId, addressId),
        addressData
    );

    if (!result.ok) {
        const addressObject = Object.assign({ addressId }, addressData);
        return createAddress(customerId, addressObject);
    }

    return result;
}

/**
 * Removes an address from customer's address book
 * @param {String} customerId
 * @param {String} addressId
 * @returns {Object} service response
 */
function removeAddress(customerId, addressId) {
    const request = require("~/cartridge/scripts/util/request.js");
    const endpoints = require("~/cartridge/contstants/endpoints");

    return request.remove(
        endpoints.getCustomerAddressEnpoint(customerId, addressId)
    );
}

module.exports = {
    register,
    setPassword,
    setPasswordResetToken,
    resetPassword,
    editProfile,
    createAddress,
    saveAddress,
    removeAddress,
};
