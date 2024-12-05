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
                window.location.href = "https://pmo-c57.pages.dev/admin";
            } else if (user.user.user.role === "user") {
                window.location.href = "https://pmo-c57.pages.dev/user";
            } else {
                alert("Invalid role detected!");
            }
        });
    });
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    if (!localStorage.getItem("user")) {
        localStorage.clear();
        window.location.href = "https://pmo-c57.pages.dev/login";
    } else {
        const user = localStorage.getItem('user');
        axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(user).token}`;
        axios.get(`${API_BASE_URL}/api/user-role`)
            .then(response => {
                const role = response.data.role;
                if (role === "admin") {
                    document.body.style.display = "block";
                    loader.style.display = "none";
                } else {
                    if (role === "user") {
                        window.location.href = "https://pmo-c57.pages.dev/user";
                    } else if (role === "super_admin") {
                        localStorage.clear();
                        window.location.href = "https://pmo-c57.pages.dev/login";
                    } else {
                        window.location.href = "https://pmo-c57.pages.dev/login";
                    }
                }
            })
            .catch(error => {
                console.error("Error checking user role:", error);
                localStorage.clear();
                window.location.href = "https://pmo-c57.pages.dev/login";
            });
    }
});
