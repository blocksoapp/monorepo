"""
This module contains python dictionaries representing
the request data that our webhook receives from Alchemy Notify.
"""

# a simple external ETH transfer
eth_transfer = {
    'webhookId': 'wh_yk5fvkminmnucm4g',
    'id': 'whevt_03snbtkjwqr5r5tt',
    'createdAt': '2023-01-10T23:47:13.698Z',
    'type': 'ADDRESS_ACTIVITY',
    'event': {
        'network': 'ETH_MAINNET',
        'activity': [{
            'fromAddress': '0x3fe365e0e31edb9a58256f95b1bcaa160ab5a05d',
            'toAddress': '0x1d4621c0cd990c84a938ee293456191055aee5bc',
            'blockNum': '0xf9ef84',
            'hash': '0x1c51e9c3d9de72a6ab20bd87a9d03122fecf371b385b2dbb844a2da5316d24a4',
            'value': 1.21700968,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0x10e3afdb209ca000',
                    'decimals': 18
            }
        }]
    }
}


# multiple ETH transfers
multiple_eth_transfers = {
    'webhookId': 'wh_yk5fvkminmnucm4g',
    'id': 'whevt_9ek1p1rtw1egmb9x',
    'createdAt': '2023-01-10T23:43:13.904Z',
    'type': 'ADDRESS_ACTIVITY',
    'event': {
        'network': 'ETH_MAINNET',
        'activity': [{
            'fromAddress': '0x528502cfc640fdb4ec2349ab2a9645236b12b23b',
            'toAddress': '0xa01c0735c7ca5f8efc1e63efa5f2d1c4fc1a4714',
            'blockNum': '0xf9ef71',
            'hash': '0x4ef1dafccad91b87c64427f158ff531267df2ecd58cdc3e50c094bb7e921b210',
            'value': 0.049689763295705,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0xb088939236b7a8',
                    'decimals': 18
            }
    }, {
            'fromAddress': '0xdfc946bdd0ec165d8865a133223c4589c81c1099',
            'toAddress': '0xa01c0735c7ca5f8efc1e63efa5f2d1c4fc1a4714',
            'blockNum': '0xf9ef71',
            'hash': '0x491b595e7ffb47676212af960e61662b6a5258f1c367056da88a702b104f783d',
            'value': 0.049538,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0xaffe8c6ce22000',
                    'decimals': 18
            }
    }, {
            'fromAddress': '0x661279325bcabba343e9368377bb20e53c79667b',
            'toAddress': '0xa01c0735c7ca5f8efc1e63efa5f2d1c4fc1a4714',
            'blockNum': '0xf9ef71',
            'hash': '0x96999cd0d08c704ffa74f902deb499c432ed85f72d13914026cceee33f1606aa',
            'value': 0.049538,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0xaffe8c6ce22000',
                    'decimals': 18
            }
    }, {
            'fromAddress': '0xf96a7df1c5a8d06e00b1609f914388817bbe2d52',
            'toAddress': '0xa01c0735c7ca5f8efc1e63efa5f2d1c4fc1a4714',
            'blockNum': '0xf9ef71',
            'hash': '0xea34bcdfae8c91741f72fb5d142ce956d65d161a54a8058b2bda4baed998f006',
            'value': 0.049538,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0xaffe8c6ce22000',
                    'decimals': 18
            }
    }, {
            'fromAddress': '0x7f312cbf084229166d246d512cb36edc4902953f',
            'toAddress': '0xa01c0735c7ca5f8efc1e63efa5f2d1c4fc1a4714',
            'blockNum': '0xf9ef71',
            'hash': '0x358e3197ca60e3af6d2154dff316121ddfdc1918537dac3629c804550e67559e',
            'value': 0.049689763295705,
            'asset': 'ETH',
            'category': 'external',
            'rawContract': {
                    'rawValue': '0xb088939236b7a8',
                    'decimals': 18
            }
        }]
    }
}


