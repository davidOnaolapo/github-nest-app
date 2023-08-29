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
    console.log('**PAYLOAD*', payload);
    return;
  }

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['check_suite'])
  @Post('onCheckSuite')
  async onCheckSuite(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    const workflowInfo =
      await this.githubGraphqlService.getRepositoryWorkflowInfo(
        payload.repository.owner.login,
        payload.repository.name,
      );
    // console.log(
    //   '**OCTOKIT**',
    //   workflowInfo[2].workflowRun?.workflow,
    //   workflowInfo[2].workflowRun?.checkSuite,
    // );
    console.log('**OCTOKIT**', workflowInfo);
    return;
  }

  @Post('onPushToMaster')
  async onPushToMaster(@Body() payload: any) {
    console.log('**PAYLOAD*', payload);
    return;
  }

  @Get('/')
  async someEndpoint() {
    return 'YES';
  }
}
