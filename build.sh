#!/bin/bash
set -e

# Remove sensitive fields from HTML version
jq 'del(.basics.phone)' resume.base.json > resume.json
resume export --theme short resume.html
resume export --theme elegant index.html

# Leave all fields for PDF
jq '.' resume.base.json > resume.json
resume export --theme short --format pdf resume.pdf
