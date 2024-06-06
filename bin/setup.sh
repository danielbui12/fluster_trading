#!/bin/bash

clockwork localnet \
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s forked-programs/metadata.so \
    --bpf-program F8dKseqmBoAkHx3c58Lmb9TgJv5qeTf3BbtZZSEzYvUa forked-programs/clockwork_network.so \
    --bpf-program CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh forked-programs/clockwork_thread_v2.so \
    --clone H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG \
    --url mainnet-beta
