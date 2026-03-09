/**
 * Analyzes the completed workout data to provide coaching praises and suggestions.
 * 
 * @param {Array} loggedExercises - Array of objects containing exercise name, target sets/reps/rpe, and logged data [{ set: 1, kg: 100, reps: 8 }, ...]
 * @returns {Object} { praises: string[], suggestions: string[] }
 */
export const analyzeWorkout = (loggedExercises) => {
  const praises = [];
  const suggestions = [];

  let totalVolume = 0;
  let missedReps = 0;
  let highRpeInstances = 0;

  loggedExercises.forEach(ex => {
    // If no sets logged for this exercise, skip
    if (!ex.loggedSets || ex.loggedSets.length === 0) return;

    let exVolume = 0;
    
    // Parse targets
    const targetRepMin = parseInt(ex.reps.split('-')[0]) || 0;
    const targetRepMax = parseInt(ex.reps.split('-')[1]) || targetRepMin;
    const isAmrap = ex.reps.toUpperCase().includes('AMRAP');
    
    const targetRpeMatch = ex.rpe.match(/\d+/);
    const targetRpe = targetRpeMatch ? parseInt(targetRpeMatch[0]) : 8;

    ex.loggedSets.forEach(set => {
      const kg = parseFloat(set.kg) || 0;
      const reps = parseInt(set.reps) || 0;
      const rpe = parseFloat(set.rpe) || 0;

      exVolume += (kg * reps);

      if (!isAmrap && reps < targetRepMin) {
        missedReps++;
      }
      if (rpe > targetRpe + 1) {
        highRpeInstances++;
      }
      
      // Praise for exceeding expectations (safely)
      if (reps > targetRepMax && rpe <= 9 && !isAmrap) {
         if (!praises.includes(`${ex.name} hareketinde hedeflenen tekrarları aştın! Ağırlığı artırma vakti geldi.`)) {
            praises.push(`${ex.name} hareketinde hedeflenen tekrarları aştın! Ağırlığı artırma vakti geldi.`);
         }
      }
    });

    totalVolume += exVolume;
  });

  // Global Praises
  if (totalVolume > 0 && missedReps === 0) {
    praises.push(`Harika iş! Tüm setlerde hedeflenen tekrar sayılarına ulaştın. Progressive overload tıkır tıkır işliyor.`);
  }

  // Global Suggestions / Corrections
  if (missedReps > 2) {
    suggestions.push(`Bazı setlerde tekrar hedeflerinin altında kaldın. Bir sonraki antrenmanda o hareketlerde ağırlığı %5-10 düşürüp formu korumaya odaklan.`);
  }

  if (highRpeInstances > 2) {
    suggestions.push(`Antrenman boyunca hedeflenen RPE'nin (Zorluk Derecesi) çok üzerine çıktın. Sistematik yorgunluk birikmemesi için tükeniş noktasından bir adım geride kalmaya özen göster.`);
  }

  // Fallbacks
  if (praises.length === 0) {
    praises.push(`Antrenmanı tamamlayarak disiplinini gösterdin! Süreklilik bir numaralı anahtardır.`);
  }
  
  if (suggestions.length === 0) {
    suggestions.push(`Tekniğin ve yorgunluk yönetimin tam hedefteki gibi. Mevcut plana sadık kal!`);
  }

  return { praises, suggestions, totalVolume };
};
