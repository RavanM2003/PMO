import { API_BASE_URL } from './baseapi.js';

window.addEventListener("load", async function () {

    const homelinks = document.querySelectorAll(".homelink");

    homelinks.forEach(homelink => {
        homelink.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default navigation behavior

            const user = JSON.parse(localStorage.getItem("user"));

            if (!user || !user.token || !user.role) {
                alert("User not logged in or role information is missing!");
                return;
            }

            // Check user role and redirect
            if (user.role === "admin") {
                window.location.href = "admin.html";
            } else if (user.role === "user") {
                window.location.href = "user.html";
            } else {
                alert("Invalid role detected!");
            }
        });
    });

    let currentPage = 1; // Initialize the current page
    const count = 5; // Number of projects per page (adjust as needed)

    var logouts = document.querySelectorAll(".logout")
    logouts.forEach(element => {
        element.addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
    });
async function fetchProjects(page) {
    try {
        console.log(`Fetching projects for page: ${page}`); // Log the current page

        const user = localStorage.getItem('user');

        if (!user || !JSON.parse(user).token) {
            console.log('No user token found');
            alert('Token əldə edilə bilmədi!');
            return;
        }

        console.log('User token found:', JSON.parse(user).token); // Log user token for debugging

        const userprojects = await axios.get(`${API_BASE_URL}/api/projects/page/${count}?page=${page}`, {
            headers: {
                Authorization: `Bearer ${JSON.parse(user).token}`
            }
        });

        console.log('Projects data fetched:', userprojects.data); // Log fetched data

        const tbody = document.querySelector(".tbody");
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }
        tbody.innerHTML = ''; // Clear the existing table content

        if (!userprojects.data || !userprojects.data.data || userprojects.data.data.length === 0) {
            console.log('No projects available');
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="6" class="text-center p-4">Hələ ki heç bir proyekt yoxdur</td>
            `;
            tbody.appendChild(tr);
            return;
        }

        let color;
        let statusvalue;

        userprojects.data.data.forEach(project => {
            console.log('Processing project:', project); // Log each project for debugging

            if (project.status == "late") {
                color = "danger";
                statusvalue = "Gecikir";
            } else if (project.status == "late_report") {
                color = "danger-soft";
                statusvalue = "Report gecikir";
            } else {
                if (project.status == "okay") {
                    color = "success-soft";
                    statusvalue = "Davam edir";
                } else if (project.status == "pending") {
                    color = "warning";
                    statusvalue = "Gözləmədədir";
                } else if (project.status == "done") {
                    color = "success";
                    statusvalue = "Bitib";
                }
            }

            const usersString = project.users.map(user => user.name).join(", ");

            const tr = document.createElement("tr");
            tr.classList.add("py-10", "border-b", "border-gray-200", "hover:bg-gray-100");
            tr.innerHTML = `
                <td class="p-4">${project.name.slice(0, 10)}<span style="color: blue; font-weight:bold;"> ...</span></td>
                <td class="p-4">${usersString}</td>                
                <td class="p-4">${project.dead_line.slice(0, 10)}</td>
                <td class="p-4">${project.reports[project.reports.length - 1]?.title || 'Report Yoxdur'}</td>
                <td class="p-4">${project.reports[project.reports.length - 1]?.dead_line.slice(0, 10) || 'Report Yoxdur'}</td>
                <td class="p-4">    
                    <div class="alert alert-${color} show flex items-center mb-2">${statusvalue}</div>
                </td>`;
            tbody.appendChild(tr);

            tr.addEventListener("click", () => {
                localStorage.setItem('projectData', JSON.stringify(project));
                window.location = 'http://127.0.0.1:5501/projectdetail.html';
            });
        });

        console.log('Updating pagination with total pages:', userprojects.data.last_page); // Log total pages for debugging
        updatePagination(userprojects.data.last_page);

    } catch (error) {
        if (error.response) {
            console.error('Error response from API:', error.response.data);
            alert('Xəta baş verdi: ' + error.response.data.message);
        } else {
            console.error('Network error:', error.message);
            alert('Şəbəkə xətası: ' + error.message);
        }
    }
}


    function updatePagination(totalPages) {
        const paginationContainer = document.querySelector(".pagination_li");
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }
        console.log('Pagination container found:', paginationContainer);

        paginationContainer.innerHTML = ''; // Clear the current pagination

        for (let i = 1; i <= totalPages; i++) {
            console.log('Creating pagination link for page:', i); // Log page number

            const pageLink = document.createElement("li");
            pageLink.innerHTML = `
                <a class="pagination__link ${i === currentPage ? 'pagination__link--active' : ''}">${i}</a>
            `;
            pageLink.addEventListener('click', () => {
                console.log('Page link clicked:', i); // Log page link click
                currentPage = i;
                fetchProjects(currentPage);
            });
            paginationContainer.appendChild(pageLink);
        }
    }

    // Event listeners for the navigation buttons
    const leftChevron = document.querySelector(".chevrons-left");
    if (leftChevron) {
        leftChevron.addEventListener('click', () => {
            console.log('Left chevron clicked'); // Log button click
            if (currentPage > 1) {
                currentPage--;
                fetchProjects(currentPage);
            }
        });
    } else {
        console.error('Left chevron button not found');
    }

    const rightChevron = document.querySelector(".chevrons-right");
    if (rightChevron) {
        rightChevron.addEventListener('click', () => {
            console.log('Right chevron clicked'); // Log button click
            currentPage++;
            fetchProjects(currentPage);
        });
    } else {
        console.error('Right chevron button not found');
    }

    // Initial fetch of projects
    console.log('Initial fetch of projects');
    fetchProjects(currentPage);
});
