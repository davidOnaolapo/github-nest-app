import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';

@Injectable()
export class AppService {
  private graphqlWithAuth: any; // You can define a type here

  constructor() {
    console.log('**hmm**', process.env.GITHUB_WEBHOOK_TOKEN);
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: process.env.GITHUB_WEBHOOK_TOKEN, // Replace with your token
      },
    });
  }

  async getRepositoryIssues() {
    const query = `
      {
        repository(owner: "octokit", name: "graphql.js") {
          issues(last: 3) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query);
    return result.repository.issues.edges.map((edge: any) => edge.node.title);
  }
}
