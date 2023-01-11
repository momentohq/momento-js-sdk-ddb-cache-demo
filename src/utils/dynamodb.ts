import {AttributeValue} from "aws-lambda/trigger/dynamodb-stream";

/**
 * Goes from DDB attribute schema keys to a normalized key we can use across stream processor and middleware.
 * @param keys
 */
export const normalizeKeysFromAttributeValue = (keys: { [key: string]: AttributeValue } | undefined): string => {
    let returnString = "";
    if(keys){
        Object.keys(keys).forEach(k => {
            // @ts-ignore
            returnString += `${k}${keys[k][Object.keys(keys[k])[0]]}`;
        })
    }
    return returnString
}

export const normalizeKeysFromRequestValue = (keys: { [key: string]: any }): string => {
    let returnString = "";
    Object.keys(keys).forEach(k => {
        returnString += `${k}${keys[k]}`;
    })
    return returnString
}