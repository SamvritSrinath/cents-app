import { getUserDisplayName } from './userProfile';

describe('getUserDisplayName', () => {
  it('prefers profile display_name when present', () => {
    const user = {
      email: 'sasrinath@example.com',
      user_metadata: { full_name: 'Samvrit' },
    } as any;

    expect(getUserDisplayName(user, 'S. V.')).toBe('S. V.');
  });

  it('falls back to auth metadata name', () => {
    const user = {
      email: 'sasrinath@example.com',
      user_metadata: { full_name: 'Samvrit' },
    } as any;

    expect(getUserDisplayName(user, null)).toBe('Samvrit');
  });

  it('falls back to email prefix', () => {
    const user = {
      email: 'sasrinath@example.com',
      user_metadata: {},
    } as any;

    expect(getUserDisplayName(user, null)).toBe('sasrinath');
  });

  it('returns User when no data exists', () => {
    expect(getUserDisplayName(null, null)).toBe('User');
  });
});
