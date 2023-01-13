import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const handler = async (): Promise<any> => {

  const params = {
    TableName: TABLE_NAME
  };

  try {
    const response = await db.send(new ScanCommand(params));
    return { statusCode: 200, body: JSON.stringify(response.Items) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
