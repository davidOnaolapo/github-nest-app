import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/core';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';
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
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    this.octokitRestService = new MyOctokit({
      auth: process.env.GITHUB_WEBHOOK_SECRET,
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
      const updatePr = await this.octokitRestService.repos.createStatus({
        owner,
        repo,
        commit_sha,
        state,
      });
      return updatePr;
    } catch (error) {
      console.error('Error updating PR mergeability:', error.message);
    }
  }
}
