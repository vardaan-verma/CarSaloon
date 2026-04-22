window.closePopup = function() {
    document.getElementById('bookingPopup').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('car-service-form');
    const submitBtn = bookingForm.querySelector('.submit-btn');

    // Google Form Configuration
    const FORM_ID = "1FAIpQLSdkJsQxencJNdT4qzuNmdG6mlWrsrBL11DqU_q5zwLGWNt3Iw";
    const googleFormUrl = `https://docs.google.com/forms/u/0/d/e/${FORM_ID}/formResponse`;
    
    // Show/Hide Other Brand Input logic
    const brandSelect = document.getElementById('carBrandSelect');
    const otherBrandGroup = document.getElementById('otherBrandGroup');
    const otherBrandInput = document.getElementById('otherBrandInput');

    brandSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherBrandGroup.style.display = 'block';
            otherBrandInput.required = true;
        } else {
            otherBrandGroup.style.display = 'none';
            otherBrandInput.required = false;
        }
    });

    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        // 1. Prepare Data for EmailJS and Google Form
        const finalBrand = this.car_brand.value === 'Other' ? this.car_brand_other.value : this.car_brand.value;
        
        const templateParams = {
            user_name: this.user_name.value,
            user_email: this.user_email.value,
            user_phone: this.user_phone.value,
            service_type: this.service_type.value,
            car_brand: finalBrand,
            car_model: this.car_model.value,
            service_date: this.service_date.value,
            message: this.message.value || "No extra requirements provided."
        };

        // 2. Prepare Google Form Data (Optional backup)
        const googleFormData = new FormData();
        googleFormData.append('entry.1378675246', templateParams.user_name);
        googleFormData.append('entry.902874580', templateParams.user_email);
        googleFormData.append('entry.1192564498', templateParams.user_phone);
        googleFormData.append('entry.1800244039', templateParams.service_type);
        googleFormData.append('entry.1775344095', templateParams.car_brand);
        googleFormData.append('entry.2074342323', templateParams.car_model);
        googleFormData.append('entry.748221579', templateParams.service_date);
        googleFormData.append('entry.1020267720', templateParams.message);

        // 3. Send via EmailJS (Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID')
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('EmailJS SUCCESS!', response.status, response.text);
                
                // 4. Also submit to Google Form for logs (no-cors)
                fetch(googleFormUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: googleFormData
                });

                // Show Success Popup
                document.getElementById('bookingPopup').style.display = 'flex';
                bookingForm.reset();
                otherBrandGroup.style.display = 'none';
                otherBrandInput.required = false;

                // Automatically close popup after 3.5 seconds
                setTimeout(() => {
                    window.closePopup();
                }, 3500);
            }, function(error) {
                console.error('EmailJS FAILED...', error);
                alert('Oops! Submission failed. Please try again or call us directly.');
            })
            .finally(() => {
                submitBtn.innerText = 'Confirm Booking';
                submitBtn.disabled = false;
            });
    });
        // Work Carousel Logic (3D Circular Queue)
    const workContainer = document.querySelector('.work-carousel-container');
    const workCards = document.querySelectorAll('.work-card');
    
    if (workContainer && workCards.length > 0) {
        let currentWorkIndex = 0;
        let workAutoPlayInterval;

        const stopAllWorkVideos = () => {
            workCards.forEach(card => {
                const video = card.querySelector('video');
                if (video) {
                    video.pause();
                    video.currentTime = 0; // reset video to start
                }
            });
        };

        function updateWorkCarousel() {
            workCards.forEach((card, i) => {
                let diff = i - currentWorkIndex;
                const halfLength = Math.floor(workCards.length / 2);
                
                if (diff > halfLength) diff -= workCards.length;
                if (diff < -halfLength) diff += workCards.length;

                const translateX = diff * 400; // Spread distance horizontally
                const scale = 1 - Math.abs(diff) * 0.15; // Cards shrink as they move away
                const zIndex = 20 - Math.abs(diff); // Center card is always top
                const opacity = Math.abs(diff) > 2 ? 0 : 1 - (Math.abs(diff) * 0.3); // Cards fade out
                
                if(window.innerWidth < 768) {
                    card.style.transform = `translateX(${diff * 220}px) scale(${scale})`;
                } else {
                    card.style.transform = `translateX(${translateX}px) scale(${scale})`;
                }
                
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;

                if (diff === 0) {
                    card.classList.add('active-slide');
                } else {
                    card.classList.remove('active-slide');
                }
            });
            
            stopAllWorkVideos();
            clearInterval(workAutoPlayInterval);
            
            const currentCard = workCards[currentWorkIndex];
            const video = currentCard.querySelector('video');
            
            if (video) {
                video.muted = true;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log("Autoplay blocked. Proceeding interval:", error);
                        startWorkAutoPlay();
                    });
                }
                video.onended = () => {
                    currentWorkIndex = (currentWorkIndex + 1) % workCards.length;
                    updateWorkCarousel();
                };
            } else {
                startWorkAutoPlay();
            }
        }

        const startWorkAutoPlay = () => {
            clearInterval(workAutoPlayInterval);
            workAutoPlayInterval = setInterval(() => {
                currentWorkIndex = (currentWorkIndex + 1) % workCards.length;
                updateWorkCarousel();
            }, 3500);
        };

        const stopWorkAutoPlay = () => clearInterval(workAutoPlayInterval);
        
        workContainer.addEventListener('mouseenter', stopWorkAutoPlay);
        workContainer.addEventListener('mouseleave', () => {
            const currentCard = workCards[currentWorkIndex];
            const video = currentCard.querySelector('video');
            if (!video || video.paused || video.ended) {
                startWorkAutoPlay();
            }
        });
        
        let workStartX = 0;
        let workEndX = 0;
        
        workContainer.addEventListener('touchstart', e => {
            stopWorkAutoPlay();
            workStartX = e.touches[0].clientX;
        }, {passive: true});

        workContainer.addEventListener('touchmove', e => {
            workEndX = e.touches[0].clientX;
        }, {passive: true});

        workContainer.addEventListener('touchend', () => {
            if (workStartX > workEndX + 50 && workEndX !== 0) {
                currentWorkIndex = (currentWorkIndex + 1) % workCards.length;
                updateWorkCarousel();
            } else if (workStartX < workEndX - 50 && workEndX !== 0) {
                currentWorkIndex = (currentWorkIndex - 1 + workCards.length) % workCards.length;
                updateWorkCarousel();
            }
            workStartX = 0;
            workEndX = 0;
        });

        window.centerWorkCard = function(clickedElement) {
            const idx = Array.from(workCards).indexOf(clickedElement);
            if (idx > -1 && idx !== currentWorkIndex) {
                currentWorkIndex = idx;
                updateWorkCarousel();
            }
        };

        setTimeout(() => {
            updateWorkCarousel();
        }, 100);
    }

    // ===== BRANCH SWITCHER: Reviews + Contact =====
    const branchData = {
        dhamtari: {
            address: '<i class="fas fa-map-marker-alt" style="color: var(--primary-green); width: 25px;"></i> <strong>Address:</strong><br>Beside Akash Ganga Colony, Rudri Road, Dhamtari, CG',
            phone: '<i class="fas fa-phone" style="color: var(--primary-green); width: 25px;"></i> <strong>Phone:</strong><br><a href="tel:9617205555" style="color:#fff;text-decoration:none;">9617205555</a> / <a href="tel:9993923000" style="color:#fff;text-decoration:none;">9993923000</a>',
            mapSrc: 'https://www.google.com/maps?q=20.6925308,81.5478162&z=17&output=embed',
            justdial: 'https://www.justdial.com/Dhamtari/Car-Saloon-Beside-Akashganga-Colony-Opposite-Amaltas-Puram-Colony-Dhamtari-I-Ward/9999P7722-7722-190912194757-B8M9_BZDET'
        },
        kanker: {
            address: '<i class="fas fa-map-marker-alt" style="color: var(--primary-green); width: 25px;"></i> <strong>Address:</strong><br>Gyani dhaba chowk, dudhawa road, near Durga mandir, Kanker, Chhattisgarh 494334',
            phone: '<i class="fas fa-phone" style="color: var(--primary-green); width: 25px;"></i> <strong>Phone:</strong><br><a href="tel:8461905555" style="color:#fff;text-decoration:none;">84619 05555</a>',
            mapSrc: 'https://www.google.com/maps?q=CAR+SALOON+KANKER&output=embed',
            justdial: 'https://www.justdial.com/Kanker/Car-Saloon-Kanker-Kodabhat-Near-Durga-Mandir-Bardebhata-Kanker-Road/9999P7868-7868-250221095508-P8J3_BZDET'
        },
        bilaspur: {
            address: '<i class="fas fa-map-marker-alt" style="color: var(--primary-green); width: 25px;"></i> <strong>Address:</strong><br>Beside S.B.I.S.M.E, Vyapar Vihar Road, Bilaspur, Chhattisgarh 495001',
            phone: '<i class="fas fa-phone" style="color: var(--primary-green); width: 25px;"></i> <strong>Phone:</strong><br><a href="tel:1234567890" style="color:#fff;text-decoration:none;">1234567890</a>',
            mapSrc: 'https://www.google.com/maps?q=22.1064259,82.1647232&z=17&output=embed',
            justdial: 'https://www.justdial.com/Bilaspur-Chhattisgarh/Car-Saloon-Vyapar-Vihar-Road/9999P7752-7752-181124163744-X1J3_BZDET'
        }
    };

    window.switchBranch = function(branch) {
        // 1. Toggle review panels
        ['dhamtari', 'kanker', 'bilaspur'].forEach(b => {
            document.getElementById('reviews-' + b).style.display = b === branch ? 'block' : 'none';
        });

        // 2. Sync review selector buttons
        ['dhamtari', 'kanker', 'bilaspur'].forEach(b => {
            const revBtn = document.getElementById('rev-btn-' + b);
            const contactBtn = document.getElementById('contact-btn-' + b);
            if (revBtn) revBtn.classList.toggle('active', b === branch);
            if (contactBtn) contactBtn.classList.toggle('active', b === branch);
        });

        // 3. Update Contact Details
        const data = branchData[branch];
        const addrEl = document.getElementById('contact-address');
        const phoneEl = document.getElementById('contact-phone');
        const jdLink  = document.getElementById('contact-justdial-link');
        const mapFrame = document.getElementById('mapFrame');

        if (addrEl)  addrEl.innerHTML  = data.address;
        if (phoneEl) phoneEl.innerHTML = data.phone;
        if (jdLink)  jdLink.href       = data.justdial;
        if (mapFrame) mapFrame.src     = data.mapSrc;
    };

    // Per-branch review sliding
    const reviewOffsets = { dhamtari: 0, kanker: 0, bilaspur: 0 };

    window.slideReviews = function(branch, dir) {
        const track = document.getElementById('track-' + branch);
        if (!track) return;
        const cards = track.querySelectorAll('.review-card');
        const visible = window.innerWidth <= 600 ? 1 : window.innerWidth <= 992 ? 2 : 3;
        const max = Math.max(0, cards.length - visible);
        reviewOffsets[branch] = Math.min(max, Math.max(0, reviewOffsets[branch] + dir));
        const cardWidth = cards[0].offsetWidth;
        const gap = 30;
        track.style.transform = `translateX(-${reviewOffsets[branch] * (cardWidth + gap)}px)`;
    };

    window.addEventListener('resize', () => {
        ['dhamtari', 'kanker', 'bilaspur'].forEach(b => {
            reviewOffsets[b] = 0;
            const track = document.getElementById('track-' + b);
            if (track) track.style.transform = 'translateX(0)';
        });
    });


    // Mobile Navigation Menu Toggle
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon between bars and times (close)
        const icon = menuIcon.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when a link is clicked
    const links = document.querySelectorAll('.nav-links li a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuIcon.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Counter Animation Logic
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                const nextCount = Math.ceil(count + inc);
                counter.innerText = nextCount > target ? target.toLocaleString() : nextCount.toLocaleString();
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                updateCount();
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });



    // Services Carousel Logic (True Circular Queue 3D)
    const servicesContainer = document.querySelector('.services-carousel-container');
    const cards = document.querySelectorAll('.services-carousel-container .service-card');
    
    if (servicesContainer && cards.length > 0) {
        let currentIndex = 0;
        let autoPlayInterval;

        function updateCarousel() {
            cards.forEach((card, i) => {
                // Determine logical distance from center (-3 to +3 for 6 items)
                let diff = i - currentIndex;
                const halfLength = Math.floor(cards.length / 2);
                
                // Wrap around safely
                if (diff > halfLength) diff -= cards.length;
                if (diff < -halfLength) diff += cards.length;

                // Adjust positioning math for pseudo-3D coverflow
                const translateX = diff * 220; // Spread distance horizontally
                const scale = 1 - Math.abs(diff) * 0.15; // Cards shrink as they move away
                const zIndex = 10 - Math.abs(diff); // Center card is always top
                const opacity = Math.abs(diff) > 2 ? 0 : 1 - (Math.abs(diff) * 0.4); // Very far cards fade out

                card.style.transform = `translateX(${translateX}px) scale(${scale})`;
                card.style.zIndex = zIndex;
                card.style.opacity = opacity;

                if (diff === 0) {
                    card.classList.add('active-slide');
                } else {
                    card.classList.remove('active-slide');
                }
            });
        }

        const startAutoPlay = () => {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % cards.length;
                updateCarousel();
            }, 4000);
        };

        const stopAutoPlay = () => clearInterval(autoPlayInterval);
        
        // Touch/Mouse interaction interrupts the carousel slightly to read
        servicesContainer.addEventListener('mouseenter', stopAutoPlay);
        servicesContainer.addEventListener('mouseleave', startAutoPlay);
        
        let serviceStartX = 0;
        let serviceEndX = 0;
        
        servicesContainer.addEventListener('touchstart', e => {
            stopAutoPlay();
            serviceStartX = e.touches[0].clientX;
        }, {passive: true});

        servicesContainer.addEventListener('touchmove', e => {
            serviceEndX = e.touches[0].clientX;
        }, {passive: true});

        servicesContainer.addEventListener('touchend', () => {
            if (serviceStartX > serviceEndX + 50 && serviceEndX !== 0) {
                // Swiped left
                currentIndex = (currentIndex + 1) % cards.length;
                updateCarousel();
            } else if (serviceStartX < serviceEndX - 50 && serviceEndX !== 0) {
                // Swiped right
                currentIndex = (currentIndex - 1 + cards.length) % cards.length;
                updateCarousel();
            }
            serviceStartX = 0;
            serviceEndX = 0;
            startAutoPlay();
        });

        // Click to set center card explicitly
        window.centerCard = function(clickedElement) {
            const idx = Array.from(cards).indexOf(clickedElement);
            if (idx > -1) {
                currentIndex = idx;
                updateCarousel();
                stopAutoPlay();
                // We do not instantly restart to give them time to read if they clicked
                setTimeout(startAutoPlay, 4000);
            }
        };

        setTimeout(() => {
            updateCarousel();
            startAutoPlay();
        }, 100);
    }

    // Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-text, .reveal-item, .heading-fill').forEach(el => {
        revealObserver.observe(el);
    });

    // Auto-trigger hero animations
    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('active');
    }, 200);
});