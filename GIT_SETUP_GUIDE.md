# 📚 Git Repository Setup Guide - Family Meal Planner

Complete guide to create a Git repository and deploy your meal planner app.

---

## 🎯 Prerequisites

1. **Git installed on your computer**
   - Check: Open terminal and type `git --version`
   - If not installed: Download from https://git-scm.com/

2. **GitHub account**
   - Sign up at https://github.com (free)

---

## 🚀 METHOD 1: GitHub Desktop (Easiest - No Commands)

### Step 1: Download Files
1. Download all 7 files from Claude
2. Put them in a new folder called `family-meal-planner`

### Step 2: Install GitHub Desktop
1. Go to: https://desktop.github.com/
2. Download and install
3. Sign in with your GitHub account

### Step 3: Create Repository
1. Open GitHub Desktop
2. Click "File" → "New Repository"
3. Settings:
   - Name: `family-meal-planner`
   - Local Path: Choose your folder's PARENT directory
   - Initialize with README: ✅ Check
   - Git Ignore: None
   - License: MIT
4. Click "Create Repository"

### Step 4: Add Your Files
1. Copy all 7 meal planner files into the folder
2. GitHub Desktop will show changes automatically
3. Write commit message: "Initial commit - Family Meal Planner v1.0"
4. Click "Commit to main"

### Step 5: Publish to GitHub
1. Click "Publish repository" (top right)
2. Uncheck "Keep this code private" (or keep private if you want)
3. Click "Publish Repository"

✅ DONE! Your repo is on GitHub!

---

## 💻 METHOD 2: Command Line (For Developers)

### Step 1: Download & Organize Files
```bash
# Create project folder
mkdir family-meal-planner
cd family-meal-planner

# Copy all 7 downloaded files here
```

### Step 2: Initialize Git Repository
```bash
# Initialize git
git init

# Check what files are there
ls -la

# Should see:
# index.html
# app.jsx
# vercel.json
# package.json
# README.md
# QUICKSTART.txt
# .gitignore
```

### Step 3: Configure Git (First Time Only)
```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

### Step 4: Stage & Commit Files
```bash
# Stage all files
git add .

# Check what's staged
git status

# Commit with message
git commit -m "Initial commit - Family Meal Planner v1.0"
```

### Step 5: Create GitHub Repository
1. Go to https://github.com
2. Click "+" icon (top right) → "New repository"
3. Settings:
   - Repository name: `family-meal-planner`
   - Description: "Smart family meal planning app with inventory management"
   - Public or Private: Your choice
   - ❌ DO NOT initialize with README (you already have one)
4. Click "Create repository"

### Step 6: Connect Local to GitHub
```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/family-meal-planner.git

# Verify remote
git remote -v

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

✅ DONE! Your code is on GitHub!

---

## 🔐 METHOD 3: Using SSH (More Secure)

### Step 1: Generate SSH Key (First Time Only)
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter to accept default location
# Optional: Enter passphrase (or press Enter for none)

# Copy SSH key to clipboard
cat ~/.ssh/id_ed25519.pub
# Copy the entire output
```

### Step 2: Add SSH Key to GitHub
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "My Computer"
4. Paste the SSH key you copied
5. Click "Add SSH key"

### Step 3: Follow Method 2, But Use SSH URL
```bash
# Instead of HTTPS, use SSH URL
git remote add origin git@github.com:YOUR_USERNAME/family-meal-planner.git

# Push
git push -u origin main
```

---

## 🎨 After Creating Repository

### Deploy to Vercel from GitHub

#### Option A: Automatic (Recommended)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `family-meal-planner` repository
5. Click "Deploy"

✅ Auto-deploys on every push!

#### Option B: Manual Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Link to GitHub repo
vercel link

# Deploy
vercel --prod
```

---

## 📝 Common Git Commands (Cheat Sheet)

### Daily Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull
```

### Viewing History
```bash
# View commit history
git log

# View short history
git log --oneline

# View changes
git diff
```

### Branching
```bash
# Create new branch
git branch feature-name

# Switch to branch
git checkout feature-name

# Create and switch in one command
git checkout -b feature-name

# Merge branch to main
git checkout main
git merge feature-name

