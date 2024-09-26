async function apiRequest(url, method, data = null, auth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
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
    result: json
  };
}

async function get(url, auth = true) {
  return apiRequest(url, 'GET', null, auth);
}

async function post(url, data, auth = true) {
  return apiRequest(url, 'POST', data, auth);
}

async function postFormData(url, formData) {
  const headers = {};

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    result: json
  };
}

function getToken() {
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  if (rememberMe) {
    return localStorage.getItem('authToken');
  } else {
    return sessionStorage.getItem('authToken');
  }
}

export { get, post, getToken, postFormData };
