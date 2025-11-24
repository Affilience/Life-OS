// Comprehensive food database with nutrition info
export const FOOD_DATABASE = {
  // Proteins
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
  'salmon': { calories: 206, protein: 22, carbs: 0, fat: 13, serving: '100g' },
  'ground beef': { calories: 250, protein: 26, carbs: 0, fat: 17, serving: '100g' },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '2 large' },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3, serving: '100g' },
  'turkey': { calories: 135, protein: 30, carbs: 0, fat: 0.7, serving: '100g' },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, serving: '100g' },
  'steak': { calories: 271, protein: 25, carbs: 0, fat: 19, serving: '100g' },
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, serving: '100g' },
  'shrimp': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, serving: '100g' },

  // Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100g cooked' },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, serving: '100g cooked' },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2, serving: '2 slices' },
  'oatmeal': { calories: 71, protein: 2.5, carbs: 12, fat: 1.5, serving: '100g cooked' },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, serving: '100g cooked' },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: '100g' },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, serving: '100g' },
  'bagel': { calories: 245, protein: 10, carbs: 48, fat: 1.5, serving: '1 bagel' },
  'tortilla': { calories: 218, protein: 6, carbs: 36, fat: 5, serving: '1 large' },

  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: '100g' },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '100g' },
  'salad': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, serving: '100g' },
  'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, serving: '100g' },
  'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving: '100g' },
  'cucumber': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, serving: '100g' },
  'bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3, serving: '100g' },
  'asparagus': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, serving: '100g' },
  'green beans': { calories: 31, protein: 1.8, carbs: 7, fat: 0.1, serving: '100g' },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, serving: '100g' },
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, serving: '100g' },

  // Fruits
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: '1 medium' },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: '1 medium' },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, serving: '1 medium' },
  'berries': { calories: 57, protein: 1.1, carbs: 14, fat: 0.3, serving: '100g' },
  'strawberries': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, serving: '100g' },
  'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, serving: '100g' },
  'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, serving: '100g' },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, serving: '100g' },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, serving: '100g' },
  'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, serving: '100g' },

  // Fats
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, serving: '1/2 fruit' },
  'olive oil': { calories: 119, protein: 0, carbs: 0, fat: 14, serving: '1 tbsp' },
  'nuts': { calories: 607, protein: 20, carbs: 21, fat: 54, serving: '100g' },
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, serving: '100g' },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, serving: '100g' },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33, serving: '100g' },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, serving: '100g' },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, serving: '100g' },

  // Dairy
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, serving: '100ml' },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: '100g' },
  'greek yogurt': { calories: 97, protein: 9, carbs: 3.9, fat: 5, serving: '100g' },

  // Common meals (estimates)
  'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10, serving: '1 slice' },
  'burger': { calories: 354, protein: 20, carbs: 33, fat: 16, serving: '1 burger' },
  'sandwich': { calories: 250, protein: 15, carbs: 30, fat: 8, serving: '1 sandwich' },
  'smoothie': { calories: 150, protein: 5, carbs: 30, fat: 2, serving: '1 cup' },
  'protein shake': { calories: 120, protein: 24, carbs: 3, fat: 1.5, serving: '1 scoop' },
  'salad bowl': { calories: 200, protein: 12, carbs: 15, fat: 10, serving: '1 bowl' },
  'burrito': { calories: 400, protein: 18, carbs: 50, fat: 14, serving: '1 burrito' },
  'wrap': { calories: 300, protein: 15, carbs: 35, fat: 10, serving: '1 wrap' },
};

// Common modifiers and quantities
export const QUANTITY_PATTERNS = {
  'small': 0.75,
  'medium': 1.0,
  'large': 1.5,
  'extra large': 2.0,
  'xl': 2.0,
  'half': 0.5,
  'quarter': 0.25,
  '1': 1.0,
  '2': 2.0,
  '3': 3.0,
  '4': 4.0,
  'one': 1.0,
  'two': 2.0,
  'three': 3.0,
  'four': 4.0,
  'a few': 1.5,
  'some': 1.2,
  'lots of': 2.0,
  'bunch of': 1.5,
  'handful': 0.5,
  'cup': 1.5,
  'bowl': 2.0,
};

// Cooking methods (calorie adjustments)
export const COOKING_METHODS = {
  'grilled': 1.0,
  'baked': 1.0,
  'steamed': 0.95,
  'boiled': 0.95,
  'fried': 1.3,
  'deep fried': 1.5,
  'sauteed': 1.15,
  'sautéed': 1.15,
  'roasted': 1.1,
  'pan fried': 1.25,
  'stir fried': 1.2,
  'raw': 0.9,
};

// Sample saved meals for user
export const SAMPLE_MEALS = [
  {
    id: 'meal-1',
    timestamp: '2025-01-12T08:30:00Z',
    mealType: 'breakfast',
    description: 'oatmeal with berries and almonds',
    items: [
      { name: 'oatmeal', calories: 142, protein: 5, carbs: 24, fat: 3, quantity: '200g' },
      { name: 'berries', calories: 57, protein: 1.1, carbs: 14, fat: 0.3, quantity: '100g' },
      { name: 'almonds', calories: 164, protein: 6, carbs: 6, fat: 14, quantity: '28g' },
    ],
    totalCalories: 363,
    totalProtein: 12.1,
    totalCarbs: 44,
    totalFat: 17.3,
  },
  {
    id: 'meal-2',
    timestamp: '2025-01-12T13:00:00Z',
    mealType: 'lunch',
    description: 'grilled chicken salad with olive oil',
    items: [
      { name: 'chicken breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: '100g' },
      { name: 'salad', calories: 30, protein: 2.8, carbs: 5.8, fat: 0.4, quantity: '200g' },
      { name: 'olive oil', calories: 119, protein: 0, carbs: 0, fat: 14, quantity: '1 tbsp' },
    ],
    totalCalories: 314,
    totalProtein: 33.8,
    totalCarbs: 5.8,
    totalFat: 18,
  },
  {
    id: 'meal-3',
    timestamp: '2025-01-12T19:30:00Z',
    mealType: 'dinner',
    description: 'salmon with rice and broccoli',
    items: [
      { name: 'salmon', calories: 206, protein: 22, carbs: 0, fat: 13, quantity: '100g' },
      { name: 'rice', calories: 260, protein: 5.4, carbs: 56, fat: 0.6, quantity: '200g' },
      { name: 'broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, quantity: '100g' },
    ],
    totalCalories: 500,
    totalProtein: 30.2,
    totalCarbs: 63,
    totalFat: 14,
  },
];

// Daily calorie goals (can be personalized)
export const DEFAULT_DAILY_GOALS = {
  calories: 2000,
  protein: 150, // grams
  carbs: 200,   // grams
  fat: 65,      // grams
};
