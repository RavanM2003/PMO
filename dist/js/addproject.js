import { API_BASE_URL } from './baseapi.js';
document.addEventListener('DOMContentLoaded', function () {
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
    const token = parsedUser.token;
    const loggedInUserId = parsedUser.user.user.id;

    if (!token || !loggedInUserId) {
        console.error('No authorization token or user ID found!');
        return;
    }

    let usersSelect;

    document.querySelector(".logout").addEventListener("click", async (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.reload();
    });
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch users for the "users-select" dropdown
    axios.get(`${API_BASE_URL}/api/users`)
        .then(response => {
            const data = response.data;
            if (Array.isArray(data)) {
                const filteredUsers = data.filter(item => item.role === 'user');
                const usersOptions = filteredUsers.map(item => ({
                    value: item.id,
                    text: item.name
                }));

                // Initialize TomSelect for user selection
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
                    },
                    onChange: function (values) {
                        console.log('Selected Users:', values);
                    }
                });

                // Set the logged-in user as the default selected user
                usersSelect.setValue([loggedInUserId]);
            } else {
                console.error('Fetched users data is not an array.');
            }
        })
        .catch(error => {
            console.error('Error fetching users data:', error);
        });

    let workersSelect;

    // Fetch workers for the "workers-select" dropdown
    const workersEndpoint = `${API_BASE_URL}/api/workers/user/${loggedInUserId}`;

    axios.get(workersEndpoint)
        .then(response => {
            const data = response.data;
            if (Array.isArray(data) && data.length > 0) {
                const workersOptions = data.map(item => ({
                    value: item.id,
                    text: item.name
                }));

                // Initialize TomSelect for worker selection
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
                    },
                    onChange: function (values) {
                        console.log('Selected workers:', values);
                    }
                });
            } else {
                console.log('User has no workers.');
            }
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                console.log('User has no workers.');
            } else {
                console.error('Error fetching workers data:', error);
            }
        });

    // Handle project creation
    const createProjectButton = document.getElementById('yadda-saxla');
    
    if (createProjectButton) {
        createProjectButton.addEventListener('click', function (event) {
            event.preventDefault();  // Prevent the default form submission (page reload)

            const projectName = document.getElementById('projectname').value;
            const projectDescription = document.getElementById('description').value;
            const dead_line = document.querySelector(".dead_line").value;
            const status = document.querySelector(".projectstatus").value;

            if (!workersSelect) {
                console.error('Workers select is not initialized.');
                return;
            }

            const assignedWorkerIds = workersSelect.getValue().map(id => parseInt(id, 10));
            const assignedUserIds = usersSelect.getValue().map(id => parseInt(id, 10));

            // Validate the input
            if (!projectName || projectDescription.length === 0) {
                console.error('Project name, description must be provided.');
                return;
            }

            const newProject = {
                name: projectName,
                description: projectDescription,
                dead_line: dead_line,
                status: status,
                user_id: assignedUserIds,
                worker_id: assignedWorkerIds
            };
            console.log(newProject);

            // Send the data to create a new project
            axios.post(`${API_BASE_URL}/api/projects`, newProject)
                .then(response => {
                    console.log('Project created successfully:', response.data);
                    document.getElementById('projectname').value = '';
                    document.getElementById('description').value = '';
                    workersSelect.setValue([]);
                    alert('Project created successfully!');
                    window.history.back();  // Go back to the previous page
                })
                .catch(error => {
                    console.error('Error creating project:', error);
                });
        });
    }
});
