# FatSecret Nutrition API Integration Guide

## Overview
The nutrition tracking system uses the FatSecret API for natural language food search and calorie/nutrient breakdowns. Users can type "2 scrambled eggs" and instantly get accurate nutrition data.

## Quick Start

### Import the API utility:
```javascript
import { searchFoodWithNutrients, getFoodDetails } from '../services/fatSecretApi';
```

### Basic Usage:
```javascript
// Search for foods with natural language
const foods = await searchFoodWithNutrients("2 scrambled eggs");

// Result format:
// [
//   {
//     id: "123",
//     name: "Scrambled Eggs",
//     type: "Generic",
//     brand: null,
//     description: "Per 2 large - Calories: 180kcal...",
//     nutrients: {
//       calories: 180,
//       protein: 14.2,
//       carbs: 1.8,
//       fat: 12.2,
//       serving: "2 large"
//     }
//   }
// ]

// Get detailed nutrition for a specific food
const details = await getFoodDetails("123");
```

## API Credentials

**Client ID:** `c412aa48c3c84f4cad0a52405014ac30`
**Client Secret:** `63c464beaf948089890e4808fe71297`

Credentials are stored in `/src/services/fatSecretApi.js`. For production, move to environment variables.

## Authentication Flow

FatSecret uses OAuth 2.0 Client Credentials flow:

1. **Access Token Request** - Automatically handled by `getAccessToken()`
2. **Token Caching** - Tokens are cached until 5 minutes before expiry
3. **Auto-Refresh** - New tokens requested automatically when expired

```javascript
// This is handled automatically - no manual auth needed
const foods = await searchFoodWithNutrients("chicken breast");
```

## API Functions

### 1. searchFood(query, maxResults)
Search for foods by natural language query.

```javascript
const foods = await searchFood("banana", 10);
// Returns array of food search results
```

**Parameters:**
- `query` (string): Natural language search (e.g., "2 scrambled eggs")
- `maxResults` (number, optional): Max results to return (default: 20)

**Returns:**
```javascript
[
  {
    id: "123",
    name: "Scrambled Eggs",
    type: "Generic",
    brand: null,
    description: "Per 2 large - Calories: 180kcal | Fat: 12.2g..."
  }
]
```

### 2. searchFoodWithNutrients(query, maxResults)
Search with automatic nutrient parsing (recommended).

```javascript
const foods = await searchFoodWithNutrients("protein shake");
```

**Returns:**
```javascript
[
  {
    id: "456",
    name: "Protein Shake",
    // ... other fields
    nutrients: {
      calories: 160,
      protein: 25,
      carbs: 18,
      fat: 2,
      serving: "1 scoop"
    }
  }
]
```

### 3. getFoodDetails(foodId)
Get detailed nutrition info for a specific food.

```javascript
const details = await getFoodDetails("123");
```

**Returns:**
```javascript
{
  food_id: "123",
  food_name: "Scrambled Eggs",
  servings: {
    serving: [
      {
        serving_id: "456",
        serving_description: "2 large",
        calories: "180",
        protein: "14.2",
        carbohydrate: "1.8",
        fat: "12.2",
        // ... more nutrients
      }
    ]
  }
}
```

### 4. parseNutrients(description)
Parse food description string into structured nutrients.

```javascript
const nutrients = parseNutrients(
  "Per 2 large - Calories: 180kcal | Fat: 12.2g | Carbs: 1.8g | Protein: 14.2g"
);

// Returns:
// {
//   calories: 180,
//   protein: 14.2,
//   carbs: 1.8,
//   fat: 12.2,
//   serving: "2 large"
// }
```

### 5. testConnection()
Test API connection and authentication.

```javascript
const isConnected = await testConnection();
// Logs: "✅ FatSecret API connected successfully"
```

## NutritionLogger Component

The `NutritionLogger` component provides a complete UI for food search and logging.

### Usage:
```javascript
import NutritionLogger from '../components/health/NutritionLogger';

function MyComponent() {
  const handleAddFood = (food) => {
    console.log('Food logged:', food);
    // food contains: { id, name, brand, calories, protein, carbs, fat, timestamp }
  };

  return <NutritionLogger onAddFood={handleAddFood} />;
}
```

### Features:
- **Real-time search** - Debounced (500ms) automatic search as you type
- **Haptic feedback** - Light haptics on selection, success on add
- **Visual feedback** - Green highlight for selected food
- **Nutrient display** - Color-coded macros (calories, protein, carbs, fat)
- **Error handling** - Graceful error messages with haptic feedback

## Integration with Health Module

The `NutritionTab` component integrates the logger with daily tracking:

