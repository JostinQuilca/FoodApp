import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Jostin pero como hace una api sin poner Cors?? jajaj El michael 
  // Vale verg.. 
  app.enableCors({
    origin: 'http://localhost:3000',  
    methods: ['GET', 'POST'],        
    allowedHeaders: ['Content-Type', 'Authorization'],  
  });

  await app.listen(process.env.PORT ?? 3000);  
}
bootstrap();
