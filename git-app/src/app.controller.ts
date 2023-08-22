import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import {
  GithubGuard,
  GithubWebhookEvents,
} from '@dev-thought/nestjs-github-webhooks';
import { OctokitService } from 'nestjs-octokit';

@Controller()
export class AppController {
  constructor(private readonly octokitService: OctokitService) {}

  @UseGuards(GithubGuard)
  @Post()
  githubWebhoook() {}

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['push', 'pullrequest'])
  @Post('pull_request')
  async onPullRequest(@Body() payload: any) {
    //inside webhook, grab pr id/ add label
    console.log('**PAYLOAD', payload);
    const response = await this.octokitService.rest.search.repos({
      q: 'nest-js',
    });
    return response.data.items;
  }

  @Get('/')
  async someEndpoint() {
    const response = await this.octokitService.rest.search.repos({
      q: 'nest-js',
    });
    return response.data.items;
  }
}
