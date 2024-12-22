function showTime(){
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    var session = "AM";
    
    if(h == 0){
        h = 12;
    }
    
    if(h > 12){
        h = h - 12;
        session = "PM";
    }
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
    
}

showTime();

class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;

        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size
        );
    }

    appear() {
        this.isIdle = false;

        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }

        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }

        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }

        this.draw();
    }

    disappear() {
        this.isShimmer = false;
        this.counter = 0;

        if (this.size <= 0) {
            this.isIdle = true;
            return;
        } else {
            this.size -= 0.1;
        }

        this.draw();
    }

    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }

        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

class PixelCanvas extends HTMLElement {
    static register(tag = "pixel-canvas") {
        if ("customElements" in window) {
            customElements.define(tag, this);
        }
    }

    static css = `
      :host {
        display: grid;
        inline-size: 100%;
        block-size: 100%;
        overflow: hidden;
      }
    `;

    get colors() {
        return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
    }

    get gap() {
        const value = this.dataset.gap || 5;
        const min = 4;
        const max = 50;

        if (value <= min) {
            return min;
        } else if (value >= max) {
            return max;
        } else {
            return parseInt(value);
        }
    }

    get speed() {
        const value = this.dataset.speed || 35;
        const min = 0;
        const max = 100;
        const throttle = 0.001;

        if (value <= min || this.reducedMotion) {
            return min;
        } else if (value >= max) {
            return max * throttle;
        } else {
            return parseInt(value) * throttle;
        }
    }

    get noFocus() {
        return this.hasAttribute("data-no-focus");
    }

    connectedCallback() {
        const canvas = document.createElement("canvas");
        const sheet = new CSSStyleSheet();

        this._parent = this.parentNode;
        this.shadowroot = this.attachShadow({ mode: "open" });

        sheet.replaceSync(PixelCanvas.css);

        this.shadowroot.adoptedStyleSheets = [sheet];
        this.shadowroot.append(canvas);
        this.canvas = this.shadowroot.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.timeInterval = 1000 / 60;
        this.timePrevious = performance.now();
        this.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        this.init();
        this.resizeObserver = new ResizeObserver(() => this.init());
        this.resizeObserver.observe(this);

        this._parent.addEventListener("mouseenter", this);
        this._parent.addEventListener("mouseleave", this);

        if (!this.noFocus) {
            this._parent.addEventListener("focusin", this);
            this._parent.addEventListener("focusout", this);
        }
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
        this._parent.removeEventListener("mouseenter", this);
        this._parent.removeEventListener("mouseleave", this);

        if (!this.noFocus) {
            this._parent.removeEventListener("focusin", this);
            this._parent.removeEventListener("focusout", this);
        }

        delete this._parent;
    }

    handleEvent(event) {
        this[`on${event.type}`](event);
    }

    onmouseenter() {
        this.handleAnimation("appear");
    }

    onmouseleave() {
        this.handleAnimation("disappear");
    }

    onfocusin(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation("appear");
    }

    onfocusout(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation("disappear");
    }

    handleAnimation(name) {
        cancelAnimationFrame(this.animation);
        this.animation = this.animate(name);
    }

    init() {
        const rect = this.getBoundingClientRect();
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        this.pixels = [];
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.createPixels();
    }

    getDistanceToCanvasCenter(x, y) {
        const dx = x - this.canvas.width / 2;
        const dy = y - this.canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance;
    }

    createPixels() {
        for (let x = 0; x < this.canvas.width; x += this.gap) {
            for (let y = 0; y < this.canvas.height; y += this.gap) {
                const color = this.colors[
                    Math.floor(Math.random() * this.colors.length)
                ];
                const delay = this.reducedMotion
                    ? 0
                    : this.getDistanceToCanvasCenter(x, y);

                this.pixels.push(
                    new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
                );
            }
        }
    }

    animate(fnName) {
        this.animation = requestAnimationFrame(() => this.animate(fnName));

        const timeNow = performance.now();
        const timePassed = timeNow - this.timePrevious;

        if (timePassed < this.timeInterval) return;

        this.timePrevious = timeNow - (timePassed % this.timeInterval);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.pixels.length; i++) {
            this.pixels[i][fnName]();
        }

        if (this.pixels.every((pixel) => pixel.isIdle)) {
            cancelAnimationFrame(this.animation);
        }
    }
}

PixelCanvas.register();



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
