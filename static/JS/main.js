
const submitbutton = document.getElementById('FileSubmitButton');
let ocr_data = null;
let docnames = null;
let currnet_page = 0;
let total_pages = 0;

function nextPage() {
    if (currnet_page < total_pages) {
        currnet_page++;
        renderPage(currnet_page);
    }
}

function prevPage() {
    if (currnet_page > 0) {
        currnet_page--;
        renderPage(currnet_page);
    }
}

function initPages() {
    docnames = Object.keys(ocr_data["multi_page_doc"]);
    total_pages = (docnames.length) - 1;
    renderPage(currnet_page);
}

function renderPage(docno) {
    // console.log(docnames[docno]);
    const tablecontainer = document.getElementById("tables-container2")
    console.log(total_pages)
    if (total_pages === -1) {
        let heading = document.createElement("h3");
        heading.innerText = "No Document Uploaded!"
        heading.classList.add("mt-4", "text-primary", "fw-bold");
        tablecontainer.classList.add("text-center");
        tablecontainer.appendChild(heading);
        document.getElementById("prev-btn").disabled = true;
        document.getElementById("next-btn").disabled = true;
    }

    else {
        tablecontainer.innerHTML = "";
        const heading = document.createElement("h5");
        heading.innerText = docnames[docno];
        heading.classList.add("mt-4", "text-primary", "fw-bold");
        tablecontainer.appendChild(heading);

        // Adding the Table 
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

        const docContent = ocr_data["multi_page_doc"][docnames[docno]];
        // console.log("DocC", docContent);
        for (let page in docContent) {
            // console.log("Page no ---------------------",page);
            lines = docContent[page];
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
                // console.log(`Line Text ${line.line_text}, x = ${line.x}, ${line.y}, ${line.width}, ${line.height}`)
            });


        }
        table.appendChild(tbody);
        table_div.appendChild(table)
        document.getElementById("prev-btn").disabled = docno === 0;
        document.getElementById("next-btn").disabled = docno === total_pages;
    }
}

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
        initPages();
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
        showToast(data.message, data.category);
        e.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        data = { "message": "File size is greater then 10MB", "category": "danger" };
        showToast(data.message, data.category);
        return;
    }

    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("engine", engine);
    const loadingToastId = showProcessingToast();
    try {
        const response = await fetch("http://127.0.0.1:8000/upload", {
            method: "POST",
            body: formdata,
        });

        const result = await response.json();
        removeToast(loadingToastId);

        if (!response.ok) {
            console.error("Server returned error:", result.message);
            showToast(result.message, result.category);
            setTimeout(() => window.location.reload(), 2000);
            return;
        }
        showToast(result.message, result.category);
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
    catch (error) {
        removeToast(loadingToastId);

        console.error("Upload Failed", error);
    }


});


function showProcessingToast() {
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center border border-warning border-5 bg-white mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold fs-5 d-flex align-items-center gap-2">
                    <span class="spinner-border text-warning ms-3" role="status" aria-hidden="true" style="width: 1.5rem; height: 1.5rem;"></span>
                    Processing...
                </div>
            </div>
        </div>
    `;
    const toastContainer = document.getElementById("flash-container"); // Ensure this exists in HTML
    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    const toastElement = new bootstrap.Toast(document.getElementById(toastId), { autohide: false });
    toastElement.show();

    return toastId;
}

function removeToast(toastId) {
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
        const toastInstance = bootstrap.Toast.getInstance(toastEl);
        toastInstance && toastInstance.hide();
        setTimeout(() => {
            toastEl.remove();
        }, 500);

    }
}


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

    const toast = new bootstrap.Toast(toastElement, { delay: 2000 });
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
        let img_path = null;
        for (let docname in docs) {
            let ext = docname.split(".");
            if (ext[1] === "pdf") {
                img_path = `/uploads/pdf/${ext[0]}/1_page.png`;
            }
            else {
                img_path = `/uploads/tiff/${ext[0]}/1_page.png`;
            }
            console.log();
            const heading = document.createElement("h5");
            const button = document.createElement("a");
            heading.innerText = `${docname}`;
            button.innerText = "View Image";
            button.setAttribute('target', '_blank');
            heading.classList.add("mt-4", "text-primary", "fw-bold");
            button.classList.add("btn", "btn-primary", "me-2", "p-3");
            button.href = img_path;

            tablecontainer.appendChild(heading);
            tablecontainer.appendChild(button);

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
    // console.log("docs = ", docs)
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


