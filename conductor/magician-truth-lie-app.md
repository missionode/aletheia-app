# Plan: Aletheia - The Magician's Biometric Truth Detector

## Objective
Create a "Truth or Lie" toss application that appears to use high-tech biometric/face analysis. The magician can secretly control the outcome (always "Truth") by being the one in front of the camera. When a stranger uses it, the outcome is random.

## Tech Stack
- **Framework:** React with Vite (TypeScript)
- **Styling:** Tailwind CSS (Modern, dark, "Cyber-security" aesthetic)
- **Face Analysis:** `face-api.js` (Client-side, fast, no server required)
- **Deployment:** PWA (Progressive Web App) hosted on **GitHub Pages**.
- **Icons:** `lucide-react` for UI icons.

## Deployment & Hosting (GitHub Pages)
- **Base Path:** Configuration for `./` or `/repo-name/` to ensure assets load correctly on GitHub Pages.
- **HTTPS:** Required for `getUserMedia` (camera access). GitHub Pages provides this by default.
- **PWA:** `vite-plugin-pwa` will be configured to handle the base path for manifest and service worker.

## The Trick (The "Expression Force")
The application will use face and expression recognition to distinguish between the Magician and a Stranger, and to toggle the rigging stealthily.
- **The "Force" (Smiling):** If the Magician is detected and is **SMILING**, the result is hardcoded to **TRUTH**.
- **The "Bail Out" (Neutral/Tense):** If the Magician is detected but is **NOT SMILING** (neutral or tensed face), the app enters "Fair Mode" (Random results). This allows the magician to "prove" the app is fair while their face is still in view.
- **Public Mode:** If an unknown face is detected, the result is always **RANDOM**.
- **Stealth:** Framed as "Micro-expression Analysis," where the app claims to detect "stress indicators" to determine the truth.

## Implementation Steps

### Phase 1: Project Setup & UI Design
1.  Initialize Vite + React + Tailwind project.
2.  Design a "Cyber/Hacker" UI:
    - Scanning mesh overlay on camera feed.
    - Progress bars for "Stress Levels", "Pulse Simulation", "Neural Activity".
    - Large, high-contrast "TRUTH" or "LIE" result display with haptic feedback.
3.  Create a hidden "Calibration" screen (via secret long-press) to capture the Magician's face descriptors.

### Phase 2: Face & Expression Detection
1.  Integrate `face-api.js`.
2.  Implement the `FaceService` to:
    - Load models (tinyFaceDetector, faceLandmark68Net, faceRecognitionNet, faceExpressionNet).
    - Detect face and expressions in the live video stream.
    - Compare face descriptors against the "Owner" descriptor.
3.  Optimize for real-time mobile performance.

### Phase 3: The Expression Logic
1.  Develop the `OutcomeEngine`:
    - `getOutcome(faceDescriptor, expressions)` function.
    - Logic:
      ```javascript
      if (isMatch(faceDescriptor, ownerDescriptor)) {
        return expressions.happy > 0.7 ? 'TRUTH' : (Math.random() > 0.5 ? 'TRUTH' : 'LIE');
      }
      return Math.random() > 0.5 ? 'TRUTH' : 'LIE';
      ```
2.  Add a "Visual Indicator" for the Magician: A tiny, nearly invisible change in the UI (e.g., a 1px color shift in a corner) to confirm the app has detected the smile and is "Armed".

### Phase 4: Final Polish & PWA
1.  Add sound effects (tech-beeps, heartbeat, success/fail chimes).
2.  Configure `vite-plugin-pwa` for home-screen installation and offline support.
3.  **GitHub Pages Setup:** Add `base` config to `vite.config.ts` and set up a deployment script or GitHub Action.
4.  Final testing on mobile device.

## Verification & Testing
- **Test Case 1 (Magician):** Magician holds the phone -> Result: Truth (10/10 times).
- **Test Case 2 (Stranger):** Stranger holds the phone -> Result: Random distribution.
- **Test Case 3 (No Face):** Should show "Subject Not Detected" or "Searching..." to avoid accidental rigging.
- **Test Case 4 (The "Fair Play" Trigger):** Verify the secret gesture overrides the rigging.

## Migration & Rollback
- Since this is a new project, we can iterate quickly.
- If face recognition is too slow, fallback to "Hidden UI Zones" as a secondary trigger.
