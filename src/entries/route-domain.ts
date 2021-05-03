import * as core from '@actions/core'
import { ChangeAction, RRType } from '@aws-sdk/client-route-53'
import changeRecord from '../change-record'

async function run(): Promise<void> {
  const options = { required: true }

  const accessKeyId = core.getInput('aws-access-key-id')
  const secretAccessKey = core.getInput('aws-secret-access-key')
  const region = core.getInput('aws-region')
  const action = core.getInput('action', options).toUpperCase() as ChangeAction
  const name = core.getInput('name', options)
  const type = core.getInput('type', options).toUpperCase() as RRType
  const dnsRecord = core.getInput('dns-record', options)
  const zoneId = core.getInput('zone-id', options)

  try {
    const output = await changeRecord({
      accessKeyId,
      secretAccessKey,
      region,
      action,
      name,
      type,
      dnsRecord,
      zoneId,
    })
    core.setOutput('route', output)
  } catch (error) {
    core.setFailed(error)
  }
}

run()
