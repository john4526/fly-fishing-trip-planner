/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import KanbanBoard from '@/app/admin/kanban/KanbanBoard';

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

it.each(['{broken', '{"tasks":[]}'])('recovers from invalid storage without overwriting it on load', raw => {
  localStorage.setItem('admin_kanban_tasks', raw);
  render(<KanbanBoard />);
  expect(screen.getByRole('alert')).toHaveTextContent('Saved tasks could not be read');
  expect(screen.getByRole('heading', { name: 'Integrate Ohio Fish Stocking Data' })).toBeInTheDocument();
  expect(localStorage.getItem('admin_kanban_tasks')).toBe(raw);
});

it('persists status changes and restores them on remount', () => {
  const { unmount } = render(<KanbanBoard />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Status: Integrate Ohio Fish Stocking Data' }), { target: { value: 'Done' } });
  expect(JSON.parse(localStorage.getItem('admin_kanban_tasks'))[0].status).toBe('Done');
  unmount();
  render(<KanbanBoard />);
  expect(screen.getByRole('combobox', { name: 'Status: Integrate Ohio Fish Stocking Data' })).toHaveValue('Done');
});

it('reports failed writes without presenting unsaved changes as persisted', () => {
  render(<KanbanBoard />);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  fireEvent.change(screen.getByRole('combobox', { name: 'Status: Integrate Ohio Fish Stocking Data' }), { target: { value: 'Done' } });
  expect(screen.getByRole('alert')).toHaveTextContent('Changes could not be saved');
  expect(screen.getByRole('combobox', { name: 'Status: Integrate Ohio Fish Stocking Data' })).toHaveValue('To Do');
});
