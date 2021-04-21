import {RequestError} from '@octokit/request-error'

type Params = {
  environment_name: string
  owner: string
  repo: string
}

export const getOctokit = jest.fn(() => {
  return {
    repos: {
      deleteAnEnvironment: jest.fn((params: Params) => {
        switch (params.environment_name) {
          case 'staging:JIRA-404':
            throw new RequestError('', 404, {
              request: {
                method: 'DELETE',
                url: '',
                headers: {}
              }
            })

          case 'staging:JIRA-204':
            return {
              status: 204
            }
        }
      })
    }
  }
})

export const context = {
  repo: {
    owner: '',
    repo: ''
  }
}
