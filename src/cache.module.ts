import { NgModule, ModuleWithProviders } from '@angular/core';
import { CacheService } from './cache.service';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';

@NgModule({
  imports: [
    IonicStorageModule.forRoot({
      name: '__ionicCache',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ]
})
export class CacheModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CacheModule,
      providers: [
        CacheService,
        Network
      ]
    };
  }
}
