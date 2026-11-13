const API_URL = "http://127.0.0.1:8000/students";

const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");

let allStudents = [];

// CREATE
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        age: Number(document.getElementById("age").value),
        course: document.getElementById("course").value.trim()
    };

    if (!student.name || !student.course || student.age <= 0) {
        alert("Please enter valid student details.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        form.reset();
        await loadStudents();

        alert(result.message);

    } catch (error) {
        alert(error.message || "Cannot connect to Python server.");
    }
});

// READ
async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        const data = await response.json();

        allStudents = data.students;

        updateStatistics();
        displayStudents(allStudents);

    } catch (error) {
        studentList.textContent = "Unable to connect to Python server.";
    }
}

// DISPLAY STUDENTS
function displayStudents(students) {
    studentList.innerHTML = "";

    document.getElementById("recordCount").textContent =
        `${students.length} records`;

    if (students.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = allStudents.length === 0
            ? "No students registered yet. Add your first student above."
            : "No matching students found.";

        studentList.appendChild(empty);
        return;
    }

    students.forEach((student, index) => {

        const card = document.createElement("div");
        card.className = "student-card";
        card.style.animationDelay = `${index * 0.07}s`;

        const details = document.createElement("p");

        details.textContent =
            `ID: ${student.id} | Name: ${student.name} | Age: ${student.age} | Course: ${student.course}`;

        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.className = "update-btn";

        updateButton.addEventListener("click", () => {
            updateStudent(student);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        card.append(details, updateButton, deleteButton);
        studentList.appendChild(card);
    });
}

// DASHBOARD STATISTICS
function updateStatistics() {

    document.getElementById("totalStudents").textContent =
        allStudents.length;

    const uniqueCourses = new Set(
        allStudents.map(student =>
            student.course.trim().toLowerCase()
        )
    );

    document.getElementById("totalCourses").textContent =
        uniqueCourses.size;
}

// SEARCH STUDENTS
searchInput.addEventListener("input", function() {

    const searchValue = this.value.toLowerCase().trim();

    const filteredStudents = allStudents.filter(student => {

        return (
            String(student.id).includes(searchValue) ||
            student.name.toLowerCase().includes(searchValue) ||
            student.course.toLowerCase().includes(searchValue)
        );

    });

    displayStudents(filteredStudents);
});

// UPDATE
async function updateStudent(student) {

    const name = prompt("Enter new name:", student.name);

    if (name === null) return;

    const age = prompt("Enter new age:", student.age);

    if (age === null) return;

    const course = prompt("Enter new course:", student.course);

    if (course === null) return;

    const updatedStudent = {
        name: name.trim(),
        age: Number(age),
        course: course.trim()
    };

    if (
        !updatedStudent.name ||
        !updatedStudent.course ||
        !Number.isInteger(updatedStudent.age) ||
        updatedStudent.age <= 0
    ) {
        alert("Please enter valid details.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${student.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedStudent)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        await loadStudents();
        searchInput.dispatchEvent(new Event("input"));

        alert(result.message);

    } catch (error) {
        alert(error.message || "Update failed.");
    }
}

// DELETE
async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        await loadStudents();
        searchInput.dispatchEvent(new Event("input"));

        alert(result.message);

    } catch (error) {
        alert(error.message || "Delete failed.");
    }
}

// SCROLL REVEAL ANIMATION
const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.12
    }
);

document.querySelectorAll(".reveal").forEach(section => {
    observer.observe(section);
});

// INITIAL LOAD
loadStudents();