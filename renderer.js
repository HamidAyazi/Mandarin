const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
    const pet = document.getElementById("pet");

    if (!pet) return;

    // Change pet image on click and revert after 1 second
    pet.addEventListener("click", () => {
        pet.style.backgroundImage = "url('pet_happy.png')";
        setTimeout(() => pet.style.backgroundImage = "url('pet.png')", 1000);
    });

    // Handle click-through behavior based on mouse position
    document.addEventListener("mousemove", (event) => {
        const rect = pet.getBoundingClientRect();
        const isOverPet = 
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
        ipcRenderer.send("toggle-ignore-mouse", !isOverPet);
    });

    let isDragging = false;
    let lastX = 0, lastY = 0;
    let currentX = 0, currentY = 0;
    let animationFrameId = null;

    // Start dragging
    pet.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastX = event.screenX;
        lastY = event.screenY;
        ipcRenderer.send("start-drag", lastX, lastY);

        if (!animationFrameId) updatePosition();
    });

    // Track mouse movement while dragging
    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            currentX = event.screenX;
            currentY = event.screenY;
        }
    });

    // Function to update window position smoothly
    function updatePosition() {
        if (!isDragging) {
            animationFrameId = null;
            return;
        }

        ipcRenderer.send("move-window", currentX, currentY);
        animationFrameId = requestAnimationFrame(updatePosition);
    }

    // Stop dragging on mouse release
    document.addEventListener("mouseup", () => stopDragging());
    document.addEventListener("mouseleave", () => stopDragging());

    function stopDragging() {
        isDragging = false;
    }
});
