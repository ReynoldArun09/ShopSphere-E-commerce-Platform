#!/usr/bin/env bash
set -euo pipefail


# Store the root directory
ROOT_DIR="$(pwd)"
PACKAGES_DIR="${ROOT_DIR}/services/packages"

# Check if pnpm is installed
if ! command -v pnpm &>/dev/null; then
  echo "Error: pnpm is not installed"
  exit 1
fi

# Function to build a package
build_package() {
  local package_name=$1
  local pkg_dir="${PACKAGES_DIR}/${package_name}"

  echo "=== Building package: ${package_name} ==="

  if [[ ! -d "${pkg_dir}" ]]; then
    echo "Error: package directory does not exist: ${pkg_dir}"
    return 1
  fi

  if [[ ! -f "${pkg_dir}/package.json" ]]; then
    echo "Error: no package.json found in: ${pkg_dir}"
    return 1
  fi

  pushd "${pkg_dir}" >/dev/null

  pnpm install

  pnpm run build:pack

  popd >/dev/null
  echo "=== Finished: ${package_name} ==="
}

echo "===== Starting Build Process ====="


if [[ $# -gt 0 ]]; then
  for pkg in "$@"; do
    build_package "${pkg}"
  done
else
  build_package "logger"
  build_package "redis"
  build_package "kafka"
  build_package "utils"
fi

echo "===== Build Process Completed Successfully ====="
