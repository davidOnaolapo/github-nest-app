import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { OctokitModule } from 'nestjs-octokit';

@Module({
  imports: [
    GithubWebhooksModule.forRootAsync({
      useFactory: () => ({ webhookSecret: process.env.GITHUB_WEBHOOK_SECRET }),
    }),
    OctokitModule.forRoot({
      isGlobal: true,
      octokitOptions: {
        auth: 'my-githubtoken',
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
