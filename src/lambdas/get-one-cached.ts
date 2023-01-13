import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import {NewCachingMiddleware} from "@gomomento-poc/aws-cache-helpers";
import {config} from "../config/config";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
db.middlewareStack.use(NewCachingMiddleware({
    tableName: config.tableName,
    momentoAuthToken: config.authToken,
    defaultCacheTtl: config.defaultTtl,
    cacheName: config.cacheName
}));


export const handler = async (event: any = {}): Promise<any> => {

  const requestedItemId = event.pathParameters.id;
  if (!requestedItemId) {
    return { statusCode: 400, body: `Error: You are missing the path parameter id` };
  }
  try {
    const response = await db.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            [PRIMARY_KEY]: requestedItemId
          }
        })
    );
    if (response.Item) {
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    } else {
      return { statusCode: 404 };
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
