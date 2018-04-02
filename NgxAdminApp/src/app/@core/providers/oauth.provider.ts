/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { URLSearchParams } from '@angular/http';
import { NbAbstractAuthProvider, NbAuthResult} from '@nebular/auth';
import { NbOAuth2ProviderConfig } from './oauth2-auth.options';

/**
 * The OAuth2 provider.
 *
 *
 * @example
 *
 * Default settings object:
 *
 * ```
 * {
 *  login: {
 *    method: 'post',
 *    redirect: {
 *      success: '/',
 *      failure: null,
 *    },
 *  },
 *  oAuthTokenRequestBase: {
 *    handler: null,
 *    client: {
 *      id: '',
 *      secret: '',
 *      idParamName: 'client_id',
 *      secretParamName: 'client_secret',
 *      },
 *    auth: {
 *      tokenHost: '',
 *      tokenPath: '/oauth/token',
 *    },
 *    http: {
 *      headers: [],
 *    },
 *    body: {
 *      format: 'form',
 *      data: [],
 *    },
 *    options: {
 *      useBodyAuth: true,
 *      useBasicAuthorizationHeader: true,
 *      usernameParamName: 'username',
 *      passwordParamName: 'password',
 *    },
 *  },
 *}
 *  Requirements:
 *    - you should add {key:'grant_type', value: 'type'} object into body.data
 *  You can select body format: form or json.
 *  Also you can add some addition information into body.data or http.headers in the following format:
 *  [{key: 'key 1', value: 'value 1'}, .., {key: 'key n', value: 'value n}]
 *
 * // Note, there is no need to copy over the whole object to change the settings you need.
 * // Also, this.getConfigValue call won't work outside ofthe default config declaration
 * // (which is inside of the `NbOAuth2Provider` class), so you have to replace it with a custom helper function
 * // if you need it.
 * ```
 */
@Injectable()
export class NbOAuth2Provider extends NbAbstractAuthProvider {

    protected defaultConfig: NbOAuth2ProviderConfig = {
        login: {
            method: 'post',
            redirect: {
                success: '/',
                failure: null,
            },
        },
        oAuthTokenRequestBase: {
            handler: null,
            client: {
                id: 'aspnetcorespa',
                idParamName: 'client_id',
            },
            auth: {
                tokenHost: '',
                tokenPath: '/connect/token',
            },
            http: {
                headers: [],
            },
            body: {
                format: 'form',
                data: [{
                    key: 'scope',
                    value: 'openid profile email offline_access client_id roles',
                }, {
                    key: 'grant_type',
                    value: 'password',
                },
                ],
            },
            options: {
                useBodyAuth: true,
                useBasicAuthorizationHeader: true,
                usernameParamName: 'username',
                passwordParamName: 'password',
            },
        },
    };

    constructor(protected http: HttpClient) {
        super();
    }


    authenticate(data?: any): Observable<NbAuthResult> {
        let response;
        const customHandler = this.getConfigValue('oAuthTokenRequestBase.handler');
        if (customHandler) {
            response = customHandler(this.http);
        } else {
            response = this.oAuthRequestCallback(this.http, data);
        }
        return response
            .map((res) => {
                // TODO: need to use another wrapper for both access and refresh tokens
                return new NbAuthResult(
                    true,
                    res,
                    this.getConfigValue('login.redirect.success'),
                    [],
                    ['You have successfully got authorization token.'],
                    res.access_token);
            })
            .catch((res) => {
                let errors = [];
                if (res instanceof HttpErrorResponse) {
                    errors = this.getConfigValue('errors.getter')('login', res);
                } else {
                    errors.push('Something went wrong.');
                }

                return Observable.of(
                    new NbAuthResult(
                        false,
                        res,
                        this.getConfigValue('login.redirect.failure'),
                        errors,
                    ));
            });
    }

    register(data?: any): Observable<NbAuthResult> {
        return undefined;
    }

    requestPassword(data?: any): Observable<NbAuthResult> {
        return undefined;
    }

