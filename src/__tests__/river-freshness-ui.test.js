/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import RiverPanel from '@/app/components/RiverPanel';

const now = '2026-10-29T22:00:00Z';
const gauge = { siteId: '03131982', flow: 14.2, flowUnit: 'cfs', height: 2.2, heightUnit: 'ft', flowTimestamp: '2020-10-01T01:49:08Z', heightTimestamp: '2026-10-29T21:45:00Z', checkedAt: now, flowRange: { min: 10, max: 20 } };
const corridor = { gaugeId: gauge.siteId, name: 'Clear Fork', gaugeNote: 'Height and flow have separate observation times.' };
function props(changes = {}) {
  return { corridor, river: { data: gauge, retry: jest.fn() }, extra: { retry: jest.fn() }, gauges: [gauge], activeGaugeId: gauge.siteId, onGaugeChange: jest.fn(), ...changes };
}
beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date(now)); });
afterEach(() => { jest.useRealTimers(); });

it('separates historical flow from recent height and the successful check time', () => {
  render(<RiverPanel {...props()} />);
  expect(screen.getByText('No recent reading')).toBeInTheDocument();
  expect(screen.getByText('Last available: 14.2 cfs')).toBeInTheDocument();
  expect(screen.getByText(/2020/, { selector: 'p' })).toBeInTheDocument();
  expect(screen.getByText('2.2 ft')).toBeInTheDocument();
  expect(screen.getByText('15 min ago')).toBeInTheDocument();
  expect(screen.getByText(/USGS checked:/)).toHaveTextContent('2026');
  expect(screen.queryByText(/Within reference range/)).not.toBeInTheDocument();
  expect(screen.getByText('Clear Fork Mohican River at Bellville OH')).toBeInTheDocument();
});

it('ages each measurement without a network response and hides comparison once flow is delayed', () => {
  const fresh = { ...gauge, flowTimestamp: '2026-10-29T21:00:00Z', heightTimestamp: '2026-10-29T19:00:00Z' };
  render(<RiverPanel {...props({ gauges: [fresh] })} />);
  expect(screen.getByText(/Within reference range/)).toBeInTheDocument();
  expect(screen.getByText('Delayed · 3h 0m ago')).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(60000); });
  expect(screen.getByText('Delayed · 1h 1m ago')).toBeInTheDocument();
  expect(screen.queryByText(/Within reference range/)).not.toBeInTheDocument();
});

it('allows a manual retry, disables it while pending, and keeps failed-refresh readings explicit', () => {
  const input = props({ river: { data: gauge, error: 'offline', retry: jest.fn() } });
  const { rerender } = render(<RiverPanel {...input} />);
  fireEvent.click(screen.getByRole('button', { name: 'Refresh readings' }));
  expect(input.river.retry).toHaveBeenCalledTimes(1);
  expect(input.extra.retry).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('alert')).toHaveTextContent('original measurement times');
  expect(screen.getByText('Last available: 14.2 cfs')).toBeInTheDocument();
  rerender(<RiverPanel {...input} river={{ ...input.river, refreshing: true }} />);
  expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled();
});

it('keeps unavailable extra gauges selectable and uses their own station notes', () => {
  const input = props({ corridor: { ...corridor, additionalGauges: [{ id: '03136000', name: 'Extra', note: 'Downstream station.' }] }, activeGaugeId: '03136000' });
  render(<RiverPanel {...input} />);
  expect(screen.getByRole('option', { name: /Mohican River at Greer OH/ })).toBeInTheDocument();
  expect(screen.getByText(/Downstream station/)).toBeInTheDocument();
  expect(screen.queryByText(/Height and flow have separate/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Gauge location'), { target: { value: gauge.siteId } });
  expect(input.onGaugeChange).toHaveBeenCalledWith(gauge.siteId);
});

it('explains historical stations and missing gauges without an invalid station link', () => {
  const { rerender } = render(<RiverPanel {...props({ corridor: { ...corridor, gaugeHistorical: true }, gauges: [] })} />);
  expect(screen.getByText(/Historical station/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Refresh readings' })).not.toBeInTheDocument();
  rerender(<RiverPanel {...props({ corridor: { gaugeId: null, gaugeSource: { label: 'TVA releases', url: 'https://www.tva.com/environment/lake-levels' } }, gauges: [], activeGaugeId: null })} />);
  expect(screen.getByRole('link', { name: 'TVA releases' })).toHaveAttribute('href', 'https://www.tva.com/environment/lake-levels');
  expect(screen.queryByRole('link', { name: /USGS station/ })).not.toBeInTheDocument();
});
