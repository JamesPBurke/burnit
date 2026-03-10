/**
 * Burn the Web - Mobile Bookmarklet
 * Irregular back-burn paper effect with glowing edges and ash.
 * Optimized for Android Chrome, including scroll/zoom visual viewport alignment.
 */

(function() {
    'use strict';

    const BurnIt = {
        run() {
            if (window.burnItActive) return;
            window.burnItActive = true;

            const CONFIG = {
                animationDuration: 4800,
                fps: 24,
                maxPatches: 18,
                emberCount: 45,
                patchSpawnMinMs: 90,
                patchSpawnMaxMs: 210,
                filterUpdateMs: 120
            };

            const canvas = document.createElement('canvas');
            canvas.style.cssText = [
                'position:fixed',
                'left:0',
                'top:0',
                'width:100vw',
                'height:100vh',
                'pointer-events:none',
                'z-index:2147483647',
                'contain:strict'
            ].join(';');

            document.documentElement.appendChild(canvas);
            const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

            // Offscreen canvas used as a union burn mask each frame.
            // All patch shapes are drawn here so overlapping patches merge into
            // one solid region. We then use destination-out to punch that region
            // out of the glow layer before drawing ash on top — glows only show
            // at the outer boundary of the combined burn area.
            const offscreen = document.createElement('canvas');
            const offCtx = offscreen.getContext('2d', { alpha: true });

            let viewportWidth = 0;
            let viewportHeight = 0;
            let dpr = 1;
            let rafId = 0;
            let finished = false;

            // --- Audio ---
            // All sound is generated via Web Audio API — no external files.
            // audioCtx / masterGain are null when audio is unavailable.
            let audioCtx = null;
            let masterGain = null;
            let noiseSource = null;
            let lfoNode = null;

            function createNoiseBuffer(duration) {
                const sr = audioCtx.sampleRate;
                const len = Math.ceil(sr * duration);
                const buf = audioCtx.createBuffer(1, len, sr);
                const data = buf.getChannelData(0);
                for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
                return buf;
            }

            function createFireHiss() {
                // Looping white noise shaped into a fire hiss.
                // A 3-second buffer avoids audible looping artifacts.
                const buf = createNoiseBuffer(3.1);
                noiseSource = audioCtx.createBufferSource();
                noiseSource.buffer = buf;
                noiseSource.loop = true;

                // Highpass removes the lowest sub-bass rumble; lowpass cuts
                // harsh digital harshness above ~1 kHz.
                const hp = audioCtx.createBiquadFilter();
                hp.type = 'highpass';
                hp.frequency.value = 200;

                const lp = audioCtx.createBiquadFilter();
                lp.type = 'lowpass';
                lp.frequency.value = 1050;
                lp.Q.value = 1.1;

                const hissGain = audioCtx.createGain();
                hissGain.gain.value = 0.5;

                // Slow LFO gives the fire a natural "breathing" intensity variation.
                lfoNode = audioCtx.createOscillator();
                lfoNode.type = 'sine';
                lfoNode.frequency.value = 0.28;
                const lfoGain = audioCtx.createGain();
                lfoGain.gain.value = 0.13;
                lfoNode.connect(lfoGain);
                lfoGain.connect(hissGain.gain);
                lfoNode.start();

                noiseSource.connect(hp);
                hp.connect(lp);
                lp.connect(hissGain);
                hissGain.connect(masterGain);
                noiseSource.start();
            }

            function scheduleCrackle() {
                if (finished || !audioCtx) return;
                const now = audioCtx.currentTime;
                // Each crackle: a very short noise burst through a resonant bandpass,
                // with an exponential volume decay so it snaps rather than sustains.
                const dur = rand(0.012, 0.07);
                const src = audioCtx.createBufferSource();
                src.buffer = createNoiseBuffer(dur + 0.01);

                const bp = audioCtx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.frequency.value = rand(500, 3500);
                bp.Q.value = rand(1.5, 5);

                const g = audioCtx.createGain();
                g.gain.setValueAtTime(rand(0.3, 1.0), now);
                g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

                src.connect(bp);
                bp.connect(g);
                g.connect(masterGain);
                src.start(now);
                src.stop(now + dur + 0.01);

                setTimeout(scheduleCrackle, rand(55, 370));
            }

            function initAudio() {
                const AC = window.AudioContext || window['webkitAudioContext'];
                if (!AC) return;
                try {
                    audioCtx = new AC();
                    if (audioCtx.state === 'suspended') audioCtx.resume();

                    masterGain = audioCtx.createGain();
                    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
                    // Fade in over ~1.2 s so it doesn't startle.
                    masterGain.gain.linearRampToValueAtTime(0.42, audioCtx.currentTime + 1.2);
                    masterGain.connect(audioCtx.destination);

                    createFireHiss();
                    setTimeout(scheduleCrackle, 180);
                } catch (e) {
                    audioCtx = null;
                }
            }

            function stopAudio() {
                if (!audioCtx) return;
                try {
                    const now = audioCtx.currentTime;
                    if (masterGain) masterGain.gain.linearRampToValueAtTime(0, now + 0.7);
                    const ac = audioCtx;
                    const ns = noiseSource;
                    const lfo = lfoNode;
                    audioCtx = null;
                    setTimeout(function() {
                        try { if (ns) ns.stop(); } catch (e) {}
                        try { if (lfo) lfo.stop(); } catch (e) {}
                        try { ac.close(); } catch (e) {}
                    }, 750);
                } catch (e) {}
            }

            const domTarget = document.body || document.documentElement;
            const rootTarget = document.documentElement;
            const original = {
                transition: domTarget.style.transition,
                filter: domTarget.style.filter,
                opacity: domTarget.style.opacity,
                background: domTarget.style.background,
                htmlBackground: rootTarget.style.background
            };

            domTarget.style.willChange = 'filter,opacity';
            domTarget.style.transition = 'filter 180ms linear, opacity 320ms linear';

            function viewportState() {
                const vv = window.visualViewport;
                if (!vv) {
                    return {
                        left: 0,
                        top: 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                        scale: 1
                    };
                }
                return {
                    left: vv.offsetLeft,
                    top: vv.offsetTop,
                    width: vv.width,
                    height: vv.height,
                    scale: vv.scale || 1
                };
            }

            function resizeCanvas() {
                const vp = viewportState();
                dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
                viewportWidth = Math.max(1, Math.round(vp.width));
                viewportHeight = Math.max(1, Math.round(vp.height));

                canvas.style.left = vp.left + 'px';
                canvas.style.top = vp.top + 'px';
                canvas.style.width = viewportWidth + 'px';
                canvas.style.height = viewportHeight + 'px';
                canvas.width = Math.max(1, Math.round(viewportWidth * dpr));
                canvas.height = Math.max(1, Math.round(viewportHeight * dpr));
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                offscreen.width = canvas.width;
                offscreen.height = canvas.height;
                offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            const patches = [];
            const embers = [];
            let nextSpawnAt = 0;

            function rand(min, max) {
                return Math.random() * (max - min) + min;
            }

            function spawnPatch() {
                if (patches.length >= CONFIG.maxPatches) return;

                const bias = Math.random();
                const y = bias < 0.6
                    ? rand(viewportHeight * 0.35, viewportHeight * 0.95)
                    : rand(viewportHeight * 0.12, viewportHeight * 0.9);

                patches.push({
                    x: rand(0.08 * viewportWidth, 0.92 * viewportWidth),
                    y,
                    radius: rand(8, 18),
                    growth: rand(18, 34),
                    // Three independent phase seeds give each patch a unique organic shape.
                    s1: rand(0, Math.PI * 2),
                    s2: rand(0, Math.PI * 2),
                    s3: rand(0, Math.PI * 2),
                    age: 0,
                    maxRadius: rand(80, 170),
                    edgeHeat: rand(0.75, 1)
                });
            }

            // Trace an irregular blob path around a patch using layered sinusoidal
            // noise in polar coordinates. radiusScale lets us draw a larger version
            // for the glow circle.
            function buildPatchPath(targetCtx, patch, timeSec, radiusScale) {
                const numPts = 24;
                const s1 = patch.s1;
                const s2 = patch.s2;
                const s3 = patch.s3;
                const r = patch.radius * (radiusScale || 1);

                targetCtx.beginPath();
                for (let i = 0; i <= numPts; i++) {
                    const a = (i / numPts) * Math.PI * 2;
                    // Static irregularity — defines the unique shape of this burn patch.
                    const staticN =
                        Math.sin(a * 2 + s1) * 0.18 +
                        Math.sin(a * 3 + s2) * 0.13 +
                        Math.sin(a * 5 + s3) * 0.09 +
                        Math.sin(a * 7 + s1 * 0.8) * 0.05;
                    // Dynamic flicker — animates the burning edge over time.
                    const dynN =
                        Math.sin(a * 4 + timeSec * 2.5 + s2) * 0.045 +
                        Math.sin(a * 9 + timeSec * 3.8 + s3) * 0.022;
                    const pr = r * Math.max(0.4, 1 + staticN + dynN);
                    const px = patch.x + Math.cos(a) * pr;
                    const py = patch.y + Math.sin(a) * pr;
                    if (i === 0) targetCtx.moveTo(px, py);
                    else targetCtx.lineTo(px, py);
                }
                targetCtx.closePath();
            }

            function spawnEmber() {
                if (!patches.length || embers.length >= CONFIG.emberCount) return;
                const patch = patches[(Math.random() * patches.length) | 0];
                const theta = rand(0, Math.PI * 2);
                const ring = patch.radius + rand(-4, 10);
                embers.push({
                    x: patch.x + Math.cos(theta) * ring,
                    y: patch.y + Math.sin(theta) * ring,
                    vx: rand(-10, 10),
                    vy: rand(-24, -8),
                    life: rand(0.45, 0.9),
                    size: rand(1.2, 2.8)
                });
            }

            function updatePatches(dt, nowMs) {
                if (nowMs >= nextSpawnAt) {
                    spawnPatch();
                    nextSpawnAt = nowMs + rand(CONFIG.patchSpawnMinMs, CONFIG.patchSpawnMaxMs);
                }

                for (let i = patches.length - 1; i >= 0; i -= 1) {
                    const patch = patches[i];
                    patch.age += dt;
                    patch.radius += patch.growth * dt;
                    patch.edgeHeat = Math.max(0.35, patch.edgeHeat - dt * 0.05);
                    if (patch.radius > patch.maxRadius) {
                        patch.growth *= 0.965;
                    }
                    if (patch.radius > patch.maxRadius * 1.35) {
                        patches.splice(i, 1);
                    }
                }
            }

            function updateEmbers(dt) {
                if (Math.random() < 0.75) spawnEmber();
                for (let i = embers.length - 1; i >= 0; i -= 1) {
                    const ember = embers[i];
                    ember.x += ember.vx * dt;
                    ember.y += ember.vy * dt;
                    ember.vy += 15 * dt;
                    ember.life -= dt * 1.25;
                    if (ember.life <= 0) {
                        embers.splice(i, 1);
                    }
                }
            }

            function drawEmbers() {
                for (let i = 0; i < embers.length; i += 1) {
                    const ember = embers[i];
                    const alpha = Math.max(0, ember.life);
                    ctx.fillStyle = 'rgba(255,' + Math.floor(rand(120, 200)) + ',40,' + alpha + ')';
                    ctx.beginPath();
                    ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            let lastFilterTick = 0;
            function updateDomProgress(progress, nowMs) {
                if (nowMs - lastFilterTick < CONFIG.filterUpdateMs) return;
                lastFilterTick = nowMs;

                // Keep filter cheap for heavy pages.
                const heat = Math.min(1, progress * 1.3);
                const dark = Math.max(0, (progress - 0.4) / 0.6);
                domTarget.style.filter = 'sepia(' + (0.45 * heat).toFixed(3) + ') saturate(' + (1 + 0.85 * heat).toFixed(3) + ') brightness(' + (1 - 0.45 * dark).toFixed(3) + ')';

                if (progress > 0.58) {
                    const fade = Math.min(1, (progress - 0.58) / 0.42);
                    domTarget.style.opacity = String((1 - fade).toFixed(3));
                }
            }

            let startMs = performance.now();
            let lastMs = startMs;
            const frameBudget = 1000 / CONFIG.fps;

            function frame(nowMs) {
                if (finished) return;
                const elapsed = nowMs - startMs;
                if (elapsed >= CONFIG.animationDuration) {
                    cleanup();
                    return;
                }

                const since = nowMs - lastMs;
                if (since < frameBudget) {
                    rafId = requestAnimationFrame(frame);
                    return;
                }
                const dt = Math.min(0.05, since / 1000);
                lastMs = nowMs;

                const timeSec = elapsed / 1000;

                ctx.clearRect(0, 0, viewportWidth, viewportHeight);

                updatePatches(dt, nowMs);
                updateEmbers(dt);

                // Pass 1: draw all glows as simple radial circles on the main canvas.
                // They will be trimmed to just the outer ring in pass 3.
                for (let i = 0; i < patches.length; i += 1) {
                    const patch = patches[i];
                    const glowR = patch.radius * 1.52;
                    const glow = ctx.createRadialGradient(
                        patch.x, patch.y, patch.radius * 0.55,
                        patch.x, patch.y, glowR
                    );
                    const heat = patch.edgeHeat;
                    glow.addColorStop(0, 'rgba(255,245,160,' + (0.35 * heat) + ')');
                    glow.addColorStop(0.45, 'rgba(255,138,35,' + (0.52 * heat) + ')');
                    glow.addColorStop(0.8, 'rgba(255,68,4,' + (0.36 * heat) + ')');
                    glow.addColorStop(1, 'rgba(255,60,0,0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(patch.x, patch.y, glowR, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Pass 2: build a solid union of all patch shapes on the offscreen canvas.
                // Because each shape is filled independently into the same bitmap, the
                // regions simply merge — no overlap artifacts.
                offCtx.clearRect(0, 0, viewportWidth, viewportHeight);
                offCtx.fillStyle = '#000';
                for (let i = 0; i < patches.length; i += 1) {
                    buildPatchPath(offCtx, patches[i], timeSec, 1.0);
                    offCtx.fill();
                }

                // Pass 3: punch the union burn area out of the glow layer so that glows
                // only survive at the outer edge. Where two patches have merged, their
                // shared interior is also punched out, making them join cleanly.
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.globalCompositeOperation = 'destination-out';
                ctx.drawImage(offscreen, 0, 0);
                ctx.restore();

                // Pass 4: draw ash texture over the burn areas using the same irregular
                // paths, so ash and glow edges align exactly.
                for (let i = 0; i < patches.length; i += 1) {
                    const patch = patches[i];
                    const ash = ctx.createRadialGradient(
                        patch.x, patch.y, 0,
                        patch.x, patch.y, patch.radius
                    );
                    ash.addColorStop(0, 'rgba(8,8,8,0.97)');
                    ash.addColorStop(0.55, 'rgba(14,11,8,0.94)');
                    ash.addColorStop(1, 'rgba(5,5,5,0.89)');
                    ctx.fillStyle = ash;
                    buildPatchPath(ctx, patch, timeSec, 1.0);
                    ctx.fill();
                }

                drawEmbers();

                // Subtle soot haze over everything.
                const haze = Math.min(0.75, elapsed / CONFIG.animationDuration * 0.8);
                ctx.fillStyle = 'rgba(0,0,0,' + haze.toFixed(3) + ')';
                ctx.fillRect(0, 0, viewportWidth, viewportHeight);

                updateDomProgress(elapsed / CONFIG.animationDuration, nowMs);
                rafId = requestAnimationFrame(frame);
            }

            function cleanup() {
                finished = true;
                if (rafId) cancelAnimationFrame(rafId);
                stopAudio();

                window.removeEventListener('resize', resizeCanvas, { passive: true });
                window.removeEventListener('scroll', resizeCanvas, { passive: true });
                if (window.visualViewport) {
                    window.visualViewport.removeEventListener('resize', resizeCanvas, { passive: true });
                    window.visualViewport.removeEventListener('scroll', resizeCanvas, { passive: true });
                }

                if (canvas.parentNode) canvas.parentNode.removeChild(canvas);

                domTarget.style.filter = 'none';
                domTarget.style.opacity = '0';
                domTarget.style.transition = original.transition;
                domTarget.style.willChange = '';
                rootTarget.style.background = '#000';
                domTarget.style.background = '#000';

                window.burnItActive = false;
            }

            resizeCanvas();
            initAudio();
            window.addEventListener('resize', resizeCanvas, { passive: true });
            window.addEventListener('scroll', resizeCanvas, { passive: true });
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', resizeCanvas, { passive: true });
                window.visualViewport.addEventListener('scroll', resizeCanvas, { passive: true });
            }

            nextSpawnAt = startMs;
            rafId = requestAnimationFrame(frame);

            return {
                stop: cleanup,
                restore() {
                    domTarget.style.transition = original.transition;
                    domTarget.style.filter = original.filter;
                    domTarget.style.opacity = original.opacity;
                    domTarget.style.background = original.background;
                    rootTarget.style.background = original.htmlBackground;
                }
            };
        }
    };

    window.BurnIt = BurnIt;

    if (!window.__BURNIT_NO_AUTORUN__) {
        BurnIt.run();
    }
})();
