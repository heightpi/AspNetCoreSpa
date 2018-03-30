import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthProvider } from './oauth.provider';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers: [
    OAuthProvider,
  ],
})
export class ProvidersModule {

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      providers: [
        OAuthProvider,
      ],
    };
  }
}
