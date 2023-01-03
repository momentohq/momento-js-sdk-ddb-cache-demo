import {
    CacheGetStatus,
    LogFormat,
    LogLevel,
    SimpleCacheClient,
} from '@gomomento/sdk';

const CommandCacheAllowList = [
    'GetItemCommand'
];
const cacheName = 'aws-sdk-middleware-cache';

const authToken = process.env.MOMENTO_AUTH_TOKEN;
if (!authToken) {
    throw new Error('Missing required environment variable MOMENTO_AUTH_TOKEN');
}

const defaultTtl = 60;
const momento = new SimpleCacheClient(authToken, defaultTtl, {
    loggerOptions: {
        level: LogLevel.INFO,
        format: LogFormat.JSON,
    },
});
export const getCachingMiddleware = () => {
    return {
        applyToStack: stack => {
            stack.add(
                (next) => async args => {
                    // Check if we should cache this command
                    if (CommandCacheAllowList.includes(args.constructor.name)) {
                        const itemCacheKey = getCacheKey(args);
                        if(!args.input.ConsistentRead){
                            // Check and see if we already have item in cache
                            const item = await momento.get(cacheName, itemCacheKey);
                            if (item.status === CacheGetStatus.Hit) {
                                // If item found in cache return result and skip DDB call
                                return {
                                    output: {
                                        $metadata: {},
                                        Item: JSON.parse(item.text()),
                                    },
                                };
                            }
                        }

                        // If we didn't get cache hit let normal call path go through and then try cache result for next time
                        const result = await next(args);
                        if(result.output.Item != undefined){
                            await momento.set(
                                cacheName,
                                itemCacheKey,
                                JSON.stringify(result.output.Item)
                            );
                        }
                        return result;
                    } else {
                        return await next(args);
                    }
                },
                {tags: ['CACHE']}
            );
        },
    };
}

function getCacheKey(args) {
    return args.input.TableName + JSON.stringify(args.input.Key);
}
