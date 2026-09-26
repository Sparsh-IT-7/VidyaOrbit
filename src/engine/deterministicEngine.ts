import {
  AttemptRecord,
  ConceptId,
  ConceptMasteryState,
  ConceptNodeDefinition,
  Difficulty,
  LearningPathItem,
  MasteryStatus,
  StudentLevel,
  ThresholdConfig,
} from '../types/learning';

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  masteredMin: 80,
  developingMin: 60,
  weakMin: 40,
  minAttemptsForMastery: 2,
};

/**
 * Deterministic Mastery Calculation
 * Uses baseline mastery combined with weighted question attempts.
 * Difficulty weights: Easy = 1.0, Medium = 1.25, Hard = 1.5
 * Hint usage reduces effective credit on correct answers slightly to reflect assisted performance.
 */
export function computeConceptMasteryScore(
  conceptId: ConceptId,
  attempts: AttemptRecord[],
  baselineMastery: number
): { mastery: number; attemptsCount: number } {
  const conceptAttempts = attempts.filter((a) => a.conceptId === conceptId);
  if (conceptAttempts.length === 0) {
    return { mastery: Math.round(baselineMastery), attemptsCount: 0 };
  }

  const difficultyWeight: Record<Difficulty, number> = {
    Easy: 1.0,
    Medium: 1.25,
    Hard: 1.5,
  };

  let weightedEarned = 0;
  let weightedTotal = 0;

  conceptAttempts.forEach((attempt, idx) => {
    // More recent attempts carry slightly higher recency multiplier
    const recencyMultiplier = 1 + idx * 0.15;
    const weight = difficultyWeight[attempt.difficulty] * recencyMultiplier;
    weightedTotal += weight;

    if (attempt.isCorrect) {
      // Progressive hint penalty: 0 hints = 100% credit, 1 hint = 88%, 2 hints = 75%, 3 hints = 60%
      const hintPenalty = Math.min(0.4, attempt.hintsUsed * 0.13);
      weightedEarned += weight * (1 - hintPenalty);
    }
  });

  const attemptScore = (weightedEarned / weightedTotal) * 100;
  // Blend baseline with demonstrated attempts (as attempts grow, attempts dominate)
  const attemptInfluence = Math.min(0.85, 0.35 + conceptAttempts.length * 0.15);
  const blended = baselineMastery * (1 - attemptInfluence) + attemptScore * attemptInfluence;

  return {
    mastery: Math.max(5, Math.min(100, Math.round(blended))),
    attemptsCount: conceptAttempts.length,
  };
}

/**
 * Deterministic Classification & Prerequisite Engine
 * Evaluates all concepts in topological dependency order.
 */
