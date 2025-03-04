---
index: 80
title: Using JSON Web Tokens (JWTs) With AVM Accounts
description: A specification detailing the integration of JSON Web Tokens (JWTs) with AVM accounts, leveraging Ed25519 elliptic-curve signatures for secure identification and verification.
author: Kieran O'Neill (@kieranroneill)
status: Draft
created: 2025-02-23
---

## Abstract

JSON Web Tokens (JWTs), as defined in [RFC 7519][rfc7519], provide a compact and self-contained method for securely transmitting information between parties. This specification focuses on the use of JWTs within the context of AVM accounts, utilizing an AVM account's Ed25519 elliptic-curve public/private key pair for cryptographic signing operations.

The primary objective is to establish a specification for identifying and verifying the subject of a JWT as an AVM account. This involves leveraging Ed25519 signatures to ensure the authenticity and integrity of the token. By adhering to this approach, JWTs can be effectively integrated with AVM accounts to support secure and verifiable interactions.

## Motivation

Authentication is a wide-ranging subject and can be done in many different ways. JWTs have proven to be a hugely popular standard when it comes to authentication and, as AVM accounts at their core, are public/private key pairs using Ed25519 elliptic-curve signatures; they can easily be used to sign JWTs.

Furthermore, JWTs that are signed using an AVM account's private key, can be used by clients (such as dApps) to prove the identity of a user and can open up clients to allow limited access to their services using methods such as "scope" (as is suggested in [RFC 8693 section 4.2](https://datatracker.ietf.org/doc/html/rfc8693#section-4.2)).

This proposal serves as the basis for constructing a JWT.

