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
                window.location.href = `${ BASE_URL }/admin`;
            } else if (user.user.user.role === "user") {
                window.location.href = `${ BASE_URL }/user.html`;
            } else {
                alert("Invalid role detected!");
            }
        });
    });
    console.log("Script loaded successfully!");

    // Retrieve and validate stored admin data
    let storedAdmin;
    try {
        storedAdmin = JSON.parse(localStorage.getItem('user'));
        console.log("Parsed LocalStorage Data:", storedAdmin);
    } catch (error) {
        console.error("Error parsing localStorage data:", error);
        return;
    }

    if (!storedAdmin || !storedAdmin.token) {
        console.warn("No valid token found. Redirecting...");
        window.history.back();
        return;
    }

    var editprofilename = document.querySelector(".editprofilename");
    editprofilename.innerHTML = storedAdmin.user.user.name;

    // Configure Axios with the token for authentication
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedAdmin.token}`;
    console.log("Axios configured with token:", axios.defaults.headers.common['Authorization']);

    let role;
    try {
        console.log("Fetching user role...");
        const roleResponse = await axios.get(`${API_BASE_URL}/api/user-role`);
        role = roleResponse.data.role;
        console.log("User role fetched:", role);
    } catch (error) {
        console.error("Failed to fetch user role", error);
        alert("Failed to fetch user role. Please try again later.");
        return;
    }

    let previousPassword = "";

    if (storedAdmin.user.user) {
        const { name, email, password } = storedAdmin.user.user;
        document.getElementById("crud-form-1").value = name || "";
        document.getElementById("crud-form-3").value = email || "";
        
        previousPassword = password || "";
        console.log("Populated form fields with localStorage data");
    }

    // Handle form submission
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("crud-form-1").value;
        const email = document.getElementById("crud-form-3").value;
        const password = document.getElementById("crud-form-4").value;

        const payload = {
            name,
            email,
            password: password || previousPassword,
            role
        };
        console.log("Payload prepared:", payload);

        try {
            const response = await axios.put(`${API_BASE_URL}/api/update-by-user`, payload);
            console.log("Server response:", response.data);

            if (response.data) {
                // Update localStorage with new user data
                storedAdmin.user.user = {
                    ...storedAdmin.user.user,
                    name: response.data.name || name,
                    email: response.data.email || email,
                    password: response.data.password || previousPassword
                };
                localStorage.setItem('user', JSON.stringify(storedAdmin));
                console.log("LocalStorage updated with new user data:", storedAdmin);

                // Update the UI with the new data
                editprofilename.innerHTML = storedAdmin.user.user.name || "Unknown User";
                document.getElementById("crud-form-1").value = storedAdmin.user.user.name || "";
                document.getElementById("crud-form-3").value = storedAdmin.user.user.email || "";
            } else {
                console.error("API did not return updated data. LocalStorage not updated.");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        }
    });
});
