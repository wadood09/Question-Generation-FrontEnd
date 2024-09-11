import { showToast } from "../general.js";

var assessmentForm = document.querySelector('#assessment-form');

assessmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const questionAnswers = new Map();

    // Select all question cards
    const questionCards = document.querySelectorAll('.question-card');
    let isFormValid = true; // To track if all questions have selected options
    let firstInvalidCard = null;

    questionCards.forEach((card) => {
        const questionId = card.querySelector('.question-id').textContent;
        const selectedOption = card.querySelector('.option.selected p');

        if (!selectedOption) {
            card.style.backgroundColor = 'red';
            isFormValid = false;

            setTimeout(() => {
                card.style.backgroundColor = '#f8fafc'; // Reset after 3 seconds
            }, 3000);

            if (!firstInvalidCard) {
                firstInvalidCard = card;
            }
        } else {
            const selectedOptionValue = card.querySelector('.option.selected .hidden').textContent;
            questionAnswers.set(questionId, selectedOptionValue);
        }
    });

    // Stop form submission and scroll to the first invalid question
    if (!isFormValid) {
        if (firstInvalidCard) {
            firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    try {
        const jsonObject = Object.fromEntries(questionAnswers);
        const assessmentId = document.querySelector('#assessmentId').textContent.trim();
        const response = await window.axiosInstance.post('/attempts', {
            assessmentId: assessmentId,
            questionAnswers: jsonObject
        });

        if (response.status === 200) {
            const attempt = await window.axiosInstance.get(`/attempts/${response.data.id}`);
            console.log(attempt)
            if (attempt.status === 200) {
                showScoreModal(attempt)

                questionCards.forEach((card) => {
                    const questionText = card.querySelector('.question-text').textContent.trim();
                    const originalQuestion = attempt.data.attempt.questions.find(
                        (x) => x.questionText === questionText
                    );
                    console.log(originalQuestion)
                    const selectedOption = card.querySelector('.option.selected .hidden');
                    const message = card.querySelector('.message')
                    const elucidation = card.querySelector('.elucidation')
                    message.hidden = false
                    elucidation.hidden = false

                    if (originalQuestion.userAnswer === selectedOption.textContent.trim()) {
                        message.textContent = 'Correct'
                        message.classList.remove('wrong-message');
                        message.classList.add('success-message');
                        selectedOption.parentElement.style.backgroundColor = 'green';
                    } else {
                        message.textContent = 'Wrong'
                        message.classList.remove('success-message');
                        message.classList.add('wrong-message');
                        selectedOption.parentElement.style.backgroundColor = 'red';
                        const correctOption = Array.from(card.querySelectorAll('.option p')).find(
                            (x) => x.textContent.trim() === originalQuestion.questionAnswer
                        );
                        if (correctOption) correctOption.style.backgroundColor = 'green';
                    }
                });
                const buttonContainer = document.querySelector('.submit-container')
                buttonContainer.innerHTML = `<button class="custom-button" id="done-button">Done</button>`
                addDoneButtonListener()
            } else {
                handleFailedAttempt(attempt);
            }
        } else {
            handleFailedAttempt(response);
        }
    } catch (error) {
        handleErrorResponse(error);
    }
});

function addDoneButtonListener() {
    const doneButton = document.querySelector('#done-button');
    if (doneButton) {
        doneButton.addEventListener('click', async () => {
            try {
                const documentTitle = document.querySelector('#documentTitle').textContent; // Use .value to get the input value
                const response = await window.axiosInstance.get(`/assessment?documentTitle=${encodeURIComponent(documentTitle)}`);
                console.log(response)
                if (response.status === 200) {
                    localStorage.setItem('getAllAssessments', JSON.stringify(response.data.assessments));
                    localStorage.setItem('DocumentTitle', response.data.documentTitle);
                    window.location.href = '/GetAllAssessments/getAllAssessments.html';
                } else {
                    handleFailedAttempt(response);
                }
            } catch (error) {
                handleErrorResponse(error);
            }
        });
    } else {
        console.error('Element with ID #done-button not found.');
    }
}

// Handle failed attempt responses
function handleFailedAttempt(response) {
    const message = response.data.message;
    showToast({ message: message });

    // setTimeout(() => {
    //     window.location.href = '/GetAllDocuments/getAllDocument.html';
    // }, 10000);
}

