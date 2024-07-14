#!/bin/bash

solana account -u m --output json-compact --output-file forked-programs/SOL_USD.json CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt

# clockwork localnet \
solana-test-validator \
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s forked-programs/metadata.so \
    --bpf-program F8dKseqmBoAkHx3c58Lmb9TgJv5qeTf3BbtZZSEzYvUa forked-programs/clockwork_network.so \
    --bpf-program CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh forked-programs/clockwork_thread_v2.so \
    --bpf-program HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny forked-programs/chainlink.so \
    --account CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt forked-programs/SOL_USD.json \
    --reset
    # --clone CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt \
    # --url mainnet-beta \  
