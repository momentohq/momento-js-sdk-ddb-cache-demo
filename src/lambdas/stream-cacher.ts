import {DynamoDBStreamEvent} from "aws-lambda";
import {normalizeKeysFromAttributeValue} from "../utils/dynamodb";
import {CacheDelete, CacheSet, LogFormat, LogLevel, SimpleCacheClient} from "@gomomento/sdk";
import {config} from "../config/config";

const momento = new SimpleCacheClient(config.authToken, config.defaultTtl, {
    loggerOptions: {
        level: LogLevel.INFO,
        format: LogFormat.JSON,
    },
});

export const handler = async (event: DynamoDBStreamEvent): Promise<any> => {
    for (const r of event.Records) {
        if (r.dynamodb) {
            console.log(normalizeKeysFromAttributeValue(r.dynamodb.Keys));
            const recordKey = config.tableName + normalizeKeysFromAttributeValue(r.dynamodb.Keys);
            switch (r.eventName) {
                case "INSERT":
                case "MODIFY":
                    let setRsp = await momento.set(
                        config.cacheName,
                        recordKey,
                        JSON.stringify(r.dynamodb.NewImage),
                        config.defaultTtl
                    );
                    if (setRsp instanceof CacheSet.Error) {
                        console.error(`error setting item in cache err=${setRsp.message()}`)
                    }
                    break;
                case "REMOVE":
                    let deleteRsp = await momento.delete(config.cacheName, recordKey)
                    if (deleteRsp instanceof CacheDelete.Error) {
                        console.error(`error deleting item in cache err=${deleteRsp.message()}`)
                    }

            }
        }
    }
    console.log(`successfully processed ${event.Records.length} event records`)
}