# a simple ERC20 transfer
erc20_transfer = {
    'webhookId': 'wh_yk5fvkminmnucm4g',
    'id': 'whevt_cfwp35somkkqdcpb',
    'createdAt': '2023-01-11T00:12:48.766Z',
    'type': 'ADDRESS_ACTIVITY',
    'event': {
            'network': 'ETH_MAINNET',
            'activity': [{
                    'fromAddress': '0xcd531ae9efcce479654c4926dec5f6209531ca7b',
                    'toAddress': '0x71dff275e484ba595dff5480bd322c051c8849d7',
                    'blockNum': '0xf9f004',
                    'hash': '0x696482737a5339a0217db64b5f3e17ff57be8da4860ae74189bf5a9257cda55a',
                    'value': 36774.200374666994,
                    'asset': 'FET',
                    'category': 'token',
                    'rawContract': {
                            'rawValue': '0x0000000000000000000000000000000000000000000007c9888cb2b21724b3ac',
                            'address': '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
                            'decimals': 18
                    },
                    'log': {
                            'address': '0xaea46a60368a7bd060eec7df8cba43b7ef41ad85',
                            'topics': ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x000000000000000000000000cd531ae9efcce479654c4926dec5f6209531ca7b', '0x00000000000000000000000071dff275e484ba595dff5480bd322c051c8849d7'],
                            'data': '0x0000000000000000000000000000000000000000000007c9888cb2b21724b3ac',
                            'blockNumber': '0xf9f004',
                            'transactionHash': '0x696482737a5339a0217db64b5f3e17ff57be8da4860ae74189bf5a9257cda55a',
                            'transactionIndex': '0x5d',
                            'blockHash': '0xe37b29e19ebc6172128b74f12aac8e3c75e359941b5fba4d3510d7712119daf6',
                            'logIndex': '0xa5',
                            'removed': False
                    }
            }]
    }
}


# a simple ERC721 transfer
erc721_transfer = {
    'webhookId': 'wh_yk5fvkminmnucm4g',
    'id': 'whevt_p4yaje6cbnr15rgt',
    'createdAt': '2023-01-10T23:17:01.482Z',
    'type': 'ADDRESS_ACTIVITY',
    'event': {
        'network': 'ETH_MAINNET',
        'activity': [{
                'fromAddress': '0x0000000000000000000000000000000000000000',
                'toAddress': '0x3fbe2fd902d278e3f05575149505f998445ea4b0',
                'blockNum': '0xf9eef0',
                'hash': '0xf9446e2c40ca94da9e05da90c81953368862c089fffceb0d4ec08cadb0a76aaa',
                'erc721TokenId': '0xa',
                'category': 'token',
                'rawContract': {
                        'rawValue': '0x',
                        'address': '0x3aff6115ca56bc163e5c76bf82be19dd1c1272d5'
                },
                'log': {
                        'address': '0x3aff6115ca56bc163e5c76bf82be19dd1c1272d5',
                        'topics': ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000003fbe2fd902d278e3f05575149505f998445ea4b0', '0x000000000000000000000000000000000000000000000000000000000000000a'],
                        'data': '0x',
                        'blockNumber': '0xf9eef0',
                        'transactionHash': '0xf9446e2c40ca94da9e05da90c81953368862c089fffceb0d4ec08cadb0a76aaa',
                        'transactionIndex': '0x3e',
                        'blockHash': '0x60ffa52dbe7e14943ebf5802d7efc904b7e1e07c7b43470c61fa6a08881952ea',
                        'logIndex': '0xb6',
                        'removed': False
                }
        }]
    }
}


# a reorged ERC721 transfer, note removed=True
reorged_erc721_transfer = {
    'webhookId': 'wh_yk5fvkminmnucm4g',
    'id': 'whevt_p4yaje6cbnr15rgt',
    'createdAt': '2023-01-10T23:17:01.482Z',
    'type': 'ADDRESS_ACTIVITY',
    'event': {
        'network': 'ETH_MAINNET',
        'activity': [{
                'fromAddress': '0x0000000000000000000000000000000000000000',
                'toAddress': '0x3fbe2fd902d278e3f05575149505f998445ea4b0',
                'blockNum': '0xf9eef0',
                'hash': '0xf9446e2c40ca94da9e05da90c81953368862c089fffceb0d4ec08cadb0a76aaa',
                'erc721TokenId': '0xa',
                'category': 'token',
                'rawContract': {
                        'rawValue': '0x',
                        'address': '0x3aff6115ca56bc163e5c76bf82be19dd1c1272d5'
                },
                'log': {
                        'address': '0x3aff6115ca56bc163e5c76bf82be19dd1c1272d5',
                        'topics': ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000003fbe2fd902d278e3f05575149505f998445ea4b0', '0x000000000000000000000000000000000000000000000000000000000000000a'],
                        'data': '0x',
                        'blockNumber': '0xf9eef0',
                        'transactionHash': '0xf9446e2c40ca94da9e05da90c81953368862c089fffceb0d4ec08cadb0a76aaa',
                        'transactionIndex': '0x3e',
                        'blockHash': '0x60ffa52dbe7e14943ebf5802d7efc904b7e1e07c7b43470c61fa6a08881952ea',
                        'logIndex': '0xb6',
                        'removed': True
                }
        }]
    }
}

