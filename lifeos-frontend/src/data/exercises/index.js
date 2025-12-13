// Combined exercise database - exports all exercises from category files
import { CHEST_EXERCISES } from './chest.js';
import { BACK_EXERCISES } from './back.js';
import { SHOULDER_EXERCISES } from './shoulders.js';
import { ARM_EXERCISES } from './arms.js';
import { LEG_EXERCISES } from './legs.js';
import { CORE_EXERCISES } from './core.js';
import { CARDIO_EXERCISES } from './cardio.js';
import { OLYMPIC_EXERCISES } from './olympic.js';

// Combine all exercises into single database
export const ALL_EXERCISES = {
  ...CHEST_EXERCISES,
  ...BACK_EXERCISES,
  ...SHOULDER_EXERCISES,
  ...ARM_EXERCISES,
  ...LEG_EXERCISES,
  ...CORE_EXERCISES,
  ...CARDIO_EXERCISES,
  ...OLYMPIC_EXERCISES,
};

// Re-export individual category modules
export {
  CHEST_EXERCISES,
  BACK_EXERCISES,
  SHOULDER_EXERCISES,
  ARM_EXERCISES,
  LEG_EXERCISES,
  CORE_EXERCISES,
  CARDIO_EXERCISES,
  OLYMPIC_EXERCISES,
};

// Get exercises by category
export const getExercisesByCategory = (category) => {
  return Object.values(ALL_EXERCISES).filter(ex => ex.category === category);
};

// Get exercises by equipment
export const getExercisesByEquipment = (equipment) => {
  return Object.values(ALL_EXERCISES).filter(ex => ex.equipment === equipment);
};

// Get exercises by muscle group
export const getExercisesByMuscleGroup = (muscleGroup) => {
  return Object.values(ALL_EXERCISES).filter(ex =>
    ex.muscleGroups.includes(muscleGroup)
  );
};

// Get exercises by subcategory
export const getExercisesBySubcategory = (subcategory) => {
  return Object.values(ALL_EXERCISES).filter(ex => ex.subcategory === subcategory);
};

// Search exercises by name
export const searchExercises = (query) => {
  const lowerQuery = query.toLowerCase();
  return Object.values(ALL_EXERCISES).filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.muscleGroups.some(mg => mg.toLowerCase().includes(lowerQuery)) ||
    (ex.subcategory && ex.subcategory.toLowerCase().includes(lowerQuery))
  );
};

// Get total exercise count
export const getExerciseCount = () => Object.keys(ALL_EXERCISES).length;

// Get all unique muscle groups
export const getAllMuscleGroups = () => {
  const muscleGroups = new Set();
  Object.values(ALL_EXERCISES).forEach(ex => {
    ex.muscleGroups.forEach(mg => muscleGroups.add(mg));
  });
  return Array.from(muscleGroups).sort();
};

// Get all unique equipment types
export const getAllEquipmentTypes = () => {
  const equipment = new Set();
  Object.values(ALL_EXERCISES).forEach(ex => {
    equipment.add(ex.equipment);
  });
  return Array.from(equipment).sort();
};

// Get all unique subcategories
export const getAllSubcategories = () => {
  const subcategories = new Set();
  Object.values(ALL_EXERCISES).forEach(ex => {
    if (ex.subcategory) {
      subcategories.add(ex.subcategory);
    }
  });
  return Array.from(subcategories).sort();
};
