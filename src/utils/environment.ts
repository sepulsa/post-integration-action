import * as core from '@actions/core'
import * as github from '@actions/github'
import {RequestError} from '@octokit/request-error'

export default async function deleteEnvironment(token: string, key: string): Promise<number> {
  const octokit = github.getOctokit(token, {
    log: {
      debug: core.debug,
      info: core.info,
      warn: core.warning,
      error: core.error
    }
  })

  try {
    const {status} = await octokit.rest.repos.deleteAnEnvironment({
      environment_name: `staging:${key}`,
      ...github.context.repo
    })
    return status
  } catch (error) {
    if (error instanceof Error) core.warning(error)
    if (error instanceof RequestError) return error.status

    throw error
  }
}
