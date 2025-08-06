# Troubleshooting Guide

## Common Next.js & Turbopack Issues

### 1. Turbopack Build Cache Issues

**Error**: `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`

**Solution**:
```powershell
# Stop all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Next.js build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Restart development server
npm run dev
```

### 2. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::9002`

**Solution**:
```powershell
# Find processes using port 9002
Get-NetTCPConnection -LocalPort 9002

# Kill specific process by PID
Stop-Process -Id <PID> -Force

# Or kill all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. Firebase Index Errors

**Error**: `The query requires an index`

**Solution**:
- Check if the query is using composite indexes
- Simplify queries to avoid index requirements
- Use client-side filtering when possible
- Create required indexes in Firebase Console if needed

### 4. SSR/Client-Side Issues

**Error**: `ReferenceError: window is not defined`

**Solution**:
```typescript
// Use dynamic imports for client-side only code
const { notificationService } = await import('@/lib/notificationService');

// Check if running on client
if (typeof window !== 'undefined') {
  // Client-side code
}
```

### 5. TypeScript Errors

**Error**: `Cannot find name 'useToast'`

**Solution**:
- Remove unused imports
- Check import paths
- Ensure proper type definitions
- Clear TypeScript cache: `rm -rf .next && npm run dev`

### 6. Build Failures

**Error**: Build process fails or hangs

**Solution**:
```powershell
# Clean everything
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Reinstall dependencies
npm install

# Clear caches
npm cache clean --force

# Rebuild
npm run build
```

### 7. DOM Nesting Issues

**Error**: `<p> cannot contain a nested <div>. See this log for the ancestor stack trace.`

**Solution**:
```typescript
// ❌ Wrong - div inside p context
<p>
  <div>Content</div>
</p>

// ✅ Correct - use span instead
<p>
  <span>Content</span>
</p>

// ✅ Correct - use proper semantic structure
<div>
  <p>Content</p>
</div>
```

**Common Fixes**:
- Replace `<div>` with `<span className="block">` when inside paragraph contexts
- Use semantic HTML structure (divs contain paragraphs, not vice versa)
- Check for nested elements in bullet points and lists
- Ensure proper component hierarchy in React components

**Components to Check**:
- `AiPregnancyPal.tsx` - bullet point rendering and CardDescription content
- `MealPlanner.tsx` - meal content rendering  
- `NotificationDropdown.tsx` - dropdown menu items
- `ChatPage.tsx` - message rendering with flex properties

**Specific Fixes Applied**:
1. **CardDescription with div elements**: Replace `<div>` with `<span className="flex items-center gap-2">` inside `CardDescription`
2. **Bullet points in paragraphs**: Use `<span className="block">` instead of `<div>` for bullet point containers
3. **Flex properties on p tags**: Replace `<p className="flex">` with `<div className="flex">` for elements that need flexbox
4. **Dropdown menu items**: Use `<span className="block">` instead of `<div>` inside `DropdownMenuItem`

## Prevention Tips

1. **Regular Cache Clearing**: Clear `.next` folder periodically
2. **Process Management**: Always stop Node.js processes before restarting
3. **Port Management**: Use different ports if conflicts occur
4. **Dependency Updates**: Keep dependencies updated
5. **TypeScript**: Use strict mode and fix errors promptly

## Development Workflow

1. **Start Development**:
   ```powershell
   npm run dev
   ```

2. **Build for Production**:
   ```powershell
   npm run build
   npm start
   ```

3. **Clean Restart**:
   ```powershell
   Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   npm run dev
   ```

## Emergency Recovery

If the app becomes completely unresponsive:

1. **Kill all processes**:
   ```powershell
   Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Clean everything**:
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   ```

3. **Fresh install**:
   ```powershell
   npm install
   npm run dev
   ```

This should resolve most common development issues with Next.js and Turbopack.
