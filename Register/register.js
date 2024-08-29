import { showToast } from "../general.js";

const registerForm = document.querySelector('#register-form')

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.querySelector('#first-name').value
    const lastName = document.querySelector('#last-name').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const confirmPassword = document.querySelector('#confirm-password').value

    if (password.value !== confirmPassword.value) {
        errorMessage.textContent = 'Passwords do not match';
    }
    else {
        errorMessage.textContent = ''; // Clear error message
        try {
            const response = await window.axiosInstance.post('/register',
                {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword
                },
                { skipInterceptors: true }
            );

            if (response.status === 200) {
                const message = response.data.message || 'Registration successfull'
                showToast({message: message, type: 'success'})
                window.location.replace('/Signin/signin.html')
            }
            else {
                const message = response.data.message
                showToast({message: message})
            }
        }
        catch (error) {
            const message = error.response.data.message || 'An error occurred during registration'
            showToast({message: message})
        }
    }
})