import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, describe, it } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Refuse to run without the explicitly isolated emulator. No production project is used.
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8180') {
  throw new Error('Run npm run test:rules to start the loopback Firestore emulator.');
}

describe('Firestore favorites permissions', () => {
  let environment;
  const userDoc = (db, uid = 'alice') => doc(db, 'users', uid);
  const client = (uid = 'alice') => environment.authenticatedContext(uid).firestore();

  before(async () => {
    environment = await initializeTestEnvironment({
      projectId: 'demo-fishing-planner',
      firestore: {
        host: '127.0.0.1', port: 8180,
        rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
      },
    });
  });
  beforeEach(async () => {
    await environment.clearFirestore();
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(userDoc(context.firestore()), { favorites: ['mad-river'] });
    });
  });
  after(async () => { await environment?.cleanup(); });

  it('lets the owner read, atomically add/remove favorites, and delete their document', async () => {
    const ref = userDoc(client());
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(updateDoc(ref, { favorites: arrayUnion('ausable') }));
    await assertSucceeds(updateDoc(ref, { favorites: arrayRemove('mad-river') }));
    await assertSucceeds(deleteDoc(ref));
  });

  it('lets a new owner create a favorites-only document', async () => {
    await assertSucceeds(setDoc(userDoc(client('bob'), 'bob'), { favorites: [] }));
  });

  for (const identity of ['unauthenticated', 'bob']) {
    it(`denies ${identity} reads, updates, and deletes of another user`, async () => {
      const db = identity === 'unauthenticated' ? environment.unauthenticatedContext().firestore() : client(identity);
      const ref = userDoc(db);
      await assertFails(getDoc(ref));
      await assertFails(updateDoc(ref, { favorites: [] }));
      await assertFails(deleteDoc(ref));
      await assertFails(setDoc(userDoc(db, 'charlie'), { favorites: [] }));
    });
  }

  it('denies owner creation or modification of privileged fields', async () => {
    await assertFails(setDoc(userDoc(client('bob'), 'bob'), { favorites: [], admin: true }));
    await assertFails(updateDoc(userDoc(client()), { role: 'admin' }));
    await assertFails(setDoc(userDoc(client()), { favorites: [], admin: true }));
  });

  it('preserves server-managed fields while allowing favorites changes', async () => {
    await environment.withSecurityRulesDisabled(context =>
      updateDoc(userDoc(context.firestore()), { role: 'member' }));
    const ref = userDoc(client());
    await assertSucceeds(updateDoc(ref, { favorites: [] }));
    await assertFails(updateDoc(ref, { role: 'admin' }));
    await assertFails(setDoc(ref, { favorites: [] }));
  });

  it('accepts 100 favorites and denies oversized, missing, or non-list favorites', async () => {
    const ref = userDoc(client());
    await assertSucceeds(setDoc(ref, { favorites: Array(100).fill('mad-river') }));
    for (const value of [Array(101).fill('mad-river'), null, 'mad-river', {}]) {
      await assertFails(setDoc(ref, { favorites: value }));
    }
    await assertFails(setDoc(ref, {}));
  });

  it('denies access outside the owner document, even with an admin token', async () => {
    const db = environment.authenticatedContext('alice', { admin: true }).firestore();
    await assertFails(getDoc(userDoc(db, 'bob')));
    for (const path of ['settings/admin', 'users/alice/private/secret']) {
      await assertFails(getDoc(doc(db, path)));
      await assertFails(setDoc(doc(db, path), { favorites: [] }));
    }
  });
});
