import profilePhoto from '../assets/profile-photo.jpg';

export interface Session {
  name: string;
  email: string;
  membership: string;
  avatarUrl?: string;
}

// No real authentication in this assessment — any well-formed credentials
// resolve to the portfolio owner after a short, realistic delay.
const LATENCY_MS = 900;

export function signIn(email: string, _password: string): Promise<Session> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Adaeze Okonkwo',
        email,
        membership: 'Premium member',
        avatarUrl: profilePhoto,
      });
    }, LATENCY_MS);
  });
}
