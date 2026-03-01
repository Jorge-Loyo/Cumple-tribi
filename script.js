document.addEventListener('DOMContentLoaded', () => {
    const giftElement = document.getElementById('gift-element');
    const messageContainer = document.getElementById('message-container');
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');

    // ============================================
    // Canvas & Resize Handling
    // ============================================
    let width, height;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        // Adjust for high DPI displays for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    // ============================================
    // Confetti Particle System
    // ============================================
    const confettiParticles = [];
    const colors = [
        '#fbbf24', // Amber 400
        '#f59e0b', // Amber 500
        '#e11d48', // Rose 600
        '#8b5cf6', // Violet 500
        '#3b82f6', // Blue 500
        '#10b981'  // Emerald 500
    ];

    class Confetti {
        constructor(x, y) {
            // Start roughly at the gift's position or screen center
            this.x = x || width / 2;
            this.y = y || height / 2 + 100;

            // Random properties
            this.size = Math.random() * 12 + 6;
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // Explosion physics
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 22 + 8; // Burst speed

            this.vx = Math.cos(angle) * velocity;
            // Negative vy means upwards! Add extra boost upwards
            this.vy = Math.sin(angle) * velocity - 15;

            this.gravity = 0.5; // Controls how fast they fall
            this.drag = 0.96;   // Air resistance (slows down horizontal spread)

            // Rotation physics
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 15 - 7.5;

            this.opacity = 1;
            this.isCircle = Math.random() > 0.5; // Mix of squares and circles
        }

        update() {
            // Apply physics
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;

            this.x += this.vx;
            this.y += this.vy;

            this.rotation += this.rotationSpeed;

            // Fade out when reaching bottom of screen
            if (this.y > height - 50) {
                this.opacity -= 0.015;
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            if (this.isCircle) {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }

            ctx.restore();
        }
    }


    // ============================================
    // Animation Controller
    // ============================================
    let isAnimatingConfetti = false;

    function burstConfetti() {
        // Create 180 particles for a rich burst
        for (let i = 0; i < 180; i++) {
            confettiParticles.push(new Confetti(width / 2, height / 2 + 50));
        }

        if (!isAnimatingConfetti) {
            isAnimatingConfetti = true;
            animateConfetti();
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, width, height);

        let stillAlive = false;

        // Loop backwards to allow safe removal (optional, but good practice)
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.update();
            p.draw(ctx);

            if (p.opacity > 0) {
                stillAlive = true;
            } else {
                // Remove dead particle
                confettiParticles.splice(i, 1);
            }
        }

        if (stillAlive && confettiParticles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            isAnimatingConfetti = false;
        }
    }


    // ============================================
    // Interaction Logic
    // ============================================
    let isOpened = false;
    const clickText = document.getElementById('click-text');

    giftElement.addEventListener('click', () => {
        if (isOpened) return;
        isOpened = true;

        // Trigger CSS animations
        giftElement.classList.add('opened');
        if (clickText) clickText.classList.add('fade-out');

        // Timing magic: Wait slightly for the box to fly off before showing the message
        setTimeout(() => {
            messageContainer.classList.add('show');

            // Fire primary confetti burst
            burstConfetti();

            // Fire secondary cascading bursts
            setTimeout(burstConfetti, 500);
            setTimeout(burstConfetti, 1200);
            setTimeout(burstConfetti, 2000); // Grand finale

        }, 500);
    });

    // ============================================
    // Lightbox / Image Expansion Logic
    // ============================================
    const giftItems = document.querySelectorAll('.gift-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // Open lightbox when clicking on a gift item
    giftItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find the image inside the clicked gift item
            const imgEl = item.querySelector('.gift-image');
            if (imgEl) {
                lightboxImg.src = imgEl.src;
                lightbox.classList.add('active');
            }
        });
    });

    // Close lightbox functions
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        // Optional: clear src after animation finishes to avoid ghost images next time
        setTimeout(() => {
            lightboxImg.src = '';
        }, 400);
    };

    lightboxClose.addEventListener('click', closeLightbox);

    // Close lightbox if clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

});