## Specification

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) and [RFC 8174](https://www.ietf.org/rfc/rfc8174.txt).

> Comments like this are non-normative.

### Definitions

This section is non-normative.

* **Claim**
  - A piece of information asserted about a subject, represented as a key/value pair.
* **Claim Name**
  - The "key" part of the claim (key/value pair). It **MUST** be a string.
* **Claim Value**
  - The "value" part of the claim (key/value pair). It **MAY** be any JSON value.
* **JSON Web Algorithms (JWA)**
  - A registered list of cryptographic algorithms by the [IANA](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms); it represents the allowed values of the `"alg"` parameter of a JSON Web Token (JWT)'s header.
* **JSON Web Key (JWK)**
  - A JSON object that represents the structure of the cryptographic mechanism using the JSON Web Signature (JWS).
* **JSON Web Signature (JWS)**
  - Represents a content signature signed with a cryptographic mechanism.
* **JSON Web Token (JWT)**
  - A JSON object, with a set of claims, encoded in a JSON Web Signature (JWS).

### Overview

JSON Web Token (JWT) is an open standard ([RFC 7519][rfc7519]) that allows a compact, URL-safe means of representing claims that can be transferred between two parties.

A JWT consists of three parts separated by dots (`.`):

* **Header** - contains information about the type of token and the signing algorithm used.
* **Payload** - contains the claims, which are statements about an entity (typically, the user) and additional data.
* **Signature** - is used to verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.

Therefore, a JWT will look like the following:

```
header.payload.signature
```

> ⚠️ **NOTE**: Each part of the JWT **MUST** be encoded using base64URL ([RFC 4648 Section 5][rfc4648_5]) encoding.

### Header

An AVM address is essentially a transformed public key of a key pair that was created using an EdDSA signature with the Curve25519; or Ed25519 for short.

In order for EdDSA keys to be encoded as a JWK, the standard [RFC 8037][rfc8037] introduced a new key type: "OKP" (Octet Key Pair), which describes the use of public key algorithms, namely Ed25519 ([RFC 8032](https://datatracker.ietf.org/doc/html/rfc8032)), with a JOSE header.

When constructing the header of a JWT for AM accounts, the header must conform to the following:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "JSON Web Token (JWT) Header",
  "type": "object",
  "properties": {
    "alg": {
      "description": "Defines the cryptographic algorithm used to create the JWS",
      "type": "string"
    },
    "crv": {
      "description": "Defines the subtype, or the name of the curve used by the cryptographic algorithm",
      "type": "string"
    },
    "kty": {
      "description": "Defines the cryptographic algorithm family the cryptographic algorithm belongs to",
      "type": "string"
    },
    "typ": {
      "description": "Defines the media type of the JWT",
      "type": "string"
    },
    "x": {
      "description": "The public key of the AVM account and is used to verify that the JWS has been signed with the correct private key of an AVM account",
      "type": "string"
    }
  },
  "required": [
    "alg",
    "crv",
    "x"
  ]
}
```

where:

* `alg`:
  * **REQUIRED** as per [RFC 7515 section 4.1.1](https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.1).
  * **MUST** be `EdDSA` to indicate an Edwards-curve Digital Signature Algorithm (EdDSA) as used by AVM accounts.
* `crv`:
  * **REQUIRED** as per [RFC 8037 section 2](https://datatracker.ietf.org/doc/html/rfc8037#section-2).
  * **MUST** be `Ed25519` to indicate the name of the curve, which is Curve25519, for AVM accounts.
* `kty`:
  * **OPTIONAL** the `"alg"` parameter is sufficient to infer the JWK.
  * **MUST** be `OKP` as specified in [RFC 8037][rfc8037] for EdDSA keys.
* `typ`:
  * **OPTIONAL** as applications usually know this is a JWT.
  * **RECOMMENDED** to be `JWT` to indicate this is a JWT.
* `x`:
  * **REQUIRED** as per [RFC 8037 section 2](https://datatracker.ietf.org/doc/html/rfc8037#section-2).
  * **MUST** be the public key of an AVM account, encoded using the base64URL ([RFC 4648 Section 5][rfc4648_5]) encoding.

### Payload

The payload contains the claims of the JWT. A claim is a JSON object of key/value pairs that can provide specific details about the entity (the owner of the AVM account) or the intention of the entity. While the structure of the claim is not enforced, each claim name **MUST** be unique and the recipient **MUST** reject the JWT if there are duplicate claim names.

A claim name can fall under one of three types:

* **Registered** - are claim names that have been registered in the IANA "JSON Web Token Claims" registry and while each is not mandatory they are **RECOMMENDED**.
* **Public** - are claim names that are a public name; a value that contains a collision-resistant name.
* **Private** - are custom claim names that are agreed by all parties and are neither _registered_ nor _public_.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "JSON Web Token (JWT) Payload",
  "type": "object",
  "properties": {
    "aud": {
      "description": "Defines the intended recipient(s) of the JWT",
      "anyOf": [
        {
          "type": "string"
        },
        {
          "format": "uri",
          "type": "string"
        },
        {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "format": "uri",
                "type": "string"
              }
            ]
          }
        }
      ]
    },
    "exp": {
      "description": "Defines the date/time the JWT expires",
      "type": "number"
    },
    "iat": {
      "description": "Defines the date/time this JWT the issued",
      "type": "number"
    },
    "iss": {
      "description": "Defines the entity that issued the JWT",
      "oneOf": [
        {
          "type": "string"
        },
        {
          "format": "uri",
          "type": "string"
        }
      ]
    },
    "jti": {
      "description": "A unique identifier for the JWT that is used to prevent the same JWT being replayed",
      "type": "string"
    },
    "nbf": {
      "description": "Defines the date/time after which the JWT becomes valid",
      "type": "number"
    },
    "sub": {
      "description": "Defines the subject of the JWT",
      "type": "string"
    }
  }
}
```

where:

* `aud`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.3](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3).
  * **MUST** be rejected if the recipient of the JWT cannot identify itself with the value.
  * **MAY** be an array of string or URI ([RFC 3986][rfc3986]), if there are multiple intended recipients.
  * **MUST** be a string or URI ([RFC 3986][rfc3986]), if the intended recipient is one.
* `exp`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.4](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4).
  * **MUST** be a JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
  * **MUST** be rejected if the current date/time is after the expiration time.
* `iat`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.6](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.6).
  * **MUST** be a JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
* `iss`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.1](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1).
  * **MUST** be a string or URI ([RFC 3986][rfc3986]).
  * **RECOMMENDED** be the dApp or wallet.
* `jti`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.7](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7).
  * **MUST** be a value that ensures a negligible probability that the same value will appear on another JWT.
  * **RECOMMENDED** be a UUIDv4 ([RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122)) compliant string.
