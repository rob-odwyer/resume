#!/bin/bash
BUCKET="s3://rob.odwyer.cc/"

aws s3 sync --dryrun --exclude ".git*" --exclude "*.sh" --acl "public-read" ./ ${BUCKET}

read -p "Press any key to proceed" CONT
echo

aws s3 sync --exclude ".git*" --exclude "*.sh" --acl "public-read" ./ ${BUCKET}
