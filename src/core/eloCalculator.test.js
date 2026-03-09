import { describe, it, expect } from 'vitest';
import { calculateNewElo, processWorkout } from './eloCalculator';

describe('ELO & Rank Calculator Architecture', () => {
  it('correctly calculates new ELO based on weight, reps, and coach rating', () => {
    // Formula: new_elo = current_elo + (weight * reps * 0.033 * coach_rating)
    const currentElo = 1000;
    const weight = 100;
    const reps = 10;
    const coachRating = 8;
    
    // (100 * 10 * 0.033 * 8) = 264
    // 1000 + 264 = 1264
    const result = calculateNewElo(currentElo, weight, reps, coachRating);
    expect(result).toBe(1264);
  });

  it('throws an error if coach rating is out of bounds', () => {
    expect(() => calculateNewElo(1000, 100, 10, 11)).toThrow("Coach rating must be between 1 and 10.");
    expect(() => calculateNewElo(1000, 100, 10, 0)).toThrow("Coach rating must be between 1 and 10.");
  });

  it('handles Normal users by not updating local ELO', () => {
      const user = { account_type: 'Normal', elo_score: 1000 };
      const workoutDetails = { video_url: null };
      const res = processWorkout(user, workoutDetails);
      expect(res.eloUpdated).toBe(false);
      expect(res.newElo).toBe(1000);
  });

  it('handles Rekabetçi users requiring video proof', () => {
      const user = { account_type: 'Rekabetçi', elo_score: 1500 };
      const invalidDetails = { video_url: null };
      const validDetails = { video_url: 'https://video.mp4' };
      
      const failRes = processWorkout(user, invalidDetails);
      expect(failRes.status).toBe('error');
      
      const succRes = processWorkout(user, validDetails);
      expect(succRes.status).toBe('pending_review');
  });
});
