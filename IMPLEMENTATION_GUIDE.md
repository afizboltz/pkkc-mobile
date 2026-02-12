# Design System Implementation Guide

## Quick Start

### 1. Import Components

```typescript
// Import design system components
import { Button, Card, TextInput } from '@/src/components/ui';
import { ThemedText } from '@/src/components/ThemedText';

// Import design tokens
import { Spacing, Colors, Typography, BorderRadius } from '@/src/theme';
```

### 2. Replace Existing Components

#### Before (Old Way)
```typescript
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#08113a',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

#### After (Design System)
```typescript
<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

### 3. Update Existing Screens

#### Example: Login Screen

```typescript
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { Button, Card, TextInput } from '@/src/components/ui';
import { Spacing } from '@/src/theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Your login logic
      await login(email, password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: Spacing.md }}>
      <ThemedText type="headlineLarge" style={{ marginBottom: Spacing.xl }}>
        Welcome Back
      </ThemedText>

      <Card variant="elevated" padding="lg" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.lg }}>
          Login
        </ThemedText>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={{ marginBottom: Spacing.md }}
        />

        <TextInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: Spacing.lg }}
        />

        <Button
          variant="primary"
          loading={loading}
          fullWidth
          onPress={handleLogin}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Card>

      <Button variant="ghost" fullWidth onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register
      </Button>
    </ScrollView>
  );
}
```

## Migration Checklist

### ✅ Completed Components
- [x] **ThemedText** - Enhanced with new typography variants
- [x] **Button** - New standardized button component
- [x] **Card** - New standardized card component  
- [x] **TextInput** - New standardized input component
- [x] **Colors** - Updated color constants
- [x] **Design Tokens** - Spacing, typography, shadows, etc.

### 🔄 In Progress
- [ ] **Announcement Screen** - Updated to use design system
- [ ] **Other Screens** - Need to be updated

### 📋 To Do
- [ ] Update remaining screens to use design system
- [ ] Replace hardcoded styles with design tokens
- [ ] Add more UI components (Badge, Avatar, etc.)
- [ ] Create component testing suite
- [ ] Add Storybook for component documentation

## Component Usage Examples

### Button Variants
```typescript
// Primary buttons
<Button variant="primary" onPress={handlePress}>Primary</Button>
<Button variant="primary" size="lg">Large Primary</Button>
<Button variant="primary" loading>Loading</Button>

// Secondary buttons
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost Button</Button>

// Semantic buttons
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="error">Error</Button>

// Button states
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>
<Button leftIcon={<Icon />}>With Icon</Button>
```

### Card Variants
```typescript
// Elevated card (default)
<Card padding="md">
  <ThemedText>Card content</ThemedText>
</Card>

// Outlined card
<Card variant="outlined" padding="lg">
  <ThemedText>Outlined card</ThemedText>
</Card>

// Filled card
<Card variant="filled" padding="sm">
  <ThemedText>Filled card</ThemedText>
</Card>
```

### Input Variants
```typescript
// Basic input
<TextInput
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>

// With validation
<TextInput
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  error={errorMessage}
  helper="Password must be at least 8 characters"
/>

// Different variants
<TextInput variant="outlined" label="Outlined" />
<TextInput variant="filled" label="Filled" />

// Different sizes
<TextInput size="sm" label="Small" />
<TextInput size="md" label="Medium" />
<TextInput size="lg" label="Large" />
```

### Typography
```typescript
// New typography variants
<ThemedText type="displayLarge">Display Large</ThemedText>
<ThemedText type="headlineLarge">Headline Large</ThemedText>
<ThemedText type="titleLarge">Title Large</ThemedText>
<ThemedText type="bodyLarge">Body Large</ThemedText>
<ThemedText type="labelMedium">Label Medium</ThemedText>
<ThemedText type="caption">Caption</ThemedText>

// Legacy variants (still supported)
<ThemedText type="title">Legacy Title</ThemedText>
<ThemedText type="subtitle">Legacy Subtitle</ThemedText>
```

## Design Token Usage

### Spacing
```typescript
import { Spacing } from '@/src/theme';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,      // 16px
    margin: Spacing.lg,       // 24px
    gap: Spacing.sm,          // 8px
  },
});
```

### Colors
```typescript
import { ColorPalette, SemanticColors } from '@/src/theme';

// Semantic colors
const primaryColor = SemanticColors.primary;
const errorColor = SemanticColors.error;

// Palette colors
const blue500 = ColorPalette.primary[500];
const gray100 = ColorPalette.gray[100];
```

### Border Radius
```typescript
import { BorderRadius } from '@/src/theme';

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,  // 8px
  },
  card: {
    borderRadius: BorderRadius.lg,  // 12px
  },
});
```

## Next Steps

1. **Start Small**: Begin with one screen and gradually migrate others
2. **Use Demo Screen**: Check `app/design-system-demo.tsx` for examples
3. **Reference Documentation**: See `DESIGN_SYSTEM.md` for full API
4. **Test Components**: Ensure components work on both iOS and Android
5. **Provide Feedback**: Report issues or suggest improvements

## Common Issues & Solutions

### Issue: Component not found
**Solution**: Make sure to import from the correct path
```typescript
// ✅ Correct
import { Button } from '@/src/components/ui';

// ❌ Wrong
import { Button } from '@/src/components/ui/Button';
```

### Issue: Style not applying
**Solution**: Use design tokens instead of hardcoded values
```typescript
// ✅ Correct
padding: Spacing.md

// ❌ Wrong
padding: 16
```

### Issue: TypeScript errors
**Solution**: Make sure to use the correct prop types
```typescript
// ✅ Correct
<Button variant="primary" onPress={handlePress}>

// ❌ Wrong
<Button type="primary" onClick={handlePress}>
```

## Support

For questions or issues:
1. Check the documentation (`DESIGN_SYSTEM.md`)
2. Review the demo screen (`app/design-system-demo.tsx`)
3. Look at existing implementations
4. Ask the development team for help
