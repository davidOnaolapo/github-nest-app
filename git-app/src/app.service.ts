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
                  commits(last: 1) {
                    nodes {
                        commit {
                          message
                          author {
                            name
                            email
                            date
                          }
                        }
                      }
                      headRef {
                        name
                        repository {
                          workflows {
                            nodes {
                              name
                              runs(first: 10, status: "in_progress") {
                                nodes {
                                  id
                                  name
                                  status
                                  conclusion
                                  workflow {
                                    name
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
    return result;
  }
}
