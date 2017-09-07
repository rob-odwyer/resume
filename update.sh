#!/bin/bash
BUCKET="s3://rob.odwyer.cc/"

aws s3 sync --exclude ".git*" --exclude "*.sh" --acl "public-read" ./ ${BUCKET}
