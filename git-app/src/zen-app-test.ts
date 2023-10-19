// import { Injectable, OnModuleInit, Logger as NestLogger } from "@nestjs/common"
// import { graphql } from "@octokit/graphql"
// import { Octokit } from "@octokit/core"
// import { createAppAuth } from "@octokit/auth-app"
// import { Cron } from "@nestjs/schedule"
// import { loggerTags } from "@zen/types"

// import {
//   CheckRuns,
//   ControlledLabels,
//   PrConclusionOptions,
//   PrInfo,
//   PrStatusOptions,
//   GithubAppAuth,
//   ExternalIntegrationContexts,
// } from "./pr-status-checker.types"

// @Injectable()
// export class PrStatusCheckerService implements OnModuleInit {
//   private graphqlWithAuth: any
//   private octokitRestService: any
//   private owner: string
//   private repository: string
//   private loggerTag: string
//   private githubAppAuth: GithubAppAuth
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
//   }`

//   onModuleInit() {
//     this.refreshPrChecker()
//   }

//   constructor() {
//     this.graphqlWithAuth = graphql.defaults({
//       headers: {
//         authorization: `token ${process.env.GITHUB_WEBHOOK_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     })
//     this.octokitRestService = new Octokit({
//       auth: process.env.GITHUB_WEBHOOK_TOKEN,
//     })
//     this.owner = `davidOnaolapo`
//     this.repository = `github-nest-app`
//     this.loggerTag = `${loggerTags.teams.enabling} PR Checker`
//   }

//   async updatePullRequestStatus(prNumber: number) {
//     const prInfo: PrInfo = await this.getPrInfo(prNumber)
//     const prSha = this.getPrSha(prInfo)
//     console.log("**PrInfoEXTERNAL**", prInfo.commits.nodes[0]?.commit?.status)
//     this.setPrCheckerStatus(prSha, this.getFinalStatus(prInfo))
//   }

//   getFinalStatus(prInfo: any) {
//     if (this.isHotfix(prInfo)) {
//       return PrConclusionOptions.Success
//     } else {
//       return this.getPrStatus(prInfo)
//     }
//   }

//   @Cron("*/1 * * * *")
//   async refreshPrChecker() {
//     const allOpenPrs = await this.getAllOpenPrs()
//     console.log("**NO OF ALL OPEN PRS**", allOpenPrs.length)
//     allOpenPrs.forEach(async (pr) => {
//       const prSha = this.getPrSha(pr)
//       const prFinalStatus = this.getFinalStatus(pr)
//       const prCheckerStatus = this.getPrCheckerStatus(pr)
//       NestLogger.log(
//         `${this.loggerTag} Attempt to refresh Prs:`,
//         `PR_NO - ${pr.number} PR_CHECKER_STATUS - ${prCheckerStatus} PR_FINAL_STATUS - ${prFinalStatus}`,
//       )
//       if (prCheckerStatus !== prFinalStatus) {
//         console.log(`***WE ARE GONNA REFRESH ${pr.number}***`)
//         this.setPrCheckerStatus(prSha, prFinalStatus)
//       }
//       console.log("#@! PR DONE #@!")
//     })
//     console.log(
//       "****************#@! EXITING REFRESHER #@!*********************",
//     )
//   }

//   isHotfix(prInfo: PrInfo) {
//     return prInfo.labels.nodes.some(
//       (label) => label.name.toLowerCase() === ControlledLabels.Hotfix,
//     )
//   }

//   isTestingPR(prInfo: PrInfo) {
//     return prInfo.labels.nodes.some(
//       (label) => label.name.toLowerCase() === ControlledLabels.Testing,
//     )
//   }

//   getPrSha(prInfo: PrInfo) {
//     return prInfo.commits.nodes[0].commit.oid
//   }

//   getPrStatus(prInfo: PrInfo) {
//     const prCommit = prInfo.commits.nodes[0].commit

//     const repoWorkflows: CheckRuns = prCommit.checkSuites.nodes.reduce(
//       (arr, checkSuite) => {
//         arr = arr.concat(checkSuite.checkRuns.nodes)
//         return arr
//       },
//       [],
//     )

//     const repoWorkflowsHaveFailure = repoWorkflows.some(
//       (checkRun) =>
//         checkRun.conclusion?.toLowerCase() === PrConclusionOptions.Failure,
//     )
//     const repoWorkflowsComplete = repoWorkflows.every(
//       (checkRun) => checkRun.status.toLowerCase() === PrStatusOptions.Completed,
//     )

//     const externalIntegrations = prCommit.status?.contexts
//     const externalIntegrationsHaveFailure = externalIntegrations?.some(
//       (context) => context.state?.toLowerCase() === PrConclusionOptions.Failure,
//     )
//     const externalIntegrationsComplete = externalIntegrations
//       ?.filter(
//         (context) =>
//           context.context !== ExternalIntegrationContexts.EnablingPrChecker,
//       )
//       ?.every((context) => context.state !== PrStatusOptions.Pending)

//     const prHasFailure =
//       repoWorkflowsHaveFailure || externalIntegrationsHaveFailure
//     const prRunsAllComplete =
//       repoWorkflowsComplete && externalIntegrationsComplete

//     if (prHasFailure) return PrConclusionOptions.Failure

//     return prRunsAllComplete
//       ? PrConclusionOptions.Success
//       : PrStatusOptions.Pending
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
//     `
//     const result = await this.graphqlWithAuth(query)
//     return result.repository.pullRequest
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
//       `
//       const result = await this.graphqlWithAuth(query)
//       return result.repository.pullRequests.nodes
//     } catch (error) {
//       NestLogger.error("Error fetching all repo prs:", error.message)
//     }
//   }

//   getPrCheckerStatus(prInfo: PrInfo) {
//     return prInfo.commits.nodes[0].commit.status?.contexts
//       .find((x) => x.context === ExternalIntegrationContexts.EnablingPrChecker)
//       .state.toLowerCase()
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
//           context: ExternalIntegrationContexts.EnablingPrChecker,
//           headers: {
//             "Content-Type": "application/vnd.github+json",
//           },
//         },
//       )
//       return updatePrCheckerStatus
//     } catch (error) {
//       NestLogger.error(
//         `${this.loggerTag} Error updating PR mergeability:`,
//         error.message,
//       )
//     }
//   }
// }
