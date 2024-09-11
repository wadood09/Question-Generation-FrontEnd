import { showToast } from '../general.js';

var documentForm = document.querySelector('#document-form')
const fileInput = document.querySelector('#fileInput')
let selectedFile = null;

documentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('checkpoint 1')
    const title = document.querySelector('#document-title')

    console.log('Selected file:', selectedFile);
    try {
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('title', title.value);
        const response = await window.axiosInstance.post(`/document`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('checkpoint 2')
        if (response.status === 200) {
            const questionType = document.querySelector('#question-type')
            const questionCount = document.querySelector('#question-count')
            const difficultyLevel = document.querySelector('#difficultyLevel')

            const assessmentResponse = await window.axiosInstance.post(`/assessment/${response.data.id}`,
                {
                    questionCount: questionCount.value,
                    assessmentType: questionType.value,
                    advancedPrefences: false,
                    prefences: [],
                    difficultyLevel: difficultyLevel.value
                }
            );

            console.log('checkpoint 3')
            if (assessmentResponse.status === 200) {
                localStorage.setItem("assessment", JSON.stringify(assessmentResponse.data.assessment));
                showToast({ message: response.data.message, type: 'success' })
                console.log('checkpoint 4')
                window.location.href = '/Assessment/takeAssessment.html'
            }
            else {
                showToast({ message: assessmentResponse.data.message })
                console.log('checkpoint 2 error')
            }
        }
        else {
            showToast({ message: response.data.message })
            console.log('checkpoint 3 error')
        }
    } catch (error) {
        console.log('Error response:', error.response);
        console.log('Error response data:', error.response ? error.response.data : 'No response data');
        const errorMessage = error.response && error.response.data ? error.response.data.message : 'An unexpected error occurred. Please try again.';
        showToast({ message: errorMessage });
    }
})

fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0]
})



document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role')
    if (role === 'Standard User') {
        const questionType = document.querySelector('#question-type')
        questionType.innerHTML += '<option value="2">True/False</option>'
        const numbers = document.querySelector('#question-count')
        numbers.innerHTML += '<option>15</option><option>20</option>'
        const difficultyLevel = document.querySelector('#difficultyLevel')
        difficultyLevel.innerHTML += '<option value="2">Medium</option>'
    }
    else if (role === 'Premium User') {
        const questions = document.querySelector('#question-type')
        questions.innerHTML += `<option value="2">True/False</option>
        <option value="3">FillInTheBlanks</option>
        <option value="4">Flashcards</option>`
        const numbers = document.querySelector('#question-count')
        numbers.innerHTML += `<option>15</option>
        <option>20</option>
        <option>25</option>
        <option>30</option>
        <option>35</option>
        <option>40</option>
        <option>45</option>
        <option>50</option>`
        const difficultyLevel = document.querySelector('#difficultyLevel')
        difficultyLevel.innerHTML += `<option value="2">Medium</option>
        <option value="3">Hard</option>`
    }


    const fileInput = document.querySelector('#fileInput')
    const uploadArea = document.querySelector('.upload-area');
    const card = document.querySelector('.card');
    const fileButton = document.querySelector('#fileButton');

    fileButton.addEventListener('click', () => {
        document.querySelector('#fileInput').click();
    })

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            document.querySelector('.filename').textContent = `${file.name}`;
            uploadArea.style.display = 'none'
            card.style.display = 'flex'
        }
    });

    const closeBtn = document.querySelector('.close-btn')
    closeBtn.addEventListener('click', () => {
        card.style.display = 'none'
        uploadArea.style.display = 'block'
    })
})
