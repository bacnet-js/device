# AGENTS.md

This file provides context for AI coding agents working on this project.

## Project overview

`@bacnet-js/device` is a TypeScript library for implementing BACnet/IP devices
in Node.js. It provides high-level abstractions for BACnet objects, properties,
and network operations, built on top of `@bacnet-js/client`.

BACnet (Building Automation and Control Networks) is a communication protocol
for building automation systems. This library models BACnet's object/property
hierarchy through dedicated TypeScript classes and manages network operations
such as CoV (Change of Value) notifications and subscription management.

## Repository layout

```
src/
├── index.ts                        # Public API surface — all exports
├── constants.ts                    # Shared constants
├── debug.ts                        # Debug logging setup (uses `debug` package)
├── errors.ts                       # BDError class (BACnet error codes/classes)
├── events.ts                       # AsyncEventEmitter base class
├── taskqueue.ts                    # Per-object FIFO task queue
├── uids.ts                         # UID helpers for objects and properties
├── utils.ts                        # Shared utilities
├── objects/
│   ├── generic/
│   │   └── object.ts               # BDObject — base class for all BACnet objects
│   ├── device/
│   │   ├── device.ts               # BDDevice — the root device object
│   │   ├── types.ts                # Device-related interfaces
│   │   ├── subscriptionstore.ts    # CoV subscription management
│   │   └── utils.ts                # Device-level helpers
│   ├── numeric/
│   │   ├── numeric.ts              # BDNumericObject — base for numeric types
│   │   ├── analogvalue.ts          # BDAnalogValue (REAL)
│   │   ├── analoginput.ts          # BDAnalogInput (extends AnalogValue)
│   │   ├── analogoutput.ts         # BDAnalogOutput (adds priority array)
│   │   ├── integervalue.ts         # BDIntegerValue (SIGNED_INTEGER)
│   │   └── positiveintegervalue.ts # BDPositiveIntegerValue (UNSIGNED_INTEGER)
│   ├── temporal/
│   │   ├── timevalue.ts            # BDTimeValue
│   │   ├── datevalue.ts            # BDDateValue
│   │   └── datetimevalue.ts        # BDDateTimeValue
│   ├── binaryvalue.ts              # BDBinaryValue
│   ├── multistatevalue.ts          # BDMultiStateValue
│   ├── characterstringvalue.ts     # BDCharacterStringValue
│   └── structuredview.ts           # BDStructuredView (container)
├── properties/
│   ├── index.ts                    # Property exports
│   ├── abstract.ts                 # BDAbstractProperty base class
│   ├── types.ts                    # Property-related types
│   ├── singlet/                    # BDSingletProperty, BDPolledSingletProperty
│   └── array/                      # BDArrayProperty, BDPolledArrayProperty
├── tests/                          # E2E tests (see "Testing" below)
│   ├── bacnet-stack-client.ts      # HTTP bridge to bacnet-stack CLI tools
│   ├── device.test.ts
│   ├── analogvalue.test.ts
│   ├── analoginput.test.ts
│   ├── analogoutput.test.ts
│   ├── integervalue.test.ts
│   ├── positiveintegervalue.test.ts
│   ├── binaryvalue.test.ts
│   ├── multistatevalue.test.ts
│   ├── characterstringvalue.test.ts
│   ├── timevalue.test.ts
│   ├── datevalue.test.ts
│   └── datetimevalue.test.ts
└── examples/                       # Runnable usage examples
```

## Architecture

### Class hierarchy

- `AsyncEventEmitter` — async-aware event emitter (foundation for everything)
  - `BDObject` — base class for all BACnet objects. Provides common properties
    (`Object_Name`, `Object_Type`, `Description`, `Status_Flags`,
    `Event_State`, `Reliability`, `Out_Of_Service`, `Property_List`).
    Uses a per-object `TaskQueue` for serialized property access.
    - `BDDevice` — the root device. Wraps `@bacnet-js/client`'s BACnet client,
      manages child objects, handles network requests (WhoIs, ReadProperty,
      WriteProperty, SubscribeCov, etc.), and processes CoV notifications via
      a `fastq` queue.
    - `BDNumericObject<Tag>` — base for numeric types. Adds `Present_Value`,
      `Units`, `COV_Increment`, `Min_Pres_Value`, `Max_Pres_Value`.
      - `BDAnalogValue` (REAL)
        - `BDAnalogInput`
        - `BDAnalogOutput` (adds `Priority_Array`, `Relinquish_Default`)
      - `BDIntegerValue` (SIGNED_INTEGER)
      - `BDPositiveIntegerValue` (UNSIGNED_INTEGER)
    - `BDBinaryValue`, `BDMultiStateValue`, `BDCharacterStringValue`
    - `BDTimeValue`, `BDDateValue`, `BDDateTimeValue`
    - `BDStructuredView` — container for subordinate objects

### Property system

Properties are modeled as separate objects attached to their parent `BDObject`:

- `BDSingletProperty` — holds a single value, optionally writable from the
  BACnet network.
- `BDPolledSingletProperty` — computes its value on read via a callback.
- `BDArrayProperty` — holds an array of values.
- `BDPolledArrayProperty` — computes its array on read via a callback.

Properties emit `beforecov` and `aftercov` events. The object listens for
`aftercov` and propagates it upward. The device listens for these events on all
child objects and pushes CoV notifications to subscribers through a FIFO queue.

### Key design patterns

- **Event-driven CoV propagation**: property change → object event → device
  queues notifications to all relevant subscribers.
- **Per-object task queues**: all property reads and writes are serialized
  through `TaskQueue` to prevent race conditions.
