
// File upload functionality
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const successAlert = document.getElementById('successAlert');

// Drag and drop functionality
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFileUpload(files);
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
});

function handleFileUpload(files) {
    if (files.length === 0) return;

    uploadProgress.classList.remove('d-none');
    const progressBar = uploadProgress.querySelector('.progress-bar');

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.classList.add('d-none');
                successAlert.classList.remove('d-none');
                progressBar.style.width = '0%';
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

// Pagination functionality
function changePage(type, direction) {
    const currentPage = document.querySelector(`#${type}PageModal .page-item.active .page-link`);
    const currentPageNum = parseInt(currentPage.textContent);
    const allPages = document.querySelectorAll(`#${type}PageModal .page-item:not(:first-child):not(:last-child)`);

    let newPageNum;
    if (direction === 1) {
        newPageNum = Math.min(currentPageNum + 1, allPages.length);
    } else {
        newPageNum = Math.max(currentPageNum - 1, 1);
    }

    // Update active page
    allPages.forEach((page, index) => {
        if (index + 1 === newPageNum) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // In a real application, you would load the appropriate page data here
    console.log(`${type} page navigation: Page ${newPageNum}`);
}

// Add click handlers for pagination numbers
document.querySelectorAll('.pagination .page-link').forEach(link => {
    if (!link.innerHTML.includes('chevron')) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageNum = this.textContent;
            const modal = this.closest('.modal');
            const allPages = modal.querySelectorAll('.page-item:not(:first-child):not(:last-child)');

            allPages.forEach((page, index) => {
                if (index + 1 === parseInt(pageNum)) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    }
});

// Auto-hide success alert after 5 seconds
setTimeout(() => {
    successAlert.classList.add('d-none');
}, 5000);