    resetPassword(data?: any): Observable<NbAuthResult> {
        return undefined;
    }

    logout(): Observable<NbAuthResult> {
        return undefined;
    }

    private oAuthRequestCallback(http: HttpClient, data: any): Observable<Object> {
        return this.oAuthRequestBuilder(http, data);
    }

    private oAuthRequestBuilder(http: HttpClient, data: any): Observable<Object> {
        const method = this.getConfigValue(
            'login.method',
        );
        const url = this.getActionEndpoint(
            'oAuthTokenRequestBase.auth.tokenHost',
            'oAuthTokenRequestBase.auth.tokenPath',
        );
        const oAuthTokenRequestBaseHeaders = this.getConfigValue(
            'oAuthTokenRequestBase.http.headers',
        );
        const bodyFormat = this.getConfigValue(
            'oAuthTokenRequestBase.body.format',
        );

        let requestHeaders = new HttpHeaders();
        if (oAuthTokenRequestBaseHeaders) {
            for (let i = 0; i < oAuthTokenRequestBaseHeaders.length; i++) {
                requestHeaders = requestHeaders
                    .append(oAuthTokenRequestBaseHeaders[i].key, oAuthTokenRequestBaseHeaders[i].value);
            }
        }

        const useBasicAuthorization = this.getConfigValue(
            'oAuthTokenRequestBase.options.useBasicAuthorizationHeader',
        );
        const clientId = this.getConfigValue(
            'oAuthTokenRequestBase.client.id')
            ;
        const clientSecret = this.getConfigValue(
            'oAuthTokenRequestBase.client.secret',
        );

        if (useBasicAuthorization) {
            const encrypt = btoa(clientId + ':' + clientSecret);
            requestHeaders = requestHeaders.append('Authorization', 'Basic ' + encrypt);
        }

        let requestBody;
        if (bodyFormat === 'form') {
            requestHeaders = requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
            requestBody = this.buildFormBody(data);
        } else if (bodyFormat === 'json') {
            requestHeaders = requestHeaders.append('Content-Type', 'application/json');
            requestBody = this.buildJsonBody(data);
        }

        return http.request(method, url, { body: requestBody, headers: requestHeaders });
    }

    private buildFormBody(data: any): string {
        const queryString = new URLSearchParams();
        const jsonBody = this.buildJsonBody(data);

        for (const key in jsonBody) {
            if (jsonBody.hasOwnProperty(key)) {
                queryString.set(key, jsonBody[key])
            }
        }

        return queryString.toString();
    }

    private buildJsonBody(data: any): Object {
        const usernameParamName = this.getConfigValue(
            'oAuthTokenRequestBase.options.usernameParamName',
        );
        const passwordParamName = this.getConfigValue(
            'oAuthTokenRequestBase.options.passwordParamName',
        );
        const clientIdParamName = this.getConfigValue(
            'oAuthTokenRequestBase.client.idParamName')
            ;
        const configData = this.getConfigValue(
            'oAuthTokenRequestBase.body.data',
        );
        const useBodyAuth = this.getConfigValue(
            'oAuthTokenRequestBase.options.useBodyAuth',
        );
        const jsonBody = {};

        if (useBodyAuth) {
            const clientId = this.getConfigValue(
                'oAuthTokenRequestBase.client.id')
                ;
            // const clientSecret = this.getConfigValue(
            //     'oAuthTokenRequestBase.client.secret',
            // );

            jsonBody[clientIdParamName] = clientId;
        }

        jsonBody[usernameParamName] = data.email;
        jsonBody[passwordParamName] = data.password;

        if (configData) {
            for (let i = 0; i < configData.length; i++) {
                jsonBody[configData[i].key] = configData[i].value;
            }
        }
        return jsonBody;
    }

    protected getActionEndpoint(hostKey: string, urlKey: string): string {
        const host: string = this.getConfigValue(hostKey);
        const url: string = this.getConfigValue(urlKey);
        return host + url;
    }
}
