# Plate Evaluator Module - OpenAI Query Logging Implementation

## What Was Added

### 1. New Entity: `PlateEvaluationLog`
- **Location**: `src/plate-evaluator/plate-evaluation-log.entity.ts`
- **Purpose**: Store all OpenAI requests and responses for debugging and favorites
- **Fields**:
  - `user`: Foreign key to User entity
  - `ingredients`: Array of ingredients sent in the request
  - `openaiRequest`: Complete OpenAI API request payload
  - `openaiResponse`: Full OpenAI API response
  - `parsedEvaluation`: Parsed evaluation results (score, positives, issues, suggestions)
  - `isSuccess`: Boolean indicating if the request was successful
  - `errorMessage`: Error details if the request failed
  - `isVisibleToUser`: Boolean for user favorites/saved recipes
  - `userNotes`: Text field for users to add their own notes
  - `createdAt`/`updatedAt`: Timestamps

### 2. Updated Service: `PlateEvaluatorService`
- **Enhanced `evaluatePlate()` method**:
  - Now accepts `userId` parameter
  - Logs all requests before sending to OpenAI
  - Stores complete responses (success or failure)
  - Associates evaluations with users
- **New methods**:
  - `getEvaluationHistory()`: Get user's last 50 evaluations
  - `getFavoriteEvaluations()`: Get user's saved/favorite evaluations
  - `toggleFavorite()`: Toggle favorite status for an evaluation

### 3. Updated Controller: `PlateEvaluatorController`
- **Enhanced `/evaluate` endpoint**: Now captures user context
- **New endpoints**:
  - `GET /plate-evaluator/history`: User's evaluation history
  - `GET /plate-evaluator/favorites`: User's favorite evaluations
  - `PUT /plate-evaluator/:id/toggle-favorite`: Toggle favorite status

### 4. New DTOs and Interfaces
- `JwtUser` interface for type safety
- `ToggleFavoriteResponseDto` for consistent API responses

### 5. Database Integration
- Added TypeORM providers for the new entity
- Updated module imports to include DatabaseModule
- Auto-sync will create the table on next startup

## Benefits Achieved

### 1. Error Debugging 🐛
- Complete visibility into failed OpenAI requests
- Store exact payloads and error messages
- Track API usage patterns and performance

### 2. User Favorites System ⭐
- Users can save successful plate evaluations
- Foundation for recipe building functionality
- Personal evaluation history tracking

### 3. Data Analytics 📊
- Track user behavior and popular ingredient combinations
- Analyze evaluation patterns for improvement insights
- Foundation for future rewards/streaks system

## Testing the Implementation

### Test the enhanced evaluation endpoint:
```bash
curl -X POST http://localhost:3000/plate-evaluator/evaluate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "ingredients": [
      {"name": "Pollo", "type": "Proteína", "subtype": "Aves"},
      {"name": "Arroz", "type": "Carbohidratos", "subtype": "Granos"},
      {"name": "Brócoli", "type": "Vegetales", "subtype": "Verdes"}
    ]
  }'
```

### Test the new endpoints:
```bash
# Get evaluation history
curl -X GET http://localhost:3000/plate-evaluator/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get favorites
curl -X GET http://localhost:3000/plate-evaluator/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Toggle favorite (replace 123 with actual evaluation ID)
curl -X PUT http://localhost:3000/plate-evaluator/123/toggle-favorite \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The new `plate_evaluation_log` table will be automatically created with these columns:
- `id` (Primary Key)
- `user_id` (Foreign Key to users table)
- `ingredients` (JSON)
- `openai_request` (JSON)
- `openai_response` (JSON) 
- `parsed_evaluation` (JSON)
- `is_success` (Boolean)
- `error_message` (Text)
- `is_visible_to_user` (Boolean)
- `user_notes` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Next Steps for Rewards/Streaks System

With this foundation in place, you can now easily implement:
1. **Streak tracking**: Count consecutive days/evaluations
2. **Achievement system**: Based on evaluation patterns
3. **Recipe recommendations**: Using favorite combinations
4. **Social features**: Share favorite plates with other users
5. **Analytics dashboard**: For admins to see usage patterns 