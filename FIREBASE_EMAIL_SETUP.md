# Firebase Email Template Setup Guide

## 🎯 **Objective**
Set up custom email templates for Bloom Journey password reset emails to replace the generic Firebase emails.

## 📋 **Steps to Configure Custom Email Templates**

### **1. Access Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `bloom-journey-cfezc`
3. Navigate to **Authentication** in the left sidebar

### **2. Configure Email Templates**
1. Click on **Templates** tab in Authentication
2. Select **Password reset** template
3. Click **Edit** to customize the template

### **3. Custom Email Template Content**

#### **Subject Line:**
```
Reset your Bloom Journey password 🌸
```

#### **HTML Content:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Bloom Journey</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            display: block;
        }
        .title {
            color: #ec4899;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .warning-text {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 10px 0;
        }
        .footer-link {
            color: #ec4899;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
            }
            .header {
                text-align: center !important;
            }
            .logo {
                width: 80px !important;
                height: 80px !important;
            }
            .button {
                display: block !important;
                width: 100% !important;
                margin: 20px 0 !important;
            }
            .footer {
                text-align: center !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://bloom-journey-cfezc.firebaseapp.com/images/icon.png" alt="Bloom Journey Logo" class="logo">
            <h1 class="title">Bloom Journey</h1>
            <p class="subtitle">Your pregnancy companion</p>
        </div>
        <div class="content">
            <p class="greeting">Hello there! 👋</p>
            <p class="message">We received a request to reset the password for your Bloom Journey account. If you made this request, click the button below to create a new password.</p>
            <a href="%LINK%" class="button">Reset Your Password</a>
            <div class="warning">
                <p class="warning-text">⚠️ This link will expire in 1 hour for your security. If you didn't request this password reset, you can safely ignore this email.</p>
            </div>
            <p class="message">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px; background-color: #f9fafb; padding: 12px; border-radius: 6px; margin: 20px 0;">%LINK%</p>
        </div>
        <div class="footer">
            <p class="footer-text">Best wishes,<br>The Bloom Journey Team</p>
            <p class="footer-text">© 2024 Bloom Journey. All rights reserved.</p>
            <p class="footer-text"><a href="https://bloom-journey-cfezc.firebaseapp.com" class="footer-link">Visit Bloom Journey</a></p>
        </div>
    </div>
</body>
</html>
```

#### **Plain Text Content:**
```
Hello there! 👋

We received a request to reset the password for your Bloom Journey account. If you made this request, click the link below to create a new password:

%LINK%

⚠️ This link will expire in 1 hour for your security.

If you didn't request this password reset, you can safely ignore this email.

Best wishes,
The Bloom Journey Team

© 2024 Bloom Journey. All rights reserved.
Visit: https://bloom-journey-cfezc.firebaseapp.com
```

### **4. Save Configuration**
1. Click **Save** to apply the custom template
2. Test the template by sending a password reset email

## 🎨 **Email Masking Solution**

Since Firebase doesn't allow email masking in templates, we've implemented a client-side solution:

### **Current Implementation:**
- Uses `actionCodeSettings` to redirect to a custom URL
- Attempts to mask email display in the UI
- Provides branded experience through custom redirect

### **Alternative Solutions:**

#### **Option 1: Custom Email Service**
- Use SendGrid, Mailgun, or similar service
- Full control over email content and sender
- Cost: ~$15/month

#### **Option 2: Firebase Functions**
- Create a Cloud Function to send custom emails
- More complex setup but full control
- Cost: Pay per use

#### **Option 3: Hybrid Approach**
- Use Firebase Auth for authentication
- Custom email service for notifications
- Best of both worlds

## 🚀 **Next Steps**

1. **Configure Firebase Console** with the custom template above
2. **Test the email template** with a real password reset
3. **Monitor email deliverability** and spam folder placement
4. **Consider upgrading** to custom email service if needed

## 📞 **Support**

If you need help configuring the Firebase Console or have questions about the email templates, please refer to the Firebase documentation or contact the development team.
