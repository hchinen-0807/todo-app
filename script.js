// Firebase configuration - correct project todo-c3338
const firebaseConfig = {
  apiKey: "AIzaSyApbWdnaIM2Rzzld5TAojm7iL2qxRucEpU",
  authDomain: "todo-c3338.firebaseapp.com",
  projectId: "todo-c3338",
  storageBucket: "todo-c3338.appspot.com",
  messagingSenderId: "281558547303",
  appId: "1:281558547303:web:8e8c2dcc30c016dc7a8dc2"
};

let db;
let auth;
let storage;
let isFirebaseReady = false;
let currentUser = null;

// Initialize Firebase with enhanced error handling
console.log('🔧 Initializing Firebase...');
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🚀 Firebase app initialized');
    console.log('📋 Project ID:', firebaseConfig.projectId);
    console.log('🔑 API Key (partial):', firebaseConfig.apiKey.substring(0, 20) + '...');
  }

  db = firebase.firestore();
  auth = firebase.auth();
  storage = firebase.storage();

  // Test Firestore connection with allowed path
  console.log('🧪 Testing Firestore connection...');
  db.collection('boards').doc('public').collection('todos').limit(1).get()
    .then((snapshot) => {
      console.log('✅ Firestore connection test successful');
    }).catch((error) => {
      console.log('❌ Firestore connection test failed:', error);
    });

  // Setup authentication with detailed logging
  auth.onAuthStateChanged((user) => {
    console.log('🔄 Auth state changed. User:', user ? user.uid : 'null');
    console.log('🌐 Project ID:', firebaseConfig.projectId);
    console.log('🔗 Auth Domain:', firebaseConfig.authDomain);
    console.log('📱 User Agent:', navigator.userAgent);

    if (user) {
      currentUser = user;
      isFirebaseReady = true;
      console.log('✅ User authenticated successfully');
      console.log('👤 User UID:', user.uid);
      console.log('🔑 User is Anonymous:', user.isAnonymous);
      console.log('📧 User Email:', user.email || 'None');
      updateConnectionStatus();

      // Test actual data access
      console.log('🧪 Testing data access...');
      db.collection('boards').doc('public').collection('todos').limit(1).get()
        .then((snapshot) => {
          console.log('✅ Data access test successful. Docs:', snapshot.size);

          // Initialize apps after successful test
          setTimeout(() => {
            console.log('🔄 Starting app initialization...');
            if (window.todoApp) {
              console.log('📝 Initializing Todo listeners');
              window.todoApp.setupFirebaseListeners();
            }
            if (window.pictureApp) {
              console.log('🖼️ Initializing Picture listeners');
              window.pictureApp.setupFirebaseListeners();
            }
            if (window.chatApp) {
              console.log('💬 Initializing Chat listeners');
              window.chatApp.setupFirebaseListeners();
            }
          }, 500);
        })
        .catch((error) => {
          console.log('❌ Data access test failed:', error);
        });
    } else {
      console.log('🔑 No user found, signing in anonymously...');
      isFirebaseReady = false;
      updateConnectionStatus();

      auth.signInAnonymously().then(() => {
        console.log('✅ Anonymous sign-in successful');
      }).catch((error) => {
        console.log('❌ Anonymous sign-in failed:', error.code, error.message);
        isFirebaseReady = false;
        updateConnectionStatus();
      });
    }
  });

  console.log('✅ Firebase setup completed');
} catch (error) {
  console.log('💥 Firebase initialization failed:', error);
  isFirebaseReady = false;
  updateConnectionStatus();
}

