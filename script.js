// Todo functionality
class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
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
      createdAt: new Date()
    };
    this.todos.unshift(todo);
    this.save();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  save() {
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

// Picture functionality
class PictureApp {
  constructor() {
    this.images = JSON.parse(localStorage.getItem('images')) || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
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
        createdAt: new Date()
      };
      this.images.unshift(image);
      this.save();
      this.render();
    };
    reader.readAsDataURL(file);
  }

  deleteImage(id) {
    this.images = this.images.filter(img => img.id !== id);
    this.save();
    this.render();
  }

  save() {
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

// Chat functionality
class ChatApp {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem('chat_messages')) || [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) {
        this.addMessage(text, 'user');
        chatInput.value = '';

        // Simulate bot response
        setTimeout(() => {
          this.addBotResponse(text);
        }, 1000);
      }
    });
  }

  addMessage(text, sender) {
    const message = {
      id: Date.now(),
      text: text,
      sender: sender,
      timestamp: new Date()
    };
    this.messages.push(message);
    this.save();
    this.render();
  }

  addBotResponse(userMessage) {
    const responses = [
      "面白いですね！もっと教えてください。",
      "なるほど、とても興味深いです。",
      "それについてどう思いますか？",
      "素晴らしいアイデアですね！",
      "もう少し詳しく聞かせてください。",
      "とても良い質問ですね。",
      "その通りです！",
      "興味深い視点ですね。"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    this.addMessage(randomResponse, 'bot');
  }

  clearMessages() {
    this.messages = [];
    this.save();
    this.render();
  }

  save() {
    localStorage.setItem('chat_messages', JSON.stringify(this.messages));
  }

  render() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    this.messages.forEach(message => {
      const div = document.createElement('div');
      div.className = `chat-message ${message.sender}`;

      const time = new Date(message.timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });

      div.innerHTML = `
        <div style="font-size: 0.8em; opacity: 0.7; margin-bottom: 5px;">
          ${message.sender === 'user' ? 'あなた' : 'Bot'} • ${time}
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