export function evaluateKnowledgeGraph(
  conceptDefs: ConceptNodeDefinition[],
  baselineScores: Record<ConceptId, number>,
  previousScores: Record<ConceptId, number>,
  attemptCountsBase: Record<ConceptId, number>,
  attempts: AttemptRecord[],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): ConceptMasteryState[] {
  const rawScores: Record<ConceptId, { mastery: number; attemptsCount: number }> = {} as any;

  for (const def of conceptDefs) {
    const computed = computeConceptMasteryScore(
      def.id,
      attempts,
      baselineScores[def.id] ?? 50
    );
    rawScores[def.id] = {
      mastery: computed.mastery,
      attemptsCount: (attemptCountsBase[def.id] ?? 0) + computed.attemptsCount,
    };
  }

  return conceptDefs.map((def) => {
    const { mastery, attemptsCount } = rawScores[def.id];
    const previousMastery = previousScores[def.id] ?? mastery;

    // 1. Raw classification based strictly on configurable thresholds
    let rawClassification: 'Mastered' | 'Developing' | 'Weak' | 'Knowledge Gap';
    if (mastery >= thresholds.masteredMin) {
      rawClassification = 'Mastered';
    } else if (mastery >= thresholds.developingMin) {
      rawClassification = 'Developing';
    } else if (mastery >= thresholds.weakMin) {
      rawClassification = 'Weak';
    } else {
      rawClassification = 'Knowledge Gap';
    }

    // Enforce minimum attempt count before classifying as Mastered
    const insufficientAttemptsForMastery =
      rawClassification === 'Mastered' && attemptsCount < thresholds.minAttemptsForMastery;
    if (insufficientAttemptsForMastery) {
      rawClassification = 'Developing';
    }

    // 2. Check prerequisite mastery
    let isRestrictedByPrerequisite = false;
    let blockingPrerequisiteId: ConceptId | undefined;
    let blockingPrerequisiteName: string | undefined;
    let blockingPrerequisiteMastery: number | undefined;

    for (const prereqId of def.prerequisites) {
      const prereqScore = rawScores[prereqId]?.mastery ?? 0;
      if (prereqScore < thresholds.developingMin) {
        isRestrictedByPrerequisite = true;
        blockingPrerequisiteId = prereqId;
        const prereqDef = conceptDefs.find((c) => c.id === prereqId);
        blockingPrerequisiteName = prereqDef?.shortName || prereqId;
        blockingPrerequisiteMastery = prereqScore;
        break;
      }
    }

    // 3. Final visual status
    let status: MasteryStatus = rawClassification;
    if (isRestrictedByPrerequisite && mastery < thresholds.developingMin) {
      status = 'Locked';
    }

    // 4. Deterministic human-readable reason and recommended action
    let reason = '';
    let recommendedAction = '';

    if (isRestrictedByPrerequisite && blockingPrerequisiteName) {
      reason = `${def.shortName} is weak (${mastery}%) and ${blockingPrerequisiteName}, a prerequisite concept, is also below the required mastery level (${blockingPrerequisiteMastery}% < ${thresholds.developingMin}%).`;
      recommendedAction = `Complete ${blockingPrerequisiteName} revision and reach ${thresholds.developingMin}%+ before unlocking ${def.shortName}.`;
    } else if (insufficientAttemptsForMastery) {
      reason = `Score is ${mastery}%, but only ${attemptsCount} attempt(s) recorded (minimum ${thresholds.minAttemptsForMastery} required to verify mastery).`;
      recommendedAction = `Complete ${thresholds.minAttemptsForMastery - attemptsCount} more verification question(s) in ${def.shortName}.`;
    } else if (rawClassification === 'Knowledge Gap') {
      reason = `Critical knowledge gap detected (${mastery}% mastery < ${thresholds.weakMin}% threshold). Foundational misconceptions identified.`;
      recommendedAction = `Start guided ${def.shortName} concept lesson and worked examples immediately.`;
    } else if (rawClassification === 'Weak') {
      const dependentNames = def.dependents
        .map((d) => conceptDefs.find((c) => c.id === d)?.shortName)
        .filter(Boolean)
        .join(' & ');
      reason = dependentNames
        ? `${def.shortName} mastery is ${mastery}% (below ${thresholds.developingMin}%) and is required before progressing to ${dependentNames}.`
        : `Recent performance (${mastery}%) is below the required ${thresholds.developingMin}% proficiency threshold.`;
      recommendedAction = `Revise ${def.shortName} syntax, review common mistakes, and complete adaptive practice.`;
    } else if (rawClassification === 'Developing') {
      reason = `Solid foundation (${mastery}%), approaching the ${thresholds.masteredMin}% mastery target.`;
      recommendedAction = `Take a Medium-to-Hard adaptive quiz on ${def.shortName} to reach Mastered status.`;
    } else {
      reason = `Demonstrated consistent accuracy (${mastery}% across ${attemptsCount} attempts). Prerequisite unlocked for dependent modules.`;
      recommendedAction = `Mastered — ready for dependent concepts or periodic spaced repetition.`;
    }

    return {
      id: def.id,
      name: def.name,
      shortName: def.shortName,
      order: def.order,
      description: def.description,
      mastery,
      previousMastery,
      attemptsCount,
      status,
      rawClassification,
      prerequisites: def.prerequisites,
      dependents: def.dependents,
      isRestrictedByPrerequisite,
      blockingPrerequisiteId,
      blockingPrerequisiteName,
      blockingPrerequisiteMastery,
      deficitLabel: def.deficitLabel,
      reason,
      recommendedAction,
    };
  });
}

