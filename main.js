const loginButton = document.getElementById('loginButton');
const fetchTodosButton = document.getElementById('fetchTodosButton');
const todoList = document.getElementById('todo-list');
const notification = document.getElementById('notification');
const todosContainer = document.getElementById('todos');

let userAuthToken = '';
let userId = '';

loginButton.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://json-with-auth.onrender.com/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            userAuthToken = data.accessToken;
            userId = data.user.id;

            localStorage.setItem('localAccessToken', userAuthToken);
            localStorage.setItem('userId', userId);

            notification.textContent = `Hey ${username}, welcome back!`;
            todosContainer.style.display = 'block';
        } else {
            let errorMessage = 'Login failed. Please check your credentials.';
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (jsonError) {
                // Handle cases where the error response is not JSON
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            notification.textContent = errorMessage;
        }
    } catch (error) {
        console.error('Error during login:', error);
        notification.textContent = 'An error occurred during login. Please try again later.';
    }
});

fetchTodosButton.addEventListener('click', fetchTodos);

async function fetchTodos() {
    try {
        const response = await fetch(`https://json-with-auth.onrender.com/todos?userId=${userId}`, {
            headers: {
                'Authorization': `Bearer ${userAuthToken}`,
            },
        });

        if (response.ok) {
            const todos = await response.json();
            displayTodos(todos);
        } else {
            console.error('Failed to fetch todos.');
            notification.textContent = 'Failed to fetch todos. Please try again later.';
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
        notification.textContent = 'An error occurred while fetching todos. Please try again later.';
    }
}

function displayTodos(todos) {
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const listItem = document.createElement('li');
        listItem.className = 'todo-item';
        listItem.innerHTML = `
            <input type="checkbox" id="todo-${todo.id}" ${todo.completed ? 'checked' : ''}>
            <label for="todo-${todo.id}">${todo.title}</label>
        `;
        const checkbox = listItem.querySelector('input');
        checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id, checkbox.checked));
        todoList.appendChild(listItem);
    });
}

async function toggleTodoCompletion(todoId, completed) {
    try {
        const response = await fetch(`https://json-with-auth.onrender.com/todos/${todoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userAuthToken}`,
            },
            body: JSON.stringify({ completed }),
        });

        if (!response.ok) {
            console.error('Failed to update todo.');
            notification.textContent = 'Failed to update todo. Please try again later.';
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        notification.textContent = 'An error occurred while updating the todo. Please try again later.';
    }
}