- **Backpressure**: operations return Promises that resolve only after full
  processing and acknowledgment.

## Build

```sh
npm ci
npm run build    # cleans dist/ then runs tsc
```

TypeScript compiles from `src/` into `dist/`. The project uses ESM
(`"type": "module"` in `package.json`) with Node.js module resolution
(`"module": "NodeNext"` in `tsconfig.json`). All imports use `.js` extensions.

## Testing

### Overview

Tests are **end-to-end integration tests** that verify BACnet protocol
conformance against an independent third-party implementation
([bacnet-stack](https://github.com/bacnet-stack/bacnet-stack)). There are no
unit tests or mocks.

Tests use **Node.js built-in test runner** (`node:test`) with `describe`, `it`,
`beforeEach`, and `afterEach`. Assertions use `node:assert`.

### Infrastructure

The E2E setup requires **Docker** and uses two containers on a shared Docker
network (`bacnet-js`):

1. **bacnet-stack-runner** — runs bacnet-stack CLI tools (`bacrp`, `bacwp`,
   etc.) behind a simple HTTP server on port 3000.
2. **Node.js container** — runs the test suite, which creates `BDDevice`
   instances that listen on the BACnet network.

`src/tests/bacnet-stack-client.ts` provides helpers that send HTTP POST
requests to the bacnet-stack-runner container:

- `bsReadProperty(deviceInstance, objectType, objectInstance, propertyId)` —
  executes `bacrp` and returns the stdout string.
- `bsWriteProperty(deviceInstance, objectType, objectInstance, propertyId,
  priority, tag, value)` — executes `bacwp`.
- `bsExec(binary, args)` — executes an arbitrary bacnet-stack binary.

### Test pattern

Each test file follows this structure:

1. `beforeEach`: create a `BDDevice` with instance `1` (or another number),
   add objects to it.
2. Test: use `bsReadProperty` / `bsWriteProperty` to interact with the device
   over the BACnet network via bacnet-stack, then assert on the returned
   string values.
3. `afterEach`: call `device.destroy()`.

### Running tests

Tests **cannot be run concurrently** — each test file must be run individually
because only one BACnet device can bind to the network interface at a time.

```sh
# First time / after changes to the Docker image:
docker build -t bacnet-stack-server --platform linux/amd64 docker/bacnet-stack-server

# Start infrastructure:
sh e2e-tests-prep.sh

# Run all tests (sequentially, one file at a time):
sh e2e-tests-run.sh

# Or run a single test file:
docker run --rm --volume ./:/app --workdir /app --network bacnet-js \
  node:22-alpine node --enable-source-maps --test dist/tests/analogvalue.test.js

# Tear down:
sh e2e-tests-clean.sh
```

### bacrp output formats

The bacnet-stack `bacrp` tool returns values as plain text strings. The formats
by BACnet application tag are:

| Type | Format | Example |
|------|--------|---------|
| REAL | 6 decimal places | `42.500000` |
| SIGNED_INTEGER | plain integer | `-42` |
| UNSIGNED_INTEGER | plain integer | `99` |
| BOOLEAN | uppercase | `TRUE`, `FALSE` |
| ENUMERATED | lowercase-hyphenated | `active`, `degrees-celsius`, `normal` |
| CHARACTER_STRING | double-quoted | `"hello world"`, `""` |
| OBJECT_IDENTIFIER | `(type-name, instance)` | `(analog-value, 1)` |
| BIT_STRING | braces, comma-separated | `{false,false,false,false}` |
| DATE | long form | `Sunday, June 15, 2025` |
| TIME | `HH:MM:SS.CC` (zero-padded hours) | `14:30:45.00`, `08:00:00.00` |
| DATETIME | `{date-time}` | `{Sunday, June 15, 2025-14:30:45.00}` |
| Array | braces, comma-separated | `{"Off","Low","High"}` |
| Array (single element) | no braces | `"Only"` |
| Null (in arrays) | `Null` | `{Null,Null,...}` |

### bacwp application tags

When writing with `bacwp`, the `tag` argument is the numeric BACnet application
tag:

| Tag | Type |
|-----|------|
| 0 | NULL |
| 1 | BOOLEAN |
| 2 | UNSIGNED_INTEGER |
| 3 | SIGNED_INTEGER |
| 4 | REAL |
| 7 | CHARACTER_STRING |
| 9 | ENUMERATED |

These match the `ApplicationTag` enum values from `@bacnet-js/client`.

## Conventions

- **Commit messages**: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/),
  enforced by [cocogitto](https://github.com/cocogitto/cocogitto) via git hooks
  and CI.
- **Versioning**: [semver](https://semver.org/), managed by cocogitto
  (`cog bump --auto`).
- **Naming**: all library classes and types use the `BD` prefix (e.g.,
  `BDDevice`, `BDObject`, `BDSingletProperty`). Internal methods use the
  `___` prefix (e.g., `___readProperty`, `___writeProperty`).
- **Imports**: always use `.js` extensions in import paths (required by
  NodeNext module resolution).
- **API docs**: generated with [TypeDoc](https://typedoc.org/) via
  `npm run docs`.

## CI

GitHub Actions runs on push/PR to `main`:

1. **Commit message check** — cocogitto verifies conventional commit format.
2. **E2E test suite** — builds and runs the full test suite across Node.js
   20.x, 22.x, and 24.x on Ubuntu.

## Dependencies

- **`@bacnet-js/client`** — BACnet protocol implementation (network layer).
- **`debug`** — debug logging.
- **`fastq`** — fast async FIFO queue (used for CoV notification processing).