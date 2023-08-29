import { Injectable } from '@nestjs/common';
import { graphql } from '@octokit/graphql';

@Injectable()
export class AppService {
  private graphqlWithAuth: any; // You can define a type here

  constructor() {
    this.graphqlWithAuth = graphql.defaults({
      headers: {
        authorization: `token ${process.env.GITHUB_WEBHOOK_TOKEN}`, // Replace with your token
        'Content-Type': 'application/json',
      },
    });
  }

  async getRepositoryIssues() {
    const query = `
   {
      repository(owner: "davidOnaolapo", name: "github-nest-app") {
          pullRequests(headRefName: "test-pr-trigger", first: 1) {
              nodes {
                headRef {
                  name
                  target {
                    ... on Commit {
                      history(first: 1) {
                        nodes {
                          oid
                          message
                          author {
                            name
                            email
                            date
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
    return result.repository.pullRequests.nodes;
  }
}
