"use strict";

/**
 * @namespace Account
 */

const server = require("server");

const csrfProtection = require("*/cartridge/scripts/middleware/csrf");

const base = module.superModule;
server.extend(base);

const externalDataServiceHelpers = require("~/cartridge/scripts/helpers/externalDataServiceHelpers.js");

/**
 * Account-SubmitRegistration : The Account-SubmitRegistration endpoint is the endpoint that gets hit when a shopper submits their registration for a new account
 * @name Base/Account-SubmitRegistration
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - rurl - redirect url. The value of this is a number. This number then gets mapped to an endpoint set up in oAuthRenentryRedirectEndpoints.js
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password - Input field for the shopper's password
 * @param {httpparameter} - dwfrm_profile_login_passwordconfirm: - Input field for the shopper's password to confirm
 * @param {httpparameter} - dwfrm_profile_customer_addtoemaillist - Checkbox for whether or not a shopper wants to be added to the mailing list
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    "SubmitRegistration",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var CustomerMgr = require("dw/customer/CustomerMgr");
        var Resource = require("dw/web/Resource");

        var formErrors = require("*/cartridge/scripts/formErrors");

        var registrationForm = server.forms.getForm("profile");

        // form validation
        if (
            registrationForm.customer.email.value.toLowerCase() !==
            registrationForm.customer.emailconfirm.value.toLowerCase()
        ) {
            registrationForm.customer.email.valid = false;
            registrationForm.customer.emailconfirm.valid = false;
            registrationForm.customer.emailconfirm.error = Resource.msg(
                "error.message.mismatch.email",
                "forms",
                null
            );
            registrationForm.valid = false;
        }

        if (
            registrationForm.login.password.value !==
            registrationForm.login.passwordconfirm.value
        ) {
            registrationForm.login.password.valid = false;
            registrationForm.login.passwordconfirm.valid = false;
            registrationForm.login.passwordconfirm.error = Resource.msg(
                "error.message.mismatch.password",
                "forms",
                null
            );
            registrationForm.valid = false;
        }

        if (
            !CustomerMgr.isAcceptablePassword(
                registrationForm.login.password.value
            )
        ) {
            registrationForm.login.password.valid = false;
            registrationForm.login.passwordconfirm.valid = false;
            registrationForm.login.passwordconfirm.error = Resource.msg(
                "error.message.password.constraints.not.matched",
                "forms",
                null
            );
            registrationForm.valid = false;
        }

        // setting variables for the BeforeComplete function
        var registrationFormObj = {
            firstName: registrationForm.customer.firstname.value,
            lastName: registrationForm.customer.lastname.value,
            phone: registrationForm.customer.phone.value,
            email: registrationForm.customer.email.value,
            emailConfirm: registrationForm.customer.emailconfirm.value,
            password: registrationForm.login.password.value,
            passwordConfirm: registrationForm.login.passwordconfirm.value,
            validForm: registrationForm.valid,
            form: registrationForm,
        };

        if (registrationForm.valid) {
            res.setViewData(registrationFormObj);

            this.on("route:BeforeComplete", function (req, res) {
                // eslint-disable-line no-shadow
                var Transaction = require("dw/system/Transaction");
                var accountHelpers = require("*/cartridge/scripts/helpers/accountHelpers");
                var authenticatedCustomer;
                var serverError;

                // getting variables for the BeforeComplete function
                var registrationForm = res.getViewData(); // eslint-disable-line

                if (registrationForm.validForm) {
                    var login = registrationForm.email;
                    var password = registrationForm.password;

                    // attempt to create a new user and log that user in.
                    try {
                        const externalResponse =
                            externalDataServiceHelpers.register({
                                login,
                                password,
                            });

                        var error = {};

                        if (externalResponse.ok) {
                            Transaction.wrap(function () {
                                var newCustomer = CustomerMgr.createCustomer(
                                    login,
                                    password
                                );

                                var authenticateCustomerResult =
                                    CustomerMgr.authenticateCustomer(
                                        login,
                                        password
                                    );
                                if (
                                    authenticateCustomerResult.status !==
                                    "AUTH_OK"
                                ) {
                                    error = {
                                        authError: true,
                                        status: authenticateCustomerResult.status,
                                    };
                                    throw error;
                                }

                                authenticatedCustomer =
                                    CustomerMgr.loginCustomer(
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
                                    var newCustomerProfile =
                                        newCustomer.getProfile();

                                    newCustomerProfile.firstName =
                                        registrationForm.firstName;
                                    newCustomerProfile.lastName =
                                        registrationForm.lastName;
                                    newCustomerProfile.phoneHome =
                                        registrationForm.phone;
                                    newCustomerProfile.email =
                                        registrationForm.email;
                                }
                            });
                        } else {
                            error = {
                                authError: true,
                                status: externalResponse.status,
                            };
                            throw error;
                        }
                    } catch (e) {
                        if (e.authError) {
                            serverError = true;
                        } else {
                            registrationForm.validForm = false;
                            registrationForm.form.customer.email.valid = false;
                            registrationForm.form.customer.emailconfirm.valid = false;
                            registrationForm.form.customer.email.error =
                                Resource.msg(
                                    "error.message.username.invalid",
                                    "forms",
                                    null
                                );
                        }
                    }
                }

                delete registrationForm.password;
                delete registrationForm.passwordConfirm;
                formErrors.removeFormValues(registrationForm.form);

                if (serverError) {
                    res.setStatusCode(500);
                    res.json({
                        success: false,
                        errorMessage: Resource.msg(
                            "error.message.unable.to.create.account",
                            "login",
                            null
                        ),
                    });

                    return;
                }

                if (registrationForm.validForm) {
                    // send a registration email
                    accountHelpers.sendCreateAccountEmail(
                        authenticatedCustomer.profile
                    );

                    res.setViewData({
                        authenticatedCustomer: authenticatedCustomer,
                    });
                    res.json({
                        success: true,
                        redirectUrl: accountHelpers.getLoginRedirectURL(
                            req.querystring.rurl,
                            req.session.privacyCache,
                            true
                        ),
                    });

                    req.session.privacyCache.set("args", null);
                } else {
                    res.json({
                        fields: formErrors.getFormErrors(registrationForm),
                    });
                }
            });
        } else {
            res.json({
                fields: formErrors.getFormErrors(registrationForm),
            });
        }

        return next();
    }
);

