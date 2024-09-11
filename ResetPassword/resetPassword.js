import { showMessageModal } from '../general.js';

document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.querySelector('#password-form');
    const emailForm = document.querySelector('#email-form');

    passwordForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        const passwordInput = document.querySelector('#password');
        const confirmPasswordInput = document.querySelector('#confirm-password');
        let errorMessage = document.querySelector('#errorMessage');

        if (passwordInput.value !== confirmPasswordInput.value) {
            errorMessage.textContent = 'Passwords do not match';
        } else {
            errorMessage.textContent = ''; // Clear error message
            resetPassword(passwordInput.value)
        }
    });

    emailForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const emailInput = document.querySelector('#email');
        sendResetLink(emailInput.value)
    });
})

async function sendResetLink(email) {
    try {

        const response = await window.axiosInstance.post('/send-resetlink',
            { email: email },
            { skipInterceptors: true }
        );

        if (response.status === 200) {
            const message = response.data.message || 'Check email for instructions'
            showMessageModal(message, 'success')
        }
        else if (response.status === 400) {
            const message = response.data.message
            showMessageModal(message)
        }
        else {
            const message = response.data.message || 'Please register and try again later'
            showMessageModal(message)
        }
    }
    catch (error) {
        showMessageModal(error.response.data.message)
        console.error('There was a problem with the axios request:', error);
    }
}

async function resetPassword(newPassword) {
    try {
        const queryString = window.location.search;

        const urlParams = new URLSearchParams(queryString);

        const token = urlParams.get('token');   // "abcdef"

        var response = await window.axiosInstance.post(`/reset-password?token=${token}`,
            { newPassword: newPassword },
            { skipInterceptors: true }
        );

        const message = response.data.message;
        if (response.status === 200)
            showMessageModal(message, 'success')
        else
            showMessageModal(message)
        window.location.replace('/Signin/signin.html')
    }
    catch {
        showMessageModal()
        console.error('There was a problem with the axios request:', error);
        window.location.replace('/Signin/signin.html')
    }
}

export { sendResetLink }