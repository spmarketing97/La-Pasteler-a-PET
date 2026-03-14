// Sound Effects Logic
function playSound() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Smooth modern pop sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

// Countdown Timer logic connected to localStorage for sync between pages
function initCountdown() {
    const ONE_MINUTE = 60 * 1000;
    const TOTAL_TIME = 15 * ONE_MINUTE; 
    
    let endTime = localStorage.getItem('pet_pasteleria_countdown');
    const now = new Date().getTime();
    
    if (!endTime || now > endTime) {
      endTime = now + TOTAL_TIME;
      localStorage.setItem('pet_pasteleria_countdown', endTime);
    }
    
    const timerElements = document.querySelectorAll('.nav-timer');
    
    const updateTimer = setInterval(() => {
      const currentTime = new Date().getTime();
      const distance = endTime - currentTime;
      
      if (distance < 0) {
        clearInterval(updateTimer);
        timerElements.forEach(el => el.innerHTML = "00:00");
        return;
      }
      
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timerElements.forEach(el => el.innerHTML = display);
    }, 1000);
}

// Intercept form submission to add sound and smooth transition
function initForm() {
    const form = document.getElementById('lead-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            playSound();
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<span>PROCESANDO... 🐾</span>';
            btn.style.opacity = '0.8';
            
            // Simulating API call before redirect
            setTimeout(() => {
                window.location.href = form.getAttribute('action');
            }, 600); 
        });
    }

    // Bind sound to other buttons
    document.querySelectorAll('.btn-sound').forEach(btn => {
        btn.addEventListener('click', () => {
             playSound();
        })
    });
}

// Animations with GSAP
function initAnimations() {
    // Only run if GSAP is loaded
    if(typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Fade Up Elements
        gsap.utils.toArray('[data-scroll="fade-up"]').forEach(element => {
            const delay = element.getAttribute('data-delay') || 0;
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: parseFloat(delay),
                ease: "power3.out"
            });
        });

        // Parallax Images
        gsap.utils.toArray('.parallax-img').forEach(img => {
            gsap.to(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                y: 30,
                ease: "none"
            });
        });
        
        // Staggered reveals for cards
        const staggerContainers = document.querySelectorAll('.stagger-container');
        staggerContainers.forEach(container => {
            const children = container.querySelectorAll('.stagger-item');
            gsap.from(children, {
                scrollTrigger: {
                    trigger: container,
                    start: "top 80%"
                },
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 0.6,
                ease: "back.out(1.7)"
            });
        });
    }
}

// Init everything
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initForm();
    initAnimations();
});
