document.addEventListener("DOMContentLoaded", () => {
    const animationWrapper = document.querySelector(".animation-wrapper");

    // 1) If user has already seen animation, skip it
    if (localStorage.getItem("seenAnimation") === "true") {
        animationWrapper.style.display = "none";
        return;
    }

    // 2) Otherwise, let it play for 12s (the --sp duration)
    setTimeout(() => {
        // Add the fade-out class
        animationWrapper.classList.add("fade-out");

        // 3) After 1s fade-out, hide it completely
        setTimeout(() => {
            animationWrapper.style.display = "none";
            // 4) Remember that user has seen the animation
            localStorage.setItem("seenAnimation", "true");
        }, 1000); // match the CSS transition time
    }, 12000); // match the total cycle in your snippet
});
