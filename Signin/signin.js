import { sendResetLink } from '../ResetPassword/resetPassword.js';
import { showConflictModal, showMessageModal, showToast } from '../general.js';

const loginForm = document.querySelector("#login-form")

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    console.log('Checkpoint 1')
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    console.log('Checkpoint 2')
    try {
        const response = await window.axiosInstance.post('/login',
            {
                email: email,
                password: password,
            },
            { skipInterceptors: true }
        );

        console.log('Checkpoint 3')
        switch (response.status) {
            case 200:
                // Success case
                console.log('Checkpoint 200')
                const accessToken = response.data.accessToken;
                localStorage.setItem('access-token', accessToken);
                window.location.replace('/Home/home.html');
                break;
            case 409:
                // Conflict case
                console.log('Checkpoint 409')
                const conflictMessage = response.data.message;
                document.querySelector('#modal-action-btn').textContent = 'Send link'
                showConflictModal(conflictMessage, () => sendResetLink(email))
                break;
            default:
                console.log('Checkpoint default')
                // Handle other status codes
                const errorMessage = axiosResponse.data.message || 'Login failed. Please try again.';
                showToast({message: errorMessage});
                break;
        }
    } catch (error) {
        console.log('Checkpoint error')
        showMessageModal('error')
        console.error('There was a problem with the axios request:', error);
    }
});

async function handleCredentialResponse(response) {
    const idToken = response.credential; // This is the ID token

    try {
        // Send the ID token to your server
        const axiosResponse = await window.axiosInstance.post('/signin-google',
            { idToken: idToken },
            { skipInterceptors: true }
        );

        const accessToken = axiosResponse.data.accessToken;
        localStorage.setItem('access-token', accessToken);
        window.location.replace('/home');
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Login failed. Please try again.';
        document.querySelector('#toast').textContent = errorMessage;
        showToast({message: errorMessage});
    }
}