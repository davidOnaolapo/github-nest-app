import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { GithubWebhooksModule } from '@dev-thought/nestjs-github-webhooks';
import { OctokitModule } from 'nestjs-octokit';
import { AppService } from './app.service';

@Module({
  imports: [
    // GithubWebhooksModule.forRootAsync({
    //   useFactory: () => ({ webhookSecret: 'nest' }),
    // }),
    OctokitModule.forRoot({
      isGlobal: true,
      octokitOptions: {
        auth: 'my-githubtoken',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
