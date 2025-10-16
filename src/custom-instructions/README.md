# Custom Instructions Module

This module allows nutritionists to set custom instructions for individual patients that will be included in both recipe recommendations and plate evaluations.

## Features

- **User-specific instructions**: Each instruction is tied to a specific user/patient
- **Priority system**: Instructions can be prioritized (1-10, higher number = higher priority)
- **Active/Inactive status**: Instructions can be enabled or disabled
- **CRUD operations**: Full create, read, update, delete functionality
- **Integration**: Automatically included in OpenAI prompts for both recipe recommendations and plate evaluations

## Entity Structure

```typescript
CustomInstructions {
  id: number;
  user: User; // Many-to-one relationship
  instructions: string; // The actual instruction text
  title?: string; // Optional title for organization
  description?: string; // Optional description
  isActive: boolean; // Whether the instruction is active
  priority: number; // Priority level (1-10)
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Create Custom Instructions
```
POST /custom-instructions
```

**Request Body:**
```json
{
  "instructions": "This patient is allergic to peanuts and should avoid them completely",
  "title": "Peanut Allergy",
  "description": "Critical allergy information",
  "isActive": true,
  "priority": 10
}
```

### Get All Custom Instructions
```
GET /custom-instructions
```

### Get Active Custom Instructions Only
```
GET /custom-instructions/active
```

### Get Single Custom Instruction
```
GET /custom-instructions/:id
```

### Update Custom Instructions
```
PATCH /custom-instructions/:id
```

### Delete Custom Instructions
```
DELETE /custom-instructions/:id
```

## Integration with AI Services

### Recipe Recommendations
Custom instructions are automatically included in the OpenAI prompt when generating recipe recommendations. They appear as:

```
**INSTRUCCIONES PERSONALIZADAS DEL NUTRICIONISTA:**
- This patient is allergic to peanuts and should avoid them completely
- Don't recommend recipes with more than one carb source

IMPORTANTE: Estas instrucciones son específicas para este paciente y DEBEN ser seguidas estrictamente al crear las recetas.
```

### Plate Evaluations
Custom instructions are also included in plate evaluation prompts:

```
INSTRUCCIONES PERSONALIZADAS DEL NUTRICIONISTA:
- This patient is allergic to peanuts and should avoid them completely
- Rank plates with multiple carbs lower

IMPORTANTE: Estas instrucciones son específicas para este paciente y DEBEN ser consideradas al evaluar el plato.
```

## Usage Examples

### Example 1: Allergy Management
```json
{
  "instructions": "This patient is allergic to peanuts and should avoid them completely. Do not recommend any recipes containing peanuts or peanut products.",
  "title": "Peanut Allergy",
  "priority": 10,
  "isActive": true
}
```

### Example 2: Dietary Preferences
```json
{
  "instructions": "This patient prefers low-carb options. When evaluating plates, rank them lower if they contain more than one carbohydrate source.",
  "title": "Low Carb Preference",
  "priority": 7,
  "isActive": true
}
```

### Example 3: Medical Conditions
```json
{
  "instructions": "This patient has diabetes. Focus on recipes with low glycemic index and avoid high-sugar ingredients.",
  "title": "Diabetes Management",
  "priority": 9,
  "isActive": true
}
```

## Database Migration

The module creates a new table `custom_instructions` with the following structure:

```sql
CREATE TABLE custom_instructions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instructions TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security

- All endpoints require JWT authentication
- Users can only access their own custom instructions
- Instructions are automatically included in AI prompts based on the authenticated user
