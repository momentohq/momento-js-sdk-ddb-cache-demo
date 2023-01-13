
export const config = {
    tableName: process.env.TABLE_NAME || '',
    primaryKey: process.env.PRIMARY_KEY || '',
    defaultTtl: 86400,
    authToken: process.env.MOMENTO_AUTH_TOKEN || '',
    cacheName: 'default',
}

if (config.authToken == '') {
    throw new Error('Missing required environment variable MOMENTO_AUTH_TOKEN');
}
if (config.tableName == '') {
    throw new Error('Missing required environment variable TABLE_NAME');
}
if (config.primaryKey == '') {
    throw new Error('Missing required environment variable PRIMARY_KEY');
}
