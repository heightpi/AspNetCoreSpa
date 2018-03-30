import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbOAuth2Provider } from './oauth.provider';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers: [
    NbOAuth2Provider,
  ],
})
export class ProvidersModule {

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      providers: [
        NbOAuth2Provider,
      ],
    };
  }
}
