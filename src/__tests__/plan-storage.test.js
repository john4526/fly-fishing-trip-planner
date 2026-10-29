import { getDoc, setDoc, doc } from 'firebase/firestore';
import { loadPlan, savePlan, planStorageKey } from '@/lib/plan-storage';
import { createPlan } from '@/lib/outing-plan';

jest.mock('@/lib/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn((db, ...path) => path.join('/')), getDoc: jest.fn(), setDoc: jest.fn() }));
beforeEach(() => jest.clearAllMocks());
const device = () => ({ getItem: jest.fn(), setItem: jest.fn() });

it('restores a saved device plan and never overwrites malformed saved data on load', async () => {
  const storage = device();
  const plan = createPlan(); plan.outings[0].hours = 4;
  storage.getItem.mockReturnValue(JSON.stringify(plan));
  expect((await loadPlan(null, storage)).plan).toEqual(plan);
  await savePlan(plan, null, storage);
  expect(storage.setItem).toHaveBeenCalledWith(planStorageKey(null), JSON.stringify(plan));
  storage.setItem.mockClear(); storage.getItem.mockReturnValue('{bad');
  await expect(loadPlan(null, storage)).rejects.toThrow();
  expect(storage.setItem).not.toHaveBeenCalled();
});

it('uses only the signed-in account path and never imports a device draft implicitly', async () => {
  const storage = device();
  getDoc.mockResolvedValue({ exists: () => false });
  expect((await loadPlan('alice', storage)).source).toBe('account');
  await savePlan(createPlan(), 'alice', storage);
  expect(doc).toHaveBeenLastCalledWith({}, 'users', 'alice', 'plans', 'outings');
  expect(setDoc).toHaveBeenCalledWith('users/alice/plans/outings', createPlan());
  expect(storage.getItem).not.toHaveBeenCalled();
  expect(storage.setItem).not.toHaveBeenCalled();
});

it('propagates cloud read/write and device quota failures without pretending success', async () => {
  getDoc.mockRejectedValue(new Error('denied')); setDoc.mockRejectedValue(new Error('offline'));
  await expect(loadPlan('alice')).rejects.toThrow('denied');
  await expect(savePlan(createPlan(), 'alice')).rejects.toThrow('offline');
  const storage = device(); storage.setItem.mockImplementation(() => { throw new Error('quota'); });
  await expect(savePlan(createPlan(), null, storage)).rejects.toThrow('quota');
});
