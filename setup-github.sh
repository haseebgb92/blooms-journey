#!/bin/bash

echo "🚀 Setting up GitHub repository for Blooms Journey"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

echo "📋 Instructions to create GitHub repository:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: blooms-journey"
echo "3. Description: A comprehensive pregnancy and parenting companion app"
echo "4. Make it Public or Private (your choice)"
echo "5. DO NOT initialize with README, .gitignore, or license (we already have these)"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, run these commands:"
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/blooms-journey.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your actual GitHub username."
echo ""
echo "🎉 Your Blooms Journey repository will be ready!" 