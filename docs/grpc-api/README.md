### Torq grpc is an _experimental_ feature that allows to use Torq via grpc.

- To enable: add a flag --customize.grpc or `grpc = true` under [customize] section in the configuration file.
- In Torq settings enable the grpc and set the port.
- "Node handles" are used in the grpc to identify the LN nodes connected to Torq. These are in the format implementation*TorqNodeId, for example \_LND_1*
  - Find the TorqNodeId by going to node settings and check the number in the URL.
