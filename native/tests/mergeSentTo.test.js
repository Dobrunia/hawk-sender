import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  dedupeAddresses,
  mergeSentToEntries,
} from '../lib/mergeSentTo.js'

describe('dedupeAddresses', () => {
  it('keeps one address per normalized email before SMTP send', () => {
    const addresses = dedupeAddresses([
      ' contact@example.ru ',
      'CONTACT@example.ru',
      'team@example.ru',
      '',
      null,
    ])

    assert.deepEqual(addresses, ['contact@example.ru', 'team@example.ru'])
  })
})

describe('mergeSentToEntries', () => {
  it('updates an existing recipient instead of adding a duplicate', () => {
    const sentTo = mergeSentToEntries(
      [
        { to: 'contact@example.ru', status: true },
        { to: 'team@example.ru', status: true },
      ],
      [
        {
          to: 'CONTACT@example.ru',
          status: false,
          error: 'Unknown user',
        },
      ],
    )

    assert.deepEqual(sentTo, [
      {
        to: 'contact@example.ru',
        status: false,
        error: 'Unknown user',
      },
      { to: 'team@example.ru', status: true },
    ])
  })

  it('collapses duplicates that already exist in persisted records', () => {
    const sentTo = mergeSentToEntries(
      [
        { to: 'contact@example.ru', status: false },
        { to: 'Contact@Example.ru', status: true },
      ],
      [],
    )

    assert.deepEqual(sentTo, [
      { to: 'contact@example.ru', status: true },
    ])
  })

  it('clears a previous SMTP error when the same address is accepted later', () => {
    const sentTo = mergeSentToEntries(
      [
        {
          to: 'contact@example.ru',
          status: false,
          error: 'Unknown user',
        },
      ],
      [{ to: 'contact@example.ru', status: true }],
    )

    assert.deepEqual(sentTo, [
      { to: 'contact@example.ru', status: true },
    ])
  })
})
