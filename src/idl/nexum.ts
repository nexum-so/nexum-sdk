// Auto-generated from target/idl/nexum.json
export const IDL = {
  "address": "DT1ecSa7avxJurDmfeZ2ou2VJZLEoXSMYVRQxLMEg17G",
  "metadata": {
    "name": "nexum",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Nexum Protocol - AI Agent Registry on Solana"
  },
  "instructions": [
    {
      "name": "close_agent",
      "discriminator": [
        52,
        185,
        104,
        145,
        157,
        30,
        87,
        237
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "agent_card"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "close_task_record",
      "discriminator": [
        254,
        62,
        171,
        24,
        182,
        158,
        204,
        206
      ],
      "accounts": [
        {
          "name": "caller",
          "writable": true,
          "signer": true
        },
        {
          "name": "task_record",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "execute_unstake",
      "discriminator": [
        136,
        166,
        210,
        104,
        134,
        184,
        142,
        230
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "agent_card"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "pay_and_report_completed",
      "discriminator": [
        24,
        82,
        150,
        171,
        51,
        97,
        186,
        237
      ],
      "accounts": [
        {
          "name": "caller",
          "writable": true,
          "signer": true
        },
        {
          "name": "agent_card",
          "writable": true
        },
        {
          "name": "task_record",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "caller"
              },
              {
                "kind": "account",
                "path": "agent_card"
              },
              {
                "kind": "arg",
                "path": "params.nonce"
              }
            ]
          }
        },
        {
          "name": "caller_token_account",
          "docs": [
            "Caller's USDC token account (source)"
          ],
          "writable": true
        },
        {
          "name": "agent_token_account",
          "docs": [
            "Agent's USDC token account (destination)"
          ],
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "PayAndReportParams"
            }
          }
        }
      ]
    },
    {
      "name": "register_agent",
      "discriminator": [
        135,
        157,
        66,
        195,
        2,
        113,
        175,
        30
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "agent_card",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  103,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "params.agent_id"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "agent_card"
              }
            ]
          }
        },
        {
          "name": "payment_token_account",
          "docs": [
            "The agent's USDC token account"
          ]
        },
        {
          "name": "usdc_mint",
          "docs": [
            "The USDC mint"
          ]
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "RegisterAgentParams"
            }
          }
        }
      ]
    },
    {
      "name": "report_failed",
      "discriminator": [
        43,
        228,
        112,
        11,
        4,
        148,
        66,
        237
      ],
      "accounts": [
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "agent_card",
          "writable": true
        },
        {
          "name": "task_record",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "request_unstake",
      "discriminator": [
        44,
        154,
        110,
        253,
        160,
        202,
        54,
        34
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "stake_sol",
      "discriminator": [
        200,
        38,
        157,
        155,
        245,
        57,
        236,
        168
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "agent_card"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
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
      "name": "update_agent",
      "discriminator": [
        85,
        2,
        178,
        9,
        119,
        139,
        102,
        164
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "UpdateAgentParams"
            }
          }
        }
      ]
    },
    {
      "name": "update_agent_status",
      "discriminator": [
        11,
        32,
        102,
        101,
        137,
        208,
        251,
        230
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "agent_card"
          ]
        },
        {
          "name": "agent_card",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": {
            "defined": {
              "name": "AgentStatus"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "AgentCard",
      "discriminator": [
        12,
        238,
        227,
        39,
        14,
        107,
        16,
        173
      ]
    },
    {
      "name": "TaskRecord",
      "discriminator": [
        62,
        42,
        105,
        214,
        9,
        85,
        60,
        158
      ]
    },
    {
      "name": "Vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "AgentRegistered",
      "discriminator": [
        191,
        78,
        217,
        54,
        232,
        100,
        189,
        85
      ]
    },
    {
      "name": "AgentUpdated",
      "discriminator": [
        210,
        179,
        162,
        250,
        123,
        250,
        210,
        166
      ]
    },
    {
      "name": "StakeChanged",
      "discriminator": [
        242,
        117,
        195,
        222,
        185,
        209,
        114,
        219
      ]
    },
    {
      "name": "TaskCompleted",
      "discriminator": [
        132,
        223,
        98,
        152,
        2,
        9,
        57,
        128
      ]
    },
    {
      "name": "TaskFailed",
      "discriminator": [
        16,
        227,
        66,
        95,
        172,
        215,
        121,
        143
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAgentId",
      "msg": "Agent ID must be 3-32 chars, lowercase alphanumeric + hyphens"
    },
    {
      "code": 6001,
      "name": "NameTooLong",
      "msg": "Agent name exceeds 64 characters"
    },
    {
      "code": 6002,
      "name": "InvalidEndpoint",
      "msg": "Endpoint must start with https:// and be under 256 chars"
    },
    {
      "code": 6003,
      "name": "TooManySkills",
      "msg": "Maximum 10 skills allowed"
    },
    {
      "code": 6004,
      "name": "InvalidSkillTag",
      "msg": "Skill tag must be 3-32 chars, lowercase alphanumeric + hyphens"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Only the agent owner can perform this action"
    },
    {
      "code": 6006,
      "name": "AgentNotActive",
      "msg": "Agent is not in Active status"
    },
    {
      "code": 6007,
      "name": "AgentDeregistered",
      "msg": "Agent is deregistered"
    },
    {
      "code": 6008,
      "name": "UnstakeCooldownActive",
      "msg": "Unstake cooldown (24h) not elapsed"
    },
    {
      "code": 6009,
      "name": "NoUnstakeRequest",
      "msg": "No unstake request pending"
    },
    {
      "code": 6010,
      "name": "InsufficientStake",
      "msg": "Insufficient stake balance"
    },
    {
      "code": 6011,
      "name": "AgentAlreadyExists",
      "msg": "Agent already registered"
    },
    {
      "code": 6012,
      "name": "DuplicateNonce",
      "msg": "Nonce already used for this caller-agent pair"
    },
    {
      "code": 6013,
      "name": "InvalidPayment",
      "msg": "Invalid payment: wrong destination, mint, or amount"
    },
    {
      "code": 6014,
      "name": "BelowProtocolFloor",
      "msg": "Payment below protocol floor (1000 USDC lamports)"
    },
    {
      "code": 6015,
      "name": "BelowMinPrice",
      "msg": "Payment below agent minimum price"
    },
    {
      "code": 6016,
      "name": "TaskRecordNotFound",
      "msg": "Referenced TaskRecord does not exist"
    },
    {
      "code": 6017,
      "name": "TaskAlreadyFailed",
      "msg": "TaskRecord already marked as failed"
    },
    {
      "code": 6018,
      "name": "TaskRecordExpired",
      "msg": "TaskRecord past 30-day closeable window"
    },
    {
      "code": 6019,
      "name": "TaskRecordNotCloseable",
      "msg": "TaskRecord not yet closeable (30 days not elapsed)"
    }
  ],
  "types": [
    {
      "name": "AgentCard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "agent_id",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "sns_domain",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "endpoint",
            "type": "string"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "protocol_version",
            "type": "string"
          },
          {
            "name": "source",
            "type": {
              "defined": {
                "name": "AgentSource"
              }
            }
          },
          {
            "name": "mcp_url",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "payment_address",
            "type": "pubkey"
          },
          {
            "name": "usdc_mint",
            "type": "pubkey"
          },
          {
            "name": "min_price_usdc",
            "type": "u64"
          },
          {
            "name": "stake",
            "type": "u64"
          },
          {
            "name": "unstake_requested_at",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "tasks_completed",
            "type": "u64"
          },
          {
            "name": "tasks_failed",
            "type": "u64"
          },
          {
            "name": "total_usdc_received",
            "type": "u64"
          },
          {
            "name": "last_task_at",
            "type": "i64"
          },
          {
            "name": "registered_at",
            "type": "i64"
          },
          {
            "name": "updated_at",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "AgentStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AgentRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "agent_id",
            "type": "string"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "stake",
            "type": "u64"
          },
          {
            "name": "source",
            "type": {
              "defined": {
                "name": "AgentSource"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "AgentSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Native"
          },
          {
            "name": "MCP"
          }
        ]
      }
    },
    {
      "name": "AgentStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Paused"
          },
          {
            "name": "Deregistered"
          }
        ]
      }
    },
    {
      "name": "AgentUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "PayAndReportParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "payment_amount",
            "type": "u64"
          },
          {
            "name": "resource_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RegisterAgentParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_id",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "endpoint",
            "type": "string"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "protocol_version",
            "type": "string"
          },
          {
            "name": "source",
            "type": {
              "defined": {
                "name": "AgentSource"
              }
            }
          },
          {
            "name": "mcp_url",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "min_price_usdc",
            "type": "u64"
          },
          {
            "name": "sns_domain",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "StakeChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "new_amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TaskCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "caller",
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "payment_amount",
            "type": "u64"
          },
          {
            "name": "resource_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TaskFailed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "caller",
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "TaskRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "caller",
            "type": "pubkey"
          },
          {
            "name": "agent_card",
            "type": "pubkey"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "payment_amount",
            "type": "u64"
          },
          {
            "name": "resource_hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "reported_at",
            "type": "i64"
          },
          {
            "name": "closeable_at",
            "type": "i64"
          },
          {
            "name": "is_failed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UpdateAgentParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "endpoint",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "skills",
            "type": {
              "option": {
                "vec": "string"
              }
            }
          },
          {
            "name": "min_price_usdc",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "sns_domain",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "Vault",
      "docs": [
        "Empty program-owned account that holds staked SOL in its lamport balance.",
        "Seeds: [\"vault\", agent_card]"
      ],
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
} as const;
