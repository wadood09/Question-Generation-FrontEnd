import { showToast } from "../general.js"



var modalForm = document.querySelector('.modal-form')
modalForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    console.log('Check first')

    const questionType = document.querySelector('#question-type')
    const questionCount = document.querySelector('#question-count')
    const difficultyLevel = document.querySelector('#difficultyLevel')
    const documentTitle = document.querySelector('.section-heading')
    console.log('Check 1')
    closeModal()
    console.log('Check 2')
    try {
        console.log('Document Title', documentTitle.textContent)
        const documentResponse = await window.axiosInstance.get(`/document/?title=${encodeURIComponent(documentTitle.textContent)}`)
        if (documentResponse.status === 200) {
            console.log('Check 3')
            console.log(documentResponse)
            const id = documentResponse.data.documents.id;
            console.log('Id', id)
            const response = await window.axiosInstance.post(`/assessment/${id}`,
                {
                    questionCount: questionCount.value,
                    assessmentType: questionType.value,
                    advancedPrefences: false,
                    prefences: [],
                    difficultyLevel: difficultyLevel.value
                }
            );

            if (response.status === 200) {
                console.log('Check 4')
                console.log(response)
                localStorage.setItem("assessment", JSON.stringify(response.data.assessment));
                showToast({ message: response.data.message, type: 'success' })
                console.log('checkpoint 4')
                window.location.href = '/Assessment/takeAssessment.html'
            }
            else {
                showToast({ message: response.data.message })
                console.log('checkpoint 2 error')
            }
        }
        else {
            showToast({ message: response.data.message })
            console.log('checkpoint 2 error')
        }
    } catch (error) {
        console.log('Error :', error);
        console.log('Error response:', error.response);
        console.log('Error response data:', error.response ? error.response.data : 'No response data');
        const errorMessage = error.response && error.response.data ? error.response.data.message : 'An unexpected error occurred. Please try again.';
        showToast({ message: errorMessage });
    }
})



document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('.section-heading')
    title.textContent = localStorage.getItem('documentTitle')
    loadAssessments();
    resetColor();

    var assessmentCards = document.querySelectorAll('.assessment-card')

    assessmentCards.forEach((card) => {
        const retryLink = card.querySelector('.retry-link')
        const assessmentId = card.querySelector('.assessmentId')
        console.log('Retry Link:', retryLink);
        console.log('Assessment ID:', assessmentId);

        retryLink.addEventListener('click', async (e) => {
            e.preventDefault()

            console.log('Clicked')
            try {
                const response = await window.axiosInstance.get(`/assessment/${assessmentId.textContent}`)
                if (response.status === 200) {
                    localStorage.setItem('assessment', JSON.stringify(response.data.assessment))
                    window.location.href = '/Assessment/takeAssessment.html'
                }
                else {
                    const message = response.data.message
                    showToast({ message: message })
                }
            } catch (error) {
                console.log('Checkpoint error')
                const errorMessage = error.response ? error.response.data.message : 'An error occured. Please try again later';
                showToast({ message: errorMessage });
                console.error('There was a problem with the axios request:', error);
            }
        })
    })
})

function resetColor() {
    var recentGrades = document.querySelectorAll('.recent-grade')
    recentGrades.forEach((grade) => {
        let gradeInNum = grade.textContent.trim().replace("%", '')
        if(gradeInNum >= 50){
            grade.style.backgroundColor = rgb(0, 255, 0);
        }
    })
}

function loadAssessments() {
    const assessmentsString = localStorage.getItem('getAllAssessments')
    const assessments = JSON.parse(assessmentsString);

    console.log('Assessment', assessments, assessmentsString)

    const container = document.querySelector('.assessment-container')

    assessments.forEach((assessment) => {
        container.innerHTML += `<div class="assessment-card">
                    <div class="card-header">
                        <div class="header-top">
                            <p class="question-type">${assessment.assessmentType}</p>
                            <p class="assessmentId" hidden>${assessment.id}</p>
                            <div class="recent-grade">
                                <p>Recent Grade: ${assessment.recentGrade ?? 0}%</p>
                            </div>
                        </div>
                        <p class="question-count">${assessment.questionsCount} Question(s)</p>
                        <div class="created-date">
                            <p>Created on: ${assessment.dateCreated}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="transition-container">
                            <div class="expandable-section">
                                <!-- Additional expandable content can be placed here -->
                            </div>
                        </div>
                        <a href="#" class="retry-link">
                            <button class="retry-button">Retry
                                <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.3536 4.85355C15.5488 4.65829 15.5488 4.34171 15.3536 4.14645L12.1716 0.964466C11.9763 0.769204 11.6597 0.769204 11.4645 0.964466C11.2692 1.15973 11.2692 1.47631 11.4645 1.67157L14.2929 4.5L11.4645 7.32843C11.2692 7.52369 11.2692 7.84027 11.4645 8.03553C11.6597 8.2308 11.9763 8.2308 12.1716 8.03553L15.3536 4.85355ZM0 5H15V4H0V5Z"
                                        fill="black"></path>
                                </svg>
                            </button>
                        </a>
                    </div>
                </div>`
    });
}

var button = document.querySelector('#generate-button')
button.addEventListener('click', () => {
    const modal = document.querySelector('.modal-overlay')
    modal.style.display = 'flex'
})

var closeBtn = document.querySelector('.modal-close')
closeBtn.addEventListener('click', () => {
    closeModal()
})

function closeModal() {
    const modal = document.querySelector('.modal-overlay')
    modal.style.display = 'none'
}