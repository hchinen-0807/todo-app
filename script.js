// Firebase configuration - using a public demo database
const firebaseConfig = {
  apiKey: "AIzaSyCqBqxd8F8nP5A2bJd6_6qGQqZ0tYwY9kE",
  authDomain: "todo-demo-share.firebaseapp.com",
  databaseURL: "https://todo-demo-share-default-rtdb.firebaseio.com/",
  projectId: "todo-demo-share",
  storageBucket: "todo-demo-share.appspot.com",
  messagingSenderId: "308425984316",
  appId: "1:308425984316:web:abc123def456ghi789"
};

let database;
let storage;
let isFirebaseReady = false;

// Initialize Firebase with better error handling
try {
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  storage = firebase.storage();

  // Test connection
  database.ref('.info/connected').on('value', (snapshot) => {
    isFirebaseReady = snapshot.val() === true;
    updateConnectionStatus();
  });

  console.log('Firebase initialized successfully');
} catch (error) {
  console.log('Firebase initialization failed:', error);
  isFirebaseReady = false;
}

// Update connection status function
function updateConnectionStatus() {
  const statusDiv = document.getElementById('connection-status');
  if (statusDiv) {
    if (isFirebaseReady) {
      statusDiv.textContent = '🌐 リアルタイム同期中';
      statusDiv.style.background = 'rgba(16, 185, 129, 0.8)';
    } else {
      statusDiv.textContent = '💾 ローカル保存';
      statusDiv.style.background = 'rgba(245, 158, 11, 0.8)';
    }
  }
}

// Todo functionality with Firebase sync
class TodoApp {
  constructor() {
    this.todos = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFirebaseListeners();
  }

  setupFirebaseListeners() {
    if (database && isFirebaseReady) {
      const todosRef = database.ref('todos');
      todosRef.on('value', (snapshot) => {
        const data = snapshot.val();
        this.todos = data ? Object.values(data) : [];
        this.render();
      });
    } else {
      this.todos = JSON.parse(localStorage.getItem('todos')) || [];
      this.render();
    }
  }

