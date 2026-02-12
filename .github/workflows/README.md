# GitHub CI/CD Workflows

This directory contains GitHub Actions workflows for automated building and deployment of the PKKC mobile app.

## Expo Staging Build Workflow

The `expo-staging-build.yml` workflow automatically builds staging versions of your Expo app when changes are pushed to the following branches:
- `main`
- `develop` 
- `staging`

### Triggers
- Push to main/develop/staging branches
- Pull requests to main/develop/staging branches

### Build Process
1. **Android**: Builds APK using the `stg-apk` profile from `eas.json`
2. **iOS**: Builds iOS app using the `stg` profile from `eas.json`
3. **Artifacts**: Uploads build information as GitHub artifacts

### Required Setup

1. **Add EXPO_TOKEN to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: Your Expo account token

2. **Get Expo Token**:
   ```bash
   eas login
   eas whoami
   # Or create a token:
   eas token:create
   ```

### Build Profiles Used
- **Android**: `stg-apk` - Creates APK for internal distribution
- **iOS**: `stg` - Creates iOS build for internal distribution

### Artifacts
Build artifacts are stored for 30 days and include:
- `android-build-info.json` - Android build information
- `ios-build-info.json` - iOS build information

### Viewing Builds
After the workflow runs, you can:
1. Download artifacts from the Actions tab
2. View builds on Expo dashboard: https://expo.dev/
3. Use `eas build:view` command locally to check build status

### Customization
To modify trigger branches, update the `on:` section in the workflow file.
To change build profiles, modify the `eas build` commands in the workflow steps.

## Runner Options

### Current: GitHub Hosted Runner
- **Type**: `ubuntu-latest`
- **Pros**: No setup, free tier included, always available
- **Cons**: Limited to 2GB RAM, 2-core CPU
- **Sufficient for**: Most Expo builds, including yours

### When to Consider Self-Hosted Runner
- **Large projects**: Need more RAM/CPU
- **Faster builds**: Dedicated resources
- **Special requirements**: Custom tools, iOS builds on macOS
- **Cost optimization**: High volume builds

### Self-Hosted Setup (Optional)
If needed, you can add self-hosted runners:
```yaml
jobs:
  build:
    runs-on: self-hosted  # or self-hosted-linux, self-hosted-macos
```

### Recommended
**Stick with GitHub-hosted runners** for now. They work well with Expo EAS builds and require zero maintenance.
