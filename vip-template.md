---
index: <The suggested VIP index.> # Required.
title: <The VIP title in a few words, not a complete sentence.> # Required.
description: <Description is one full (short) sentence.> # Required.
author: <A comma separated list of the author's or authors' name + GitHub username (in parenthesis), or name and email (in angle brackets). Example, FirstName LastName (@GitHubUsername), FirstName LastName <foo@bar.com>, FirstName (@GitHubUsername) and GitHubUsername (@GitHubUsername).> # Required.
status: Draft # Required.
created: <The date the VIP was created on, in ISO 8601 (yyyy-mm-dd) format.> # Required.
discussion_to: <A URL to where for the discussion of this VIP.> # Optional, but recommended.
requires: <VIP reference(s).> # Optional, only required when you reference a VIP in the `Specification` section. Otherwise, remove this field. Each referenced VIP **MUST* use the VIP's full notation and be in the format "VIP-XX-XXXX" with padded zeroes if necessary. If there is more than one VIP to reference, use a comma to separate them, e.g. VIP-03-0026,VIP-01-0001
---

<!--
  READ VIP-00-0000 (https://vips.voi.community/00/0000/) BEFORE USING THIS TEMPLATE!

  This is the suggested template for new VIPs. After you have filled in the requisite fields, please delete these comments.

  When opening a pull request to submit your VIP, ensure your VIP is located in the correct category directory (referenced by the category index) and use the suggested number as the filename, e.g. `vips/03/0200.md`.

  The title should be 44 characters or less. It should not repeat the VIP number in title, irrespective of the category.

  TODO: Remove this comment before submitting
-->

## Abstract

<!--
  The Abstract is a multi-sentence (short paragraph) technical summary. This should be a very terse and human-readable version of the specification section. Someone should be able to read only the abstract to get the gist of what this specification does.

  TODO: Remove this comment before submitting
-->

## Motivation

<!--
  This section is optional.

  The motivation section should include a description of any nontrivial problems the VIP solves. It should not describe how the VIP solves those problems, unless it is not immediately obvious. It should not describe why the VIP should be made into a standard, unless it is not immediately obvious.

  With a few exceptions, external links are not allowed. If you feel that a particular resource would demonstrate a compelling case for your VIP, then save it as a printer-friendly PDF, put it in the assets folder, and link to that copy.

  TODO: Remove this comment before submitting
-->

## Specification

<!--
  The Specification section should describe the syntax and semantics of any new feature. The specification should be detailed enough to allow competing, interoperable implementations for any of the current Voi tools/clients.

  It is recommended to follow RFC 2119 and RFC 8174. Do not remove the below key word definitions if RFC 2119 and RFC 8174 are followed.

  TODO: Remove this comment before submitting
-->

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) and [RFC 8174](https://www.ietf.org/rfc/rfc8174.txt).

## Rationale

<!--
  The rationale fleshes out the specification by describing what motivated the design and why particular design decisions were made. It should describe alternate designs that were considered and related work, e.g. how the feature is supported in other languages.

  The current placeholder is acceptable for a draft.

  TODO: Remove this comment before submitting
-->

TBD

## Backwards Compatibility

<!--

  This section is optional.

  All VIPs that introduce backwards incompatibilities must include a section describing these incompatibilities and their severity. The VIP must explain how the author proposes to deal with these incompatibilities. VIP submissions without a sufficient backwards compatibility treatise may be rejected outright.

  The current placeholder is acceptable for a draft.

  TODO: Remove this comment before submitting
-->

No backward compatibility issues found.

## Test Cases

<!--
  This section is optional for non-Core (00) VIPs.

  The Test Cases section should include expected input/output pairs, but may include a succinct set of executable tests. It should not include project build files. No new requirements may be introduced here (meaning an implementation following only the Specification section should pass all tests here.)
  If the test suite is too large to reasonably be included inline, then consider adding it as one or more files in `../assets/vips/##/####/` (e.g. ../assets/vips/00/0200/). External links will not be allowed

  TODO: Remove this comment before submitting
-->

## Reference Implementation

<!--
  This section is optional.

  The Reference Implementation section should include a minimal implementation that assists in understanding or implementing this specification. It should not include project build files. The reference implementation is not a replacement for the Specification section, and the proposal should still be understandable without it.

  If the reference implementation is too large to reasonably be included inline, then consider adding it as one or more files in `../assets/vips/##/####/` (e.g. ../assets/vips/00/0200/). External links will not be allowed.

  TODO: Remove this comment before submitting
-->

## Security Considerations

<!--
  All VIPs must contain a section that discusses the security implications/considerations relevant to the proposed change. Include information that might be important for security discussions, surfaces risks and can be used throughout the life cycle of the proposal. For example, include security-relevant design decisions, concerns, important discussions, implementation-specific guidance and pitfalls, an outline of threats and risks and how they are being addressed. VIP submissions missing the "Security Considerations" section will be rejected. An VIP cannot proceed to status "Final" without a Security Considerations discussion deemed sufficient by the reviewers.

  The current placeholder is acceptable for a draft.

  TODO: Remove this comment before submitting
-->

Needs discussion.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt).