/**
 * Account-SaveProfile : The Account-SaveProfile endpoint is the endpoint that gets hit when a shopper has edited their profile
 * @name Base/Account-SaveProfile
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password  - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensititve
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    "SaveProfile",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require("dw/system/Transaction");
        var CustomerMgr = require("dw/customer/CustomerMgr");
        var Resource = require("dw/web/Resource");
        var URLUtils = require("dw/web/URLUtils");
        var accountHelpers = require("*/cartridge/scripts/helpers/accountHelpers");

        var formErrors = require("*/cartridge/scripts/formErrors");

        var profileForm = server.forms.getForm("profile");

        // form validation
        if (
            profileForm.customer.email.value.toLowerCase() !==
            profileForm.customer.emailconfirm.value.toLowerCase()
        ) {
            profileForm.valid = false;
            profileForm.customer.email.valid = false;
            profileForm.customer.emailconfirm.valid = false;
            profileForm.customer.emailconfirm.error = Resource.msg(
                "error.message.mismatch.email",
                "forms",
                null
            );
        }

        var result = {
            firstName: profileForm.customer.firstname.value,
            lastName: profileForm.customer.lastname.value,
            phone: profileForm.customer.phone.value,
            email: profileForm.customer.email.value,
            confirmEmail: profileForm.customer.emailconfirm.value,
            password: profileForm.login.password.value,
            profileForm: profileForm,
        };
        if (profileForm.valid) {
            res.setViewData(result);
            this.on("route:BeforeComplete", function (req, res) {
                // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var profile = customer.getProfile();
                var customerLogin;
                var status;

                const externalSetPasswordResponse =
                    externalDataServiceHelpers.setPassword(
                        profile.customerNo,
                        formInfo.password,
                        formInfo.password
                    );

                if (externalSetPasswordResponse.ok) {
                    Transaction.wrap(function () {
                        status = profile.credentials.setPassword(
                            formInfo.password,
                            formInfo.password,
                            true
                        );

                        if (status.error) {
                            formInfo.profileForm.login.password.valid = false;
                            formInfo.profileForm.login.password.error =
                                Resource.msg(
                                    "error.message.currentpasswordnomatch",
                                    "forms",
                                    null
                                );
                        } else {
                            customerLogin = profile.credentials.setLogin(
                                formInfo.email,
                                formInfo.password
                            );
                        }
                    });
                } else {
                    formInfo.profileForm.login.password.valid = false;
                    formInfo.profileForm.login.password.error = Resource.msg(
                        "error.message.currentpasswordnomatch",
                        "forms",
                        null
                    );
                }

                delete formInfo.password;
                delete formInfo.confirmEmail;

                if (customerLogin) {
                    const externalResponse =
                        externalDataServiceHelpers.editProfile(
                            profile.customerNo,
                            formInfo
                        );

                    if (externalResponse.ok) {
                        Transaction.wrap(function () {
                            profile.setFirstName(formInfo.firstName);
                            profile.setLastName(formInfo.lastName);
                            profile.setEmail(formInfo.email);
                            profile.setPhoneHome(formInfo.phone);
                        });
                    }

                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    delete formInfo.profileForm;
                    delete formInfo.email;

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url("Account-Show").toString(),
                    });
                } else {
                    if (!status.error) {
                        formInfo.profileForm.customer.email.valid = false;
                        formInfo.profileForm.customer.email.error =
                            Resource.msg(
                                "error.message.username.invalid",
                                "forms",
                                null
                            );
                    }

                    delete formInfo.profileForm;
                    delete formInfo.email;

                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(profileForm),
                    });
                }
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(profileForm),
            });
        }
        return next();
    }
);

