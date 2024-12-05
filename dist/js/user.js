import { API_BASE_URL } from './baseapi.js';

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
                window.location.href=`${ BASE_URL }/admin`
            } else if (user.user.user.role === "user") {
                window.location.href=`${ BASE_URL }/user`
            } else {
                alert("Invalid role detected!");
            }
        });
    });
    if (!localStorage.getItem('pageRefreshed')) {
        localStorage.setItem('pageRefreshed', 'true'); // Set the flag
        location.reload(); // Reload the page to fetch the latest data
        return; // Stop further script execution during the initial load
    } else {
        localStorage.removeItem('pageRefreshed'); // Clear the flag for future navigations
    }
    const loader = document.getElementById("loader");

    // Function to show the loader
    const showLoader = () => {
        loader.style.display = "block";
    };

    // Function to hide the loader
    const hideLoader = () => {
        loader.style.display = "none";
    };

    localStorage.removeItem('projectData');
    const user = localStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    document.querySelector(".user_name").innerHTML = parsedUser.user.user.name;

 
    var logouts = document.querySelectorAll(".logout")
    logouts.forEach(element => {
        element.addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
    });

    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    const apiBaseUrl = `${API_BASE_URL}/api/projects/page/user/${parsedUser.user.user.id}/5`;

    let currentPage = 1;
    let lastPage = 1;

    const fetchProjects = async (page = 1) => {
        showLoader();
        try {
            const result = await axios.get(`${apiBaseUrl}?page=${page}`);
    
            // Check if the result contains the expected data structure
            if (result.data && result.data.data && Array.isArray(result.data.data)) {
                const projects = result.data.data;
    
                currentPage = result.data.current_page || 1; // Default to 1 if not present
                lastPage = result.data.last_page || 1; // Default to 1 if not present
    
                if (projects.length > 0) {
                    renderProjects(projects);
                    renderPagination(lastPage, currentPage);
                } else {
                    console.log('No projects found for this user.');
                    document.querySelector("tbody").innerHTML = '<tr><td colspan="8" class="text-center">No projects available.</td></tr>';
                    document.querySelector(".pagination_li").innerHTML = ''; // Clear pagination
                }
            } else {
                throw new Error('Unexpected response structure from the API.');
            }
        } catch (error) {
    
            document.querySelector("tbody").innerHTML = '<tr><td colspan="8" class="text-center">Hələ ki heç bir proyektiniz yoxdur</td></tr>';
        } finally {
            hideLoader(); // Hide loader after completing the fetch
        }
    };
    

    // Function to render projects in the table
// Function to render projects in the table
const renderProjects = (projects) => {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ''; // Clear the existing content

    if (projects.length === 0) {
        // Display a message when no projects are available
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="8" class="p-4 text-center">No projects found.</td>`;
        tbody.appendChild(tr);
        return; // Exit the function early
    }

    projects.forEach((project, i) => {
        const tr = document.createElement("tr");
        tr.classList.add("py-10", "border-b", "border-gray-200", "hover:bg-gray-100");
        tr.style.cursor = "pointer";

        const latestReport = project.reports[project.reports.length - 1];
        const latestReportName = latestReport ? latestReport.title : 'No reports';
        const latestReportDeadline = latestReport ? latestReport.dead_line.slice(0, 10) : 'N/A';
        const workersNames = project.workers.map(worker => worker.name).join(', ');

        tr.addEventListener("click", () => {
            localStorage.setItem('projectData', JSON.stringify(project));
            window.location = `${ BASE_URL }/projectdetail`;
        });

        let statusvalue;
        let color;

        if (project.status === "late") {
            color = "danger";
            statusvalue = "Gecikir";
        } else if (project.status === "late_report") {
            color = "danger-soft";
            statusvalue = "Report gecikir";
        } else if (project.status === "okay") {
            color = "success-soft";
            statusvalue = "Davam edir";
        } else if (project.status === "pending") {
            color = "warning";
            statusvalue = "Gözləmədədir";
        } else if (project.status === "done") {
            color = "success";
            statusvalue = "Bitib";
        }

        tr.innerHTML = `
            <td class="p-4">${project.name}</td>
            <td class="p-4">${workersNames}</td>
            <td class="p-4">${project.created_at.slice(0, 10)}</td>
            <td class="p-4">${project.dead_line.slice(0, 10)}</td>
            <td class="p-4">${latestReportName}</td>
            <td class="p-4">${latestReportDeadline}</td>
            <td class="p-4">
                <div class="alert alert-${color} show flex items-center mb-2">${statusvalue}</div>
            </td>
            <td class="p-4">
                <div class="flex justify-center items-center">
                    <a class="flex items-center mr-3" href="./editproject.html" onclick="storeProjectData(${i})">
                        <button class="btn btn-rounded btn-primary-soft w-24 mr-1 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-square w-4 h-4 mr-1">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            Düzəlt
                        </button>
                    </a>
                </div>
            </td>`;
        tbody.append(tr);
    });
};


    // Function to render pagination links
    const renderPagination = (lastPage, currentPage) => {
        const paginationContainer = document.querySelector(".pagination_li");
        paginationContainer.innerHTML = ''; // Clear old pagination links

        for (let i = 1; i <= lastPage; i++) {
            const li = document.createElement("li");
            li.innerHTML = `<a class="pagination__link ${i === currentPage ? 'pagination__link--active' : ''}">${i}</a>`;
            li.addEventListener("click", () => {
                fetchProjects(i);
            });
            paginationContainer.appendChild(li);
        }

        // Enable/Disable chevrons based on the current page
        document.querySelector(".chevrons-left").classList.toggle("disabled", currentPage === 1);
        document.querySelector(".chevrons-right").classList.toggle("disabled", currentPage === lastPage);
    };

    // Event listeners for chevrons
    document.querySelector(".chevrons-left").addEventListener("click", () => {
        if (currentPage > 1) fetchProjects(currentPage - 1);
    });

    document.querySelector(".chevrons-right").addEventListener("click", () => {
        if (currentPage < lastPage) fetchProjects(currentPage + 1);
    });

    // Initial fetch for page 1
    fetchProjects();
});
