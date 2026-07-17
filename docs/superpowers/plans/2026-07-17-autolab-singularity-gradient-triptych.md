# Autolab Singularity–Gradient Triptych Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three directly comparable Autolab visual prototypes that share a caret-to-singularity-to-gradient-to-implosion sequence and diverge only into Slingshot, Rebirth, or Loop endings.

**Architecture:** Three HTML documents select an explicit `data-ending` value and share one scene stylesheet, one browser scene controller, and one pure motion module. The pure module owns seeded experiment identities, normalized timeline phases, orbit/surface/compression poses, and ending trajectories; the browser controller owns scroll state, DOM layers, canvas drawing, pointer input, and a small read-only QA interface.

**Tech Stack:** Semantic HTML, CSS, Canvas 2D, browser-native ES modules, Node.js `node:test`, Chrome DevTools CLI, existing visual companion server.

## Global Constraints

- Preserve A1, A2, and the original singularity unchanged.
- Do not modify production `index.html`, `manifesto.html`, or `careers.html`.
- Shared timeline: Release `0.00–0.12`, singularity ignition and orbit `0.12–0.34`, orbit-to-gradient `0.34–0.60`, evaluation pressure `0.60–0.76`, shared compression `0.76–0.86`, variant ending `0.86–1.00`.
- One vector means one experiment; trails mean lineage; height means evaluated performance; the event horizon means pruning pressure.
- Desktop experiment limit: 240. Mobile experiment limit: 112. Device pixel ratio cap: 2.
- All scroll states are reversible. Pointer influence ends before compression.
- Reduced motion removes autonomous orbit and long trails while preserving all semantic phases.
- All prototype files live under `.superpowers/brainstorm/39694-1784238160/content/`.

---

