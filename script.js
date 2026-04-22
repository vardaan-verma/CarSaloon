'use strict';

/* ──────────────────────────────────────────────
   Booking Popup (global, called from HTML)
────────────────────────────────────────────── */
window.closePopup = function () {
    document.getElementById('bookingPopup').style.display = 'none';
};

/* ──────────────────────────────────────────────
   Branch data — single source of truth
────────────────────────────────────────────── */
const BRANCH_DATA = {
    dhamtari: {
        address: '<i class="fas fa-map-marker-alt"></i> <strong>Address:</strong><br>Beside Akash Ganga Colony, Rudri Road, Dhamtari, CG',
        phone:   '<i class="fas fa-phone"></i> <strong>Phone:</strong><br><a href="tel:9617205555">9617205555</a> / <a href="tel:9993923000">9993923000</a>',
        mapSrc:  'https://www.google.com/maps?q=20.6925308,81.5478162&z=17&output=embed',
        justdial: 'https://www.justdial.com/Dhamtari/Car-Saloon-Beside-Akashganga-Colony-Opposite-Amaltas-Puram-Colony-Dhamtari-I-Ward/9999P7722-7722-190912194757-B8M9_BZDET'
    },
    kanker: {
        address: '<i class="fas fa-map-marker-alt"></i> <strong>Address:</strong><br>Gyani dhaba chowk, dudhawa road, near Durga mandir, Kanker, Chhattisgarh 494334',
        phone:   '<i class="fas fa-phone"></i> <strong>Phone:</strong><br><a href="tel:8461905555">84619 05555</a>',
        mapSrc:  'https://www.google.com/maps?q=CAR+SALOON+KANKER&output=embed',
        justdial: 'https://www.justdial.com/Kanker/Car-Saloon-Kanker-Kodabhat-Near-Durga-Mandir-Bardebhata-Kanker-Road/9999P7868-7868-250221095508-P8J3_BZDET'
    },
    bilaspur: {
        address: '<i class="fas fa-map-marker-alt"></i> <strong>Address:</strong><br>Beside S.B.I.S.M.E, Vyapar Vihar Road, Bilaspur, Chhattisgarh 495001',
        phone:   '<i class="fas fa-phone"></i> <strong>Phone:</strong><br><a href="tel:1234567890">1234567890</a>',
        mapSrc:  'https://www.google.com/maps?q=22.1064259,82.1647232&z=17&output=embed',
        justdial: 'https://www.justdial.com/Bilaspur-Chhattisgarh/Car-Saloon-Vyapar-Vihar-Road/9999P7752-7752-181124163744-X1J3_BZDET'
    }
};

const BRANCHES = Object.keys(BRANCH_DATA);

/* ──────────────────────────────────────────────
   Branch switcher
────────────────────────────────────────────── */
window.switchBranch = function (branch) {
    // Toggle review panels
    BRANCHES.forEach(b => {
        const panel = document.getElementById('reviews-' + b);
        if (panel) panel.style.display = b === branch ? 'block' : 'none';
    });

    // Toggle active state on all branch selector buttons (both review + contact)
    BRANCHES.forEach(b => {
        ['rev-btn-', 'contact-btn-'].forEach(prefix => {
            const btn = document.getElementById(prefix + b);
            if (btn) btn.classList.toggle('active', b === branch);
        });
    });

    // Update contact details
    const data = BRANCH_DATA[branch];
    const addrEl     = document.getElementById('contact-address');
    const phoneEl    = document.getElementById('contact-phone');
    const jdLink     = document.getElementById('contact-justdial-link');
    const mapFrame   = document.getElementById('mapFrame');

    if (addrEl)   addrEl.innerHTML  = data.address;
    if (phoneEl)  phoneEl.innerHTML = data.phone;
    if (jdLink)   jdLink.href       = data.justdial;
    if (mapFrame) mapFrame.src      = data.mapSrc;
};

/* ──────────────────────────────────────────────
   Reviews slider (per-branch offset)
────────────────────────────────────────────── */
const reviewOffsets = { dhamtari: 0, kanker: 0, bilaspur: 0 };

