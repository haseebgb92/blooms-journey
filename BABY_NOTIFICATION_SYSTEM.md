# Baby Notification System

## Overview

The Baby Notification System provides personalized, AI-generated messages from the baby's perspective that focus on nutrition, exercise, and symptoms. These notifications appear every 24 hours and are tailored to the user's current pregnancy week.

## Features

### 1. **AI-Generated Baby Messages**
- **Personalized content** based on current pregnancy week
- **Three categories**: Nutrition, Exercise, and Symptoms
- **Baby's perspective** - messages sound like they're coming from the baby
- **Week-specific advice** that's relevant to the current stage

### 2. **24-Hour Timing**
- **Automatic scheduling** - notifications appear every 24 hours
- **Smart timing** - only shows when 24 hours have passed since the last notification
- **Background checking** - continuously monitors for new notification times

### 3. **Cute UI Design**
- **Baby-themed styling** with pink/purple gradient background
- **Category badges** with appropriate icons and colors
- **Animated entrance** - slides in from bottom-right
- **Dismissible** - users can close notifications

## Technical Implementation

### **AI Flow (`babyNotification.ts`)**
```typescript
// Generates baby messages based on week and category
const babyNotificationFlow = ai.defineFlow({
  name: 'babyNotificationFlow',
  inputSchema: BabyNotificationInputSchema,
  outputSchema: z.string(),
}, async ({week, category}) => {
  // Category-specific prompts for nutrition, exercise, symptoms
  const categoryPrompts = {
    nutrition: `You are a baby in your mother's womb at week ${week}...`,
    exercise: `You are a baby in your mother's womb at week ${week}...`,
    symptoms: `You are a baby in your mother's womb at week ${week}...`
  };
});
```

### **Notification Service (`notificationService.ts`)**
- **Singleton pattern** for managing notification state
- **Firestore integration** for storing notification history
- **24-hour timing logic** using timestamps
- **Background checking** with setInterval

### **UI Component (`BabyNotification.tsx`)**
- **Fixed positioning** at bottom-right of screen
- **Real-time updates** using custom events
- **Category-based styling** with icons and colors
- **Dismiss functionality** with Firestore updates

## User Experience

### **Notification Display**
1. **Automatic appearance** every 24 hours
2. **Cute baby-themed design** with gradient background
3. **Category badge** showing nutrition/exercise/symptoms
4. **Week indicator** showing current pregnancy week
5. **Message from baby** in quotes with heart icon
6. **Timestamp** showing when message was generated
7. **Dismiss button** to close notification

### **Categories**

#### **Nutrition**
- Focus on healthy eating for the current week
- Specific nutrient recommendations
- Hydration reminders
- Food safety tips

#### **Exercise**
- Safe exercise recommendations
- Movement benefits for baby
- Activity suggestions for current week
- Safety guidelines

#### **Symptoms**
- Common symptoms for the week
- Self-care tips
- Reassurance about normal changes
- When to contact doctor

## Example Messages

### **Week 8 (Nutrition)**
"Hi Mommy! I'm growing so fast this week and I love when you eat those yummy fruits and vegetables. The folic acid helps my little brain develop! 💕"

### **Week 20 (Exercise)**
"Mommy, I can feel when you move around! Those gentle walks and prenatal yoga make me so happy. Keep moving for both of us! 🥰"

### **Week 36 (Symptoms)**
"Mommy, I know it's getting uncomfortable for you, but we're almost there! Remember to rest when you need to - I'm getting ready to meet you soon! 💖"

## Configuration

### **Timing Settings**
- **Check interval**: Every hour (configurable)
- **Notification frequency**: Every 24 hours
- **Display duration**: Until dismissed by user

### **Categories**
- **Nutrition**: Orange theme with utensils icon
- **Exercise**: Green theme with activity icon  
- **Symptoms**: Blue theme with alert icon

## Benefits

1. **Personalized Content**: Messages are tailored to the specific pregnancy week
2. **Engaging Experience**: Baby's perspective makes it more personal and cute
3. **Educational Value**: Provides useful information about nutrition, exercise, and symptoms
4. **Consistent Engagement**: 24-hour timing keeps users engaged
5. **Non-Intrusive**: Users can dismiss notifications easily
6. **Week-Appropriate**: Content is relevant to the current pregnancy stage

## Future Enhancements

- **Customization options** for notification frequency
- **Message history** page to view past notifications
- **Audio messages** from the baby
- **Interactive responses** to baby messages
- **Partner notifications** to share baby messages
- **Symptom tracking** integration with notifications

The Baby Notification System creates a delightful, personalized experience that helps pregnant women stay engaged with their pregnancy journey while receiving valuable, week-appropriate advice from their baby's perspective!
