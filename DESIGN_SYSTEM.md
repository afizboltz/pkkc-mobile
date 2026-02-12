# PKKC Mobile Design System

A comprehensive design system for the PKKC mobile application that ensures consistency across all platforms and devices.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Design Tokens](#design-tokens)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## Overview

The PKKC Design System provides:
- **Consistent styling** across all components and screens
- **Design tokens** for colors, typography, spacing, and more
- **Standardized components** with predictable behavior
- **Theme support** for light and dark modes
- **TypeScript support** for better developer experience

## Installation

The design system is already integrated into your project. Simply import from the theme or components:

```typescript
// Import design tokens
import { Spacing, Colors, Typography } from '@/src/theme';

// Import components
import { Button, Card, TextInput } from '@/src/components/ui';
```

## Design Tokens

### Colors

The color system is organized into semantic categories:

```typescript
import { ColorPalette, SemanticColors, ExtendedColors } from '@/src/theme';

// Use semantic colors for consistency
const primaryColor = SemanticColors.primary; // #0a7ea4
const successColor = SemanticColors.success; // #22c55e
const errorColor = SemanticColors.error;     // #ef4444

// Use palette colors for specific needs
const blue500 = ColorPalette.primary[500];
const gray100 = ColorPalette.gray[100];
```

#### Color Categories

- **Primary**: Brand colors (#0a7ea4, #08113a)
- **Secondary**: Neutral colors (#ffffff, grays)
- **Tertiary**: Accent colors (#e8a812)
- **Semantic**: Success, warning, error, info
- **Gray**: Neutral gray scale

### Typography

The typography system provides consistent text styling:

```typescript
import { TypographyStyles, ThemedText } from '@/src/components';

// Use predefined typography variants
<ThemedText type="headlineLarge">Main Title</ThemedText>
<ThemedText type="bodyLarge">Body text content</ThemedText>
<ThemedText type="caption">Small caption text</ThemedText>
```

#### Typography Variants

| Variant | Size | Weight | Use Case |
|---------|------|--------|----------|
| `displayLarge` | 40px | Bold | Hero sections |
| `headlineLarge` | 32px | Semibold | Page titles |
| `titleLarge` | 24px | Semibold | Section titles |
| `bodyLarge` | 16px | Normal | Body text |
| `labelMedium` | 14px | Medium | Form labels |
| `caption` | 12px | Normal | Helper text |

### Spacing

Consistent spacing using a 4px grid system:

```typescript
import { Spacing } from '@/src/theme';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,    // 16px
    margin: Spacing.lg,     // 24px
    gap: Spacing.sm,        // 8px
  },
});
```

#### Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Small spacing |
| `md` | 16px | Default spacing |
| `lg` | 24px | Large spacing |
| `xl` | 32px | Extra large |
| `xxl` | 48px | Section spacing |

### Border Radius

Consistent border radius for elements:

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

### Shadows

Predefined shadow styles for elevation:

```typescript
import { Shadow } from '@/src/theme';

const styles = StyleSheet.create({
  card: {
    ...Shadow.md,  // Medium shadow
  },
  button: {
    ...Shadow.sm,  // Small shadow
  },
});
```

## Components

### Button

A versatile button component with multiple variants and sizes:

```typescript
import { Button } from '@/src/components/ui';

// Basic usage
<Button onPress={handlePress}>Click me</Button>

// With variants
<Button variant="secondary" onPress={handlePress}>Secondary</Button>
<Button variant="success" onPress={handlePress}>Success</Button>
<Button variant="ghost" onPress={handlePress}>Ghost</Button>

// With sizes
<Button size="lg" onPress={handlePress}>Large Button</Button>
<Button size="sm" onPress={handlePress}>Small</Button>

// With icons and loading state
<Button 
  loading={isLoading}
  leftIcon={<Icon />}
  fullWidth
  onPress={handlePress}
>
  Submit
</Button>
```

#### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'success' \| 'warning' \| 'error' \| 'ghost'` | `'primary'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Show loading indicator |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | Full width button |
| `leftIcon` | `ReactNode` | `undefined` | Icon on the left |
| `rightIcon` | `ReactNode` | `undefined` | Icon on the right |

### Card

A flexible container component with consistent styling:

```typescript
import { Card } from '@/src/components/ui';

// Basic card
<Card>
  <ThemedText type="titleLarge">Card Title</ThemedText>
  <ThemedText>Card content goes here</ThemedText>
</Card>

// With variants
<Card variant="outlined" padding="lg">
  <ThemedText>Outlined card with large padding</ThemedText>
</Card>

<Card variant="filled" padding="sm">
  <ThemedText>Filled card with small padding</ThemedText>
</Card>
```

#### Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'filled'` | `'elevated'` | Card style variant |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `children` | `ReactNode` | `required` | Card content |

### TextInput

A standardized input field with multiple styles:

```typescript
import { TextInput } from '@/src/components/ui';

// Basic input
<TextInput 
  placeholder="Enter your name"
  value={value}
  onChangeText={setValue}
/>

// With label and error
<TextInput
  label="Email Address"
  placeholder="email@example.com"
  error={errorMessage}
  value={email}
  onChangeText={setEmail}
/>

// With icons
<TextInput
  label="Search"
  placeholder="Search here..."
  leftIcon={<SearchIcon />}
  rightIcon={<ClearIcon />}
  value={searchQuery}
  onChangeText={setSearchQuery}
/>

// Different variants and sizes
<TextInput
  variant="filled"
  size="lg"
  label="Large filled input"
  placeholder="Large input"
/>
```

#### TextInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Input label |
| `error` | `string` | `undefined` | Error message |
| `helper` | `string` | `undefined` | Helper text |
| `variant` | `'outlined' \| 'filled'` | `'outlined'` | Input style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `leftIcon` | `ReactNode` | `undefined` | Left icon |
| `rightIcon` | `ReactNode` | `undefined` | Right icon |

## Usage Examples

### Form Layout

```typescript
import React from 'react';
import { View } from 'react-native';
import { Card, TextInput, Button, ThemedText } from '@/src/components/ui';
import { Spacing } from '@/src/theme';

export function LoginForm() {
  return (
    <Card variant="elevated" padding="lg">
      <ThemedText type="headlineLarge" style={{ marginBottom: Spacing.lg }}>
        Login
      </ThemedText>
      
      <TextInput
        label="Email"
        placeholder="Enter your email"
        style={{ marginBottom: Spacing.md }}
      />
      
      <TextInput
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        style={{ marginBottom: Spacing.lg }}
      />
      
      <Button variant="primary" fullWidth onPress={handleLogin}>
        Login
      </Button>
    </Card>
  );
}
```

### Card Grid

```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, ThemedText } from '@/src/components/ui';
import { Spacing } from '@/src/theme';

export function Dashboard() {
  return (
    <ScrollView style={{ padding: Spacing.md }}>
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: Spacing.md 
      }}>
        <Card style={{ flex: 1, minWidth: 150 }}>
          <ThemedText type="titleMedium">Total Users</ThemedText>
          <ThemedText type="displayLarge">1,234</ThemedText>
        </Card>
        
        <Card style={{ flex: 1, minWidth: 150 }}>
          <ThemedText type="titleMedium">Revenue</ThemedText>
          <ThemedText type="displayLarge">$45.6K</ThemedText>
        </Card>
      </View>
    </ScrollView>
  );
}
```

## Migration Guide

### From Legacy Components

#### ThemedText

```typescript
// Before
<ThemedText type="title">Old Title</ThemedText>

// After (new typography variants)
<ThemedText type="headlineLarge">New Title</ThemedText>

// Or keep using legacy types (still supported)
<ThemedText type="title">Legacy Title</ThemedText>
```

#### Custom Buttons

```typescript
// Before
<TouchableOpacity style={styles.customButton}>
  <Text style={styles.buttonText}>Click me</Text>
</TouchableOpacity>

// After
<Button variant="primary" onPress={handlePress}>
  Click me
</Button>
```

#### Custom Cards

```typescript
// Before
<View style={styles.customCard}>
  {children}
</View>

// After
<Card variant="elevated" padding="md">
  {children}
</Card>
```

## Best Practices

### 1. Use Design Tokens

Always use design tokens instead of hardcoded values:

```typescript
// ❌ Bad
const styles = StyleSheet.create({
  container: {
    padding: 16,        // Hardcoded
    margin: 24,         // Hardcoded
    borderRadius: 8,    // Hardcoded
  },
});

// ✅ Good
import { Spacing, BorderRadius } from '@/src/theme';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    margin: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
```

### 2. Choose Appropriate Typography

Select typography variants based on semantic meaning:

```typescript
// ❌ Bad
<ThemedText style={{ fontSize: 32, fontWeight: 'bold' }}>
  Title
</ThemedText>

// ✅ Good
<ThemedText type="headlineLarge">
  Title
</ThemedText>
```

### 3. Use Semantic Colors

Choose colors based on their semantic meaning:

```typescript
// ❌ Bad
<Text style={{ color: '#ef4444' }}>Error message</Text>

// ✅ Good
<ThemedText style={{ color: SemanticColors.error }}>
  Error message
</ThemedText>
```

### 4. Consistent Spacing

Use the spacing scale consistently:

```typescript
// ❌ Bad
<View style={{ gap: 12, padding: 20 }}>

// ✅ Good
<View style={{ gap: Spacing.sm, padding: Spacing.lg }}>
```

### 5. Component Composition

Build complex UIs by composing design system components:

```typescript
// ✅ Good - Compose components
<Card>
  <ThemedText type="titleLarge">Section Title</ThemedText>
  <TextInput label="Input" />
  <Button variant="primary">Submit</Button>
</Card>
```

## Contributing to the Design System

When adding new components or tokens:

1. **Follow naming conventions** - Use semantic, descriptive names
2. **Maintain consistency** - Follow existing patterns and conventions
3. **Document thoroughly** - Add JSDoc comments and update this documentation
4. **Test thoroughly** - Ensure components work across different screen sizes
5. **Consider accessibility** - Ensure components are accessible to all users

## Support

For questions or issues with the design system:
1. Check this documentation first
2. Review existing component implementations
3. Consult with the development team
4. Create an issue with detailed reproduction steps
