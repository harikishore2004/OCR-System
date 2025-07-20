
const submitbutton = document.getElementById('FileSubmitButton');


submitbutton.addEventListener('click', async (e) => {
    const allowed_files = ['application/pdf', 'image/tiff'];
    const file = document.getElementById("fileInput").files[0]
    if (!file) return;

    if (!allowed_files.includes(file.type)) {
        data = { "message": "Invalid File Format", "category": "danger" };
        showToast(data);
        e.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        data = { "message": "File size is greater then 10MB", "category": "danger" };
        showToast(data);
    }

    const formdata = new FormData();
    formdata.append("file", file);
    try {
        const response = await fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formdata,
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Server returned error:", error.detail);
            showToast(error.message, error.category)
            return;
        }
        const result = await response.json();
        showToast(result.message, result.category)
        console.log("uploaded")
        document.getElementById("fileInput").value = "";
    }
    catch (error) {
        console.error("Upload Failed", error)
    }


});


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

    allPages.forEach((page, index) => {
        if (index + 1 === newPageNum) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    console.log(`${type} page navigation: Page ${newPageNum}`);
}

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


function showToast(message, category = "info") {
    const flashContainer = document.getElementById("flash-container");

    let bgClass = "text-bg-info";
    if (category === "success") bgClass = "text-bg-success";
    else if (category === "danger" || category === "error") bgClass = "text-bg-danger";
    else if (category === "warning") bgClass = "text-bg-warning";

    const toastHTML = `
        <div class="toast align-items-center ${bgClass} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold fs-5">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = toastHTML.trim();
    const toastElement = tempDiv.firstChild;
    flashContainer.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();
    toastElement.addEventListener("hidden.bs.toast", () => {
        toastElement.remove();
    });

}

