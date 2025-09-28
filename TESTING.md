
# Testing

## End-to-end tests

E2E tests use [bacnet-stack] as a third-party implementation of the BACnet
protocol.

The suite depends on Docker to run [bacnet-stack]'s CLI programs in a separate
container from that of the BACnet device implemented through this library. This
is necessary because, in practice, it's very hard to get different BACnet
devices to share the same network interface. Docker offers us an easy way to
ensure that each device runs on its dedicated (virtual) interface.

The image used for the [bacnet-stack] container, whose Dockerfile is located at
`./docker/docker-stack-server`, includes a simple HTTP server through which the
other container (which runs the test suite) can trigger BACnet queries.

```sh
sh e2e-tests-prep.sh
sh e2e-tests-run.sh
sh e2e-tests-clean.sh
```

[bacnet-stack]: https://github.com/bacnet-stack/bacnet-stack
