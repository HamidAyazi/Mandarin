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
    let lastX, lastY;
    let dragInterval;

    // Start dragging and track mouse position
    pet.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastX = event.screenX;
        lastY = event.screenY;
        ipcRenderer.send("start-drag", lastX, lastY);

        dragInterval = setInterval(() => {
            if (isDragging) ipcRenderer.send("move-window", lastX, lastY);
        }, 16); // 60 FPS
    });

    // Update mouse position while dragging
    document.addEventListener("mousemove", (event) => {
        if (isDragging) {
            lastX = event.screenX;
            lastY = event.screenY;
        }
    });

    // Stop dragging on mouse release or leave
    document.addEventListener("mouseup", () => stopDragging());
    document.addEventListener("mouseleave", () => stopDragging());

    function stopDragging() {
        isDragging = false;
        clearInterval(dragInterval);
    }
});