### Task 1: Pure Motion Contract and Deterministic Experiment Population

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`

**Interfaces:**
- Produces: `TIMELINE`, `clamp(value,min,max)`, `ease(value)`, `phaseFor(progress)`, `createExperimentBlueprints(count,seed)`, `poseForExperiment(blueprint,scene)`, and `endingPose(ending,blueprint,local,context)`.
- `scene` shape: `{ progress:number, time:number, pointer:{x:number,y:number,strength:number}, reducedMotion:boolean }`.
- Normalized pose shape: `{ x:number, y:number, z:number, alpha:number, angle:number, trail:number, scale:number }`.

- [ ] **Step 1: Write deterministic timeline and population tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TIMELINE,
  phaseFor,
  createExperimentBlueprints,
  poseForExperiment,
  endingPose,
} from './autolab-mog-a3-motion-v1.js';

test('phase boundaries match the approved shared timeline', () => {
  assert.equal(phaseFor(0.06), 'release');
  assert.equal(phaseFor(0.20), 'orbit');
  assert.equal(phaseFor(0.47), 'gradient');
  assert.equal(phaseFor(0.68), 'pressure');
  assert.equal(phaseFor(0.81), 'compression');
  assert.equal(phaseFor(0.93), 'ending');
  assert.deepEqual(TIMELINE, { release:.12, orbit:.34, gradient:.60, pressure:.76, compression:.86 });
});

test('experiment identities are deterministic and survive every phase', () => {
  const first=createExperimentBlueprints(240,0xA3701AB);
  const second=createExperimentBlueprints(240,0xA3701AB);
  assert.deepEqual(first,second);
  assert.equal(new Set(first.map(item=>item.id)).size,240);
  const id=first[137].id;
  for(const progress of [.20,.47,.68,.81]) {
    assert.equal(poseForExperiment(first[137],{progress,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false}).id,id);
  }
});

test('compression moves every non-winning experiment toward the origin', () => {
  const [experiment]=createExperimentBlueprints(1,0xA3701AB);
  const early=poseForExperiment(experiment,{progress:.77,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false});
  const late=poseForExperiment(experiment,{progress:.855,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false});
  assert.ok(Math.hypot(late.x,late.y,late.z)<Math.hypot(early.x,early.y,early.z));
});

test('the three endings produce distinct winning trajectories', () => {
  const context={origin:{x:0,y:0},launch:{x:-.8,y:-.9},result:{x:.2,y:.1}};
  const winner={id:'EXP-0137',winner:true,score:1};
  assert.ok(endingPose('slingshot',winner,1,context).position.x>1);
  assert.equal(endingPose('rebirth',winner,1,context).seed,1);
  assert.deepEqual(endingPose('loop',winner,1,context).position,context.launch);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `autolab-mog-a3-motion-v1.js`.

- [ ] **Step 3: Implement the pure motion module**

```js
export const TIMELINE={release:.12,orbit:.34,gradient:.60,pressure:.76,compression:.86};
export const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
export const ease=value=>1-Math.pow(1-clamp(value),3);
export function phaseFor(progress){
  if(progress<TIMELINE.release)return'release';
  if(progress<TIMELINE.orbit)return'orbit';
  if(progress<TIMELINE.gradient)return'gradient';
  if(progress<TIMELINE.pressure)return'pressure';
  if(progress<TIMELINE.compression)return'compression';
  return'ending';
}
export function createExperimentBlueprints(count,seed){
  const random=mulberry32(seed);
  return Array.from({length:count},(_,index)=>({
    id:`EXP-${String(index+1).padStart(4,'0')}`,
    index,
    winner:index===Math.min(137,count-1),
    score:index===Math.min(137,count-1)?1:random(),
    orbit:random(),
    eccentricity:.35+random()*.55,
    spin:.55+random()*1.2,
    u:random()*2-1,
    v:random()*2-1,
    lineage:index%17,
  }));
}
```

```js
const TAU=Math.PI*2;
const mix=(a,b,t)=>a+(b-a)*t;
const mixPose=(a,b,t)=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t)});
function orbitPose(blueprint,scene){
  const local=clamp((scene.progress-TIMELINE.release)/(TIMELINE.orbit-TIMELINE.release));
  const clock=scene.reducedMotion?local*180:scene.time*.018;
  const angle=blueprint.orbit*TAU+clock*blueprint.spin+local*TAU*.65;
  const radius=.16+blueprint.orbit*.84;
  return{x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*blueprint.eccentricity,z:Math.sin(angle*2+blueprint.lineage)*.08};
}
export function poseForExperiment(blueprint,scene){
  let pose=orbitPose(blueprint,scene);
  const compression=ease((scene.progress-TIMELINE.pressure)/(TIMELINE.compression-TIMELINE.pressure));
  const helix=blueprint.lineage*.12+compression*TAU*1.5;
  const radius=Math.hypot(pose.x,pose.y)*(1-compression*.95);
  pose={x:Math.cos(helix)*radius,y:Math.sin(helix)*radius,z:pose.z*(1-compression*.94)};
  return{id:blueprint.id,...pose,alpha:1,angle:helix,trail:1-compression,scale:blueprint.winner?1.4:1};
}
export function endingPose(ending,blueprint,local,context){
  const t=ease(local);
  if(ending==='slingshot')return{position:{x:mix(context.origin.x,1.35,t),y:mix(context.origin.y,-.25,t)},tear:ease((local-.15)/.85)};
  if(ending==='rebirth')return{position:context.result,seed:t,pulse:ease((local-.35)/.65)};
  if(ending==='loop')return{position:{x:mix(context.origin.x,context.launch.x,t),y:mix(context.origin.y,context.launch.y,t)},reattach:ease((local-.55)/.45),scan:ease((local-.72)/.28)};
  throw new TypeError(`Unknown ending: ${ending}`);
}
```

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`

Expected: 4 tests pass, 0 fail.

- [ ] **Step 5: Commit the motion contract**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs
git commit -m "feat: add deterministic A3 motion contract"
```

### Task 2: Shared Page Shell and Variant Routing

**Files:**
- Track unchanged dependency: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-slingshot-v1.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-rebirth-v1.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-loop-v1.html`
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

**Interfaces:**
- Each page provides `<body data-ending="slingshot|rebirth|loop">`.
- Each page provides the same IDs: `#topbar`, `#brand-caret`, `#research-run`, `#research-canvas`, `#flight-object`, `#event-horizon`, `#result-card`.
- Each page loads `autolab-mog-core-v1.css`, `autolab-mog-a3-core-v1.css`, and `autolab-mog-a3-scene-v1.js` as a module.

