window.closePopup = function() {
    document.getElementById('bookingPopup').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('car-service-form');
    const submitBtn = bookingForm.querySelector('.submit-btn');

    // Google Form Configuration
    const FORM_ID = "1FAIpQLSdkJsQxencJNdT4qzuNmdG6mlWrsrBL11DqU_q5zwLGWNt3Iw";
    const googleFormUrl = `https://docs.google.com/forms/u/0/d/e/${FORM_ID}/formResponse`;

    bookingForm.addEventListener('submit', function (event) {
        event.preventDefault();

        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        // 1. Prepare Google Form Data (Mapped from your pre-filled link)
        const googleFormData = new FormData();
        googleFormData.append('entry.1378675246', this.user_name.value);
        googleFormData.append('entry.902874580', this.user_email.value);
        googleFormData.append('entry.1192564498', this.user_phone.value);
        googleFormData.append('entry.1800244039', this.service_type.value);
        googleFormData.append('entry.1775344095', this.car_brand.value);
        googleFormData.append('entry.2074342323', this.car_model.value);
        googleFormData.append('entry.748221579', this.service_date.value);
        googleFormData.append('entry.1020267720', this.message.value);

        // 2. Submit to Google Form
        fetch(googleFormUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: googleFormData
        })
        .then(() => {
            document.getElementById('bookingPopup').style.display = 'flex';
            bookingForm.reset();
            // Automatically close popup after 3.5 seconds
            setTimeout(() => {
                window.closePopup();
            }, 3500);
        })
        .catch((error) => {
            console.error('Submission error:', error);
            alert('Oops! Something went wrong. Please try again.');
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

    const updateCarousel = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
    };

    nextButton.addEventListener('click', () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
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

    // Auto-play
    let autoPlay = setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;
        updateCarousel(nextIndex);
    }, slideInterval);

    // Pause auto-play on hover
    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carouselContainer.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length;
            updateCarousel(nextIndex);
        }, slideInterval);
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
});