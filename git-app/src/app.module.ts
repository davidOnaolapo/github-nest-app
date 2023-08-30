import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { AppService } from './app.service';
@Module({
  imports: [
    GithubWebhooksModule.forRootAsync({
      useFactory: () => ({ webhookSecret: process.env.GITHUB_WEBHOOK_SECRET }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
