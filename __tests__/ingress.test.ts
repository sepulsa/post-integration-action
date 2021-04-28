import { HttpError, V1Status } from '@kubernetes/client-node'
import { Response } from 'request'
import * as ingress from '../src/ingress'

const mockMethod = jest.fn()

jest.mock('@kubernetes/client-node', () => {
  const actual = jest.requireActual('@kubernetes/client-node')
  actual.KubeConfig = jest.fn().mockImplementation(() => ({
    loadFromDefault: jest.fn(),
    makeApiClient: jest.fn().mockReturnValue(
      jest.fn().mockImplementation(() => ({
        createNamespacedIngress: mockMethod,
        deleteNamespacedIngress: mockMethod,
      }))(),
    ),
  }))
  return actual
})

interface OptionalParams {
  limitBurstMultiplier?: string
  limitConnections?: string
  limitRps?: string
  secretName?: string
}

const TEST_CASES: [string, OptionalParams][] = [
  ['required params only', {}],
  [
    'optional params',
    {
      limitBurstMultiplier: 'limitBurstMultiplier',
      limitConnections: 'limitConnections',
      limitRps: 'limitRps',
      secretName: 'secretName',
    },
  ],
]
test.concurrent.each(TEST_CASES)(
  'Create ingress: Resolved with %p',
  async (title, { limitBurstMultiplier, limitConnections, limitRps, secretName }) => {
    mockMethod.mockResolvedValue({ body: true })
    await expect(
      ingress.createIngress({
        name: 'name',
        namespace: 'namespace',
        whitelistIp: 'whitelistIp',
        host: 'host',
        serviceName: 'serviceName',
        servicePort: 'servicePort',
        limitBurstMultiplier,
        limitConnections,
        limitRps,
        secretName,
      }),
    ).resolves.toEqual(true)
  },
)

test('Create ingress: Rejected with no message HttpError', async () => {
  const response = {
    body: {},
  }
  const error = new HttpError(response as Response, {})
  mockMethod.mockRejectedValue(error)
  await expect(
    ingress.createIngress({
      name: 'name',
      namespace: 'namespace',
      whitelistIp: 'whitelistIp',
      host: 'host',
      serviceName: 'serviceName',
      servicePort: 'servicePort',
    }),
  ).rejects.toThrowError('HTTP request failed')
})

test('Delete Ingress: Resolved', async () => {
  mockMethod.mockResolvedValue({ body: true })
  await expect(ingress.deleteIngress('name', 'namespace')).resolves.toEqual(true)
})

test('Delete Ingress: Rejected non HttpError', async () => {
  mockMethod.mockRejectedValue(new Error())
  await expect(ingress.deleteIngress('name', 'namespace')).rejects.toThrow(Error)
})

test('Delete Ingress: Rejected with HttpError', async () => {
  const body: V1Status = {
    message: 'expected',
  }
  const response = {
    body,
  }
  const error = new HttpError(response as Response, {})
  mockMethod.mockRejectedValue(error)
  await expect(ingress.deleteIngress('name', 'namespace')).rejects.toThrowError('expected')
})