* `nbf`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.5](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.5).
  * **MUST** be a JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
  * **MUST** be rejected if the current date/time is before the "not before" time.
* `sub`:
  * **OPTIONAL** as per [RFC 7519 section 4.1.2](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2).
  * **RECOMMENDED** be the public key of the key pair used in the JWS, with a 4 byte checksum appended and encoded using base32 ([RFC 4648 section 6](https://datatracker.ietf.org/doc/html/rfc4648#section-6)) encoding; the AVM address, as defined in ([keys and addresses](https://developer.algorand.org/docs/get-details/accounts/#keys-and-addresses)).

### Signature

The signature is used to verify the message isn't changed along the way, and is signed with the private key of the AVM account.

As defined in [RFC 7515 section 3](https://datatracker.ietf.org/doc/html/rfc7515#section-3), the signature is a JSOE header, whose members are the union of the header and the payload, where each part **MUST** be encoded using base64URL ([RFC 4648 section 5][rfc4648_5]) encoding, concatenated with a dot (`.`), and then the resulting string is signed using the private key of the AVM account.

Finally, the signature's bytes **MUST** be encoded using base64URL ([RFC 4648 section 5][rfc4648_5]) encoding.

```
ed25529Sign(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  privateKey
)
```

For example, given a header:

```json
{
  "alg": "EdDSA",
  "crv": "Ed25519",
  "kty": "OKP",
  "typ": "JWT",
  "x": "FrMUY1-U6zLa5xz3r0RUmILVwqyIY30HX4JWEXTN2grk9Djs"
}
```

And a payload:

```json
{
  "aud": "https://api.awesome.com",
  "exp": 1707782400,
  "iat": 1707696000,
  "iss": "https://dapp.awesome.com",
  "jti": "22080a89-a283-48e7-96c5-87f17ce7a850",
  "nbf": 1707739200,
  "sub": "C2ZRIY27STVTFWXHDT326RCUTCBNLQVMRBRX2B27QJLBC5GN3IFOJ5BY5Q"
}
```

Encode each part using base64URL ([RFC 4648 section 5][rfc4648_5]) encoding and concatenate with a dot (`.`) to produce:

```
eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ0eXAiOiJKV1QiLCJ4IjoiRnJNVVkxLVU2ekxhNXh6M3IwUlVtSUxWd3F5SVkzMEhYNEpXRVhUTjJncms5RGpzIn0.
eyJhdWQiOiJodHRwczovL2FwaS5hd2Vzb21lLmNvbSIsImV4cCI6MTcwNzc4MjQwMCwiaWF0IjoxNzA3Njk2MDAwLCJpc3MiOiJodHRwczovL2RhcHAuYXdlc29tZS5jb20iLCJqdGkiOiIyMjA4MGE4OS1hMjgzLTQ4ZTctOTZjNS04N2YxN2NlN2E4NTAiLCJuYmYiOjE3MDc3MzkyMDAsInN1YiI6IkMyWlJJWTI3U1RWVEZXWEhEVDMyNlJDVVRDQk5MUVZNUkJSWDJCMjdRSkxCQzVHTjNJRk9KNUJZNVEifQ
```

> ⚠️ **NOTE**: line breaks have been used in the above example.

Finally, the message can be signed using the private key, encoded using base64URL ([RFC 4648 section 5][rfc4648_5]) encoding, to produce the following signature:

```
wRUxp_9qLAutcXpzVaxKZpe3foQfQU2CDsIQZLXvVadhpDFN52ZYDHq3hk4C7bw65DetjRiaCCsPzj86I-QjDg==
```

### A JSON Web Token

Once the header, payload and signature have been created, the complete token is simply a concatenation of the three parts using a dot (`.`) as a delimiter:

```
eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ0eXAiOiJKV1QiLCJ4IjoiRnJNVVkxLVU2ekxhNXh6M3IwUlVtSUxWd3F5SVkzMEhYNEpXRVhUTjJncms5RGpzIn0.
eyJhdWQiOiJodHRwczovL2FwaS5hd2Vzb21lLmNvbSIsImV4cCI6MTcwNzc4MjQwMCwiaWF0IjoxNzA3Njk2MDAwLCJpc3MiOiJodHRwczovL2RhcHAuYXdlc29tZS5jb20iLCJqdGkiOiIyMjA4MGE4OS1hMjgzLTQ4ZTctOTZjNS04N2YxN2NlN2E4NTAiLCJuYmYiOjE3MDc3MzkyMDAsInN1YiI6IkMyWlJJWTI3U1RWVEZXWEhEVDMyNlJDVVRDQk5MUVZNUkJSWDJCMjdRSkxCQzVHTjNJRk9KNUJZNVEifQ.
wRUxp_9qLAutcXpzVaxKZpe3foQfQU2CDsIQZLXvVadhpDFN52ZYDHq3hk4C7bw65DetjRiaCCsPzj86I-QjDg==
```

> ⚠️ **NOTE**: line breaks have been used in the above example.

## Rationale

The intention of this proposal is to live alongside other authentication methods, it does not aim to enforce a defacto authentication method for AVM, but to merely outline a possible authentication method: JSON Web Token (JWT) within the context of an AVM account.

## Reference Implementation

> 🚨 **WARNING**: The below examples may use third party libraries and while they serve merely as examples, you should choose your own cryptographic implementation based on an implementation you trust and that has been audited.

### 1. A TypeScript Implementation Using TweetNaCl.js

The following example uses the popular [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) library for cryptographic signing and verification.

> ⚠️ **NOTE**: At the time of writing, [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) was last audited between January-February 2017. The full audit report can be read [here](https://cure53.de/tweetnacl.pdf).

For creating and signing a JWT:

```typescript
import { decodeAddress, mnemonicToSecretKey } from 'algosdk';
import { sign } from 'tweetnacl';

// get the address and private key from the 25-word mnemonic seed phrase
const { addr, sk } = mnemonicToSecretKey('outside ancient world angry income move street brother patrol exist pet act banner quiz analyst gym build action dwarf direct castle coin fault absorb symptom');
const encodedPublicKey: string = Buffer.from(decodeAddress(addr).publicKey).toString('base64url');
const header: string = JSON.stringify({
  alg: 'EdDSA',
  crv: 'Ed25519',
  kty: 'OKP',
  typ: 'JWT',
  x: encodedPublicKey, // 7Ad4Xw3aG1dDLbcI5In9O7Pehd9xodPMvD0dHHTxXnE
});
const payload: string = JSON.stringify({
  aud: 'https://api.awesome.com',
  exp: 1707782400,
  iat: 1707696000,
  iss: 'https://dapp.awesome.com',
  jti: '22080a89-a283-48e7-96c5-87f17ce7a850',
  nbf: 1707739200,
  sub: addr, // 5QDXQXYN3INVOQZNW4EOJCP5HOZ55BO7OGQ5HTF4HUORY5HRLZYYLIY7MU
});
const encodedHeader: string = Buffer.from(header).toString('base64url');
const encodedPayload: string = Buffer.from(payload).toString('base64url');
const signature: Uint8Array = sign.detached(
  new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  sk, // sign with the avm account's private key
);
const encodedSignature: string = Buffer.from(signature).toString('base64url');

console.log(`json web token: ${encodedHeader}.${encodedPayload}.${encodedSignature}`);
/*
json web token: eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ0eXAiOiJKV1QiLCJ4IjoiN0FkNFh3M2FHMWRETGJjSTVJbjlPN1BlaGQ5eG9kUE12RDBkSEhUeFhuRSJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkuYXdlc29tZS5jb20iXSwiZXhwIjoiMjAyNC0wMi0xM1QwMDowMDowMFoiLCJqdGkiOiIyMjA4MGE4OS1hMjgzLTQ4ZTctOTZjNS04N2YxN2NlN2E4NTAiLCJpYXQiOiIyMDI0LTAyLTEyVDAwOjAwOjAwWiIsImlzcyI6Imh0dHBzOi8vZGFwcC5hd2Vzb21lLmNvbSIsIm5iZiI6IjIwMjQtMDItMTJUMTI6MDA6MDBaIiwic3ViIjoiNVFEWFFYWU4zSU5WT1FaTlc0RU9KQ1A1SE9aNTVCTzdPR1E1SFRGNEhVT1JZNUhSTFpZWUxJWTdNVSJ9.5S2MHI8LPC2cy5yv3ISNgulaEhpVk22JKyNxKi2J_uuqWCMacHgs27RuVlQbyipFlbc7z0p3AiRtxFcK8j-FCw
 */
```

To verify the JWT:

```typescript
import { decodeAddress, mnemonicToSecretKey } from 'algosdk';
import { sign } from 'tweetnacl';

const [encodedHeader, encodedPayload, encodedSignature] = jwt.split('.');
const decodedHeader: Uint8Array = Buffer.from(encodedHeader, 'base64url');
const decodedSignature: Uint8Array = Buffer.from(encodedSignature, 'base64url');
const { x } = JSON.parse(decodedHeader.toString()); // get the "x" parameter; the public key, from the header
const decodedPublicKey: Uint8Array = Buffer.from(x, 'base64url');
const isVerified: boolean = sign.detached.verify(
  new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`), // re-create the jose header that was signed using the token's encoded header and payload
  decodedSignature,
  decodedPublicKey,
);

console.log('is verified: ', isVerified);
/*
is verified: true
 */
```

### 2. A Golang Implementation

The following example uses golang's native crypto libraries.

For creating and signing a JWT:

```golang
package main

import (
  "encoding/base64"
  "encoding/json"
  "fmt"
  "github.com/algorand/go-algorand-sdk/v2/crypto"
  "github.com/algorand/go-algorand-sdk/v2/mnemonic"
  "golang.org/x/crypto/ed25519"
  "log"
  "time"
)

type Header struct {
  Algorithm string `json:"alg"`
  Curve     string `json:"crv,omitempty"`
  KeyType   string `json:"kty,omitempty"`
  Type      string `json:"typ,omitempty"`
  PublicKey string `json:"x"`
}
type RegisteredClaims struct {
  Audience  []string  `json:"aud,omitempty"`
  ExpiresAt time.Time `json:"exp,omitempty"`
  ID        string    `json:"jti,omitempty"`
  IssuedAt  time.Time `json:"iat,omitempty"`
  Issuer    string    `json:"iss,omitempty"`
  NotBefore time.Time `json:"nbf,omitempty"`
  Subject   string    `json:"sub,omitempty"`
}

func main() string {
  // get the address and private key from the 25-word mnemonic seed phrase
  privateKey, err := mnemonic.ToPrivateKey("outside ancient world angry income move street brother patrol exist pet act banner quiz analyst gym build action dwarf direct castle coin fault absorb symptom")
  if err != nil {
   log.Fatal(err)
  }

  account, err := crypto.AccountFromPrivateKey(privateKey)
  if err != nil {
    log.Fatal(err)
  }

  address := account.Address.String()

  // encode the public in base64 url safe
  encodedPublicKey := base64.RawURLEncoding.EncodeToString(privateKey.Public().(ed25519.PublicKey))

  header, err := json.Marshal(Header{
    Algorithm: "EdDSA",
    Curve:     "Ed25519",
    KeyType:   "OKP",
    Type:      "JWT",
    PublicKey: encodedPublicKey,
  })
  if err != nil {
    log.Fatal(err)
  }

  // encode the header in base64 url safe
  encodedHeader := base64.RawURLEncoding.EncodeToString(header)

  payload, err := json.Marshal(RegisteredClaims{
    Audience:  []string{"https://api.awesome.com"},
    ExpiresAt: time.Unix(1707782400, 0),
    ID:        "22080a89-a283-48e7-96c5-87f17ce7a850",
    IssuedAt:  time.Unix(1707696000, 0),
    Issuer:    "https://dapp.awesome.com",
    NotBefore: time.Unix(1707739200, 0),
    Subject:   address, // 5QDXQXYN3INVOQZNW4EOJCP5HOZ55BO7OGQ5HTF4HUORY5HRLZYYLIY7MU
  })
  if err != nil {
    log.Fatal(err)
  }

  // encode the payload in base64 url safe
  encodedPayload := base64.RawURLEncoding.EncodeToString(payload)

  signature := ed25519.Sign(
    privateKey, // sign with the avm account's private key
    []byte(fmt.Sprintf("%s.%s", encodedHeader, encodedPayload)),
  )

  // encode the signature in base64 url safe
  encodedSignature := base64.RawURLEncoding.EncodeToString(signature)

  token := fmt.Sprintf("%s.%s.%s", encodedHeader, encodedPayload, encodedSignature)

  fmt.Println(fmt.Sprintf("json web token: %s", token))

  /*
    json web token: eyJhbGciOiJFZERTQSIsImNydiI6IkVkMjU1MTkiLCJrdHkiOiJPS1AiLCJ0eXAiOiJKV1QiLCJ4IjoiN0FkNFh3M2FHMWRETGJjSTVJbjlPN1BlaGQ5eG9kUE12RDBkSEhUeFhuRSJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkuYXdlc29tZS5jb20iXSwiZXhwIjoiMjAyNC0wMi0xM1QwMDowMDowMFoiLCJqdGkiOiIyMjA4MGE4OS1hMjgzLTQ4ZTctOTZjNS04N2YxN2NlN2E4NTAiLCJpYXQiOiIyMDI0LTAyLTEyVDAwOjAwOjAwWiIsImlzcyI6Imh0dHBzOi8vZGFwcC5hd2Vzb21lLmNvbSIsIm5iZiI6IjIwMjQtMDItMTJUMTI6MDA6MDBaIiwic3ViIjoiNVFEWFFYWU4zSU5WT1FaTlc0RU9KQ1A1SE9aNTVCTzdPR1E1SFRGNEhVT1JZNUhSTFpZWUxJWTdNVSJ9.5S2MHI8LPC2cy5yv3ISNgulaEhpVk22JKyNxKi2J_uuqWCMacHgs27RuVlQbyipFlbc7z0p3AiRtxFcK8j-FCw
  */
}
```

Following on from the above example, we can add a simple function to verify the token:

```golang
package main

import (
  "encoding/base64"
  "encoding/json"
  "fmt"
  // ...
  "github.com/algorand/go-algorand-sdk/v2/types"
  "golang.org/x/crypto/ed25519"
  "log"
  "strings"
)

type Header struct {
  Algorithm string `json:"alg"`
  Curve     string `json:"crv,omitempty"`
  KeyType   string `json:"kty,omitempty"`
  Type      string `json:"typ,omitempty"`
  PublicKey string `json:"x"`
}
// ...

func main() {
  // ...

  isVerified := verify(address, token)

  fmt.Println(fmt.Sprintf("is verified: %t", isVerified))
  /*
    is verified: true
  */
}

func verify(address string, token string) bool {
  var decodedHeaderAddress types.Address
  var header Header

  tokenParts := strings.Split(token, ".")
  decodedHeader, err := base64.RawURLEncoding.DecodeString(tokenParts[0])
  if err != nil {
    log.Fatal(err)
  }
  decodedSignature, err := base64.RawURLEncoding.DecodeString(tokenParts[2])
  if err != nil {
    log.Fatal(err)
  }
  err = json.Unmarshal(decodedHeader, &header)
  if err != nil {
    log.Fatal(err)
  }
  decodedPublicKey, err := base64.RawURLEncoding.DecodeString(header.PublicKey) // get the raw public key; the "x" parameter, from the header
  if err != nil {
    log.Fatal(err)
  }

  // get the address from the header's public key
  copy(decodedHeaderAddress[:], decodedPublicKey)

  // ensure the address in the header matches an address you specify (e.g. this could be a user of your platform)
  if address != decodedHeaderAddress.String() {
    fmt.Println(fmt.Sprintf("json invalid expected address '%s' but received '%s'", address, decodedHeaderAddress))

    return false
  }

  return ed25519.Verify(
    decodedPublicKey,
    []byte(fmt.Sprintf("%s.%s", tokenParts[0], tokenParts[1])), // re-create the jose header that was signed using the header and payload
    decodedSignature,
  )
}
```

## Security Considerations

None.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt).

<!-- links -->
[rfc3986]: https://datatracker.ietf.org/doc/html/rfc3986
[rfc4648_5]: https://datatracker.ietf.org/doc/html/rfc4648#section-5
[rfc7519]: https://datatracker.ietf.org/doc/html/rfc7519
[rfc8037]: https://datatracker.ietf.org/doc/html/rfc8037
