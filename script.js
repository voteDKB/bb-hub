const today = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = "bbhub_" + today;

const checkboxes = document.querySelectorAll('input[type="checkbox"]');

const progressFill = document.getElementById("progressFill");
const progressCount = document.getElementById("progressCount");
const progressMessage = document.getElementById("progressMessage");
const resetButton = document.getElementById("resetButton");

load();

checkboxes.forEach(box => {
    box.addEventListener("change", () => {
        save();
        updateProgress();
    });
});

resetButton.addEventListener("click", () => {
    if (!confirm("Reset today's checklist?")) return;

    checkboxes.forEach(box => {
        box.checked = false;
    });

    save();
    updateProgress();
});

function save() {

    const state = {};

    checkboxes.forEach(box => {
        state[box.dataset.task] = box.checked;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

}

function load() {

    const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    checkboxes.forEach(box => {
        box.checked = !!state[box.dataset.task];
    });

    updateProgress();

}

function updateProgress() {

    const total = checkboxes.length;

    const completed = [...checkboxes].filter(box => box.checked).length;

    const percent = Math.round((completed / total) * 100);

    progressFill.style.width = percent + "%";

    progressCount.textContent = `${completed} / ${total}`;

    if (completed === 0) {

        progressMessage.textContent =
            "Let's start today's voting tasks! 💙";

    } else if (completed < total) {

        progressMessage.textContent =
            `${total - completed} task${total - completed === 1 ? "" : "s"} remaining. Keep going!`;

    } else {

        progressMessage.textContent =
            "🎉 Great job BB! See you tomorrow!";

    }

}
