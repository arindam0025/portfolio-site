/* JAVASCRIPT LOGIC & ANIMATIONS
   PROJECT: ARINDAM NAG PORTFOLIO
   LIBRARIES: Lenis (Smooth Scroll), GSAP + ScrollTrigger (Reveals/Pinning), Three.js (Hero Mesh)
----------------------------------------------------------------------------------------- */

// Fix #6: Single shared market price across all live widgets
const MARKET = { price: 1248.50 };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Typewriter Loading Sequence
    initLoader();
});

// Easing function
function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}

/* =========================================================================
   1. LOADER SYSTEM
   ========================================================================= */
function initLoader() {
    const loaderText = document.getElementById('loader-text');
    const loader = document.getElementById('loader');
    const introStr = "> initializing portfolio...";
    let i = 0;
    
    function typeLoader() {
        if (i < introStr.length) {
            loaderText.textContent += introStr.charAt(i);
            i++;
            setTimeout(typeLoader, 50);
        } else {
            // Loading text complete, fade out loader
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    document.body.classList.remove('loading');
                    // Initialize all components after loader is gone
                    startPortfolio();
                }, 500);
            }, 500);
        }
    }
    
    // Start typing loading prompt
    setTimeout(typeLoader, 200);
}

/* =========================================================================
   PORTFOLIO ENGINE INITIALIZATION
   ========================================================================= */
function startPortfolio() {
    // Check if touch device
    const isTouch = window.matchMedia('(hover: none)').matches;

    // Initialize subsystems
    initSmoothScroll();
    initThreeJS();
    initGSAPAnimations();
    initTypewriter();
    initOrderBook();
    initTradeTape();
    initLiveCandlestick();
    initTopTickerBar();
    initDataRain();
    initCardFlips();
    
    if (!isTouch) {
        initCustomCursor();
        initMagnetEffect();
    }
    
    initEasterEgg();
    initIdleTerminal();
}

/* =========================================================================
   2. SMOOTH SCROLL (Lenis) & Navigation pill logic
   ========================================================================= */
let lenis;
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Nav pill visual updates on scroll
    const navPill = document.querySelector('.nav-pill');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    lenis.on('scroll', (e) => {
        // Toggle compact navigation style
        if (window.scrollY > 50) {
            navPill.classList.add('scrolled');
        } else {
            navPill.classList.remove('scrolled');
        }

        // Active link tracking
        let currentSectionId = 'hero';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === currentSectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });

    // Anchor link smooth scrolling
    document.querySelectorAll('.nav-link, .scroll-indicator, #cta-explore').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetID = anchor.getAttribute('href');
            const targetSection = document.querySelector(targetID);
            if (targetSection) {
                lenis.scrollTo(targetSection, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
}

/* =========================================================================
   3. THREE.JS HERO WIREFRAME (Icosahedron & Vertex Particles)
   ========================================================================= */
function initThreeJS() {
    // Fix #11: Skip Three.js on mobile — saves ~180kb parse time
    if (window.innerWidth < 768) return;
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Wireframe Mesh (Gold Accent Color #C9A84C)
    const geometry = new THREE.IcosahedronGeometry(1.8, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0xC9A84C,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);

    // Vertex Particles (Cream Color #F5F0E8)
    const pointsGeom = new THREE.IcosahedronGeometry(1.8, 1);
    const pointsMat = new THREE.PointsMaterial({
        color: 0xF5F0E8,
        size: 0.075,
        transparent: true,
        opacity: 0.6
    });
    const vertexParticles = new THREE.Points(pointsGeom, pointsMat);
    scene.add(vertexParticles);

    // Secondary subtle, outer shell rotating oppositely
    const outerGeom = new THREE.IcosahedronGeometry(2.3, 0);
    const outerMat = new THREE.MeshBasicMaterial({
        color: 0xF5F0E8,
        wireframe: true,
        transparent: true,
        opacity: 0.03
    });
    const outerMesh = new THREE.Mesh(outerGeom, outerMat);
    scene.add(outerMesh);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Spin rates
        mainMesh.rotation.y += 0.0018;
        mainMesh.rotation.x += 0.0012;

        vertexParticles.rotation.y += 0.0018;
        vertexParticles.rotation.x += 0.0012;

        outerMesh.rotation.y -= 0.0008;
        outerMesh.rotation.z += 0.0005;

        renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    });
}

