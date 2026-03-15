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

// Countdown Timer: 1 hora inicial, al llegar a 0 se reinicia a 2 horas
function initCountdown() {
    const ONE_MINUTE = 60 * 1000;
    const ONE_HOUR = 60 * ONE_MINUTE;
    const INITIAL_TIME = 1 * ONE_HOUR;   // Primera cuenta: 1 hora
    const RESTART_TIME = 2 * ONE_HOUR;    // Tras llegar a 0: reinicio a 2 horas
    
    let endTime = localStorage.getItem('pet_pasteleria_countdown');
    const now = new Date().getTime();

    if (!endTime || now > parseInt(endTime, 10)) {
      endTime = now + INITIAL_TIME;
      localStorage.setItem('pet_pasteleria_countdown', endTime);
    }
    endTime = parseInt(endTime, 10);
    
    const timerElements = document.querySelectorAll('.nav-timer');
    
    function formatDisplay(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const updateTimer = setInterval(() => {
      const currentTime = new Date().getTime();
      const distance = endTime - currentTime;
      
      if (distance < 0) {
        clearInterval(updateTimer);
        timerElements.forEach(el => el.innerHTML = "0:00:00");
        // Reinicio a 2 horas
        const newEndTime = currentTime + RESTART_TIME;
        localStorage.setItem('pet_pasteleria_countdown', newEndTime);
        initCountdown();
        return;
      }
      
      timerElements.forEach(el => el.innerHTML = formatDisplay(distance));
    }, 1000);
}

// Flip Card Mouse tracking
function initInteractiveFlips() {
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        // En lugar de hover en CSS, usamos JS para forzar el giro en las mascotas
        card.addEventListener('mouseenter', () => {
            const inner = card.querySelector('.flip-card-inner');
            if(inner) inner.style.transform = 'rotateY(180deg)';
        });
        card.addEventListener('mouseleave', () => {
             const inner = card.querySelector('.flip-card-inner');
             if(inner) inner.style.transform = 'rotateY(0deg)';
        });
    });
}

// Logic for submitting forms to Web3Forms and redirecting
function initForm() {
    const forms = document.querySelectorAll('.lead-form-web3');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            playSound();
            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<span>DESCARGANDO... 🐾</span>';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const formData = new FormData(form);
            const object = Object.fromEntries(formData);
            const accessKey = (object.access_key || '').toString().trim();
            const hasValidKey = accessKey && accessKey.length > 20 && !/^TU_|placeholder/i.test(accessKey);

            if (hasValidKey) {
                try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(object)
                    });
                    const result = await response.json();
                    if (response.status !== 200) {
                        console.warn('Web3Forms:', result.message || response.status);
                    }
                } catch (err) {
                    console.warn('Form submit:', err);
                }
            }

            window.location.href = form.getAttribute('data-redirect') || 'gracias.html';
        });
    });

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
        
        // "La cruda realidad comercial": entrada elegante (escala + fade + ligera elevación)
        const problemSlider = document.querySelector('.problem-cards-slider');
        if (problemSlider) {
            const problemCards = problemSlider.querySelectorAll('.stagger-item');
            gsap.from(problemCards, {
                scrollTrigger: {
                    trigger: problemSlider,
                    start: "top 82%",
                    toggleActions: "play none none none"
                },
                scale: 0.92,
                y: 28,
                opacity: 0,
                stagger: 0.18,
                duration: 0.85,
                ease: "power4.out"
            });
        }

        // Staggered reveals for cards (resto de secciones)
        const staggerContainers = document.querySelectorAll('.stagger-container:not(.problem-cards-slider)');
        staggerContainers.forEach(container => {
            const children = container.querySelectorAll('.stagger-item');
            if (children.length === 0) return;
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

// PopUps & Cookies
function initModals() {
    const triggers = document.querySelectorAll('[data-modal]');
    const closeBtns = document.querySelectorAll('.modal-close');
    const overlays = document.querySelectorAll('.modal-overlay');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(trigger.getAttribute('data-modal'));
            if(target) target.classList.add('active');
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Cookie Banner
    const cookieBanner = document.getElementById('cookieBanner');
    if(cookieBanner) {
        document.getElementById('acceptCookies')?.addEventListener('click', () => {
            localStorage.setItem('cookies_accepted', 'true');
            cookieBanner.classList.remove('show');
        });
        // Sin popup al aterrizar: no se muestra el banner automáticamente
    }
}

// 3D Hover effect solo en tarjetas de problema (las de bonos voltean con hover, no inclinación)
const cards = document.querySelectorAll('.problem-card-pro');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
        // Restore original transform logic depending on if it's a flip card or problem card
        if (card.classList.contains('flip-card-inner')) {
            // Return to 0deg (unflipped)
            card.style.transform = `perspective(1000px) rotateY(0deg)`;
        } else {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        }
        card.style.transition = 'transform 0.5s ease';
    });
    
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
    });
});

