const baseUrl = 'http://localhost:3000'; // Change this if your backend URL is different

document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const gender = document.getElementById('register-gender').value;

    try {
        const response = await fetch(`${baseUrl}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, name, gender })
        });

        const result = await response.text();
        document.getElementById('result').innerText = result;
    } catch (error) {
        document.getElementById('result').innerText = 'Error: ' + error.message;
    }
});

document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${baseUrl}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        document.getElementById('result').innerText = 'JWT Token: ' + result.jwtToken;
    } catch (error) {
        document.getElementById('result').innerText = 'Error: ' + error.message;
    }
});
