import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';
export declare const MESSAGES: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
};
export declare class CacheService {
    private _storage;
    private network;
    private ttl;
    private cacheEnabled;
    private invalidateOffline;
    private networkStatusChanges;
    private networkStatus;
    constructor(_storage: Storage, network: Network);
    ready(): Promise<any>;
    /**
     * @description Disable or enable cache
     */
    enableCache(enable?: boolean): void;
    /**
     * @description Delete DB table and create new one
     * @return {Promise<any>}
     */
    private resetDatabase();
    /**
     * @description Set default TTL
     * @param {number} ttl - TTL in seconds
     */
    setDefaultTTL(ttl: number | string): any;
    /**
     * @description Set TTL value
     * @param {number} ttl - TTL in seconds
     */
    setTTL(ttl: number | string): any;
    /**
     * @description Set if expired cache should be invalidated if device is offline
     * @param {boolean} offlineInvalidate
     */
    setOfflineInvalidate(offlineInvalidate: boolean): void;
    /**
     * @description Start watching if devices is online or offline
     */
    private watchNetworkInit();
    /**
     * @description Stream of network status changes
     * * @return {Observable<boolean>} network status stream
     */
    getNetworkStatusChanges(): Observable<boolean>;
    /**
     * @description Check if devices is online
     * @return {boolean} network status
     */
    isOnline(): boolean;
    /**
     * @description Save item to cache
     * @param {string} key - Unique key
     * @param {any} data - Data to store
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Promise<any>} - saved data
     */
    saveItem(key: string, data: any, groupKey?: string, ttl?: number | string): Promise<any>;
    /**
     * @description Delete item from cache
     * @param {string} key - Unique key
     * @return {Promise<any>} - query execution promise
     */
    removeItem(key: string): Promise<any>;
    /**
     * @description Get item from cache without expire check etc.
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    getRawItem(key: string): Promise<any>;
    /**
     * @description Get item from cache with expire check and correct type assign
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    getItem(key: string): Promise<any>;
    /**
     * @description Decode raw data from DB
     * @param {any} data - Data
     * @return {any} - decoded data
     */
    static decodeRawData(data: any): any;
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Observable<any>} - data from cache or origin observable
     */
    loadFromObservable(key: string, observable: any, groupKey?: string, ttl?: number | string): Observable<any>;
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [delayType='expired']
     * @param {number} [ttl] - TTL in seconds
     * @return {Observable<any>} - data from cache or origin observable
     */
    simpleLoadFromDelayedObservable(key: string, observable: any, delayType?: string, ttl?: number | string): Observable<any>;
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @param {string} [delayType='expired']
     * @return {Observable<any>} - data from cache or origin observable
     */
    loadFromDelayedObservable(key: string, observable: any, groupKey?: string, ttl?: number | string, delayType?: string): Observable<any>;
    /**
     * Perform complete cache clear
     * @return {Promise<any>}
     */
    clearAll(): Promise<any>;
    /**
     * @description Remove all expired items from cache
     * @param {boolean} ignoreOnlineStatus -
     * @return {Promise<any>} - query promise
     */
    clearExpired(ignoreOnlineStatus?: boolean): Promise<any>;
    /**
     * @description Remove all item with specified group
     * @param {string} groupKey - group key
     * @return {Promise<any>} - query promise
     */
    clearGroup(groupKey: string): Promise<any>;
    /**
     * @description Check if it's an request
     * @param {any} data - Variable to test
     * @return {boolean} - data from cache
     */
    static isRequest(data: any): boolean;
}
