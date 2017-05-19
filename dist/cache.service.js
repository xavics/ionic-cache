import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Request, Response, ResponseOptions } from '@angular/http';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
export var MESSAGES = {
    0: 'Cache initialization error: ',
    1: 'Cache is not enabled.',
    2: 'Cache entry already expired: ',
    3: 'No such key: ',
    4: 'No entries were deleted, because browser is offline.'
};
var CacheService = (function () {
    function CacheService(_storage, network) {
        var _this = this;
        this._storage = _storage;
        this.network = network;
        this.ttl = 60 * 60; // one hour
        this.cacheEnabled = true;
        this.invalidateOffline = false;
        this.networkStatus = true;
        try {
            this.watchNetworkInit();
            _storage.ready()
                .then(function () {
                _this.cacheEnabled = true;
            });
        }
        catch (e) {
            this.cacheEnabled = false;
            console.error(MESSAGES[0], e);
        }
    }
    CacheService.prototype.ready = function () {
        return this._storage.ready().then(function () { return Promise.resolve(); });
    };
    /**
     * @description Disable or enable cache
     */
    CacheService.prototype.enableCache = function (enable) {
        if (enable === void 0) { enable = true; }
        this.cacheEnabled = enable;
    };
    /**
     * @description Delete DB table and create new one
     * @return {Promise<any>}
     */
    CacheService.prototype.resetDatabase = function () {
        var _this = this;
        return this.ready()
            .then(function () { return _this._storage.clear(); });
    };
    /**
     * @description Set default TTL
     * @param {number} ttl - TTL in seconds
     */
    CacheService.prototype.setDefaultTTL = function (ttl) {
        return this.setTTL(ttl);
    };
    /**
     * @description Set TTL value
     * @param {number} ttl - TTL in seconds
     */
    CacheService.prototype.setTTL = function (ttl) {
        return (typeof ttl === 'string' && ttl === 'none') ? this.ttl = 'none' : this.ttl = ttl;
    };
    /**
     * @description Set if expired cache should be invalidated if device is offline
     * @param {boolean} offlineInvalidate
     */
    CacheService.prototype.setOfflineInvalidate = function (offlineInvalidate) {
        this.invalidateOffline = !offlineInvalidate;
    };
    /**
     * @description Start watching if devices is online or offline
     */
    CacheService.prototype.watchNetworkInit = function () {
        var _this = this;
        this.networkStatus = navigator.onLine;
        var connect = this.network.onConnect().map(function () { return true; }), disconnect = this.network.onDisconnect().map(function () { return false; });
        this.networkStatusChanges = Observable.merge(connect, disconnect).share();
        this.networkStatusChanges.subscribe(function (status) {
            _this.networkStatus = status;
        });
    };
    /**
     * @description Stream of network status changes
     * * @return {Observable<boolean>} network status stream
     */
    CacheService.prototype.getNetworkStatusChanges = function () {
        return this.networkStatusChanges;
    };
    /**
     * @description Check if devices is online
     * @return {boolean} network status
     */
    CacheService.prototype.isOnline = function () {
        return this.networkStatus;
    };
    /**
     * @description Save item to cache
     * @param {string} key - Unique key
     * @param {any} data - Data to store
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Promise<any>} - saved data
     */
    CacheService.prototype.saveItem = function (key, data, groupKey, ttl) {
        if (groupKey === void 0) { groupKey = 'none'; }
        if (ttl === void 0) { ttl = this.ttl; }
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        var expires = (typeof ttl === 'string') ? ttl : new Date().getTime() + (ttl * 1000), type = CacheService.isRequest(data) ? 'request' : typeof data, value = JSON.stringify(data);
        return this._storage.set(key, {
            value: value,
            expires: expires,
            type: type,
            groupKey: groupKey
        });
    };
    /**
     * @description Delete item from cache
     * @param {string} key - Unique key
     * @return {Promise<any>} - query execution promise
     */
    CacheService.prototype.removeItem = function (key) {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this._storage.remove(key);
    };
    /**
     * @description Get item from cache without expire check etc.
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    CacheService.prototype.getRawItem = function (key) {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this._storage.get(key)
            .then(function (data) {
            if (!data)
                return Promise.reject('');
            return data;
        })
            .catch(function () { return Promise.reject(MESSAGES[3] + key); });
    };
    /**
     * @description Get item from cache with expire check and correct type assign
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    CacheService.prototype.getItem = function (key) {
        var _this = this;
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this.getRawItem(key).then(function (data) {
            if (data.expires === 'none' || data.expires < new Date().getTime()) {
                if (_this.invalidateOffline) {
                    return Promise.reject(MESSAGES[2] + key);
                }
                else if (_this.isOnline()) {
                    return Promise.reject(MESSAGES[2] + key);
                }
            }
            return CacheService.decodeRawData(data);
        });
    };
    /**
     * @description Decode raw data from DB
     * @param {any} data - Data
     * @return {any} - decoded data
     */
    CacheService.decodeRawData = function (data) {
        var dataJson = JSON.parse(data.value);
        if (CacheService.isRequest(dataJson)) {
            var requestOptions = new ResponseOptions({
                body: dataJson._body,
                status: dataJson.status,
                headers: dataJson.headers,
                statusText: dataJson.statusText,
                type: dataJson.type,
                url: dataJson.url
            });
            return new Response(requestOptions);
        }
        else {
            return dataJson;
        }
    };
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Observable<any>} - data from cache or origin observable
     */
    CacheService.prototype.loadFromObservable = function (key, observable, groupKey, ttl) {
        var _this = this;
        if (!this.cacheEnabled)
            return observable;
        observable = observable.share();
        return Observable.fromPromise(this.getItem(key))
            .catch(function (e) {
            observable.subscribe(function (res) { return _this.saveItem(key, res, groupKey, ttl); });
            return observable;
        });
    };
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [delayType='expired']
     * @param {number} [ttl] - TTL in seconds
     * @return {Observable<any>} - data from cache or origin observable
     */
    CacheService.prototype.simpleLoadFromDelayedObservable = function (key, observable, delayType, ttl) {
        var _this = this;
        if (delayType === void 0) { delayType = 'all'; }
        if (ttl === void 0) { ttl = this.ttl; }
        if (!this.cacheEnabled)
            return observable;
        var observableSubject = new Subject();
        observable = observable.share();
        var subscribeOrigin = function () {
            observable.subscribe(function (res) {
                _this.saveItem(key, res, 'none', ttl);
                observableSubject.next(res);
                observableSubject.complete();
            }, function (err) {
                observableSubject.error(err);
            }, function () {
                observableSubject.complete();
            });
        };
        this.getItem(key)
            .then(function (data) {
            observableSubject.next(data);
            if (delayType === 'all') {
                subscribeOrigin();
            }
        })
            .catch(function (e) {
            _this.getRawItem(key)
                .then(function (res) {
                observableSubject.next(CacheService.decodeRawData(res));
                subscribeOrigin();
            })
                .catch(function () { return subscribeOrigin(); });
        });
        return observableSubject.asObservable();
    };
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @param {string} [delayType='expired']
     * @return {Observable<any>} - data from cache or origin observable
     */
    CacheService.prototype.loadFromDelayedObservable = function (key, observable, groupKey, ttl, delayType) {
        var _this = this;
        if (ttl === void 0) { ttl = this.ttl; }
        if (delayType === void 0) { delayType = 'expired'; }
        if (!this.cacheEnabled)
            return observable;
        var observableSubject = new Subject();
        observable = observable.share();
        var subscribeOrigin = function () {
            observable.subscribe(function (res) {
                _this.saveItem(key, res, groupKey, ttl);
                observableSubject.next(res);
                observableSubject.complete();
            }, function (err) {
                observableSubject.error(err);
            }, function () {
                observableSubject.complete();
            });
        };
        this.getItem(key)
            .then(function (data) {
            observableSubject.next(data);
            if (delayType === 'all') {
                subscribeOrigin();
            }
        })
            .catch(function (e) {
            _this.getRawItem(key)
                .then(function (res) {
                observableSubject.next(CacheService.decodeRawData(res));
                subscribeOrigin();
            })
                .catch(function () { return subscribeOrigin(); });
        });
        return observableSubject.asObservable();
    };
    /**
     * Perform complete cache clear
     * @return {Promise<any>}
     */
    CacheService.prototype.clearAll = function () {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[2]);
        }
        return this.resetDatabase();
    };
    /**
     * @description Remove all expired items from cache
     * @param {boolean} ignoreOnlineStatus -
     * @return {Promise<any>} - query promise
     */
    CacheService.prototype.clearExpired = function (ignoreOnlineStatus) {
        var _this = this;
        if (ignoreOnlineStatus === void 0) { ignoreOnlineStatus = false; }
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[2]);
        }
        if (!this.isOnline() && !ignoreOnlineStatus) {
            return Promise.reject(MESSAGES[4]);
        }
        var datetime = new Date().getTime();
        var promises = [];
        this._storage.forEach(function (key, val) {
            if (val.expires === 'none' || val.expires < datetime)
                promises.push(_this.removeItem(key));
        });
        return Promise.all(promises);
    };
    /**
     * @description Remove all item with specified group
     * @param {string} groupKey - group key
     * @return {Promise<any>} - query promise
     */
    CacheService.prototype.clearGroup = function (groupKey) {
        var _this = this;
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[2]);
        }
        var promises = [];
        this._storage.forEach(function (key, val) {
            if (val.groupKey === groupKey)
                promises.push(_this.removeItem(key));
        });
        return Promise.all(promises);
    };
    /**
     * @description Check if it's an request
     * @param {any} data - Variable to test
     * @return {boolean} - data from cache
     */
    CacheService.isRequest = function (data) {
        return (data && (data instanceof Request ||
            (typeof data === 'object' && data.hasOwnProperty('_body') && data.hasOwnProperty('status') &&
                data.hasOwnProperty('statusText') &&
                data.hasOwnProperty('type') &&
                data.hasOwnProperty('headers') &&
                data.hasOwnProperty('url'))));
    };
    return CacheService;
}());
export { CacheService };
CacheService.decorators = [
    { type: Injectable },
];
/** @nocollapse */
CacheService.ctorParameters = function () { return [
    { type: Storage, },
    { type: Network, },
]; };
//# sourceMappingURL=cache.service.js.map