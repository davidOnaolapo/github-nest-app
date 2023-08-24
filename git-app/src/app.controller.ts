import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import {
  GithubGuard,
  GithubWebhookEvents,
} from '@dev-thought/nestjs-github-webhooks';
// import { OctokitService } from 'nestjs-octokit';

@Controller()
export class AppController {
  constructor(private readonly octokitService: OctokitService) {}
  @UseGuards(GithubGuard)
  @Post()
  githubWebhoook() {}

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['pull_request'])
  @Post('onPullRequest')
  async onPullRequest(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    console.log('**PAYLOAD*', payload);
    // const response = await this.octokitService.rest.search.repos({
    //   q: 'nest-js',
    // });
    // return response.data.items;
  }

  @Post('onPushToMaster')
  async onPushToMaster(@Body() payload: any) {
    console.log('**PAYLOAD*', payload);
    return;
  }

  @Get('/')
  async someEndpoint() {
    console.log('WH SECRET', process.env.GITHUB_WEBHOOK_SECRET);
    const response = await this.octokitService.rest.search.repos({
      q: 'nest-js',
    });
    return response.data.items;
  }
}
