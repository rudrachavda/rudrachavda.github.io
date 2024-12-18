window.addEventListener('load', () => {
    const image = document.querySelector('.scalable-image'); // Select the image
    const holder = document.querySelector('.holder.scroll-img'); // Holder for the image
    const text = document.querySelector('.more-text'); // The text below the image
    let start, stop;

    // Function to recalculate offsets
    function setOffsets() {
        start = holder.offsetTop + 400; // The point where the image starts
        stop = start + 500; // Where the scaling animation stops
    }

    // Function to apply scaling logic
    function applyScaling() {
        if (window.innerWidth <= 768) {
            // Disable scaling logic for smaller screens
            image.style.transform = `scale(1)`;
            text.style.top = `${holder.offsetTop + holder.offsetHeight + 30}px`;
            text.style.opacity = '1'; // Show text statically
            return;
        }

        // Scaling logic for larger screens
        const scrollTop = window.scrollY; // Get the current scroll position

        if (scrollTop > start && scrollTop < stop) {
            const delta = scrollTop - start; // Calculate scroll distance
            const scale = Math.max(1 - delta / 1000, 0.6); // Scale the image down
            image.style.transform = `scale(${scale})`;

            // Dynamically adjust text position below the scaled image
            const scaledHeight = holder.offsetHeight * scale; // Height of the scaled image
            text.style.top = `${holder.offsetTop + scaledHeight + 30}px`;
            text.style.opacity = '0';
        } else if (scrollTop >= stop) {
            image.style.transform = `scale(0.6)`;

            // Fix the text below the final scaled image
            const finalScaledHeight = holder.offsetHeight * 0.6; // Final scaled height
            text.style.top = `${holder.offsetTop + finalScaledHeight + 30}px`;
            text.style.opacity = '1';
        } else {
            image.style.transform = `scale(1)`; // Reset to full size
            text.style.top = `${holder.offsetTop + holder.offsetHeight + 30}px`;
            text.style.opacity = '0';
        }
    }

    // Function to initialize and set conditions
    function initialize() {
        setOffsets(); // Recalculate offsets
        applyScaling(); // Apply scaling immediately
    }

    // Initialize logic
    initialize();

    // Apply the scaling logic on scroll only if screen is large
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) {
            applyScaling();
        }
    });

    // Handle window resize to recalculate offsets
    window.addEventListener('resize', initialize);
});
