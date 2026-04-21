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
    // Carousel Logic
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    const dots = Array.from(dotsContainer.children);

    let currentIndex = 0;
    const slideInterval = 5000; // 5 seconds
    let autoPlay;

    const stopAllVideos = () => {
        slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // reset video to start
            }
        });
    };

    const nextSlide = () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
    };

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
        
        stopAllVideos();
        clearInterval(autoPlay);

        const currentSlide = slides[currentIndex];
        const video = currentSlide.querySelector('video');
        
        if (video) {
            video.muted = true; // Ensure it starts muted automatically
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay blocked by browser. Proceeding normal interval:", error);
                    autoPlay = setInterval(nextSlide, slideInterval);
                });
            }
            // Trigger next slide exclusively when the video naturally ends
            video.onended = () => {
                nextSlide();
            };
        } else {
            // Normal 5 second flip for images
            autoPlay = setInterval(nextSlide, slideInterval);
        }
    };

    nextButton.addEventListener('click', () => {
        nextSlide();
    });

    prevButton.addEventListener('click', () => {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel(prevIndex);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateCarousel(index);
        });
    });

    // Pause auto-play timers on hover
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlay));
    
    carouselContainer.addEventListener('mouseleave', () => {
        const currentSlide = slides[currentIndex];
        const video = currentSlide.querySelector('video');
        // Resume timer only if an image is showing, or if video is paused/done
        if (!video || video.paused || video.ended) {
            autoPlay = setInterval(nextSlide, slideInterval);
        }
    });

    // Boot up the carousel properly
    updateCarousel(0);
    // Reviews Carousel Logic
    const reviewsTrack = document.querySelector('.reviews-track');
    const reviewsNext = document.querySelector('.reviews-btn.next');
    const reviewsPrev = document.querySelector('.reviews-btn.prev');
    const reviewCards = Array.from(document.querySelectorAll('.review-card'));
    
    let reviewIndex = 0;

    const getVisibleCards = () => {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    };

    const updateReviewsCarousel = () => {
        const visibleCards = getVisibleCards();
        const maxIndex = Math.max(0, reviewCards.length - visibleCards);
        
        if (reviewIndex > maxIndex) reviewIndex = maxIndex;
        if (reviewIndex < 0) reviewIndex = 0;

        const cardWidth = reviewCards[0].offsetWidth;
        const gap = 30;
        const offset = reviewIndex * (cardWidth + gap);
        
        reviewsTrack.style.transform = `translateX(-${offset}px)`;
        
        // Disable/Enable buttons
        reviewsPrev.style.opacity = reviewIndex === 0 ? '0.3' : '1';
        reviewsNext.style.opacity = reviewIndex >= maxIndex ? '0.3' : '1';
    };

    reviewsNext.addEventListener('click', () => {
        const maxIndex = reviewCards.length - getVisibleCards();
        if (reviewIndex < maxIndex) {
            reviewIndex++;
            updateReviewsCarousel();
        }
    });

    reviewsPrev.addEventListener('click', () => {
        if (reviewIndex > 0) {
            reviewIndex--;
            updateReviewsCarousel();
        }
    });

    // Handle window resize for carousel responsiveness
    window.addEventListener('resize', updateReviewsCarousel);
    
    // Initial call to set positions
    setTimeout(updateReviewsCarousel, 100);

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
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
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

    // Map Selector Logic
    window.changeMap = function(btnElement, mapUrl) {
        // Change iframe src
        document.getElementById('mapFrame').src = mapUrl;
        
        // Remove active class from all map buttons
        document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        btnElement.classList.add('active');
    };

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
            }, 2000);
        };

        const stopAutoPlay = () => clearInterval(autoPlayInterval);
        
        // Touch/Mouse interaction interrupts the carousel slightly to read
        servicesContainer.addEventListener('mouseenter', stopAutoPlay);
        servicesContainer.addEventListener('mouseleave', startAutoPlay);
        servicesContainer.addEventListener('touchstart', stopAutoPlay);
        servicesContainer.addEventListener('touchend', startAutoPlay);

        // Click to set center card explicitly
        window.centerCard = function(clickedElement) {
            const idx = Array.from(cards).indexOf(clickedElement);
            if (idx > -1) {
                currentIndex = idx;
                updateCarousel();
                stopAutoPlay();
                // We do not instantly restart to give them time to read if they clicked
                setTimeout(startAutoPlay, 2000);
            }
        };

        // Initialize state
        setTimeout(() => {
            updateCarousel();
            startAutoPlay();
        }, 100);
    }
});