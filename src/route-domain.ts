import * as core from '@actions/core'
import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandOutput,
  Route53Client,
  RRType,
} from '@aws-sdk/client-route-53'

interface ChangeDomainParams {
  action: ChangeAction
  name: string
  type: RRType
  dnsRecord: string
  zoneId: string
}

export default async function routeDomain(
  params: ChangeDomainParams,
): Promise<ChangeResourceRecordSetsCommandOutput> {
  const client = new Route53Client({})

  const command = new ChangeResourceRecordSetsCommand({
    ChangeBatch: {
      Changes: [
        {
          Action: params.action,
          ResourceRecordSet: {
            Name: params.name,
            Type: params.type,
            TTL: 300,
            ResourceRecords: [{ Value: params.dnsRecord }],
          },
        },
      ],
    },
    HostedZoneId: params.zoneId,
  })

  return client.send(command)
}

async function run(): Promise<void> {
  const options = { required: true }

  const action = core.getInput('action', options).toUpperCase() as ChangeAction
  const name = core.getInput('name', options)
  const type = core.getInput('type', options).toUpperCase() as RRType
  const dnsRecord = core.getInput('dns-record', options)
  const zoneId = core.getInput('zone-id', options)

  try {
    const output = await routeDomain({
      action,
      name,
      type,
      dnsRecord,
      zoneId,
    })
    core.setOutput('output', output)
  } catch (error) {
    core.setFailed(error)
  }
}

run()
