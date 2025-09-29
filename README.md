
# @bacnet-js/device

A TypeScript library for implementing BACnet/IP devices in Node.js.

## Status

Under heavy development as of June 2025.

This project was started by [Jacopo Scazzosi] ([@jacoscaz]), who continues
to maintain it, halfway through 2025. However, just a few weeks after the first
alpha release, it was then moved to the newly-created [bacnet-js] organization,
together with primary dependency [@bacnet-js/client]. By putting our heads
together we hope to create a robust, modular, cohesive ecosystem for BACnet
applications in Node.js.

Interested in the intersection of BACnet and Node.js? [Come visit us][bacnet-js]!

## Characteristics

This library provides a high-level API that simplifies the instantiation and
management of BACnet objects by abstracting network operations (subscription
management, CoV propagation, value updates) and accurately modelling BACnet's
object types through dedicated classes that automatically instantiate all
properties required by the BACnet specification.

1. **Detailed types**: ships well-defined interfaces and classes to surface
   BACnet's complex data structures at the typings level.
2. **Separation of concerns**: maintains separate classes for BACnet objects,
   properties, and network operations, loosely coupled via events.
3. **Backpressure management**: operations return Promises that resolve only
   after full processing and acknowledgment, creating natural throttling; for
   example, COV notifications wait for subscriber confirmation before processing
   the next change.
4. **Object-level transactions**: access to property values, whether by other
   devices in the BACnet network or by consumers of this library, are processed
   through per-object FIFO queues to maintain consistency and prevent race
   conditions.

This library is built on top of the wonderful [@bacnet-js/client], a TypeScript
implementation of BACnet's protocol. Any improvement that is applicable to
[@bacnet-js/client] is contributed upstream.

## Documentation

- Source code: [https://github.com/bacnet-js/device][device]
- API documentation: [https://bacnet-js.github.io/device][apidocs].
- Conformance: see the [CONFORMANCE.md] file.

## License

This project is licensed under the MIT License - see the [LICENSE] file
for details.

## Usage

See the [examples] directory for working usage examples which you should be
able to run locally and use with any BACnet client of your choice. For local
testing I tend to use [YABE], which is native to Windows but can be made to
work reasonably well on macOS and Linux via [Wine].

## Testing

See [TESTING.md].


[device]: https://github.com/bacnet-js/device
[apidocs]: https://bacnet-js.github.io/device
[bacnet-js]: https://github.com/bacnet-js
[Jacopo Scazzosi]: https://github.com/jacoscaz
[@jacoscaz]: https://github.com/jacoscaz
[@bacnet-js/client]: https://github.com/bacnet-js/node-bacnet
[LICENSE]: https://github.com/bacnet-js/device/blob/main/LICENSE
[CONFORMANCE.md]: https://github.com/bacnet-js/device/blob/main/CONFORMANCE.md
[TESTING.md]: https://github.com/bacnet-js/device/blob/main/TESTING.md
[examples]: https://github.com/bacnet-js/device/tree/main/src/examples
[YABE]: https://sourceforge.net/projects/yetanotherbacnetexplorer/
[Wine]: https://www.winehq.org
