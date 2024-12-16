document.addEventListener('DOMContentLoaded', () => {
    const image = document.querySelector('.scalable-image'); // Select the image
    const holder = document.querySelector('.holder.scroll-img'); // Holder for the image
    const text = document.querySelector('.more-text'); // The text below the image
    const start = holder.offsetTop + 400; // The point where the image starts
    const stop = start + 500; // Where the scaling animation stops

    // Ensure enough space for text placement
    document.querySelector('.scroll-container').style.height = `${window.innerHeight + 600}px`;

    // Initially hide the text and position it below the full-sized image
    text.style.opacity = '0';
    text.style.top = `${holder.offsetTop + holder.offsetHeight + 20}px`;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY; // Get the current scroll position

        if (scrollTop > start && scrollTop < stop) {
            const delta = scrollTop - start; // Calculate scroll distance
            const scale = Math.max(1 - delta / 1000, 0.6); // Scale the image down
            image.style.transform = `scale(${scale})`;

            // Dynamically adjust text position below the scaled image
            const scaledHeight = holder.offsetHeight * scale; // Height of the scaled image
            text.style.top = `${holder.offsetTop + scaledHeight + 30}px`; // Position text
            text.style.opacity = '1'; // Keep it hidden while scaling
        } else if (scrollTop >= stop) {
            image.style.transform = `scale(0.6)`; // Final scaled state

            // Fix the text below the final scaled image
            const finalScaledHeight = holder.offsetHeight * 0.6; // Final scaled height
            text.style.top = `${holder.offsetTop + finalScaledHeight + 30}px`; // Below scaled image
            text.style.opacity = '1'; // Fade in the text
        } else {
            image.style.transform = `scale(1)`; // Reset to full size when scrolling up

            // Reset the text position to below the full-sized image
            text.style.top = `${holder.offsetTop + holder.offsetHeight + 20}px`;
            text.style.opacity = '0'; // Fade out the text
        }
    });
});

// document.addEventListener('DOMContentLoaded', () => {
//     const image = document.querySelector('.scalable-image'); // Select the image element
//     const holder = document.querySelector('.holder.scroll-img'); // The holder container
//     const start = holder.offsetTop; // Starting point: where the holder begins
//     const stop = start + 500; // Ending point: 500px after the start

//     window.addEventListener('scroll', () => {
//         const scrollTop = window.scrollY; // Get the current vertical scroll position

//         if (scrollTop > start && scrollTop < stop) {
//             const delta = scrollTop - start; // Calculate how much we've scrolled
//             const scale = Math.max(1 - delta / 1000, 0.5); // Scale down from 1 to 0.2
//             image.style.transform = `scale(${scale})`; // Apply the scaling
//         } else if (scrollTop >= stop) {
//             image.style.transform = `scale(0.5)`; // Stop scaling further
//         } else {
//             image.style.transform = `scale(1)`; // Reset to full size when scrolling back up
//         }
//     });
// });