/**
 * Account-SavePassword : The Account-SavePassword endpoint is the endpoit that handles changing the shopper's password
 * @name Base/Account-SavePassword
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {httpparameter} - dwfrm_profile_login_currentpassword - Input field for the shopper's current password
 * @param {httpparameter} - dwfrm_profile_login_newpasswords_newpassword - Input field for the shopper's new password
 * @param {httpparameter} - dwfrm_profile_login_newpasswords_newpasswordconfirm - Input field for the shopper to confirm their new password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.replace(
    "SavePassword",
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Transaction = require("dw/system/Transaction");
        var CustomerMgr = require("dw/customer/CustomerMgr");
        var Resource = require("dw/web/Resource");
        var URLUtils = require("dw/web/URLUtils");

        var formErrors = require("*/cartridge/scripts/formErrors");

        var profileForm = server.forms.getForm("profile");
        var newPasswords = profileForm.login.newpasswords;
        // form validation
        if (
            newPasswords.newpassword.value !==
            newPasswords.newpasswordconfirm.value
        ) {
            profileForm.valid = false;
            newPasswords.newpassword.valid = false;
            newPasswords.newpasswordconfirm.valid = false;
            newPasswords.newpasswordconfirm.error = Resource.msg(
                "error.message.mismatch.newpassword",
                "forms",
                null
            );
        }

        var result = {
            currentPassword: profileForm.login.currentpassword.value,
            newPassword: newPasswords.newpassword.value,
            newPasswordConfirm: newPasswords.newpasswordconfirm.value,
            profileForm: profileForm,
        };

        if (profileForm.valid) {
            res.setViewData(result);
            this.on("route:BeforeComplete", function () {
                // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var status;

                const externalResponse = externalDataServiceHelpers.setPassword(
                    customer.getProfile().customerNo,
                    formInfo.currentPassword,
                    formInfo.newPassword
                );

                if (externalResponse.ok) {
                    Transaction.wrap(function () {
                        status = customer.profile.credentials.setPassword(
                            formInfo.newPassword,
                            formInfo.currentPassword,
                            true
                        );
                    });
                } else {
                    status.error = true;
                }

                if (status.error) {
                    if (
                        !CustomerMgr.isAcceptablePassword(
                            newPasswords.newpassword.value
                        )
                    ) {
                        formInfo.profileForm.login.newpasswords.newpassword.valid = false;
                        formInfo.profileForm.login.newpasswords.newpassword.error =
                            Resource.msg(
                                "error.message.password.constraints.not.matched",
                                "forms",
                                null
                            );
                    } else {
                        formInfo.profileForm.login.currentpassword.valid = false;
                        formInfo.profileForm.login.currentpassword.error =
                            Resource.msg(
                                "error.message.currentpasswordnomatch",
                                "forms",
                                null
                            );
                    }

                    delete formInfo.currentPassword;
                    delete formInfo.newPassword;
                    delete formInfo.newPasswordConfirm;
                    delete formInfo.profileForm;

                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(profileForm),
                    });
                } else {
                    delete formInfo.currentPassword;
                    delete formInfo.newPassword;
                    delete formInfo.newPasswordConfirm;
                    delete formInfo.profileForm;

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url("Account-Show").toString(),
                    });
                }
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(profileForm),
            });
        }
        return next();
    }
);