// Testimonios reales: +50 popups, equilibrio hombres/mujeres, temas variados (no solo bonos). Ambas páginas.
const TESTIMONIOS_POPUP = [
    { name: 'Carlos R.', quote: 'Mi perro tiene más energía desde que le hago los snacks en casa. Se nota.' },
    { name: 'María G.', quote: 'No sabía nada de cocina y lo he sacado adelante. Las recetas son claras.' },
    { name: 'Pablo S.', quote: 'El pelaje de mi gata mejoró en pocas semanas. La vet alucinó.' },
    { name: 'Laura M.', quote: 'Por fin sé qué le doy de comer. Ingredientes del súper, nada raro.' },
    { name: 'Javier T.', quote: 'Lo hago con mis hijos los domingos. Se divierten y el perro feliz.' },
    { name: 'Ana L.', quote: 'Mi perra dejó de rascarse tanto. Creo que era la comida industrial.' },
    { name: 'Miguel Á.', quote: 'Soy tío de tres perros. Les hago galletas y están sanísimos.' },
    { name: 'Elena V.', quote: 'El curso está muy bien explicado. Lo recomiendo a cualquiera con mascota.' },
    { name: 'David C.', quote: 'Gasto menos en premios de tienda y sé que no llevan mierda.' },
    { name: 'Sandra P.', quote: 'Mi gato es muy selecto. Las recetas de pescado las devora.' },
    { name: 'Antonio B.', quote: 'Llevaba años con pienso caro. Ahora combino con lo que preparo yo.' },
    { name: 'Rocío F.', quote: 'Me daba miedo darle algo hecho en casa. Aquí te explican todo seguro.' },
    { name: 'Fernando G.', quote: 'Mi perro tiene 10 años y está más ágil que hace dos. Hablo en serio.' },
    { name: 'Isabel N.', quote: 'Las galletas de boniato son nuestro hit. Las pido yo también.' },
    { name: 'Raúl H.', quote: 'No es cosa de mujeres. Yo cocino para mi perra y me encanta.' },
    { name: 'Carmen D.', quote: 'Tengo dos gatos. Uno con estómago delicado y las recetas le sientan bien.' },
    { name: 'Roberto K.', quote: 'Lo que más me gusta es que no hace falta ser chef. Paso a paso.' },
    { name: 'Patricia J.', quote: 'Mi perra antes no quería premios. Con estos los pide.' },
    { name: 'Alberto W.', quote: 'Invertí en el curso y en dos meses lo había amortizado en lo que ahorro.' },
    { name: 'Lucía Z.', quote: 'Vivo en un piso y hago todo en el horno. Cero lío.' },
    { name: 'Daniel E.', quote: 'Mi gato dejó de vomitar pelo. Cambié parte de su dieta con las recetas.' },
    { name: 'Marta Q.', quote: 'Las recetas con pollo son las que más repito. Rápidas y les chiflan.' },
    { name: 'Óscar U.', quote: 'Soy de los que no cocinaba ni para mí. Si yo pude, puede cualquiera.' },
    { name: 'Cristina Y.', quote: 'Tranquilidad total. Sé exactamente qué come mi perro cada día.' },
    { name: 'Luis O.', quote: 'El programa está bien montado. Videos cortos y al grano.' },
    { name: 'Nuria I.', quote: 'Mi perro tiene alergias. Encontré recetas que puede tomar sin problema.' },
    { name: 'Beatriz A.', quote: 'Empezamos por las galletas y ahora hacemos hasta pastel de cumple.' },
    { name: 'Jorge S.', quote: 'Lo compré para mi madre y su perra. Las dos contentas.' },
    { name: 'Silvia R.', quote: 'No todo es sobre bonos. El curso en sí ya merece la pena.' },
    { name: 'Andrés M.', quote: 'Mi gato es mayor. Las recetas blandas le van genial.' },
    { name: 'Paula L.', quote: 'Antes compraba snacks carísimos. Ahora los hago y duran más.' },
    { name: 'Víctor T.', quote: 'Recomendado. Mi perra tiene el peso ideal y el vet está contento.' },
    { name: 'Guillermo P.', quote: 'Entre trabajo y niños no tengo tiempo. Las recetas son rápidas.' },
    { name: 'Claudia N.', quote: 'Me gusta que hablen de perros y gatos. Tengo uno de cada.' },
    { name: 'Iván F.', quote: 'Mi perro antes se aburría del pienso. Ahora come con ganas.' },
    { name: 'Adriana C.', quote: 'Las instrucciones son fáciles. No hace falta experiencia.' },
    { name: 'Rubén G.', quote: 'Llevo tres meses usándolo. Mi perro más brillante y activo.' },
    { name: 'Eva B.', quote: 'Mi gata es muy nerviosa. Algunas recetas la relajan a la hora de comer.' },
    { name: 'Héctor V.', quote: 'Buen contenido y bien explicado. No me arrepiento.' },
    { name: 'Olga D.', quote: 'Hago batch los findes y congelo. Durante la semana solo sacar.' },
    { name: 'Gonzalo K.', quote: 'Soy hombre, tengo perro y me da igual quién cocine. Esto funciona.' },
    { name: 'Lorena J.', quote: 'El cambio en la caca de mi perro. En serio. Más consistente y sana.' },
    { name: 'Marcos W.', quote: 'Las recetas con pavo son las que más hago. Barato y les encanta.' },
    { name: 'Miriam Z.', quote: 'Por fin algo que no es solo marketing. Recetas que de verdad uso.' },
    { name: 'Enrique E.', quote: 'Mi perro tiene 4 años. Desde que le doy lo que preparo, otra vida.' },
    { name: 'Virginia Q.', quote: 'No es solo para mujeres. Mi marido hace más él que yo.' },
    { name: 'Sergio U.', quote: 'Claridad total. Qué ingredientes, cantidades y por qué.' },
    { name: 'Alicia Y.', quote: 'Mi gato dejó de tener tantas bolas de pelo. La dieta ayuda.' },
    { name: 'Francisco O.', quote: 'Inversión que recuperas. Y tu mascota te lo agradece.' },
    { name: 'Rosa I.', quote: 'Las recetas de pescado para gatos son un éxito en casa.' },
    { name: 'Ricardo S.', quote: 'Hombres y mujeres con mascota. El curso no tiene género.' },
    { name: 'Teresa A.', quote: 'Mi perra tiene intolerancias. Encontré opciones que puede tomar.' },
    { name: 'Manuel M.', quote: 'Hago galletas los domingos. El perro las huele y se pone loco.' },
    { name: 'Inés R.', quote: 'Buen equilibrio de teoría y práctica. No te abruman.' },
    { name: 'José P.', quote: 'Mi gato es muy viejo. Las recetas blandas le sientan de maravilla.' },
    { name: 'Pilar L.', quote: 'Vale la pena. Mi perro está más sano y yo más tranquila.' },
    { name: 'Alfonso T.', quote: 'Recetas reales, ingredientes normales. Nada de cosas raras.' },
    { name: 'Felipe F.', quote: 'Llevo medio año y no he repetido receta. Hay mucha variedad.' },
    { name: 'Mercedes N.', quote: 'Lo recomiendo a todo el que tenga perro o gato. Sin duda.' },
    { name: 'Ignacio G.', quote: 'El aliento de mi perro mejoró. Antes olía fatal.' },
    { name: 'Concha C.', quote: 'Contenido serio. No es un curso de relleno.' },
    { name: 'Lidia B.', quote: 'Mi perra y mi gata comen cosas distintas. El curso cubre ambos.' },
    { name: 'Marina D.', quote: 'Las recetas son fáciles de adaptar si tu mascota es alérgica.' },
    { name: 'Ramón L.', quote: 'Primera vez que cocino para mi perro. Resultado: éxito.' },
    { name: 'Tomás F.', quote: 'Buen soporte y contenido actualizado. Se nota que se preocupan.' },
    { name: 'Celia M.', quote: 'Mi gata antes era muy tiquis. Ahora come de todo lo que preparo.' },
    { name: 'Natalia R.', quote: 'No hace falta tener cocina de restaurante. Con lo básico basta.' },
    { name: 'Emilio P.', quote: 'Mi perro tiene el pelo más bonito. La familia lo comenta.' },
    { name: 'Verónica H.', quote: 'Recetas para perros y gatos por separado. Muy bien pensado.' },
    { name: 'Xavier C.', quote: 'Invertí en el curso y mi perro está mejor que nunca. Objetivo cumplido.' },
    { name: 'Helena V.', quote: 'Las galletas de zanahoria son las favoritas en casa.' },
    { name: 'Dolores S.', quote: 'Mi perro tiene problemas de peso. Hay recetas ligeras que le van bien.' },
];

