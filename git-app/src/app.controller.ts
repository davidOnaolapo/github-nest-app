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
    if (payload.pull_request) {
      console.log(
        '***PR COMMIT WORKFLOWS ABOUT TO RUN ***',
        payload.pull_request.id,
      );
    }

    if (payload.check_suite) {
      console.log('***A WORKFLOWW STATE CHANGED***');
      const workflowInfo =
        await this.githubGraphqlService.getRepositoryWorkflowInfo(
          payload.repository.owner.login,
          payload.repository.name,
        );
      console.log('***WORKFLOWINFO***');
      workflowInfo.forEach((theWorkFlow: any) => {
        console.log(
          theWorkFlow.workflowRun?.workflow,
          theWorkFlow.workflowRun?.checkSuite,
        );
      });
      const hasFailure = workflowInfo.some((theWorkflow: any) => {
        return theWorkflow.workflowRun?.checkSuite?.conclusion === 'FAILURE';
      });
      const allWorkflowsDone = workflowInfo.every((theWorkflow: any) => {
        return (
          theWorkflow.workflowRun?.checkSuite?.status === 'COMPLETED' ||
          undefined
        );
      });
      let statusForRepo: string;
      allWorkflowsDone && !hasFailure
        ? (statusForRepo = 'success')
        : hasFailure
        ? (statusForRepo = 'failure')
        : (statusForRepo = 'pending'),
        console.log('***STATUSFORREPO**', statusForRepo);
      await this.githubGraphqlService.updatePrMergeability(
        payload.repository.owner.login,
        payload.repository.name,
        payload.check_suite.pull_requests[0].head.sha,
        statusForRepo,
      );
    }
    return;
  }
}
