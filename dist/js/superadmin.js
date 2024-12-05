import { API_BASE_URL } from './baseapi.js';
import { BASE_URL } from './baseurl.js';
window.addEventListener("load", async () => {
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
                window.location.href=`${ BASE_URL }/admin`
            } else {
                alert("Invalid role detected!");
            }
        });
    });
    const storedAdmin = JSON.parse(localStorage.getItem('user'));
    if (!storedAdmin || !storedAdmin.token) {
        window.history.back();
        return;
    }

    // Set default Authorization header for Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedAdmin.token}`;

    let users = [];
    let deletedUsers = [];

    // Fetch active and soft-deleted users
    async function fetchUsers() {
        try {
            const [activeUsersResponse, deletedUsersResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/users`),
                axios.get(`${API_BASE_URL}/api/users/trash`)
            ]);

            users = activeUsersResponse.data;
            deletedUsers = deletedUsersResponse.data;
            displayUser(users[0]); // Display the first active user as an example
        } catch (error) {
            console.error('Failed to fetch users:', error);
            alert('User list could not be loaded.');
        }
    }

    // Initialize users
    await fetchUsers();


    // Display user information
    function displayUser(user) {
        const userDiv = document.querySelector('.max-w-sm');
        if (!user) {
            userDiv.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No user found</p>';
            return;
        }

        const isDeleted = deletedUsers.some(deletedUser => deletedUser.id === user.id);

        userDiv.innerHTML = `
            <a href="#">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${user.name}</h5>
            </a>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${user.email}</p>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">${user.role}</p>
            ${isDeleted
                ? `<a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-white btn btn-warning" onclick="restoreUser(${user.id})">Restore</a>`
                : `
                <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-white btn btn-danger-soft" onclick="softDelete(${user.id})">Soft Delete</a>
                <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-white btn btn-danger" onclick="hardDelete(${user.id})">Hard Delete</a>
                <a href="#" class="inline-flex items-center px-3 py-2 text-sm font-medium text-white btn btn-primary" onclick="editUser(${user.id})">Edit</a>
            `}
        `;
    }

    // Soft Delete User
    window.softDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/users/${id}`);
            alert('User soft-deleted successfully.');
            await fetchUsers();
        } catch (error) {
            console.error('Soft delete failed:', error);
            alert('Soft delete failed.');
        }
    };

    // Hard Delete User
    window.hardDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/users/trash/delete/${id}`);
            alert('User hard-deleted successfully.');
            await fetchUsers();
        } catch (error) {
            console.error('Hard delete failed:', error);
            alert('Hard delete failed.');
        }
    };

    // Restore User
    window.restoreUser = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/api/users/trash/restore/${id}`);
            alert('User restored successfully.');
            await fetchUsers();
        } catch (error) {
            console.error('Restore failed:', error);
            alert('Restore failed.');
        }
    };

    // Edit User Placeholder
   // Edit User
window.editUser = async (id) => {
    try {
        // Fetch the user details
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        const user = userResponse.data;

        // Pre-fill a modal or prompt with user details
        const updatedName = prompt("Edit Name:", user.name) || user.name;
        const updatedEmail = prompt("Edit Email:", user.email) || user.email;
        const updatedRole = prompt("Edit Role:", user.role) || user.role;

        // Create the updated user object
        const updatedUserData = {
            name: updatedName,
            email: updatedEmail,
            role: updatedRole,
        };

        // Send the updated user data to the server
        await axios.put(`${API_BASE_URL}/api/users/${id}`, updatedUserData);

        alert("User updated successfully.");
        await fetchUsers(); // Refresh the user list
    } catch (error) {
        console.error('Edit failed:', error);
        alert('Failed to edit the user. Please try again.');
    }
};


    // Fetch admin list and populate dropdown
    async function fetchAdminList() {
        try {
            const adminListResponse = await axios.get(`${API_BASE_URL}/api/users-list`);
            const adminList = adminListResponse.data;
            const workerUsersDropdown = document.querySelector('#worker_users');

            adminList.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.id;
                option.textContent = admin.name;
                workerUsersDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to fetch admin list:', error);
            alert('Admin list could not be loaded.');
        }
    }

    await fetchAdminList();

    // Register Worker
    document.querySelector('.worker_register_button').addEventListener('click', async (event) => {
        event.preventDefault();

        const name = document.querySelector('.worker_register_name').value.trim();
        const phone = document.querySelector('.worker_register_phone').value.trim();
        const email = document.querySelector('.worker_register_email').value.trim();
        const position = document.querySelector('.worker_register_position').value.trim();
        const adminId = document.querySelector('#worker_users').value;

        if (!name || !phone || !email || !position || !adminId) {
            alert('Please fill in all fields.');
            return;
        }

        const workerData = { name, phone, email, position, admin_id: adminId };

        try {
            const response = await axios.post(`${API_BASE_URL}/api/workers`, workerData);

            if (response.status === 200) {
                alert('Worker created successfully!');
                document.querySelector('.worker_register_name').value = '';
                document.querySelector('.worker_register_phone').value = '';
                document.querySelector('.worker_register_email').value = '';
                document.querySelector('.worker_register_position').value = '';
                document.querySelector('#worker_users').selectedIndex = 0;
            } else {
                alert('Failed to create worker.');
            }
        } catch (error) {
            console.error('Error creating worker:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
