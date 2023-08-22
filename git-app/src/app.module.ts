import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { OctokitModule } from 'nestjs-octokit';

@Module({
  imports: [
    GithubWebhooksModule.forRoot({
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    }),
    OctokitModule.forRoot({
      isGlobal: true,
      octokitOptions: {
        auth: 'my-github-token',
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
