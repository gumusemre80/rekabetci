/**
 * ELO calculation logic for Gym-Gamer
 */

const BASE_ELO = 1000;

/**
 * Calculates new ELO score when a video is approved by a coach.
 * Formula: new_elo = current_elo + (weight * reps * 0.033 * coach_rating)
 * 
 * @param {number} current_elo - The user's current ELO score.
 * @param {number} weight - Weight lifted in kg.
 * @param {number} reps - Number of repetitions performed.
 * @param {number} coach_rating - The rating given by the coach (1-10).
 * @returns {number} The updated ELO score.
 */
function calculateNewElo(current_elo, weight, reps, coach_rating) {
    if (coach_rating < 1 || coach_rating > 10) {
        throw new Error("Coach rating must be between 1 and 10.");
    }
    
    // Formula from requirement
    const eloGained = weight * reps * 0.033 * coach_rating;
    
    // Return rounded integer ELO score
    return Math.round(current_elo + eloGained);
}

/**
 * Handles the logic depending on user segment (Normal or Rekabetçi).
 * 
 * @param {Object} user 
 * @param {Object} workoutDetails 
 */
function processWorkout(user, workoutDetails) {
    if (user.account_type === 'Normal') {
        // Normal Logic: allow manual entry of weights and update a local progress chart.
        // ELO is typically not updated for Normal users based on coach ratings, 
        // they just log workouts.
        return {
            status: "success",
            message: "Antrenman başarıyla kaydedildi.",
            eloUpdated: false,
            newElo: user.elo_score
        };
    } else if (user.account_type === 'Rekabetçi') {
        // Competitive Logic: requires video upload for coach review.
        if (!workoutDetails.video_url) {
            return {
                status: "error",
                message: "Rekabetçi modda video yüklemeniz zorunludur.",
                eloUpdated: false,
                newElo: user.elo_score
            };
        }
        
        return {
            status: "pending_review",
            message: "Videonuz antrenör onayına gönderildi.",
            eloUpdated: false, // ELO updates only upon Coach approval
            newElo: user.elo_score
        };
    }
    
    throw new Error("Geçerli bir hesap türü bulunamadı.");
}

module.exports = {
    BASE_ELO,
    calculateNewElo,
    processWorkout
};
