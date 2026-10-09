import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const save = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-start', () => ({ useServerFn: () => save }));
vi.mock('@/lib/inquiries.functions', () => ({ submitInquiry: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
import { InterestForm } from '@/components/interest-forms';
function fill(partnership = false) {
  if (partnership) {
    fireEvent.change(screen.getByLabelText('Organization name'), { target: { value: 'Test Organization' } });
    fireEvent.change(screen.getByLabelText('Organization category'), { target: { value: 'University / IIT / NIT' } });
    fireEvent.change(screen.getByLabelText('Contact person'), { target: { value: 'Test Person' } });
    fireEvent.change(screen.getByLabelText('Proposed collaboration'), { target: { value: 'A campus mentorship collaboration.' } });
  } else {
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Person' } });
    fireEvent.change(screen.getByLabelText('I am a'), { target: { value: 'Founder' } });
    fireEvent.click(screen.getByLabelText('Founder community'));
  }
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } });
}
beforeEach(() => save.mockReset());
describe('Direct website submissions', () => {
  it('submits registration data and thanks the visitor only after saving', async () => {
    save.mockResolvedValue({ success: true, error: null }); render(<InterestForm />); fill();
    fireEvent.click(screen.getByRole('button', { name: 'Register My Interest' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ data: { kind: 'registration', name: 'Test Person', role: 'Founder', email: 'test@example.com', interests: ['Founder community'] } }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });
  it('submits a partnership with its contact and organization', async () => {
    save.mockResolvedValue({ success: true, error: null }); render(<InterestForm partnership />); fill(true);
    fireEvent.click(screen.getByRole('button', { name: 'Send Partnership Inquiry' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ data: { kind: 'partnership', organization: 'Test Organization', category: 'University / IIT / NIT', contact: 'Test Person', email: 'test@example.com', collaboration: 'A campus mentorship collaboration.' } }));
    expect(await screen.findByRole('status')).toBeInTheDocument();
  });
  it('does not report success when saving fails', async () => {
    save.mockResolvedValue({ success: false, error: 'Unable to submit.' }); render(<InterestForm />); fill();
    fireEvent.click(screen.getByRole('button', { name: 'Register My Interest' }));
    await screen.findByRole('alert'); expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register My Interest' })).toBeEnabled();
  });
});
