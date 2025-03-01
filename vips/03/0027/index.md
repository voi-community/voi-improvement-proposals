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
* Defining a method to discover available providers, including their [VCIC][vip-03-0026], metadata, and capabilities (e.g., supported networks and methods).

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
  - **MUST** be `vip030027`.
* `method`:
  - **MUST** be in snake case.
  - **MUST** be one of `disable`, `discover`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`.
* `type`:
  - **MUST** be one of `request` or `response`.

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

Each provider **MUST** generate a cryptographic signing key pair and a unique [UUID v4][rfc4122] that conforms to the [VIP-03-0026][vip-03-0026] standard.

This VCIC **MUST** be included in the result of any [`discover`](#discover-result) requests.

For all requests except `discover`, each message **MUST** include a challenge property. The provider's response **MUST** sign this challenge, using the private key associated with the provider's VCIC, and the resulting signature **MUST** be returned in the response.

It is the responsibility of the client to verify this signature using the known VCIC and corresponding challenge.

### Request message schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/request-message",
  "title": "Request Message",
  "description": "The request message sent by a client",
  "type": "object",
  "properties": {
    "challenge": {
      "type": "string",
      "description": "A base64 encoded challenge used to verify the response integrity",
      "contentEncoding": "base64"
    },
    "id": {
      "type": "string",
      "description": "A globally unique identifier for the request message",
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
      "description": "A base64 encoded VCIC that identifies the intended recipient",
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
  - **OPTIONAL** if omitted, all sessions **MUST** be removed.
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
  - **MUST** be the [base64][rfc4648_4] encoding of the canonical msgpack encoding of a signed transaction as defined in [ARC-0001][arc-0001_signed-transaction-interface].
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
  - **MUST** be a [base32][rfc4648_6] encoded public key with a 4-byte checksum appended as defined in [keys and addresses][keys-and-addresses].

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

### Response message schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/response-message",
  "title": "Response Message",
  "description": "The message sent by a provider in response to a client's request",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "A globally unique identifier for the response message",
      "format": "uuid"
    },
    "reference": {
      "description": "Identifies the purpose of the message",
      "enum": [
        "vip030027:disable:response",
        "vip030027:discover:response",
        "vip030027:enable:response",
        "vip030027:post_transactions:response",
        "vip030027:sign_and_post_transactions:response",
        "vip030027:sign_message:response",
        "vip030027:sign_transactions:response"
      ]
    },
    "requestID": {
      "type": "string",
      "description": "The ID of the originating request message",
      "format": "uuid"
    },
    "signature": {
      "type": "string",
      "description": "The base64 encoded result of the signing of the request's challenge using the provider's VCIC private key",
      "contentEncoding": "base64"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:disable:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/disable-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/network-not-supported-error"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:discover:response"
          }
        },
        "required": ["id", "reference", "requestID"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/discover-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "$ref": "/schemas/unknown-error"
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:enable:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/enable-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/network-not-supported-error"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:post_transactions:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/post-transactions-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/network-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/unauthorized-signer-error"
                  },
                  {
                    "$ref": "/schemas/failed-to-post-some-transactions-error"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_and_post_transactions:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/sign-and-post-transactions-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/network-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/unauthorized-signer-error"
                  },
                  {
                    "$ref": "/schemas/invalid-input-error"
                  },
                  {
                    "$ref": "/schemas/invalid-group-id-error"
                  },
                  {
                    "$ref": "/schemas/failed-to-post-some-transactions-error"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_message:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/sign-message-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/unauthorized-signer-error"
                  }
                ]
              }
            }
          }
        ]
      }
    },
    {
      "if": {
        "properties": {
          "reference": {
            "const": "vip030027:sign_transactions:response"
          }
        },
        "required": ["id", "reference", "requestID", "signature"]
      },
      "then": {
        "oneOf": [
          {
            "properties": {
              "result": {
                "$ref": "/schemas/sign-transactions-result"
              }
            }
          },
          {
            "properties": {
              "error": {
                "oneOf": [
                  {
                    "$ref": "/schemas/unknown-error"
                  },
                  {
                    "$ref": "/schemas/method-canceled-error"
                  },
                  {
                    "$ref": "/schemas/method-timed-out-error"
                  },
                  {
                    "$ref": "/schemas/method-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/network-not-supported-error"
                  },
                  {
                    "$ref": "/schemas/unauthorized-signer-error"
                  },
                  {
                    "$ref": "/schemas/invalid-input-error"
                  },
                  {
                    "$ref": "/schemas/invalid-group-id-error"
                  }
                ]
              }
            }
          }
        ]
      }
    }
  ]
}
```
* `id`:
  - **MUST** be a [UUID v4][rfc4122] compliant string.
