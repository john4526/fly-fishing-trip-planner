import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createPlan, planSchema } from './outing-plan';

export const planStorageKey = uid => `streamplanner:outings:v1:${uid || 'guest'}`;
const reference = uid => doc(db, 'users', uid, 'plans', 'outings');

export async function loadPlan(uid, storage) {
  // A signed-in account is authoritative across devices. Never copy another
  // account's or a guest's draft into it implicitly.
  if (uid) {
    const snapshot = await getDoc(reference(uid));
    return { plan: snapshot.exists() ? planSchema.parse(snapshot.data()) : createPlan(), source: 'account' };
  }
  const raw = storage.getItem(planStorageKey(null));
  return { plan: raw ? planSchema.parse(JSON.parse(raw)) : createPlan(), source: raw ? 'device' : 'new' };
}

export async function savePlan(plan, uid, storage) {
  const parsed = planSchema.parse(plan);
  if (uid) {
    await setDoc(reference(uid), parsed);
    return 'Saved to your account.';
  }
  storage.setItem(planStorageKey(null), JSON.stringify(parsed));
  return 'Saved on this device.';
}
