import { Injectable } from '@angular/core';
import { NbAuthSimpleToken } from '@nebular/auth';

@Injectable()
export class NbOAuth2Token extends NbAuthSimpleToken {
  private refreshToken = '';

  getRefreshToken(): string {
    return this.refreshToken;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }
}