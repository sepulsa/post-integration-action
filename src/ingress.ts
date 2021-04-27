import {
  KubeConfig,
  NetworkingV1beta1Api,
  NetworkingV1beta1Ingress,
  NetworkingV1beta1IngressSpec,
  V1Status,
} from '@kubernetes/client-node'

interface CreateIngressParams {
  name: string
  namespace: string
  whitelistIp: string
  host: string
  serviceName: string
  servicePort: string | number
  limitBurstMultiplier?: string
  limitConnections?: string
  limitRps?: string
  secretName?: string
}

function makeApiClient(): NetworkingV1beta1Api {
  const kc = new KubeConfig()
  kc.loadFromDefault()

  return kc.makeApiClient(NetworkingV1beta1Api)
}

function getAnnotations(params: CreateIngressParams): { [key: string]: string } {
  const { whitelistIp, limitBurstMultiplier, limitConnections, limitRps } = params

  const snippets = [
    'server_tokens off;',
    'add_header X-XSS-Protection "1; mode=block";',
    'add_header X-Content-Type-Options nosniff;',
  ]

  const annotations: { [key: string]: string } = {
    'kubernetes.io/ingress.class': 'nginx',
    'kubernetes.io/ingress.allow-http': 'false',
    'nginx.ingress.kubernetes.io/configuration-snippet': snippets.join('\n'),
    'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
    'nginx.ingress.kubernetes.io/whitelist-source-range': whitelistIp,
    'proxy-protocol': 'True',
  }
  if (limitBurstMultiplier) {
    annotations['nginx.ingress.kubernetes.io/limit-burst-multiplier'] = limitBurstMultiplier
  }
  if (limitConnections) {
    annotations['nginx.ingress.kubernetes.io/limit-connections'] = limitConnections
  }
  if (limitRps) {
    annotations['nginx.ingress.kubernetes.io/limit-rps'] = limitRps
  }

  return annotations
}

export async function createIngress(
  params: CreateIngressParams,
): Promise<NetworkingV1beta1Ingress> {
  const { name, namespace, host, serviceName, servicePort, secretName } = params

  const spec: NetworkingV1beta1IngressSpec = {
    rules: [
      {
        host,
        http: {
          paths: [
            {
              backend: {
                serviceName,
                servicePort,
              },
              path: '/',
            },
          ],
        },
      },
    ],
  }
  if (secretName) {
    spec.tls = [{ secretName }]
  }

  const body: NetworkingV1beta1Ingress = {
    apiVersion: 'networking.k8s.io/v1beta1',
    kind: 'Ingress',
    metadata: {
      name,
      namespace,
      labels: {
        app: namespace,
      },
      annotations: getAnnotations(params),
    },
    spec,
  }

  const k8sApi = makeApiClient()

  try {
    const response = await k8sApi.createNamespacedIngress(namespace, body)
    return response.body
  } catch (e) {
    if (e.response?.body?.reason && e.response?.body?.message) {
      const { reason, message } = e.response.body
      e.message = `${reason}: ${message}`
    }

    throw e
  }
}

export async function deleteIngress(name: string, namespace: string): Promise<V1Status> {
  const k8sApi = makeApiClient()
  try {
    const response = await k8sApi.deleteNamespacedIngress(name, namespace)
    return response.body
  } catch (e) {
    if (e.response?.body?.reason && e.response?.body?.message) {
      const { reason, message } = e.response.body
      e.message = `${reason}: ${message}`
    }

    throw e
  }
}
