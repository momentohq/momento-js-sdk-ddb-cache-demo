import {NewStreamCacheHandler} from '@gomomento-poc/aws-cache-helpers';
import {config} from "../config/config";

export const handler = NewStreamCacheHandler({
    tableName: config.tableName,
    momentoAuthToken: config.authToken,
    defaultCacheTtl: config.defaultTtl,
    cacheName: config.cacheName
});