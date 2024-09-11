let toastTimeout;
let remainingTime = 4000; // Default 4 seconds
let startTime;
let progressBar;

function showToast({ message, type = null }) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    const toastIcon = document.getElementById("toast-icon");
    progressBar = document.querySelector('.toast-progress');

    toastMessage.textContent = message

    toast.classList.remove("toast-success", "toast-error", "toast-info");

    // Update progressBar default color based on type
    switch (type) {
        case "success":
            toast.classList.add("toast-success");
            toastIcon.innerHTML = `<div class="icon-circle success-icon">&#10003;</div>`;
            break;
        case "info":
            toast.classList.add("toast-info");
            toastIcon.innerHTML = `<div class="icon-circle info-icon">&#8505;</div>`;
            break;
        default:
            toast.classList.add("toast-error");
            toastIcon.innerHTML = `<div class="icon-circle error-icon">&#9888;</div>`;
    }

    // Show the toast and reset the progress bar animation
    toast.classList.add("show");

    // Start the timeout
    clearTimeout(toastTimeout);
    startTime = new Date().getTime();
    toastTimeout = setTimeout(hideToast, remainingTime);

    // Pause the animation on mouseenter
    toast.addEventListener('mouseenter', function () {
        clearTimeout(toastTimeout);
        let elapsedTime = new Date().getTime() - startTime;
        remainingTime -= elapsedTime;
    });

    // Resume the animation on mouseleave
    toast.addEventListener('mouseleave', function () {
        startTime = new Date().getTime();
        toastTimeout = setTimeout(hideToast, remainingTime);
    });
}

function hideToast() {
    const toast = document.getElementById("toast");
    toast.classList.remove("show");
}

function closeToast() {
    const toast = document.getElementById("toast");
    toast.classList.remove("show");
    clearTimeout(toastTimeout);
}


function showConflictModal(message, onAction) {
    const modal = document.querySelector('#conflict-modal');
    const messageElement = document.querySelector('#modal-message');
    const closeButton = document.querySelector('#modal-close-btn');
    const actionButton = document.querySelector('#modal-action-btn');

    messageElement.textContent = message || 'Conflict occurred. Please check the provided information.';
    modal.style.display = 'block';

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Hide the modal
    });

    actionButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Hide the modal
        if (onAction) onAction(); // Execute the callback function if provided
    });

    // Optional: Hide modal when clicking outside of the modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showMessageModal(message, type) {
    const modal = document.querySelector('#message-modal');
    const messageElement = document.querySelector('#modal-message');
    const closeButton = document.querySelector('#modal-close-btn');
    const actionButton = document.querySelector('#modal-action-btn');

    if (modal) {
        messageElement.textContent = message || 'Unable to process request. Try again later.';
        modal.style.display = 'block';

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none'; // Hide the modal
        });

        actionButton.addEventListener('click', () => {
            modal.style.display = 'none'; // Hide the modal
            if (onAction) {
                Promise.resolve(onAction()).then(() => {
                    console.log('Action completed');
                }).catch(error => {
                    console.error('Action failed:', error);
                });
            }
        });

        // Optional: Hide modal when clicking outside of the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    else {
        const message = message || 'Unable to process request. Try again later.'
        document.querySelector('#toast').textContent = message;
        showToast(type);
    }


}

export { showToast, showConflictModal, showMessageModal };