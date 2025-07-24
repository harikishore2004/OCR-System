
const submitbutton = document.getElementById('FileSubmitButton');
let ocr_data = null;


async function FetchData() {
    try {
        const response = await fetch('http://127.0.0.1:8000/fetchdata')
        if (!response.ok) {
            const error = await response.json();
            showToast(error.message, error.category);
        }
        const data = await response.json();
        ocr_data = data;
        PopulateSinglePageDocs();
        PopulateMultiPageDocs();
    }
    catch (error) {
        console.error("Failed to fetch OCR data:", error);
    }

}
window.addEventListener('DOMContentLoaded', FetchData);

submitbutton.addEventListener('click', async (e) => {
    const allowed_files = ['application/pdf', 'image/tiff'];
    const file = document.getElementById("fileInput").files[0]
    const engine = document.getElementById("ocrEngineSelect").value;
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
    formdata.append("engine", engine);
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

    let borderClass = "border-info text-info";
    if (category === "success") borderClass = "border-success text-success";
    else if (category === "danger" || category === "error") borderClass = "border-danger text-danger";
    else if (category === "warning") borderClass = "border-warning text-warning";

    const toastHTML = `
    <div class="toast align-items-center border ${borderClass} border-5 bg-white mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body fw-bold fs-5">${message}</div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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

function PopulateSinglePageDocs() {
    const tablecontainer = document.getElementById("tables-container1")
    const docs = ocr_data["single_page_doc"];

    if (Object.keys(docs).length === 0) {
        let heading = document.createElement("h3");
        heading.innerText = "No Document Uploaded!"
        heading.classList.add("mt-4", "text-primary", "fw-bold");
        tablecontainer.classList.add("text-center");
        tablecontainer.appendChild(heading);
    }

    else {
        for (let docname in docs) {
            const heading = document.createElement("h5");
            heading.innerText = `${docname} | Engine: ${docname.engine}`;
            heading.classList.add("mt-4", "text-primary", "fw-bold");
            tablecontainer.appendChild(heading);

            const table_div = document.createElement("div");
            table_div.classList.add("table-responsive")
            tablecontainer.appendChild(table_div);


            const table = document.createElement("table");
            table.classList.add("table", "table-bordered", "table-striped", "align-middle")

            const thead = document.createElement("thead");
            table.classList.add("table-light")
            thead.innerHTML = `
            <tr>
                <th>Line no.</th>
                <th>Line Text</th>
                <th>X</th>
                <th>Y</th>
                <th>Width</th>
                <th>Height</th>
                <th>Timestamp</th>
            </tr>
        `;
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            const pages = docs[docname];
            for (let page in pages) {
                const lines = pages[page];
                lines.forEach((line, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${line.line_text}</td>
                <td>${line.x}</td>
                <td>${line.y}</td>
                <td>${line.width}</td>
                <td>${line.height}</td>
                <td>${line.timestamp}</td>
            `;
                    tbody.appendChild(tr);
                });
            }
            table.appendChild(tbody);
            table_div.appendChild(table)
        }
    }


}


function PopulateMultiPageDocs() {
    const tablecontainer = document.getElementById("tables-container2")
    const docs = ocr_data["multi_page_doc"];
    if (Object.keys(docs).length === 0) {
        let heading = document.createElement("h3");
        heading.innerText = "No Document Uploaded!"
        heading.classList.add("mt-4", "text-primary", "fw-bold");
        tablecontainer.classList.add("text-center");
        tablecontainer.appendChild(heading);
    }

    else {
        for (let docname in docs) {
            const heading = document.createElement("h5");
            heading.innerText = docname;
            heading.classList.add("mt-4", "text-primary", "fw-bold");
            tablecontainer.appendChild(heading);

            const table_div = document.createElement("div");
            table_div.classList.add("table-responsive")
            tablecontainer.appendChild(table_div);


            const table = document.createElement("table");
            table.classList.add("table", "table-bordered", "table-striped", "align-middle")

            const thead = document.createElement("thead");
            table.classList.add("table-light")
            thead.innerHTML = `
            <tr>
                <th>Line no.</th>
                <th>Line Text</th>
                <th>X</th>
                <th>Y</th>
                <th>Width</th>
                <th>Height</th>
                <th>Page no.</th>
                <th>Timestamp</th>
            </tr>
        `;
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            const pages = docs[docname];
            for (let page in pages) {
                const lines = pages[page];
                lines.forEach((line, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${line.line_text}</td>
                <td>${line.x}</td>
                <td>${line.y}</td>
                <td>${line.width}</td>
                <td>${line.height}</td>
                <td>${page}</td>
                <td>${line.timestamp}</td>
            `;
                    tbody.appendChild(tr);
                });
            }
            table.appendChild(tbody);
            table_div.appendChild(table)
        }
    }
}
