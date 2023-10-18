// import { Injectable, OnModuleInit, Logger as NestLogger } from '@nestjs/common';
// import { graphql } from '@octokit/graphql';
// import { Octokit } from '@octokit/core';
// import { createAppAuth } from '@octokit/auth-app';
// import { Cron } from '@nestjs/schedule';

// import {
//   CheckRuns,
//   ControlledLabels,
//   PrConclusionOptions,
//   PrInfo,
//   PrStatusOptions,
//   GithubAppAuth,
// } from './pr-status-checker.types';

// @Injectable()
// export class PrStatusCheckerService implements OnModuleInit {
//   private graphqlWithAuth: any;
//   private octokitRestService: any;
//   private owner: string;
//   private repository: string;
//   private githubAppAuth: GithubAppAuth;
//   private pullRequestFragment = `id
//   title
//   number
//   commits(last: 1) {
//     nodes {
//       url
//       id
//       commit {
//         message
//         oid
//         status {
//           contexts {
//             context
//             state
//           }
//         }
//         checkSuites(first: 50) {
//           nodes {
//             checkRuns(first: 50) {
//               nodes {
//                 status
//                 conclusion
//                 name
//                 detailsUrl
//               }
//             }
//           }
//         }
//       }
//     }
//   }
//   labels(first: 100) {
//     nodes {
//       name
//     }
//   }`;

//   onModuleInit() {
//     this.refreshPrChecker();
//   }

//   constructor() {
//     this.graphqlWithAuth = graphql.defaults({
//       headers: {
//         authorization: `token ${process.env.GITHUB_WEBHOOK_TOKEN}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     this.octokitRestService = new Octokit({
//       auth: process.env.GITHUB_WEBHOOK_TOKEN,
//     });
//     this.owner = `davidOnaolapo`;
//     this.repository = `github-nest-app`;
//   }

//   async updatePullRequestStatus(prNumber: number) {
//     const prInfo: PrInfo = await this.getPrInfo(prNumber);
//     const prSha = this.getPrSha(prInfo);
//     console.log();
//     this.setPrCheckerStatus(prSha, this.getFinalStatus(prInfo));
//   }

//   getFinalStatus(prInfo: any) {
//     if (this.isHotfix(prInfo)) {
//       return PrConclusionOptions.Success;
//     } else {
//       return this.getPrStatus(prInfo);
//     }
//   }

//   @Cron('*/1 * * * *')
//   async refreshPrChecker() {
//     const allOpenPrs = await this.getAllOpenPrs();
//     console.log('**NO OF ALL OPEN PRS**', allOpenPrs.length);
//     allOpenPrs.forEach(async (pr) => {
//       const prSha = this.getPrSha(pr);
//       const prFinalStatus = this.getFinalStatus(pr);
//       const prCheckerStatus = this.getPrCheckerStatus(pr);

//       console.log(
//         `*** \nPR_NO: ${pr.number}\n PR_CHECKER_STATUS: ${prCheckerStatus}\n PR_FINAL_STATUS: ${prFinalStatus}\n***`,
//       );
//       if (prCheckerStatus !== prFinalStatus) {
//         console.log(`***WE ARE GONNA REFRESH ${pr.number}***`);
//         this.setPrCheckerStatus(prSha, prFinalStatus);
//       }
//       console.log('#@! PR DONE #@!');
//     });
//     console.log(
//       '****************#@! EXITING REFRESHER #@!*********************',
//     );
//   }

//   isHotfix(prInfo: PrInfo) {
//     return prInfo.labels.nodes.some(
//       (label) => label.name.toLowerCase() === ControlledLabels.Hotfix,
//     );
//   }

//   isTestingPR(prInfo: PrInfo) {
//     return prInfo.labels.nodes.some(
//       (label) => label.name.toLowerCase() === ControlledLabels.Testing,
//     );
//   }

//   getPrSha(prInfo: PrInfo) {
//     return prInfo.commits.nodes[0].commit.oid;
//   }

//   getPrStatus(prInfo: PrInfo) {
//     const checkRuns: CheckRuns =
//       prInfo.commits.nodes[0].commit.checkSuites.nodes.reduce(
//         (arr, checkSuite) => {
//           arr = arr.concat(checkSuite.checkRuns.nodes);
//           return arr;
//         },
//         [],
//       );

//     const hasFailure = checkRuns.some(
//       (checkRun) =>
//         checkRun.conclusion?.toLowerCase() === PrConclusionOptions.Failure,
//     );
//     if (hasFailure) return PrConclusionOptions.Failure;

//     const allComplete = checkRuns.every(
//       (checkRun) => checkRun.status.toLowerCase() === PrStatusOptions.Completed,
//     );

//     return allComplete ? PrConclusionOptions.Success : PrStatusOptions.Pending;
//   }

//   async getPrInfo(prNumber: number) {
//     const query = `
//     {
//       repository(owner: "${this.owner}", name: "${this.repository}") {
//         pullRequest(number: ${prNumber}) {
//           ${this.pullRequestFragment}
//         }
//       }
//     }
//     `;
//     const result = await this.graphqlWithAuth(query);
//     return result.repository.pullRequest;
//   }

//   async getAllOpenPrs() {
//     try {
//       const query = `
//       {
//         repository(owner: "${this.owner}", name: "${this.repository}") {
//           pullRequests(states: OPEN, first: 100) {
//             nodes {
//               ${this.pullRequestFragment}
//             }
//           }
//         }
//       }
//       `;
//       const result = await this.graphqlWithAuth(query);
//       return result.repository.pullRequests.nodes;
//     } catch (error) {
//       NestLogger.error('Error fetching all repo prs:', error.message);
//     }
//   }

//   getPrCheckerStatus(prInfo: PrInfo) {
//     return prInfo.commits.nodes[0].commit.status?.contexts
//       .find((x) => x.context === 'Enabling - PR Merge Status')
//       .state.toLowerCase();
//   }

//   async setPrCheckerStatus(commitSha: string, state: string) {
//     try {
//       const updatePrCheckerStatus = await this.octokitRestService.request(
//         `POST /repos/${this.owner}/${this.repository}/statuses/${commitSha}`,
//         {
//           owner: `${this.owner}`,
//           repo: `${this.repository}`,
//           sha: `${commitSha}`,
//           state: `${state}`,
//           context: 'Enabling - PR Merge Status',
//           headers: {
//             'Content-Type': 'application/vnd.github+json',
//           },
//         },
//       );
//       return updatePrCheckerStatus;
//     } catch (error) {
//       NestLogger.error('Error updating PR mergeability:', error.message);
//     }
//   }
// }
