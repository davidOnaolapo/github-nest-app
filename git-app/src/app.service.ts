import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/core';
@Injectable()
export class AppService {
  private graphqlWithAuth: any;
  private octokitRestService: any;

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

  async getRepositoryWorkflowInfo(owner: string, name: string) {
    const query = `
    {
      repository(owner: "${owner}", name: "${name}") {
        pullRequests(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            number
            commits(last: 1) {
              edges {
                node {
                  commit {
                    checkSuites(first: 5) {
                      nodes {
                        workflowRun {
                          url
                          workflow {
                            name
                            state
                          }
                          checkSuite {
                            conclusion
                            status
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `;
    const result = await this.graphqlWithAuth(query);
    return result.repository.pullRequests.nodes[0].commits.edges[0].node.commit
      .checkSuites.nodes;
  }

  async updatePrMergeability(
    owner: string,
    repo: string,
    commit_sha: string,
    state: string,
  ) {
    try {
      const updatePr = await this.octokitRestService.request(
        `POST /repos/${owner}/${repo}/statuses/${commit_sha}`,
        {
          owner: `${owner}`,
          repo: `${repo}`,
          sha: `${commit_sha}`,
          state: `${state}`,
          description: 'The build failed!',
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
