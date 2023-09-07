import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/core';
@Injectable()
export class AppService {
  private graphqlWithAuth: any;
  private octokitRestService: any;
  private owner = 'davidOnaolapo';
  private repository = 'github-nest-app';

  constructor() {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${process.env.GITHUB_WEBHOOK_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    this.octokitRestService = new Octokit({
      auth: process.env.GITHUB_WEBHOOK_TOKEN,
    });
  }

  async updatePullRequestStatus(prNumber: number) {
    console.log('****UPDATING STATUS ON PR***', prNumber);
    const prInfo = await this.getPrInfo(prNumber);
    const prSha = this.getPrSha(prInfo);
    console.log('**prInfo***', prInfo);
    console.log('**isHotfix***', this.isHotfix(prInfo));

    if (this.isHotfix(prInfo)) {
      this.setStatusCheck(prSha, 'success');
    } else {
      this.setStatusCheck(prSha, this.getPrStatus(prInfo));
    }
  }

  isHotfix(prInfo) {
    console.log(prInfo.labels.nodes);
    return prInfo.labels.nodes.some((l) => l.name.toLowerCase() === 'hotfix');
  }

  getPrSha(prInfo) {
    return prInfo.commits.nodes[0].commit.oid;
  }

  getPrStatus(prInfo) {
    const checkRuns = prInfo.commits.nodes[0].commit.checkSuites.nodes.reduce(
      (arr, cs) => {
        arr = arr.concat(cs.checkRuns.nodes);
        return arr;
      },
      [],
    );
    console.log('chekRuns', checkRuns);
    const hasFailure = checkRuns.some(
      (cr) => cr.conclusion?.toLowerCase() === 'failure',
    );
    console.log('*git*HAS FAILURE?***', hasFailure);
    if (hasFailure) return 'failure';

    const allComplete = checkRuns.every(
      (cr) => cr.status.toLowerCase() === 'completed',
    );
    console.log('***ALL COMPLETE?**', allComplete);

    return allComplete ? 'success' : 'pending';
  }

  async getPrInfo(prNumber: number) {
    const query = `
    {
      repository(owner: "${this.owner}", name: "${this.repository}") {
        pullRequest(number: ${prNumber}) {
          id
          title
          commits(last: 1) {
            nodes {
              url
              id
              commit {
                message
                oid
                checkSuites(first: 100) {
                  nodes {
                    checkRuns(first: 100) {
                      nodes {
                        status
                        conclusion
                        name
                        detailsUrl
                      }
                    }
                  }
                }
              }
            }
          }
          labels(first: 100) {
            nodes {
              name
            }
          }
        }
      }
    }
    `;
    const result = await this.graphqlWithAuth(query);
    return result.repository.pullRequest;
  }

  async setStatusCheck(commit_sha: string, state: string) {
    console.log('**SETTING COMMIT SHA TO***', commit_sha, state);
    try {
      const updatePr = await this.octokitRestService.request(
        `POST /repos/${this.owner}/${this.repository}/statuses/${commit_sha}`,
        {
          owner: `${this.owner}`,
          repo: `${this.repository}`,
          sha: `${commit_sha}`,
          state: `${state}`,
          description: 'At least one of the workflows failed!',
          context: 'continuous-integration/enabling',
          headers: {
            'Content-Type': 'application/vnd.github+json',
          },
        },
      );
      return updatePr;
    } catch (error) {
      console.error('Error updating PR mergeability:', error.message);
    }
  }
}
