/**
 * Nutrition AI Service
 * Uses Claude Haiku to parse natural language meal descriptions
 * and USDA FoodData Central for accurate nutrition data
 */

import { supabase } from '../lib/supabase';

// Local cache for common foods with full micronutrients (reduces API calls)
// All values per 100g unless otherwise noted - Data from USDA FoodData Central
const LOCAL_FOOD_CACHE = {
  // ===== EGGS =====
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, saturatedFat: 3.3, transFat: 0, cholesterol: 373, sodium: 124, potassium: 126, calcium: 50, iron: 1.2, magnesium: 10, phosphorus: 172, zinc: 1.0, vitaminA: 140, vitaminC: 0, vitaminD: 2.0, vitaminE: 1.0, vitaminK: 0.3, vitaminB6: 0.14, vitaminB12: 0.89, folate: 44, serving: '1 large (50g)' },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, saturatedFat: 3.3, transFat: 0, cholesterol: 373, sodium: 124, potassium: 126, calcium: 50, iron: 1.2, magnesium: 10, phosphorus: 172, zinc: 1.0, vitaminA: 140, vitaminC: 0, vitaminD: 2.0, vitaminE: 1.0, vitaminK: 0.3, vitaminB6: 0.14, vitaminB12: 0.89, folate: 44, serving: '1 large (50g)' },
  'egg white': { calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 166, potassium: 163, calcium: 7, iron: 0.1, magnesium: 11, phosphorus: 15, zinc: 0.03, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.01, vitaminB12: 0.09, folate: 4, serving: '100g' },
  'egg yolk': { calories: 322, protein: 16, carbs: 3.6, fat: 27, fiber: 0, sugar: 0.6, saturatedFat: 9.6, transFat: 0, cholesterol: 1085, sodium: 48, potassium: 109, calcium: 129, iron: 2.7, magnesium: 5, phosphorus: 390, zinc: 2.3, vitaminA: 381, vitaminC: 0, vitaminD: 5.4, vitaminE: 2.6, vitaminK: 0.7, vitaminB6: 0.35, vitaminB12: 1.95, folate: 146, serving: '100g' },
  'scrambled eggs': { calories: 149, protein: 10, carbs: 2.2, fat: 11, fiber: 0, sugar: 1.8, saturatedFat: 3.8, transFat: 0, cholesterol: 282, sodium: 227, potassium: 132, calcium: 66, iron: 1.2, magnesium: 11, phosphorus: 151, zinc: 1.0, vitaminA: 140, vitaminC: 0, vitaminD: 1.5, vitaminE: 1.0, vitaminK: 1.0, vitaminB6: 0.13, vitaminB12: 0.76, folate: 28, serving: '100g' },
  'boiled egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, saturatedFat: 3.3, transFat: 0, cholesterol: 373, sodium: 124, potassium: 126, calcium: 50, iron: 1.2, magnesium: 10, phosphorus: 172, zinc: 1.0, vitaminA: 140, vitaminC: 0, vitaminD: 2.0, vitaminE: 1.0, vitaminK: 0.3, vitaminB6: 0.14, vitaminB12: 0.89, folate: 44, serving: '1 large (50g)' },
  'fried egg': { calories: 196, protein: 14, carbs: 0.8, fat: 15, fiber: 0, sugar: 0.4, saturatedFat: 4.3, transFat: 0, cholesterol: 401, sodium: 207, potassium: 152, calcium: 62, iron: 1.9, magnesium: 13, phosphorus: 215, zinc: 1.3, vitaminA: 170, vitaminC: 0, vitaminD: 2.2, vitaminE: 1.5, vitaminK: 5.6, vitaminB6: 0.17, vitaminB12: 1.0, folate: 51, serving: '1 large (46g)' },
  'omelette': { calories: 154, protein: 11, carbs: 1.6, fat: 12, fiber: 0, sugar: 1.3, saturatedFat: 3.7, transFat: 0, cholesterol: 295, sodium: 288, potassium: 138, calcium: 78, iron: 1.5, magnesium: 12, phosphorus: 167, zinc: 1.1, vitaminA: 155, vitaminC: 0.5, vitaminD: 1.6, vitaminE: 1.1, vitaminK: 2.0, vitaminB6: 0.14, vitaminB12: 0.8, folate: 32, serving: '100g' },

  // ===== POULTRY =====
  'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, saturatedFat: 3.8, transFat: 0, cholesterol: 88, sodium: 82, potassium: 223, calcium: 15, iron: 1.3, magnesium: 23, phosphorus: 182, zinc: 1.8, vitaminA: 41, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 2.4, vitaminB6: 0.4, vitaminB12: 0.3, folate: 6, serving: '100g cooked' },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, saturatedFat: 1.0, transFat: 0, cholesterol: 85, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, magnesium: 29, phosphorus: 228, zinc: 1.0, vitaminA: 6, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.6, vitaminB12: 0.3, folate: 4, serving: '100g cooked' },
  'chicken thigh': { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, saturatedFat: 3.0, transFat: 0, cholesterol: 130, sodium: 84, potassium: 238, calcium: 12, iron: 1.3, magnesium: 23, phosphorus: 178, zinc: 2.4, vitaminA: 18, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 2.6, vitaminB6: 0.33, vitaminB12: 0.37, folate: 8, serving: '100g cooked' },
  'chicken wing': { calories: 203, protein: 30, carbs: 0, fat: 8.1, fiber: 0, sugar: 0, saturatedFat: 2.3, transFat: 0, cholesterol: 94, sodium: 82, potassium: 177, calcium: 15, iron: 1.3, magnesium: 20, phosphorus: 154, zinc: 2.0, vitaminA: 15, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.35, vitaminB12: 0.35, folate: 4, serving: '100g cooked' },
  'chicken drumstick': { calories: 172, protein: 28, carbs: 0, fat: 5.7, fiber: 0, sugar: 0, saturatedFat: 1.5, transFat: 0, cholesterol: 93, sodium: 90, potassium: 240, calcium: 14, iron: 1.3, magnesium: 23, phosphorus: 181, zinc: 2.7, vitaminA: 12, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 2.4, vitaminB6: 0.35, vitaminB12: 0.35, folate: 7, serving: '100g cooked' },
  'grilled chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, saturatedFat: 1.0, transFat: 0, cholesterol: 85, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, magnesium: 29, phosphorus: 228, zinc: 1.0, vitaminA: 6, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.6, vitaminB12: 0.3, folate: 4, serving: '100g' },
  'rotisserie chicken': { calories: 190, protein: 29, carbs: 0, fat: 7.4, fiber: 0, sugar: 0, saturatedFat: 2.0, transFat: 0, cholesterol: 90, sodium: 372, potassium: 245, calcium: 14, iron: 1.2, magnesium: 25, phosphorus: 200, zinc: 1.9, vitaminA: 25, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 1.5, vitaminB6: 0.5, vitaminB12: 0.32, folate: 5, serving: '100g' },
  'turkey': { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0, saturatedFat: 0.3, transFat: 0, cholesterol: 76, sodium: 70, potassium: 293, calcium: 10, iron: 1.4, magnesium: 27, phosphorus: 213, zinc: 2.0, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 0.4, folate: 6, serving: '100g cooked' },
  'turkey breast': { calories: 135, protein: 30, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 83, sodium: 54, potassium: 302, calcium: 8, iron: 0.7, magnesium: 32, phosphorus: 230, zinc: 1.5, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.8, vitaminB12: 0.4, folate: 6, serving: '100g cooked' },
  'ground turkey': { calories: 203, protein: 27, carbs: 0, fat: 10, fiber: 0, sugar: 0, saturatedFat: 2.6, transFat: 0, cholesterol: 100, sodium: 91, potassium: 275, calcium: 22, iron: 1.5, magnesium: 24, phosphorus: 204, zinc: 3.2, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 1.3, folate: 8, serving: '100g cooked' },
  'duck': { calories: 337, protein: 19, carbs: 0, fat: 28, fiber: 0, sugar: 0, saturatedFat: 9.7, transFat: 0, cholesterol: 84, sodium: 63, potassium: 204, calcium: 11, iron: 2.4, magnesium: 16, phosphorus: 156, zinc: 1.9, vitaminA: 24, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.7, vitaminK: 2.8, vitaminB6: 0.26, vitaminB12: 0.4, folate: 6, serving: '100g cooked' },

  // ===== BEEF =====
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, saturatedFat: 6.0, transFat: 0.5, cholesterol: 90, sodium: 72, potassium: 318, calcium: 18, iron: 2.6, magnesium: 21, phosphorus: 198, zinc: 6.3, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.5, vitaminB6: 0.4, vitaminB12: 2.6, folate: 6, serving: '100g cooked' },
  'ground beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, saturatedFat: 5.9, transFat: 0.6, cholesterol: 88, sodium: 75, potassium: 305, calcium: 18, iron: 2.6, magnesium: 20, phosphorus: 190, zinc: 5.7, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 0.8, vitaminB6: 0.35, vitaminB12: 2.5, folate: 8, serving: '100g cooked' },
  'lean ground beef': { calories: 176, protein: 26, carbs: 0, fat: 8, fiber: 0, sugar: 0, saturatedFat: 3.1, transFat: 0.4, cholesterol: 78, sodium: 66, potassium: 340, calcium: 12, iron: 2.5, magnesium: 22, phosphorus: 205, zinc: 6.0, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 0.6, vitaminB6: 0.4, vitaminB12: 2.7, folate: 7, serving: '100g cooked' },
  'steak': { calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0, sugar: 0, saturatedFat: 7.0, transFat: 0.8, cholesterol: 89, sodium: 58, potassium: 333, calcium: 16, iron: 2.8, magnesium: 24, phosphorus: 220, zinc: 5.5, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 1.6, vitaminB6: 0.6, vitaminB12: 2.1, folate: 8, serving: '100g cooked' },
  'ribeye': { calories: 291, protein: 24, carbs: 0, fat: 21, fiber: 0, sugar: 0, saturatedFat: 8.5, transFat: 1.0, cholesterol: 83, sodium: 59, potassium: 306, calcium: 11, iron: 2.2, magnesium: 21, phosphorus: 190, zinc: 5.2, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.5, vitaminB6: 0.55, vitaminB12: 2.8, folate: 6, serving: '100g cooked' },
  'sirloin': { calories: 206, protein: 27, carbs: 0, fat: 10, fiber: 0, sugar: 0, saturatedFat: 3.9, transFat: 0.4, cholesterol: 82, sodium: 58, potassium: 350, calcium: 14, iron: 2.8, magnesium: 25, phosphorus: 224, zinc: 5.3, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.4, vitaminB6: 0.65, vitaminB12: 2.3, folate: 8, serving: '100g cooked' },
  'filet mignon': { calories: 227, protein: 26, carbs: 0, fat: 13, fiber: 0, sugar: 0, saturatedFat: 5.0, transFat: 0.5, cholesterol: 82, sodium: 54, potassium: 356, calcium: 8, iron: 3.0, magnesium: 26, phosphorus: 218, zinc: 4.8, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.2, vitaminB6: 0.6, vitaminB12: 2.0, folate: 8, serving: '100g cooked' },
  'roast beef': { calories: 175, protein: 28, carbs: 0, fat: 6, fiber: 0, sugar: 0, saturatedFat: 2.3, transFat: 0.3, cholesterol: 69, sodium: 45, potassium: 315, calcium: 6, iron: 2.5, magnesium: 22, phosphorus: 195, zinc: 5.0, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 1.1, vitaminB6: 0.4, vitaminB12: 2.2, folate: 5, serving: '100g' },
  'beef brisket': { calories: 331, protein: 21, carbs: 0, fat: 27, fiber: 0, sugar: 0, saturatedFat: 10.6, transFat: 1.2, cholesterol: 79, sodium: 60, potassium: 230, calcium: 8, iron: 2.2, magnesium: 16, phosphorus: 148, zinc: 4.8, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.5, vitaminB6: 0.3, vitaminB12: 2.2, folate: 6, serving: '100g cooked' },
  'corned beef': { calories: 251, protein: 18, carbs: 0.5, fat: 19, fiber: 0, sugar: 0, saturatedFat: 6.3, transFat: 0.7, cholesterol: 83, sodium: 973, potassium: 145, calcium: 9, iron: 2.0, magnesium: 12, phosphorus: 125, zinc: 4.6, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.2, vitaminB12: 1.6, folate: 6, serving: '100g' },

  // ===== PORK =====
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0, saturatedFat: 5.1, transFat: 0, cholesterol: 80, sodium: 62, potassium: 362, calcium: 19, iron: 0.9, magnesium: 26, phosphorus: 246, zinc: 2.4, vitaminA: 2, vitaminC: 0.6, vitaminD: 0.5, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.46, vitaminB12: 0.7, folate: 0, serving: '100g cooked' },
  'pork chop': { calories: 231, protein: 27, carbs: 0, fat: 13, fiber: 0, sugar: 0, saturatedFat: 4.5, transFat: 0, cholesterol: 82, sodium: 65, potassium: 380, calcium: 20, iron: 0.9, magnesium: 28, phosphorus: 258, zinc: 2.5, vitaminA: 2, vitaminC: 0.6, vitaminD: 0.6, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 0.7, folate: 0, serving: '100g cooked' },
  'pork tenderloin': { calories: 143, protein: 26, carbs: 0, fat: 3.5, fiber: 0, sugar: 0, saturatedFat: 1.2, transFat: 0, cholesterol: 73, sodium: 57, potassium: 421, calcium: 5, iron: 1.0, magnesium: 31, phosphorus: 271, zinc: 2.0, vitaminA: 0, vitaminC: 0, vitaminD: 0.4, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.65, vitaminB12: 0.6, folate: 0, serving: '100g cooked' },
  'pork loin': { calories: 197, protein: 27, carbs: 0, fat: 9, fiber: 0, sugar: 0, saturatedFat: 3.2, transFat: 0, cholesterol: 80, sodium: 56, potassium: 390, calcium: 8, iron: 0.9, magnesium: 28, phosphorus: 255, zinc: 2.3, vitaminA: 2, vitaminC: 0.5, vitaminD: 0.5, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.55, vitaminB12: 0.7, folate: 0, serving: '100g cooked' },
  'bacon': { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0, saturatedFat: 14, transFat: 0, cholesterol: 110, sodium: 1717, potassium: 565, calcium: 11, iron: 1.4, magnesium: 33, phosphorus: 533, zinc: 3.2, vitaminA: 11, vitaminC: 0, vitaminD: 0.9, vitaminE: 0.4, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 1.1, folate: 0, serving: '100g cooked' },
  'ham': { calories: 145, protein: 21, carbs: 1.5, fat: 5.5, fiber: 0, sugar: 0, saturatedFat: 1.8, transFat: 0, cholesterol: 53, sodium: 1203, potassium: 287, calcium: 7, iron: 1.0, magnesium: 19, phosphorus: 224, zinc: 2.2, vitaminA: 0, vitaminC: 0, vitaminD: 0.3, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.4, vitaminB12: 0.6, folate: 3, serving: '100g' },
  'sausage': { calories: 301, protein: 19, carbs: 0, fat: 24, fiber: 0, sugar: 0, saturatedFat: 8.4, transFat: 0, cholesterol: 72, sodium: 749, potassium: 294, calcium: 13, iron: 1.4, magnesium: 19, phosphorus: 170, zinc: 2.5, vitaminA: 0, vitaminC: 1.1, vitaminD: 0.7, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.35, vitaminB12: 1.7, folate: 3, serving: '100g cooked' },
  'pork sausage': { calories: 339, protein: 19, carbs: 0, fat: 28, fiber: 0, sugar: 0, saturatedFat: 10, transFat: 0, cholesterol: 84, sodium: 749, potassium: 294, calcium: 13, iron: 1.4, magnesium: 19, phosphorus: 170, zinc: 2.5, vitaminA: 0, vitaminC: 1.1, vitaminD: 0.7, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.35, vitaminB12: 1.7, folate: 3, serving: '100g cooked' },
  'pork ribs': { calories: 361, protein: 23, carbs: 0, fat: 29, fiber: 0, sugar: 0, saturatedFat: 10.5, transFat: 0, cholesterol: 100, sodium: 79, potassium: 285, calcium: 30, iron: 1.2, magnesium: 20, phosphorus: 180, zinc: 4.0, vitaminA: 3, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.35, vitaminB12: 0.9, folate: 3, serving: '100g cooked' },
  'pulled pork': { calories: 210, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, saturatedFat: 4.0, transFat: 0, cholesterol: 82, sodium: 70, potassium: 340, calcium: 18, iron: 1.0, magnesium: 25, phosphorus: 230, zinc: 3.5, vitaminA: 2, vitaminC: 0.5, vitaminD: 0.5, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.4, vitaminB12: 0.7, folate: 2, serving: '100g' },

  // ===== LAMB & GAME =====
  'lamb': { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0, sugar: 0, saturatedFat: 8.8, transFat: 0, cholesterol: 97, sodium: 72, potassium: 310, calcium: 17, iron: 1.9, magnesium: 23, phosphorus: 188, zinc: 4.5, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 3.6, vitaminB6: 0.13, vitaminB12: 2.6, folate: 18, serving: '100g cooked' },
  'lamb chop': { calories: 282, protein: 26, carbs: 0, fat: 19, fiber: 0, sugar: 0, saturatedFat: 8.0, transFat: 0, cholesterol: 95, sodium: 68, potassium: 320, calcium: 16, iron: 2.0, magnesium: 24, phosphorus: 195, zinc: 4.7, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 3.5, vitaminB6: 0.15, vitaminB12: 2.7, folate: 17, serving: '100g cooked' },
  'ground lamb': { calories: 283, protein: 25, carbs: 0, fat: 20, fiber: 0, sugar: 0, saturatedFat: 8.3, transFat: 0, cholesterol: 97, sodium: 74, potassium: 295, calcium: 18, iron: 1.8, magnesium: 22, phosphorus: 180, zinc: 4.3, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 3.5, vitaminB6: 0.12, vitaminB12: 2.5, folate: 16, serving: '100g cooked' },
  'venison': { calories: 158, protein: 30, carbs: 0, fat: 3.2, fiber: 0, sugar: 0, saturatedFat: 1.3, transFat: 0, cholesterol: 112, sodium: 54, potassium: 335, calcium: 6, iron: 4.0, magnesium: 24, phosphorus: 226, zinc: 3.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.4, vitaminB12: 6.3, folate: 4, serving: '100g cooked' },
  'bison': { calories: 143, protein: 28, carbs: 0, fat: 2.4, fiber: 0, sugar: 0, saturatedFat: 0.9, transFat: 0, cholesterol: 82, sodium: 51, potassium: 361, calcium: 8, iron: 3.4, magnesium: 26, phosphorus: 213, zinc: 4.6, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 2.4, folate: 8, serving: '100g cooked' },

  // ===== SEAFOOD =====
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, saturatedFat: 3.1, transFat: 0, cholesterol: 55, sodium: 59, potassium: 363, calcium: 12, iron: 0.8, magnesium: 27, phosphorus: 252, zinc: 0.6, vitaminA: 40, vitaminC: 0, vitaminD: 11, vitaminE: 3.6, vitaminK: 0.5, vitaminB6: 0.6, vitaminB12: 3.2, folate: 26, serving: '100g cooked' },
  'tuna': { calories: 132, protein: 29, carbs: 0, fat: 1, fiber: 0, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 45, sodium: 40, potassium: 323, calcium: 10, iron: 1.3, magnesium: 35, phosphorus: 254, zinc: 0.6, vitaminA: 18, vitaminC: 0, vitaminD: 1.7, vitaminE: 0.9, vitaminK: 0, vitaminB6: 0.5, vitaminB12: 2.2, folate: 2, serving: '100g canned' },
  'shrimp': { calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 189, sodium: 111, potassium: 259, calcium: 70, iron: 0.5, magnesium: 39, phosphorus: 214, zinc: 1.6, vitaminA: 54, vitaminC: 0, vitaminD: 0, vitaminE: 1.3, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 1.1, folate: 3, serving: '100g cooked' },
  'cod': { calories: 105, protein: 23, carbs: 0, fat: 0.9, fiber: 0, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 55, sodium: 78, potassium: 244, calcium: 14, iron: 0.5, magnesium: 42, phosphorus: 203, zinc: 0.6, vitaminA: 14, vitaminC: 1, vitaminD: 1.3, vitaminE: 0.8, vitaminK: 0.1, vitaminB6: 0.3, vitaminB12: 1.2, folate: 9, serving: '100g cooked' },
  'tilapia': { calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0, sugar: 0, saturatedFat: 0.9, transFat: 0, cholesterol: 57, sodium: 56, potassium: 380, calcium: 14, iron: 0.7, magnesium: 34, phosphorus: 204, zinc: 0.4, vitaminA: 0, vitaminC: 0, vitaminD: 3.1, vitaminE: 0.6, vitaminK: 0, vitaminB6: 0.2, vitaminB12: 1.9, folate: 6, serving: '100g cooked' },
  'halibut': { calories: 140, protein: 27, carbs: 0, fat: 2.9, fiber: 0, sugar: 0, saturatedFat: 0.4, transFat: 0, cholesterol: 41, sodium: 69, potassium: 576, calcium: 60, iron: 1.1, magnesium: 107, phosphorus: 285, zinc: 0.5, vitaminA: 20, vitaminC: 0, vitaminD: 4.7, vitaminE: 1.0, vitaminK: 0.1, vitaminB6: 0.5, vitaminB12: 1.4, folate: 14, serving: '100g cooked' },
  'trout': { calories: 190, protein: 27, carbs: 0, fat: 8.5, fiber: 0, sugar: 0, saturatedFat: 1.8, transFat: 0, cholesterol: 74, sodium: 57, potassium: 463, calcium: 86, iron: 0.5, magnesium: 33, phosphorus: 271, zinc: 0.8, vitaminA: 19, vitaminC: 0, vitaminD: 15.9, vitaminE: 2.3, vitaminK: 0.1, vitaminB6: 0.4, vitaminB12: 4.4, folate: 13, serving: '100g cooked' },
  'sardines': { calories: 208, protein: 25, carbs: 0, fat: 11, fiber: 0, sugar: 0, saturatedFat: 1.5, transFat: 0, cholesterol: 142, sodium: 505, potassium: 397, calcium: 382, iron: 2.9, magnesium: 39, phosphorus: 490, zinc: 1.3, vitaminA: 12, vitaminC: 0, vitaminD: 4.8, vitaminE: 2.0, vitaminK: 2.6, vitaminB6: 0.2, vitaminB12: 8.9, folate: 10, serving: '100g canned' },
  'mackerel': { calories: 262, protein: 24, carbs: 0, fat: 18, fiber: 0, sugar: 0, saturatedFat: 4.2, transFat: 0, cholesterol: 75, sodium: 90, potassium: 401, calcium: 15, iron: 1.6, magnesium: 97, phosphorus: 278, zinc: 0.9, vitaminA: 50, vitaminC: 0.4, vitaminD: 16.1, vitaminE: 1.5, vitaminK: 5.0, vitaminB6: 0.6, vitaminB12: 19, folate: 1, serving: '100g cooked' },
  'crab': { calories: 97, protein: 19, carbs: 0, fat: 1.5, fiber: 0, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 53, sodium: 395, potassium: 259, calcium: 91, iron: 0.7, magnesium: 49, phosphorus: 229, zinc: 3.8, vitaminA: 2, vitaminC: 3, vitaminD: 0, vitaminE: 1.5, vitaminK: 0.1, vitaminB6: 0.2, vitaminB12: 9.8, folate: 44, serving: '100g cooked' },
  'lobster': { calories: 98, protein: 21, carbs: 0.5, fat: 0.6, fiber: 0, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 146, sodium: 380, potassium: 230, calcium: 96, iron: 0.4, magnesium: 43, phosphorus: 185, zinc: 2.9, vitaminA: 3, vitaminC: 0, vitaminD: 0, vitaminE: 1.0, vitaminK: 0.1, vitaminB6: 0.1, vitaminB12: 1.4, folate: 11, serving: '100g cooked' },
  'scallops': { calories: 111, protein: 20, carbs: 5.4, fat: 0.8, fiber: 0, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 41, sodium: 392, potassium: 314, calcium: 10, iron: 0.5, magnesium: 37, phosphorus: 334, zinc: 1.8, vitaminA: 3, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.1, vitaminB6: 0.1, vitaminB12: 1.8, folate: 18, serving: '100g cooked' },
  'clams': { calories: 148, protein: 26, carbs: 5.1, fat: 2.0, fiber: 0, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 67, sodium: 601, potassium: 534, calcium: 92, iron: 28, magnesium: 18, phosphorus: 338, zinc: 2.7, vitaminA: 171, vitaminC: 22, vitaminD: 0, vitaminE: 0.7, vitaminK: 0.2, vitaminB6: 0.1, vitaminB12: 98.9, folate: 29, serving: '100g cooked' },
  'mussels': { calories: 172, protein: 24, carbs: 7.4, fat: 4.5, fiber: 0, sugar: 0, saturatedFat: 0.9, transFat: 0, cholesterol: 56, sodium: 369, potassium: 268, calcium: 33, iron: 6.7, magnesium: 37, phosphorus: 285, zinc: 2.7, vitaminA: 91, vitaminC: 13, vitaminD: 0, vitaminE: 0.6, vitaminK: 0.1, vitaminB6: 0.1, vitaminB12: 24, folate: 76, serving: '100g cooked' },
  'oysters': { calories: 81, protein: 9, carbs: 4.9, fat: 2.3, fiber: 0, sugar: 0, saturatedFat: 0.5, transFat: 0, cholesterol: 50, sodium: 106, potassium: 168, calcium: 45, iron: 6.7, magnesium: 47, phosphorus: 135, zinc: 39, vitaminA: 13, vitaminC: 4, vitaminD: 8, vitaminE: 0.9, vitaminK: 0.1, vitaminB6: 0.1, vitaminB12: 16, folate: 10, serving: '100g raw' },
  'calamari': { calories: 175, protein: 18, carbs: 8, fat: 7.5, fiber: 0, sugar: 0, saturatedFat: 1.8, transFat: 0, cholesterol: 260, sodium: 260, potassium: 279, calcium: 40, iron: 1.1, magnesium: 38, phosphorus: 221, zinc: 1.8, vitaminA: 12, vitaminC: 5, vitaminD: 0, vitaminE: 1.2, vitaminK: 0.1, vitaminB6: 0.1, vitaminB12: 1.3, folate: 5, serving: '100g fried' },
  'fish': { calories: 136, protein: 24, carbs: 0, fat: 4, fiber: 0, sugar: 0, saturatedFat: 1.0, transFat: 0, cholesterol: 60, sodium: 70, potassium: 350, calcium: 20, iron: 0.8, magnesium: 35, phosphorus: 220, zinc: 0.6, vitaminA: 15, vitaminC: 0, vitaminD: 3, vitaminE: 1.0, vitaminK: 0.1, vitaminB6: 0.3, vitaminB12: 2.0, folate: 8, serving: '100g cooked' },
  'sushi': { calories: 150, protein: 6, carbs: 25, fat: 3, fiber: 0.5, sugar: 5, saturatedFat: 0.5, transFat: 0, cholesterol: 15, sodium: 500, potassium: 100, calcium: 10, iron: 0.5, magnesium: 15, phosphorus: 60, zinc: 0.4, vitaminA: 20, vitaminC: 2, vitaminD: 0.5, vitaminE: 0.3, vitaminK: 2, vitaminB6: 0.1, vitaminB12: 0.5, folate: 10, serving: '100g' },
  'salmon sashimi': { calories: 179, protein: 21, carbs: 0, fat: 10, fiber: 0, sugar: 0, saturatedFat: 2.1, transFat: 0, cholesterol: 50, sodium: 47, potassium: 340, calcium: 9, iron: 0.3, magnesium: 27, phosphorus: 240, zinc: 0.4, vitaminA: 12, vitaminC: 0, vitaminD: 11, vitaminE: 3.5, vitaminK: 0.1, vitaminB6: 0.6, vitaminB12: 4.9, folate: 5, serving: '100g' },

  // ===== LEGUMES & PLANT PROTEINS =====
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, saturatedFat: 0.7, transFat: 0, cholesterol: 0, sodium: 7, potassium: 121, calcium: 350, iron: 5.4, magnesium: 30, phosphorus: 97, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.01, vitaminK: 2.4, vitaminB6: 0.05, vitaminB12: 0, folate: 15, serving: '100g' },
  'tempeh': { calories: 193, protein: 19, carbs: 9.4, fat: 11, fiber: 0, sugar: 0, saturatedFat: 2.5, transFat: 0, cholesterol: 0, sodium: 9, potassium: 412, calcium: 111, iron: 2.7, magnesium: 81, phosphorus: 266, zinc: 1.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.2, vitaminB12: 0.1, folate: 24, serving: '100g' },
  'black beans': { calories: 132, protein: 9, carbs: 24, fat: 0.5, fiber: 8.7, sugar: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 355, calcium: 27, iron: 2.1, magnesium: 70, phosphorus: 140, zinc: 1.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 3.3, vitaminB6: 0.1, vitaminB12: 0, folate: 149, serving: '100g cooked' },
  'kidney beans': { calories: 127, protein: 9, carbs: 23, fat: 0.5, fiber: 7.4, sugar: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 403, calcium: 28, iron: 2.2, magnesium: 42, phosphorus: 142, zinc: 1.0, vitaminA: 0, vitaminC: 1.2, vitaminD: 0, vitaminE: 0, vitaminK: 8.4, vitaminB6: 0.1, vitaminB12: 0, folate: 130, serving: '100g cooked' },
  'chickpeas': { calories: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 7, potassium: 291, calcium: 49, iron: 2.9, magnesium: 48, phosphorus: 168, zinc: 1.5, vitaminA: 1, vitaminC: 1.3, vitaminD: 0, vitaminE: 0.4, vitaminK: 4, vitaminB6: 0.1, vitaminB12: 0, folate: 172, serving: '100g cooked' },
  'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 369, calcium: 19, iron: 3.3, magnesium: 36, phosphorus: 180, zinc: 1.3, vitaminA: 0, vitaminC: 1.5, vitaminD: 0, vitaminE: 0.1, vitaminK: 1.7, vitaminB6: 0.2, vitaminB12: 0, folate: 181, serving: '100g cooked' },
  'edamame': { calories: 121, protein: 11, carbs: 10, fat: 5.2, fiber: 5.2, sugar: 2.2, saturatedFat: 0.6, transFat: 0, cholesterol: 0, sodium: 6, potassium: 436, calcium: 63, iron: 2.3, magnesium: 64, phosphorus: 169, zinc: 1.4, vitaminA: 15, vitaminC: 6.1, vitaminD: 0, vitaminE: 0.7, vitaminK: 26.7, vitaminB6: 0.1, vitaminB12: 0, folate: 311, serving: '100g' },
  'hummus': { calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, sugar: 0.3, saturatedFat: 1.4, transFat: 0, cholesterol: 0, sodium: 379, potassium: 228, calcium: 38, iron: 2.4, magnesium: 71, phosphorus: 176, zinc: 1.8, vitaminA: 1, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, vitaminK: 3, vitaminB6: 0.2, vitaminB12: 0, folate: 83, serving: '100g' },
  'pinto beans': { calories: 143, protein: 9, carbs: 26, fat: 0.6, fiber: 9, sugar: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 436, calcium: 46, iron: 2.1, magnesium: 50, phosphorus: 147, zinc: 0.9, vitaminA: 0, vitaminC: 0.8, vitaminD: 0, vitaminE: 0.2, vitaminK: 5.6, vitaminB6: 0.2, vitaminB12: 0, folate: 172, serving: '100g cooked' },
  'navy beans': { calories: 140, protein: 8, carbs: 26, fat: 0.6, fiber: 10.5, sugar: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 0, potassium: 389, calcium: 69, iron: 2.4, magnesium: 53, phosphorus: 144, zinc: 1.0, vitaminA: 0, vitaminC: 0.9, vitaminD: 0, vitaminE: 0, vitaminK: 1.2, vitaminB6: 0.1, vitaminB12: 0, folate: 140, serving: '100g cooked' },
  'split peas': { calories: 118, protein: 8, carbs: 21, fat: 0.4, fiber: 8.3, sugar: 2.9, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 362, calcium: 14, iron: 1.3, magnesium: 36, phosphorus: 99, zinc: 1.0, vitaminA: 0, vitaminC: 0.4, vitaminD: 0, vitaminE: 0, vitaminK: 5, vitaminB6: 0.05, vitaminB12: 0, folate: 65, serving: '100g cooked' },

  // ===== GRAINS & STARCHES =====
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 35, calcium: 10, iron: 0.2, magnesium: 12, phosphorus: 43, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 3, serving: '100g cooked' },
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 35, calcium: 10, iron: 0.2, magnesium: 12, phosphorus: 43, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 3, serving: '100g cooked' },
  'brown rice': { calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, sugar: 0.4, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1, potassium: 79, calcium: 10, iron: 0.5, magnesium: 44, phosphorus: 83, zinc: 0.6, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.3, vitaminB6: 0.1, vitaminB12: 0, folate: 4, serving: '100g cooked' },
  'jasmine rice': { calories: 129, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 0, potassium: 32, calcium: 3, iron: 0.2, magnesium: 12, phosphorus: 37, zinc: 0.4, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.08, vitaminB12: 0, folate: 4, serving: '100g cooked' },
  'basmati rice': { calories: 121, protein: 3.5, carbs: 25, fat: 0.4, fiber: 0.4, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 32, calcium: 5, iron: 0.2, magnesium: 13, phosphorus: 43, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 3, serving: '100g cooked' },
  'wild rice': { calories: 101, protein: 4.0, carbs: 21, fat: 0.3, fiber: 1.8, sugar: 0.6, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 101, calcium: 3, iron: 0.6, magnesium: 32, phosphorus: 82, zinc: 1.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.5, vitaminB6: 0.14, vitaminB12: 0, folate: 26, serving: '100g cooked' },
  'fried rice': { calories: 163, protein: 4.3, carbs: 24, fat: 5.5, fiber: 0.8, sugar: 0.6, saturatedFat: 1.0, transFat: 0, cholesterol: 47, sodium: 520, potassium: 85, calcium: 20, iron: 0.8, magnesium: 15, phosphorus: 70, zinc: 0.6, vitaminA: 35, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 3.5, vitaminB6: 0.12, vitaminB12: 0.1, folate: 12, serving: '100g' },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1, potassium: 44, calcium: 7, iron: 0.5, magnesium: 18, phosphorus: 58, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 7, serving: '100g cooked' },
  'spaghetti': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1, potassium: 44, calcium: 7, iron: 0.5, magnesium: 18, phosphorus: 58, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 7, serving: '100g cooked' },
  'penne': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1, potassium: 44, calcium: 7, iron: 0.5, magnesium: 18, phosphorus: 58, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 7, serving: '100g cooked' },
  'whole wheat pasta': { calories: 124, protein: 5.3, carbs: 27, fat: 0.5, fiber: 4.5, sugar: 0.8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 62, calcium: 15, iron: 1.5, magnesium: 42, phosphorus: 89, zinc: 1.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.1, vitaminB6: 0.07, vitaminB12: 0, folate: 11, serving: '100g cooked' },
  'macaroni': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1, potassium: 44, calcium: 7, iron: 0.5, magnesium: 18, phosphorus: 58, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 7, serving: '100g cooked' },
  'noodles': { calories: 138, protein: 4.5, carbs: 25, fat: 2.1, fiber: 1.2, sugar: 0.6, saturatedFat: 0.5, transFat: 0, cholesterol: 29, sodium: 5, potassium: 38, calcium: 12, iron: 1.5, magnesium: 21, phosphorus: 76, zinc: 0.7, vitaminA: 3, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0.1, folate: 10, serving: '100g cooked' },
  'ramen noodles': { calories: 188, protein: 4.5, carbs: 26, fat: 7.5, fiber: 0.9, sugar: 0.4, saturatedFat: 3.3, transFat: 0, cholesterol: 0, sodium: 891, potassium: 35, calcium: 9, iron: 1.3, magnesium: 10, phosphorus: 45, zinc: 0.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0, folate: 73, serving: '100g cooked' },
  'rice noodles': { calories: 109, protein: 0.9, carbs: 25, fat: 0.2, fiber: 0.9, sugar: 0.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 6, potassium: 4, calcium: 4, iron: 0.2, magnesium: 3, phosphorus: 14, zinc: 0.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.01, vitaminB12: 0, folate: 1, serving: '100g cooked' },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, saturatedFat: 0.7, transFat: 0, cholesterol: 0, sodium: 491, potassium: 115, calcium: 260, iron: 3.6, magnesium: 25, phosphorus: 97, zinc: 0.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.2, vitaminB6: 0.1, vitaminB12: 0, folate: 111, serving: '1 slice (30g)' },
  'white bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, saturatedFat: 0.7, transFat: 0, cholesterol: 0, sodium: 491, potassium: 115, calcium: 260, iron: 3.6, magnesium: 25, phosphorus: 97, zinc: 0.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.2, vitaminB6: 0.1, vitaminB12: 0, folate: 111, serving: '1 slice (30g)' },
  'whole wheat bread': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6.0, sugar: 6, saturatedFat: 0.9, transFat: 0, cholesterol: 0, sodium: 472, potassium: 254, calcium: 161, iron: 2.5, magnesium: 75, phosphorus: 212, zinc: 1.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.4, vitaminK: 7.8, vitaminB6: 0.2, vitaminB12: 0, folate: 42, serving: '1 slice (30g)' },
  'sourdough bread': { calories: 259, protein: 8.5, carbs: 51, fat: 1.8, fiber: 2.1, sugar: 2.2, saturatedFat: 0.4, transFat: 0, cholesterol: 0, sodium: 508, potassium: 100, calcium: 22, iron: 2.5, magnesium: 22, phosphorus: 70, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.3, vitaminB6: 0.08, vitaminB12: 0, folate: 78, serving: '1 slice (30g)' },
  'rye bread': { calories: 259, protein: 8.5, carbs: 48, fat: 3.3, fiber: 5.8, sugar: 3.9, saturatedFat: 0.6, transFat: 0, cholesterol: 0, sodium: 603, potassium: 166, calcium: 73, iron: 2.8, magnesium: 40, phosphorus: 125, zinc: 1.1, vitaminA: 0, vitaminC: 0.1, vitaminD: 0, vitaminE: 0.3, vitaminK: 1.2, vitaminB6: 0.08, vitaminB12: 0, folate: 110, serving: '1 slice (30g)' },
  'bagel': { calories: 275, protein: 11, carbs: 53, fat: 1.6, fiber: 2.3, sugar: 6, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 500, potassium: 90, calcium: 19, iron: 3.3, magnesium: 22, phosphorus: 68, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.3, vitaminB6: 0.06, vitaminB12: 0, folate: 115, serving: '1 medium (90g)' },
  'croissant': { calories: 406, protein: 8.2, carbs: 45, fat: 21, fiber: 2.6, sugar: 7, saturatedFat: 12, transFat: 0.6, cholesterol: 67, sodium: 402, potassium: 118, calcium: 37, iron: 2.3, magnesium: 19, phosphorus: 90, zinc: 0.7, vitaminA: 171, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 4.2, vitaminB6: 0.08, vitaminB12: 0.15, folate: 71, serving: '1 medium (57g)' },
  'english muffin': { calories: 227, protein: 8.7, carbs: 44, fat: 1.8, fiber: 2.6, sugar: 2.8, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 378, potassium: 100, calcium: 95, iron: 2.9, magnesium: 22, phosphorus: 95, zinc: 0.6, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.2, vitaminB6: 0.06, vitaminB12: 0, folate: 95, serving: '1 muffin (57g)' },
  'tortilla': { calories: 306, protein: 8, carbs: 50, fat: 8, fiber: 3.4, sugar: 2, saturatedFat: 2.0, transFat: 0.4, cholesterol: 0, sodium: 600, potassium: 105, calcium: 130, iron: 3.6, magnesium: 22, phosphorus: 125, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.3, vitaminK: 3.2, vitaminB6: 0.05, vitaminB12: 0, folate: 100, serving: '1 large (64g)' },
  'flour tortilla': { calories: 306, protein: 8, carbs: 50, fat: 8, fiber: 3.4, sugar: 2, saturatedFat: 2.0, transFat: 0.4, cholesterol: 0, sodium: 600, potassium: 105, calcium: 130, iron: 3.6, magnesium: 22, phosphorus: 125, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.3, vitaminK: 3.2, vitaminB6: 0.05, vitaminB12: 0, folate: 100, serving: '1 large (64g)' },
  'corn tortilla': { calories: 218, protein: 5.7, carbs: 45, fat: 2.8, fiber: 6.3, sugar: 1.3, saturatedFat: 0.4, transFat: 0, cholesterol: 0, sodium: 42, potassium: 170, calcium: 91, iron: 1.5, magnesium: 55, phosphorus: 168, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.5, vitaminK: 0.2, vitaminB6: 0.18, vitaminB12: 0, folate: 18, serving: '2 tortillas (52g)' },
  'pita bread': { calories: 275, protein: 9, carbs: 55, fat: 1.2, fiber: 2.2, sugar: 1.6, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 536, potassium: 97, calcium: 52, iron: 2.6, magnesium: 26, phosphorus: 97, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.2, vitaminB6: 0.03, vitaminB12: 0, folate: 73, serving: '1 large (60g)' },
  'naan': { calories: 290, protein: 9, carbs: 50, fat: 5.7, fiber: 2.1, sugar: 3, saturatedFat: 1.3, transFat: 0, cholesterol: 9, sodium: 479, potassium: 112, calcium: 56, iron: 3.0, magnesium: 25, phosphorus: 98, zinc: 0.7, vitaminA: 15, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 0.5, vitaminB6: 0.07, vitaminB12: 0.05, folate: 95, serving: '1 piece (90g)' },
  'oatmeal': { calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, sugar: 0.5, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 4, potassium: 70, calcium: 9, iron: 0.9, magnesium: 27, phosphorus: 77, zinc: 0.6, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0, folate: 6, serving: '100g cooked' },
  'oats': { calories: 389, protein: 17, carbs: 66, fat: 6.9, fiber: 10.6, sugar: 1, saturatedFat: 1.2, transFat: 0, cholesterol: 0, sodium: 2, potassium: 429, calcium: 54, iron: 4.7, magnesium: 177, phosphorus: 523, zinc: 4.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.4, vitaminK: 2, vitaminB6: 0.12, vitaminB12: 0, folate: 56, serving: '100g dry' },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 7, potassium: 172, calcium: 17, iron: 1.5, magnesium: 64, phosphorus: 152, zinc: 1.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, vitaminK: 0, vitaminB6: 0.12, vitaminB12: 0, folate: 42, serving: '100g cooked' },
  'couscous': { calories: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4, sugar: 0.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 58, calcium: 8, iron: 0.4, magnesium: 8, phosphorus: 22, zinc: 0.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 15, serving: '100g cooked' },
  'bulgur': { calories: 83, protein: 3.1, carbs: 19, fat: 0.2, fiber: 4.5, sugar: 0.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 68, calcium: 10, iron: 1.0, magnesium: 32, phosphorus: 40, zinc: 0.6, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.5, vitaminB6: 0.08, vitaminB12: 0, folate: 18, serving: '100g cooked' },
  'barley': { calories: 123, protein: 2.3, carbs: 28, fat: 0.4, fiber: 3.8, sugar: 0.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 93, calcium: 11, iron: 1.3, magnesium: 22, phosphorus: 54, zinc: 0.8, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.8, vitaminB6: 0.12, vitaminB12: 0, folate: 16, serving: '100g cooked' },
  'farro': { calories: 170, protein: 7, carbs: 34, fat: 1.5, fiber: 5, sugar: 0, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 3, potassium: 200, calcium: 15, iron: 2.0, magnesium: 60, phosphorus: 150, zinc: 1.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.5, vitaminB6: 0.1, vitaminB12: 0, folate: 20, serving: '100g cooked' },
  'millet': { calories: 119, protein: 3.5, carbs: 23, fat: 1.0, fiber: 1.3, sugar: 0.1, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 2, potassium: 62, calcium: 3, iron: 0.6, magnesium: 44, phosphorus: 100, zinc: 0.9, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.3, vitaminB6: 0.11, vitaminB12: 0, folate: 19, serving: '100g cooked' },
  'cereal': { calories: 367, protein: 7, carbs: 84, fat: 1.5, fiber: 5, sugar: 28, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 567, potassium: 186, calcium: 333, iron: 28, magnesium: 50, phosphorus: 150, zinc: 3.8, vitaminA: 625, vitaminC: 25, vitaminD: 3.3, vitaminE: 0.5, vitaminK: 0.7, vitaminB6: 1.7, vitaminB12: 5.0, folate: 667, serving: '100g' },
  'cornflakes': { calories: 357, protein: 7, carbs: 84, fat: 0.4, fiber: 3.3, sugar: 8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 729, potassium: 90, calcium: 4, iron: 28, magnesium: 16, phosphorus: 50, zinc: 0.7, vitaminA: 500, vitaminC: 17, vitaminD: 3.3, vitaminE: 0.2, vitaminK: 0.2, vitaminB6: 1.3, vitaminB12: 1.7, folate: 333, serving: '100g' },
  'granola': { calories: 489, protein: 15, carbs: 53, fat: 24, fiber: 8.6, sugar: 20, saturatedFat: 3.7, transFat: 0, cholesterol: 0, sodium: 26, potassium: 539, calcium: 76, iron: 4.4, magnesium: 167, phosphorus: 453, zinc: 4.2, vitaminA: 0, vitaminC: 0.9, vitaminD: 0, vitaminE: 4.5, vitaminK: 5.3, vitaminB6: 0.36, vitaminB12: 0, folate: 64, serving: '100g' },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 6, potassium: 421, calcium: 12, iron: 0.8, magnesium: 23, phosphorus: 57, zinc: 0.3, vitaminA: 0, vitaminC: 20, vitaminD: 0, vitaminE: 0, vitaminK: 2.1, vitaminB6: 0.3, vitaminB12: 0, folate: 16, serving: '100g' },
  'baked potato': { calories: 93, protein: 2.5, carbs: 21, fat: 0.1, fiber: 2.2, sugar: 1.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 10, potassium: 535, calcium: 15, iron: 1.1, magnesium: 28, phosphorus: 70, zinc: 0.4, vitaminA: 0, vitaminC: 9.6, vitaminD: 0, vitaminE: 0, vitaminK: 2.1, vitaminB6: 0.35, vitaminB12: 0, folate: 28, serving: '100g' },
  'mashed potatoes': { calories: 83, protein: 1.9, carbs: 16, fat: 1.5, fiber: 1.5, sugar: 1.2, saturatedFat: 0.9, transFat: 0, cholesterol: 4, sodium: 333, potassium: 284, calcium: 22, iron: 0.3, magnesium: 18, phosphorus: 44, zinc: 0.3, vitaminA: 45, vitaminC: 7.4, vitaminD: 0, vitaminE: 0.1, vitaminK: 1.3, vitaminB6: 0.22, vitaminB12: 0.02, folate: 9, serving: '100g' },
  'french fries': { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, saturatedFat: 2.3, transFat: 0.1, cholesterol: 0, sodium: 210, potassium: 579, calcium: 12, iron: 0.8, magnesium: 35, phosphorus: 125, zinc: 0.5, vitaminA: 0, vitaminC: 5.6, vitaminD: 0, vitaminE: 1.2, vitaminK: 16, vitaminB6: 0.37, vitaminB12: 0, folate: 23, serving: '100g' },
  'chips': { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, saturatedFat: 2.3, transFat: 0.1, cholesterol: 0, sodium: 210, potassium: 579, calcium: 12, iron: 0.8, magnesium: 35, phosphorus: 125, zinc: 0.5, vitaminA: 0, vitaminC: 5.6, vitaminD: 0, vitaminE: 1.2, vitaminK: 16, vitaminB6: 0.37, vitaminB12: 0, folate: 23, serving: '150g (British chips/fries)' },
  'fries': { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3, saturatedFat: 2.3, transFat: 0.1, cholesterol: 0, sodium: 210, potassium: 579, calcium: 12, iron: 0.8, magnesium: 35, phosphorus: 125, zinc: 0.5, vitaminA: 0, vitaminC: 5.6, vitaminD: 0, vitaminE: 1.2, vitaminK: 16, vitaminB6: 0.37, vitaminB12: 0, folate: 23, serving: '100g' },
  'hash browns': { calories: 326, protein: 3.2, carbs: 35, fat: 20, fiber: 3.2, sugar: 0.5, saturatedFat: 3.2, transFat: 0.1, cholesterol: 0, sodium: 342, potassium: 390, calcium: 14, iron: 0.6, magnesium: 26, phosphorus: 65, zinc: 0.4, vitaminA: 0, vitaminC: 6.5, vitaminD: 0, vitaminE: 1.5, vitaminK: 12, vitaminB6: 0.3, vitaminB12: 0, folate: 15, serving: '100g' },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sugar: 4.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 55, potassium: 337, calcium: 30, iron: 0.6, magnesium: 25, phosphorus: 47, zinc: 0.3, vitaminA: 709, vitaminC: 2.4, vitaminD: 0, vitaminE: 0.3, vitaminK: 1.8, vitaminB6: 0.2, vitaminB12: 0, folate: 11, serving: '100g' },
  'yam': { calories: 118, protein: 1.5, carbs: 28, fat: 0.2, fiber: 4.1, sugar: 0.5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 9, potassium: 816, calcium: 17, iron: 0.5, magnesium: 21, phosphorus: 55, zinc: 0.2, vitaminA: 7, vitaminC: 17, vitaminD: 0, vitaminE: 0.4, vitaminK: 2.3, vitaminB6: 0.29, vitaminB12: 0, folate: 23, serving: '100g' },
  'grits': { calories: 62, protein: 1.4, carbs: 13, fat: 0.5, fiber: 0.4, sugar: 0.1, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 135, potassium: 20, calcium: 2, iron: 0.8, magnesium: 5, phosphorus: 18, zinc: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.03, vitaminB12: 0, folate: 35, serving: '100g cooked' },
  'polenta': { calories: 70, protein: 1.7, carbs: 15, fat: 0.4, fiber: 0.6, sugar: 0.2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 32, calcium: 1, iron: 0.5, magnesium: 10, phosphorus: 26, zinc: 0.2, vitaminA: 3, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0, folate: 25, serving: '100g cooked' },

  // ===== VEGETABLES =====
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 33, potassium: 316, calcium: 47, iron: 0.7, magnesium: 21, phosphorus: 66, zinc: 0.4, vitaminA: 31, vitaminC: 89, vitaminD: 0, vitaminE: 0.8, vitaminK: 102, vitaminB6: 0.2, vitaminB12: 0, folate: 63, serving: '100g' },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 79, potassium: 558, calcium: 99, iron: 2.7, magnesium: 79, phosphorus: 49, zinc: 0.5, vitaminA: 469, vitaminC: 28, vitaminD: 0, vitaminE: 2.0, vitaminK: 483, vitaminB6: 0.2, vitaminB12: 0, folate: 194, serving: '100g' },
  'kale': { calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 3.6, sugar: 2.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 38, potassium: 491, calcium: 150, iron: 1.5, magnesium: 47, phosphorus: 92, zinc: 0.6, vitaminA: 500, vitaminC: 120, vitaminD: 0, vitaminE: 1.5, vitaminK: 817, vitaminB6: 0.27, vitaminB12: 0, folate: 141, serving: '100g' },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 28, potassium: 194, calcium: 36, iron: 0.9, magnesium: 13, phosphorus: 29, zinc: 0.2, vitaminA: 370, vitaminC: 9.2, vitaminD: 0, vitaminE: 0.3, vitaminK: 126, vitaminB6: 0.09, vitaminB12: 0, folate: 38, serving: '100g' },
  'romaine lettuce': { calories: 17, protein: 1.2, carbs: 3.3, fat: 0.3, fiber: 2.1, sugar: 1.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 8, potassium: 247, calcium: 33, iron: 1.0, magnesium: 14, phosphorus: 30, zinc: 0.2, vitaminA: 436, vitaminC: 24, vitaminD: 0, vitaminE: 0.1, vitaminK: 103, vitaminB6: 0.07, vitaminB12: 0, folate: 136, serving: '100g' },
  'arugula': { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sugar: 2.1, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 27, potassium: 369, calcium: 160, iron: 1.5, magnesium: 47, phosphorus: 52, zinc: 0.5, vitaminA: 119, vitaminC: 15, vitaminD: 0, vitaminE: 0.4, vitaminK: 109, vitaminB6: 0.07, vitaminB12: 0, folate: 97, serving: '100g' },
  'cabbage': { calories: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5, sugar: 3.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 18, potassium: 170, calcium: 40, iron: 0.5, magnesium: 12, phosphorus: 26, zinc: 0.2, vitaminA: 5, vitaminC: 36, vitaminD: 0, vitaminE: 0.2, vitaminK: 76, vitaminB6: 0.12, vitaminB12: 0, folate: 43, serving: '100g' },
  'brussels sprouts': { calories: 43, protein: 3.4, carbs: 9, fat: 0.3, fiber: 3.8, sugar: 2.2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 25, potassium: 389, calcium: 42, iron: 1.4, magnesium: 23, phosphorus: 69, zinc: 0.4, vitaminA: 38, vitaminC: 85, vitaminD: 0, vitaminE: 0.9, vitaminK: 177, vitaminB6: 0.22, vitaminB12: 0, folate: 61, serving: '100g' },
  'cauliflower': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 30, potassium: 299, calcium: 22, iron: 0.4, magnesium: 15, phosphorus: 44, zinc: 0.3, vitaminA: 0, vitaminC: 48, vitaminD: 0, vitaminE: 0.1, vitaminK: 16, vitaminB6: 0.18, vitaminB12: 0, folate: 57, serving: '100g' },
  'asparagus': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, sugar: 1.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 202, calcium: 24, iron: 2.1, magnesium: 14, phosphorus: 52, zinc: 0.5, vitaminA: 38, vitaminC: 5.6, vitaminD: 0, vitaminE: 1.1, vitaminK: 41, vitaminB6: 0.09, vitaminB12: 0, folate: 52, serving: '100g' },
  'green beans': { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 3.4, sugar: 1.4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 6, potassium: 209, calcium: 37, iron: 1.0, magnesium: 25, phosphorus: 38, zinc: 0.2, vitaminA: 35, vitaminC: 12, vitaminD: 0, vitaminE: 0.4, vitaminK: 43, vitaminB6: 0.14, vitaminB12: 0, folate: 33, serving: '100g' },
  'peas': { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, sugar: 5.7, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 5, potassium: 244, calcium: 25, iron: 1.5, magnesium: 33, phosphorus: 108, zinc: 1.2, vitaminA: 38, vitaminC: 40, vitaminD: 0, vitaminE: 0.1, vitaminK: 25, vitaminB6: 0.17, vitaminB12: 0, folate: 65, serving: '100g' },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 69, potassium: 320, calcium: 33, iron: 0.3, magnesium: 12, phosphorus: 35, zinc: 0.2, vitaminA: 835, vitaminC: 6, vitaminD: 0, vitaminE: 0.7, vitaminK: 13, vitaminB6: 0.14, vitaminB12: 0, folate: 19, serving: '100g' },
  'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 69, potassium: 320, calcium: 33, iron: 0.3, magnesium: 12, phosphorus: 35, zinc: 0.2, vitaminA: 835, vitaminC: 6, vitaminD: 0, vitaminE: 0.7, vitaminK: 13, vitaminB6: 0.14, vitaminB12: 0, folate: 19, serving: '100g' },
  'celery': { calories: 16, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6, sugar: 1.3, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 80, potassium: 260, calcium: 40, iron: 0.2, magnesium: 11, phosphorus: 24, zinc: 0.1, vitaminA: 22, vitaminC: 3, vitaminD: 0, vitaminE: 0.3, vitaminK: 29, vitaminB6: 0.07, vitaminB12: 0, folate: 36, serving: '100g' },
  'cucumber': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 147, calcium: 16, iron: 0.3, magnesium: 13, phosphorus: 24, zinc: 0.2, vitaminA: 5, vitaminC: 2.8, vitaminD: 0, vitaminE: 0, vitaminK: 16, vitaminB6: 0.04, vitaminB12: 0, folate: 7, serving: '100g' },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 237, calcium: 10, iron: 0.3, magnesium: 11, phosphorus: 24, zinc: 0.2, vitaminA: 42, vitaminC: 14, vitaminD: 0, vitaminE: 0.5, vitaminK: 7.9, vitaminB6: 0.08, vitaminB12: 0, folate: 15, serving: '100g' },
  'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 237, calcium: 10, iron: 0.3, magnesium: 11, phosphorus: 24, zinc: 0.2, vitaminA: 42, vitaminC: 14, vitaminD: 0, vitaminE: 0.5, vitaminK: 7.9, vitaminB6: 0.08, vitaminB12: 0, folate: 15, serving: '100g' },
  'cherry tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 237, calcium: 10, iron: 0.3, magnesium: 11, phosphorus: 24, zinc: 0.2, vitaminA: 42, vitaminC: 14, vitaminD: 0, vitaminE: 0.5, vitaminK: 7.9, vitaminB6: 0.08, vitaminB12: 0, folate: 15, serving: '100g' },
  'bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 4, potassium: 211, calcium: 7, iron: 0.4, magnesium: 12, phosphorus: 26, zinc: 0.2, vitaminA: 157, vitaminC: 128, vitaminD: 0, vitaminE: 1.6, vitaminK: 4.9, vitaminB6: 0.29, vitaminB12: 0, folate: 46, serving: '100g' },
  'red bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 4, potassium: 211, calcium: 7, iron: 0.4, magnesium: 12, phosphorus: 26, zinc: 0.2, vitaminA: 157, vitaminC: 128, vitaminD: 0, vitaminE: 1.6, vitaminK: 4.9, vitaminB6: 0.29, vitaminB12: 0, folate: 46, serving: '100g' },
  'green pepper': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7, sugar: 2.4, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 175, calcium: 10, iron: 0.3, magnesium: 10, phosphorus: 20, zinc: 0.1, vitaminA: 18, vitaminC: 80, vitaminD: 0, vitaminE: 0.4, vitaminK: 7.4, vitaminB6: 0.22, vitaminB12: 0, folate: 10, serving: '100g' },
  'onion': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, sugar: 4.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 146, calcium: 23, iron: 0.2, magnesium: 10, phosphorus: 29, zinc: 0.2, vitaminA: 0, vitaminC: 7.4, vitaminD: 0, vitaminE: 0, vitaminK: 0.4, vitaminB6: 0.12, vitaminB12: 0, folate: 19, serving: '100g' },
  'red onion': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7, sugar: 4.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 146, calcium: 23, iron: 0.2, magnesium: 10, phosphorus: 29, zinc: 0.2, vitaminA: 0, vitaminC: 7.4, vitaminD: 0, vitaminE: 0, vitaminK: 0.4, vitaminB6: 0.12, vitaminB12: 0, folate: 19, serving: '100g' },
  'green onion': { calories: 32, protein: 1.8, carbs: 7, fat: 0.2, fiber: 2.6, sugar: 2.3, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 16, potassium: 276, calcium: 72, iron: 1.5, magnesium: 20, phosphorus: 37, zinc: 0.4, vitaminA: 50, vitaminC: 19, vitaminD: 0, vitaminE: 0.5, vitaminK: 207, vitaminB6: 0.06, vitaminB12: 0, folate: 64, serving: '100g' },
  'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 17, potassium: 401, calcium: 181, iron: 1.7, magnesium: 25, phosphorus: 153, zinc: 1.2, vitaminA: 0, vitaminC: 31, vitaminD: 0, vitaminE: 0.1, vitaminK: 1.7, vitaminB6: 1.24, vitaminB12: 0, folate: 3, serving: '100g' },
  'mushroom': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 5, potassium: 318, calcium: 3, iron: 0.5, magnesium: 9, phosphorus: 86, zinc: 0.5, vitaminA: 0, vitaminC: 2.1, vitaminD: 0.2, vitaminE: 0, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0.04, folate: 17, serving: '100g' },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 5, potassium: 318, calcium: 3, iron: 0.5, magnesium: 9, phosphorus: 86, zinc: 0.5, vitaminA: 0, vitaminC: 2.1, vitaminD: 0.2, vitaminE: 0, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0.04, folate: 17, serving: '100g' },
  'portobello mushroom': { calories: 22, protein: 2.1, carbs: 3.9, fat: 0.4, fiber: 1.3, sugar: 2.5, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 9, potassium: 364, calcium: 3, iron: 0.3, magnesium: 9, phosphorus: 108, zinc: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0.3, vitaminE: 0, vitaminK: 0, vitaminB6: 0.15, vitaminB12: 0.05, folate: 28, serving: '100g' },
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 8, potassium: 261, calcium: 16, iron: 0.4, magnesium: 18, phosphorus: 38, zinc: 0.3, vitaminA: 10, vitaminC: 18, vitaminD: 0, vitaminE: 0.1, vitaminK: 4.3, vitaminB6: 0.16, vitaminB12: 0, folate: 24, serving: '100g' },
  'squash': { calories: 16, protein: 0.6, carbs: 3.4, fat: 0.1, fiber: 0.5, sugar: 1.5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 182, calcium: 15, iron: 0.3, magnesium: 12, phosphorus: 22, zinc: 0.2, vitaminA: 10, vitaminC: 17, vitaminD: 0, vitaminE: 0.1, vitaminK: 3, vitaminB6: 0.1, vitaminB12: 0, folate: 16, serving: '100g' },
  'butternut squash': { calories: 45, protein: 1, carbs: 12, fat: 0.1, fiber: 2, sugar: 2.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 352, calcium: 48, iron: 0.7, magnesium: 34, phosphorus: 33, zinc: 0.2, vitaminA: 532, vitaminC: 21, vitaminD: 0, vitaminE: 1.4, vitaminK: 1.1, vitaminB6: 0.15, vitaminB12: 0, folate: 27, serving: '100g' },
  'acorn squash': { calories: 40, protein: 0.8, carbs: 10, fat: 0.1, fiber: 1.5, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 3, potassium: 347, calcium: 33, iron: 0.7, magnesium: 32, phosphorus: 36, zinc: 0.1, vitaminA: 11, vitaminC: 11, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.15, vitaminB12: 0, folate: 17, serving: '100g' },
  'spaghetti squash': { calories: 31, protein: 0.6, carbs: 7, fat: 0.6, fiber: 1.5, sugar: 2.8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 17, potassium: 108, calcium: 23, iron: 0.3, magnesium: 12, phosphorus: 12, zinc: 0.2, vitaminA: 2, vitaminC: 2.1, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.4, vitaminB6: 0.1, vitaminB12: 0, folate: 9, serving: '100g' },
  'eggplant': { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, sugar: 3.5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 229, calcium: 9, iron: 0.2, magnesium: 14, phosphorus: 24, zinc: 0.2, vitaminA: 1, vitaminC: 2.2, vitaminD: 0, vitaminE: 0.3, vitaminK: 3.5, vitaminB6: 0.08, vitaminB12: 0, folate: 22, serving: '100g' },
  'corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2.7, sugar: 6.3, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 15, potassium: 270, calcium: 2, iron: 0.5, magnesium: 37, phosphorus: 89, zinc: 0.5, vitaminA: 9, vitaminC: 6.8, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.3, vitaminB6: 0.06, vitaminB12: 0, folate: 46, serving: '100g' },
  'sweet corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4, fiber: 2.7, sugar: 6.3, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 15, potassium: 270, calcium: 2, iron: 0.5, magnesium: 37, phosphorus: 89, zinc: 0.5, vitaminA: 9, vitaminC: 6.8, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.3, vitaminB6: 0.06, vitaminB12: 0, folate: 46, serving: '100g' },
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, saturatedFat: 2.1, transFat: 0, cholesterol: 0, sodium: 7, potassium: 485, calcium: 12, iron: 0.6, magnesium: 29, phosphorus: 52, zinc: 0.6, vitaminA: 7, vitaminC: 10, vitaminD: 0, vitaminE: 2.1, vitaminK: 21, vitaminB6: 0.3, vitaminB12: 0, folate: 81, serving: '100g' },
  'beet': { calories: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 6.8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 78, potassium: 325, calcium: 16, iron: 0.8, magnesium: 23, phosphorus: 40, zinc: 0.4, vitaminA: 2, vitaminC: 4.9, vitaminD: 0, vitaminE: 0, vitaminK: 0.2, vitaminB6: 0.07, vitaminB12: 0, folate: 109, serving: '100g' },
  'beets': { calories: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 6.8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 78, potassium: 325, calcium: 16, iron: 0.8, magnesium: 23, phosphorus: 40, zinc: 0.4, vitaminA: 2, vitaminC: 4.9, vitaminD: 0, vitaminE: 0, vitaminK: 0.2, vitaminB6: 0.07, vitaminB12: 0, folate: 109, serving: '100g' },
  'radish': { calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6, sugar: 1.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 39, potassium: 233, calcium: 25, iron: 0.3, magnesium: 10, phosphorus: 20, zinc: 0.3, vitaminA: 0, vitaminC: 15, vitaminD: 0, vitaminE: 0, vitaminK: 1.3, vitaminB6: 0.07, vitaminB12: 0, folate: 25, serving: '100g' },
  'turnip': { calories: 28, protein: 0.9, carbs: 6, fat: 0.1, fiber: 1.8, sugar: 3.8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 67, potassium: 191, calcium: 30, iron: 0.3, magnesium: 11, phosphorus: 27, zinc: 0.3, vitaminA: 0, vitaminC: 21, vitaminD: 0, vitaminE: 0, vitaminK: 0.1, vitaminB6: 0.09, vitaminB12: 0, folate: 15, serving: '100g' },
  'parsnip': { calories: 75, protein: 1.2, carbs: 18, fat: 0.3, fiber: 4.9, sugar: 4.8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 10, potassium: 375, calcium: 36, iron: 0.6, magnesium: 29, phosphorus: 71, zinc: 0.6, vitaminA: 0, vitaminC: 17, vitaminD: 0, vitaminE: 1.5, vitaminK: 22, vitaminB6: 0.09, vitaminB12: 0, folate: 67, serving: '100g' },
  'artichoke': { calories: 47, protein: 3.3, carbs: 11, fat: 0.2, fiber: 5.4, sugar: 1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 94, potassium: 370, calcium: 44, iron: 1.3, magnesium: 60, phosphorus: 90, zinc: 0.5, vitaminA: 1, vitaminC: 12, vitaminD: 0, vitaminE: 0.2, vitaminK: 14.8, vitaminB6: 0.12, vitaminB12: 0, folate: 68, serving: '100g' },
  'leek': { calories: 61, protein: 1.5, carbs: 14, fat: 0.3, fiber: 1.8, sugar: 3.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 20, potassium: 180, calcium: 59, iron: 2.1, magnesium: 28, phosphorus: 35, zinc: 0.1, vitaminA: 83, vitaminC: 12, vitaminD: 0, vitaminE: 0.9, vitaminK: 47, vitaminB6: 0.23, vitaminB12: 0, folate: 64, serving: '100g' },
  'bok choy': { calories: 13, protein: 1.5, carbs: 2.2, fat: 0.2, fiber: 1, sugar: 1.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 65, potassium: 252, calcium: 105, iron: 0.8, magnesium: 19, phosphorus: 37, zinc: 0.2, vitaminA: 223, vitaminC: 45, vitaminD: 0, vitaminE: 0.1, vitaminK: 46, vitaminB6: 0.19, vitaminB12: 0, folate: 66, serving: '100g' },
  'swiss chard': { calories: 19, protein: 1.8, carbs: 3.7, fat: 0.2, fiber: 1.6, sugar: 1.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 213, potassium: 379, calcium: 51, iron: 1.8, magnesium: 81, phosphorus: 46, zinc: 0.4, vitaminA: 306, vitaminC: 30, vitaminD: 0, vitaminE: 1.9, vitaminK: 830, vitaminB6: 0.1, vitaminB12: 0, folate: 14, serving: '100g' },
  'collard greens': { calories: 32, protein: 3, carbs: 5.4, fat: 0.6, fiber: 4, sugar: 0.5, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 17, potassium: 213, calcium: 232, iron: 0.5, magnesium: 27, phosphorus: 25, zinc: 0.2, vitaminA: 251, vitaminC: 35, vitaminD: 0, vitaminE: 2.3, vitaminK: 437, vitaminB6: 0.17, vitaminB12: 0, folate: 129, serving: '100g' },
  'watercress': { calories: 11, protein: 2.3, carbs: 1.3, fat: 0.1, fiber: 0.5, sugar: 0.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 41, potassium: 330, calcium: 120, iron: 0.2, magnesium: 21, phosphorus: 60, zinc: 0.1, vitaminA: 160, vitaminC: 43, vitaminD: 0, vitaminE: 1.0, vitaminK: 250, vitaminB6: 0.13, vitaminB12: 0, folate: 9, serving: '100g' },
  'okra': { calories: 33, protein: 1.9, carbs: 7, fat: 0.2, fiber: 3.2, sugar: 1.5, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 7, potassium: 299, calcium: 82, iron: 0.6, magnesium: 57, phosphorus: 61, zinc: 0.6, vitaminA: 36, vitaminC: 23, vitaminD: 0, vitaminE: 0.3, vitaminK: 31, vitaminB6: 0.22, vitaminB12: 0, folate: 60, serving: '100g' },
  'jalapeno': { calories: 29, protein: 0.9, carbs: 6, fat: 0.4, fiber: 2.8, sugar: 4.1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 3, potassium: 248, calcium: 12, iron: 0.3, magnesium: 15, phosphorus: 26, zinc: 0.1, vitaminA: 54, vitaminC: 119, vitaminD: 0, vitaminE: 3.6, vitaminK: 18, vitaminB6: 0.51, vitaminB12: 0, folate: 27, serving: '100g' },
  'ginger': { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2, sugar: 1.7, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 13, potassium: 415, calcium: 16, iron: 0.6, magnesium: 43, phosphorus: 34, zinc: 0.3, vitaminA: 0, vitaminC: 5, vitaminD: 0, vitaminE: 0.3, vitaminK: 0.1, vitaminB6: 0.16, vitaminB12: 0, folate: 11, serving: '100g' },

  // ===== FRUITS =====
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 358, calcium: 5, iron: 0.3, magnesium: 27, phosphorus: 22, zinc: 0.2, vitaminA: 3, vitaminC: 9, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.5, vitaminB6: 0.4, vitaminB12: 0, folate: 20, serving: '1 medium (118g)' },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 107, calcium: 6, iron: 0.1, magnesium: 5, phosphorus: 11, zinc: 0, vitaminA: 3, vitaminC: 5, vitaminD: 0, vitaminE: 0.2, vitaminK: 2.2, vitaminB6: 0.04, vitaminB12: 0, folate: 3, serving: '100g' },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 181, calcium: 40, iron: 0.1, magnesium: 10, phosphorus: 14, zinc: 0.1, vitaminA: 11, vitaminC: 53, vitaminD: 0, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.06, vitaminB12: 0, folate: 30, serving: '100g' },
  'strawberry': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 153, calcium: 16, iron: 0.4, magnesium: 13, phosphorus: 24, zinc: 0.1, vitaminA: 1, vitaminC: 59, vitaminD: 0, vitaminE: 0.3, vitaminK: 2.2, vitaminB6: 0.05, vitaminB12: 0, folate: 24, serving: '100g' },
  'strawberries': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, sugar: 4.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 153, calcium: 16, iron: 0.4, magnesium: 13, phosphorus: 24, zinc: 0.1, vitaminA: 1, vitaminC: 59, vitaminD: 0, vitaminE: 0.3, vitaminK: 2.2, vitaminB6: 0.05, vitaminB12: 0, folate: 24, serving: '100g' },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 77, calcium: 6, iron: 0.3, magnesium: 6, phosphorus: 12, zinc: 0.2, vitaminA: 3, vitaminC: 10, vitaminD: 0, vitaminE: 0.6, vitaminK: 19, vitaminB6: 0.05, vitaminB12: 0, folate: 6, serving: '100g' },
  'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 77, calcium: 6, iron: 0.3, magnesium: 6, phosphorus: 12, zinc: 0.2, vitaminA: 3, vitaminC: 10, vitaminD: 0, vitaminE: 0.6, vitaminK: 19, vitaminB6: 0.05, vitaminB12: 0, folate: 6, serving: '100g' },
  'raspberry': { calories: 52, protein: 1.2, carbs: 12, fat: 0.7, fiber: 6.5, sugar: 4.4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 151, calcium: 25, iron: 0.7, magnesium: 22, phosphorus: 29, zinc: 0.4, vitaminA: 2, vitaminC: 26, vitaminD: 0, vitaminE: 0.9, vitaminK: 7.8, vitaminB6: 0.06, vitaminB12: 0, folate: 21, serving: '100g' },
  'raspberries': { calories: 52, protein: 1.2, carbs: 12, fat: 0.7, fiber: 6.5, sugar: 4.4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 151, calcium: 25, iron: 0.7, magnesium: 22, phosphorus: 29, zinc: 0.4, vitaminA: 2, vitaminC: 26, vitaminD: 0, vitaminE: 0.9, vitaminK: 7.8, vitaminB6: 0.06, vitaminB12: 0, folate: 21, serving: '100g' },
  'blackberry': { calories: 43, protein: 1.4, carbs: 10, fat: 0.5, fiber: 5.3, sugar: 4.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 162, calcium: 29, iron: 0.6, magnesium: 20, phosphorus: 22, zinc: 0.5, vitaminA: 11, vitaminC: 21, vitaminD: 0, vitaminE: 1.2, vitaminK: 20, vitaminB6: 0.03, vitaminB12: 0, folate: 25, serving: '100g' },
  'blackberries': { calories: 43, protein: 1.4, carbs: 10, fat: 0.5, fiber: 5.3, sugar: 4.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 162, calcium: 29, iron: 0.6, magnesium: 20, phosphorus: 22, zinc: 0.5, vitaminA: 11, vitaminC: 21, vitaminD: 0, vitaminE: 1.2, vitaminK: 20, vitaminB6: 0.03, vitaminB12: 0, folate: 25, serving: '100g' },
  'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sugar: 16, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 191, calcium: 10, iron: 0.4, magnesium: 7, phosphorus: 20, zinc: 0.1, vitaminA: 3, vitaminC: 3.2, vitaminD: 0, vitaminE: 0.2, vitaminK: 15, vitaminB6: 0.09, vitaminB12: 0, folate: 2, serving: '100g' },
  'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, sugar: 6.2, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 112, calcium: 7, iron: 0.2, magnesium: 10, phosphorus: 11, zinc: 0.1, vitaminA: 28, vitaminC: 8.1, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.1, vitaminB6: 0.05, vitaminB12: 0, folate: 3, serving: '100g' },
  'cantaloupe': { calories: 34, protein: 0.8, carbs: 8, fat: 0.2, fiber: 0.9, sugar: 8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 16, potassium: 267, calcium: 9, iron: 0.2, magnesium: 12, phosphorus: 15, zinc: 0.2, vitaminA: 169, vitaminC: 37, vitaminD: 0, vitaminE: 0, vitaminK: 2.5, vitaminB6: 0.07, vitaminB12: 0, folate: 21, serving: '100g' },
  'honeydew': { calories: 36, protein: 0.5, carbs: 9, fat: 0.1, fiber: 0.8, sugar: 8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 18, potassium: 228, calcium: 6, iron: 0.2, magnesium: 10, phosphorus: 11, zinc: 0.1, vitaminA: 3, vitaminC: 18, vitaminD: 0, vitaminE: 0, vitaminK: 2.9, vitaminB6: 0.09, vitaminB12: 0, folate: 19, serving: '100g' },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 14, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 168, calcium: 11, iron: 0.2, magnesium: 10, phosphorus: 14, zinc: 0.1, vitaminA: 54, vitaminC: 36, vitaminD: 0, vitaminE: 0.9, vitaminK: 4.2, vitaminB6: 0.12, vitaminB12: 0, folate: 43, serving: '100g' },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 109, calcium: 13, iron: 0.3, magnesium: 12, phosphorus: 8, zinc: 0.1, vitaminA: 3, vitaminC: 48, vitaminD: 0, vitaminE: 0, vitaminK: 0.7, vitaminB6: 0.11, vitaminB12: 0, folate: 18, serving: '100g' },
  'papaya': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, sugar: 8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 8, potassium: 182, calcium: 20, iron: 0.3, magnesium: 21, phosphorus: 10, zinc: 0.1, vitaminA: 47, vitaminC: 61, vitaminD: 0, vitaminE: 0.3, vitaminK: 2.6, vitaminB6: 0.04, vitaminB12: 0, folate: 37, serving: '100g' },
  'kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3, sugar: 9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 3, potassium: 312, calcium: 34, iron: 0.3, magnesium: 17, phosphorus: 34, zinc: 0.1, vitaminA: 4, vitaminC: 93, vitaminD: 0, vitaminE: 1.5, vitaminK: 40, vitaminB6: 0.06, vitaminB12: 0, folate: 25, serving: '100g' },
  'peach': { calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5, sugar: 8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 190, calcium: 6, iron: 0.3, magnesium: 9, phosphorus: 20, zinc: 0.2, vitaminA: 16, vitaminC: 6.6, vitaminD: 0, vitaminE: 0.7, vitaminK: 2.6, vitaminB6: 0.03, vitaminB12: 0, folate: 4, serving: '100g' },
  'nectarine': { calories: 44, protein: 1.1, carbs: 11, fat: 0.3, fiber: 1.7, sugar: 8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 201, calcium: 6, iron: 0.3, magnesium: 9, phosphorus: 26, zinc: 0.2, vitaminA: 17, vitaminC: 5.4, vitaminD: 0, vitaminE: 0.8, vitaminK: 2.2, vitaminB6: 0.03, vitaminB12: 0, folate: 5, serving: '100g' },
  'plum': { calories: 46, protein: 0.7, carbs: 11, fat: 0.3, fiber: 1.4, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 157, calcium: 6, iron: 0.2, magnesium: 7, phosphorus: 16, zinc: 0.1, vitaminA: 17, vitaminC: 9.5, vitaminD: 0, vitaminE: 0.3, vitaminK: 6.4, vitaminB6: 0.03, vitaminB12: 0, folate: 5, serving: '100g' },
  'apricot': { calories: 48, protein: 1.4, carbs: 11, fat: 0.4, fiber: 2, sugar: 9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 259, calcium: 13, iron: 0.4, magnesium: 10, phosphorus: 23, zinc: 0.2, vitaminA: 96, vitaminC: 10, vitaminD: 0, vitaminE: 0.9, vitaminK: 3.3, vitaminB6: 0.05, vitaminB12: 0, folate: 9, serving: '100g' },
  'cherry': { calories: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 1.6, sugar: 8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 0, potassium: 173, calcium: 13, iron: 0.4, magnesium: 9, phosphorus: 21, zinc: 0.1, vitaminA: 3, vitaminC: 7, vitaminD: 0, vitaminE: 0.1, vitaminK: 2.1, vitaminB6: 0.05, vitaminB12: 0, folate: 4, serving: '100g' },
  'cherries': { calories: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 1.6, sugar: 8, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 0, potassium: 173, calcium: 13, iron: 0.4, magnesium: 9, phosphorus: 21, zinc: 0.1, vitaminA: 3, vitaminC: 7, vitaminD: 0, vitaminE: 0.1, vitaminK: 2.1, vitaminB6: 0.05, vitaminB12: 0, folate: 4, serving: '100g' },
  'pear': { calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 116, calcium: 9, iron: 0.2, magnesium: 7, phosphorus: 12, zinc: 0.1, vitaminA: 1, vitaminC: 4.3, vitaminD: 0, vitaminE: 0.1, vitaminK: 4.4, vitaminB6: 0.03, vitaminB12: 0, folate: 7, serving: '100g' },
  'grapefruit': { calories: 42, protein: 0.8, carbs: 11, fat: 0.1, fiber: 1.6, sugar: 7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 0, potassium: 135, calcium: 22, iron: 0.1, magnesium: 9, phosphorus: 18, zinc: 0.1, vitaminA: 23, vitaminC: 31, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0, folate: 13, serving: '100g' },
  'lemon': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3, fiber: 2.8, sugar: 2.5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 138, calcium: 26, iron: 0.6, magnesium: 8, phosphorus: 16, zinc: 0.1, vitaminA: 1, vitaminC: 53, vitaminD: 0, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.08, vitaminB12: 0, folate: 11, serving: '100g' },
  'lime': { calories: 30, protein: 0.7, carbs: 11, fat: 0.2, fiber: 2.8, sugar: 1.7, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 102, calcium: 33, iron: 0.6, magnesium: 6, phosphorus: 18, zinc: 0.1, vitaminA: 2, vitaminC: 29, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.6, vitaminB6: 0.04, vitaminB12: 0, folate: 8, serving: '100g' },
  'pomegranate': { calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, sugar: 14, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 236, calcium: 10, iron: 0.3, magnesium: 12, phosphorus: 36, zinc: 0.4, vitaminA: 0, vitaminC: 10, vitaminD: 0, vitaminE: 0.6, vitaminK: 16, vitaminB6: 0.08, vitaminB12: 0, folate: 38, serving: '100g' },
  'fig': { calories: 74, protein: 0.8, carbs: 19, fat: 0.3, fiber: 2.9, sugar: 16, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 232, calcium: 35, iron: 0.4, magnesium: 17, phosphorus: 14, zinc: 0.2, vitaminA: 7, vitaminC: 2, vitaminD: 0, vitaminE: 0.1, vitaminK: 4.7, vitaminB6: 0.11, vitaminB12: 0, folate: 6, serving: '100g' },
  'dates': { calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8, sugar: 63, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 656, calcium: 39, iron: 1.0, magnesium: 43, phosphorus: 62, zinc: 0.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 2.7, vitaminB6: 0.17, vitaminB12: 0, folate: 19, serving: '100g' },
  'raisins': { calories: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7, sugar: 59, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 11, potassium: 749, calcium: 50, iron: 1.9, magnesium: 32, phosphorus: 101, zinc: 0.2, vitaminA: 0, vitaminC: 2.3, vitaminD: 0, vitaminE: 0.1, vitaminK: 3.5, vitaminB6: 0.17, vitaminB12: 0, folate: 5, serving: '100g' },
  'dried cranberries': { calories: 308, protein: 0.1, carbs: 83, fat: 1.4, fiber: 5.7, sugar: 65, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 3, potassium: 49, calcium: 10, iron: 0.5, magnesium: 4, phosphorus: 8, zinc: 0.1, vitaminA: 2, vitaminC: 0.2, vitaminD: 0, vitaminE: 1.3, vitaminK: 1.8, vitaminB6: 0.04, vitaminB12: 0, folate: 1, serving: '100g' },
  'coconut': { calories: 354, protein: 3.3, carbs: 15, fat: 33, fiber: 9, sugar: 6.2, saturatedFat: 30, transFat: 0, cholesterol: 0, sodium: 20, potassium: 356, calcium: 14, iron: 2.4, magnesium: 32, phosphorus: 113, zinc: 1.1, vitaminA: 0, vitaminC: 3.3, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.2, vitaminB6: 0.05, vitaminB12: 0, folate: 26, serving: '100g' },
  'passion fruit': { calories: 97, protein: 2.2, carbs: 23, fat: 0.7, fiber: 10, sugar: 11, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 28, potassium: 348, calcium: 12, iron: 1.6, magnesium: 29, phosphorus: 68, zinc: 0.1, vitaminA: 64, vitaminC: 30, vitaminD: 0, vitaminE: 0, vitaminK: 0.7, vitaminB6: 0.1, vitaminB12: 0, folate: 14, serving: '100g' },
  'dragon fruit': { calories: 50, protein: 1.1, carbs: 11, fat: 0.4, fiber: 3, sugar: 8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 39, potassium: 436, calcium: 8.5, iron: 0.7, magnesium: 40, phosphorus: 22.5, zinc: 0.3, vitaminA: 0, vitaminC: 3, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0, folate: 7, serving: '100g' },
  'guava': { calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, sugar: 9, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 2, potassium: 417, calcium: 18, iron: 0.3, magnesium: 22, phosphorus: 40, zinc: 0.2, vitaminA: 31, vitaminC: 228, vitaminD: 0, vitaminE: 0.7, vitaminK: 2.6, vitaminB6: 0.11, vitaminB12: 0, folate: 49, serving: '100g' },
  'lychee': { calories: 66, protein: 0.8, carbs: 17, fat: 0.4, fiber: 1.3, sugar: 15, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1, potassium: 171, calcium: 5, iron: 0.3, magnesium: 10, phosphorus: 31, zinc: 0.1, vitaminA: 0, vitaminC: 72, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.4, vitaminB6: 0.1, vitaminB12: 0, folate: 14, serving: '100g' },
  'persimmon': { calories: 70, protein: 0.6, carbs: 19, fat: 0.2, fiber: 3.6, sugar: 13, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 161, calcium: 8, iron: 0.2, magnesium: 9, phosphorus: 17, zinc: 0.1, vitaminA: 81, vitaminC: 7.5, vitaminD: 0, vitaminE: 0.7, vitaminK: 2.6, vitaminB6: 0.1, vitaminB12: 0, folate: 8, serving: '100g' },
  'cranberries': { calories: 46, protein: 0.4, carbs: 12, fat: 0.1, fiber: 4.6, sugar: 4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 85, calcium: 8, iron: 0.3, magnesium: 6, phosphorus: 13, zinc: 0.1, vitaminA: 3, vitaminC: 14, vitaminD: 0, vitaminE: 1.2, vitaminK: 5, vitaminB6: 0.06, vitaminB12: 0, folate: 1, serving: '100g' },
  'acai': { calories: 70, protein: 1, carbs: 4, fat: 5, fiber: 2, sugar: 2, saturatedFat: 1.5, transFat: 0, cholesterol: 0, sodium: 7, potassium: 105, calcium: 35, iron: 0.6, magnesium: 7, phosphorus: 8, zinc: 0.1, vitaminA: 15, vitaminC: 10, vitaminD: 0, vitaminE: 0.4, vitaminK: 0, vitaminB6: 0.02, vitaminB12: 0, folate: 5, serving: '100g' },

  // ===== DAIRY & ALTERNATIVES =====
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, saturatedFat: 0.6, transFat: 0, cholesterol: 5, sodium: 44, potassium: 150, calcium: 125, iron: 0, magnesium: 11, phosphorus: 95, zinc: 0.4, vitaminA: 14, vitaminC: 0, vitaminD: 1.3, vitaminE: 0, vitaminK: 0.1, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '100ml' },
  'whole milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5, saturatedFat: 1.9, transFat: 0.1, cholesterol: 10, sodium: 43, potassium: 132, calcium: 113, iron: 0, magnesium: 10, phosphorus: 84, zinc: 0.4, vitaminA: 28, vitaminC: 0, vitaminD: 1.3, vitaminE: 0.1, vitaminK: 0.3, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '100ml' },
  'skim milk': { calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5, saturatedFat: 0, transFat: 0, cholesterol: 2, sodium: 42, potassium: 156, calcium: 122, iron: 0, magnesium: 11, phosphorus: 101, zinc: 0.4, vitaminA: 0, vitaminC: 0, vitaminD: 1.2, vitaminE: 0, vitaminK: 0, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '100ml' },
  '2% milk': { calories: 50, protein: 3.3, carbs: 4.8, fat: 2, fiber: 0, sugar: 5, saturatedFat: 1.3, transFat: 0, cholesterol: 8, sodium: 41, potassium: 150, calcium: 120, iron: 0, magnesium: 11, phosphorus: 94, zinc: 0.4, vitaminA: 20, vitaminC: 0, vitaminD: 1.3, vitaminE: 0, vitaminK: 0.1, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '100ml' },
  'chocolate milk': { calories: 83, protein: 3.2, carbs: 12, fat: 2.5, fiber: 0.5, sugar: 10, saturatedFat: 1.5, transFat: 0, cholesterol: 8, sodium: 60, potassium: 160, calcium: 110, iron: 0.3, magnesium: 15, phosphorus: 90, zinc: 0.4, vitaminA: 15, vitaminC: 0, vitaminD: 1.3, vitaminE: 0, vitaminK: 0.1, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '100ml' },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0, sugar: 3.2, saturatedFat: 0.3, transFat: 0, cholesterol: 5, sodium: 36, potassium: 141, calcium: 110, iron: 0.1, magnesium: 11, phosphorus: 135, zinc: 0.5, vitaminA: 2, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.2, vitaminB6: 0.06, vitaminB12: 0.8, folate: 7, serving: '100g' },
  'yogurt': { calories: 59, protein: 3.5, carbs: 5, fat: 3.3, fiber: 0, sugar: 5, saturatedFat: 2.1, transFat: 0, cholesterol: 13, sodium: 46, potassium: 155, calcium: 121, iron: 0, magnesium: 12, phosphorus: 95, zinc: 0.6, vitaminA: 27, vitaminC: 0.5, vitaminD: 0.1, vitaminE: 0.1, vitaminK: 0.2, vitaminB6: 0.03, vitaminB12: 0.4, folate: 7, serving: '100g' },
  'plain yogurt': { calories: 59, protein: 3.5, carbs: 5, fat: 3.3, fiber: 0, sugar: 5, saturatedFat: 2.1, transFat: 0, cholesterol: 13, sodium: 46, potassium: 155, calcium: 121, iron: 0, magnesium: 12, phosphorus: 95, zinc: 0.6, vitaminA: 27, vitaminC: 0.5, vitaminD: 0.1, vitaminE: 0.1, vitaminK: 0.2, vitaminB6: 0.03, vitaminB12: 0.4, folate: 7, serving: '100g' },
  'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, saturatedFat: 1.7, transFat: 0, cholesterol: 17, sodium: 364, potassium: 104, calcium: 83, iron: 0.1, magnesium: 8, phosphorus: 159, zinc: 0.4, vitaminA: 37, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.1, vitaminB6: 0.05, vitaminB12: 0.4, folate: 12, serving: '100g' },
  'cheddar cheese': { calories: 403, protein: 23, carbs: 3.1, fat: 33, fiber: 0, sugar: 0.3, saturatedFat: 21, transFat: 1.2, cholesterol: 99, sodium: 654, potassium: 76, calcium: 710, iron: 0.1, magnesium: 27, phosphorus: 455, zinc: 3.6, vitaminA: 265, vitaminC: 0, vitaminD: 0.6, vitaminE: 0.7, vitaminK: 2.4, vitaminB6: 0.07, vitaminB12: 1.1, folate: 27, serving: '100g' },
  'mozzarella': { calories: 280, protein: 28, carbs: 3.1, fat: 17, fiber: 0, sugar: 1.0, saturatedFat: 11, transFat: 0.5, cholesterol: 54, sodium: 619, potassium: 76, calcium: 505, iron: 0.2, magnesium: 20, phosphorus: 354, zinc: 2.9, vitaminA: 174, vitaminC: 0, vitaminD: 0.4, vitaminE: 0.2, vitaminK: 2.3, vitaminB6: 0.04, vitaminB12: 2.3, folate: 7, serving: '100g' },
  'parmesan': { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0, sugar: 0.9, saturatedFat: 19, transFat: 0, cholesterol: 88, sodium: 1529, potassium: 92, calcium: 1109, iron: 0.5, magnesium: 44, phosphorus: 694, zinc: 2.8, vitaminA: 171, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.2, vitaminK: 1.7, vitaminB6: 0.09, vitaminB12: 1.2, folate: 7, serving: '100g' },
  'swiss cheese': { calories: 380, protein: 27, carbs: 5.4, fat: 28, fiber: 0, sugar: 1.4, saturatedFat: 18, transFat: 0.9, cholesterol: 92, sodium: 192, potassium: 77, calcium: 791, iron: 0.1, magnesium: 38, phosphorus: 567, zinc: 4.4, vitaminA: 220, vitaminC: 0, vitaminD: 0.6, vitaminE: 0.3, vitaminK: 2.5, vitaminB6: 0.08, vitaminB12: 3.1, folate: 10, serving: '100g' },
  'feta cheese': { calories: 264, protein: 14, carbs: 4.1, fat: 21, fiber: 0, sugar: 4.1, saturatedFat: 15, transFat: 0, cholesterol: 89, sodium: 1116, potassium: 62, calcium: 493, iron: 0.7, magnesium: 19, phosphorus: 337, zinc: 2.9, vitaminA: 125, vitaminC: 0, vitaminD: 0.4, vitaminE: 0.2, vitaminK: 1.8, vitaminB6: 0.42, vitaminB12: 1.7, folate: 32, serving: '100g' },
  'cream cheese': { calories: 342, protein: 6, carbs: 4.1, fat: 34, fiber: 0, sugar: 3.8, saturatedFat: 19, transFat: 1.2, cholesterol: 110, sodium: 321, potassium: 138, calcium: 98, iron: 0.4, magnesium: 9, phosphorus: 106, zinc: 0.5, vitaminA: 362, vitaminC: 0, vitaminD: 0.3, vitaminE: 0.6, vitaminK: 2.9, vitaminB6: 0.03, vitaminB12: 0.2, folate: 11, serving: '100g' },
  'brie': { calories: 334, protein: 21, carbs: 0.5, fat: 28, fiber: 0, sugar: 0.5, saturatedFat: 17, transFat: 0.7, cholesterol: 100, sodium: 629, potassium: 152, calcium: 184, iron: 0.5, magnesium: 20, phosphorus: 188, zinc: 2.4, vitaminA: 173, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.2, vitaminK: 2.3, vitaminB6: 0.24, vitaminB12: 1.7, folate: 65, serving: '100g' },
  'goat cheese': { calories: 364, protein: 22, carbs: 0.1, fat: 30, fiber: 0, sugar: 0.1, saturatedFat: 21, transFat: 0, cholesterol: 79, sodium: 515, potassium: 158, calcium: 298, iron: 1.9, magnesium: 29, phosphorus: 256, zinc: 1.3, vitaminA: 407, vitaminC: 0, vitaminD: 0.6, vitaminE: 0.2, vitaminK: 2.5, vitaminB6: 0.25, vitaminB12: 0.2, folate: 12, serving: '100g' },
  'ricotta': { calories: 174, protein: 11, carbs: 3, fat: 13, fiber: 0, sugar: 0.3, saturatedFat: 8.3, transFat: 0, cholesterol: 51, sodium: 84, potassium: 105, calcium: 207, iron: 0.4, magnesium: 11, phosphorus: 158, zinc: 1.2, vitaminA: 127, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.1, vitaminK: 1.1, vitaminB6: 0.04, vitaminB12: 0.3, folate: 12, serving: '100g' },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1, saturatedFat: 51, transFat: 3.3, cholesterol: 215, sodium: 643, potassium: 24, calcium: 24, iron: 0, magnesium: 2, phosphorus: 24, zinc: 0.1, vitaminA: 684, vitaminC: 0, vitaminD: 1.5, vitaminE: 2.3, vitaminK: 7, vitaminB6: 0, vitaminB12: 0.2, folate: 3, serving: '100g' },
  'heavy cream': { calories: 340, protein: 2.1, carbs: 2.8, fat: 37, fiber: 0, sugar: 2.8, saturatedFat: 23, transFat: 1.5, cholesterol: 137, sodium: 38, potassium: 95, calcium: 66, iron: 0, magnesium: 6, phosphorus: 62, zinc: 0.2, vitaminA: 411, vitaminC: 0.6, vitaminD: 0.5, vitaminE: 1.1, vitaminK: 3.2, vitaminB6: 0.03, vitaminB12: 0.2, folate: 6, serving: '100ml' },
  'sour cream': { calories: 193, protein: 2.1, carbs: 4.6, fat: 20, fiber: 0, sugar: 3.5, saturatedFat: 10, transFat: 0.6, cholesterol: 52, sodium: 80, potassium: 141, calcium: 104, iron: 0.1, magnesium: 9, phosphorus: 71, zinc: 0.3, vitaminA: 117, vitaminC: 0.8, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.4, vitaminB6: 0.02, vitaminB12: 0.3, folate: 11, serving: '100g' },
  'ice cream': { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.7, sugar: 21, saturatedFat: 6.8, transFat: 0.4, cholesterol: 44, sodium: 80, potassium: 199, calcium: 128, iron: 0.1, magnesium: 14, phosphorus: 105, zinc: 0.7, vitaminA: 94, vitaminC: 0.6, vitaminD: 0.2, vitaminE: 0.3, vitaminK: 0.3, vitaminB6: 0.05, vitaminB12: 0.4, folate: 11, serving: '100g' },
  'almond milk': { calories: 15, protein: 0.6, carbs: 0.6, fat: 1.1, fiber: 0.2, sugar: 0, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 68, potassium: 67, calcium: 184, iron: 0.3, magnesium: 7, phosphorus: 14, zinc: 0.2, vitaminA: 50, vitaminC: 0, vitaminD: 1.0, vitaminE: 6.3, vitaminK: 0, vitaminB6: 0.01, vitaminB12: 0.4, folate: 1, serving: '100ml' },
  'oat milk': { calories: 48, protein: 1.0, carbs: 9.3, fat: 1.5, fiber: 0.8, sugar: 4, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 43, potassium: 154, calcium: 120, iron: 0.3, magnesium: 8, phosphorus: 40, zinc: 0.2, vitaminA: 50, vitaminC: 0, vitaminD: 1.0, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0.4, folate: 8, serving: '100ml' },
  'soy milk': { calories: 33, protein: 2.8, carbs: 1.7, fat: 1.6, fiber: 0.4, sugar: 1, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 47, potassium: 141, calcium: 25, iron: 0.6, magnesium: 19, phosphorus: 52, zinc: 0.3, vitaminA: 50, vitaminC: 0, vitaminD: 1.0, vitaminE: 0.1, vitaminK: 3, vitaminB6: 0.04, vitaminB12: 0.4, folate: 18, serving: '100ml' },
  'coconut milk': { calories: 230, protein: 2.3, carbs: 6, fat: 24, fiber: 0, sugar: 3.3, saturatedFat: 21, transFat: 0, cholesterol: 0, sodium: 15, potassium: 263, calcium: 16, iron: 1.6, magnesium: 37, phosphorus: 100, zinc: 0.7, vitaminA: 0, vitaminC: 2.8, vitaminD: 0, vitaminE: 0.2, vitaminK: 0.1, vitaminB6: 0.03, vitaminB12: 0, folate: 16, serving: '100ml' },
  'half and half': { calories: 131, protein: 2.6, carbs: 4.3, fat: 12, fiber: 0, sugar: 4.3, saturatedFat: 7.2, transFat: 0.4, cholesterol: 37, sodium: 41, potassium: 130, calcium: 105, iron: 0, magnesium: 10, phosphorus: 95, zinc: 0.5, vitaminA: 107, vitaminC: 0.9, vitaminD: 0.5, vitaminE: 0.3, vitaminK: 1.0, vitaminB6: 0.04, vitaminB12: 0.3, folate: 3, serving: '100ml' },
  'whipped cream': { calories: 257, protein: 3.2, carbs: 12, fat: 22, fiber: 0, sugar: 12, saturatedFat: 14, transFat: 0.9, cholesterol: 76, sodium: 74, potassium: 147, calcium: 101, iron: 0.1, magnesium: 9, phosphorus: 76, zinc: 0.4, vitaminA: 228, vitaminC: 0.8, vitaminD: 0.5, vitaminE: 0.6, vitaminK: 2.4, vitaminB6: 0.04, vitaminB12: 0.3, folate: 6, serving: '100g' },

  // ===== NUTS, SEEDS & OILS =====
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.4, saturatedFat: 3.8, transFat: 0, cholesterol: 0, sodium: 1, potassium: 733, calcium: 269, iron: 3.7, magnesium: 270, phosphorus: 481, zinc: 3.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 26, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 44, serving: '100g' },
  'almond butter': { calories: 614, protein: 21, carbs: 19, fat: 56, fiber: 10.3, sugar: 4.4, saturatedFat: 4.4, transFat: 0, cholesterol: 0, sodium: 7, potassium: 748, calcium: 347, iron: 3.5, magnesium: 279, phosphorus: 508, zinc: 3.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 24, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 53, serving: '100g' },
  'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.7, saturatedFat: 6.8, transFat: 0, cholesterol: 0, sodium: 18, potassium: 705, calcium: 92, iron: 4.6, magnesium: 168, phosphorus: 376, zinc: 3.3, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 8.3, vitaminK: 0, vitaminB6: 0.35, vitaminB12: 0, folate: 240, serving: '100g' },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, saturatedFat: 10, transFat: 0, cholesterol: 0, sodium: 459, potassium: 649, calcium: 43, iron: 1.7, magnesium: 154, phosphorus: 335, zinc: 2.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 9, vitaminK: 0.3, vitaminB6: 0.4, vitaminB12: 0, folate: 87, serving: '100g' },
  'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6, saturatedFat: 6.1, transFat: 0, cholesterol: 0, sodium: 2, potassium: 441, calcium: 98, iron: 2.9, magnesium: 158, phosphorus: 346, zinc: 3.1, vitaminA: 1, vitaminC: 1.3, vitaminD: 0, vitaminE: 0.7, vitaminK: 2.7, vitaminB6: 0.54, vitaminB12: 0, folate: 98, serving: '100g' },
  'cashews': { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, sugar: 5.9, saturatedFat: 7.8, transFat: 0, cholesterol: 0, sodium: 12, potassium: 660, calcium: 37, iron: 6.7, magnesium: 292, phosphorus: 593, zinc: 5.8, vitaminA: 0, vitaminC: 0.5, vitaminD: 0, vitaminE: 0.9, vitaminK: 34, vitaminB6: 0.42, vitaminB12: 0, folate: 25, serving: '100g' },
  'cashew butter': { calories: 587, protein: 18, carbs: 28, fat: 49, fiber: 2, sugar: 5.2, saturatedFat: 9.8, transFat: 0, cholesterol: 0, sodium: 15, potassium: 546, calcium: 43, iron: 5.0, magnesium: 258, phosphorus: 457, zinc: 5.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, vitaminK: 33, vitaminB6: 0.26, vitaminB12: 0, folate: 68, serving: '100g' },
  'pecans': { calories: 691, protein: 9, carbs: 14, fat: 72, fiber: 9.6, sugar: 4, saturatedFat: 6.2, transFat: 0, cholesterol: 0, sodium: 0, potassium: 410, calcium: 70, iron: 2.5, magnesium: 121, phosphorus: 277, zinc: 4.5, vitaminA: 3, vitaminC: 1.1, vitaminD: 0, vitaminE: 1.4, vitaminK: 3.5, vitaminB6: 0.21, vitaminB12: 0, folate: 22, serving: '100g' },
  'macadamia nuts': { calories: 718, protein: 8, carbs: 14, fat: 76, fiber: 8.6, sugar: 4.6, saturatedFat: 12, transFat: 0, cholesterol: 0, sodium: 5, potassium: 368, calcium: 85, iron: 3.7, magnesium: 130, phosphorus: 188, zinc: 1.3, vitaminA: 0, vitaminC: 1.2, vitaminD: 0, vitaminE: 0.5, vitaminK: 0, vitaminB6: 0.28, vitaminB12: 0, folate: 11, serving: '100g' },
  'pistachios': { calories: 560, protein: 20, carbs: 28, fat: 45, fiber: 10, sugar: 7.7, saturatedFat: 5.6, transFat: 0, cholesterol: 0, sodium: 1, potassium: 1025, calcium: 105, iron: 3.9, magnesium: 121, phosphorus: 490, zinc: 2.2, vitaminA: 26, vitaminC: 5.6, vitaminD: 0, vitaminE: 2.9, vitaminK: 13, vitaminB6: 1.7, vitaminB12: 0, folate: 51, serving: '100g' },
  'hazelnuts': { calories: 628, protein: 15, carbs: 17, fat: 61, fiber: 9.7, sugar: 4.3, saturatedFat: 4.5, transFat: 0, cholesterol: 0, sodium: 0, potassium: 680, calcium: 114, iron: 4.7, magnesium: 163, phosphorus: 290, zinc: 2.5, vitaminA: 1, vitaminC: 6.3, vitaminD: 0, vitaminE: 15, vitaminK: 14, vitaminB6: 0.56, vitaminB12: 0, folate: 113, serving: '100g' },
  'brazil nuts': { calories: 659, protein: 14, carbs: 12, fat: 67, fiber: 7.5, sugar: 2.3, saturatedFat: 15, transFat: 0, cholesterol: 0, sodium: 3, potassium: 659, calcium: 160, iron: 2.4, magnesium: 376, phosphorus: 725, zinc: 4.1, vitaminA: 0, vitaminC: 0.7, vitaminD: 0, vitaminE: 5.7, vitaminK: 0, vitaminB6: 0.1, vitaminB12: 0, folate: 22, serving: '100g' },
  'pine nuts': { calories: 673, protein: 14, carbs: 13, fat: 68, fiber: 3.7, sugar: 3.6, saturatedFat: 4.9, transFat: 0, cholesterol: 0, sodium: 2, potassium: 597, calcium: 16, iron: 5.5, magnesium: 251, phosphorus: 575, zinc: 6.4, vitaminA: 1, vitaminC: 0.8, vitaminD: 0, vitaminE: 9.3, vitaminK: 54, vitaminB6: 0.09, vitaminB12: 0, folate: 34, serving: '100g' },
  'mixed nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 7, sugar: 4.8, saturatedFat: 7.2, transFat: 0, cholesterol: 0, sodium: 268, potassium: 632, calcium: 96, iron: 2.6, magnesium: 210, phosphorus: 424, zinc: 4.0, vitaminA: 1, vitaminC: 0.5, vitaminD: 0, vitaminE: 8.3, vitaminK: 5.4, vitaminB6: 0.41, vitaminB12: 0, folate: 60, serving: '100g' },
  'sunflower seeds': { calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6, sugar: 2.6, saturatedFat: 4.5, transFat: 0, cholesterol: 0, sodium: 9, potassium: 645, calcium: 78, iron: 5.3, magnesium: 325, phosphorus: 660, zinc: 5.0, vitaminA: 3, vitaminC: 1.4, vitaminD: 0, vitaminE: 35, vitaminK: 0, vitaminB6: 1.35, vitaminB12: 0, folate: 227, serving: '100g' },
  'pumpkin seeds': { calories: 559, protein: 30, carbs: 11, fat: 49, fiber: 6, sugar: 1.4, saturatedFat: 8.5, transFat: 0, cholesterol: 0, sodium: 7, potassium: 809, calcium: 46, iron: 8.8, magnesium: 592, phosphorus: 1233, zinc: 7.8, vitaminA: 1, vitaminC: 1.9, vitaminD: 0, vitaminE: 2.2, vitaminK: 7.3, vitaminB6: 0.14, vitaminB12: 0, folate: 58, serving: '100g' },
  'chia seeds': { calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34, sugar: 0, saturatedFat: 3.3, transFat: 0, cholesterol: 0, sodium: 16, potassium: 407, calcium: 631, iron: 7.7, magnesium: 335, phosphorus: 860, zinc: 4.6, vitaminA: 54, vitaminC: 1.6, vitaminD: 0, vitaminE: 0.5, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 49, serving: '100g' },
  'flax seeds': { calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27, sugar: 1.6, saturatedFat: 3.7, transFat: 0, cholesterol: 0, sodium: 30, potassium: 813, calcium: 255, iron: 5.7, magnesium: 392, phosphorus: 642, zinc: 4.3, vitaminA: 0, vitaminC: 0.6, vitaminD: 0, vitaminE: 0.3, vitaminK: 4.3, vitaminB6: 0.47, vitaminB12: 0, folate: 87, serving: '100g' },
  'hemp seeds': { calories: 553, protein: 32, carbs: 9, fat: 49, fiber: 4, sugar: 1.5, saturatedFat: 4.6, transFat: 0, cholesterol: 0, sodium: 5, potassium: 1200, calcium: 70, iron: 8, magnesium: 700, phosphorus: 1650, zinc: 10, vitaminA: 1, vitaminC: 0.5, vitaminD: 0, vitaminE: 0.8, vitaminK: 0, vitaminB6: 0.12, vitaminB12: 0, folate: 110, serving: '100g' },
  'sesame seeds': { calories: 573, protein: 18, carbs: 23, fat: 50, fiber: 12, sugar: 0.3, saturatedFat: 7, transFat: 0, cholesterol: 0, sodium: 11, potassium: 468, calcium: 975, iron: 14.6, magnesium: 351, phosphorus: 629, zinc: 7.8, vitaminA: 1, vitaminC: 0, vitaminD: 0, vitaminE: 0.3, vitaminK: 0, vitaminB6: 0.79, vitaminB12: 0, folate: 97, serving: '100g' },
  'tahini': { calories: 595, protein: 17, carbs: 21, fat: 54, fiber: 9.3, sugar: 0.5, saturatedFat: 7.6, transFat: 0, cholesterol: 0, sodium: 115, potassium: 414, calcium: 426, iron: 8.9, magnesium: 95, phosphorus: 732, zinc: 4.6, vitaminA: 4, vitaminC: 0, vitaminD: 0, vitaminE: 0.2, vitaminK: 0, vitaminB6: 0.15, vitaminB12: 0, folate: 98, serving: '100g' },
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 14, transFat: 0, cholesterol: 0, sodium: 2, potassium: 1, calcium: 1, iron: 0.6, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 14, vitaminK: 60, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 82, transFat: 0, cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.5, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },
  'avocado oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 12, transFat: 0, cholesterol: 0, sodium: 1, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 12.1, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },
  'vegetable oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 14, transFat: 0.5, cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 8.2, vitaminK: 25, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },
  'canola oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 7, transFat: 0.3, cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 17, vitaminK: 71, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },
  'sesame oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, saturatedFat: 14, transFat: 0, cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 1.4, vitaminK: 14, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '1 tbsp (14g)' },

  // ===== PREPARED FOODS & FAST FOOD =====
  'protein shake': { calories: 120, protein: 25, carbs: 3, fat: 1, fiber: 0, sugar: 1, saturatedFat: 0.5, transFat: 0, cholesterol: 50, sodium: 150, potassium: 200, calcium: 100, iron: 2, magnesium: 30, phosphorus: 150, zinc: 2, vitaminA: 100, vitaminC: 0, vitaminD: 2, vitaminE: 3, vitaminK: 0, vitaminB6: 0.3, vitaminB12: 1, folate: 50, serving: '1 scoop (30g)' },
  'protein bar': { calories: 200, protein: 20, carbs: 22, fat: 7, fiber: 3, sugar: 6, saturatedFat: 3, transFat: 0, cholesterol: 10, sodium: 200, potassium: 150, calcium: 150, iron: 2.5, magnesium: 40, phosphorus: 200, zinc: 2.5, vitaminA: 150, vitaminC: 0, vitaminD: 2, vitaminE: 5, vitaminK: 0, vitaminB6: 0.4, vitaminB12: 1.5, folate: 60, serving: '1 bar (60g)' },
  'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, saturatedFat: 4.5, transFat: 0.3, cholesterol: 22, sodium: 598, potassium: 184, calcium: 201, iron: 2.6, magnesium: 23, phosphorus: 181, zinc: 1.4, vitaminA: 74, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 5.4, vitaminB6: 0.1, vitaminB12: 0.5, folate: 43, serving: '1 slice (107g)' },
  'cheese pizza': { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sugar: 3.6, saturatedFat: 4.5, transFat: 0.3, cholesterol: 22, sodium: 598, potassium: 184, calcium: 201, iron: 2.6, magnesium: 23, phosphorus: 181, zinc: 1.4, vitaminA: 74, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 5.4, vitaminB6: 0.1, vitaminB12: 0.5, folate: 43, serving: '1 slice (107g)' },
  'pepperoni pizza': { calories: 298, protein: 12, carbs: 32, fat: 14, fiber: 2.2, sugar: 3.4, saturatedFat: 5.5, transFat: 0.4, cholesterol: 28, sodium: 683, potassium: 195, calcium: 178, iron: 2.5, magnesium: 24, phosphorus: 190, zinc: 1.6, vitaminA: 68, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.6, vitaminK: 5.8, vitaminB6: 0.13, vitaminB12: 0.6, folate: 40, serving: '1 slice (113g)' },
  'hamburger': { calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3, sugar: 5, saturatedFat: 5.3, transFat: 0.7, cholesterol: 50, sodium: 500, potassium: 230, calcium: 75, iron: 2.8, magnesium: 22, phosphorus: 158, zinc: 3.0, vitaminA: 10, vitaminC: 1, vitaminD: 0.1, vitaminE: 0.4, vitaminK: 1.5, vitaminB6: 0.2, vitaminB12: 1.2, folate: 30, serving: '1 burger (150g)' },
  'cheeseburger': { calories: 303, protein: 15, carbs: 28, fat: 14, fiber: 1.5, sugar: 6, saturatedFat: 6.4, transFat: 0.8, cholesterol: 47, sodium: 690, potassium: 225, calcium: 146, iron: 2.6, magnesium: 23, phosphorus: 195, zinc: 3.3, vitaminA: 72, vitaminC: 2, vitaminD: 0.2, vitaminE: 0.5, vitaminK: 2.2, vitaminB6: 0.18, vitaminB12: 1.3, folate: 33, serving: '1 burger (154g)' },
  'hot dog': { calories: 290, protein: 10, carbs: 24, fat: 18, fiber: 0.8, sugar: 4, saturatedFat: 6.5, transFat: 0.2, cholesterol: 45, sodium: 810, potassium: 130, calcium: 60, iron: 2.5, magnesium: 14, phosphorus: 120, zinc: 1.8, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.2, vitaminK: 1.0, vitaminB6: 0.1, vitaminB12: 0.8, folate: 40, serving: '1 hot dog (98g)' },
  'burrito': { calories: 206, protein: 9, carbs: 26, fat: 7.4, fiber: 3.5, sugar: 1.8, saturatedFat: 2.8, transFat: 0.1, cholesterol: 20, sodium: 495, potassium: 275, calcium: 102, iron: 2.3, magnesium: 35, phosphorus: 145, zinc: 1.5, vitaminA: 35, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 3.2, vitaminB6: 0.15, vitaminB12: 0.4, folate: 45, serving: '100g' },
  'taco': { calories: 226, protein: 9, carbs: 20, fat: 11, fiber: 3.3, sugar: 1.7, saturatedFat: 4.5, transFat: 0.2, cholesterol: 27, sodium: 430, potassium: 220, calcium: 118, iron: 1.9, magnesium: 32, phosphorus: 145, zinc: 1.8, vitaminA: 48, vitaminC: 3, vitaminD: 0.1, vitaminE: 0.6, vitaminK: 4.8, vitaminB6: 0.12, vitaminB12: 0.5, folate: 35, serving: '1 taco (85g)' },
  'nachos': { calories: 346, protein: 9, carbs: 36, fat: 19, fiber: 4.2, sugar: 2.5, saturatedFat: 7.8, transFat: 0.3, cholesterol: 25, sodium: 816, potassium: 245, calcium: 188, iron: 2.0, magnesium: 40, phosphorus: 195, zinc: 1.9, vitaminA: 55, vitaminC: 5, vitaminD: 0.2, vitaminE: 1.2, vitaminK: 8.5, vitaminB6: 0.2, vitaminB12: 0.3, folate: 52, serving: '100g' },
  'quesadilla': { calories: 290, protein: 12, carbs: 27, fat: 15, fiber: 1.8, sugar: 2, saturatedFat: 7.5, transFat: 0.4, cholesterol: 40, sodium: 620, potassium: 175, calcium: 230, iron: 2.2, magnesium: 28, phosphorus: 235, zinc: 2.0, vitaminA: 95, vitaminC: 1, vitaminD: 0.2, vitaminE: 0.5, vitaminK: 3.5, vitaminB6: 0.12, vitaminB12: 0.6, folate: 42, serving: '1 quesadilla (150g)' },
  'sandwich': { calories: 285, protein: 12, carbs: 34, fat: 11, fiber: 2.5, sugar: 5, saturatedFat: 3.5, transFat: 0.2, cholesterol: 32, sodium: 580, potassium: 210, calcium: 125, iron: 2.8, magnesium: 28, phosphorus: 165, zinc: 1.7, vitaminA: 45, vitaminC: 3, vitaminD: 0.2, vitaminE: 0.5, vitaminK: 8, vitaminB6: 0.15, vitaminB12: 0.6, folate: 55, serving: '1 sandwich (150g)' },
  'grilled cheese': { calories: 291, protein: 11, carbs: 27, fat: 16, fiber: 1.5, sugar: 3.5, saturatedFat: 8.5, transFat: 0.5, cholesterol: 40, sodium: 622, potassium: 100, calcium: 260, iron: 2.2, magnesium: 22, phosphorus: 220, zinc: 1.6, vitaminA: 135, vitaminC: 0, vitaminD: 0.3, vitaminE: 0.4, vitaminK: 2.8, vitaminB6: 0.08, vitaminB12: 0.6, folate: 48, serving: '1 sandwich (117g)' },
  'chicken nuggets': { calories: 296, protein: 15, carbs: 16, fat: 19, fiber: 1, sugar: 0.4, saturatedFat: 4.2, transFat: 0.2, cholesterol: 42, sodium: 562, potassium: 195, calcium: 16, iron: 1.1, magnesium: 21, phosphorus: 165, zinc: 0.9, vitaminA: 5, vitaminC: 0, vitaminD: 0.1, vitaminE: 1.8, vitaminK: 12, vitaminB6: 0.25, vitaminB12: 0.25, folate: 23, serving: '100g' },
  'chicken wings': { calories: 290, protein: 27, carbs: 8, fat: 17, fiber: 0.5, sugar: 0.6, saturatedFat: 4.5, transFat: 0.1, cholesterol: 94, sodium: 650, potassium: 220, calcium: 22, iron: 1.4, magnesium: 24, phosphorus: 185, zinc: 2.2, vitaminA: 35, vitaminC: 1, vitaminD: 0.1, vitaminE: 0.8, vitaminK: 2.5, vitaminB6: 0.35, vitaminB12: 0.4, folate: 8, serving: '100g' },
  'fried chicken': { calories: 260, protein: 18, carbs: 11, fat: 16, fiber: 0.5, sugar: 0.3, saturatedFat: 4.0, transFat: 0.1, cholesterol: 75, sodium: 530, potassium: 210, calcium: 18, iron: 1.2, magnesium: 22, phosphorus: 165, zinc: 1.5, vitaminA: 18, vitaminC: 0, vitaminD: 0.1, vitaminE: 0.7, vitaminK: 1.8, vitaminB6: 0.3, vitaminB12: 0.35, folate: 12, serving: '100g' },
  'mac and cheese': { calories: 164, protein: 6, carbs: 18, fat: 7.5, fiber: 0.7, sugar: 2.5, saturatedFat: 3.5, transFat: 0.2, cholesterol: 18, sodium: 545, potassium: 85, calcium: 135, iron: 1.1, magnesium: 15, phosphorus: 115, zinc: 0.8, vitaminA: 72, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.2, vitaminK: 1.2, vitaminB6: 0.06, vitaminB12: 0.25, folate: 25, serving: '100g' },
  'lasagna': { calories: 135, protein: 8, carbs: 13, fat: 6, fiber: 1.5, sugar: 3.5, saturatedFat: 2.8, transFat: 0.1, cholesterol: 24, sodium: 430, potassium: 245, calcium: 108, iron: 1.3, magnesium: 22, phosphorus: 115, zinc: 1.3, vitaminA: 78, vitaminC: 6, vitaminD: 0.2, vitaminE: 0.5, vitaminK: 8.5, vitaminB6: 0.12, vitaminB12: 0.5, folate: 18, serving: '100g' },
  'spaghetti bolognese': { calories: 131, protein: 6.5, carbs: 17, fat: 4, fiber: 1.8, sugar: 3.2, saturatedFat: 1.5, transFat: 0.1, cholesterol: 15, sodium: 295, potassium: 280, calcium: 22, iron: 1.5, magnesium: 22, phosphorus: 80, zinc: 1.2, vitaminA: 32, vitaminC: 6, vitaminD: 0.1, vitaminE: 0.6, vitaminK: 5.5, vitaminB6: 0.15, vitaminB12: 0.5, folate: 14, serving: '100g' },
  'fried rice': { calories: 163, protein: 4.3, carbs: 24, fat: 5.5, fiber: 0.8, sugar: 0.6, saturatedFat: 1.0, transFat: 0, cholesterol: 47, sodium: 520, potassium: 85, calcium: 20, iron: 0.8, magnesium: 15, phosphorus: 70, zinc: 0.6, vitaminA: 35, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.5, vitaminK: 3.5, vitaminB6: 0.12, vitaminB12: 0.1, folate: 12, serving: '100g' },
  'pad thai': { calories: 132, protein: 6, carbs: 15, fat: 5.5, fiber: 1.2, sugar: 4.5, saturatedFat: 1.0, transFat: 0, cholesterol: 35, sodium: 380, potassium: 145, calcium: 35, iron: 1.2, magnesium: 25, phosphorus: 85, zinc: 0.7, vitaminA: 28, vitaminC: 5, vitaminD: 0.1, vitaminE: 0.8, vitaminK: 8.5, vitaminB6: 0.15, vitaminB12: 0.3, folate: 22, serving: '100g' },
  'curry': { calories: 110, protein: 6, carbs: 8, fat: 6.5, fiber: 2, sugar: 3, saturatedFat: 2.5, transFat: 0, cholesterol: 25, sodium: 380, potassium: 250, calcium: 28, iron: 1.5, magnesium: 22, phosphorus: 85, zinc: 0.8, vitaminA: 85, vitaminC: 8, vitaminD: 0.1, vitaminE: 0.8, vitaminK: 5, vitaminB6: 0.18, vitaminB12: 0.2, folate: 18, serving: '100g' },
  'stir fry': { calories: 95, protein: 7, carbs: 8, fat: 4.5, fiber: 2.2, sugar: 3.5, saturatedFat: 0.8, transFat: 0, cholesterol: 22, sodium: 450, potassium: 290, calcium: 25, iron: 1.2, magnesium: 24, phosphorus: 95, zinc: 0.9, vitaminA: 125, vitaminC: 18, vitaminD: 0, vitaminE: 1.0, vitaminK: 25, vitaminB6: 0.2, vitaminB12: 0.2, folate: 32, serving: '100g' },
  'soup': { calories: 45, protein: 2, carbs: 7, fat: 1, fiber: 1.2, sugar: 2, saturatedFat: 0.3, transFat: 0, cholesterol: 3, sodium: 450, potassium: 165, calcium: 15, iron: 0.5, magnesium: 12, phosphorus: 35, zinc: 0.3, vitaminA: 65, vitaminC: 3, vitaminD: 0, vitaminE: 0.2, vitaminK: 3, vitaminB6: 0.06, vitaminB12: 0.1, folate: 12, serving: '100ml' },
  'chicken soup': { calories: 75, protein: 5, carbs: 8, fat: 2.5, fiber: 0.8, sugar: 1.5, saturatedFat: 0.7, transFat: 0, cholesterol: 15, sodium: 580, potassium: 165, calcium: 12, iron: 0.6, magnesium: 10, phosphorus: 55, zinc: 0.5, vitaminA: 75, vitaminC: 2, vitaminD: 0.1, vitaminE: 0.3, vitaminK: 2.5, vitaminB6: 0.1, vitaminB12: 0.15, folate: 8, serving: '100ml' },
  'tomato soup': { calories: 74, protein: 1.6, carbs: 14, fat: 1.5, fiber: 1.6, sugar: 9, saturatedFat: 0.3, transFat: 0, cholesterol: 0, sodium: 465, potassium: 285, calcium: 18, iron: 1.0, magnesium: 15, phosphorus: 30, zinc: 0.3, vitaminA: 25, vitaminC: 12, vitaminD: 0, vitaminE: 1.0, vitaminK: 5.5, vitaminB6: 0.1, vitaminB12: 0, folate: 15, serving: '100ml' },
  'salad': { calories: 20, protein: 1.5, carbs: 3.5, fat: 0.3, fiber: 1.8, sugar: 1.5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 25, potassium: 220, calcium: 35, iron: 0.8, magnesium: 12, phosphorus: 28, zinc: 0.2, vitaminA: 185, vitaminC: 18, vitaminD: 0, vitaminE: 0.4, vitaminK: 95, vitaminB6: 0.08, vitaminB12: 0, folate: 55, serving: '100g' },
  'caesar salad': { calories: 127, protein: 6, carbs: 7, fat: 9, fiber: 1.5, sugar: 1.5, saturatedFat: 2.5, transFat: 0, cholesterol: 25, sodium: 350, potassium: 180, calcium: 85, iron: 1.0, magnesium: 15, phosphorus: 85, zinc: 0.6, vitaminA: 175, vitaminC: 12, vitaminD: 0.1, vitaminE: 1.0, vitaminK: 80, vitaminB6: 0.1, vitaminB12: 0.2, folate: 55, serving: '100g' },
  'coleslaw': { calories: 82, protein: 0.8, carbs: 8, fat: 5.5, fiber: 1.2, sugar: 5.5, saturatedFat: 0.8, transFat: 0, cholesterol: 5, sodium: 95, potassium: 100, calcium: 25, iron: 0.3, magnesium: 8, phosphorus: 20, zinc: 0.1, vitaminA: 8, vitaminC: 15, vitaminD: 0, vitaminE: 0.3, vitaminK: 25, vitaminB6: 0.08, vitaminB12: 0, folate: 25, serving: '100g' },
  'pancakes': { calories: 227, protein: 6, carbs: 28, fat: 10, fiber: 1, sugar: 6, saturatedFat: 2.2, transFat: 0.2, cholesterol: 50, sodium: 428, potassium: 110, calcium: 96, iron: 1.8, magnesium: 14, phosphorus: 170, zinc: 0.6, vitaminA: 45, vitaminC: 0, vitaminD: 0.3, vitaminE: 0.4, vitaminK: 1.5, vitaminB6: 0.08, vitaminB12: 0.3, folate: 45, serving: '100g' },
  'waffles': { calories: 291, protein: 8, carbs: 33, fat: 14, fiber: 1.5, sugar: 6, saturatedFat: 3.5, transFat: 0.4, cholesterol: 70, sodium: 490, potassium: 130, calcium: 178, iron: 2.8, magnesium: 18, phosphorus: 225, zinc: 0.9, vitaminA: 80, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.7, vitaminK: 3, vitaminB6: 0.12, vitaminB12: 0.4, folate: 70, serving: '100g' },
  'french toast': { calories: 229, protein: 8, carbs: 24, fat: 11, fiber: 0.8, sugar: 5, saturatedFat: 3, transFat: 0.2, cholesterol: 105, sodium: 385, potassium: 130, calcium: 95, iron: 2.2, magnesium: 16, phosphorus: 145, zinc: 0.8, vitaminA: 90, vitaminC: 0, vitaminD: 0.5, vitaminE: 0.6, vitaminK: 3.5, vitaminB6: 0.08, vitaminB12: 0.4, folate: 48, serving: '100g' },
  'donut': { calories: 452, protein: 5, carbs: 51, fat: 25, fiber: 1.7, sugar: 24, saturatedFat: 7, transFat: 0.8, cholesterol: 18, sodium: 349, potassium: 66, calcium: 26, iron: 2.2, magnesium: 14, phosphorus: 70, zinc: 0.5, vitaminA: 5, vitaminC: 0, vitaminD: 0.1, vitaminE: 1.5, vitaminK: 12, vitaminB6: 0.05, vitaminB12: 0.1, folate: 60, serving: '1 donut (75g)' },
  'muffin': { calories: 377, protein: 6, carbs: 50, fat: 18, fiber: 2.5, sugar: 28, saturatedFat: 3.5, transFat: 0.3, cholesterol: 45, sodium: 380, potassium: 135, calcium: 55, iron: 2.0, magnesium: 25, phosphorus: 140, zinc: 0.7, vitaminA: 35, vitaminC: 0.5, vitaminD: 0.2, vitaminE: 1.0, vitaminK: 5.5, vitaminB6: 0.08, vitaminB12: 0.2, folate: 45, serving: '1 muffin (113g)' },
  'cookie': { calories: 488, protein: 5, carbs: 64, fat: 24, fiber: 2.2, sugar: 36, saturatedFat: 8, transFat: 0.5, cholesterol: 20, sodium: 360, potassium: 135, calcium: 35, iron: 2.5, magnesium: 30, phosphorus: 90, zinc: 0.7, vitaminA: 25, vitaminC: 0, vitaminD: 0.1, vitaminE: 1.8, vitaminK: 8, vitaminB6: 0.06, vitaminB12: 0.1, folate: 45, serving: '100g' },
  'chocolate chip cookie': { calories: 488, protein: 5, carbs: 64, fat: 24, fiber: 2.2, sugar: 36, saturatedFat: 8, transFat: 0.5, cholesterol: 20, sodium: 360, potassium: 135, calcium: 35, iron: 2.5, magnesium: 30, phosphorus: 90, zinc: 0.7, vitaminA: 25, vitaminC: 0, vitaminD: 0.1, vitaminE: 1.8, vitaminK: 8, vitaminB6: 0.06, vitaminB12: 0.1, folate: 45, serving: '100g' },
  'brownie': { calories: 466, protein: 5, carbs: 65, fat: 22, fiber: 2.5, sugar: 48, saturatedFat: 6.5, transFat: 0.3, cholesterol: 35, sodium: 230, potassium: 165, calcium: 35, iron: 3.2, magnesium: 45, phosphorus: 95, zinc: 1.0, vitaminA: 40, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.8, vitaminK: 4, vitaminB6: 0.04, vitaminB12: 0.15, folate: 22, serving: '100g' },
  'cake': { calories: 367, protein: 5, carbs: 57, fat: 15, fiber: 0.8, sugar: 38, saturatedFat: 4, transFat: 0.4, cholesterol: 50, sodium: 335, potassium: 100, calcium: 72, iron: 1.8, magnesium: 12, phosphorus: 115, zinc: 0.5, vitaminA: 55, vitaminC: 0, vitaminD: 0.2, vitaminE: 0.8, vitaminK: 2.5, vitaminB6: 0.04, vitaminB12: 0.2, folate: 35, serving: '100g' },
  'cheesecake': { calories: 321, protein: 5, carbs: 26, fat: 22, fiber: 0.4, sugar: 19, saturatedFat: 12, transFat: 0.6, cholesterol: 70, sodium: 285, potassium: 100, calcium: 60, iron: 0.8, magnesium: 10, phosphorus: 75, zinc: 0.5, vitaminA: 165, vitaminC: 1, vitaminD: 0.2, vitaminE: 0.4, vitaminK: 2.2, vitaminB6: 0.04, vitaminB12: 0.2, folate: 15, serving: '100g' },
  'chocolate': { calories: 546, protein: 5, carbs: 60, fat: 31, fiber: 7, sugar: 48, saturatedFat: 19, transFat: 0, cholesterol: 8, sodium: 24, potassium: 559, calcium: 56, iron: 8, magnesium: 146, phosphorus: 206, zinc: 2.0, vitaminA: 2, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, vitaminK: 7.3, vitaminB6: 0.04, vitaminB12: 0.3, folate: 12, serving: '100g' },
  'dark chocolate': { calories: 598, protein: 8, carbs: 46, fat: 43, fiber: 11, sugar: 24, saturatedFat: 25, transFat: 0, cholesterol: 3, sodium: 20, potassium: 715, calcium: 73, iron: 12, magnesium: 228, phosphorus: 308, zinc: 3.3, vitaminA: 1, vitaminC: 0, vitaminD: 0, vitaminE: 0.6, vitaminK: 7.3, vitaminB6: 0.04, vitaminB12: 0.3, folate: 12, serving: '100g' },

  // ===== BEVERAGES & CONDIMENTS =====
  'coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 116, calcium: 5, iron: 0, magnesium: 7, phosphorus: 7, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 5, serving: '240ml' },
  'black coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 116, calcium: 5, iron: 0, magnesium: 7, phosphorus: 7, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 5, serving: '240ml' },
  'latte': { calories: 135, protein: 7, carbs: 14, fat: 5, fiber: 0, sugar: 13, saturatedFat: 3, transFat: 0, cholesterol: 20, sodium: 95, potassium: 290, calcium: 225, iron: 0.2, magnesium: 20, phosphorus: 165, zinc: 0.8, vitaminA: 55, vitaminC: 0, vitaminD: 1.5, vitaminE: 0.1, vitaminK: 0.4, vitaminB6: 0.06, vitaminB12: 0.8, folate: 8, serving: '355ml' },
  'cappuccino': { calories: 75, protein: 4, carbs: 8, fat: 3, fiber: 0, sugar: 7, saturatedFat: 1.8, transFat: 0, cholesterol: 12, sodium: 55, potassium: 160, calcium: 125, iron: 0.1, magnesium: 12, phosphorus: 95, zinc: 0.4, vitaminA: 30, vitaminC: 0, vitaminD: 0.8, vitaminE: 0.1, vitaminK: 0.2, vitaminB6: 0.04, vitaminB12: 0.5, folate: 5, serving: '180ml' },
  'espresso': { calories: 5, protein: 0.3, carbs: 1, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 8, potassium: 68, calcium: 2, iron: 0.1, magnesium: 16, phosphorus: 5, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 1, serving: '30ml' },
  'tea': { calories: 2, protein: 0, carbs: 1, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 7, potassium: 88, calcium: 0, iron: 0, magnesium: 3, phosphorus: 2, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 12, serving: '240ml' },
  'green tea': { calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2, potassium: 27, calcium: 0, iron: 0, magnesium: 1, phosphorus: 1, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 5, serving: '240ml' },
  'orange juice': { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, sugar: 8, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 200, calcium: 11, iron: 0.2, magnesium: 11, phosphorus: 17, zinc: 0.1, vitaminA: 10, vitaminC: 50, vitaminD: 0, vitaminE: 0.1, vitaminK: 0.1, vitaminB6: 0.04, vitaminB12: 0, folate: 30, serving: '100ml' },
  'apple juice': { calories: 46, protein: 0.1, carbs: 11, fat: 0.1, fiber: 0.1, sugar: 10, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 101, calcium: 8, iron: 0.3, magnesium: 5, phosphorus: 7, zinc: 0, vitaminA: 0, vitaminC: 0.9, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.02, vitaminB12: 0, folate: 0, serving: '100ml' },
  'soda': { calories: 41, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 12, potassium: 4, calcium: 4, iron: 0, magnesium: 0, phosphorus: 14, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100ml' },
  'cola': { calories: 41, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 12, potassium: 4, calcium: 4, iron: 0, magnesium: 0, phosphorus: 14, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100ml' },
  'energy drink': { calories: 45, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 105, potassium: 7, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 2.0, vitaminB12: 2.5, folate: 0, serving: '100ml' },
  'beer': { calories: 43, protein: 0.5, carbs: 3.6, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 27, calcium: 4, iron: 0, magnesium: 6, phosphorus: 14, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.05, vitaminB12: 0.02, folate: 6, serving: '100ml' },
  'wine': { calories: 85, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0, sugar: 0.6, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 127, calcium: 8, iron: 0.5, magnesium: 12, phosphorus: 22, zinc: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.4, vitaminB6: 0.06, vitaminB12: 0, folate: 1, serving: '100ml' },
  'red wine': { calories: 85, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0, sugar: 0.6, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 127, calcium: 8, iron: 0.5, magnesium: 12, phosphorus: 22, zinc: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.4, vitaminB6: 0.06, vitaminB12: 0, folate: 1, serving: '100ml' },
  'white wine': { calories: 82, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0, sugar: 1, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5, potassium: 71, calcium: 9, iron: 0.3, magnesium: 10, phosphorus: 18, zinc: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0.4, vitaminB6: 0.05, vitaminB12: 0, folate: 1, serving: '100ml' },
  'ketchup': { calories: 112, protein: 1.7, carbs: 26, fat: 0.1, fiber: 0.3, sugar: 22, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 907, potassium: 315, calcium: 14, iron: 0.3, magnesium: 13, phosphorus: 26, zinc: 0.2, vitaminA: 26, vitaminC: 4, vitaminD: 0, vitaminE: 1.5, vitaminK: 3, vitaminB6: 0.16, vitaminB12: 0, folate: 9, serving: '100g' },
  'mustard': { calories: 66, protein: 4, carbs: 5, fat: 4, fiber: 3.3, sugar: 2.2, saturatedFat: 0.2, transFat: 0, cholesterol: 0, sodium: 1135, potassium: 138, calcium: 58, iron: 1.5, magnesium: 49, phosphorus: 106, zinc: 0.6, vitaminA: 8, vitaminC: 1.5, vitaminD: 0, vitaminE: 0.4, vitaminK: 1.8, vitaminB6: 0.07, vitaminB12: 0, folate: 7, serving: '100g' },
  'mayonnaise': { calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0, sugar: 0.4, saturatedFat: 12, transFat: 0, cholesterol: 42, sodium: 635, potassium: 20, calcium: 8, iron: 0.2, magnesium: 2, phosphorus: 28, zinc: 0.1, vitaminA: 27, vitaminC: 0, vitaminD: 0.1, vitaminE: 3.3, vitaminK: 81, vitaminB6: 0.02, vitaminB12: 0.1, folate: 2, serving: '100g' },
  'salsa': { calories: 36, protein: 1.5, carbs: 8, fat: 0.2, fiber: 1.7, sugar: 5, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 560, potassium: 280, calcium: 20, iron: 0.6, magnesium: 15, phosphorus: 28, zinc: 0.3, vitaminA: 30, vitaminC: 9, vitaminD: 0, vitaminE: 0.8, vitaminK: 4.2, vitaminB6: 0.14, vitaminB12: 0, folate: 13, serving: '100g' },
  'soy sauce': { calories: 53, protein: 8, carbs: 5, fat: 0, fiber: 0.8, sugar: 0.4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 5493, potassium: 212, calcium: 19, iron: 1.9, magnesium: 40, phosphorus: 130, zinc: 0.4, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.15, vitaminB12: 0, folate: 18, serving: '100ml' },
  'hot sauce': { calories: 11, protein: 0.5, carbs: 2.4, fat: 0.1, fiber: 0.6, sugar: 0.9, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 2643, potassium: 144, calcium: 8, iron: 0.5, magnesium: 8, phosphorus: 19, zinc: 0.1, vitaminA: 52, vitaminC: 9, vitaminD: 0, vitaminE: 1.5, vitaminK: 0.4, vitaminB6: 0.08, vitaminB12: 0, folate: 6, serving: '100ml' },
  'bbq sauce': { calories: 172, protein: 0.8, carbs: 41, fat: 0.6, fiber: 0.9, sugar: 33, saturatedFat: 0.1, transFat: 0, cholesterol: 0, sodium: 1027, potassium: 212, calcium: 20, iron: 1.0, magnesium: 12, phosphorus: 24, zinc: 0.2, vitaminA: 18, vitaminC: 0.4, vitaminD: 0, vitaminE: 0.6, vitaminK: 1.8, vitaminB6: 0.08, vitaminB12: 0, folate: 3, serving: '100g' },
  'honey': { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, sugar: 82, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 4, potassium: 52, calcium: 6, iron: 0.4, magnesium: 2, phosphorus: 4, zinc: 0.2, vitaminA: 0, vitaminC: 0.5, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.02, vitaminB12: 0, folate: 2, serving: '100g' },
  'maple syrup': { calories: 260, protein: 0, carbs: 67, fat: 0.1, fiber: 0, sugar: 60, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 12, potassium: 212, calcium: 102, iron: 0.1, magnesium: 21, phosphorus: 2, zinc: 1.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100ml' },
  'jam': { calories: 278, protein: 0.4, carbs: 69, fat: 0.1, fiber: 1.1, sugar: 49, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 32, potassium: 77, calcium: 20, iron: 0.5, magnesium: 4, phosphorus: 19, zinc: 0.1, vitaminA: 1, vitaminC: 8.8, vitaminD: 0, vitaminE: 0.1, vitaminK: 1.5, vitaminB6: 0.02, vitaminB12: 0, folate: 5, serving: '100g' },
  'sugar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 1, potassium: 2, calcium: 1, iron: 0.1, magnesium: 0, phosphorus: 0, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100g' },
  'salt': { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 38758, potassium: 8, calcium: 24, iron: 0.3, magnesium: 1, phosphorus: 0, zinc: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100g' },
  'vinegar': { calories: 18, protein: 0, carbs: 0.9, fat: 0, fiber: 0, sugar: 0.4, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 8, potassium: 73, calcium: 6, iron: 0.2, magnesium: 4, phosphorus: 8, zinc: 0, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0, vitaminB12: 0, folate: 0, serving: '100ml' },
  'balsamic vinegar': { calories: 88, protein: 0.5, carbs: 17, fat: 0, fiber: 0, sugar: 15, saturatedFat: 0, transFat: 0, cholesterol: 0, sodium: 23, potassium: 112, calcium: 27, iron: 0.7, magnesium: 12, phosphorus: 19, zinc: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0, vitaminB6: 0.03, vitaminB12: 0, folate: 1, serving: '100ml' },
  'ranch dressing': { calories: 455, protein: 1.6, carbs: 5.5, fat: 47, fiber: 0.4, sugar: 3.2, saturatedFat: 7.3, transFat: 0, cholesterol: 27, sodium: 780, potassium: 75, calcium: 25, iron: 0.2, magnesium: 5, phosphorus: 35, zinc: 0.2, vitaminA: 35, vitaminC: 0.5, vitaminD: 0.1, vitaminE: 2.5, vitaminK: 55, vitaminB6: 0.02, vitaminB12: 0.1, folate: 5, serving: '100g' },
  'italian dressing': { calories: 270, protein: 0.3, carbs: 8, fat: 27, fiber: 0.2, sugar: 7, saturatedFat: 3.8, transFat: 0, cholesterol: 0, sodium: 950, potassium: 45, calcium: 8, iron: 0.2, magnesium: 3, phosphorus: 12, zinc: 0.1, vitaminA: 8, vitaminC: 0.5, vitaminD: 0, vitaminE: 3.5, vitaminK: 45, vitaminB6: 0.02, vitaminB12: 0, folate: 2, serving: '100g' },
  'guacamole': { calories: 157, protein: 2, carbs: 8.5, fat: 14, fiber: 6, sugar: 0.7, saturatedFat: 2.0, transFat: 0, cholesterol: 0, sodium: 375, potassium: 440, calcium: 12, iron: 0.5, magnesium: 28, phosphorus: 50, zinc: 0.6, vitaminA: 10, vitaminC: 10, vitaminD: 0, vitaminE: 2.0, vitaminK: 20, vitaminB6: 0.25, vitaminB12: 0, folate: 75, serving: '100g' },
  'pesto': { calories: 314, protein: 6, carbs: 5, fat: 30, fiber: 2, sugar: 1.2, saturatedFat: 5.8, transFat: 0, cholesterol: 8, sodium: 680, potassium: 195, calcium: 175, iron: 2.0, magnesium: 40, phosphorus: 115, zinc: 1.0, vitaminA: 90, vitaminC: 3, vitaminD: 0, vitaminE: 4.5, vitaminK: 175, vitaminB6: 0.12, vitaminB12: 0.1, folate: 35, serving: '100g' },
};

// Unit conversions to grams (generic defaults)
const UNIT_TO_GRAMS = {
  g: 1, gram: 1, grams: 1,
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.6, pound: 453.6, pounds: 453.6,
  kg: 1000,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  ml: 1, liter: 1000,
  piece: 50, pieces: 50,  // Generic default (overridden by food-specific)
  slice: 30, slices: 30,  // Generic default for bread slices
  strip: 8, strips: 8,    // For bacon strips
  serving: 100, servings: 100,
  medium: 150, large: 200, small: 80,
  whole: 150, half: 75,
  patty: 113, patties: 113, // Burger patty ~4oz
  link: 45, links: 45,     // Sausage link
  rasher: 8, rashers: 8,   // Bacon rasher (same as strip)
};

// Food-specific serving sizes in grams
// When user says "1 piece of X" or "1 slice of X", use these weights
const FOOD_SERVING_WEIGHTS = {
  // Bacon - a strip/piece is about 8g cooked
  'bacon': { piece: 8, pieces: 8, strip: 8, strips: 8, slice: 8, slices: 8, rasher: 8, rashers: 8 },
  // Eggs - large egg is about 50g
  'egg': { piece: 50, pieces: 50 },
  'eggs': { piece: 50, pieces: 50 },
  'boiled egg': { piece: 50, pieces: 50 },
  'fried egg': { piece: 46, pieces: 46 },
  'scrambled eggs': { piece: 61, pieces: 61 },  // 1 egg scrambled with butter
  // Bread slices - about 30g per slice
  'bread': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'white bread': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'whole wheat bread': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'sourdough bread': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'sourdough': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'rye bread': { slice: 30, slices: 30, piece: 30, pieces: 30 },
  'toast': { slice: 25, slices: 25, piece: 25, pieces: 25 },  // Slightly less after toasting
  // Bagels
  'bagel': { piece: 90, pieces: 90 },
  // Tortillas
  'tortilla': { piece: 64, pieces: 64 },
  'flour tortilla': { piece: 64, pieces: 64 },
  'corn tortilla': { piece: 26, pieces: 26 },
  // Pizza slices
  'pizza': { slice: 107, slices: 107, piece: 107, pieces: 107 },
  'cheese pizza': { slice: 107, slices: 107, piece: 107, pieces: 107 },
  'pepperoni pizza': { slice: 113, slices: 113, piece: 113, pieces: 113 },
  // Sausages
  'sausage': { piece: 45, pieces: 45, link: 45, links: 45 },
  'pork sausage': { piece: 45, pieces: 45, link: 45, links: 45 },
  'breakfast sausage': { piece: 28, pieces: 28, link: 28, links: 28 },
  // Hot dogs
  'hot dog': { piece: 98, pieces: 98 },
  // Hamburgers/patties
  'hamburger': { piece: 150, pieces: 150, patty: 113, patties: 113 },
  'cheeseburger': { piece: 154, pieces: 154, patty: 113, patties: 113 },
  'ground beef': { patty: 113, patties: 113 },
  // Pancakes/waffles
  'pancake': { piece: 76, pieces: 76 },
  'pancakes': { piece: 76, pieces: 76 },
  'waffle': { piece: 75, pieces: 75 },
  'waffles': { piece: 75, pieces: 75 },
  // Fruits (medium sizes)
  'apple': { piece: 182, pieces: 182 },
  'banana': { piece: 118, pieces: 118 },
  'orange': { piece: 131, pieces: 131 },
  // Chicken pieces
  'chicken wing': { piece: 34, pieces: 34 },  // 1 wing with skin
  'chicken drumstick': { piece: 72, pieces: 72 },
  'chicken thigh': { piece: 116, pieces: 116 },
  'chicken breast': { piece: 172, pieces: 172 },  // 1 breast
  // Cookies/snacks
  'cookie': { piece: 30, pieces: 30 },
  'oreo': { piece: 11, pieces: 11 },
  'chip': { piece: 1, pieces: 1 },
  'potato chips': { piece: 28, pieces: 28, serving: 28 },  // small handful of crisps
  'crisps': { piece: 28, pieces: 28, serving: 28 },  // British crisps
  // British chips = French fries (typical restaurant portion)
  'chips': { serving: 150, piece: 150, pieces: 150 },  // British chips = fries, ~150g typical
  'fries': { serving: 150, piece: 150, pieces: 150 },
  'french fries': { serving: 150, piece: 150, pieces: 150 },
  // Steaks - typical restaurant portions
  'steak': { serving: 225, piece: 225, pieces: 225 },  // ~8oz steak
  'ribeye': { serving: 280, piece: 280, pieces: 280 },  // ~10oz ribeye
  'sirloin': { serving: 225, piece: 225, pieces: 225 },  // ~8oz sirloin
  'filet mignon': { serving: 170, piece: 170, pieces: 170 },  // ~6oz filet
  'fillet steak': { serving: 170, piece: 170, pieces: 170 },
  't-bone': { serving: 340, piece: 340, pieces: 340 },  // ~12oz t-bone
  // Crackers
  'cracker': { piece: 5, pieces: 5 },
  'crackers': { piece: 5, pieces: 5 },
};

// Default portion sizes in grams when no quantity is specified
// This makes "steak and chips" give realistic calorie estimates
const DEFAULT_PORTION_SIZES = {
  // Proteins - typical restaurant/home portions
  'steak': 225,           // 8oz steak
  'ribeye': 280,          // 10oz ribeye
  'sirloin': 225,         // 8oz sirloin
  'filet mignon': 170,    // 6oz filet
  'fillet steak': 170,
  't-bone': 340,          // 12oz t-bone
  'chicken breast': 172,  // 6oz breast
  'salmon': 170,          // 6oz fillet
  'pork chop': 200,       // 7oz chop
  // Sides - typical restaurant portions
  'chips': 150,           // British chips/fries
  'fries': 150,
  'french fries': 150,
  'mashed potatoes': 175,
  'rice': 150,
  'pasta': 180,
  // Default for most items
  '_default': 100,
};

/**
 * Try to find food in local cache first
 * @param {string} foodName - Food name to search
 * @returns {object|null} - Cached nutrition data or null
 */
function findInLocalCache(foodName) {
  const normalized = foodName.toLowerCase().trim();

  // Direct match
  if (LOCAL_FOOD_CACHE[normalized]) {
    return { ...LOCAL_FOOD_CACHE[normalized], food: normalized };
  }

  // Partial match
  for (const [key, value] of Object.entries(LOCAL_FOOD_CACHE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { ...value, food: key };
    }
  }

  return null;
}

/**
 * Parse a simple quantity string like "2 eggs" or "1 cup rice"
 * @param {string} input - Input string
 * @returns {object} - { amount, unit, food }
 */
function parseSimpleInput(input) {
  let normalized = input.toLowerCase().trim();

  // Remove "of" from patterns like "5 pieces of bacon" -> "5 pieces bacon"
  normalized = normalized.replace(/\s+of\s+/g, ' ');

  // Pattern: number + optional unit + food
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(\w+)?\s*(.+)?$/);

  if (match) {
    const amount = parseFloat(match[1]) || 1;
    const possibleUnit = match[2] || '';
    let restOfString = (match[3] || '').trim();

    // Check if possibleUnit is actually a unit
    if (UNIT_TO_GRAMS[possibleUnit] || FOOD_SERVING_WEIGHTS_UNITS.has(possibleUnit)) {
      // Clean the food name - remove trailing "of" if present
      restOfString = restOfString.replace(/^of\s+/i, '');
      return { amount, unit: possibleUnit, food: restOfString || possibleUnit };
    }

    // If not, it's probably part of the food name
    return { amount, unit: 'serving', food: `${possibleUnit} ${restOfString}`.trim() };
  }

  return { amount: 1, unit: 'serving', food: normalized };
}

// Set of all possible units from food serving weights for faster lookup
const FOOD_SERVING_WEIGHTS_UNITS = new Set([
  'piece', 'pieces', 'slice', 'slices', 'strip', 'strips',
  'rasher', 'rashers', 'link', 'links', 'patty', 'patties'
]);

/**
 * Calculate nutrition from cached food with amount/unit
 * @param {object} parsedInput - { amount, unit, food }
 * @param {object} cachedFood - Nutrition data from cache
 * @returns {object} - Scaled nutrition data with full micronutrients
 */
function calculateFromCache(parsedInput, cachedFood) {
  const { amount, unit, food } = parsedInput;
  const unitLower = unit.toLowerCase();
  const foodLower = food.toLowerCase();

  // Check for food-specific serving weights first
  // This handles cases like "5 pieces of bacon" where a piece = 8g, not 100g
  let gramsPerUnit = UNIT_TO_GRAMS[unitLower] || 100;

  // Look up food-specific weight for this unit
  const foodServings = FOOD_SERVING_WEIGHTS[foodLower];
  if (foodServings && foodServings[unitLower]) {
    gramsPerUnit = foodServings[unitLower];
  }
  // If unit is "serving" and we have a default portion size, use it
  else if (unitLower === 'serving' && DEFAULT_PORTION_SIZES[foodLower]) {
    gramsPerUnit = DEFAULT_PORTION_SIZES[foodLower];
  }
  // Also check the cached food name (e.g., when 'chips' matches 'french fries')
  else if (unitLower === 'serving' && cachedFood.food && DEFAULT_PORTION_SIZES[cachedFood.food.toLowerCase()]) {
    gramsPerUnit = DEFAULT_PORTION_SIZES[cachedFood.food.toLowerCase()];
  }

  const totalGrams = amount * gramsPerUnit;

  // Cached data is per 100g, scale accordingly
  const multiplier = totalGrams / 100;

  const round = (val, decimals = 1) => Math.round((val || 0) * multiplier * Math.pow(10, decimals)) / Math.pow(10, decimals);
  const roundInt = (val) => Math.round((val || 0) * multiplier);

  return {
    food: cachedFood.food,
    amount: parsedInput.amount,
    unit: parsedInput.unit,
    // Macros
    calories: roundInt(cachedFood.calories),
    protein: round(cachedFood.protein),
    carbs: round(cachedFood.carbs),
    fat: round(cachedFood.fat),
    fiber: round(cachedFood.fiber),
    sugar: round(cachedFood.sugar),
    // Fats breakdown
    saturatedFat: round(cachedFood.saturatedFat),
    transFat: round(cachedFood.transFat),
    cholesterol: roundInt(cachedFood.cholesterol),
    // Minerals
    sodium: roundInt(cachedFood.sodium),
    potassium: roundInt(cachedFood.potassium),
    calcium: roundInt(cachedFood.calcium),
    iron: round(cachedFood.iron),
    magnesium: roundInt(cachedFood.magnesium),
    phosphorus: roundInt(cachedFood.phosphorus),
    zinc: round(cachedFood.zinc),
    // Vitamins
    vitaminA: roundInt(cachedFood.vitaminA),
    vitaminC: round(cachedFood.vitaminC),
    vitaminD: round(cachedFood.vitaminD, 2),
    vitaminE: round(cachedFood.vitaminE),
    vitaminK: round(cachedFood.vitaminK),
    vitaminB6: round(cachedFood.vitaminB6, 2),
    vitaminB12: round(cachedFood.vitaminB12, 2),
    folate: roundInt(cachedFood.folate),
    source: 'cache',
  };
}

/**
 * Parse natural language meal description using Claude Haiku + USDA
 * Falls back to local cache for common foods to reduce API costs
 *
 * @param {string} mealDescription - Natural language meal description
 * @returns {Promise<object>} - Parsed nutrition data
 */
export async function parseNutrition(mealDescription) {
  if (!mealDescription || typeof mealDescription !== 'string') {
    throw new Error('Meal description is required');
  }

  const trimmed = mealDescription.trim();
  if (trimmed.length < 2) {
    throw new Error('Meal description is too short');
  }

  // Step 1: Try simple parsing with local cache for single items
  const simpleItems = trimmed.split(/\s*,\s*|\s+and\s+|\s+with\s+/i);
  const cachedResults = [];
  const uncachedItems = [];

  for (const item of simpleItems) {
    if (!item.trim()) continue;

    const parsed = parseSimpleInput(item.trim());
    const cached = findInLocalCache(parsed.food);

    if (cached) {
      cachedResults.push(calculateFromCache(parsed, cached));
    } else {
      uncachedItems.push(item.trim());
    }
  }

  // If everything was found in cache, return early
  if (uncachedItems.length === 0 && cachedResults.length > 0) {
    const totals = calculateTotals(cachedResults);
    return {
      success: true,
      items: cachedResults,
      totals,
      source: 'cache',
    };
  }

  // Step 2: Call Edge Function for uncached items or full meal
  try {
    const descriptionToSend = uncachedItems.length > 0
      ? uncachedItems.join(', ')
      : trimmed;

    const { data, error } = await supabase.functions.invoke('parse-nutrition', {
      body: { mealDescription: descriptionToSend },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to parse nutrition');
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to parse nutrition');
    }

    // Combine cached results with API results
    const allItems = [
      ...cachedResults,
      ...(data.items || []).map(item => ({ ...item, source: 'usda' })),
    ];

    const totals = calculateTotals(allItems);

    return {
      success: true,
      items: allItems,
      totals,
      notFound: data.notFound,
      source: 'mixed',
    };
  } catch (err) {
    // If API fails but we have cached results, return those
    if (cachedResults.length > 0) {
      console.warn('API failed, using cached results only:', err.message);
      return {
        success: true,
        items: cachedResults,
        totals: calculateTotals(cachedResults),
        source: 'cache-fallback',
        warning: 'Some items could not be looked up',
      };
    }

    throw err;
  }
}

/**
 * Calculate totals from nutrition items (includes all micronutrients)
 * @param {Array} items - Array of nutrition items
 * @returns {object} - Total nutrition values including vitamins & minerals
 */
function calculateTotals(items) {
  const sumInt = (key) => items.reduce((sum, n) => sum + (n[key] || 0), 0);
  const sumRound = (key, decimals = 1) => {
    const total = items.reduce((sum, n) => sum + (n[key] || 0), 0);
    return Math.round(total * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return {
    // Macros
    calories: sumInt('calories'),
    protein: sumRound('protein'),
    carbs: sumRound('carbs'),
    fat: sumRound('fat'),
    fiber: sumRound('fiber'),
    sugar: sumRound('sugar'),
    // Fat breakdown
    saturatedFat: sumRound('saturatedFat'),
    transFat: sumRound('transFat'),
    cholesterol: sumInt('cholesterol'),
    // Minerals
    sodium: sumInt('sodium'),
    potassium: sumInt('potassium'),
    calcium: sumInt('calcium'),
    iron: sumRound('iron'),
    magnesium: sumInt('magnesium'),
    phosphorus: sumInt('phosphorus'),
    zinc: sumRound('zinc'),
    // Vitamins
    vitaminA: sumInt('vitaminA'),
    vitaminC: sumRound('vitaminC'),
    vitaminD: sumRound('vitaminD', 2),
    vitaminE: sumRound('vitaminE'),
    vitaminK: sumRound('vitaminK'),
    vitaminB6: sumRound('vitaminB6', 2),
    vitaminB12: sumRound('vitaminB12', 2),
    folate: sumInt('folate'),
  };
}

/**
 * Get quick suggestions based on partial input (uses local cache)
 * @param {string} query - Search query
 * @returns {Array} - Matching suggestions from cache
 */
export function getQuickSuggestions(query) {
  if (!query || query.length < 2) return [];

  const normalized = query.toLowerCase();
  const suggestions = [];

  for (const [foodName, nutrition] of Object.entries(LOCAL_FOOD_CACHE)) {
    if (foodName.includes(normalized)) {
      suggestions.push({
        name: foodName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        serving: nutrition.serving,
      });
    }

    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

/**
 * Detect meal type based on current time
 * @returns {string} - breakfast, lunch, dinner, or snack
 */
export function detectMealType() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'snack';
  if (hour >= 18 && hour < 23) return 'dinner';
  return 'snack';
}

export default {
  parseNutrition,
  getQuickSuggestions,
  detectMealType,
  LOCAL_FOOD_CACHE,
};
