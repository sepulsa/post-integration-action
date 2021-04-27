import * as core from '@actions/core'
import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  ChangeResourceRecordSetsCommandOutput,
  Route53Client,
  RRType,
} from '@aws-sdk/client-route-53'
import * as ingress from './ingress'

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

  const ingressName = core.getInput('ingress-name', options)
  const ingressNamespace = core.getInput('ingress-namespace', options)
  let servicePort: string | number

  try {
    switch (action) {
      case 'CREATE':
        servicePort = core.getInput('ingress-service-port', options)
        core.setOutput(
          'ingress',
          await ingress.createIngress({
            name: ingressName,
            namespace: ingressNamespace,
            whitelistIp: core.getInput('ingress-whitelist-ip', options),
            host: name,
            serviceName: core.getInput('ingress-service-name', options),
            servicePort: Number(servicePort) || servicePort,
            limitBurstMultiplier: core.getInput('ingress-limit-burst-multiplier'),
            limitConnections: core.getInput('ingress-limit-connections'),
            limitRps: core.getInput('ingress-limit-rps'),
            secretName: core.getInput('tls-secret-name'),
          }),
        )
        break

      case 'DELETE':
        core.setOutput('ingress', await ingress.deleteIngress(ingressName, ingressNamespace))
        break

      case 'UPSERT':
      default:
        break
    }

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
