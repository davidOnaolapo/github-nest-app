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

  async getRepositoryIssues() {
    const query = `
    query () {
        repository(owner: "davidOnaolapo", name: "github-nest-app") {
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
    return result;
  }
}