window.slideReviews = function (branch, dir) {
    const track = document.getElementById('track-' + branch);
    if (!track) return;
    const cards   = track.querySelectorAll('.review-card');
    const visible = window.innerWidth <= 600 ? 1 : window.innerWidth <= 992 ? 2 : 3;
    const max     = Math.max(0, cards.length - visible);
    reviewOffsets[branch] = Math.min(max, Math.max(0, reviewOffsets[branch] + dir));
    const cardWidth = cards[0].offsetWidth;
    track.style.transform = `translateX(-${reviewOffsets[branch] * (cardWidth + 30)}px)`;
};

window.addEventListener('resize', () => {
    BRANCHES.forEach(b => {
        reviewOffsets[b] = 0;
        const track = document.getElementById('track-' + b);
        if (track) track.style.transform = 'translateX(0)';
    });
});

/* ──────────────────────────────────────────────
   Carousel helper — generic 3D coverflow
────────────────────────────────────────────── */
function makeCarousel(container, cards, { spreadDesktop = 400, spreadMobile = 220, autoplayMs = 3500 } = {}) {
    let current = 0;
    let timer;

    function render() {
        const half = Math.floor(cards.length / 2);
        const isMobile = window.innerWidth < 768;

        cards.forEach((card, i) => {
            let diff = i - current;
            if (diff > half)  diff -= cards.length;
            if (diff < -half) diff += cards.length;

            const spread = isMobile ? spreadMobile : spreadDesktop;
            const scale   = 1 - Math.abs(diff) * 0.15;
            const zIndex  = 20 - Math.abs(diff);
            const opacity = Math.abs(diff) > 2 ? 0 : 1 - Math.abs(diff) * 0.3;

            card.style.transform = `translateX(${diff * spread}px) scale(${scale})`;
            card.style.zIndex    = zIndex;
            card.style.opacity   = opacity;
            card.classList.toggle('active-slide', diff === 0);
        });
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            current = (current + 1) % cards.length;
            render();
        }, autoplayMs);
    }

    function stopTimer() { clearInterval(timer); }

    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);

    // Touch swipe
    let startX = 0;
    container.addEventListener('touchstart', e => { stopTimer(); startX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend', e => {
        const dx = startX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) {
            current = dx > 0
                ? (current + 1) % cards.length
                : (current - 1 + cards.length) % cards.length;
            render();
        }
        startTimer();
    }, { passive: true });

    return { render, startTimer, stopTimer, getCurrent: () => current, setCurrent: (v) => { current = v; } };
}

