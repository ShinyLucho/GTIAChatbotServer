#!/usr/bin/env bash
set -euo pipefail

# Usage :
#   export OPENAI_API_KEY="sk-..."
#   ./train.sh

openai api fine_tuning.jobs.create \
  -t dataset.jsonl \
  -m gpt-3.5-turbo-0125

# openai api fine_tuning.jobs.list
# openai api fine_tuning.jobs.retrieve -i ftjob_xxxxx