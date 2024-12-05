import { API_BASE_URL } from './baseapi.js';
import { BASE_URL } from './baseurl.js';
document.addEventListener("DOMContentLoaded", () => {

    const homelinks = document.querySelectorAll(".homelink");

    homelinks.forEach(homelink => {
        homelink.addEventListener("click", (e) => {
            e.preventDefault(); 

            const user = JSON.parse(localStorage.getItem("user"));

            console.log(user.user.user);
            if (!user.user.user || !user.token || !user.user.user.role) {
                alert("User not logged in or role information is missing!");
                return;
            }
            if (user.user.user.role === "admin") {
                window.location.href = `${ BASE_URL }/admin`;
            } else if (user.user.user.role === "user") {
                window.location.href = `${ BASE_URL }/user`;
            } else {
                alert("Invalid role detected!");
            }
        });
    });

    const logouts = document.querySelectorAll(".logout");
    logouts.forEach(element => {
        element.addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = `${ BASE_URL }/login`;
        });
    });

    const project = JSON.parse(localStorage.getItem("projectData"));
    const user = JSON.parse(localStorage.getItem("user"));

    const projectname = document.querySelector(".projectname");
    const projectdescription = document.querySelector(".projectdescription");
    const projectworkersname = document.querySelector(".projectworkersname");
    const projectcreatedat = document.querySelector(".projectcreatedat");
    const projectstatus = document.querySelector(".projectstatus");
    const addreport = document.querySelector(".addreport");

    // Hide the "Add Report" button initially
    addreport.style.display = "none";

    projectname.innerHTML = project.name;
    projectdescription.innerHTML = project.description;

    if (Array.isArray(project.workers)) {
        const workersNames = project.workers.map(worker => worker.name).join(", ");
        projectworkersname.innerHTML = workersNames;
    } else {
        projectworkersname.innerHTML = "No workers assigned";
    }

    projectcreatedat.innerHTML = project.created_at.substring(0, 10);
    projectstatus.innerHTML = project.status[0].toUpperCase() + project.status.substring(1);

    axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;

    // Check user role and fetch reports accordingly
    axios.get(`${API_BASE_URL}/api/user-role`)
        .then((result) => {
            const role = result.data.role;

            let fetchReportsEndpoint;

            if (role === "admin") {
                fetchReportsEndpoint = `${API_BASE_URL}/api/projects/${project.id}`;
            } else {
                addreport.style.display = "block";
                fetchReportsEndpoint = `${API_BASE_URL}/api/projects/show/user/${user.user.user.id}/${project.id}`;
            }

            axios.get(fetchReportsEndpoint)
                .then((response) => {
                    const projectreports = document.querySelector(".projectreports");
                    const reports = response.data.reports.reverse();

                    reports.forEach(report => {
                        const details = document.createElement("details");
                        details.classList.add("mb-5", "intro-y");

                        const text = `
                            <summary class="bg-white question py-6 px-8 cursor-pointer select-none w-full outline-none">
                                ${report.title}
                                ${report.created_at.slice(0,10)}
                            </summary>
                            <p class="pt-1 pb-3 px-4 bg-red" style="background-color: #e3e3e3; color: black;">
                                ${report.description}
                            </p>`;

                        details.innerHTML = text;
                        projectreports.append(details);
                    });
                })
                .catch(error => {
                    console.error("Error fetching reports:", error);
                });
        })
        .catch(error => {
            console.error("Error checking user role:", error);
        });

    // Handle report form submission
    const reportForm = document.getElementById("reportForm");
    reportForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const projectData = JSON.parse(localStorage.getItem("projectData"));
        const projectId = projectData ? projectData.id : null;

        if (!projectId) {
            alert("Project ID is missing in localStorage.");
            return;
        }

        const title = document.getElementById("name").value;
        const description = document.getElementById("message").value;
        const deadLine = document.getElementById("datepicker-autohide").value;

        if (!title || !description || !deadLine) {
            alert("All fields are required.");
            return;
        }

        const reportData = {
            project_id: projectId,
            title: title,
            description: description,
            dead_line: deadLine
        };

        axios.post(`${API_BASE_URL}/api/reports`, reportData)
            .then(response => {
                if (response.data.success) {
                    window.location.reload();
                    reportForm.reset();
                } else {
                    alert("Failed to create report.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while creating the report.");
            });
    });
});
