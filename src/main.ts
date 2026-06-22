import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = process.env.API_PREFIX ?? 'api';
  const port = Number(process.env.PORT ?? 3000);

  app.setGlobalPrefix(apiPrefix);
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  console.log(`[catalog-service] running on port ${port} with prefix /${apiPrefix}`);
}

void bootstrap();//Entrega k8s