/* =========================================================================
   4. GSAP SCROLLTRIGGER REVEAL ENGINE
   ========================================================================= */
function initGSAPAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ACT I Reveal (Name Draw / Candlestick Plot effect)
    gsap.fromTo('#hero-name-reveal', 
        { opacity: 0, y: 30, letterSpacing: "-0.05em" },
        { opacity: 1, y: 0, letterSpacing: "-0.03em", duration: 1.5, ease: "power4.out", delay: 0.2 }
    );
    gsap.fromTo('.hero-meta-label, .hero-manifesto-sub, .hero-cta-group', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.2, delay: 0.5 }
    );

    // ACT II: Bio Narrative Paragraphs Fade/Slide
    gsap.utils.toArray('.narrative-paragraph').forEach((para, index) => {
        gsap.fromTo(para, 
            { opacity: 0, y: 40 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1, 
                ease: "power3.out", 
                scrollTrigger: {
                    trigger: para,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // ACT II: Bloomberg Equity Curve Path Draw
    const equityPath = document.querySelector('.equity-path');
    if (equityPath) {
        const pathLength = equityPath.getTotalLength();
        gsap.set(equityPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        gsap.to(equityPath, {
            strokeDashoffset: 0,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.equity-curve-wrapper',
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
        
        // Staggered nodes fade
        gsap.fromTo('.equity-node, .chart-label', 
            { opacity: 0, scale: 0 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                stagger: 0.15, 
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: '.equity-curve-wrapper',
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            }
        );
    }

    // ACT III: Timeline Line Drawing
    const timelineProgress = document.querySelector('.timeline-progress-line');
    if (timelineProgress) {
        gsap.fromTo(timelineProgress, 
            { strokeDashoffset: 1000, strokeDasharray: 1000 },
            {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: '.timeline-wrapper',
                    start: "top 65%",
                    end: "bottom 70%",
                    scrub: true
                }
            }
        );
    }

    // ACT III: Experience Cards Reveal & Numbers Scramble Countup
    gsap.utils.toArray('.timeline-node').forEach((node) => {
        // Card Slide
        gsap.fromTo(node.querySelector('.timeline-card'),
            { opacity: 0, x: node.id === 'node-oup' ? -50 : 50 },
            {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: node,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            }
        );

        // Dot Scale
        gsap.fromTo(node.querySelector('.node-dot'),
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(2)",
                scrollTrigger: {
                    trigger: node,
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            }
        );

        // Scramble Numbers on enter
        const numbers = node.querySelectorAll('.scramble-num');
        ScrollTrigger.create({
            trigger: node,
            start: "top 70%",
            onEnter: () => {
                numbers.forEach(num => scrambleNumber(num));
            }
        });
    });

    // ACT IV: Horizontal Scroll Pinning (Desktop only)
    const scrollContainer = document.querySelector('.projects-horizontal-scroll');
    const cardsWrapper = document.querySelector('.projects-cards-container');
    
    if (scrollContainer && cardsWrapper && window.innerWidth > 768) {
        const getScrollAmount = () => {
            let wrapperWidth = cardsWrapper.offsetWidth;
            let windowWidth = window.innerWidth;
            return -(wrapperWidth - (windowWidth * 0.72)); // Fix #3: 0.72 for 7 cards
        };

        gsap.to(cardsWrapper, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: '.projects-pinned-section',
                start: "top top",
                end: () => "+=" + cardsWrapper.offsetWidth,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }

    // ACT V: Publications Staggered Fade Up
    gsap.fromTo('.pub-entry-wrapper', 
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.publications-list',
                start: "top 75%",
                toggleActions: "play none none none"
            }
        }
    );
}

/* =========================================================================
   5. NUMBER SCRAMBLE EFFECT
   ========================================================================= */
function scrambleNumber(element) {
    if (element.classList.contains('scrambled')) return; // Trigger once
    element.classList.add('scrambled');

    const targetVal = parseFloat(element.getAttribute('data-val'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    
    let currentVal = 0;
    const duration = 1200; // Total duration in ms
    const startTime = performance.now();
    const isInt = Number.isInteger(targetVal);

    function update(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // First 35% of time: Scramble random characters
        if (progress < 0.35) {
            let scrambleText = '';
            const length = targetVal.toString().length;
            const chars = '0123456789%#&▲▼';
            for (let j = 0; j < length; j++) {
                scrambleText += chars[Math.floor(Math.random() * chars.length)];
            }
            element.textContent = prefix + scrambleText + suffix;
        } else {
            // Remaining 65% of time: Count up smoothly
            const countProgress = (progress - 0.35) / 0.65;
            const easeVal = easeOutQuad(countProgress);
            const val = easeVal * targetVal;
            
            element.textContent = prefix + (isInt ? Math.floor(val) : val.toFixed(1)) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Anchor strictly on target value at completion
            element.textContent = prefix + targetVal + suffix;
        }
    }
    requestAnimationFrame(update);
}

/* =========================================================================
   6. QUANT TYPEWRITER (Hero subtitle rotation)
   ========================================================================= */
function initTypewriter() {
    const typewriterText = document.getElementById('typewriter-text');
    if (!typewriterText) return;

    const phrases = [
        "FP&A Analyst",
        "Quant Engineer",
        "CFA Candidate",
        "Options Pricing Nerd"
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let delay = 100;

    function tick() {
        const currentPhrase = phrases[phraseIdx];
        
        if (isDeleting) {
            typewriterText.textContent = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
            delay = 40; // delete faster
        } else {
            typewriterText.textContent = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
            delay = 90; // typing speed
        }

        // Logic check
        if (!isDeleting && charIdx === currentPhrase.length) {
            // Full phrase printed, wait
            isDeleting = true;
            delay = 2000; // Pause at end of phrase
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            delay = 400; // Pause before typing next phrase
        }

        setTimeout(tick, delay);
    }
    
    // Start typing cycles
    setTimeout(tick, 1000);
}

/* =========================================================================
   7. LIVE ORDER BOOK SIMULATOR
   ========================================================================= */
function initOrderBook() {
    const bidList = document.getElementById('bid-list');
    const askList = document.getElementById('ask-list');
    if (!bidList || !askList) return;

    const bidRows = [];
    const askRows = [];
    const maxRows = 10;

    // Seed rows
    for (let j = 0; j < maxRows; j++) {
        bidRows.push(createMockRow('bid', MARKET.price - (j * 0.15) - 0.05));
        askRows.push(createMockRow('ask', MARKET.price + (j * 0.15) + 0.05));
    }

    renderRows();

    // Loop changes — this is the ONLY place that updates MARKET.price
    setInterval(() => {
        // Fix #4/#6: Clamp shared price to prevent drift
        MARKET.price = Math.max(1200, Math.min(1300, MARKET.price + (Math.random() - 0.5) * 0.15));
        
        // Randomly update one bid and one ask row
        const bidIdx = Math.floor(Math.random() * maxRows);
        const askIdx = Math.floor(Math.random() * maxRows);

        const oldBidPrice = bidRows[bidIdx].price;
        const newBidPrice = MARKET.price - (bidIdx * 0.15) - 0.05 + (Math.random() - 0.5) * 0.04;
        bidRows[bidIdx].price = newBidPrice;
        bidRows[bidIdx].qty = Math.floor(100 + Math.random() * 4900);
        bidRows[bidIdx].trend = newBidPrice > oldBidPrice ? 'up' : (newBidPrice < oldBidPrice ? 'down' : '');

        const oldAskPrice = askRows[askIdx].price;
        const newAskPrice = MARKET.price + (askIdx * 0.15) + 0.05 + (Math.random() - 0.5) * 0.04;
        askRows[askIdx].price = newAskPrice;
        askRows[askIdx].qty = Math.floor(100 + Math.random() * 4900);
        askRows[askIdx].trend = newAskPrice > oldAskPrice ? 'up' : (newAskPrice < oldAskPrice ? 'down' : '');

        renderRows();
    }, 400);

    function createMockRow(type, price) {
        return {
            price: price,
            qty: Math.floor(100 + Math.random() * 4900),
            trend: ''
        };
    }

    function renderRows() {
        bidList.innerHTML = '';
        askList.innerHTML = '';

        // Calculate maxQty to scale depth bars
        const maxQty = Math.max(...bidRows.map(r => r.qty), ...askRows.map(r => r.qty)) || 1;

        bidRows.forEach(row => {
            const div = document.createElement('div');
            div.className = 'ob-row';
            
            const priceClass = row.trend === 'up' ? 'price-up' : (row.trend === 'down' ? 'price-down' : '');
            row.trend = ''; // Clear trend
            
            div.innerHTML = `
                <div class="ob-depth-bar" style="width: ${(row.qty / maxQty) * 100}%"></div>
                <span class="ob-price ${priceClass}">${row.price.toFixed(2)}</span>
                <span class="ob-qty">[${row.qty.toLocaleString()}]</span>
            `;
            bidList.appendChild(div);
        });

        askRows.forEach(row => {
            const div = document.createElement('div');
            div.className = 'ob-row';
            
            const priceClass = row.trend === 'up' ? 'price-up' : (row.trend === 'down' ? 'price-down' : '');
            row.trend = ''; // Clear trend
            
            div.innerHTML = `
                <div class="ob-depth-bar" style="width: ${(row.qty / maxQty) * 100}%"></div>
                <span class="ob-qty">[${row.qty.toLocaleString()}]</span>
                <span class="ob-price ${priceClass}">${row.price.toFixed(2)}</span>
            `;
            askList.appendChild(div);
        });

        // Center Spread Indicator calculations
        const bestBid = bidRows[0].price;
        const bestAsk = askRows[0].price;
        const spread = Math.abs(bestAsk - bestBid);
        const midPrice = (bestBid + bestAsk) / 2;

        const spreadEl = document.getElementById('ob-spread');
        const midEl = document.getElementById('ob-mid');
        if (spreadEl && midEl) {
            spreadEl.textContent = spread.toFixed(2);
            midEl.textContent = `₹${midPrice.toFixed(2)}`;

            if (spread < 0.15) {
                spreadEl.classList.add('tight');
            } else {
                spreadEl.classList.remove('tight');
            }
        }
    }
}

/* =========================================================================
   7.1 TIME & SALES TAPE SIMULATOR
   ========================================================================= */
function initTradeTape() {
    const tape = document.getElementById('trade-tape');
    if (!tape) return;

    setInterval(() => {
        const isBuy = Math.random() > 0.5;
        // Fix #4/#6: Read from shared MARKET.price with jitter
        const tapePrice = MARKET.price + (Math.random() - 0.5) * 0.20;
        const qty = Math.floor(50 + Math.random() * 500);
        const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

        const row = document.createElement('div');
        row.className = `tape-row ${isBuy ? 'tape-buy' : 'tape-sell'}`;
        row.innerHTML = `
            <span class="tape-time">${time}</span>
            <span class="tape-price">₹${tapePrice.toFixed(2)}</span>
            <span class="tape-side">[${isBuy ? 'BUY' : 'SELL'}]</span>
            <span class="tape-qty">${qty}</span>
        `;

        tape.prepend(row);

        // Flash animation
        row.style.opacity = '0';
        requestAnimationFrame(() => {
            row.style.transition = 'opacity 0.3s';
            row.style.opacity = '1';
        });

        // Keep max 15 rows
        while (tape.children.length > 15) {
            tape.removeChild(tape.lastChild);
        }
    }, 600);
}

/* =========================================================================
   7.2 LIVE CANDLESTICK CHART (Canvas API)
   ========================================================================= */
function initLiveCandlestick() {
    const canvas = document.getElementById('live-candle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let candles = [];

    // Seed 20 candles from shared price
    for (let i = 0; i < 20; i++) {
        candles.push(generateCandle(MARKET.price));
    }

    function generateCandle(open) {
        const move = (Math.random() - 0.48) * 3;
        // Fix #4: Clamp candle close to realistic range
        const close = Math.max(1200, Math.min(1300, open + move));
        const high = Math.max(open, close) + Math.random() * 1.5;
        const low = Math.min(open, close) - Math.random() * 1.5;
        return { open, close, high, low };
    }

    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const allPrices = candles.flatMap(c => [c.high, c.low]);
        const minP = Math.min(...allPrices);
        const maxP = Math.max(...allPrices);
        const range = maxP - minP || 1;

        const candleW = W / candles.length;
        const bodyW = candleW * 0.5;

        candles.forEach((c, i) => {
            const x = i * candleW + candleW / 2;
            const yHigh = H - ((c.high - minP) / range) * H;
            const yLow = H - ((c.low - minP) / range) * H;
            const yOpen = H - ((c.open - minP) / range) * H;
            const yClose = H - ((c.close - minP) / range) * H;

            const isBull = c.close >= c.open;
            const color = isBull ? '#4FAD6E' : '#E05A47';

            // Wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, yHigh);
            ctx.lineTo(x, yLow);
            ctx.stroke();

            // Body
            ctx.fillStyle = color;
            ctx.fillRect(
                x - bodyW / 2,
                Math.min(yOpen, yClose),
                bodyW,
                Math.abs(yOpen - yClose) || 1
            );
        });
    }

    draw();

    // New candle every 2 seconds — reads from shared MARKET.price
    setInterval(() => {
        candles.push(generateCandle(MARKET.price));
        if (candles.length > 20) candles.shift();
        draw();
    }, 2000);
}

/* =========================================================================
   7.3 BLOOMBERG TOP TICKER BAR SIMULATOR
   ========================================================================= */
function initTopTickerBar() {
    const track = document.getElementById('top-ticker-track');
    if (!track) return;

    const tickers = [
        // Indian Markets
        { name: 'NAG.NSE', val: 1248.50, change: 4.2, up: true },
        { name: 'NIFTY 50', val: 21453.20, change: -0.3, up: false },
        { name: 'SENSEX', val: 72814.55, change: 0.45, up: true },
        { name: 'RELIANCE', val: 2918.60, change: 1.8, up: true },
        { name: 'TCS.NSE', val: 3942.15, change: -0.6, up: false },
        { name: 'INFY.NSE', val: 1487.30, change: 0.9, up: true },
        { name: 'HDFCBANK', val: 1612.40, change: -0.2, up: false },
        // US Markets
        { name: 'AAPL', val: 189.84, change: 1.1, up: true },
        { name: 'MSFT', val: 431.52, change: 0.7, up: true },
        { name: 'TSLA', val: 178.36, change: -2.1, up: false },
        { name: 'AMZN', val: 186.49, change: 1.3, up: true },
        { name: 'NVDA', val: 1148.25, change: 3.4, up: true },
        { name: 'GOOGL', val: 176.88, change: -0.4, up: false },
        // FX Pairs
        { name: 'USD/INR', val: 83.42, change: 0.1, up: true },
        { name: 'EUR/USD', val: 1.0845, change: -0.15, up: false },
    ];

    function renderTickers() {
        track.innerHTML = '';
        // Render the list TWICE for seamless infinite loop (CSS scrolls -50%)
        for (let pass = 0; pass < 2; pass++) {
            tickers.forEach((t, idx) => {
                const div = document.createElement('div');
                div.className = 'ticker-item';
                
                let valStr;
                if (t.val > 10000) {
                    valStr = t.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                } else {
                    valStr = t.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
                }
                let changeSign = t.up ? '\u25b2' : '\u25bc';
                let changeColor = t.up ? '#4FAD6E' : '#E05A47';
                
                let trendClass = '';
                if (t.trend === 'up') trendClass = 'price-up';
                else if (t.trend === 'down') trendClass = 'price-down';
                t.trend = '';

                div.innerHTML = `
                    <span class="ticker-name">${t.name}</span>
                    <span class="ticker-val ${trendClass}" style="color: ${changeColor}">${valStr}</span>
                    <span class="ticker-change" style="color: ${changeColor}">${changeSign}${Math.abs(t.change).toFixed(2)}%</span>
                `;
                track.appendChild(div);

                // Add separator dot between items
                if (idx < tickers.length - 1 || pass === 0) {
                    const sep = document.createElement('span');
                    sep.className = 'ticker-sep';
                    sep.textContent = '\u00b7';
                    track.appendChild(sep);
                }
            });
        }
    }

    renderTickers();

    // Randomly update values every 800ms
    setInterval(() => {
        const idx = Math.floor(Math.random() * tickers.length);
        const t = tickers[idx];
        const oldVal = t.val;
        
        // Minor random walk
        const percentChange = (Math.random() - 0.5) * 0.002;
        t.val += t.val * percentChange;
        
        // Keep change matching sign
        t.trend = t.val > oldVal ? 'up' : 'down';
        t.up = t.val > oldVal ? true : (t.val < oldVal ? false : t.up);
        
        // Randomize the percentage change figure slightly
        t.change = (t.up ? 1 : -1) * (0.05 + Math.random() * 4.5);

        renderTickers();
    }, 800);
}

/* =========================================================================
   8. FINANCIAL DATA RAIN (Matrix columns)
   ========================================================================= */
function initDataRain() {
    const rainContainer = document.getElementById('data-rain-container');
    if (!rainContainer) return;

    const chars = ['▲ 1.2%', '▼ 0.8%', 'AAPL', 'NIFTY', 'DCF', 'LBO', 'CFA', 'NAG.NSE', 'INR', 'USD', '₹', '$', 'FACTOR', 'ALPHA', 'BETA'];
    const maxRainElements = 25;
    let activeElements = 0;

    function createRainDrop() {
        if (activeElements >= maxRainElements) return;

        const span = document.createElement('span');
        span.className = 'rain-char';
        span.textContent = chars[Math.floor(Math.random() * chars.length)];
        
        // Random positioning
        span.style.left = Math.random() * 95 + '%';
        
        // Random speed & delay
        const duration = 5 + Math.random() * 6;
        span.style.animationDuration = duration + 's';
        
        // Scale opacity
        span.style.opacity = (0.2 + Math.random() * 0.8).toString();

        rainContainer.appendChild(span);
        activeElements++;

        // Cleanup
        setTimeout(() => {
            span.remove();
            activeElements--;
        }, duration * 1000);
    }

    // Continually generate drops
    setInterval(createRainDrop, 350);
}

/* =========================================================================
   9. CUSTOM MOUSE CURSOR
   ========================================================================= */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    const label = cursor.querySelector('.cursor-label');
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Lerp translation loop
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.16;
        cursorY += (mouseY - cursorY) * 0.16;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover modifiers binding
    document.querySelectorAll('.hover-magnet, a, button, .project-card-wrapper').forEach(item => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
            
            // Set custom label based on element context
            if (item.classList.contains('project-card-wrapper')) {
                label.textContent = "FLIP";
            } else if (item.classList.contains('cmd-link')) {
                label.textContent = "OPEN";
            } else if (item.id === 'cta-explore' || item.classList.contains('btn-terminal')) {
                label.textContent = "EXEC";
            } else {
                label.textContent = "VIEW";
            }
        });

        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
            label.textContent = "";
        });
    });
}

/* =========================================================================
   10. MAGNETIC LINK PULL EFFECT
   ========================================================================= */
function initMagnetEffect() {
    document.querySelectorAll('.hover-magnet').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);
            
            // Subtle pull constraint (max 8px)
            gsap.to(element, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });
    });
}

