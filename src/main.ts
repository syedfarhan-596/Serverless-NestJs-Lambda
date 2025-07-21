import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Context, Callback, APIGatewayProxyEvent, Handler } from 'aws-lambda';
import { Express } from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler | void> {
  const app = await NestFactory.create(AppModule, { logger: ['log'] });
  if (process.env.ENV === 'development') {
    await app.listen(process.env.PORT ?? 3000);
  } else {
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance() as Express;
    return serverlessExpress({ app: expressApp });
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback,
): Promise<any> => {
  if (event.path === '' || event.path === undefined) event.path = '/';
  cachedServer = cachedServer ?? (await bootstrap());
  return cachedServer(event, context, callback);
};

if (process.env.ENV === 'development') {
  bootstrap()
    .then(() => {
      console.log('Server is running on port 3000');
    })
    .catch((error) => {
      console.log(`Something went run ${error}`);
    });
}
