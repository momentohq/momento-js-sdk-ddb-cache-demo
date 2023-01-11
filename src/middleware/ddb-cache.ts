import {CacheGet, LogFormat, LogLevel, SimpleCacheClient,} from '@gomomento/sdk';
import {normalizeKeysFromRequestValue} from "../utils/dynamodb";
import {
    InitializeHandler,
    InitializeHandlerArguments,
    InitializeHandlerOutput,
    InitializeMiddleware,
    MetadataBearer,
    Pluggable,
} from "@aws-sdk/types";
import {config} from "../config/config";

const CommandCacheAllowList = [
    'GetItemCommand'
];

const momento = new SimpleCacheClient(config.authToken, config.defaultTtl, {
    loggerOptions: {
        level: LogLevel.INFO,
        format: LogFormat.JSON,
    },
});

export function cachingMiddleware(): InitializeMiddleware<any, any> {
    return <Output extends MetadataBearer>(next: InitializeHandler<any, Output>): InitializeHandler<any, Output> =>
        async (args: InitializeHandlerArguments<any>): Promise<InitializeHandlerOutput<Output>> => {
            console.log(JSON.stringify(args));
            // Check if we should cache this command
            if (CommandCacheAllowList.includes(args.constructor.name)) {
                const itemCacheKey = args.input.TableName + normalizeKeysFromRequestValue(args.input.Key);
                if (!args.input.ConsistentRead) {
                    // Check and see if we already have item in cache
                    const getResponse = await momento.get(config.cacheName, itemCacheKey);
                    if (getResponse instanceof CacheGet.Hit) {
                        // If item found in cache return result and skip DDB call aka calling next
                        console.log("found item in momento cache skipping DDB lookup")
                        return {
                            // @ts-ignore
                            output: {
                                $metadata: {},
                                Item: JSON.parse(getResponse.valueString()),
                            },
                        };
                    }
                }

                // If we didn't get cache hit let normal call path go through and then try cache result for next time
                const result = await next(args);
                // @ts-ignore
                if (result.output.Item != undefined) {
                    await momento.set(
                        config.cacheName,
                        itemCacheKey,
                        // @ts-ignore
                        JSON.stringify(result.output.Item)
                    );
                }
                return result;
            } else {
                return await next(args);
            }
        }
}

export const getCachingMiddleware = (): Pluggable<any, any> => ({
    applyToStack: (clientStack) => {
        clientStack.add(cachingMiddleware(), {tags: ['CACHE']});
    },
})