/* =========================================================================
   11. EASTER EGG & KEY KEYBOARD LISTENER (AAPL / NIFTY)
   ========================================================================= */
const easterTerminal = document.getElementById('easter-terminal');
const termOutput = document.getElementById('terminal-body-output');
const closeBtn = document.getElementById('terminal-close-btn');

function initEasterEgg() {
    let typedBuffer = '';
    let easterCooldown = false; // Fix #9: Prevent double-fire

    window.addEventListener('keydown', (e) => {
        // Store keystroke
        typedBuffer += e.key.toUpperCase();
        if (typedBuffer.length > 10) {
            typedBuffer = typedBuffer.substring(typedBuffer.length - 10);
        }

        // Validate targets with cooldown guard
        if ((typedBuffer.includes('AAPL') || typedBuffer.includes('NIFTY')) && !easterCooldown) {
            easterCooldown = true;
            showEasterTerminal();
            typedBuffer = ''; // Reset
            setTimeout(() => { easterCooldown = false; }, 5000);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', hideEasterTerminal);
    }
}

function showEasterTerminal() {
    if (!easterTerminal) return;
    easterTerminal.classList.remove('hidden');
    termOutput.innerHTML = ''; // Reset

    const printLines = [
        "> CONNECTING TO FINANCIAL CORE PROTOCOL...",
        "> STATUS: SECURE CONNECTION ESTABLISHED.",
        "> TARGET TICKER RECORD: <span class='terminal-gold'>ARINDAM NAG INDUSTRIES (NAG.NSE)</span>",
        "--------------------------------------------------",
        "LAST PRICE : <span class='terminal-green'>₹1,248.50  (▲ 4.2%)</span>",
        "MARKET CAP : ₹6,242.50 Cr",
        "SECTOR     : FP&A & QUANT ENGINEERING SERVICE",
        "--------------------------------------------------",
        "> MATCHING SYSTEM CAPABILITIES:",
        "[+] QUANT ENGINE   : VALIDATED (C++ / PYTHON / NUMPY)",
        "[+] FP&A MODULATOR : OPERATIONAL (COSTS REDUCED ₹5CR)",
        "[+] CFA METRICS    : AUDITED VALID (CANDIDATE)",
        "--------------------------------------------------",
        "> RECRUITING CHANNEL STATUS: <span class='terminal-green'>ACTIVE & OPEN</span>",
        "> TYPE 'CLOSE' ON CONSOLE OR PRESS KEY TO DISMISS."
    ];

    let lineIdx = 0;
    
    function printNextLine() {
        if (lineIdx < printLines.length) {
            const p = document.createElement('div');
            p.className = 'terminal-line';
            p.innerHTML = printLines[lineIdx];
            termOutput.appendChild(p);
            
            // Scroll body to bottom
            termOutput.scrollTop = termOutput.scrollHeight;
            lineIdx++;
            setTimeout(printNextLine, 150);
        }
    }
    
    printNextLine();
}

function hideEasterTerminal() {
    if (easterTerminal) {
        easterTerminal.classList.add('hidden');
    }
}

/* =========================================================================
   12. IDLE RECRUITER WIDGET
   ========================================================================= */
function initIdleTerminal() {
    let idleTimer;
    
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        
        // Set new 8 seconds idle timeout
        idleTimer = setTimeout(() => {
            // Trigger if easter terminal is not already open
            if (easterTerminal && easterTerminal.classList.contains('hidden')) {
                showIdlePrompt();
            }
        }, 8000);
    }

    // Listeners for activity
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);
    
    resetIdleTimer(); // Initial call
}