// Handle error response
function handleErrorResponse(error) {
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response ? error.response.data : 'No response data');
    const errorMessage = error.response && error.response.data ? error.response.data.message : 'An unexpected error occurred. Please try again.';
    showToast({ message: errorMessage });

    // setTimeout(() => {
    //     window.location.href = '/Home/home.html';
    // }, 10000);
}


function selectOption() {
    // Select all question cards
    const questionCards = document.querySelectorAll('.question-card');

    // Iterate through each question card
    questionCards.forEach((card) => {
        // Select all options within the current card
        const options = card.querySelectorAll('.option');

        // Add a click event listener to each option
        options.forEach((option) => {
            option.addEventListener('click', () => {
                // Remove the 'selected' class from all options in the current card
                options.forEach((opt) => opt.classList.remove('selected'));

                // Add the 'selected' class to the clicked option
                option.classList.add('selected');
            });
        });
    });
}

// Call the function to initialize the click events
selectOption();


function loadAssessmentForm() {
    // Retrieve the assessment data from localStorage and parse it into an object
    const assessmentString = localStorage.getItem('assessment');
    const assessment = JSON.parse(assessmentString);
    console.log(assessment, assessmentString)

    const date = document.querySelector('.date')
    date.textContent = `Date Created: ${assessment.dateCreated}`

    // Set the assessment ID in the DOM
    const assessmentId = document.querySelector('#assessmentId');
    const documentTitle = document.querySelector('#documentTitle');
    assessmentId.textContent = assessment.id;
    documentTitle.textContent = assessment.documentTitle

    // Initialize a counter for question numbering
    let counter = 0;

    // Reference to the form element where the questions will be appended
    const assessmentForm = document.querySelector('#assessment-form');

    // Clear existing form content if any
    assessmentForm.innerHTML = '';

    // Loop through each question in the assessment
    assessment.questions.forEach((question) => {
        counter++;

        // Append the question card to the form
        assessmentForm.innerHTML += `
            <div class="question-card">
                <p class="message" hidden></p>
                <p class="question-number">Question ${counter}</p>
                <p class="question-text">${question.questionText}</p>
                <p class="question-id" hidden>${question.id}</p>
                <div class="options-container options-container${counter}"></div>
                <p class="elucidation" hidden>${question.elucidation}</p>
            </div>
        `;

        // Find the options container for the current question to append options
        const optionContainer = assessmentForm.querySelector(`.options-container${counter}`);

        // Append each option to the corresponding question's options container
        question.options.forEach((option) => {
            optionContainer.innerHTML += `
                <div class="option">
                    <p>${option.optionText}</p>
                    <div class="hidden" hidden>${option.id}</div>
                </div>
            `;
        });
    });

    // Append the submit button at the end of the form
    assessmentForm.innerHTML += `
        <div class="submit-container">
            <button type="submit" class="custom-button">Submit</button>
        </div>
    `;

    // Initialize the click events for the options
    selectOption();
}


document.addEventListener('DOMContentLoaded', () => {
    loadAssessmentForm();
    selectOption(); // Make sure to call the select option handler if you have one
});

function showScoreModal(response) {
    const modal = document.querySelector('.modal-overlay');
    const score = document.querySelector('.score-percentage');
    const scoreCircle = document.querySelector('.score-circle');
    const retryText = document.querySelector('.retry-text');
    const modalMessage = document.querySelector('.modal-message')

    const grade = response.data.attempt.grade;
    score.textContent = `${grade}%`
    if (grade >= 50) {
        retryText.textContent = ''
        modalMessage.textContent = ''
        scoreCircle.style.backgroundColor = 'rgb(144, 238, 144)'
        scoreCircle.style.borderColor = 'rgb(0, 255, 0)'
    }
    else {
        scoreCircle.style.backgroundColor = 'rgb(254, 205, 211)'
        scoreCircle.style.borderColor = 'rgb(239, 68, 68)'
    }
    modal.style.display = 'flex';
}

function closeScoreModal() {
    const modal = document.querySelector('.modal-overlay');
    const modalButton = document.querySelector('.review-button')
    modalButton.addEventListener('click', () => {
        modal.style.display = 'none'
    })
}

closeScoreModal()