// Update connection status function
function updateConnectionStatus() {
  const statusDiv = document.getElementById('connection-status');
  if (statusDiv) {
    if (isFirebaseReady && currentUser) {
      statusDiv.textContent = '🌐 リアルタイム同期中';
      statusDiv.style.background = 'rgba(16, 185, 129, 0.8)';
      console.log('✅ Status: Real-time sync active');
    } else {
      statusDiv.textContent = '🔄 接続中...';
      statusDiv.style.background = 'rgba(245, 158, 11, 0.8)';
      console.log('⏳ Status: Connecting...');
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
    console.log('🔄 Setting up Todo Firebase listeners. Ready:', isFirebaseReady);
    if (db) {
      const todosRef = db.collection('boards').doc('public').collection('todos');
      todosRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        console.log('📝 Firestore todos data received:', snapshot.size, 'items');
        this.todos = [];
        snapshot.forEach((doc) => {
          this.todos.push({ id: doc.id, ...doc.data() });
        });
        this.render();
      }, (error) => {
        console.log('❌ Firestore todos listener error:', error);
      });
    } else {
      console.log('⚠️ Firestore not available, will retry...');
      setTimeout(() => this.setupFirebaseListeners(), 2000);
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
      text: text,
      completed: false,
      createdAt: firebase.firestore.Timestamp.now()
    };

    if (db && isFirebaseReady) {
      console.log('Adding todo to Firestore:', todo);
      db.collection('boards').doc('public').collection('todos')
        .add(todo)
        .then((docRef) => {
          console.log('Todo added to Firestore successfully:', docRef.id);
        })
        .catch((error) => {
          console.log('❌ Failed to add todo to Firestore:', error);
        });
    } else {
      console.log('⚠️ Firebase not available for Todo add');
    }
  }

  toggleTodo(id) {
    if (db && isFirebaseReady) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        db.collection('boards').doc('public').collection('todos')
          .doc(id)
          .update({ completed: !todo.completed })
          .then(() => {
            console.log('Todo toggled successfully');
          })
          .catch((error) => {
            console.log('Failed to toggle todo:', error);
          });
      }
    } else {
      console.log('⚠️ Firebase not available for Todo toggle');
    }
  }

  deleteTodo(id) {
    if (db && isFirebaseReady) {
      db.collection('boards').doc('public').collection('todos')
        .doc(id)
        .delete()
        .then(() => {
          console.log('Todo deleted successfully');
        })
        .catch((error) => {
          console.log('Failed to delete todo:', error);
        });
    } else {
      console.log('⚠️ Firebase not available for Todo delete');
    }
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
          <button class="complete-btn" onclick="window.todoApp.toggleTodo('${todo.id}')">
            <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
          </button>
          <button class="delete-btn" onclick="window.todoApp.deleteTodo('${todo.id}')">
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
    console.log('🔄 Setting up Picture Firebase listeners. Ready:', isFirebaseReady);
    if (db) {
      const imagesRef = db.collection('boards').doc('public').collection('images');
      imagesRef.orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        console.log('🖼️ Firestore images data received:', snapshot.size, 'items');
        this.images = [];
        snapshot.forEach((doc) => {
          this.images.push({ id: doc.id, ...doc.data() });
        });
        this.render();
      }, (error) => {
        console.log('❌ Firestore images listener error:', error);
      });
    } else {
      console.log('⚠️ Firestore not available, will retry...');
      setTimeout(() => this.setupFirebaseListeners(), 2000);
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

      if (db && isFirebaseReady) {
        console.log('Adding image to Firestore:', image.name);
        image.createdAt = firebase.firestore.Timestamp.now();
        delete image.id;

        db.collection('boards').doc('public').collection('images')
          .add(image)
          .then((docRef) => {
            console.log('Image added to Firestore successfully:', docRef.id);
          })
          .catch((error) => {
            console.log('❌ Failed to add image to Firestore:', error);
          });
      } else {
        console.log('⚠️ Firebase not available for Picture add');
      }
    };
    reader.readAsDataURL(file);
  }

  deleteImage(id) {
    if (db && isFirebaseReady) {
      db.collection('boards').doc('public').collection('images')
        .doc(id)
        .delete()
        .then(() => {
          console.log('Image deleted successfully');
        })
        .catch((error) => {
          console.log('Failed to delete image:', error);
        });
    } else {
      console.log('⚠️ Firebase not available for Picture delete');
    }
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
        <button onclick="window.pictureApp.deleteImage('${image.id}')"
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
    console.log('🔄 Setting up Chat Firebase listeners. Ready:', isFirebaseReady);
    if (db) {
      const messagesRef = db.collection('boards').doc('public').collection('messages');
      messagesRef.orderBy('timestamp', 'asc').onSnapshot((snapshot) => {
        console.log('💬 Firestore messages data received:', snapshot.size, 'items');
        this.messages = [];
        snapshot.forEach((doc) => {
          this.messages.push({ id: doc.id, ...doc.data() });
        });
        this.render();
      }, (error) => {
        console.log('❌ Firestore messages listener error:', error);
      });
    } else {
      console.log('⚠️ Firestore not available, will retry...');
      setTimeout(() => this.setupFirebaseListeners(), 2000);
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
      text: text,
      timestamp: firebase.firestore.Timestamp.now(),
      device: this.getDeviceInfo()
    };

    if (db && isFirebaseReady) {
      console.log('Adding message to Firestore:', message);
      db.collection('boards').doc('public').collection('messages')
        .add(message)
        .then((docRef) => {
          console.log('Message added to Firestore successfully:', docRef.id);
        })
        .catch((error) => {
          console.log('❌ Failed to add message to Firestore:', error);
        });
    } else {
      console.log('⚠️ Firebase not available for Chat add');
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
    if (db && isFirebaseReady) {
      const batch = db.batch();
      db.collection('boards').doc('public').collection('messages')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          return batch.commit();
        })
        .then(() => {
          console.log('All messages deleted successfully');
        })
        .catch((error) => {
          console.log('Failed to delete messages:', error);
        });
    } else {
      console.log('⚠️ Firebase not available for Chat clear');
    }
  }


  render() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    this.messages.forEach(message => {
      const div = document.createElement('div');
      div.className = 'chat-message user';

      const timestamp = message.timestamp?.toDate ? message.timestamp.toDate() : new Date(message.timestamp);
      const time = timestamp.toLocaleTimeString('ja-JP', {
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