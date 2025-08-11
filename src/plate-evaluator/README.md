# Plate Evaluator Module

This module provides AI-powered plate evaluation using OpenAI's GPT-3.5-turbo model to analyze food combinations and provide nutritional insights. It also includes comprehensive logging and favorites functionality.

## Features

- Evaluates food plates with 3+ ingredients
- Provides comprehensive nutritional analysis
- Gives recommendations for improvement
- Scores plates from 1-10
- Responds in Spanish with educational content
- **NEW**: Logs all OpenAI requests and responses for debugging
- **NEW**: User favorites system for saving plate combinations
- **NEW**: Evaluation history tracking

## Setup

1. **Install Dependencies**
   ```bash
   npm install openai
   ```

2. **Environment Configuration**
   Add your OpenAI API key to your environment file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Database**
   The module automatically creates the `plate_evaluation_log` table to store:
   - User evaluation requests
   - OpenAI API requests and responses
   - Success/failure status
   - User favorites and notes

## API Endpoints

### Evaluate Plate
```
POST /plate-evaluator/evaluate
```

### Get Evaluation History
```
GET /plate-evaluator/history
```
Returns the last 50 successful evaluations for the authenticated user.

### Get Favorite Evaluations
```
GET /plate-evaluator/favorites
```
Returns all evaluations marked as favorites by the authenticated user.

### Toggle Favorite Status
```
PUT /plate-evaluator/:id/toggle-favorite
```
Toggles the favorite status of a specific evaluation.

## Request Format

```json
{
  "ingredients": [
    {
      "name": "Pollo",
      "type": "Proteína",
      "subtype": "Aves"
    },
    {
      "name": "Arroz",
      "type": "Carbohidratos",
      "subtype": "Granos"
    },
    {
      "name": "Brócoli",
      "type": "Vegetales",
      "subtype": "Verdes"
    }
  ]
}
```

## Response Format

```json
{
  "score": 8.5,
  "positives": [
    "Buen balance de macronutrientes",
    "Presencia de vegetales",
    "Proteína magra"
  ],
  "issues": [
    "Podría incluir más variedad de vegetales"
  ],
  "suggestions": "Considera agregar una ensalada fresca o más vegetales de colores variados para optimizar el aporte de vitaminas y antioxidantes."
}
```

## Logging and Debugging

All requests and responses are automatically logged to the database with:
- Complete OpenAI request payload
- Full OpenAI API response
- Parsed evaluation results
- Error messages (if any)
- User association for tracking

This enables:
1. **Error Analysis**: Full visibility into failed requests
2. **Performance Monitoring**: Track API usage and response times
3. **User Favorites**: Allow users to save successful evaluations
4. **Recipe Building**: Foundation for future recipe recommendation system

## Error Handling

- Validates minimum 3 ingredients
- Handles OpenAI API errors gracefully
- Provides meaningful error messages
- Logs all evaluation attempts (success and failure)
- Rate limiting recommended for production

## Security

- Protected with JWT authentication
- Input validation with class-validator
- User-scoped data access
- Rate limiting recommended for production 