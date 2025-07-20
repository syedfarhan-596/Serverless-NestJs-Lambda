import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Context, Callback, APIGatewayProxyEvent, Handler } from 'aws-lambda';
import { Express } from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { logger: ['log'] });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance() as Express;

  return serverlessExpress({ app: expressApp });
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
