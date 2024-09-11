import { showToast } from "../general.js"

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.body').addEventListener('click', async (event) => {
        if (event.target.closest('.row')) {
            const row = event.target.closest('.row');
            const title = row.getElementsByTagName('td')[1].innerText;
            try {
                const response = await window.axiosInstance.get(`/assessment/?documentTitle=${encodeURIComponent(title)}`);
                if (response.status === 200) {
                    localStorage.setItem('getAllAssessments', JSON.stringify(response.data.assessments));
                    localStorage.setItem('documentTitle', response.data.documentTitle);
                    window.location.href = '/GetAllAssessments/getAllAssessments.html';
                } else {
                    showToast({ message: response.data.message ?? 'An unexpected error occurred. Please try again.' });
                    console.log('checkpoint 2 error');
                }
            } catch (error) {
                handleError(error);
            }
        }
    });
})

async function populateTable() {
    try {
        const response = await window.axiosInstance.get(`/document`)
        if (response.status === 200) {
            const documents = response.data.documents
            console.log("Documents", documents)
            const tableBody = document.querySelector('.body')
            let counter = 0
            documents.forEach((doc) => {
                counter++
                const row = document.createElement('tr');
                row.classList.add('row');
                row.innerHTML = `
                    <td>${counter}</td>
                    <td>${doc.title}</td>
                    <td>${doc.dateCreated}</td>
                `;
                tableBody.appendChild(row);
            })
        }
        else {
            showToast({ message: response.data.message ?? 'An unexpected error occurred. Please try again.' })
            console.log('checkpoint 2 error')
            window.location.href = '/Home/home.html'
        }
    } catch (error) {
        handleError(error)
        window.location.href = '/Home/home.html'
    }
}

populateTable()

function handleError(error) {
    console.log('Error response:', error.response);
    console.log('Error response data:', error.response ? error.response.data : 'No response data');
    const errorMessage = error.response && error.response.data ? error.response.data.message : 'An unexpected error occurred. Please try again.';
    showToast({ message: errorMessage });
}