function showIdlePrompt() {
    if (!easterTerminal) return;
    easterTerminal.classList.remove('hidden');
    termOutput.innerHTML = ''; // Reset

    const printLines = [
        "> SYSTEM STATUS: MONITORING USER INACTIVITY...",
        "> STILL ANALYZING THE PORTFOLIO DATA?",
        "--------------------------------------------------",
        "> NAME: <span class='terminal-gold'>Arindam Nag</span>",
        "> ROLES: FP&A Professional & Quant Engineer",
        "> AVAILABILITY: Strategic Roles & Technical Interviews",
        "> INBOX: <span class='terminal-green'>nagarindam25@gmail.com</span>",
        "--------------------------------------------------"
    ];

    let lineIdx = 0;
    
    function printNextLine() {
        if (lineIdx < printLines.length) {
            const p = document.createElement('div');
            p.className = 'terminal-line';
            p.innerHTML = printLines[lineIdx];
            termOutput.appendChild(p);
            
            termOutput.scrollTop = termOutput.scrollHeight;
            lineIdx++;
            setTimeout(printNextLine, 120);
        } else {
            // Auto dismiss after 6 seconds
            setTimeout(() => {
                hideEasterTerminal();
            }, 6000);
        }
    }

    printNextLine();
}

/* =========================================================================
   13. CARD FLIP INTERACTIVITY (Click & Tap toggles)
   ========================================================================= */
function initCardFlips() {
    document.querySelectorAll('.project-card-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            // Prevent flipping if clicking a button link
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            const card = wrapper.querySelector('.project-card');
            if (card) {
                // If flipping this card, unflip all others first
                document.querySelectorAll('.project-card').forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('flipped');
                    }
                });
                card.classList.toggle('flipped');
            }
        });
    });
}

