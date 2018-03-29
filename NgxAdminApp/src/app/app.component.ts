/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    @Inject('BASE_URL') private baseUrl: string,
    @Inject(PLATFORM_ID) private platformId: string,
    private analytics: AnalyticsService,
    private oauthService: OAuthService) {
    if (isPlatformBrowser(this.platformId)) {
      this.configureOidc();
    }
  }

  ngOnInit() {
    this.analytics.trackPageViews();
  }

  private configureOidc() {
    this.oauthService.configure(authConfig(this.baseUrl));
    this.oauthService.setStorage(localStorage);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

}