/* ──────────────────────────────────────────────
   DOMContentLoaded
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Booking Form ── */
    const bookingForm = document.getElementById('car-service-form');
    if (bookingForm) {
        const submitBtn       = bookingForm.querySelector('.submit-btn');
        const brandSelect     = document.getElementById('carBrandSelect');
        const otherBrandGroup = document.getElementById('otherBrandGroup');
        const otherBrandInput = document.getElementById('otherBrandInput');

        const FORM_ID       = '1FAIpQLSdkJsQxencJNdT4qzuNmdG6mlWrsrBL11DqU_q5zwLGWNt3Iw';
        const googleFormUrl = `https://docs.google.com/forms/u/0/d/e/${FORM_ID}/formResponse`;

        brandSelect.addEventListener('change', function () {
            const show = this.value === 'Other';
            otherBrandGroup.style.display = show ? 'block' : 'none';
            otherBrandInput.required      = show;
        });

        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitBtn.textContent = 'Processing…';
            submitBtn.disabled    = true;

            const finalBrand = this.car_brand.value === 'Other' ? this.car_brand_other.value : this.car_brand.value;

            const params = {
                user_name:    this.user_name.value,
                user_email:   this.user_email.value,
                user_phone:   this.user_phone.value,
                service_type: this.service_type.value,
                car_brand:    finalBrand,
                car_model:    this.car_model.value,
                service_date: this.service_date.value,
                message:      this.message.value || 'No extra requirements provided.'
            };

            // Google Form backup (no-cors)
            const gfd = new FormData();
            gfd.append('entry.1378675246', params.user_name);
            gfd.append('entry.902874580',  params.user_email);
            gfd.append('entry.1192564498', params.user_phone);
            gfd.append('entry.1800244039', params.service_type);
            gfd.append('entry.1775344095', params.car_brand);
            gfd.append('entry.2074342323', params.car_model);
            gfd.append('entry.748221579',  params.service_date);
            gfd.append('entry.1020267720', params.message);

            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', params)
                .then(() => {
                    fetch(googleFormUrl, { method: 'POST', mode: 'no-cors', body: gfd });
                    document.getElementById('bookingPopup').style.display = 'flex';
                    bookingForm.reset();
                    otherBrandGroup.style.display = 'none';
                    otherBrandInput.required      = false;
                    setTimeout(window.closePopup, 3500);
                })
                .catch(() => {
                    alert('Oops! Submission failed. Please try again or call us directly.');
                })
                .finally(() => {
                    submitBtn.textContent = 'Confirm Booking';
                    submitBtn.disabled    = false;
                });
        });
    }

    /* ── Work Carousel ── */
    const workContainer = document.querySelector('.work-carousel-container');
    const workCards     = [...document.querySelectorAll('.work-card')];

    if (workContainer && workCards.length) {
        const wc = makeCarousel(workContainer, workCards, { spreadDesktop: 400, spreadMobile: 220, autoplayMs: 3500 });

        function stopAllVideos() {
            workCards.forEach(card => {
                const v = card.querySelector('video');
                if (v) { v.pause(); v.currentTime = 0; }
            });
        }

        function renderAndPlayVideo() {
            wc.render();
            stopAllVideos();
            clearInterval(/* timer handled inside wc */ undefined);

            const activeCard  = workCards[wc.getCurrent()];
            const video       = activeCard.querySelector('video');

            if (video) {
                video.muted = true;
                video.play().catch(() => wc.startTimer());
                video.onended = () => {
                    wc.setCurrent((wc.getCurrent() + 1) % workCards.length);
                    renderAndPlayVideo();
                };
            } else {
                wc.startTimer();
            }
        }

        window.centerWorkCard = function (el) {
            const idx = workCards.indexOf(el);
            if (idx > -1 && idx !== wc.getCurrent()) {
                wc.setCurrent(idx);
                renderAndPlayVideo();
            }
        };

        setTimeout(renderAndPlayVideo, 100);
    }

    /* ── Services Carousel ── */
    const servicesContainer = document.querySelector('.services-carousel-container');
    const serviceCards      = [...document.querySelectorAll('.services-carousel-container .service-card')];

    if (servicesContainer && serviceCards.length) {
        const sc = makeCarousel(servicesContainer, serviceCards, { spreadDesktop: 220, spreadMobile: 160, autoplayMs: 4000 });

        window.centerCard = function (el) {
            const idx = serviceCards.indexOf(el);
            if (idx > -1) {
                sc.setCurrent(idx);
                sc.render();
                sc.stopTimer();
                setTimeout(sc.startTimer, 4000);
            }
        };

        setTimeout(() => { sc.render(); sc.startTimer(); }, 100);
    }

    /* ── Mobile Navigation ── */
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    if (menuIcon && navLinks) {
        menuIcon.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuIcon.querySelector('i');
            icon.classList.toggle('fa-bars',  !navLinks.classList.contains('active'));
            icon.classList.toggle('fa-times', navLinks.classList.contains('active'));
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuIcon.querySelector('i');
                icon.className = 'fas fa-bars';
            });
        });
    }

    /* ── Counter Animation ── */
    document.querySelectorAll('.counter').forEach(counter => {
        const target   = +counter.dataset.target;
        const duration = 3000;
        const stepTime = 20;
        const steps    = duration / stepTime;
        const inc      = target / steps;
        let count      = 0;
        let started    = false;

        const tick = () => {
            count = Math.min(count + inc, target);
            counter.textContent = Math.ceil(count).toLocaleString();
            if (count < target) setTimeout(tick, stepTime);
        };

        new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting && !started) {
                started = true;
                tick();
                obs.disconnect();
            }
        }, { threshold: 0.5 }).observe(counter);
    });

    /* ── Scroll Reveal (IntersectionObserver) ── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-text, .reveal-item, .heading-fill').forEach(el => {
        revealObserver.observe(el);
    });

    /* ── Hero auto-activate ── */
    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('active');
    }, 200);
});