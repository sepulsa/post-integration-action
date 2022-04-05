import * as github from '@actions/github'
import {RequestError} from '@octokit/request-error'
import deleteEnvironment from '../src/utils/environment'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockReturnValue({
    rest: {
      repos: {
        deleteAnEnvironment: jest.fn()
      }
    }
  }),
  context: {
    repo: {
      owner: undefined,
      repo: undefined
    }
  }
}))

test('Delete invalid environment', async () => {
  const octokit = github.getOctokit('')
  jest.spyOn(octokit.rest.repos, 'deleteAnEnvironment').mockRejectedValue(
    new RequestError('', 404, {
      request: {
        method: 'DELETE',
        url: '',
        headers: {}
      }
    })
  )

  const key = 'JIRA-404'
  await expect(deleteEnvironment('', key)).resolves.toEqual(404)
})

test('Delete environment', async () => {
  const octokit = github.getOctokit('')
  jest.spyOn(octokit.rest.repos, 'deleteAnEnvironment').mockResolvedValue({
    headers: {},
    url: '',
    data: undefined as never,
    status: 204
  })

  const key = 'JIRA-204'
  await expect(deleteEnvironment('', key)).resolves.toEqual(204)
})
