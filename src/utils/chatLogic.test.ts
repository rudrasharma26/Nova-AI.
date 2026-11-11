import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterConversations,
  formatRelativeTime,
  createNewConversation,
  deriveTitleFromMessage,
  chunkResponseText,
  Conversation,
} from './chatLogic';

test('createNewConversation generates correct defaults', () => {
  const conv = createNewConversation();
  assert.ok(conv.id.startsWith('conv-'));
  assert.equal(conv.title, 'New conversation');
  assert.equal(conv.messages.length, 0);
  assert.ok(conv.createdAt);
  assert.ok(conv.updatedAt);
});

test('deriveTitleFromMessage trims and limits length with ellipsis', () => {
  assert.equal(deriveTitleFromMessage(''), 'New conversation');
  assert.equal(deriveTitleFromMessage('Short prompt'), 'Short prompt');
  const longPrompt = 'This is a very long message that exceeds thirty-six characters threshold';
  const derived = deriveTitleFromMessage(longPrompt);
  assert.ok(derived.length <= 40);
  assert.ok(derived.endsWith('…'));
});

test('filterConversations matches by title or message content case-insensitively', () => {
  const sampleConvs: Conversation[] = [
    {
      id: '1',
      title: 'Kafka Architecture Analysis',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{ id: 'm1', role: 'user', content: 'Compare Kafka and Pulsar', timestamp: '1' }],
    },
    {
      id: '2',
      title: 'SaaS Cohorts',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{ id: 'm2', role: 'user', content: 'Calculate net dollar retention', timestamp: '1' }],
    },
  ];

  // Empty query returns all
  assert.equal(filterConversations(sampleConvs, '').length, 2);

  // Match by title
  const matchKafka = filterConversations(sampleConvs, 'kafka');
  assert.equal(matchKafka.length, 1);
  assert.equal(matchKafka[0].id, '1');

  // Match by message content
  const matchRetention = filterConversations(sampleConvs, 'retention');
  assert.equal(matchRetention.length, 1);
  assert.equal(matchRetention[0].id, '2');

  // No match
  assert.equal(filterConversations(sampleConvs, 'nonexistent').length, 0);
});

test('formatRelativeTime formats timestamps cleanly without middle dots', () => {
  const now = new Date('2026-11-08T12:00:00Z');
  const justNow = new Date('2026-11-08T11:59:40Z').toISOString();
  const fiveMinAgo = new Date('2026-11-08T11:55:00Z').toISOString();
  const threeHoursAgo = new Date('2026-11-08T09:00:00Z').toISOString();
  const yesterday = new Date('2026-11-07T12:00:00Z').toISOString();

  assert.equal(formatRelativeTime(justNow, now), 'Just now');
  assert.equal(formatRelativeTime(fiveMinAgo, now), '5m ago');
  assert.equal(formatRelativeTime(threeHoursAgo, now), '3h ago');
  assert.equal(formatRelativeTime(yesterday, now), 'Yesterday');
});

test('chunkResponseText splits text into streamable tokens', () => {
  const text = 'Here is a quick overview of system boundaries.';
  const chunks = chunkResponseText(text);
  assert.ok(chunks.length > 1);
  assert.equal(chunks.join(''), text);
});
