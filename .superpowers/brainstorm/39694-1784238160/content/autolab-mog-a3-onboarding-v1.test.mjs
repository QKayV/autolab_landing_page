import test from 'node:test';
import assert from 'node:assert/strict';
import { tabIndexForKey } from './autolab-mog-a3-onboarding-v1.js';

test('tab arrow keys wrap and Home or End reach the boundaries', () => {
  assert.equal(tabIndexForKey(0, 3, 'ArrowRight'), 1);
  assert.equal(tabIndexForKey(2, 3, 'ArrowRight'), 0);
  assert.equal(tabIndexForKey(0, 3, 'ArrowLeft'), 2);
  assert.equal(tabIndexForKey(1, 3, 'Home'), 0);
  assert.equal(tabIndexForKey(1, 3, 'End'), 2);
  assert.equal(tabIndexForKey(1, 3, 'Enter'), 1);
});
