import {Injector, NgModule} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { DemoComponent } from './demo/demo.component';
import { BaseAngularComponentModule } from './packagr.module';

@NgModule({
  imports: [
    BaseAngularComponentModule
  ],
  entryComponents: [ DemoComponent ],
  providers: [],
})
export class AppModule {
  constructor(injector: Injector) {
    const acc = createCustomElement(DemoComponent, { injector });
    customElements.define('base-angular-component', acc);
  }
  ngDoBootstrap() {}
}
