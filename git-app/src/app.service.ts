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
    query ($owner: String!, $repo: String!, $branch: String!) {
        repository(owner: ${owner}, name: ${repo}) {
          workflowRuns(first: 10, status: "in_progress", branch: ${branch}) {
            nodes {
              id
              name
              workflow: workflow {
                name
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