  bindEvents() {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');

    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (text) {
        this.addTodo(text);
        todoInput.value = '';
      }
    });
  }

  addTodo(text) {
    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (database && isFirebaseReady) {
      database.ref('todos').push(todo);
    } else {
      this.todos.unshift(todo);
      this.saveLocal();
      this.render();
    }
  }

  toggleTodo(id) {
    if (database && isFirebaseReady) {
      database.ref('todos').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.keys(data).forEach(key => {
            if (data[key].id === id) {
              database.ref(`todos/${key}/completed`).set(!data[key].completed);
            }
          });
        }
      });
    } else {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveLocal();
        this.render();
      }
    }
  }

  deleteTodo(id) {
    if (database && isFirebaseReady) {
      database.ref('todos').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.keys(data).forEach(key => {
            if (data[key].id === id) {
              database.ref(`todos/${key}`).remove();
            }
          });
        }
      });
    } else {
      this.todos = this.todos.filter(t => t.id !== id);
      this.saveLocal();
      this.render();
    }
  }

  saveLocal() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  render() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';

    this.todos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

      li.innerHTML = `
        <span class="todo-text">${todo.text}</span>
        <div class="todo-actions">
          <button class="complete-btn" onclick="todoApp.toggleTodo(${todo.id})">
            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
          </button>
          <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      todoList.appendChild(li);
    });
  }
}

// Picture functionality with Firebase sync
class PictureApp {
  constructor() {
    this.images = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFirebaseListeners();
  }

  setupFirebaseListeners() {
    if (database && isFirebaseReady) {
      const imagesRef = database.ref('images');
      imagesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        this.images = data ? Object.values(data) : [];
        this.render();
      });
    } else {
      this.images = JSON.parse(localStorage.getItem('images')) || [];
      this.render();
    }
  }

  bindEvents() {
    const pictureBtn = document.getElementById('picture-btn');
    const pictureInput = document.getElementById('picture-input');

    pictureBtn.addEventListener('click', () => {
      pictureInput.click();
    });

    pictureInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.addImage(file);
        }
      });
    });
  }

  addImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = {
        id: Date.now() + Math.random(),
        name: file.name,
        data: e.target.result,
        createdAt: new Date().toISOString()
      };

      if (database && isFirebaseReady) {
        database.ref('images').push(image);
      } else {
        this.images.unshift(image);
        this.saveLocal();
        this.render();
      }
    };
    reader.readAsDataURL(file);
  }

  deleteImage(id) {
    if (database && isFirebaseReady) {
      database.ref('images').once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          Object.keys(data).forEach(key => {
            if (data[key].id === id) {
              database.ref(`images/${key}`).remove();
            }
          });
        }
      });
    } else {
      this.images = this.images.filter(img => img.id !== id);
      this.saveLocal();
      this.render();
    }
  }

  saveLocal() {
    localStorage.setItem('images', JSON.stringify(this.images));
  }

  render() {
    const preview = document.getElementById('picture-preview');
    preview.innerHTML = '';

    this.images.forEach(image => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';

      container.innerHTML = `
        <img src="${image.data}" alt="${image.name}" class="preview-image"
             style="max-width: 200px; max-height: 200px; object-fit: cover;">
        <button onclick="pictureApp.deleteImage(${image.id})"
                style="position: absolute; top: 5px; right: 5px;
                       background: rgba(220, 53, 69, 0.8); color: white;
                       border: none; border-radius: 50%; width: 25px; height: 25px;
                       cursor: pointer; display: flex; align-items: center;
                       justify-content: center;">
          <i class="fas fa-times"></i>
        </button>
      `;

      preview.appendChild(container);
    });
  }
}

// Chat functionality with Firebase sync (no bot)
class ChatApp {
  constructor() {
    this.messages = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupFirebaseListeners();
  }

  setupFirebaseListeners() {
    if (database && isFirebaseReady) {
      const messagesRef = database.ref('messages');
      messagesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        this.messages = data ? Object.values(data).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];
        this.render();
      });
    } else {
      this.messages = JSON.parse(localStorage.getItem('chat_messages')) || [];
      this.render();
    }
  }

  bindEvents() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) {
        this.addMessage(text);
        chatInput.value = '';
      }
    });
  }

  addMessage(text) {
    const message = {
      id: Date.now(),
      text: text,
      timestamp: new Date().toISOString(),
      device: this.getDeviceInfo()
    };

    if (database && isFirebaseReady) {
      database.ref('messages').push(message);
    } else {
      this.messages.push(message);
      this.saveLocal();
      this.render();
    }
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return 'Mobile';
    } else if (/Tablet/.test(userAgent)) {
      return 'Tablet';
    } else {
      return 'PC';
    }
  }

  clearMessages() {
    if (database && isFirebaseReady) {
      database.ref('messages').remove();
    } else {
      this.messages = [];
      this.saveLocal();
      this.render();
    }
  }

  saveLocal() {
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
  }

  render() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    this.messages.forEach(message => {
      const div = document.createElement('div');
      div.className = 'chat-message user';

      const time = new Date(message.timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });

      div.innerHTML = `
        <div style="font-size: 0.8em; opacity: 0.7; margin-bottom: 5px;">
          ${message.device || 'Unknown'} • ${time}
        </div>
        <div>${message.text}</div>
      `;

      chatMessages.appendChild(div);
    });

    // Auto scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Initialize apps when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoApp();
  window.pictureApp = new PictureApp();
  window.chatApp = new ChatApp();

  // Add connection status indicator
  const statusDiv = document.createElement('div');
  statusDiv.id = 'connection-status';
  statusDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    border-radius: 20px;
    color: white;
    font-size: 12px;
    z-index: 1000;
    transition: all 0.3s ease;
  `;

  updateConnectionStatus();

  document.body.appendChild(statusDiv);

  // Add clear chat button
  const chatSection = document.querySelector('.chat-section h1');
  const clearBtn = document.createElement('button');
  clearBtn.innerHTML = '<i class="fas fa-eraser"></i>';
  clearBtn.style.cssText = `
    background: rgba(220, 53, 69, 0.1);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: #dc3545;
    cursor: pointer;
    margin-left: 10px;
    transition: all 0.3s ease;
  `;
  clearBtn.title = 'チャットをクリア';
  clearBtn.addEventListener('click', () => {
    if (confirm('すべてのチャットメッセージを削除しますか？')) {
      chatApp.clearMessages();
    }
  });
  clearBtn.addEventListener('mouseenter', () => {
    clearBtn.style.background = 'rgba(220, 53, 69, 0.2)';
    clearBtn.style.transform = 'scale(1.1)';
  });
  clearBtn.addEventListener('mouseleave', () => {
    clearBtn.style.background = 'rgba(220, 53, 69, 0.1)';
    clearBtn.style.transform = 'scale(1)';
  });

  chatSection.appendChild(clearBtn);
});