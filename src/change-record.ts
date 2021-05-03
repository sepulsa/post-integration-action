import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandOutput,
  Route53Client,
  RRType,
} from '@aws-sdk/client-route-53'
import { Credentials } from '@aws-sdk/types'

interface ChangeDomainParams {
  action: ChangeAction
  name: string
  type: RRType
  dnsRecord: string
  zoneId: string
  accessKeyId?: string
  secretAccessKey?: string
  region?: string
}

export default async function changeRecord(
  params: ChangeDomainParams,
): Promise<ChangeResourceRecordSetsCommandOutput> {
  let credentials: Credentials | undefined
  if (params.accessKeyId && params.secretAccessKey) {
    credentials = {
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey,
    }
  }
  const client = new Route53Client({
    credentials,
    region: params.region,
  })

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