/**
 * Account-SaveNewPassword : The Account-SaveNewPassword endpoint handles resetting a shoppers password. This is the last step in the forgot password user flow. (This step does not log the shopper in.)
 * @name Base/Account-SaveNewPassword
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {httpparameter} - token - SFRA utilizes this token to retrieve the shopper
 * @param {httpparameter} - dwfrm_newPasswords_newpassword - Input field for the shopper's new password
 * @param {httpparameter} - dwfrm_newPasswords_newpasswordconfirm  - Input field to confirm the shopper's new password
 * @param {httpparameter} - save - unutilized param
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - post
 */
server.replace(
    "SaveNewPassword",
    server.middleware.https,
    function (req, res, next) {
        var Transaction = require("dw/system/Transaction");
        var Resource = require("dw/web/Resource");

        var passwordForm = server.forms.getForm("newPasswords");
        // Token used to be a query parameter, now it's in the body. Support both.
        var token = req.form.token || req.querystring.Token;

        if (
            passwordForm.newpassword.value !==
            passwordForm.newpasswordconfirm.value
        ) {
            passwordForm.valid = false;
            passwordForm.newpassword.valid = false;
            passwordForm.newpasswordconfirm.valid = false;
            passwordForm.newpasswordconfirm.error = Resource.msg(
                "error.message.mismatch.newpassword",
                "forms",
                null
            );
        }

        if (passwordForm.valid) {
            var result = {
                newPassword: passwordForm.newpassword.value,
                newPasswordConfirm: passwordForm.newpasswordconfirm.value,
                token: token,
                passwordForm: passwordForm,
            };
            res.setViewData(result);
            this.on("route:BeforeComplete", function (req, res) {
                // eslint-disable-line no-shadow
                var CustomerMgr = require("dw/customer/CustomerMgr");
                var URLUtils = require("dw/web/URLUtils");
                var Site = require("dw/system/Site");
                var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");

                var formInfo = res.getViewData();
                var status;
                var resettingCustomer;

                resettingCustomer = CustomerMgr.getCustomerByToken(
                    formInfo.token
                );

                const externalResponse =
                    externalDataServiceHelpers.resetPassword(
                        resettingCustomer.profile.customerNo,
                        formInfo.token,
                        formInfo.newPassword
                    );

                if (externalResponse.ok) {
                    Transaction.wrap(function () {
                        status =
                            resettingCustomer.profile.credentials.setPasswordWithToken(
                                formInfo.token,
                                formInfo.newPassword
                            );
                    });
                } else {
                    status.error = true;
                }

                if (status.error) {
                    passwordForm.newpassword.valid = false;
                    passwordForm.newpasswordconfirm.valid = false;
                    passwordForm.newpasswordconfirm.error = Resource.msg(
                        "error.message.resetpassword.invalidformentry",
                        "forms",
                        null
                    );
                    res.render("account/password/newPassword", {
                        passwordForm: passwordForm,
                        token: token,
                    });
                } else {
                    var email = resettingCustomer.profile.email;
                    var url = URLUtils.https("Login-Show");
                    var objectForEmail = {
                        firstName: resettingCustomer.profile.firstName,
                        lastName: resettingCustomer.profile.lastName,
                        url: url,
                    };

                    var emailObj = {
                        to: email,
                        subject: Resource.msg(
                            "subject.profile.resetpassword.email",
                            "login",
                            null
                        ),
                        from:
                            Site.current.getCustomPreferenceValue(
                                "customerServiceEmail"
                            ) || "no-reply@testorganization.com",
                        type: emailHelpers.emailTypes.passwordReset,
                    };

                    emailHelpers.sendEmail(
                        emailObj,
                        "account/password/passwordChangedEmail",
                        objectForEmail
                    );
                    res.redirect(URLUtils.url("Login-Show"));
                }
            });
        } else {
            res.render("account/password/newPassword", {
                passwordForm: passwordForm,
                token: token,
            });
        }
        next();
    }
);

module.exports = server.exports();
