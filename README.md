# APIGateway with Lambdas, Momento and CRUD on DynamoDB

This an example of an APIGateway, pointing to five Lambdas executing CRUD operations on a single DynamoDB table. We are using 
[Momento's](https://gomomento.com) `@gomomento-poc/aws-cache-helpers` [package](https://www.npmjs.com/package/@gomomento-poc/aws-cache-helpers) to quickly provide a drop in caching solution ontop of our JS API runnning on AWS Lambda. This demo repo was originally from the aws cdk examples project [here](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/api-cors-lambda-crud-dynamodb) and we added caching ontop. 


![image](https://user-images.githubusercontent.com/5491827/212209590-45ac9d36-532a-459c-a8ea-154e8ac7733c.png)

## Build

To build this app, you need to be in this example's root folder. Then run the following:

```bash
npm install -g aws-cdk
npm install
npm run build
```

This will install the necessary CDK, then this example's dependencies, then the lambda functions' dependencies, and then build your TypeScript files and your CloudFormation template.

## Deploy

Run `MOMENTO_AUTH_TOKEN=*** npm run cdk deploy`. This will deploy / redeploy your Stack to your AWS Account.

After the deployment you will see the API's URL, which represents the url you can then use.

## The Component Structure

The whole component contains:

- An API, with CORS enabled on all HTTP Methods. (Use with caution, for production apps you will want to enable only a certain domain origin to be able to query your API.)
- Lambda pointing to `lambdas/create.ts`, containing code for __storing__ an item  into the DynamoDB table.
- Lambda pointing to `lambdas/delete-one.ts`, containing code for __deleting__ an item from the DynamoDB table.
- Lambda pointing to `lambdas/get-all.ts`, containing code for __getting all items__ from the DynamoDB table.
- Lambda pointing to `lambdas/get-one.ts`, containing code for __getting an item__ from the DynamoDB table.
- Lambda pointing to `lambdas/update-one.ts`, containing code for __updating an item__ in the DynamoDB table.
- A DynamoDB table `items` that stores the data.
- Five `LambdaIntegrations` that connect these Lambdas to the API.

## CDK Toolkit

The [`cdk.json`](./cdk.json) file in the root of this repository includes
instructions for the CDK toolkit on how to execute this program.

After building your TypeScript code, you will be able to run the CDK toolkit commands as usual:

```bash
    $ cdk ls
    <list all stacks in this program>

    $ cdk synth
    <generates and outputs cloudformation template>

    $ cdk deploy
    <deploys stack to your account>

    $ cdk diff
    <shows diff against deployed stack>
```
