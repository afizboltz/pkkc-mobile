/**
 * Design System Demo Screen
 * Shows how to use the new design system components
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { Button, Card, TextInput } from '@/src/components/ui';
import { Spacing } from '@/src/theme';

export default function DesignSystemDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Login successful!');
    }, 2000);
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <ScrollView style={{ flex: 1, padding: Spacing.md }}>
      <ThemedText type="headlineLarge" style={{ marginBottom: Spacing.lg }}>
        Design System Demo
      </ThemedText>

      {/* Typography Examples */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Typography
        </ThemedText>
        <ThemedText type="displayLarge">Display Large</ThemedText>
        <ThemedText type="headlineLarge">Headline Large</ThemedText>
        <ThemedText type="titleLarge">Title Large</ThemedText>
        <ThemedText type="bodyLarge">Body Large text</ThemedText>
        <ThemedText type="labelMedium">Label Medium</ThemedText>
        <ThemedText type="caption">Caption text</ThemedText>
      </Card>

      {/* Button Examples */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Buttons
        </ThemedText>
        
        <View style={{ marginBottom: Spacing.sm }}>
          <ThemedText type="bodyMedium">Primary Buttons:</ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
            <Button size="sm" onPress={() => Alert.alert('Small', 'Small button pressed')}>
              Small
            </Button>
            <Button size="md" onPress={() => Alert.alert('Medium', 'Medium button pressed')}>
              Medium
            </Button>
            <Button size="lg" onPress={() => Alert.alert('Large', 'Large button pressed')}>
              Large
            </Button>
          </View>
        </View>

        <View style={{ marginBottom: Spacing.sm }}>
          <ThemedText type="bodyMedium">Button Variants:</ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs, flexWrap: 'wrap' }}>
            <Button variant="primary" onPress={() => Alert.alert('Primary', 'Primary button')}>
              Primary
            </Button>
            <Button variant="secondary" onPress={() => Alert.alert('Secondary', 'Secondary button')}>
              Secondary
            </Button>
            <Button variant="success" onPress={() => Alert.alert('Success', 'Success button')}>
              Success
            </Button>
            <Button variant="warning" onPress={() => Alert.alert('Warning', 'Warning button')}>
              Warning
            </Button>
            <Button variant="error" onPress={() => Alert.alert('Error', 'Error button')}>
              Error
            </Button>
            <Button variant="ghost" onPress={() => Alert.alert('Ghost', 'Ghost button')}>
              Ghost
            </Button>
          </View>
        </View>

        <View style={{ marginBottom: Spacing.sm }}>
          <ThemedText type="bodyMedium">Button States:</ThemedText>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button fullWidth>Full Width</Button>
          </View>
        </View>
      </Card>

      {/* Card Examples */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Cards
        </ThemedText>
        
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
          <Card variant="elevated" padding="sm" style={{ flex: 1 }}>
            <ThemedText type="titleMedium">Elevated</ThemedText>
            <ThemedText type="bodySmall">With shadow</ThemedText>
          </Card>
          <Card variant="outlined" padding="sm" style={{ flex: 1 }}>
            <ThemedText type="titleMedium">Outlined</ThemedText>
            <ThemedText type="bodySmall">With border</ThemedText>
          </Card>
          <Card variant="filled" padding="sm" style={{ flex: 1 }}>
            <ThemedText type="titleMedium">Filled</ThemedText>
            <ThemedText type="bodySmall">Solid background</ThemedText>
          </Card>
        </View>

        <Card variant="outlined" padding="lg">
          <ThemedText type="titleMedium">Large Card</ThemedText>
          <ThemedText type="bodyMedium">
            This card has large padding and can contain more content.
          </ThemedText>
        </Card>
      </Card>

      {/* Form Example */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Form Example
        </ThemedText>
        
        <TextInput
          label="Email Address"
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
        
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Button 
            variant="primary" 
            loading={isLoading}
            onPress={handleLogin}
            style={{ flex: 1 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Button 
            variant="ghost" 
            onPress={handleCancel}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
        </View>
      </Card>

      {/* Input Variants */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.lg }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Input Variants
        </ThemedText>
        
        <TextInput
          label="Outlined Input"
          placeholder="This is an outlined input"
          style={{ marginBottom: Spacing.md }}
        />
        
        <TextInput
          label="Filled Input"
          placeholder="This is a filled input"
          variant="filled"
          style={{ marginBottom: Spacing.md }}
        />
        
        <TextInput
          label="Input with Error"
          placeholder="This input has an error"
          error="This field is required"
          style={{ marginBottom: Spacing.md }}
        />
        
        <TextInput
          label="Input with Helper"
          placeholder="This input has helper text"
          helper="Use a strong password with at least 8 characters"
          style={{ marginBottom: Spacing.md }}
        />
        
        <TextInput
          label="Small Input"
          placeholder="Small sized input"
          size="sm"
          style={{ marginBottom: Spacing.md }}
        />
        
        <TextInput
          label="Large Input"
          placeholder="Large sized input"
          size="lg"
        />
      </Card>

      {/* Color Palette */}
      <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.xl }}>
        <ThemedText type="titleLarge" style={{ marginBottom: Spacing.md }}>
          Color Palette
        </ThemedText>
        
        <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
        </View>
        
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <Button variant="warning">Warning</Button>
          <Button variant="error">Error</Button>
          <Button variant="ghost">Ghost</Button>
        </View>
      </Card>
    </ScrollView>
  );
}