# Delete branch
git branch -d feature-name
```

### Undo Changes
```bash
# Undo unstaged changes
git checkout -- filename

# Undo staged changes
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

## 🔄 Making Updates Later

### When You Modify Code:
```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit with descriptive message
git commit -m "Add dark mode feature"

# 4. Push to GitHub
git push

# 5. Vercel auto-deploys (if connected)
```

### Good Commit Messages:
- ✅ "Add recipe search functionality"
- ✅ "Fix PIN authentication bug"
- ✅ "Update health profile calculations"
- ❌ "Changes"
- ❌ "Update"
- ❌ "Fix stuff"

---

## 🐛 Troubleshooting

### "Permission denied" on push
**Solution:** Set up SSH key (see Method 3) or use HTTPS with personal access token

### "fatal: remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new one
git remote add origin YOUR_NEW_URL
```

### "Your branch is behind origin/main"
```bash
# Pull latest changes
git pull origin main

# Or force push (careful!)
git push -f origin main
```

### "Merge conflict"
```bash
# 1. Open conflicted files
# 2. Look for <<<<<<< HEAD markers
# 3. Edit to resolve conflicts
# 4. Stage resolved files
git add .

# 5. Continue merge
git commit -m "Resolve merge conflicts"
```

### Forgot to stage a file
```bash
# Add forgotten file
git add forgotten-file.js

# Amend last commit
git commit --amend --no-edit
```

---

## 📦 .gitignore Explained

Your `.gitignore` file tells Git what NOT to track:

```gitignore
# Vercel deployment files
.vercel/

# Dependencies (if you add npm)
node_modules/

# Environment variables
.env

# Editor files
.vscode/
.DS_Store

# Logs
*.log
```

---

## 🎯 Repository Best Practices

### 1. **Commit Often**
- Small, focused commits
- Commit after each feature/fix
- Makes debugging easier

### 2. **Write Clear Messages**
- Start with verb: "Add", "Fix", "Update"
- Be specific: What and why
- Keep under 50 characters

### 3. **Branch Strategy**
```
main          - Production code (always working)
develop       - Integration branch
feature-*     - New features
bugfix-*      - Bug fixes
hotfix-*      - Emergency fixes
```

### 4. **Protect Main Branch**
- Never commit directly to main
- Use pull requests for review
- Set up branch protection on GitHub

### 5. **Use Tags for Releases**
```bash
# Tag version
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push --tags
```

---

## 🔗 Quick Reference

### Essential Commands
| Command | Purpose |
|---------|---------|
| `git init` | Initialize repository |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit with message |
| `git push` | Upload to GitHub |
| `git pull` | Download from GitHub |
| `git status` | Check status |
| `git log` | View history |

### GitHub URLs
- **Your Repositories:** https://github.com/YOUR_USERNAME?tab=repositories
- **Settings:** https://github.com/settings
- **SSH Keys:** https://github.com/settings/keys
- **Personal Access Tokens:** https://github.com/settings/tokens

---

## 🎓 Learn More

### Resources:
- **Git Basics:** https://git-scm.com/book/en/v2
- **GitHub Guides:** https://guides.github.com/
- **Interactive Tutorial:** https://learngitbranching.js.org/
- **Git Cheat Sheet:** https://education.github.com/git-cheat-sheet-education.pdf

### Video Tutorials:
- Git & GitHub for Beginners (YouTube)
- GitHub Desktop Tutorial (YouTube)
- Vercel Deployment Guide (Vercel Docs)

---

## ✅ Final Checklist

Before considering your setup complete:

- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Local files committed
- [ ] Code pushed to GitHub
- [ ] Repository is public/private as intended
- [ ] README.md is displaying correctly
- [ ] Connected to Vercel (optional)
- [ ] Auto-deployment working (optional)

---

## 🎉 You're Ready!

Your meal planner code is now:
- ✅ Backed up on GitHub
- ✅ Version controlled
- ✅ Ready to deploy
- ✅ Easy to update
- ✅ Shareable with others

**Next Step:** Deploy to Vercel from your GitHub repo!

---

## 📞 Need Help?

- **Git Documentation:** https://git-scm.com/doc
- **GitHub Support:** https://support.github.com/
- **Vercel Docs:** https://vercel.com/docs

Good luck! 🚀
