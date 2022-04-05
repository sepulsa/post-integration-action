import * as core from '@actions/core'
import State from './utils/state'
import findKey from './utils/find-key'
import {prereleaseTag} from './utils/tag'

async function run(): Promise<void> {
  try {
    const key = findKey(core.getInput('branch', {required: true}))
    if (key === undefined) {
      core.info("Can't find JIRA issue key")
      return
    }
    const tag = await core.group('Get prerelease tag', async () => prereleaseTag())

    core.saveState(State.KEY, key)
    core.saveState(State.TAG, tag)
    core.setOutput('key', key)
    core.setOutput('tag', tag)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