/**
 * Deterministic Personalized Learning Path Generator
 * Generates the exact step-by-step sequence of learning activities based on current concept states.
 */
export function generatePersonalizedLearningPath(
  conceptStates: ConceptMasteryState[],
  studentLevel: StudentLevel,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): LearningPathItem[] {
  const sorted = [...conceptStates].sort((a, b) => a.order - b.order);
  const items: LearningPathItem[] = [];
  let foundPrimaryRecommendation = false;

  for (const concept of sorted) {
    if (concept.rawClassification === 'Mastered') {
      items.push({
        id: `path_${concept.id}_done`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName}`,
        activityType: 'Completed',
        status: 'Completed',
        progress: 100,
        mastery: concept.mastery,
        reason: `Mastered at ${concept.mastery}% (${concept.attemptsCount} verified attempts).`,
        estimatedMinutes: concept.order <= 2 ? 10 : 15,
      });
      continue;
    }

    if (concept.status === 'Locked' || concept.isRestrictedByPrerequisite) {
      const blocker = concept.blockingPrerequisiteName || 'prerequisite concepts';
      items.push({
        id: `path_${concept.id}_intro`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Introduction`,
        activityType: 'Introduction',
        status: 'Locked',
        progress: concept.mastery,
        mastery: concept.mastery,
        reason: `Locked until prerequisite ${blocker} reaches ${thresholds.developingMin}% mastery (currently ${concept.blockingPrerequisiteMastery}%).`,
        estimatedMinutes: 15,
      });
      items.push({
        id: `path_${concept.id}_practice`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Practice`,
        activityType: 'Practice',
        status: 'Locked',
        progress: 0,
        mastery: concept.mastery,
        reason: `Requires completion of ${concept.shortName} Introduction and prerequisite ${blocker}.`,
        estimatedMinutes: 12,
      });
      items.push({
        id: `path_${concept.id}_assessment`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Assessment`,
        activityType: 'Assessment',
        status: 'Locked',
        progress: 0,
        mastery: concept.mastery,
        reason: `Adaptive mastery verification unlocked after ${concept.shortName} Practice.`,
        estimatedMinutes: 10,
      });
      continue;
    }

    if (concept.rawClassification === 'Weak' || concept.rawClassification === 'Knowledge Gap') {
      const isPrimary = !foundPrimaryRecommendation;
      foundPrimaryRecommendation = true;
      const dependentText =
        concept.dependents.length > 0
          ? ` and ${concept.shortName} is required before ${concept.dependents
              .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
              .join(' & ')}`
          : '';

      items.push({
        id: `path_${concept.id}_revision`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Revision`,
        activityType: 'Revision',
        status: isPrimary ? 'Recommended' : 'Upcoming',
        progress: concept.mastery,
        mastery: concept.mastery,
        reason: `${concept.shortName} mastery is ${concept.mastery}%${dependentText}.`,
        estimatedMinutes: studentLevel === 'Beginner' ? 15 : 10,
      });
      items.push({
        id: `path_${concept.id}_examples`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Examples`,
        activityType: 'Examples',
        status: 'Upcoming',
        progress: Math.round(concept.mastery * 0.6),
        mastery: concept.mastery,
        reason: `Interactive code trace addressing ${concept.deficitLabel}.`,
        estimatedMinutes: 8,
      });
      items.push({
        id: `path_${concept.id}_practice`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Practice`,
        activityType: 'Practice',
        status: 'Upcoming',
        progress: 25,
        mastery: concept.mastery,
        reason: `Targeted exercises with progressive hints to build ${concept.shortName} fluency.`,
        estimatedMinutes: 12,
      });
      items.push({
        id: `path_${concept.id}_assessment`,
        conceptId: concept.id,
        conceptName: concept.shortName,
        title: `${concept.shortName} Assessment`,
        activityType: 'Assessment',
        status: 'Upcoming',
        progress: 0,
        mastery: concept.mastery,
        reason: `Reach ${thresholds.developingMin}%+ in this adaptive assessment to unlock dependent concepts.`,
        estimatedMinutes: 10,
      });
      continue;
    }

    // Developing concept (60-79%)
    const isPrimary = !foundPrimaryRecommendation;
    if (isPrimary) {
      foundPrimaryRecommendation = true;
    }
    items.push({
      id: `path_${concept.id}_practice`,
      conceptId: concept.id,
      conceptName: concept.shortName,
      title: `${concept.shortName} Practice`,
      activityType: isPrimary ? 'Revision' : 'Practice',
      status: isPrimary ? 'Recommended' : 'Upcoming',
      progress: concept.mastery,
      mastery: concept.mastery,
      reason: `Developing mastery (${concept.mastery}%). Complete targeted practice to cross the ${thresholds.masteredMin}% Mastered threshold.`,
      estimatedMinutes: 10,
    });
  }

  return items;
}

/**
 * Deterministic Adaptive Difficulty Engine
 * Evaluates recent performance over a sliding window (up to last 5 questions)
 * rather than switching after every single question.
 */
export function evaluateAdaptiveDifficulty(
  recentWindow: boolean[], // array of booleans (true = correct, false = incorrect), max length 5
  currentDifficulty: Difficulty
): {
  nextDifficulty: Difficulty;
  changed: boolean;
  direction: 'up' | 'down' | 'same';
  explanation: string;
  recommendRevision: boolean;
} {
  const windowSlice = recentWindow.slice(-5);
  const count = windowSlice.length;
  const correctCount = windowSlice.filter(Boolean).length;

  // Need at least 3 questions in current window before shifting difficulty,
  // or a full 5-question window evaluation.
  if (count < 3) {
    return {
      nextDifficulty: currentDifficulty,
      changed: false,
      direction: 'same',
      explanation: `Maintaining ${currentDifficulty} difficulty while calibrating your 5-question performance window (${correctCount}/${count} correct so far).`,
      recommendRevision: false,
    };
  }

  const ratio = correctCount / count;

  // High performance (e.g. 4/5 or 5/5, or 3/3 streak): Increase difficulty
  if (ratio >= 0.8) {
    if (currentDifficulty === 'Easy') {
      return {
        nextDifficulty: 'Medium',
        changed: true,
        direction: 'up',
        explanation: `Strong recent performance (${correctCount}/${count} correct). Increasing difficulty from Easy to Medium.`,
        recommendRevision: false,
      };
    }
    if (currentDifficulty === 'Medium') {
      return {
        nextDifficulty: 'Hard',
        changed: true,
        direction: 'up',
        explanation: `Strong recent performance (${correctCount}/${count} correct). Advancing difficulty from Medium to Hard.`,
        recommendRevision: false,
      };
    }
    return {
      nextDifficulty: 'Hard',
      changed: false,
      direction: 'same',
      explanation: `Excellent mastery (${correctCount}/${count} correct at Hard level). Maintaining peak Hard difficulty.`,
      recommendRevision: false,
    };
  }

  // Low performance (e.g. 0/5, 1/5, or 0/3, 1/4): Decrease difficulty and recommend revision
  if (ratio <= 0.34) {
    if (currentDifficulty === 'Hard') {
      return {
        nextDifficulty: 'Medium',
        changed: true,
        direction: 'down',
        explanation: `Recent window score is ${correctCount}/${count} at Hard level. Adjusting to Medium difficulty to reinforce core mechanics.`,
        recommendRevision: false,
      };
    }
    if (currentDifficulty === 'Medium') {
      return {
        nextDifficulty: 'Easy',
        changed: true,
        direction: 'down',
        explanation: `Recent window score is ${correctCount}/${count} at Medium level. Stepping down to Easy difficulty and flagging concept revision.`,
        recommendRevision: true,
      };
    }
    return {
      nextDifficulty: 'Easy',
      changed: false,
      direction: 'same',
      explanation: `Recent performance is ${correctCount}/${count} at Easy difficulty. We strongly recommend reviewing the concept lesson before continuing.`,
      recommendRevision: true,
    };
  }

  // Moderate performance (e.g. 2/5 or 3/5): Maintain difficulty
  return {
    nextDifficulty: currentDifficulty,
    changed: false,
    direction: 'same',
    explanation: `Balanced recent performance (${correctCount}/${count} correct). Maintaining ${currentDifficulty} difficulty to consolidate mastery.`,
    recommendRevision: false,
  };
}
