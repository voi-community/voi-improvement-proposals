#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}/set_vars.sh"

# Public: Validates that a title conforms to "VIP-##-####: A Title".
#
# Examples
#
#   ./scripts/validate_pr_title.sh "VIP-##-####: A Title"
#
# Returns exit code 0 if successful, or exit 1 if the title is not correctly formatted or the title is not capitalized.
function main {
  local title

  # check if the input matches the required format
  if ! [[ "${1}" =~ ^VIP-[0-9]{2}-[0-9]{4}:\ (.*)$ ]]; then
    printf "%b title \"%b\" is not correctly formatted \n" "${INFO_PREFIX}" "${1}"

    exit 1
  fi

  title="${BASH_REMATCH[1]}"  # extract the title part

  # check if each word in the title is capitalized or in uppercase
  if ! [[ "${title}" =~ ^([A-Z][a-z]*|[A-Z]+)(\ +([A-Z][a-z]*|[A-Z]+))*$ ]]; then
    printf "%b title \"%b\" is not capitalized \n" "${INFO_PREFIX}" "${title}"

    exit 1
  fi

  exit 0
}

# and so, it begins...
main "$@"