- [ ] **Step 1: Write the static contract test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const variants=['slingshot','rebirth','loop'];
for(const variant of variants){
  test(`${variant} page exposes the shared scene contract`,async()=>{
    const html=await readFile(new URL(`./autolab-mog-a3-${variant}-v1.html`,import.meta.url),'utf8');
    assert.match(html,new RegExp(`data-ending="${variant}"`));
    for(const id of ['topbar','brand-caret','research-run','research-canvas','flight-object','event-horizon','result-card'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/autolab-mog-a3-scene-v1\.js/);
  });
}
```

- [ ] **Step 2: Run the static test and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

Expected: 3 failures because the variant HTML files do not exist.

- [ ] **Step 3: Build the shared shell and responsive scene styling**

Each HTML page contains the same Autolab hero, terminal, floating island navigation, handoff section, six-stage sticky research scene, metrics strip, and result card. Only these values differ:

```html
<body data-ending="slingshot">
<title>Autolab — Singularity Slingshot</title>
<div class="variant-label">A3-S / IMPLODE → SLINGSHOT</div>
<script type="module" src="autolab-mog-a3-scene-v1.js"></script>
```

The scene stylesheet defines paper, dark, and light-return layers; flight object; event horizon; accretion rings; story transitions; semantic legend; metrics; gradient labels; compression reticle; ending-specific `.ending-slingshot`, `.ending-rebirth`, and `.ending-loop` layers; responsive breakpoints; and reduced-motion fallbacks.

```css
.research-run{position:relative;height:680vh;background:var(--paper)}
.research-sticky{position:sticky;top:0;height:100svh;overflow:hidden;isolation:isolate;background:var(--paper)}
.dark-field,.light-return{position:absolute;inset:0;will-change:clip-path}
.dark-field{z-index:1;background:#070a08;clip-path:circle(0 at var(--origin-x) var(--origin-y))}
.light-return{z-index:4;background:var(--paper);clip-path:circle(0 at var(--result-x) var(--result-y))}
#research-canvas{position:absolute;z-index:5;inset:0;width:100%;height:100%}
.flight-object{position:fixed;z-index:102;opacity:0;pointer-events:none;will-change:left,top,transform,width,height}
.result-card{position:absolute;z-index:14;opacity:0;pointer-events:none;will-change:opacity,transform,clip-path}
@media(max-width:900px){.research-run{height:720vh}.result-card{left:16px;right:16px;width:auto}.comparison-links{display:none}}
@media(prefers-reduced-motion:reduce){.autonomous-trail{display:none!important}}
```

- [ ] **Step 4: Run the static test and verify GREEN**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

Expected: 3 tests pass, 0 fail.

- [ ] **Step 5: Commit the shared shell**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-core-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-*-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: add A3 triptych page shells"
```

### Task 3: Caret Handoff, Singularity Physics, and Pointer Gravity

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css`

**Interfaces:**
- Imports Task 1 functions from `./autolab-mog-a3-motion-v1.js`.
- Produces read-only `window.__AUTOLAB_A3__.getState()` returning `{ending,progress,phase,particleCount,populationKey,dark,caretDetached,pointerMode,endingProgress,reducedMotion}`.

- [ ] **Step 1: Run the page before the controller exists and verify RED**

Run the companion URL for Slingshot, then evaluate:

```js
() => {
  if(!window.__AUTOLAB_A3__) throw new Error('A3 scene controller missing');
  return window.__AUTOLAB_A3__.getState();
}
```

Expected: FAIL with `A3 scene controller missing` and a module 404.

- [ ] **Step 2: Implement exact caret handoff and orbit rendering**

```js
import {TIMELINE,clamp,ease,phaseFor,createExperimentBlueprints,poseForExperiment,endingPose} from './autolab-mog-a3-motion-v1.js';
const ending=document.body.dataset.ending;
const count=innerWidth<760?112:240;
const experiments=createExperimentBlueprints(count,0xA3701AB);
const populationKey=experiments.map(item=>item.id).join('|');
function getState(){return {ending,progress,phase:phaseFor(progress),particleCount:experiments.length,populationKey,dark,caretDetached,pointerMode,endingProgress,reducedMotion};}
window.__AUTOLAB_A3__=Object.freeze({getState});
```

Use the real `#brand-caret` bounds for the launch origin. Do not show `#flight-object` before `run.getBoundingClientRect().top<=0`. Morph it from the exact caret dimensions into an experiment arrow. At impact, expand the event horizon, circular dark wipe, accretion rings, and seeded orbiting experiment population. Draw lineage trails and use pointer distance to apply a bounded secondary-well perturbation only during `orbit`.

- [ ] **Step 3: Verify launch and orbit states in Chrome**

At pre-entry, `.flight-object` opacity must equal `0` and caret opacity must equal `1`. At progress `.07`, flight opacity must exceed `.9` and caret opacity must equal `0`. At progress `.20`, state must report `phase:'orbit'`, `dark:true`, `particleCount:240`, and `pointerMode:'gravity'` on desktop.

- [ ] **Step 4: Commit singularity physics**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css
git commit -m "feat: add A3 singularity physics"
```

### Task 4: Continuous Orbit-to-Gradient Transformation and Compression

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`

**Interfaces:**
- `poseForExperiment` keeps the same blueprint `id` while interpolating normalized orbit and surface poses.
- Browser state `populationKey` remains byte-for-byte identical at progress `.20`, `.47`, `.68`, and `.81`.

- [ ] **Step 1: Add a failing continuity test**

```js
test('gradient phase resolves experiment identities onto the surface without a boundary jump',()=>{
  const experiment=createExperimentBlueprints(240,0xA3701AB)[40];
  const before=poseForExperiment(experiment,{progress:.3399,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false});
  const after=poseForExperiment(experiment,{progress:.3401,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false});
  assert.ok(Math.hypot(after.x-before.x,after.y-before.y,after.z-before.z)<.02);
  const surface=poseForExperiment(experiment,{progress:.60,time:0,pointer:{x:0,y:0,strength:0},reducedMotion:false});
  assert.ok(Math.abs(surface.x-experiment.u)<.001);
  assert.ok(Math.abs(surface.y-experiment.v)<.001);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`

Expected: the surface-coordinate assertions fail before surface interpolation exists.

- [ ] **Step 3: Implement surface extrusion, camera choreography, evaluation pressure, and grid folding**

Map orbit phase angle and radius into stable surface coordinates. Blend orbit pose into projected Pareto surface pose from `.34` to `.60` with:

```js
function surfacePose(blueprint,scene){
  const peak=Math.exp(-((blueprint.u-.28)**2*2.55+(blueprint.v+.12)**2*1.85));
  const ridge=.19*Math.sin((blueprint.u+blueprint.v)*2.4)+.2*blueprint.u-.1*blueprint.v;
  const dx=blueprint.u-scene.pointer.x,dy=blueprint.v-scene.pointer.y;
  const bend=scene.pointer.strength*Math.exp(-(dx*dx+dy*dy)*4.5)*.45;
  return{x:blueprint.u,y:blueprint.v,z:.14+peak*.82+ridge+blueprint.score*.08+bend};
}
const extrude=ease((scene.progress-TIMELINE.orbit)/(TIMELINE.gradient-TIMELINE.orbit));
let pose=mixPose(orbitPose(blueprint,scene),surfacePose(blueprint,scene),extrude);
const pressure=ease((scene.progress-TIMELINE.gradient)/(TIMELINE.pressure-TIMELINE.gradient));
const dominated=blueprint.winner?0:(1-blueprint.score)*pressure;
pose.z-=dominated*.28;
```

Draw the surface from the same blueprint coordinates, including mint ridge and axis labels. Enable pointer curvature only for `gradient` and `pressure`. During pressure, reduce dominated alpha and altitude according to `score`. During compression, shrink projected grid vertices toward the event horizon while adding helical rotation proportional to blueprint lineage.

- [ ] **Step 4: Run unit and browser continuity checks**

Run the Node motion tests; expect 5 pass, 0 fail. In Chrome, capture `populationKey` at `.20`, `.47`, `.68`, and `.81`; expect one identical value. Confirm phases `orbit`, `gradient`, `pressure`, and `compression` and pointer modes `gravity`, `surface`, `surface`, and `none`.

- [ ] **Step 5: Commit the continuous transformation**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js
git commit -m "feat: transform singularity into research gradient"
```

### Task 5: Slingshot, Rebirth, and Loop Endings

**Files:**
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css`

**Interfaces:**
- `endingPose` returns ending-specific values without changing shared compression inputs.
- Slingshot adds `{tear:number,position:{x,y}}`; Rebirth adds `{seed:number,pulse:number}`; Loop adds `{position:{x,y},scan:number,reattach:number}`.

- [ ] **Step 1: Expand failing ending assertions**

```js
test('slingshot escapes, rebirth germinates, and loop reattaches',()=>{
  const context={origin:{x:0,y:0},launch:{x:-.8,y:-.9},result:{x:.2,y:.1}};
  const winner={id:'EXP-0137',winner:true,score:1};
  const slingshot=endingPose('slingshot',winner,1,context);
  const rebirth=endingPose('rebirth',winner,1,context);
  const loop=endingPose('loop',winner,1,context);
  assert.ok(slingshot.tear>.99&&slingshot.position.x>1);
  assert.ok(rebirth.seed>.99&&rebirth.pulse>.99);
  assert.ok(loop.reattach>.99&&loop.scan>.99);
  assert.deepEqual(loop.position,context.launch);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs`

Expected: ending assertions fail because the final DOM values are absent.

- [ ] **Step 3: Implement each ending after shared progress `.86`**

Slingshot: move the winner along a tangent, draw three afterimages, open an angled light tear, and expand the diff from the winner’s impact point.

Rebirth: hold one still frame, collapse to a mint seed, emit concentric pulse rings, restore paper radially, and unfold the diff from a small central square.

Loop: send the winner along the inverse launch curve, reattach it at the wordmark, flash one caret blink, sweep a mint scan line down the viewport, and dock the diff below the island.

All variants restore readable light-theme copy and result-card styling before the light layer reaches them. Slingshot and Rebirth restore the logo caret after the diff reaches `.98`; Loop restores it through `reattach`.

- [ ] **Step 4: Verify the three ending contracts in Chrome**

At `.93`, expect each page to report its own `ending`, `phase:'ending'`, and `endingProgress>.4`. At `.995`, expect Slingshot `tear>.99`, Rebirth `seed>.99`, and Loop `reattach>.99`. Each final diff must have opacity `1`, fit inside the viewport, and expose winner ID, primary metric, delta, runtime, lineage, diff, and approval state.

- [ ] **Step 5: Commit all three endings**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-motion-v1.test.mjs .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css
git commit -m "feat: add three A3 collapse endings"
```

### Task 6: Chooser, Responsive QA, Reduced Motion, and Final Verification

**Files:**
- Create: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-three-collapses-chooser-v1.html`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css`
- Modify: `.superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js`

**Interfaces:**
- Chooser links directly to all three A3 HTML files and the preserved A2 file.
- Reduced-motion state is visible through `getState().reducedMotion`.

- [ ] **Step 1: Write a failing chooser contract test**

Add to `autolab-mog-a3-static-v1.test.mjs`:

```js
test('chooser links all endings and the preserved A2',async()=>{
  const html=await readFile(new URL('./autolab-mog-a3-three-collapses-chooser-v1.html',import.meta.url),'utf8');
  for(const name of ['slingshot','rebirth','loop'])assert.match(html,new RegExp(`autolab-mog-a3-${name}-v1\\.html`));
  assert.match(html,/autolab-mog-a-impact-frontier-v2\.html/);
});
```

- [ ] **Step 2: Run static tests and verify RED**

Run: `node --test .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs`

Expected: chooser test fails because the chooser does not exist.

- [ ] **Step 3: Build the chooser and reduced-motion behavior**

Create a paper-and-ink chooser with three ending descriptions and direct links. On mobile, hide comparison pills, keep the island clear of story text, cap the canvas at 112 vectors, and fit the result card within 16px side gutters. In reduced motion, freeze orbit time, disable trails and autonomous pointer response, and interpolate particles directly to scroll-derived poses.

```html
<main class="triptych-chooser">
  <a href="autolab-mog-a3-slingshot-v1.html"><b>A3-S</b><span>Implode → Slingshot</span></a>
  <a href="autolab-mog-a3-rebirth-v1.html"><b>A3-R</b><span>Implode → Rebirth</span></a>
  <a href="autolab-mog-a3-loop-v1.html"><b>A3-L</b><span>Implode → Loop</span></a>
  <a href="autolab-mog-a-impact-frontier-v2.html"><b>A2</b><span>Preserved backup</span></a>
</main>
```

```js
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const count=innerWidth<760?112:240;
const sceneTime=reducedMotion?progress*1000:performance.now();
pointer.strength=reducedMotion?0:pointer.strength;
if(reducedMotion){particle.trail.length=0;particle.x=target.x;particle.y=target.y;}
```

- [ ] **Step 4: Run complete automated verification**

Run Node tests and expect all tests to pass. Run JavaScript syntax checks for the scene and motion modules. Verify HTTP 200 for the chooser, three A3 pages, shared CSS/JS/module, A1, A2, and B. Assert no iframe and no missing resource.

- [ ] **Step 5: Run desktop and mobile browser matrices**

For each ending at 1440×913 and 390×844, test pre-entry plus progress `.07`, `.20`, `.47`, `.68`, `.81`, `.93`, and `.995`. Assert the approved phase, identical `populationKey`, intended pointer mode, zero horizontal overflow, no navigation overlap, readable intermediate theme, final diff containment, and no console warning/error. Capture and visually inspect orbit, gradient, compression, and ending screenshots for each variant.

- [ ] **Step 6: Commit the chooser and QA refinements**

```bash
git add .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-three-collapses-chooser-v1.html .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-core-v1.css .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-scene-v1.js .superpowers/brainstorm/39694-1784238160/content/autolab-mog-a3-static-v1.test.mjs
git commit -m "feat: finish A3 triptych comparison"
```
