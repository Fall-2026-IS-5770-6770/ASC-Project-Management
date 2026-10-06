// ===========================================================
// Project Person Associations — client-side behavior
// This file only handles things a browser needs to do on its own.
// It does NOT talk to the server directly — forms still submit
// normally to your Express routes.
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {

  // ---- 1. Open/close the "Add Association" modal ----
  // Expects: a button with [data-open-modal="add-association-modal"]
  // and an overlay element with id="add-association-modal"
  const openButtons = document.querySelectorAll("[data-open-modal]");
  openButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.getElementById(btn.dataset.openModal);
      if (modal) modal.classList.add("open");
    });
  });

  const closeButtons = document.querySelectorAll("[data-close-modal]");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) modal.classList.remove("open");
    });
  });

  // ---- 2. Confirm before delete ----
  // Expects each delete icon to sit inside its own small <form>
  // that already points at the correct POST .../delete route, e.g.:
  //
  // <form action="/projects/people/5/delete" method="POST" class="delete-form">
  //   <button type="submit" class="icon del">🗑️</button>
  // </form>
  const deleteForms = document.querySelectorAll(".delete-form");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const confirmed = confirm(
        "Are you sure you want to delete this association?"
      );
      if (!confirmed) {
        event.preventDefault(); // stops the form — nothing is sent to the server
      }
      // if confirmed, we do nothing and let the form submit normally
    });
  });

});
