#!/bin/bash

DATE=$(printf '%(%Y-%m-%d)T' -1 )
docker buildx build --platform=linux/amd64,linux/arm64 -t georgiastuart/unity-website:latest -t georgiastuart/unity-website:${1:-$DATE} -f scripts/build_helpers/linux/build-dockerfile --push scripts/build_helpers/linux