```javascript
// In NutritionTab.jsx
import NutritionLogger from './NutritionLogger';

export default function NutritionTab() {
  const [loggedFoods, setLoggedFoods] = useState([]);

  const handleAddFood = (food) => {
    setLoggedFoods([...loggedFoods, food]);
  };

  // Calculate today's stats from logged foods
  const todayStats = loggedFoods.reduce((acc, food) => ({
    calories: { current: acc.calories.current + food.calories, goal: 2000 },
    protein: { current: acc.protein.current + food.protein, goal: 150 },
    carbs: { current: acc.carbs.current + food.carbs, goal: 250 },
    fat: { current: acc.fat.current + food.fat, goal: 67 },
  }), { /* initial values */ });

  return (
    <div>
      <NutritionLogger onAddFood={handleAddFood} />
      {/* Display today's stats */}
    </div>
  );
}
```

## Natural Language Examples

FatSecret understands natural language food inputs:

**Good Examples:**
- "2 scrambled eggs"
- "1 banana"
- "grilled chicken breast 6oz"
- "protein shake"
- "2 slices whole wheat toast"
- "1 cup brown rice"

**Tips for Better Results:**
- Include quantity (e.g., "2 eggs" not just "eggs")
- Be specific with cooking method (e.g., "grilled chicken" vs "fried chicken")
- Use common units (cups, oz, slices, pieces)

## API Limits

**Free Tier:**
- 5,000 API calls per day
- Rate limit: 10 calls per second

**Current Usage:**
- Each food search = 1 API call
- Each detailed lookup = 1 API call
- Search is debounced (500ms) to reduce calls

**Optimization:**
- Tokens are cached and reused
- Search results are not cached (always fresh data)
- Consider adding local favorites cache in future

## Error Handling

All API functions handle errors gracefully:

```javascript
try {
  const foods = await searchFoodWithNutrients("pizza");
} catch (error) {
  console.error('Search failed:', error);
  // Show user-friendly error message
  await haptics.error();
}
```

**Common Errors:**
- **401 Unauthorized** - Invalid credentials (check client ID/secret)
- **429 Too Many Requests** - Rate limit exceeded (wait 1 second)
- **503 Service Unavailable** - FatSecret API down (retry later)

## Testing

### Test API Connection:
```javascript
import { testConnection } from '../services/fatSecretApi';

// In browser console:
await testConnection();
// Should log: "✅ FatSecret API connected successfully"
```

### Test Food Search:
```javascript
import { searchFoodWithNutrients } from '../services/fatSecretApi';

const foods = await searchFoodWithNutrients("chicken");
console.log(foods);
```

### Manual Testing:
1. Navigate to Health → Nutrition tab
2. Type "2 eggs" in the search box
3. Wait for results to appear (~500ms)
4. Click a food to select it
5. Click "Add Food" button
6. Verify food appears in "Your Meals Today"
7. Check that calorie totals update

## Future Enhancements

### Short-term:
- [ ] Add local favorites cache (reduce API calls)
- [ ] Add "Recent foods" quick-add buttons
- [ ] Add meal templates (e.g., "My usual breakfast")
- [ ] Add photo-based food logging (FatSecret has image search)

### Medium-term:
- [ ] Add custom foods (for homemade recipes)
- [ ] Add meal plans and prep tracking
- [ ] Add nutrition goal customization (per user)
- [ ] Add micronutrient tracking (vitamins, minerals)

### Long-term:
- [ ] Add barcode scanning (FatSecret supports UPC)
- [ ] Add recipe builder with auto-calculation
- [ ] Add restaurant menu integration
- [ ] Add nutrition insights and recommendations

## Troubleshooting

**Search returns no results:**
1. Check internet connection
2. Try broader search terms (e.g., "egg" instead of "scrambled eggs")
3. Check API credentials in fatSecretApi.js
4. Verify FatSecret API status: https://platform.fatsecret.com/api/status

**Authentication fails:**
1. Verify client ID and secret in fatSecretApi.js
2. Check browser console for error messages
3. Try manual token request (see testConnection())

**Slow search:**
- Normal - API requests take 500-1500ms
- Debounce delay adds 500ms
- Total wait time: ~1-2 seconds

## File Structure

```
src/
  services/
    fatSecretApi.js           # Core API utility (OAuth, search, parse)
  components/
    health/
      NutritionLogger.jsx     # Food search UI component
      NutritionTab.jsx        # Main nutrition tracking tab
  pages/
    HealthNew.jsx             # Health module with Nutrition tab
```

## API Documentation

For full FatSecret API docs, see:
- [API Overview](https://platform.fatsecret.com/api/)
- [OAuth 2.0 Guide](https://platform.fatsecret.com/api/Default.aspx?screen=rapiauth2)
- [Food Search Method](https://platform.fatsecret.com/api/Default.aspx?screen=rapiref2&method=foods.search)
- [Food Get Method](https://platform.fatsecret.com/api/Default.aspx?screen=rapiref2&method=food.get.v2)

## Support

**FatSecret Issues:**
- Email: support@fatsecret.com
- Forum: https://www.fatsecret.com/forums/

**App Issues:**
- Check browser console for errors
- Enable debug logging in fatSecretApi.js
- Test API connection with testConnection()
