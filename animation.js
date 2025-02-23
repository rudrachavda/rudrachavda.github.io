document.addEventListener("DOMContentLoaded", function () {
    const loaderContainer = document.getElementById("loader-container");

    // Check if the user has visited before
    if (!localStorage.getItem("visited")) {
        loaderContainer.style.display = "flex"; // Show loader for first-time visitors
        localStorage.setItem("visited", "true");
    } else {
        loaderContainer.style.display = "none"; // Hide loader immediately unless slow loading
    }

    // Measure load time
    const timeout = setTimeout(() => {
        loaderContainer.style.display = "flex"; // Show loader if loading is slow
    }, 800);

    window.onload = function () {
        clearTimeout(timeout); // Stop loader if page loads fast
        loaderContainer.style.display = "none";
    };
});
