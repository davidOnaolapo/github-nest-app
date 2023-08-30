import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import {
  GithubGuard,
  GithubWebhookEvents,
} from '@dev-thought/nestjs-github-webhooks';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly githubGraphqlService: AppService) {}

  @UseGuards(GithubGuard)
  @GithubWebhookEvents(['check_suite', 'pull_request'])
  @Post('onPrWorkflowEvent')
  async onCheckSuite(@Body() payload: any) {
    // const workflowInfo =
    //   await this.githubGraphqlService.getRepositoryWorkflowInfo(
    //     payload.repository.owner.login,
    //     payload.repository.name,
    //   );
    // console.log(
    //   '***WORKFLOWINFO***',
    //   workflowInfo[2]?.workflowRun?.workflow,
    //   workflowInfo[2]?.workflowRun?.checkSuite,
    // );
    if (payload.pull_request) {
      console.log('**PAYLOAD PR**', payload.pull_request.id);
    }

    if (payload.check_suite) {
      console.log('**PAYLOAD CHECKSUITE**', payload.check_suite.pull_requests);
      console.log(
        '**INFO FOR MUTATION**',
        payload.repository.owner.login,
        payload.repository.name,
        payload.check_suite.pull_requests[0].head.sha,
      );
      const blockPR = await this.githubGraphqlService.updatePrMergeability(
        payload.repository.owner.login,
        payload.repository.name,
        payload.check_suite.pull_requests[0].head.sha,
        'error',
      );
      console.log('blockPR??', blockPR);
    }
    return;
  }
}
