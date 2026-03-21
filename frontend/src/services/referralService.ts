import api from './api';

export const referralService = {
  getStats: async () => {
    const { data } = await api.get('/referrals/stats');
    return data;
  },
  track: async (referrerId: string) => {
    const { data } = await api.post('/referrals/track', { referrerId });
    return data;
  }
};
