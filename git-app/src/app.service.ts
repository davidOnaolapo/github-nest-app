import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';

@Injectable()
export class AppService {
  private graphqlWithAuth: any; // You can define a type here

  constructor() {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${process.env.GITHUB_WEBHOOK_TOKEN}`, // Replace with your token
      },
    });
  }

  async getRepositoryIssues(owner: string, repo: string, branch: string) {
    const query = `
    query {
        repository(owner: "${owner}", name: "${repo}") {
          pullRequests(headRefName: "${branch}", first: 1) {
            nodes {
              commits(last: 1) {
                nodes {
                  commit {
                    oid
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query);
    return result.workflowRuns;
  }
}
