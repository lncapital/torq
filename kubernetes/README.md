![Torq - Banner](./docs/images/readme-banner.png)

# Torq

Torq Kubernetes CRD files are work-in-progress example template files.

Files that require custom modifications are:
 - bitcoin-core.yaml: \<rpc-auth\>
 - cluster-issuer.yaml: \<Email-Address\>
 - lnd-postgres-configmap.yaml: \<lnd-postgres-user\> and \<lnd-postgres-pass\>
 - lnd.yaml: \<RPC-Password\>, \<RPC-User\>, \<lnd-postgres-user\> and \<lnd-postgres-pass\>
 - torq-ingress.yaml: \<Public-URL\>
 - torq-postgres-configmap.yaml: \<torq-user\> and \<torq-pass\>
 - torq.yaml: \<torq-user\> and \<torq-pass\>

# Secret creation

`kubectl create configmap lnd-tls.cert --from-file=/path/to/lnd/tls.cert`

`kubectl create configmap lnd-admin.macaroon --from-file=/home/kobe/lnd/admin.macaroon`

# TODO

Convert more things to secrets.

## Help and feedback

Join our [Telegram group](https://t.me/joinchat/V-Dks6zjBK4xZWY0) if you need help getting started.
Feel free to ping us in the telegram group if you have any feature request or feedback.  We would also love to hear your ideas for features or any other feedback you might have.
