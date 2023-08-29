import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import {
  GithubGuard,
  GithubWebhookEvents,
} from '@dev-thought/nestjs-github-webhooks';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly githubGraphqlService: AppService) {}

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['pull_request'])
  @Post('onPullRequest')
  async onPullRequest(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    console.log('**PAYLOAD**', payload);
    const issues = await this.githubGraphqlService.getRepositoryIssues();

    console.log('**OCTOKIT**', issues);
    return;
  }

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['check_run'])
  @Post('onCheckRun')
  async onCheckRun(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    console.log('**PAYLOAD**', payload);
  }

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['check_suite'])
  @Post('onCheckSuite')
  async onCheckSuite(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    console.log('**PAYLOAD*', payload);
    return;
  }

  @Post('onPushToMaster')
  async onPushToMaster(@Body() payload: any) {
    console.log('**PAYLOAD**', payload);
    return;
  }

  @Get('/')
  async someEndpoint() {
    return 'YES';
  }
}
