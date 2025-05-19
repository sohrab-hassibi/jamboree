#!/bin/bash

# Ensure Next.js supports dual-stack (IPv4 + IPv6) connections
export NODE_OPTIONS="--dns-result-order=ipv4first"

# Start Next.js with explicit host binding to support all IPs
npm run dev -- -H ::
