#!/bin/bash

echo "🚀 Creating GitHub repository for Blooms Journey"
echo ""

# Check if GitHub token is available
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GitHub token not found. Please set your GitHub token:"
    echo "export GITHUB_TOKEN=your_github_token_here"
    echo ""
    echo "To get a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token'"
    echo "3. Select 'repo' permissions"
    echo "4. Copy the token and set it as GITHUB_TOKEN"
    echo ""
    echo "Alternatively, you can create the repository manually:"
    echo "1. Go to https://github.com/new"
    echo "2. Name: blooms-journey"
    echo "3. Description: A comprehensive pregnancy and parenting companion app"
    echo "4. Make it Public or Private"
    echo "5. Don't initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/blooms-journey.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    exit 1
fi

# Get username from GitHub API
USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USERNAME" ]; then
    echo "❌ Could not get GitHub username. Please check your token."
    exit 1
fi

echo "✅ GitHub username: $USERNAME"
echo ""

# Create repository
echo "📦 Creating repository 'blooms-journey'..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d '{
        "name": "blooms-journey",
        "description": "A comprehensive pregnancy and parenting companion app",
        "private": false,
        "auto_init": false
    }')

# Check if repository was created successfully
if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ Repository created successfully!"
    echo ""
    
    # Add remote and push
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/$USERNAME/blooms-journey.git
    
    echo "🌿 Setting branch to main..."
    git branch -M main
    
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    
    echo ""
    echo "🎉 Success! Your Blooms Journey repository is now live at:"
    echo "https://github.com/$USERNAME/blooms-journey"
    
else
    echo "❌ Failed to create repository. Response:"
    echo "$RESPONSE"
    echo ""
    echo "Please create the repository manually and run:"
    echo "git remote add origin https://github.com/$USERNAME/blooms-journey.git"
    echo "git branch -M main"
    echo "git push -u origin main"
fi 