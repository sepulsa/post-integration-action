import * as core from '@actions/core'
import * as ingress from '../ingress'

async function run(): Promise<void> {
  const options = { required: true }

  const name = core.getInput('name', options)
  const namespace = core.getInput('namespace', options)
  const whitelistIp = core.getInput('whitelist-ip', options)
  const host = core.getInput('host', options)
  const serviceName = core.getInput('service-name', options)
  const servicePort = core.getInput('service-port', options)
  const limitBurstMultiplier = core.getInput('limit-burst-multiplier') || undefined
  const limitConnections = core.getInput('limit-connections') || undefined
  const limitRps = core.getInput('limit-rps') || undefined
  const secretName = core.getInput('tls-secret-name') || undefined

  try {
    const params = {
      name,
      namespace,
      whitelistIp,
      host,
      serviceName,
      servicePort: Number(servicePort) || servicePort,
      limitBurstMultiplier,
      limitConnections,
      limitRps,
      secretName,
    }
    core.setOutput('ingress', await ingress.createIngress(params))
  } catch (e) {
    core.setFailed(e)
  }
}

run()
