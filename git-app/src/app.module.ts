import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { OctokitModule } from 'nestjs-octokit';
import { AppService } from './app.service';

@Module({
  imports: [
    GithubWebhooksModule.forRootAsync({
      useFactory: () => ({ webhookSecret: process.env.GITHUB_WEBHOOK_SECRET }),
    }),
    OctokitModule.forRoot({
      isGlobal: true,
      octokitOptions: {
        auth: process.env.GITHUB_WEBHOOK_TOKEN,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
