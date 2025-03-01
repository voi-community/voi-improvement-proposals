---
index: 27
title: Structured Message Schema for Clients and Providers
description: A detailed specification defining the structure and encoding of messages exchanged between clients and providers.
author: Kieran O'Neill (@kieranroneill)
status: Draft
created: 2025-02-27
requires: VIP-03-0026
---

## Abstract

The ARCs related to provider functionality - transaction signing ([ARC-0005][arc-0005]), address discovery ([ARC-0006][arc-0006]), transaction network posting ([ARC-0007][arc-0007]) and transaction signing & posting ([ARC-0008][arc-0008]) - each specify the required parameters and results for their respective use cases. This proposal aims to comprehensively define a unified message schema for communication between clients and providers.

In addition, this proposal extends the existing methods by introducing new functionality, including:
* Extending the message structure to support targeting specific providers and networks.
* Introducing a method to disable clients on providers.
* Adding a method to sign arbitrary messages.
* Defining a method to available providers, including their [VCIC][vip-03-0026], metadata, and capabilities (e.g., supported networks and methods).

This proposal formalizes the request/response message schema while leaving implementation details to the discretion of clients and providers.

## Motivation

The previous ARCs related to client/provider communication - [ARC-0005][arc-0005], [ARC-0006][arc-0006], [ARC-0007][arc-0007], and [ARC-0008][arc-0008] - serve as the foundation for this proposal. However, this proposal aims to unify these ARCs and enhance their functionality, addressing limitations in the previous formats that lacked robustness when targeting specific AVM chains.

To address these gaps, additional methods have been introduced to expand and refine the client/provider communication framework.