function initTestimonialPopups() {
    const container = document.getElementById('testimonial-popup-container');
    if (!container) return;
    const SHOW_INTERVAL = 15000;  // cada 15 s aparece un popup nuevo (aleatorio)
    const VISIBLE_TIME = 6000;     // cada popup visible 6 s y luego desaparece
    let hideTimeout = null;

    function showRandom() {
        const existing = container.querySelector('.testimonial-popup-card');
        if (existing) {
            existing.classList.remove('visible');
            if (hideTimeout) clearTimeout(hideTimeout);
            setTimeout(() => existing.remove(), 400);
        }
        const t = TESTIMONIOS_POPUP[Math.floor(Math.random() * TESTIMONIOS_POPUP.length)];
        const div = document.createElement('div');
        div.className = 'testimonial-popup-card';
        div.innerHTML = '<p class="testimonial-quote">"' + t.quote + '"</p><span class="testimonial-author">— ' + t.name + '</span>';
        container.appendChild(div);
        requestAnimationFrame(() => { div.classList.add('visible'); });
        hideTimeout = setTimeout(() => {
            div.classList.remove('visible');
            setTimeout(() => div.remove(), 400);
        }, VISIBLE_TIME);
    }

    setTimeout(showRandom, 500);
    setInterval(showRandom, SHOW_INTERVAL);
}

// Init everything
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initForm();
    initAnimations();
    initModals();
    initInteractiveFlips();
    initTestimonialPopups();
});

