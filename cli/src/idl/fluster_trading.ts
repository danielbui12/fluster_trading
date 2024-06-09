export type FlusterTrading = {
    "version": "0.1.0",
    "name": "fluster_trading",
    "instructions": [
        {
            "name": "initialize",
            "docs": [
                "Initialize token pool",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `trading_fee_rate` - the trading fee rate",
                "* `protocol_fee_rate` - the protocol fee rate",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Address paying to create the pool. Can be anyone"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Initialize an account to store the pool state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tradingTokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Token mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "To create a new program account"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Sysvar for program account"
                    ]
                }
            ],
            "args": [
                {
                    "name": "tradingFeeRate",
                    "type": "u16"
                },
                {
                    "name": "protocolFeeRate",
                    "type": "u16"
                }
            ]
        },
        {
            "name": "updatePoolState",
            "docs": [
                "Update pool state",
                "Must be called by the current admin",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `param`- The value can be 0 | 1, otherwise will report a error",
                "* `value`- The value of the equivalent field",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The admin"
                    ]
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Pool state  account to be changed"
                    ]
                }
            ],
            "args": [
                {
                    "name": "param",
                    "type": "u8"
                },
                {
                    "name": "value",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "collectFee",
            "docs": [
                "Collect fees",
                "Must be called by the current admin",
                "",
                "# Arguments",
                "",
                "* `ctx` - The context of accounts",
                "* `amount_requested` - Amount to collect",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": false,
                    "isSigner": true,
                    "docs": [
                        "Only admin can collect fee now"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Pool state stores accumulated protocol fee amount"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The address that holds pool tokens"
                    ]
                },
                {
                    "name": "vaultMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The mint of token vault"
                    ]
                },
                {
                    "name": "recipientTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The address that receives the collected token_0 protocol fees"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The SPL program to perform token transfers"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amountRequested",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "deposit",
            "docs": [
                "User deposits token to vault",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - Amount to deposit",
                ""
            ],
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "user token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following FT token mint"
                    ]
                },
                {
                    "name": "userTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "user token mint"
                    ]
                },
                {
                    "name": "destinationTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "FT token mint"
                    ]
                },
                {
                    "name": "userTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens. Make this separate to support Token 2022 extension"
                    ]
                },
                {
                    "name": "destinationTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "payer"
                    ]
                },
                {
                    "name": "operator",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "operator"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "rent program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdraw",
            "docs": [
                "User withdraws token from vault",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - Amount to withdraw",
                ""
            ],
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "user token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following FT token mint"
                    ]
                },
                {
                    "name": "userTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "user token mint"
                    ]
                },
                {
                    "name": "destinationTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "FT token mint"
                    ]
                },
                {
                    "name": "userTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens. Make this separate to support Token 2022 extension"
                    ]
                },
                {
                    "name": "destinationTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "payer"
                    ]
                },
                {
                    "name": "operator",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "operator"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "rent program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "closeAccount",
            "docs": [
                "User close account",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": false,
                    "isSigner": true,
                    "docs": [
                        "The user performing the DeployPair"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Token mint, the key must smaller then token mint."
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "System program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "betting",
            "docs": [
                "Place an betting order for the given token pool",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - the amount to bet",
                "* `trade_direction` - the price trading. 1 for up, 0 for down",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for token"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault of the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The Clockwork thread program.",
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "priceSlippage",
                    "type": "u64"
                },
                {
                    "name": "destinationTimestamp",
                    "type": "i64"
                },
                {
                    "name": "tradeDirection",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "reveal",
            "docs": [
                "Reveal the order after the deadline",
                "Only thread can triggers this",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The owner performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "cancel",
            "docs": [
                "Cancel the betting order",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for token"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "complete",
            "docs": [
                "Complete the order after revealed",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for FT mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "closeBetting",
            "docs": [
                "Close the betting after revealed",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for FT mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "bettingState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolState",
                        "docs": [
                            "Which betting belongs"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "owner",
                        "docs": [
                            "owner of this account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "betAmount",
                        "docs": [
                            "amount of bet"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "tradeDirection",
                        "docs": [
                            "trade_direction"
                        ],
                        "type": {
                            "defined": "TradeDirection"
                        }
                    },
                    {
                        "name": "positionPrice",
                        "docs": [
                            "current price"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "destinationTimestamp",
                        "docs": [
                            "destination timestamp"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "resultPrice",
                        "docs": [
                            "current price"
                        ],
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "poolState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "mint",
                        "docs": [
                            "mint account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenOracle",
                        "docs": [
                            "Token oracle account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenVault",
                        "docs": [
                            "Token"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "authBump",
                        "docs": [
                            "main authority bump"
                        ],
                        "type": "u8"
                    },
                    {
                        "name": "status",
                        "docs": [
                            "Bitwise representation of the state of the pool",
                            "bit0, 1: disable deposit(value is 1), 0: normal",
                            "bit1, 1: disable withdraw(value is 2), 0: normal",
                            "bit2, 1: disable swap(value is 4), 0: normal"
                        ],
                        "type": "u8"
                    },
                    {
                        "name": "protocolFeeRate",
                        "docs": [
                            "The protocol fee. DENOMINATOR: 10_000 aka 100%"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "tradingFeeRate",
                        "docs": [
                            "The trading fee. DENOMINATOR: 10_000 aka 100%"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "padding",
                        "docs": [
                            "padding for future updates"
                        ],
                        "type": {
                            "array": [
                                "u64",
                                32
                            ]
                        }
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "TradeDirection",
            "docs": [
                "The direction of a trade, since curves can be specialized to treat each",
                "token differently (by adding offsets or weights)"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Up"
                    },
                    {
                        "name": "Down"
                    }
                ]
            }
        },
        {
            "name": "RoundDirection",
            "docs": [
                "The direction to round.  Used for pool token to trading token conversions to",
                "avoid losing value on any deposit or withdrawal."
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Floor"
                    },
                    {
                        "name": "Ceiling"
                    }
                ]
            }
        },
        {
            "name": "PoolStatusBitIndex",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Bet"
                    },
                    {
                        "name": "Withdraw"
                    }
                ]
            }
        },
        {
            "name": "PoolStatusBitFlag",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Enable"
                    },
                    {
                        "name": "Disable"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "PoolInitialized",
            "fields": [
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "tokenOracle",
                    "type": "publicKey",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderPlaced",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "tokenVault",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amountIn",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "tradeDirection",
                    "type": "u8",
                    "index": false
                },
                {
                    "name": "destinationTimestamp",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderFulfilled",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "result",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderCancelled",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                }
            ]
        },
        {
            "name": "OrderCompleted",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidAmount",
            "msg": "Invalid amount"
        },
        {
            "code": 6001,
            "name": "NotApproved",
            "msg": "Not approved"
        },
        {
            "code": 6002,
            "name": "InvalidOwner",
            "msg": "Input account owner is not the program address"
        },
        {
            "code": 6003,
            "name": "InvalidInput",
            "msg": "InvalidInput"
        },
        {
            "code": 6004,
            "name": "ExceededSlippage",
            "msg": "Exceeds desired slippage limit"
        },
        {
            "code": 6005,
            "name": "NotSupportMint",
            "msg": "Not support token_2022 mint extension"
        },
        {
            "code": 6006,
            "name": "FailedPositionCalculation",
            "msg": "Failed to calculate position"
        }
    ]
};

export const IDL: FlusterTrading = {
    "version": "0.1.0",
    "name": "fluster_trading",
    "instructions": [
        {
            "name": "initialize",
            "docs": [
                "Initialize token pool",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `trading_fee_rate` - the trading fee rate",
                "* `protocol_fee_rate` - the protocol fee rate",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Address paying to create the pool. Can be anyone"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Initialize an account to store the pool state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tradingTokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Token mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "To create a new program account"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Sysvar for program account"
                    ]
                }
            ],
            "args": [
                {
                    "name": "tradingFeeRate",
                    "type": "u16"
                },
                {
                    "name": "protocolFeeRate",
                    "type": "u16"
                }
            ]
        },
        {
            "name": "updatePoolState",
            "docs": [
                "Update pool state",
                "Must be called by the current admin",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `param`- The value can be 0 | 1, otherwise will report a error",
                "* `value`- The value of the equivalent field",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The admin"
                    ]
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Pool state  account to be changed"
                    ]
                }
            ],
            "args": [
                {
                    "name": "param",
                    "type": "u8"
                },
                {
                    "name": "value",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "collectFee",
            "docs": [
                "Collect fees",
                "Must be called by the current admin",
                "",
                "# Arguments",
                "",
                "* `ctx` - The context of accounts",
                "* `amount_requested` - Amount to collect",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": false,
                    "isSigner": true,
                    "docs": [
                        "Only admin can collect fee now"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Pool state stores accumulated protocol fee amount"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The address that holds pool tokens"
                    ]
                },
                {
                    "name": "vaultMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The mint of token vault"
                    ]
                },
                {
                    "name": "recipientTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The address that receives the collected token_0 protocol fees"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The SPL program to perform token transfers"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amountRequested",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "deposit",
            "docs": [
                "User deposits token to vault",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - Amount to deposit",
                ""
            ],
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "user token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following FT token mint"
                    ]
                },
                {
                    "name": "userTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "user token mint"
                    ]
                },
                {
                    "name": "destinationTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "FT token mint"
                    ]
                },
                {
                    "name": "userTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens. Make this separate to support Token 2022 extension"
                    ]
                },
                {
                    "name": "destinationTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "payer"
                    ]
                },
                {
                    "name": "operator",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "operator"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "rent program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdraw",
            "docs": [
                "User withdraws token from vault",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - Amount to withdraw",
                ""
            ],
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "user token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following user token mint"
                    ]
                },
                {
                    "name": "operatorAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "operator token vault following FT token mint"
                    ]
                },
                {
                    "name": "userTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "user token mint"
                    ]
                },
                {
                    "name": "destinationTokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "FT token mint"
                    ]
                },
                {
                    "name": "userTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens. Make this separate to support Token 2022 extension"
                    ]
                },
                {
                    "name": "destinationTokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "payer"
                    ]
                },
                {
                    "name": "operator",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "operator"
                    ]
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "rent program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "closeAccount",
            "docs": [
                "User close account",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": false,
                    "isSigner": true,
                    "docs": [
                        "The user performing the DeployPair"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Token mint, the key must smaller then token mint."
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Program to create mint account and mint tokens"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "System program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "betting",
            "docs": [
                "Place an betting order for the given token pool",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                "* `amount` - the amount to bet",
                "* `trade_direction` - the price trading. 1 for up, 0 for down",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for token"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault of the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The Clockwork thread program.",
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                },
                {
                    "name": "priceSlippage",
                    "type": "u64"
                },
                {
                    "name": "destinationTimestamp",
                    "type": "i64"
                },
                {
                    "name": "tradeDirection",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "reveal",
            "docs": [
                "Reveal the order after the deadline",
                "Only thread can triggers this",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The owner performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "cancel",
            "docs": [
                "Cancel the betting order",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for token"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenOracle",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "complete",
            "docs": [
                "Complete the order after revealed",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user performing the trading"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for FT mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": []
        },
        {
            "name": "closeBetting",
            "docs": [
                "Close the betting after revealed",
                "",
                "# Arguments",
                "",
                "* `ctx`- The context of accounts",
                ""
            ],
            "accounts": [
                {
                    "name": "payer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Payer"
                    ]
                },
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "poolState",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The program account of the pool in which the swap will be performed"
                    ]
                },
                {
                    "name": "userAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "The user token account for FT mint"
                    ]
                },
                {
                    "name": "tokenVault",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Token vault for the pool"
                    ]
                },
                {
                    "name": "userBetting",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "betting state"
                    ]
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The FT mint"
                    ]
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The token program"
                    ]
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "system program"
                    ]
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "bettingState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "poolState",
                        "docs": [
                            "Which betting belongs"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "owner",
                        "docs": [
                            "owner of this account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "betAmount",
                        "docs": [
                            "amount of bet"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "tradeDirection",
                        "docs": [
                            "trade_direction"
                        ],
                        "type": {
                            "defined": "TradeDirection"
                        }
                    },
                    {
                        "name": "positionPrice",
                        "docs": [
                            "current price"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "destinationTimestamp",
                        "docs": [
                            "destination timestamp"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "resultPrice",
                        "docs": [
                            "current price"
                        ],
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "poolState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "mint",
                        "docs": [
                            "mint account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenOracle",
                        "docs": [
                            "Token oracle account"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "tokenVault",
                        "docs": [
                            "Token"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "authBump",
                        "docs": [
                            "main authority bump"
                        ],
                        "type": "u8"
                    },
                    {
                        "name": "status",
                        "docs": [
                            "Bitwise representation of the state of the pool",
                            "bit0, 1: disable deposit(value is 1), 0: normal",
                            "bit1, 1: disable withdraw(value is 2), 0: normal",
                            "bit2, 1: disable swap(value is 4), 0: normal"
                        ],
                        "type": "u8"
                    },
                    {
                        "name": "protocolFeeRate",
                        "docs": [
                            "The protocol fee. DENOMINATOR: 10_000 aka 100%"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "tradingFeeRate",
                        "docs": [
                            "The trading fee. DENOMINATOR: 10_000 aka 100%"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "padding",
                        "docs": [
                            "padding for future updates"
                        ],
                        "type": {
                            "array": [
                                "u64",
                                32
                            ]
                        }
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "TradeDirection",
            "docs": [
                "The direction of a trade, since curves can be specialized to treat each",
                "token differently (by adding offsets or weights)"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Up"
                    },
                    {
                        "name": "Down"
                    }
                ]
            }
        },
        {
            "name": "RoundDirection",
            "docs": [
                "The direction to round.  Used for pool token to trading token conversions to",
                "avoid losing value on any deposit or withdrawal."
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Floor"
                    },
                    {
                        "name": "Ceiling"
                    }
                ]
            }
        },
        {
            "name": "PoolStatusBitIndex",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Bet"
                    },
                    {
                        "name": "Withdraw"
                    }
                ]
            }
        },
        {
            "name": "PoolStatusBitFlag",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Enable"
                    },
                    {
                        "name": "Disable"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "PoolInitialized",
            "fields": [
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "tokenOracle",
                    "type": "publicKey",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderPlaced",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "tokenVault",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "amountIn",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "tradeDirection",
                    "type": "u8",
                    "index": false
                },
                {
                    "name": "destinationTimestamp",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderFulfilled",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "result",
                    "type": "u64",
                    "index": false
                }
            ]
        },
        {
            "name": "OrderCancelled",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                }
            ]
        },
        {
            "name": "OrderCompleted",
            "fields": [
                {
                    "name": "bettingId",
                    "type": "publicKey",
                    "index": true
                },
                {
                    "name": "poolId",
                    "type": "publicKey",
                    "index": true
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidAmount",
            "msg": "Invalid amount"
        },
        {
            "code": 6001,
            "name": "NotApproved",
            "msg": "Not approved"
        },
        {
            "code": 6002,
            "name": "InvalidOwner",
            "msg": "Input account owner is not the program address"
        },
        {
            "code": 6003,
            "name": "InvalidInput",
            "msg": "InvalidInput"
        },
        {
            "code": 6004,
            "name": "ExceededSlippage",
            "msg": "Exceeds desired slippage limit"
        },
        {
            "code": 6005,
            "name": "NotSupportMint",
            "msg": "Not support token_2022 mint extension"
        },
        {
            "code": 6006,
            "name": "FailedPositionCalculation",
            "msg": "Failed to calculate position"
        }
    ]
};
