import { API_BASE_URL } from './baseapi.js';

document.addEventListener('DOMContentLoaded', async function () {
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
                window.location.href = "admin.html";
            } else if (user.user.user.role === "user") {
                window.location.href = "user.html";
            } else {
                alert("Invalid role detected!");
            }
        });
    });
    var logouts = document.querySelectorAll(".logout")
    logouts.forEach(element => {
        element.addEventListener("click", async (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.reload();
        });
    });
    const user = localStorage.getItem('user');
    const parsedUser = JSON.parse(user);
    const projectData = JSON.parse(localStorage.getItem('projectData'))
    const token = parsedUser?.token;
    const loggedInUserId = parsedUser?.user?.user?.id;

    if (!token || !loggedInUserId) {
        console.error('No authorization token or user ID found!');
        return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    let usersSelect, workersSelect;

    try {
        // Fetch users and initialize `usersSelect`
        const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
        const usersData = usersResponse.data;

        if (Array.isArray(usersData)) {
            const filteredUsers = usersData.filter(item => item.role === 'user');
            const usersOptions = filteredUsers.map(item => ({
                value: item.id,
                text: item.name
            }));

            usersSelect = new TomSelect("#users-select", {
                options: usersOptions,
                create: false,
                multiple: true,
                closeAfterSelect: false,
                maxItems: null,
                render: {
                    item: function (data, escape) {
                        return `<div class="my-item" data-value="${escape(data.value)}">${escape(data.text)}</div>`;
                    }
                }
            });

            usersSelect.setValue([loggedInUserId]);
        } else {
            console.error('Fetched users data is not an array.');
        }

        // Fetch workers and initialize `workersSelect`
        const workersEndpoint = `${API_BASE_URL}/api/workers/user/${loggedInUserId}`;
        const workersResponse = await axios.get(workersEndpoint);
        const workersData = workersResponse.data;

        if (Array.isArray(workersData) && workersData.length > 0) {
            const workersOptions = workersData.map(item => ({
                value: item.id,
                text: item.name
            }));

            workersSelect = new TomSelect("#workers-select", {
                options: workersOptions,
                create: false,
                multiple: true,
                closeAfterSelect: false,
                maxItems: null,
                render: {
                    item: function (data, escape) {
                        return `<div class="my-item" data-value="${escape(data.value)}">${escape(data.text)}</div>`;
                    }
                }
            });
        } else {
            console.log('User has no workers.');
        }
    } catch (error) {
        console.error('Error initializing dropdowns:', error);
    }

    const project = projectData;

    if (project) {
        usersSelect.setValue(project.users.map(item => item.id) || []);
        const working = project.workers.map(item => item.id) || []
        workersSelect.setValue(working);

        const dateObject = new Date(project.dead_line.slice(0,10));

        const formattedDate = `${
            dateObject.getMonth() + 1
        }/${dateObject.getDate()}/${dateObject.getFullYear()}`;

        document.getElementById('projectname').value = project.name || '';
        document.getElementById('description').value = project.description || '';
        document.querySelector("#datepicker-autohide").value = formattedDate;
        var selectoptions = document.querySelector(".projectstatus")
        console.log(project);
        
        for (let i = 0; i < selectoptions.children.length; i++) {
            if (project.status == selectoptions.children[i].value) {
                selectoptions.children[i].setAttribute("selected", true)
            }
        }
    }
    document.getElementById('save-project-button').addEventListener('click', async function (e) {
        e.preventDefault()
        const projectId = projectData?.id; // Assuming `projectData` contains the current project's ID
        const userId = loggedInUserId; // Use the logged-in user's ID for the URL
    
        if (!projectId || !userId) {
            console.error('No project ID or user ID found!');
            return;
        }
    
        const name = document.getElementById('projectname').value.trim();
        const description = document.getElementById('description').value.trim();
        const deadLine = document.querySelector("#datepicker-autohide").value.trim();
        const status = document.querySelector(".projectstatus").value;
    
        // Gather selected user and worker IDs
        const selectedUsers = usersSelect?.getValue() || [];
        const selectedWorkers = workersSelect?.getValue() || [];
    
        // Ensure required fields are filled
        if (!name || !description || !deadLine || !status) {
            console.error('Please fill in all required fields.');
            return;
        }
    
        const formattedDeadLine = new Date(deadLine).toISOString().split('T')[0]; // Format date as "YYYY-MM-DD"
    
        const projectUpdateData = {
            name,
            description,
            dead_line: formattedDeadLine,
            status,
            user_id: selectedUsers,
            worker_id: selectedWorkers
        };
    
        try {
            console.log(selectedWorkers);
            const updateUrl = `${API_BASE_URL}/api/projects/update/user/${userId}/${projectId}`;
            const response = await axios.put(updateUrl, projectUpdateData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (response.status === 200) {
                window.history.back()
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error updating the project:', error);
            alert('An error occurred while updating the project. Please try again.');
        }
    });
    document.getElementById('delete-project-button').addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default form submission if inside a form
    
        const projectId = projectData?.id; // Assuming `projectData` contains the current project's ID
    
        if (!projectId) {
            console.error('No project ID found!');
            alert('Unable to delete: No project ID found.');
            return;
        }
    
        const confirmDelete = confirm('Proyekti silmək istədiyinizdən əminsiniz? Proyekt silindikdən sonra geri qaytarmaq mümkün olmayacaq');
        if (!confirmDelete) {
            return; // Exit if user cancels the confirmation dialog
        }
    
        try {
            const deleteUrl = `${API_BASE_URL}/api/projects/${projectId}`;
            const response = await axios.delete(deleteUrl, {
                headers: {
                    'Authorization': `Bearer ${parsedUser.token}` // Include the token for authentication
                }
            });
    
            if (response.status === 200) {
                alert('Proyekt uğurla silindi!');
                window.history.back()
            } else {
                console.error('Unexpected response status:', response.status);
                alert('An error occurred while deleting the project. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting the project:', error);
            alert('Failed to delete the project. Please try again.');
        }
    });
    
});