* `reference`:
  - **MUST** be a string that conforms to the [message reference naming](#message-reference-naming) convention.
* `requestID`:
  - **MUST** be the ID of the originating request message.
* `signature`:
  - **MUST** be the [base64][rfc4648_4] encoding signature of challenge using the provider's [VCIC][vip-03-0026] private key.

#### Result definitions

##### Disable result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/disable-result",
  "title": "Disable Result",
  "description": "The response from a disable request",
  "type": "object",
  "properties": {
    "genesisHash": {
      "type": "string",
      "description": "The unique identifier for the network that is the hash of the genesis block",
      "contentEncoding": "base64"
    },
    "genesisID": {
      "type": "string",
      "description": "A human-readable identifier for the network"
    },
    "sessionIDs": {
      "type": "array",
      "description": "A list of specific session IDs that have been removed",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "genesisHash",
    "genesisID"
  ]
}
```
where:
* `genesisHash`:
  - **MUST** be a [base64][rfc4648_4] encoded hash of the genesis block of the network.

##### Discover result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/discover-result",
  "title": "Discover Result",
  "description": "The response from a discover request",
  "type": "object",
  "properties": {
    "host": {
      "type": "string",
      "description": "A domain name of the provider"
    },
    "icon": {
      "type": "string",
      "description": "A URI pointing to an image"
    },
    "name": {
      "type": "string",
      "description": "A human-readable canonical name of the provider"
    },
    "networks": {
      "type": "array",
      "description": "A list of networks available for the provider",
      "items": {
        "type": "object",
        "properties": {
          "genesisHash": {
            "type": "string",
            "description": "The unique identifier for the network that is the hash of the genesis block",
            "contentEncoding": "base64"
          },
          "genesisID": {
            "type": "string",
            "description": "A human-readable identifier for the network"
          },
          "methods": {
            "type": "array",
            "description": "A list of methods available from the provider for the chain",
            "items": {
              "enum": [
                "disable",
                "enable",
                "post_transactions",
                "sign_and_post_transactions",
                "sign_message",
                "sign_transactions"
              ]
            }
          }
        },
        "required": [
          "genesisHash",
          "genesisID",
          "methods"
        ]
      }
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC that identifies the intended recipient",
      "contentEncoding": "base64"
    }
  },
  "required": [
    "name",
    "networks",
    "vcic"
  ]
}
```
where:
* `host`:
  - **RECOMMENDED** to be a URL that points to a live website.
* `icon`:
  - **RECOMMENDED** be a data URI that conforms to [RFC-2397](https://www.rfc-editor.org/rfc/rfc2397).
  - **SHOULD** be a URI that points to a square image with a 96x96px minimum resolution.
  - **RECOMMENDED** image format to be either lossless or vector based such as PNG, WebP or SVG.
* `name`:
  - **SHOULD** be human-readable to allow for display to a user.
* `networks`:
  - **MAY** be empty.
* `networks.genesisHash`:
  - **MUST** be a [base64][rfc4648_4] encoded hash of the genesis block of the network.
* `networks.methods`:
  - **SHOULD** be one or all of `disable`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`.
  - **MAY** be empty.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Enable result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/enable-result",
  "title": "Enable Result",
  "description": "The response from an enable request",
  "type": "object",
  "properties": {
    "accounts": {
      "type": "array",
      "description": "A list of accounts available for the provider",
      "items": {
        "type": "object",
        "properties": {
          "address": {
            "type": "string",
            "description": "The address of the account"
          },
          "name": {
            "type": "string",
            "description": "A human-readable name for this account"
          }
        },
        "required": ["address"]
      }
    },
    "genesisHash": {
      "type": "string",
      "description": "The unique identifier for the network that is the hash of the genesis block",
      "contentEncoding": "base64"
    },
    "genesisID": {
      "type": "string",
      "description": "A human-readable identifier for the network"
    },
    "sessionID": {
      "type": "string",
      "description": "A globally unique identifier for the session as defined by the provider"
    }
  },
  "required": [
    "accounts",
    "genesisHash",
    "genesisID"
  ]
}
```
where:
* `accounts`:
  - **MAY** be empty.
* `accounts.address`:
  - **MUST** be a [base32][rfc4648_6] encoded public key with a 4-byte checksum appended as defined in [keys and addresses][keys-and-addresses].
* `genesisHash`:
  - **MUST** be a [base64][rfc4648_4] encoded hash of the genesis block of the network.
* `sessionID`:
  - **RECOMMENDED** be a [UUID v4][rfc4122] compliant string.

##### Post transactions result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/post-transactions-result",
  "title": "Post Transactions Result",
  "description": "The response from a post transactions request",
  "type": "object",
  "properties": {
    "txnIDs": {
      "type": "array",
      "description": "A list of IDs for all of the transactions posted to the network",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "txnIDs"
  ]
}
```
where:
* `txnIDs`:
  - **MUST** contain items that are a 52-character [base32][rfc4648_6] string (without padding) corresponding to a 32-byte string transaction ID.
  - **MAY** be empty.

##### Sign And Post Transactions Result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-and-post-transactions-result",
  "title": "Sign and Post Transactions Result",
  "description": "The response from a sign and post transactions request",
  "type": "object",
  "properties": {
    "txnIDs": {
      "type": "array",
      "description": "A list of IDs for all of the transactions posted to the network",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "txnIDs"
  ]
}
```
where:
* `txnIDs`:
  - **MUST** contain items that are a 52-character [base32][rfc4648_6] string (without padding) corresponding to a 32-byte string transaction ID.
  - **MAY** be empty.

##### Sign message result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-message-result",
  "title": "Sign Message Result",
  "description": "The response from a sign message request",
  "type": "object",
  "properties": {
    "signature": {
      "type": "string",
      "description": "The signature of the signed message signed by the private key of the intended signer",
      "contentEncoding": "base64"
    },
    "signer": {
      "type": "string",
      "description": "The address of the signer used to sign the message"
    }
  },
  "required": ["signature", "signer"]
}
```
where:
* `signature`:
  - **MUST** be a [base64][rfc4648_4] encoded string.
* `signer`:
  - **MUST** be a [base32][rfc4648_6] encoded public key with a 4-byte checksum appended as defined in [keys and addresses][keys-and-addresses].

##### Sign transactions result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/sign-transactions-result",
  "title": "Sign Transactions Result",
  "description": "The response from a sign transactions request",
  "type": "object",
  "properties": {
    "stxns": {
      "type": "array",
      "description": "A list of signed transactions that is ready to be posted to the network",
      "items": {
        "oneOf": [
          {
            "type": "string",
            "contentEncoding": "base64"
          },
          {
            "type": "null"
          }
        ]
      }
    }
  },
  "required": ["stxns"]
}
```
where:
* `stxns`:
  - **MUST** be the [base64][rfc4648_4] encoding of the canonical msgpack encoding of a signed transaction as defined in [ARC-0001][arc-0001_signed-transaction-interface].
  - **MAY** be empty.

#### Error definitions

##### Unknown error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/unknown-error",
  "title": "Unknown Error",
  "description": "The default error response",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4000
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4000`.

##### Method canceled error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/method-canceled-error",
  "title": "Method Canceled Error",
  "description": "A user has rejected the request",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4001
    },
    "method": {
      "description": "The method that was canceled",
      "enum": [
        "disable",
        "discover",
        "enable",
        "post_transactions",
        "sign_and_post_transactions",
        "sign_message",
        "sign_transactions"
      ]
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "method", "message"]
}
```
where:
* `code`:
  - **MUST** be `4001`.
* `method`:
  - **MUST** be one of `disable`, `discover`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Method timed out error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/method-not-supported-error",
  "title": "Method Timed Out Error",
  "description": "The request timed out",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4002
    },
    "method": {
      "description": "The method that was canceled",
      "enum": [
        "disable",
        "discover",
        "enable",
        "post_transactions",
        "sign_and_post_transactions",
        "sign_message",
        "sign_transactions"
      ]
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "method", "message"]
}
```
where:
* `code`:
  - **MUST** be `4002`.
* `method`:
  - **MUST** be one of `disable`, `discover`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Method not supported error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/method-not-supported-error",
  "title": "Method Not Supported Error",
  "description": "The provider does not support the requested method",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4003
    },
    "method": {
      "description": "The method that was canceled",
      "enum": [
        "disable",
        "discover",
        "enable",
        "post_transactions",
        "sign_and_post_transactions",
        "sign_message",
        "sign_transactions"
      ]
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "method", "message"]
}
```
where:
* `code`:
  - **MUST** be `4003`.
