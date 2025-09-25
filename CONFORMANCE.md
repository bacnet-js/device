
# Conformance

This document summarizes the conformance status of this library with respect
to the BACnet specifications.

## Table of Contents

- [Supported Services](#supported-services)
- [Supported Object Types](#supported-object-types)

## Supported services

The following table summarizes the implementation status of each service
defined by the BACnet specifications.

| Status | Service | Tested with |
| --- | --- | --- |
| ❌ | ACKNOWLEDGE_ALARM | |
| ✅ | CONFIRMED_COV_NOTIFICATION | Schneider EBO, YABE |
| ❌ | CONFIRMED_EVENT_NOTIFICATION | |
| ❌ | GET_ALARM_SUMMARY | |
| ❌ | GET_ENROLLMENT_SUMMARY | |
| ✅ | SUBSCRIBE_COV | Schneider EBO, YABE |
| ❌ | ATOMIC_READ_FILE | |
| ❌ | ATOMIC_WRITE_FILE | |
| ❌ | ADD_LIST_ELEMENT | |
| ❌ | REMOVE_LIST_ELEMENT | |
| ❌ | CREATE_OBJECT | |
| ❌ | DELETE_OBJECT | |
| ✅ | READ_PROPERTY | Schneider EBO, YABE |
| ✅ | READ_PROPERTY_MULTIPLE | Schneider EBO, YABE |
| ✅ | WRITE_PROPERTY | Schneider EBO, YABE |
| ❌ | WRITE_PROPERTY_MULTIPLE | |
| ❌ | DEVICE_COMMUNICATION_CONTROL | |
| ❌ | CONFIRMED_PRIVATE_TRANSFER | |
| ❌ | CONFIRMED_TEXT_MESSAGE | |
| ❌ | REINITIALIZE_DEVICE | |
| ❌ | VT_OPEN | |
| ❌ | VT_CLOSE | |
| ❌ | VT_DATA | |
| ❌ | READ_PROPERTY_CONDITIONAL | |
| ❌ | AUTHENTICATE | |
| ❌ | REQUEST_KEY | |
| ❌ | I_AM | |
| ❌ | I_HAVE | |
| ✅ | UNCONFIRMED_COV_NOTIFICATION | Schneider EBO, YABE |
| ❌ | UNCONFIRMED_EVENT_NOTIFICATION | |
| ❌ | UNCONFIRMED_PRIVATE_TRANSFER | |
| ❌ | UNCONFIRMED_TEXT_MESSAGE | |
| ❌ | TIME_SYNCHRONIZATION | |
| ❌ | WHO_HAS | |
| ✅ | WHO_IS | Schneider EBO, YABE |
| ❌ | READ_RANGE | |
| ❌ | UTC_TIME_SYNCHRONIZATION | |
| ❌ | LIFE_SAFETY_OPERATION | |
| ❌ | SUBSCRIBE_COV_PROPERTY | |
| ❌ | GET_EVENT_INFORMATION | |
| ❌ | WRITE_GROUP | |
| ❌ | SUBSCRIBE_COV_PROPERTY_MULTIPLE | |
| ❌ | CONFIRMED_COV_NOTIFICATION_MULTIPLE | |
| ❌ | UNCONFIRMED_COV_NOTIFICATION_MULTIPLE | |

## Supported object types

The following table summarizes the implementation status of each object type
defined by the BACnet specifications.

Conformance levels for object types are defined as follows:

- **Basic**: All required properties are supported. Some optional properties
  might be supported, with no guarantees. Maintaining a consistent object
  representation across properties is left to consumers.
- **Required**: All required properties are supported and kept consistent with
  each other. Some optional properties might be supported, with no guarantees.

| Status | Object type | Level |
| --- | --- | --- |
| ✅ | ANALOG_INPUT | basic |
| ✅ | ANALOG_OUTPUT | basic |
| ✅ | ANALOG_VALUE | basic |
| ❌ | BINARY_INPUT | |
| ❌ | BINARY_OUTPUT | |
| ✅ | BINARY_VALUE | basic |
| ❌ | CALENDAR | |
| ❌ | COMMAND | |
| ✅ | DEVICE | basic |
| ❌ | EVENT_ENROLLMENT | |
| ❌ | FILE | |
| ❌ | GROUP | |
| ❌ | LOOP | |
| ❌ | MULTI_STATE_INPUT | |
| ❌ | MULTI_STATE_OUTPUT | |
| ❌ | NOTIFICATION_CLASS | |
| ❌ | PROGRAM | |
| ❌ | SCHEDULE | |
| ❌ | AVERAGING | |
| ✅ | MULTI_STATE_VALUE | basic |
| ❌ | TREND_LOG | |
| ❌ | LIFE_SAFETY_POINT | |
| ❌ | LIFE_SAFETY_ZONE | |
| ❌ | ACCUMULATOR | |
| ❌ | PULSE_CONVERTER | |
| ❌ | EVENT_LOG | |
| ❌ | GLOBAL_GROUP | |
| ❌ | TREND_LOG_MULTIPLE | |
| ❌ | LOAD_CONTROL | |
| ✅ | STRUCTURED_VIEW | |
| ❌ | ACCESS_DOOR | |
| ❌ | TIMER | |
| ❌ | ACCESS_CREDENTIAL | |
| ❌ | ACCESS_POINT | |
| ❌ | ACCESS_RIGHTS | |
| ❌ | ACCESS_USER | |
| ❌ | ACCESS_ZONE | |
| ❌ | CREDENTIAL_DATA_INPUT | |
| ❌ | NETWORK_SECURITY | |
| ❌ | BITSTRING_VALUE | |
| ✅ | CHARACTERSTRING_VALUE | basic |
| ❌ | DATEPATTERN_VALUE | |
| ✅ | DATE_VALUE | basic|
| ❌ | DATETIMEPATTERN_VALUE | |
| ✅ | DATETIME_VALUE | basic |
| ✅ | INTEGER_VALUE | basic |
| ❌ | LARGE_ANALOG_VALUE | |
| ❌ | OCTETSTRING_VALUE | |
| ✅ | POSITIVE_INTEGER_VALUE | basic |
| ❌ | TIMEPATTERN_VALUE | |
| ✅ | TIME_VALUE | basic |
| ❌ | NOTIFICATION_FORWARDER | |
| ❌ | ALERT_ENROLLMENT | |
| ❌ | CHANNEL | |
| ❌ | LIGHTING_OUTPUT | |
| ❌ | BINARY_LIGHTING_OUTPUT | |
| ❌ | NETWORK_PORT | |
| ❌ | ELEVATOR_GROUP | |
| ❌ | ESCALATOR | |
| ❌ | LIFT | |

As an example of what we mean by maintaining consistency across properties,
consider the constraints described in section `12.8.4` of the specification:

> _If Present_Value is commandable for a given instance, then the Priority_Array
> and Relinquish_Default properties shall also be present for that instance.
> The Present_Value property shall be writable when  Out_Of_Service is TRUE._

Note that consumers of this library can use the `BDObject`, `BDSingletProperty`
and `BDArrayProperty` primitives to add support for object types and properties
that this library does not (yet) implement.
