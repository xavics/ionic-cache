import { NgModule } from '@angular/core';
import { CacheService } from './cache.service';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';
var CacheModule = (function () {
    function CacheModule() {
    }
    CacheModule.forRoot = function () {
        return {
            ngModule: CacheModule,
            providers: [
                CacheService,
                Network
            ]
        };
    };
    return CacheModule;
}());
export { CacheModule };
CacheModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    IonicStorageModule.forRoot({
                        name: '__ionicCache',
                        driverOrder: ['indexeddb', 'sqlite', 'websql']
                    })
                ]
            },] },
];
/** @nocollapse */
CacheModule.ctorParameters = function () { return []; };
//# sourceMappingURL=cache.module.js.map