import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const cpfService = {
  consultar: async (cpf) => {
    const response = await axios.post(`${API}/cpf/consultar`, { cpf });
    return response.data;
  }
};

export const darfService = {
  obter: async (protocol) => {
    const response = await axios.get(`${API}/darf/${protocol}`);
    return response.data;
  }
};

export const pixService = {
  gerar: async (protocol, value, cpf) => {
    const response = await axios.post(`${API}/pix/gerar`, { protocol, value, cpf });
    return response.data;
  },
  verificar: async (protocol) => {
    const response = await axios.get(`${API}/pix/verificar/${protocol}`);
    return response.data;
  }
};

export const chatService = {
  ask: async (question, maxSources = 5, conversationId = null) => {
    const response = await axios.post(`${API}/chat`, {
      question,
      max_sources: maxSources,
      conversation_id: conversationId,
    });
    return response.data;
  },
  getStats: async () => {
    const response = await axios.get(`${API}/chat/stats`);
    return response.data;
  },
  createConversation: async (title = null) => {
    const response = await axios.post(`${API}/chat/conversations`, { title });
    return response.data;
  },
  listConversations: async () => {
    const response = await axios.get(`${API}/chat/conversations`);
    return response.data;
  },
  getConversation: async (conversationId) => {
    const response = await axios.get(`${API}/chat/conversations/${conversationId}`);
    return response.data;
  },
  deleteConversation: async (conversationId) => {
    const response = await axios.delete(`${API}/chat/conversations/${conversationId}`);
    return response.data;
  },
  updateTitle: async (conversationId, title) => {
    const response = await axios.put(`${API}/chat/conversations/${conversationId}/title`, { title });
    return response.data;
  },
};

export const documentService = {
  upload: async (formData) => {
    const response = await axios.post(`${API}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  list: async (status) => {
    const params = status ? { status } : {};
    const response = await axios.get(`${API}/documents`, { params });
    return response.data;
  },
  get: async (docId) => {
    const response = await axios.get(`${API}/documents/${docId}`);
    return response.data;
  },
  delete: async (docId) => {
    const response = await axios.delete(`${API}/documents/${docId}`);
    return response.data;
  },
  getSubjects: async () => {
    const response = await axios.get(`${API}/documents/subjects`);
    return response.data;
  },
  getStats: async () => {
    const response = await axios.get(`${API}/documents/stats`);
    return response.data;
  }
};
