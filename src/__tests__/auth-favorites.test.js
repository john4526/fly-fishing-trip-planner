/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
const firebase = jest.requireMock('@/lib/firebase');
import { onIdTokenChanged, getIdTokenResult } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

jest.mock('@/lib/firebase', () => ({ isFirebaseConfigured: true, auth: {}, db: {} }));
jest.mock('firebase/auth', () => ({
  onIdTokenChanged: jest.fn(), getIdTokenResult: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(), signInWithEmailAndPassword: jest.fn(), signOut: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn((db, collection, uid) => `${collection}/${uid}`),
  getDoc: jest.fn(), setDoc: jest.fn(),
  arrayUnion: jest.fn(value => ({ add: value })), arrayRemove: jest.fn(value => ({ remove: value })),
}));
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const account = { uid: 'angler-1', email: 'admin@flyfishing.com', displayName: null };
let observe;
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  firebase.isFirebaseConfigured = true;
  onIdTokenChanged.mockImplementation((auth, callback) => { observe = callback; return jest.fn(); });
  getIdTokenResult.mockResolvedValue({ claims: {} });
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ favorites: ['mad-river'] }) });
  setDoc.mockResolvedValue(undefined);
});

it('disables accounts without Firebase and removes legacy password storage', async () => {
  firebase.isFirebaseConfigured = false;
  localStorage.setItem('mock_users', '[{"password":"old-secret"}]');
  localStorage.setItem('mock_user', '{"isAdmin":true}');
  const { result } = renderHook(useAuth, { wrapper });
  expect(result.current.authEnabled).toBe(false);
  expect(result.current.user).toBeNull();
  await expect(result.current.signup('person@example.com', 'new-secret')).rejects.toThrow('unavailable');
  expect(localStorage.getItem('mock_users')).toBeNull();
  expect(localStorage.getItem('mock_user')).toBeNull();
  expect(onIdTokenChanged).not.toHaveBeenCalled();
});

it('does not grant admin access based on an email address', async () => {
  const { result } = renderHook(useAuth, { wrapper });
  await act(async () => observe(account));
  expect(result.current.user.isAdmin).toBe(false);
  expect(result.current.favorites).toEqual(['mad-river']);
});

it('uses a trusted admin claim and updates it when the token changes', async () => {
  const { result } = renderHook(useAuth, { wrapper });
  getIdTokenResult.mockResolvedValueOnce({ claims: { admin: true } });
  await act(async () => observe(account));
  expect(result.current.user.isAdmin).toBe(true);
  await act(async () => observe(account));
  expect(result.current.user.isAdmin).toBe(false);
});

it('persists favorites to the current user and updates only after success', async () => {
  const { result } = renderHook(useAuth, { wrapper });
  await act(async () => observe(account));
  await act(async () => result.current.toggleFavorite('mad-river'));
  expect(setDoc).toHaveBeenCalledWith('users/angler-1', { favorites: { remove: 'mad-river' } }, { merge: true });
  expect(result.current.favorites).toEqual([]);
  await act(async () => result.current.toggleFavorite('clear-fork'));
  expect(result.current.favorites).toEqual(['clear-fork']);
});

it('keeps the saved state and exposes an error if persistence fails', async () => {
  const { result } = renderHook(useAuth, { wrapper });
  await act(async () => observe(account));
  setDoc.mockRejectedValueOnce(new Error('permission-denied'));
  await act(async () => { await expect(result.current.toggleFavorite('mad-river')).rejects.toThrow(); });
  expect(result.current.favorites).toEqual(['mad-river']);
  expect(result.current.error).toMatch(/save/i);
});

it('ignores an old account read that completes after sign-out', async () => {
  let finish;
  getDoc.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(useAuth, { wrapper });
  let pending;
  act(() => { pending = observe(account); });
  await act(async () => observe(null));
  await act(async () => { finish({ exists: () => true, data: () => ({ favorites: ['mad-river'] }) }); await pending; });
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.favorites).toEqual([]);
});
