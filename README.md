# Post-Integration Action

## Prerelease

This action output JIRA issue key and prerelease tag based on Pull Request branch.

### Inputs
|Input|Required|Default|Description|
|---|:---:|---|---|
|`branch`|✅| |Branch name, must contain JIRA issue key|
|`push`|✅|`true`|Push tags if `true`|

### Outputs
|Output|Description|
|------|---|
|`key`|JIRA issue key|
|`tag`|Prerelease tag|

### Example usage

```yaml
uses: sepulsa/post-integration-action/prerelease@main
with:
  branch: ${{ github.head_ref }}
```

## Release

This action output release tag based on JIRA Issue key.

### Inputs
|Input|Required|Description|
|---|:---:|---|
|`key`|✅|JIRA issue key|
|`token`|✅|Github Personal Access Token with permission to delete environment|

### Outputs
|Output|Description|
|------|---|
|`tag`|Release tag|

### Example usage

```yaml
- uses: actions/checkout@v2
  with:
    ref: ${{ github.event.inputs.key }}
    fetch-depth: 0
- uses: sepulsa/post-integration-action/release@main
  with:
    key: ${{ github.event.inputs.key }}
    token: ${{ secrets.RELEASE_TOKEN }}
```

## Create Ingress
This action creates a kubernetes ingress.

### Inputs
|Input|Required|Description|
|---|:---:|---|
|`name`|✅|A client-provided string that refers to an object in a resource URL|
|`namespace`|✅|Namespace defines the space within which each name must be unique|
|`whitelist-ip`|✅|Whitelist source range|
|`host`|✅|Fully qualified domain name of a network host, as defined by RFC 3986|
|`service-name`|✅|Name of the referenced service|
|`service-port`|✅|Port of the referenced service|
|`limit-burst-multiplier`| |Multiplier of the limit rate for burst size|
|`limit-connections`| |Number of concurrent connections allowed from a single IP address|
|`limit-rps`| |Number of requests accepted from a given IP each second|
|`secret-name`| |Name of the secret used to terminate TLS traffic on port 443|

### Outputs
|Output|Description|
|------|---|
|`ingress`|Ingress response from kubernetes|

### Example usage

#### AWS EKS

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-southeast-1
- name: Create kubeconfig
  run: aws eks --region $AWS_REGION update-kubeconfig --name $CLUSTER_NAME

- uses: sepulsa/post-integration-action/create-ingress@ingress-standalone
  with:
    name: admin
    namespace: default
    whitelist-ip: 10.0.0.0/24,172.10.0.1
    host: admin.example.com
    service-name: service
    service-port: 443
```

#### GCP GKE
```yaml
- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v0.2
  with:
    project_id: ${{ secrets.GCP_PROJECT_ID }}
    service_account_key: ${{ secrets.GCP_SA_KEY }}
    export_default_credentials: true
- id: get-credentials
  uses: google-github-actions/get-gke-credentials@v0.3
  with:
    cluster_name: $GKE_CLUSTER
    location: $GKE_REGION

- uses: sepulsa/post-integration-action/create-ingress@ingress-standalone
  with:
    name: admin
    namespace: default
    whitelist-ip: 10.0.0.0/24,172.10.0.1
    host: admin.example.com
    service-name: service
    service-port: 443
```

## Route Domain

This action `CREATE` or `DELETE` dns record.

### Inputs
|Input|Required|Description|
|---|:---:|---|
|`action`|✅|The action to perform. One of `CREATE`, `DELETE`, or `UPSERT`|
|`name`|✅|Fully  qualified  domain  name|
|`type`|✅|The DNS record type|
|`dns-record`|✅|The current or new DNS  record  value|
|`zone-id`|✅|The ID of the hosted zone that contains the resource record sets that you want to change|

Valid  values for DNS record `type`: **A** | **AAAA** | **CAA** | **CNAME** | **DS** | **MX** | **NAPTR** | **NS** | **PTR** | **SOA** | **SPF** | **SRV** | **TX**

### Outputs
|Output|Description|
|------|---|
|`route`|A complex type that contains information about changes made to your hosted zone|

### Example usage

```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ap-southeast-1
- id: create-domain
  uses: sepulsa/post-integration-action/route-domain@main
  with:
    action: CREATE
    name: admin.example.com
    type: CNAME
    dns-record: ns.example.com
    zone-id: ZONEID
- id: delete-domain
  uses: sepulsa/post-integration-action/route-domain@main
  with:
    action: DELETE
    name: admin.example.com
    type: CNAME
    dns-record: ns.example.com
    zone-id: ZONEID
```
