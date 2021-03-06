import * as core from '@actions/core'
import {prereleaseTagFromKey, releaseTagFromPrerelease} from './utils/tag'
import State from './utils/state'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key', {required: true}).toUpperCase()
    const prereleaseTag = await prereleaseTagFromKey(key)
    if (prereleaseTag === undefined) {
      core.setFailed("Can't find prerelease tag")
      return
    }
    const releaseTag = releaseTagFromPrerelease(prereleaseTag)

    core.saveState(State.KEY, key)
    core.saveState(State.PRERELEASE_TAG, prereleaseTag)
    core.saveState(State.RELEASE_TAG, releaseTag)

    core.setOutput('tag', releaseTag)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
