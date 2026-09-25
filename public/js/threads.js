// grabs the new thread modal html from the server and drops it into the page
function openNewThreadModal() {
    fetch("/threads/new")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("modalContainer").innerHTML = html;
        });
}

// wipes out whatever's in the modal container, which hides the modal
function closeModal() {
    document.getElementById("modalContainer").innerHTML = "";
}

// turns a thread name into an editable input when you double-click it
function enableEdit(spanElement) {
    const threadId = spanElement.closest(".thread-item").dataset.id;
    const currentName = spanElement.textContent;

    // build an input to swap in place of the span
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.classList.add("edit-input");

    spanElement.replaceWith(input);
    input.focus();

    // save when they hit enter or click away
    function saveEdit() {
        const newName = input.value;

        fetch(`/threads/edit/${threadId}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `threadName=${encodeURIComponent(newName)}`
        });

        // swap the input back to a span with the new text
        // (not pulling from the server response since we're not
        // actually saving to the data file per the ticket)
        const newSpan = document.createElement("span");
        newSpan.classList.add("thread-name");
        newSpan.textContent = newName;
        newSpan.setAttribute("ondblclick", "enableEdit(this)");

        input.replaceWith(newSpan);
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            input.blur(); // triggers saveEdit via the blur listener above
        }
    });
}

// deletes a thread when the trash icon is clicked
function deleteThread(threadId) {
    const confirmed = confirm("Delete this thread?");
    if (!confirmed) return;

    fetch(`/threads/delete/${threadId}`, {
        method: "POST"
    }).then(() => {
        // find the li with this id and remove it from the page
        const threadItem = document.querySelector(`.thread-item[data-id="${threadId}"]`);
        threadItem.remove();
    });
}