/**
 * ============================================
 * MAIN.TS - Application Entry Point
 * ============================================
 *
 * This is the entry point of your NestJS application.
 * It bootstraps (starts) the NestJS application and configures:
 * - Global pipes for validation
 * - CORS settings
 * - Server port
 *
 * IMPORTANT CONCEPTS:
 * 1. NestFactory - The core factory class to create a Nest application instance
 * 2. ValidationPipe - Automatically validates incoming request data
 * 3. Bootstrap - The async function that initializes everything
 */

// Import NestFactory from @nestjs/core - this creates the application instance
import { NestFactory } from '@nestjs/core';

// Import ValidationPipe for automatic request validation
import { ValidationPipe } from '@nestjs/common';

// Import ConfigService to access environment variables
import { ConfigService } from '@nestjs/config';

// Import the root module of our application
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Bootstrap Function
 * ------------------
 * This async function sets up and starts the NestJS application.
 * It's called 'bootstrap' by convention but you can name it anything.
 */
async function bootstrap() {
  try {
    // Create a NestJS application instance using AppModule as the root module
    const app = await NestFactory.create(AppModule);

    // Get ConfigService to access environment variables
    const configService = app.get(ConfigService);

    // Global Validation Pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Enable CORS
    app.enableCors();

    // Get port
    const port = configService.get('APP_PORT') || 3000;

    // Start server
    await app.listen(port);

    const url = await app.getUrl();
    console.log(`
    🚀 Application is running!
    🔉 Listening on: ${url}
    📚 API Documentation: ${url}/api
    👉 Test Register: POST ${url}/auth/register
    `);
  } catch (error) {
    console.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}

// Call the bootstrap function to start the application
bootstrap();
