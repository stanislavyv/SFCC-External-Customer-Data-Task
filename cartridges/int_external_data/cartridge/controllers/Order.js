"use strict";

/**
 * @namespace Order
 */

var server = require("server");

var Resource = require("dw/web/Resource");
var URLUtils = require("dw/web/URLUtils");
var csrfProtection = require("*/cartridge/scripts/middleware/csrf");

const base = module.superModule;
server.extend(base);

/**
 * Order-CreateAccount : This endpoint is invoked when a shopper has already placed an Order as a guest and then tries to create an account
 * @name Base/Order-CreateAccount
 * @function
 * @memberof Order
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - ID: Order ID
 * @param {httpparameter} - dwfrm_newPasswords_newpassword - Password
 * @param {httpparameter} - dwfrm_newPasswords_newpasswordconfirm - Confirm Password
 * @param {httpparameter} - csrf_token - CSRF token
 * @param {category} - sensitive
 * @param {serverfunction} - post
 */
server.replace(
    "CreateAccount",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var OrderMgr = require("dw/order/OrderMgr");

        var formErrors = require("*/cartridge/scripts/formErrors");

        const externalDataServiceHelpers = require("~/cartridge/scripts/helpers/externalDataServiceHelpers.js");

        var passwordForm = server.forms.getForm("newPasswords");
        var newPassword = passwordForm.newpassword.htmlValue;
        var confirmPassword = passwordForm.newpasswordconfirm.htmlValue;
        if (newPassword !== confirmPassword) {
            passwordForm.valid = false;
            passwordForm.newpasswordconfirm.valid = false;
            passwordForm.newpasswordconfirm.error = Resource.msg(
                "error.message.mismatch.newpassword",
                "forms",
                null
            );
        }

        var order = OrderMgr.getOrder(req.querystring.ID);
        if (
            !order ||
            order.customer.ID !== req.currentCustomer.raw.ID ||
            order.getUUID() !== req.querystring.UUID
        ) {
            res.json({
                error: [
                    Resource.msg(
                        "error.message.unable.to.create.account",
                        "login",
                        null
                    ),
                ],
            });
            return next();
        }

        res.setViewData({ orderID: req.querystring.ID });
        var registrationObj = {
            firstName: order.billingAddress.firstName,
            lastName: order.billingAddress.lastName,
            phone: order.billingAddress.phone,
            email: order.customerEmail,
            password: newPassword,
        };

        if (passwordForm.valid) {
            res.setViewData(registrationObj);
            res.setViewData({ passwordForm: passwordForm });

            this.on("route:BeforeComplete", function (req, res) {
                // eslint-disable-line no-shadow
                var CustomerMgr = require("dw/customer/CustomerMgr");
                var Transaction = require("dw/system/Transaction");
                var accountHelpers = require("*/cartridge/scripts/helpers/accountHelpers");
                var addressHelpers = require("*/cartridge/scripts/helpers/addressHelpers");

                var registrationData = res.getViewData();

                var login = registrationData.email;
                var password = registrationData.password;
                var newCustomer;
                var authenticatedCustomer;
                var newCustomerProfile;
                var errorObj = {};

                delete registrationData.email;
                delete registrationData.password;

                // attempt to create a new user and log that user in.
                try {
                    Transaction.wrap(function () {
                        var error = {};
                        newCustomer = CustomerMgr.createCustomer(
                            login,
                            password
                        );

                        const externalResponse =
                            externalDataServiceHelpers.register({
                                id: newCustomer.getProfile().customerNo,
                                login,
                                password,
                            });

                        if (externalResponse.ok) {
                            var authenticateCustomerResult =
                                CustomerMgr.authenticateCustomer(
                                    login,
                                    password
                                );
                            if (
                                authenticateCustomerResult.status !== "AUTH_OK"
                            ) {
                                error = {
                                    authError: true,
                                    status: authenticateCustomerResult.status,
                                };
                                throw error;
                            }

                            authenticatedCustomer = CustomerMgr.loginCustomer(
                                authenticateCustomerResult,
                                false
                            );

                            if (!authenticatedCustomer) {
                                error = {
                                    authError: true,
                                    status: authenticateCustomerResult.status,
                                };
                                throw error;
                            } else {
                                // assign values to the profile
                                newCustomerProfile = newCustomer.getProfile();

                                newCustomerProfile.firstName =
                                    registrationData.firstName;
                                newCustomerProfile.lastName =
                                    registrationData.lastName;
                                newCustomerProfile.phoneHome =
                                    registrationData.phone;
                                newCustomerProfile.email = login;

                                order.setCustomer(newCustomer);

                                // save all used shipping addresses to address book of the logged in customer
                                var allAddresses =
                                    addressHelpers.gatherShippingAddresses(
                                        order
                                    );
                                allAddresses.forEach(function (address) {
                                    let externalAddressResponse =
                                        externalDataServiceHelpers.createAddress(
                                            newCustomer.getProfile().customerNo,
                                            address
                                        );

                                    if (externalAddressResponse.ok) {
                                        addressHelpers.saveAddress(
                                            address,
                                            { raw: newCustomer },
                                            addressHelpers.generateAddressName(
                                                address
                                            )
                                        );
                                    }
                                });

                                res.setViewData({ newCustomer: newCustomer });
                                res.setViewData({ order: order });
                            }
                        } else {
                            CustomerMgr.removeCustomer(newCustomer);

                            error = {
                                authError: true,
                                status: externalResponse.status,
                            };

                            throw error;
                        }
                    });
                } catch (e) {
                    errorObj.error = true;
                    errorObj.errorMessage = e.authError
                        ? Resource.msg(
                              "error.message.unable.to.create.account",
                              "login",
                              null
                          )
                        : Resource.msg(
                              "error.message.account.create.error",
                              "forms",
                              null
                          );
                }

                delete registrationData.firstName;
                delete registrationData.lastName;
                delete registrationData.phone;

                if (errorObj.error) {
                    res.json({ error: [errorObj.errorMessage] });

                    return;
                }

                accountHelpers.sendCreateAccountEmail(
                    authenticatedCustomer.profile
                );

                res.json({
                    success: true,
                    redirectUrl: URLUtils.url(
                        "Account-Show",
                        "registration",
                        "submitted"
                    ).toString(),
                });
            });
        } else {
            res.json({
                fields: formErrors.getFormErrors(passwordForm),
            });
        }

        return next();
    }
);

module.exports = server.exports();
