# Onboarding Modal Implementation

This document explains the implementation of the onboarding modal in the Promptly application.

## Overview

The onboarding modal is designed to welcome new users and guide them through the key features of the application. It appears automatically when a user first logs in and can be manually triggered again through the help button in the header.

## Components

### 1. OnboardingModal.tsx

The main component that renders the modal with animated steps. It uses:

- **Framer Motion** for smooth animations and transitions
- **Dialog** component from the UI library for the modal structure
- **useOnboarding** custom hook for state management

### 2. useOnboarding.ts

A custom hook that manages the onboarding state:

- Checks if the user has seen the onboarding before
- Provides a function to mark onboarding as complete
- Handles localStorage for persistence

## Features

- **Multi-step onboarding**: Walks users through different features with next/previous navigation
- **Progress indicators**: Shows users their progress through the onboarding
- **Animations**: Uses Framer Motion for engaging transitions and interactions
- **Responsive design**: Works well on all device sizes
- **Manual trigger**: Users can view the onboarding again via the help button

## Animation Details

The onboarding modal uses several animation techniques:

1. **Slide transitions** between steps
2. **Fade and scale** animations for content
3. **Interactive buttons** with hover and tap animations
4. **Progress indicators** that animate between states

## Usage

The onboarding modal is integrated into the dashboard layout and appears automatically for new users. It can be manually triggered in two ways:

1. Clicking the help icon in the header
2. Programmatically via `window.openOnboarding()`

## Customization

To modify the onboarding steps, edit the `onboardingSteps` array in `OnboardingModal.tsx`. Each step requires:

- `title`: The heading for the step
- `description`: Explanatory text
- `image`: Path to the illustration (SVG recommended)

## Implementation Notes

- The modal uses localStorage to track whether users have seen the onboarding
- SVG illustrations are stored in the public directory
- The modal is designed to be non-intrusive and can be easily dismissed 