import { NbAbstractAuthProvider, NbAuthResult } from '@nebular/auth';
import { Observable } from 'rxjs/Observable';
import { OAuthService } from 'angular-oauth2-oidc';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class OAuthProvider extends NbAbstractAuthProvider {

    constructor(
        private oAuthService: OAuthService,
        private router: Router) {
        super();
    }

    authenticate(data?: any): Observable<NbAuthResult> {
        this.oAuthService.fetchTokenUsingPasswordFlow(data.email, data.password)
            .then((x: any) => {
                localStorage.setItem('id_token', x.id_token);
                this.oAuthService.setupAutomaticSilentRefresh();
                this.router.navigate(['']);
            });

        return Observable.of(<NbAuthResult>{});
    };

    register(data?: any): Observable<NbAuthResult> {
        throw new Error('Method not implemented.');
    }
    requestPassword(data?: any): Observable<NbAuthResult> {
        throw new Error('Method not implemented.');
    }
    resetPassword(data?: any): Observable<NbAuthResult> {
        throw new Error('Method not implemented.');
    }
    logout(): Observable<NbAuthResult> {
        throw new Error('Method not implemented.');
    }
}
