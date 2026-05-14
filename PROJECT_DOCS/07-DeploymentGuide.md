# Deployment Guide: Railway & Production

## Deployment Overview

This project is deployed on **Railway**, a full-stack deployment platform that supports Node.js + Python.

**Live URL:** (pending successful deployment)

---

## Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] package.json has correct scripts
- [ ] `requirements.txt` has all Python deps
- [ ] `railway.toml` is valid TOML (no syntax errors)
- [ ] `.nvmrc` specifies Node version (18)
- [ ] `Dockerfile` is optional (using Railpack)

---

## Auto-Deployment Flow

When you push to GitHub:

```
1. GitHub webhook notifies Railway
2. Railway clones your repo
3. Detects Node.js (via .nvmrc)
4. Runs: npm install
5. Runs: [build command from railway.toml]
6. Runs: [start command from railway.toml]
7. Container starts listening on PORT=3000
8. Railway assigns a public URL
```

---

## Configuration Files

### `.nvmrc` (Node.js Version)

```
18
```

Tells Railway: "Use Node.js 18.x for this project"

### `railway.toml` (Deployment Config)

```toml
[build]
builder = "RAILPACK"
buildCommand = "GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=2048 npm install --include=dev && react-scripts build"

[deploy]
startCommand = "node scripts/start.js"
healthcheckPath = "/"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
```

**What each line does:**

| Setting                                  | Purpose                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `builder = "RAILPACK"`                   | Use Railway's Node.js detector (auto handles npm/node) |
| `buildCommand = "..."`                   | Build the React app, with memory optimization          |
| `GENERATE_SOURCEMAP=false`               | Smaller build (no source maps)                         |
| `NODE_OPTIONS=--max-old-space-size=2048` | Give Node 2GB RAM during build                         |
| `startCommand = "node scripts/start.js"` | Start the production server                            |
| `healthcheckPath = "/"`                  | Verify app is live before deploy completes             |
| `restartPolicyType = "ON_FAILURE"`       | Auto-restart if app crashes                            |
| `restartPolicyMaxRetries = 5`            | Try restarting up to 5 times                           |

### `package.json` (Build Script)

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=2048 npm install --include=dev && react-scripts build",
    "start": "node scripts/start.js",
    "serve": "serve -s build"
  }
}
```

**Note:** The `build` script installs dependencies AND builds, because Railway calls this script during the build phase.

### `scripts/start.js` (Production Server)

```javascript
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT || 3000);
const buildDir = path.join(__dirname, "..", "build");

// Simple HTTP server that serves static files from build/
http
  .createServer((request, response) => {
    // ... file serving logic ...
  })
  .listen(port, () => {
    console.log(`Serving build on port ${port}`);
  });
```

**Why this instead of `serve`?**

- `serve` is a devDependency (adds weight)
- This is pure Node.js (no extra package needed)
- Works perfectly for static React apps

---

## Deployment Issues & Solutions

### Issue 1: "Deployment failed during initialization: parse failure, failed to parse railway.toml"

**Cause:** TOML syntax error (e.g., `$schema =` line)

**Solution:** Validate TOML syntax:

```bash
# Install a TOML linter
npm install -g toml-lint

# Validate
toml-lint railway.toml
```

**Common Errors:**

- `$schema` should not have `$` (not valid TOML key)
- Use `[section]` not `[section:"name"]`
- Strings use `"..."` not `'...'` (single quotes OK in TOML, but avoid)

### Issue 2: Build fails with "react-scripts: not found"

**Cause:** Dependencies not installed before react-scripts build

**Solution:** Ensure `buildCommand` includes `npm install`:

```toml
buildCommand = "npm install --include=dev && react-scripts build"
```

### Issue 3: Build OOM (Out of Memory) error

**Cause:** React build needs more than 512MB RAM

**Solution:** Add memory limit to `buildCommand`:

```toml
buildCommand = "NODE_OPTIONS=--max-old-space-size=2048 npm install --include=dev && react-scripts build"
```

This gives Node 2GB of RAM.

### Issue 4: App starts but shows "Cannot GET /"

**Cause:** `start.js` is looking for build files that don't exist

**Solution:** Verify build happened:

- Check Railway logs: did it reach "Compiled successfully"?
- Verify `build/` folder was created

### Issue 5: App crashes immediately after startup

**Cause:** Port is wrong or app fails to initialize

**Solution:**

- Check Railway logs for error messages
- Verify `startCommand` is correct in `railway.toml`
- Test locally: `npm run build && npm start`

---

## Monitoring & Debugging

### View Deployment Logs

In Railway Dashboard:

1. Project → Service → Deployments
2. Click latest deployment
3. Scroll down to see build logs and runtime logs

**Key log markers:**

```
[BUILD] npm install ...
[BUILD] npm run build
[BUILD] react-scripts build
...
[DEPLOY] Starting container
[DEPLOY] npm start
[DEPLOY] Server listening on port 3000
```

### Common Problems in Logs

| Log                            | Issue                    | Solution                      |
| ------------------------------ | ------------------------ | ----------------------------- |
| `react-scripts: not found`     | npm not run before build | Fix buildCommand              |
| `out of memory`                | Build too large          | Add NODE_OPTIONS memory limit |
| `EADDRINUSE`                   | Port already in use      | Railway assigns PORT env var  |
| `Cannot find module './build'` | Build folder missing     | Check build logs above        |

### Real-Time Monitoring

- **Railway Dashboard:** Live logs, metrics
- **Restart on Failure:** Auto-restart enabled (check `railway.toml`)
- **Health Check:** Railway pings `/` every 30s to confirm app is live

---

## Environment Variables

### Set in Railway Dashboard

Go to: Project → Service → Variables

**Common Variables:**

```
NODE_ENV=production
PORT=3000
DEBUG=false
```

**Accessing in app:**

```typescript
// In React (build time):
process.env.REACT_APP_API_URL; // Must start with REACT_APP_

// In Node (runtime):
process.env.PORT; // Used by start.js
process.env.NODE_ENV;
```

---

## Post-Deployment Verification

1. **URL works:** Copy Railway URL, paste in browser
2. **Data loads:** Open DevTools → Network → check results.json loads
3. **Animation plays:** Click "Play" button → epoch counter increments
4. **Charts render:** Verify 6 charts display with data
5. **Filters work:** Toggle optimizer/kernel checkboxes → grid updates

---

## Rollback Strategy

If a deployment breaks:

1. **In Railway Dashboard:**
   - Go to Deployments
   - Find the previous good deployment
   - Click "Redeploy" next to it

2. **Via Git:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
   Railway auto-redeploys from the new commit

---

## Cost & Quota

**Railway Pricing:**

- Free tier: $5/month credit (all users)
- This project: ~$2-3/month (small React app, minimal traffic)
- Typical bottleneck: Not RAM/CPU, but data transfer

**Usage Tracking:**

- Railway Dashboard → Project Usage
- Shows compute hours, bandwidth, deployment count

---

## Next Steps After Deployment

1. **Share the URL** with friends, on resume, in portfolio
2. **Monitor first 24h** for crashes (check logs)
3. **Test on mobile** to ensure responsive design
4. **Gather feedback** on UX and feature ideas

---

## Advanced: Custom Domain

**If you want a custom domain (optional):**

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Railway Dashboard → Project → Domains
3. Add your domain → Railway gives DNS records
4. Update domain registrar with DNS records
5. Wait 24h for DNS propagation

---

**Next:** Open `08-InterviewPrep.md` for common interview questions about this project.
