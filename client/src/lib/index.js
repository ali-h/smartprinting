async function apiRequest(url, method, data = null, auth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const json = await response.json();
  return {
    status: response.status,
    ...json
  };
}

async function get(url, auth = true) {
  return apiRequest(url, 'GET', null, auth);
}

async function post(url, data, auth = true) {
  return apiRequest(url, 'POST', data, auth);
}

async function postFormData(url, formData, auth = true) {
  const headers = {};

  if (auth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method: 'POST',
    headers,
    body: formData
  };

  const response = await fetch(url, options);
  const json = await response.json();
  return {
    status: response.status,
    ...json
  };
}

function togglePasswordVisibility(event) {
  const target = event.target.getAttribute('data-toggle');
  const input = document.getElementById(target);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

function getToken () {
  const token = localStorage.getItem('authToken');
  if (token) {
    return token;
  }

  return null;
}

export { togglePasswordVisibility, get, post, getToken, postFormData };
