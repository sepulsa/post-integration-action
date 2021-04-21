import * as core from '@actions/core'
import * as github from '@actions/github'

export async function deleteEnvironment(
  token: string,
  key: string
): Promise<number> {
  const octokit = github.getOctokit(token, {
    log: {
      debug: core.debug,
      info: core.info,
      warn: core.warning,
      error: core.error
    }
  })

  try {
    const {status} = await octokit.repos.deleteAnEnvironment({
      environment_name: `staging:${key}`,
      ...github.context.repo
    })
    return status
  } catch (error) {
    core.warning(error)
    return error.status
  }
}
