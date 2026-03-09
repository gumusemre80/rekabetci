/**
 * Logic for Workout Program Generation based on wizard input.
 */

/**
 * Generates a structured training program based on user inputs.
 * 
 * @param {string} goal - 'Kas Kütlesi', 'Yağ Yakımı', 'Güç Kazanımı'
 * @param {string} experience - 'Yeni Başlayan', 'Orta', 'İleri'
 * @param {number} daysPerWeek - 2, 3, 4, 5, or 6
 * @param {string} focus - 'Tüm Vücut', 'Üst Vücut', 'Alt Vücut'
 * @returns {Object} { programName, splitType, totalVolume }
 */
function generateProgram(goal, experience, daysPerWeek, focus) {
  let splitType = '';
  let sets = 3; // default

  // 1. Determine Split based on Days Per Week
  if (daysPerWeek >= 2 && daysPerWeek <= 3) {
    splitType = 'Full Body';
  } else if (daysPerWeek === 4) {
    splitType = 'Upper/Lower';
  } else if (daysPerWeek >= 5 && daysPerWeek <= 6) {
    splitType = 'PPL'; // Push/Pull/Legs
  } else {
    splitType = 'Custom';
  }

  // 2. Adjust Volume based on Experience
  if (experience === 'Yeni Başlayan') {
    sets = 2; // Lower volume for beginners
  } else if (experience === 'İleri') {
    sets = 4; // Higher volume for advanced
  }

  // 3. Name Generation
  const prefix = experience === 'Yeni Başlayan' ? 'Başlangıç' : experience === 'İleri' ? 'Elit' : 'Pro';
  const programName = `${prefix} ${focus} - ${splitType} Split`;

  // 4. Generate Mock Routine based on Split
  let routine = [];
  if (splitType === 'Full Body') {
    routine = [
      { day: 'Gün 1', exercises: ['Squat', 'Bench Press', 'Barbell Row', 'Omuz Pres', 'Biceps Curl'] },
      { day: 'Gün 2', title: 'Dinlenme', exercises: [] },
      { day: 'Gün 3', exercises: ['Deadlift', 'Incline Press', 'Lat Pulldown', 'Lateral Raise', 'Triceps Extension'] }
    ];
  } else if (splitType === 'Upper/Lower') {
    routine = [
      { day: 'Gün 1 - Upper', exercises: ['Bench Press', 'Barbell Row', 'Omuz Pres', 'Biceps Curl', 'Triceps Extension'] },
      { day: 'Gün 2 - Lower', exercises: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Calf Raise', 'Plank'] },
      { day: 'Gün 3', title: 'Dinlenme', exercises: [] },
      { day: 'Gün 4 - Upper', exercises: ['Incline Press', 'Lat Pulldown', 'Lateral Raise', 'Hammer Curl', 'Skullcrusher'] },
      { day: 'Gün 5 - Lower', exercises: ['Deadlift', 'Lunge', 'Leg Curl', 'Calf Raise', 'Crunch'] }
    ];
  } else {
    // PPL
    routine = [
      { day: 'Gün 1 - Push', exercises: ['Bench Press', 'Omuz Pres', 'Incline Press', 'Lateral Raise', 'Triceps Extension'] },
      { day: 'Gün 2 - Pull', exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Face Pull', 'Biceps Curl'] },
      { day: 'Gün 3 - Legs', exercises: ['Squat', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Calf Raise'] },
      { day: 'Gün 4', title: 'Dinlenme', exercises: [] }
    ];
  }

  return {
    programName,
    splitType,
    setsRecommended: sets,
    routine,
    details: `Bu program ${daysPerWeek} günlük ${splitType} antrenmanından oluşmaktadır. Her seans için ${sets} set önerilmektedir.`
  };
}

export {
  generateProgram
};
