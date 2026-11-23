# How House Electricity Works — First-Principles & Parallel US Wiring 3D Explainer

A zero-build, interactive **52-second 3D WebGL visual explainer** combining electrical physics from first principles with hands-on **US NEC parallel outlet wiring**—flying from a neighborhood pole transformer through house walls, tapping off an existing outlet in parallel to a second NEMA 5-15R receptacle (and proving what "parallel" means), zooming into electromagnetic Poynting energy fields, and ending inside a copper crystal lattice of oscillating electrons.

## Journey Overview (52 Seconds · 9 Chapters)

1. **0:00 – 0:05 · The Hookup — Stepping Down Voltage**: 7,200 V distribution lines enter a cutaway pole transformer, where oscillating magnetic flux induces 240 V / 120 V split-phase AC on a center-tapped secondary coil.
2. **0:05 – 0:10 · The Breaker Panel — Split-Phase & Safety**: Overhead triplex feeds the meter and main panel. Two 180° out-of-phase hot legs (`L1` & `L2`), a neutral return (`N`), and an earth ground rod establish voltage references and overcurrent protection.
3. **0:10 – 0:14 · Behind the Walls — Closing the Loop**: Architectural siding dissolves to reveal 2×4 studs and 12/2 Romex cable. Flipping the wall switch closes the loop through Outlet #1 and ignites a clear-glass Edison lamp.
4. **0:14 – 0:20 · Safety First — Kill Power & Verify 0 V**: The 20 A branch breaker is shut OFF (`0 V`), verified dead on Existing Outlet #1 with a Non-Contact Voltage Tester, and yellow 12/2 NM-B cable bridges across to Box #2.
5. **0:20 – 0:28 · Tapping Off Outlet #1 — What "Parallel" Means**: Demonstrates why parallel outlets act like ladder rungs across a continuous `120 V` Hot rail and `0 V` Neutral rail—using Outlet #1's intact Brass/Silver break-off tabs and a green ground wire-nut pigtail.
6. **0:28 – 0:37 · Wiring Outlet #2 & Proving Parallel Loads**: Wires Outlet #2 clockwise (**Ground → Green, White → Silver, Black → Brass**), restores `120 V`, inserts Plug #2 (longer Ground pin first!), shows `I_total = I₁ + I₂`, and tests unplugging Plug #1 while Plug #2 stays bright at `120 V`.
7. **0:37 – 0:42 · The Field — How Energy Actually Travels**: Diving inside the live parallel copper wire exposes the electric field (`E`) spanning Hot to Neutral, concentric magnetic rings (`B`), and golden Poynting energy flux (`S = E × B`) flowing *outside* the copper on both AC half-cycles.
8. **0:42 – 0:47 · Inside Copper — The Sea of Electrons**: Piercing the copper surface reveals a Face-Centered Cubic (`Cu⁺`) atomic crystal lattice immersed in a delocalized sea of 4s¹ valence electrons oscillating gently back and forth 60 times per second.
9. **0:47 – 0:52 · At the Electrons — Motion Becomes Light**: Close-up of thermal jitter + tiny synchronized AC drift (~0.1 mm/s peak), showing how electron–ion lattice scattering converts electromagnetic field energy into heat and light.

## Local Preview

Because the app uses native ES modules (`importmap` + Three.js from jsDelivr), serve the folder over any static HTTP server:

```bash
cd house-electricity-explainer
python3 -m http.server 8765
```

Then open `http://localhost:8765/` in your browser.

## Publishing to GitHub Pages

This project is **zero-build static HTML/CSS/JS** and includes `.nojekyll` so GitHub Pages serves ES modules cleanly:

1. Create a new GitHub repository (or upload the contents of `house-electricity-explainer/` to your repo root or `/docs`).
2. Push all files (`index.html`, `styles.css`, `.nojekyll`, `README.md`, and `src/`).
3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, pick `main` and `/ (root)` (or `/docs` if placed there), and click **Save**.
5. After ~1 minute, your live 3D explainer will be available at `https://<username>.github.io/<repo-name>/`.

## Controls & Shortcuts

- **Play / Pause**: `Space` (Pausing unlocks free 3D orbit/pan/zoom + clickable 3D inspection pins)
- **Replay from 0:00**: `R`
- **Jump to Chapter 1–9**: `1` – `9`
- **Toggle Inspect Pins**: `I`
- **Toggle Procedural Soundscape**: `M`
- **Toggle First-Principles & US Parallel Wiring Guide**: `G`
