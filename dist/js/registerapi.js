import { API_BASE_URL } from './baseapi.js';
window.addEventListener("load", async()=>{
    const storedAdmin = JSON.parse(localStorage.getItem('user'));
    if (!storedAdmin || !storedAdmin.token) {
        window.history.back();
        return; 
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedAdmin.token}`;
    
    const result = await axios.get(`${API_BASE_URL}/api/user-role`);
        
    console.log('User Role Response:', result.data);

    const userRole = result.data.role;
    
    if (userRole === 'super_admin') {
        document.querySelector(".logina").style.display = "block"
    } else if (userRole === 'admin') {
        window.history.back();
    } else if (userRole === 'user') {
        window.history.back();
        return; 
    } else {
        console.error('Unknown role:', userRole);
        alert();
        return;
    }

    
    
})
document.querySelector('.register_button').addEventListener('click', async (event) => {
    event.preventDefault();
    
    try {
        const name = document.querySelector('.register_name').value.trim();
        const email = document.querySelector('.register_email').value.trim();
        const password = document.querySelector('.register_password').value.trim();
        const role = document.querySelector('.register_role').value.trim();
    
        // Validate inputs
        if (!name || !email || !password || !role) {
            console.error('Bütün sahələri doldurun.');
            alert('Bütün sahələri doldurun.');
            return;
        }
    
        const newUser = { name, email, password, role };

        const response = await axios.post(`${API_BASE_URL}/api/register`, newUser, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log('Yeni istifadəçi yaradıldı:', response.data);
    
        alert('Yeni istifadəçi uğurla yaradıldı!');
        window.location.reload()
    } catch (error) {
        console.error('Error occurred:', error);

        if (error.response) {
            console.error('Error Response:', error.response);
            alert('Xəta baş verdi: ' + (error.response.data.message || 'No message available'));
        } else if (error.request) {
            console.error('No response received:', error.request);
            alert('Şəbəkə xətası: Serverdən cavab alındı');
        } else {
            console.error('Error Message:', error.message);
            alert('Xəta baş verdi: ' + error.message);
        }
    }
});
