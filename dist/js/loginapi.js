import { API_BASE_URL } from './baseapi.js';
import { BASE_URL } from './baseurl.js';
document.addEventListener("DOMContentLoaded", () => {
    const storedUser = localStorage.getItem('user');
    
    // If user is already logged in, redirect based on their role
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        const token = userData.token; // Token stored in localStorage

        const loader = document.getElementById('loader');
        loader.style.display = 'block';

        // Fetch user role using the token
        axios.get(`${API_BASE_URL}/api/user-role`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            const role = response.data.role;
            console.log(role);
            if (role === 'user') {
                window.location.href="user"
            } else if (role === 'admin') {
                window.location.href="admin"
            } else {
                window.location.href = `${BASE_URL}/register`;
            }
        })
        .catch(error => {
            loader.style.display = 'none'; // Hide loader in case of error
            console.error('Error fetching role:', error);
            localStorage.clear(); // Clear localStorage if token is invalid
            window.location.href = `${BASE_URL}/login`;
        });
    } else {
        // Add login button functionality for users who are not logged in
        document.querySelector('.login_button').addEventListener('click', async () => {
            const email = document.querySelector('.login_email').value.trim();
            const password = document.querySelector('.login_password').value.trim();

            if (!email || !password) {
                alert('Email və şifrəni doldurun.');
                return;
            }

            const loader = document.getElementById('loader');
            loader.style.display = 'block';

            const data = {
                email: email,
                password: password
            };

            try {
                const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const token = loginResponse.data.token; // Token received from API

                if (token) {
                    localStorage.setItem('user', JSON.stringify(loginResponse.data));

                    const roleResponse = await axios.get(`${API_BASE_URL}/api/user-role`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const role = roleResponse.data.role; // Adjust based on API response
                    loader.style.display = 'none'; // Hide loader after role check

                    if (role === 'user') {
                        window.location.href = `${BASE_URL}/user`;
                        console.log("User logged in, role:", role);
                    } else if (role === 'admin') {
                        window.location.href = `${BASE_URL}/admin`;
                        console.log("Admin logged in, role:", role);
                    } else {
                        window.location.href = `${BASE_URL}/register`;
                    }
                } else {
                    alert('Token əldə edilə bilmədi!');
                    loader.style.display = 'none';
                }

            } catch (error) {
                loader.style.display = 'none'; // Hide loader in case of error
                if (error.response) {
                    alert('Giriş xətası: ' + error.response.data.message);
                    console.error('Error Response:', error.response.data);
                } else {
                    alert('Şəbəkə xətası: ' + error.message);
                    console.error('Network Error:', error.message);
                }
            }
        });
    }
});
