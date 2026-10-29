/** @jest-environment jsdom */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TripPlanner, { PlannerEditor } from '@/app/plan/TripPlanner';
import { createPlan } from '@/lib/outing-plan';
import { loadPlan, savePlan } from '@/lib/plan-storage';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/lib/plan-storage', () => ({ loadPlan: jest.fn(), savePlan: jest.fn() }));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/app/components/AccountPanel', () => function Account() { return <span>Account form</span>; });
beforeEach(() => { jest.clearAllMocks(); useAuth.mockReturnValue({ user: null, loading: false }); });
const set = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

it('blocks duplicate dates, saves two different days, and retains edits after a failed save', async () => {
  savePlan.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('Saved on this device.');
  render(<PlannerEditor uid={null} initialPlan={createPlan()} />);
  set('First travel day', '2030-12-28'); set('Last travel day', '2031-01-03');
  const dates = screen.getAllByLabelText('Fishing date');
  dates.forEach(input => fireEvent.change(input, { target: { value: '2030-12-29' } }));
  expect(screen.getByText('Choose two different outing dates.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save plan' })).toBeDisabled();
  fireEvent.change(dates[1], { target: { value: '2031-01-02' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));
  await screen.findByText(/Your edits are still here/);
  expect(dates[0]).toHaveValue('2030-12-29');
  fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));
  await screen.findByText('Saved on this device.');
  expect(savePlan.mock.calls[1][0].outings.map(d => d.date)).toEqual(['2030-12-29', '2031-01-02']);
});

it('recalculates travel, keeps primary and backup distinct, and clears overrides on base changes', () => {
  render(<PlannerEditor uid={null} initialPlan={createPlan()} />);
  const first = within(screen.getByRole('group', { name: 'Outing 1' }));
  fireEvent.change(first.getByLabelText('Primary stream'), { target: { value: 'letort-spring-run' } });
  expect(first.getByLabelText('Backup stream')).toHaveValue('yellow-breeches');
  fireEvent.change(first.getByLabelText(/^One-way drive \(minutes\)/), { target: { value: '10' } });
  fireEvent.change(first.getByLabelText('Starting from'), { target: { value: 'lancaster' } });
  expect(first.getByLabelText(/^One-way drive \(minutes\)/)).toHaveValue(null);
  fireEvent.change(first.getByLabelText('Primary stream'), { target: { value: 'spring-creek' } });
  expect(first.getByText(/This outing leaves no fishing time/)).toBeInTheDocument();
});

it('locks edits and overlapping saves until the write settles', async () => {
  let finish; savePlan.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  render(<PlannerEditor uid="alice" initialPlan={createPlan()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save plan' }));
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByLabelText('First travel day')).toBeDisabled();
  expect(savePlan).toHaveBeenCalledTimes(1);
  await act(async () => finish('Saved to your account.'));
  expect(screen.getByRole('button', { name: 'Save plan' })).toBeEnabled();
});

it('requires an explicit new draft after a device read failure and does not save automatically', async () => {
  loadPlan.mockRejectedValue(new Error('bad JSON'));
  render(<TripPlanner />);
  await screen.findByText(/saved device plan could not be read/);
  expect(screen.queryByLabelText('First travel day')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start a new draft' }));
  expect(screen.getByLabelText('First travel day')).toBeInTheDocument();
  expect(savePlan).not.toHaveBeenCalled();
});

it('ignores a late account read after sign-out and blocks editing on an account read failure', async () => {
  let finish; loadPlan.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  useAuth.mockReturnValue({ user: { uid: 'alice' }, loading: false });
  const { rerender } = render(<TripPlanner />);
  await waitFor(() => expect(loadPlan).toHaveBeenCalledWith('alice', null));
  const guest = createPlan(); guest.outings[0].hours = 4;
  loadPlan.mockResolvedValueOnce({ plan: guest }); useAuth.mockReturnValue({ user: null, loading: false });
  rerender(<TripPlanner />);
  await screen.findByLabelText('First travel day');
  await act(async () => finish({ plan: createPlan() }));
  expect(screen.getAllByLabelText('Total time away')[0]).toHaveValue('4');
  loadPlan.mockRejectedValueOnce(new Error('denied')); useAuth.mockReturnValue({ user: { uid: 'bob' }, loading: false });
  rerender(<TripPlanner />);
  await screen.findByText(/account plan could not be loaded/);
  expect(screen.queryByRole('button', { name: 'Start a new draft' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('First travel day')).not.toBeInTheDocument();
});
