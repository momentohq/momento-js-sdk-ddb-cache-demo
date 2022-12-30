import {
    CacheGetStatus,
    LogFormat,
    LogLevel,
    SimpleCacheClient,
} from '@gomomento/sdk';

const CommandCacheAllowList = [
    'GetItemCommand'
];
const cacheName = 'cache';

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
            // Middleware added to mark start and end of an complete API call.
            stack.add(
                (next, context) => async args => {
                    // Check if we should cache this command
                    if (CommandCacheAllowList.includes(args.constructor.name)) {
                        // Check and see if we already have item in cache
                        const itemCacheKey = getCacheKey(args);
                        const item = await momento.get(cacheName, itemCacheKey);
                        if (item.status === CacheGetStatus.Hit) {
                            console.log('found item in cache skipping ddb look up');
                            return {
                                output: {
                                    $metadata: {},
                                    Item: JSON.parse(item.text()),
                                },
                            };
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
    return args.input.TableNam + JSON.stringify(args.input.Key);
}