* `method`:
  - **MUST** be one of `disable`, `discover`, `enable`, `post_transactions`, `sign_and_post_transactions`, `sign_message` or `sign_transactions`.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Network not supported error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/network-not-supported-error",
  "title": "Method Not Supported Error",
  "description": "The provider does not support the requested network",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4004
    },
    "genesisHashes": {
      "type": "array",
      "description": "A list of genesis hashes that are not supported by the provider",
      "items": {
        "type": "string"
      }
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4004`.
* `genesisHashes`:
  - **MUST** contain items that are a [base64][rfc4648_4] encoded hash of the genesis block of a network.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Unauthorized signer error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/unauthorized-signer-error",
  "title": "Unauthorized Signer Error",
  "description": "The provider has not given permission to use the specified signer",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4100
    },
    "signer": {
      "type": "string",
      "description": "The unauthorized signer address"
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4100`.
* `signer`:
  - **MUST** be a [base32][rfc4648_6] encoded public key with a 4-byte checksum appended as defined in [keys and addresses][keys-and-addresses].
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Invalid input error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/invalid-input-error",
  "title": "Invalid Input Error",
  "description": "The input for signing transactions is malformed",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4200
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4200`.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Invalid group ID error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/invalid-group-id-error",
  "title": "Invalid Group ID Error",
  "description": "The computed group ID of the atomic transactions is different from the assigned group ID",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4201
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4201`.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

##### Failed to post some transactions error

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "/schemas/invalid-group-id-error",
  "title": "Failed to Post Some Transactions Error",
  "description": "Some transactions failed to be accepted by the network",
  "type": "object",
  "properties": {
    "code": {
      "description": "An integer that defines the type of error",
      "const": 4300
    },
    "message": {
      "type": "string",
      "description": "A human-readable message about the error"
    },
    "successTxnIDs": {
      "type": "array",
      "description": "The IDs of transactions that were successfully committed to the blockchain",
      "items": {
        "oneOf": [
          {
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      }
    },
    "vcic": {
      "type": "string",
      "description": "A base64 encoded VCIC of the provider",
      "contentEncoding": "base64"
    }
  },
  "required": ["code", "message"]
}
```
where:
* `code`:
  - **MUST** be `4300`.
* `successTxnIDs`:
  - **MAY** contain items that are a 52-character [base32][rfc4648_6] string (without padding) corresponding to a 32-byte string transaction ID.
* `vcic`:
  - **MUST** conform to [VIP-03-0026][vip-03-0026].
  - **MUST** be encoded using [base64][rfc4648_4].

## Rationale

An original vision for the AVM was that multiple AVM chains could co-exist. Extending the base of each message schema with a targeted network (referenced by its genesis hash) ensures that the schema remains AVM chain-agnostic and adaptable to any AVM-compatible chain.

The inclusion of the [VCIC][vip-03-0026] allows clients to verify that a provider's response is authentic and not "spoofed" by another provider. This addresses a common drawback observed on other chains, most notably EVM chains that implement the [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963) specification.

The schema introduces several new methods not covered in the referenced ARCs. These methods were developed in response to needs identified by both providers and clients.

The latest JSON Schema draft ([2020-12](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01)) was chosen as the format due to its widespread support across multiple platforms and languages, as well as its popularity.

## Reference Implementation

### Disable example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "e44f5bde-37f4-44b0-94d5-1daff41bc984d",
  "params": {
    "genesisHash": "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=",
    "sessionIDs": ["ab476381-c1f4-4665-b89c-9f386fb6f15d", "7b02d412-6a27-4d97-b091-d5c26387e644"]
  },
  "reference": "vip030027:disable:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "e6696507-6a6c-4df8-98c4-356d5351207c",
  "reference": "vip030027:disable:response",
  "requestID": "e44f5bde-37f4-44b0-94d5-1daff41bc984d",
  "result": {
    "genesisHash": "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=",
    "genesisID": "voitest-v1",
    "sessionIDs": ["ab476381-c1f4-4665-b89c-9f386fb6f15d", "7b02d412-6a27-4d97-b091-d5c26387e644"]
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

### Discover example

**Request**

```json
{
  "id": "5d5186fc-2091-4e88-8ef9-05a5d4da24ed",
  "reference": "vip030027:discover:request"
}
```

**Response**

```json
{
  "id": "6695f990-e3d7-41c4-bb26-64ab8da0653b",
  "reference": "vip030027:discover:response",
  "requestID": "5d5186fc-2091-4e88-8ef9-05a5d4da24ed",
  "result": {
    "host": "https://awesome-wallet.com",
    "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
    "name": "Awesome Wallet",
    "networks": [
      {
        "genesisHash": "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=",
        "genesisID": "voitest-v1",
        "methods": [
          "disable",
          "enable",
          "post_transactions",
          "sign_and_post_transactions",
          "sign_message",
          "sign_transactions"
        ]
      },
      {
        "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        "genesisID": "testnet-v1.0",
        "methods": [
          "disable",
          "enable",
          "post_transactions",
          "sign_message",
          "sign_transactions"
        ]
      }
    ],
    "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
  }
}
```

### Enable example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "4dd4ccdf-a918-4e33-a675-073330db4c99",
  "params": {
    "genesisHash": "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo="
  },
  "reference": "vip030027:enable:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "cdf43d9e-1158-400b-b2fb-ba45e39548ff",
  "reference": "vip030027:enable:response",
  "requestID": "4dd4ccdf-a918-4e33-a675-073330db4c99",
  "result": {
    "accounts": [{
      "address": "VIP27GVTJO27GGSWHZR2S3E7UY46KXFLBC6CLEMF7GY3UYF7YWGWC6NPTA",
      "name": "Main Account"
    }],
    "genesisHash": "IXnoWtviVVJW5LGivNFc0Dq14V3kqaXuK2u5OQrdVZo=",
    "genesisID": "voitest-v1",
    "sessionId": "6eb74cf1-93e8-400c-94b5-4928807a3ab1"
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

### Post transactions example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "e555ccb3-4730-474c-92e3-1e42868e0c0d",
  "params": {
    "stxns": [
      "iaNhbXT..."
    ]
  },
  "reference": "vip030027:post_transactions:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "13b115fb-2966-4a21-b6f7-8aca118ac008",
  "reference": "vip030027:post_transactions:response",
  "requestID": "e555ccb3-4730-474c-92e3-1e42868e0c0d",
  "result": {
    "txnIDs": [
      "H2KKVI..."
    ]
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

### Sign and post transactions example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "43adafeb-d455-4264-a1c0-d86d9e1d75d9",
  "params": {
    "txns": [
      {
        "txn": "iaNhbXT..."
      },
      {
        "txn": "iaNhbXT...",
        "signers": []
      }
    ]
  },
  "reference": "vip030027:sign_and_post_transactions:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "973df300-f149-4004-9718-b04b5f3991bd",
  "reference": "vip030027:sign_and_post_transactions:response",
  "requestID": "43adafeb-d455-4264-a1c0-d86d9e1d75d9",
  "result": {
    "stxns": [
      "iaNhbXT...",
      null
    ]
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

### Sign message example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "8f4aa9e5-d039-4272-95ac-6e972967e0cb",
  "params": {
    "message": "Hello humie!",
    "signer": "ARC27GVTJO27GGSWHZR2S3E7UY46KXFLBC6CLEMF7GY3UYF7YWGWC6NPTA"
  },
  "reference": "vip030027:sign_message:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "9bdf72bf-218e-462a-8f64-3a40ef4a4963",
  "reference": "vip030027:sign_message:response",
  "requestID": "8f4aa9e5-d039-4272-95ac-6e972967e0cb",
  "result": {
    "signature": "iaNhbXT...",
    "signer": "ARC27GVTJO27GGSWHZR2S3E7UY46KXFLBC6CLEMF7GY3UYF7YWGWC6NPTA"
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

### Sign transactions example

**Request**

```json
{
  "challenge": "vDl8PlomBjO90OB4k2Zo4tnEQBZ9BnwaHyiyMSche/Q=",
  "id": "464e6b88-8860-403c-891d-7de6d0425686",
  "params": {
    "txns": [
      {
        "txn": "iaNhbXT..."
      },
      {
        "txn": "iaNhbXT...",
        "signers": []
      }
    ]
  },
  "reference": "vip030027:sign_transactions:request",
  "vcic": "+UWJoATHVMUNGBUCFqB0FN4ahuvMvtTA1CgqT4Sw4lQ7MGixuz0Dv5BQaj9Aqc6qANNl4w=="
}
```

**Response**

```json
{
  "id": "f5a56135-5cd2-4f3f-8757-7b89d32d67e0",
  "reference": "vip030027:sign_transactions:response",
  "requestID": "464e6b88-8860-403c-891d-7de6d0425686",
  "result": {
    "stxns": [
      "iaNhbXT...",
      null
    ]
  },
  "signature": "WFGVP7LxulVBc2RniqTRVWpdjcvgTTdH2R99hvQcgDbj13KAVu55BG3VHVzavnbwXh2C9tbNXadjTc6ptZRzUQ=="
}
```

## Security Considerations

None.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt).

<!-- links -->
[arc-0001_signed-transaction-interface]: https://arc.algorand.foundation/ARCs/arc-0001#interface-signedtxnstr
[arc-0005]: https://arc.algorand.foundation/ARCs/arc-0005
[arc-0006]: https://arc.algorand.foundation/ARCs/arc-0007
[arc-0007]: https://arc.algorand.foundation/ARCs/arc-0007
[arc-0008]: https://arc.algorand.foundation/ARCs/arc-0008
[keys-and-addresses]: https://developer.algorand.org/docs/get-details/accounts/#keys-and-addresses
[rfc4122]: https://datatracker.ietf.org/doc/html/rfc4122
[rfc4648_4]: https://datatracker.ietf.org/doc/html/rfc4648#section-4
[rfc4648_6]: https://datatracker.ietf.org/doc/html/rfc4648#section-6
[vip-03-0026]: /03/0026
