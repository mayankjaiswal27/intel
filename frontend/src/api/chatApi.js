const BASE_URL = 'http://localhost:5000/api/conversations';

export const fetchConversations = async () => {
  const response = await fetch(BASE_URL);
  return response.json();
};

export const fetchConversation = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`);
  return response.json();
};

export const createConversation = async (chatName) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_name: chatName, history: [] }),
  });
  return response.json();
};

export const appendToConversation = async (id, prompt, response) => {
  const responseApi = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, response }),
  });
  return responseApi.json();
};
export const deleteConversation = async (chatId) => {
  const response = await fetch(`http://localhost:5000/api/conversations/${chatId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete conversation');
  }

  return response.json();
};
