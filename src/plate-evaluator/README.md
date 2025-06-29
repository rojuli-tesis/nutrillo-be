# Plate Evaluator Module

This module provides AI-powered plate evaluation using OpenAI's GPT-3.5-turbo model to analyze food combinations and provide nutritional insights.

## Features

- Evaluates food plates with 3+ ingredients
- Provides comprehensive nutritional analysis
- Gives recommendations for improvement
- Scores plates from 1-10
- Responds in Spanish with educational content

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

3. **API Endpoint**
   ```
   POST /plate-evaluator/evaluate
   ```

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
  "evaluation": "¡Excelente elección de ingredientes! Tu plato incluye:\n\n• **Pollo** - Una excelente fuente de proteínas\n• **Arroz** - Perfecto para complementar tu comida\n• **Brócoli** - Añade nutrientes esenciales\n\n**Análisis nutricional:**\n✅ Balance de macronutrientes adecuado\n✅ Variedad de colores y texturas\n✅ Combinación saludable de ingredientes\n\n**Puntuación: 8.5/10** 🌟"
}
```

## Error Handling

- Validates minimum 3 ingredients
- Handles OpenAI API errors gracefully
- Provides meaningful error messages
- Logs all evaluation attempts

## Security

- Protected with JWT authentication
- Input validation with class-validator
- Rate limiting recommended for production 