## Specification

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) and [RFC 8174](https://www.ietf.org/rfc/rfc8174.txt).

> Comments like this are non-normative.

### Definitions

This section is non-normative.

* **Client**
  - An end-user application that interacts with a provider; e.g. a dApp.
* **Provider**
  - An application that manages private keys and performs signing operations; e.g. a wallet.

### Message reference naming

In order for each message to be identifiable, each message **MUST** contain a `reference` property. Furthermore, this `reference` property **MUST** conform to the following naming convention:

```
[namespace]:[method]:[type]
```
where:
* `namespace`:
  - **MUST** be `vip030027`
* `method`:
  - **MUST** be in snake case
  - **MUST** be one of `disable`, `discover`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`
* `type`:
  - **MUST** be one of `request` or `response`

This convention ensures that each message can be identified and handled.

### Supported methods

| Name                         | Summary                                                                                                                                                                                                                                                                                                                                        | Example                                     |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| `disable`                    | Removes access for the clients on the provider. What this looks like is at the discretion of the provider.                                                                                                                                                                                                                                     | [here](#disable-example)                    |
| `discover`                   | Sent by a client to discover the available provider(s). This method is usually called before other methods as it allows the client to identify providers, including their [VCIC][vip-03-0026], metadata, and capabilities (e.g., supported networks and methods).                                                                              | [here](#discover-example)                   |
| `enable`                     | Requests that a provider allow a client access to the providers' accounts. The response **MUST** return a user-curated list of available addresses. It is **RECOMMENDED** providers create a "session" for the requesting client, what this should look like is at the discretion of the provider(s) and is beyond the scope of this proposal. | [here](#enable-example)                     |
| `post_transactions`          | Sends a list of signed transactions to be posted to the network by the provider.                                                                                                                                                                                                                                                               | [here](#post-transactions-example)          |
| `sign_and_post_transactions` | Sends a list of unsigned transactions to be signed and posted to the network by the provider.                                                                                                                                                                                                                                                  | [here](#sign-and-post-transactions-example) |
| `sign_message`               | Sends a UTF-8 encoded message to be signed by the provider.                                                                                                                                                                                                                                                                                    | [here](#sign-message-example)               |
| `sign_transactions`          | Sends a list of transactions to be signed by the provider.                                                                                                                                                                                                                                                                                     | [here](#sign-transactions-example)          |

### Challenge-response authentication

Each provider **MUST** generate a cryptographic signing key pair and a unique UUIDv4 that conforms to the [VIP-03-0026][vip-03-0026] standard. This VCIC **MUST** be included in the result of the [`discover`](#discoverresult) request.

For all requests except `discover`, each message **MUST** include a challenge property. The provider's response **MUST** sign this challenge, using the private key associated with the provider's VCIC, and the resulting signature **MUST** be returned in the response.

It is the responsibility of the client to verify this signature using the known VCIC and corresponding challenge.

> 🚨 CAUTION: Each response from the provider will also include their VCIC. However, a client **MUST NOT** use this VCIC to verify the signature. Instead, it **MUST** rely on the VCIC obtained from a prior discover request or from an external trusted source.

### Request message schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/request-message",
  "title": "Request Message",
  "description": "Outlines the structure of a request message sent by the client",
  "type": "object",
  "properties": {
    "challenge": {
      "type": "string",
      "description": "A base64 encoded challenge used to verify the response integrity",
      "contentEncoding": "base64"
    },
    "id": {
      "type": "string",
      "description": "A globally unique identifier for the message",
      "format": "uuid"
    },
    "reference": {
      "description": "Identifies the purpose of the message",
      "enum": [
        "vip030027:disable:request",
        "vip030027:discover:request",
        "vip030027:enable:request",
        "vip030027:post_transactions:request",
        "vip030027:sign_and_post_transactions:request",
        "vip030027:sign_message:request",
        "vip030027:sign_transactions:request"
      ]
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded vcic that identifies the intended recipient",
      "contentEncoding": "base64"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:disable:request"
          }
        },
        "required": ["challenge", "id", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/disable-params"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:discover:request"
          }
        },
        "required": ["id", "reference"]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:enable:request"
          }
        },
        "required": ["challenge", "id", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/enable-params"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:post_transactions:request"
          }
        },
        "required": ["challenge", "id", "params", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/post-transactions-params"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_and_post_transactions:request"
          }
        },
        "required": ["challenge", "id", "params", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/sign-and-post-transactions-params"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_message:request"
          }
        },
        "required": ["challenge", "id", "params", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/sign-message-params"
          }
        }
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_transactions:request"
          }
        },
        "required": ["challenge", "id", "params", "reference", "vcic"]
      },
      "then": {
        "properties": {
          "params": {
            "$ref": "/schemas/sign-transactions-params"
          }
        }
      }
    }
  ]
}
```
where:
* `challenge`:
  - **MUST** be encoded using [base64][rfc4648_4].
  - **SHOULD** be random with sufficient entropy.
* `id`:
  - **MUST** be a [UUID v4][rfc4122] compliant string.
* `reference`:
  - **MUST** be a string that conforms to the [message reference naming](#message-reference-naming) convention.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

#### Param definitions

##### Disable params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/disable-params",
  "title": "Disable Params",
  "description": "Disables a previously enabled client with a provider",
  "type": "object",
  "properties": {
    "genesisHash": {
      "type": "string",
      "description": "The unique identifier for the network that is the hash of the genesis block"
    },
    "sessionIDs": {
      "type": "array",
      "description": "A list of specific session IDs to remove",
      "items": {
        "type": "string"
      }
    }
  }
}
```
where:
* `genesisHash`:
  - **OPTIONAL** if omitted, the provider **SHOULD** assume their "default" network.
  - **MUST** be a [base64][rfc4648_4] encoded hash of the genesis block of the network.
* `sessionIDs`:
  - **OPTIONAL** if omitted, all sessions must be removed.
  - **MUST** remove all sessions if the list is empty.

##### Enable params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/enable-params",
  "title": "Enable Params",
  "description": "Asks a provider to enable the requesting client",
  "type": "object",
  "properties": {
    "genesisHash": {
      "type": "string",
      "description": "The unique identifier for the network that is the hash of the genesis block",
      "contentEncoding": "base64"
    }
  }
}
```
where:
* `genesisHash`:
  - **OPTIONAL** if omitted, the provider **SHOULD** assume the "default" network.
  - **MUST** be a [base64][rfc4648_4] encoded hash of the genesis block of the network.

##### Post transactions params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/post-transactions-params",
  "title": "Post Transactions Params",
  "description": "Sends a list of signed transactions to be posted to the network by the provider",
  "type": "object",
  "properties": {
    "stxns": {
      "type": "array",
      "description": "A list of signed transactions to be posted to the network by the provider",
      "items": {
        "type": "string",
        "contentEncoding": "base64"
      }
    }
  },
  "required": [
    "stxns"
  ]
}
```
where:
* `stxns`:
  - **MUST** be the [base64][rfc4648_4] encoding of the canonical msgpack encoding of a signed transaction as defined in [ARC-0001](https://arc.algorand.foundation/ARCs/arc-0001#interface-signedtxnstr).
  - **MAY** be empty.

##### Sign and post transactions params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-and-post-transactions-params",
  "title": "Sign and Post Transactions Params",
  "description": "Sends a list of transactions to be signed and posted to the network by the provider",
  "type": "object",
  "properties": {
    "txns": {
      "type": "array",
      "description": "A list of transactions to be signed and posted to the network by the provider",
      "items": {
        "type": "object",
        "properties": {
          "authAddr": {
            "type": "string",
            "description": "The auth address if the sender has rekeyed"
          },
          "msig": {
            "type": "object",
            "description": "Extra metadata needed when sending multisig transactions",
            "properties": {
              "addrs": {
                "type": "array",
                "description": "A list of AVM addresses representing possible signers for the multisig",
                "items": {
                  "type": "string"
                }
              },
              "threshold": {
                "type": "integer",
                "description": "Multisig threshold value"
              },
              "version": {
                "type": "integer",
                "description": "Multisig version"
              }
            }
          },
          "signers": {
            "type": "array",
            "description": "A list of addresses to sign with",
            "items": {
              "type": "string"
            }
          },
          "stxn": {
            "type": "string",
            "description": "The base64 encoded signed transaction",
            "contentEncoding": "base64"
          },
          "txn": {
            "type": "string",
            "description": "The base64 encoded unsigned transaction",
            "contentEncoding": "base64"
          }
        },
        "required": ["txn"]
      }
    }
  },
  "required": [
    "txns"
  ]
}
```
where:
* `txns`:
  - **MUST** have each item conform to the semantic of a transaction in [ARC-0001](https://arc.algorand.foundation/ARCs/arc-0001#semantic-of-wallettransaction).
  - **MAY** be empty.

##### Sign message params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-message-params",
  "title": "Sign Message Params",
  "description": "Sends a UTF-8 encoded message to be signed by the provider",
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The string to be signed by the provider"
    },
    "signer": {
      "type": "string",
      "description": "The address to be used to sign the message"
    }
  },
  "required": [
    "message"
  ]
}
```
where:
* `message`:
  - **MUST** be a string that is compatible with the UTF-8 character set as defined in [RFC-2279](https://www.rfc-editor.org/rfc/rfc2279).
* `signer`:
  - **MUST** be a [base32](https://datatracker.ietf.org/doc/html/rfc4648#section-6) encoded public key with a 4-byte checksum appended as defined in [keys and addresses](https://developer.algorand.org/docs/get-details/accounts/#keys-and-addresses).

##### Sign transactions params

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-transactions-params",
  "title": "Sign Transactions Params",
  "description": "Sends a list of transactions to be signed by the provider",
  "type": "object",
  "properties": {
    "txns": {
      "type": "array",
      "description": "A list of transactions to be signed by the provider",
      "items": {
        "type": "object",
        "properties": {
          "authAddr": {
            "type": "string",
            "description": "The auth address if the sender has rekeyed"
          },
          "msig": {
            "type": "object",
            "description": "Extra metadata needed when sending multisig transactions",
            "properties": {
              "addrs": {
                "type": "array",
                "description": "A list of AVM addresses representing possible signers for the multisig",
                "items": {
                  "type": "string"
                }
              },
              "threshold": {
                "type": "integer",
                "description": "Multisig threshold value"
              },
              "version": {
                "type": "integer",
                "description": "Multisig version"
              }
            }
          },
          "signers": {
            "type": "array",
            "description": "A list of addresses to sign with",
            "items": {
              "type": "string"
            }
          },
          "stxn": {
            "type": "string",
            "description": "The base64 encoded signed transaction",
            "contentEncoding": "base64"
          },
          "txn": {
            "type": "string",
            "description": "The base64 encoded unsigned transaction",
            "contentEncoding": "base64"
          }
        },
        "required": ["txn"]
      }
    }
  },
  "required": [
    "txns"
  ]
}
```
where:
* `txns`:
  - **MUST** have each item conform to the semantic of a transaction in [ARC-0001](https://arc.algorand.foundation/ARCs/arc-0001/arc-0001#semantic-of-wallettransaction).
  - **MAY** be empty.

## Rationale

## Reference Implementation

## Security Considerations

None.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt).

<!-- links -->
[arc-0005]: https://arc.algorand.foundation/ARCs/arc-0005
[arc-0006]: https://arc.algorand.foundation/ARCs/arc-0007
[arc-0007]: https://arc.algorand.foundation/ARCs/arc-0007
[arc-0008]: https://arc.algorand.foundation/ARCs/arc-0008
[rfc4122]: https://datatracker.ietf.org/doc/html/rfc4122
[rfc4648_4]: https://datatracker.ietf.org/doc/html/rfc4648#section-4
[vip-03-0026]: /03/0026
