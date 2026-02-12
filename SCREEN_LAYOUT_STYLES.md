# Screen Layout Styling Guide

This guide provides design system styling suggestions for different screen layouts in your PKKC app.

## 🎯 Updated PreLogin Screen

I've already updated your `preLogin.tsx` with design system styling:

### ✅ Changes Made:
- **Logo**: Wrapped in elevated Card with shadow
- **Typography**: Using `ThemedText` components
- **Buttons**: Large, full-width design system buttons
- **Spacing**: Consistent design token spacing
- **Colors**: Using ColorPalette tokens
- **Layout**: Better vertical rhythm with gaps

### 🎨 Key Features:
```typescript
// Logo in elevated card
<Card variant="elevated" padding="lg" style={styles.logoCard}>
  <Image source={logo} style={styles.logoImage} />
</Card>

// Large, full-width buttons
<Button 
  variant="primary" 
  size="lg" 
  fullWidth 
  onPress={handleLogin}
>
  Sign In
</Button>

// Consistent typography
<ThemedText type="bodyMedium" style={styles.tagline}>
  Stay connected with community
</ThemedText>
```

---

## 📱 Login Screen Styling

### Recommended Design System Implementation:

```typescript
import { Button, Card, TextInput } from '@/src/components/ui';
import { ThemedText } from '@/src/components/ThemedText';
import { Spacing, ColorPalette, Shadow } from '@/src/theme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="headlineLarge">Welcome Back</ThemedText>
            <ThemedText type="bodyMedium" style={styles.subtitle}>
              Sign in to your account
            </ThemedText>
          </View>

          {/* Form */}
          <Card variant="elevated" padding="lg" style={styles.formCard}>
            <TextInput
              label="IC Number"
              placeholder="Enter your IC number"
              value={icNo}
              onChangeText={setIcNo}
              leftIcon={<MaterialIcons name="badge" size={20} color={ColorPalette.gray[500]} />}
              style={styles.input}
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<MaterialIcons name="lock" size={20} color={ColorPalette.gray[500]} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color={ColorPalette.gray[500]} 
                  />
                </TouchableOpacity>
              }
              style={styles.input}
            />

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              loading={loading}
              onPress={handleLogin}
              style={styles.loginButton}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Card>

          {/* Footer Links */}
          <View style={styles.footer}>
            <Button variant="ghost" onPress={() => navigation.navigate('forgot-password')}>
              Forgot Password?
            </Button>
            
            <View style={styles.signupContainer}>
              <ThemedText type="bodyMedium">Don't have an account? </ThemedText>
              <Button variant="ghost" onPress={() => navigation.navigate('signup')}>
                Sign Up
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.white,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  subtitle: {
    textAlign: 'center',
    color: ColorPalette.gray[600],
    marginTop: Spacing.sm,
  },
  formCard: {
    ...Shadow.md,
    marginBottom: Spacing.xl,
  },
  input: {
    marginBottom: Spacing.md,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

---

## 📊 Dashboard Screen Styling

### Recommended Design System Implementation:

```typescript
import { Button, Card } from '@/src/components/ui';
import { ThemedText } from '@/src/components/ThemedText';
import { Spacing, ColorPalette, Shadow, BorderRadius } from '@/src/theme';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Card variant="elevated" padding="lg" style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <ThemedText type="titleLarge">Welcome back!</ThemedText>
            <ThemedText type="bodyMedium" style={styles.userName}>
              {userProfile?.name}
            </ThemedText>
          </View>
          
          <View style={styles.headerActions}>
            <Button variant="ghost" size="sm" onPress={handleSignOut}>
              <MaterialIcons name="logout" size={20} />
            </Button>
          </View>
        </View>

        {/* Language Switcher */}
        <View style={styles.languageSwitcher}>
          <Button 
            variant={locale === 'ms' ? 'primary' : 'ghost'} 
            size="sm"
            onPress={() => setLocale('ms')}
          >
            BM
          </Button>
          <Button 
            variant={locale === 'en' ? 'primary' : 'ghost'} 
            size="sm"
            onPress={() => setLocale('en')}
          >
            EN
          </Button>
        </View>
      </Card>

      {/* Stats Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <Card variant="elevated" padding="md" style={styles.statCard}>
            <ThemedText type="titleMedium">Profile Status</ThemedText>
            <ThemedText type="headlineLarge" style={styles.statValue}>
              {renewStatus}
            </ThemedText>
            <ThemedText type="caption" style={styles.statLabel}>
              Membership Status
            </ThemedText>
          </Card>

          <Card variant="elevated" padding="md" style={styles.statCard}>
            <ThemedText type="titleMedium">Quick Actions</ThemedText>
            <View style={styles.actionButtons}>
              <Button variant="primary" size="sm" style={styles.actionButton}>
                Renew
              </Button>
              <Button variant="secondary" size="sm" style={styles.actionButton}>
                Profile
              </Button>
            </View>
          </Card>
        </View>

        {/* Recent Activity */}
        <Card variant="elevated" padding="lg" style={styles.activityCard}>
          <ThemedText type="titleLarge" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          
          {/* Activity items would go here */}
          <View style={styles.activityItem}>
            <ThemedText type="bodyMedium">No recent activity</ThemedText>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: ColorPalette.gray[600],
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageSwitcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: ColorPalette.gray[200],
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: ColorPalette.primary[600],
    marginVertical: Spacing.sm,
  },
  statLabel: {
    color: ColorPalette.gray[500],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  activityCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  activityItem: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
});
```

---

## 📝 Form Screen Pattern

### Standard Form Layout:

```typescript
export default function FormScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="headlineLarge">Form Title</ThemedText>
            <ThemedText type="bodyMedium" style={styles.subtitle}>
              Form description or instructions
            </ThemedText>
          </View>

          {/* Form Sections */}
          <Card variant="elevated" padding="lg" style={styles.formSection}>
            <ThemedText type="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </ThemedText>
            
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              style={styles.input}
            />
            
            <TextInput
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              style={styles.input}
            />
            
            <TextInput
              label="Phone Number"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card>

          <Card variant="elevated" padding="lg" style={styles.formSection}>
            <ThemedText type="titleMedium" style={styles.sectionTitle}>
              Additional Details
            </ThemedText>
            
            <TextInput
              label="Address"
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onPress={handleSubmit}
            >
              Submit
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              fullWidth 
              onPress={handleCancel}
            >
              Cancel
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  subtitle: {
    textAlign: 'center',
    color: ColorPalette.gray[600],
    marginTop: Spacing.sm,
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
});
```

---

## 📋 List Screen Pattern

### Standard List Layout:

```typescript
export default function ListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Card variant="elevated" padding="lg" style={styles.header}>
        <ThemedText type="headlineLarge">User Directory</ThemedText>
        
        {/* Search Bar */}
        <TextInput
          placeholder="Search users..."
          leftIcon={<MaterialIcons name="search" size={20} />}
          style={styles.searchInput}
        />
      </Card>

      {/* List Content */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card variant="outlined" padding="md" style={styles.listItem}>
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <ThemedText type="titleMedium">{item.name}</ThemedText>
                <ThemedText type="bodyMedium" style={styles.itemSubtitle}>
                  {item.email}
                </ThemedText>
                <ThemedText type="caption" style={styles.itemMeta}>
                  Joined {item.joinDate}
                </ThemedText>
              </View>
              
              <View style={styles.itemActions}>
                <Button variant="ghost" size="sm">
                  <MaterialIcons name="edit" size={18} />
                </Button>
                <Button variant="ghost" size="sm">
                  <MaterialIcons name="delete" size={18} />
                </Button>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorPalette.gray[50],
  },
  header: {
    marginBottom: Spacing.md,
  },
  searchInput: {
    marginTop: Spacing.md,
  },
  listContainer: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  listItem: {
    marginBottom: Spacing.sm,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemSubtitle: {
    color: ColorPalette.gray[600],
    marginTop: Spacing.xs,
  },
  itemMeta: {
    color: ColorPalette.gray[500],
    marginTop: Spacing.xs,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
```

---

## 🎨 General Design Principles

### 1. Consistent Spacing
```typescript
// Use design tokens for all spacing
padding: Spacing.md,      // 16px
margin: Spacing.lg,       // 24px
gap: Spacing.sm,          // 8px
```

### 2. Consistent Colors
```typescript
// Use semantic colors
backgroundColor: ColorPalette.white,
textColor: ColorPalette.gray[900],
borderColor: ColorPalette.gray[200],
primaryColor: ColorPalette.primary[600],
```

### 3. Consistent Typography
```typescript
// Use ThemedText with variants
<ThemedText type="headlineLarge">Title</ThemedText>
<ThemedText type="bodyMedium">Body text</ThemedText>
<ThemedText type="caption">Caption</ThemedText>
```

### 4. Consistent Components
```typescript
// Use design system components
<Card variant="elevated" padding="lg">
  <Button variant="primary" size="lg" fullWidth>
    Action
  </Button>
</Card>
```

### 5. Shadow Hierarchy
```typescript
// Use appropriate shadows for elevation
...Shadow.sm,   // Cards, buttons
...Shadow.md,   // Important cards
...Shadow.lg,   // Floating elements
```

---

## 🚀 Migration Checklist

### For Each Screen:
- [ ] Replace hardcoded colors with `ColorPalette` tokens
- [ ] Replace hardcoded spacing with `Spacing` tokens
- [ ] Replace `Text` with `ThemedText` components
- [ ] Replace `TouchableOpacity` with `Button` components
- [ ] Wrap content in `Card` components
- [ ] Use consistent layout patterns
- [ ] Test on both iOS and Android
- [ ] Ensure accessibility

### Priority Screens:
1. ✅ **preLogin.tsx** - Completed
2. 🔄 **login.tsx** - Ready for implementation
3. 🔄 **dashboard.tsx** - Ready for implementation
4. ⏳ **signup.tsx** - Next priority
5. ⏳ **profile.tsx** - Medium priority
6. ⏳ **Other screens** - Lower priority

---

## 📱 Responsive Considerations

### Screen Size Adaptation:
```typescript
import { useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();

const isTablet = width > 768;
const isLargePhone = width > 414;

// Adjust layouts accordingly
const styles = StyleSheet.create({
  container: {
    padding: isTablet ? Spacing.xl : Spacing.md,
  },
  grid: {
    flexDirection: isTablet ? 'row' : 'column',
  },
});
```

### Orientation Handling:
```typescript
import { useDeviceOrientation } from 'react-native';

const { orientation } = useDeviceOrientation();

const styles = StyleSheet.create({
  content: {
    flexDirection: orientation === 'landscape' ? 'row' : 'column',
  },
});
```

This comprehensive styling guide ensures consistency across all your app screens while following the design system principles.
