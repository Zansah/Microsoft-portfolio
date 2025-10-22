// Base Configuration
const GITHUB_USERNAME = 'zansah';

// States
let repositories = [];
let portfolioProjects = [];
let leetcodeData = { easy: 0, medium: 0, hard: 0, total: 3721 };

// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const recentsList = document.getElementById('recentsList');
const addMemberBtn = document.getElementById('addMemberBtn');
const contactModal = document.getElementById('contactModal');
const closeModalBtn = document.getElementById('closeModal');
const todoToggle = document.getElementById('todoToggle');
const todoModal = document.getElementById('todoModal');
const closeTodoBtn = document.getElementById('closeTodo');
const todoInput = document.getElementById('todoInput');
const todoDateInput = document.getElementById('todoDateInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const todoMonth = document.getElementById('todoMonth');
const exportDataBtn = document.getElementById('exportDataBtn');
const exportModal = document.getElementById('exportModal');
const confirmExportBtn = document.getElementById('confirmExport');
const cancelExportBtn = document.getElementById('cancelExport');
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const projectModal = document.getElementById('projectModal');
const closeProjectModal = document.getElementById('closeProjectModal');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalLink = document.getElementById('projectModalLink');
const projectIframe = document.getElementById('projectIframe');

let todos = [];

// Update Time and Date
function updateTimeAndDate() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutesStr} ${ampm}`;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${months[now.getMonth()]} ${days[now.getDay()]} ${now.getDate()}`;
    
    currentTimeEl.textContent = timeStr;
    currentDateEl.textContent = dateStr;
}

updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);

// Dark and Light themes Functions
function initTheme() {
    const savedTheme = getCookie('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcon();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    setCookie('theme', theme, 365);
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// To-Do Functions
function updateTodoMonth() {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    todoMonth.textContent = months[now.getMonth()];
}

function saveTodos() {
    const todosData = JSON.stringify(todos);
    document.cookie = `todos=${encodeURIComponent(todosData)}; max-age=31536000; path=/`;
}

function loadTodos() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'todos') {
            try {
                todos = JSON.parse(decodeURIComponent(value));
            } catch (e) {
                todos = [];
            }
            return;
        }
    }
    todos = [];
}

function renderTodos() {
    todoList.innerHTML = '';
    if (todos.length === 0) {
        todoList.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">No tasks scheduled</div>';
        return;
    }
    
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        const date = new Date(todo.date);
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        
        const formattedDate = date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        todoItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; flex: 1;">
                <div style="text-align: center; min-width: 40px;">
                    <div style="font-size: 12px; color: #999;">${dayName}</div>
                    <div style="font-size: 20px; font-weight: bold;">${dayNum}</div>
                </div>
                <div class="todo-item-content">
                    <div class="todo-item-text">${todo.text}</div>
                    <div class="todo-item-time">${formattedDate}</div>
                </div>
            </div>
            <div class="todo-item-actions">
                <button class="todo-edit-btn" onclick="editTodo(${index})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="todo-complete-btn" onclick="toggleTodo(${index})">${todo.completed ? '↺' : '✓'}</button>
                <button class="todo-delete-btn" onclick="deleteTodo(${index})">×</button>
            </div>
        `;
        
        todoList.appendChild(todoItem);
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const dueDate = todoDateInput.value ? new Date(todoDateInput.value) : new Date();
    
    todos.push({
        text: text,
        date: dueDate.toISOString(),
        time: '',
        completed: false
    });
    
    saveTodos();
    renderTodos();
    todoInput.value = '';
    todoDateInput.value = '';
}

window.editTodo = function(index) {
    const todo = todos[index];
    const newText = prompt('Edit task:', todo.text);
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        
        const currentDate = new Date(todo.date);
        const dateStr = currentDate.toISOString().slice(0, 16);
        const newDateStr = prompt('Edit due date and time (YYYY-MM-DDTHH:MM):', dateStr);
        
        if (newDateStr) {
            const newDate = new Date(newDateStr);
            if (!isNaN(newDate.getTime())) {
                todo.date = newDate.toISOString();
            }
        }
        
        saveTodos();
        renderTodos();
    }
};

window.toggleTodo = function(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
};

window.deleteTodo = function(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
};

// Project Modal Events
closeProjectModal.addEventListener('click', () => {
    projectModal.classList.add('hidden');
    projectIframe.src = '';
});

projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        projectModal.classList.add('hidden');
        projectIframe.src = '';
    }
});

function openProjectPreview(name, link) {
    projectModalTitle.textContent = name;
    projectModalLink.href = link;
    projectIframe.src = link;
    projectModal.classList.remove('hidden');
    markProjectAsVisited(link);
}

// To-Do Modal Events
todoToggle.addEventListener('click', () => {
    todoModal.classList.remove('hidden');
    updateTodoMonth();
    renderTodos();
});

closeTodoBtn.addEventListener('click', () => {
    todoModal.classList.add('hidden');
});

todoModal.addEventListener('click', (e) => {
    if (e.target === todoModal) {
        todoModal.classList.add('hidden');
    }
});

addTodoBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Sidebar Events
toggleBtn.addEventListener('click', () => {
    sidebar.classList.remove('closed');
});

closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('closed');
});

addMemberBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    contactModal.classList.remove('hidden');
    sidebar.classList.add('closed');
});

closeModalBtn.addEventListener('click', () => {
    contactModal.classList.add('hidden');
});

contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        contactModal.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    const isModalOpen = contactModal && !contactModal.classList.contains('hidden');
    
    if (!sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target) && 
        !sidebar.classList.contains('closed') &&
        !isModalOpen) {
        sidebar.classList.add('closed');
    }
});

// Export Functions
function exportPortfolioData() {
    const dataToExport = {
        github: {
            username: GITHUB_USERNAME,
            repositories: repositories
        },
        projects: portfolioProjects,
        leetcode: leetcodeData,
        todos: todos,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

exportDataBtn.addEventListener('click', () => {
    exportModal.classList.remove('hidden');
    sidebar.classList.add('closed');
});

confirmExportBtn.addEventListener('click', () => {
    exportPortfolioData();
    exportModal.classList.add('hidden');
});

cancelExportBtn.addEventListener('click', () => {
    exportModal.classList.add('hidden');
});

exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.classList.add('hidden');
    }
});

// GitHub Repository Functions
async function fetchRepositories() {
    if (!GITHUB_USERNAME) {
        recentsList.innerHTML = `
            <div class="loading-message">
                Set your GitHub username in main.js to display recent repositories
            </div>
        `;
        return;
    }
    
    try {
        recentsList.innerHTML = '<div class="loading-message">Loading repositories...</div>';
        
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        repositories = data;
        
        displayRepositories(repositories);
    } catch (error) {
        recentsList.innerHTML = `
            <div class="loading-message">
                Error loading repositories. Please check the username and try again.
            </div>
        `;
    }
}

function displayRepositories(repos) {
    recentsList.innerHTML = '';
    
    if (repos.length === 0) {
        recentsList.innerHTML = `
            <div class="loading-message">
                No repositories found
            </div>
        `;
        return;
    }
    
    repos.forEach(repo => {
        const recentItem = document.createElement('a');
        recentItem.className = 'recent-item';
        recentItem.href = repo.homepage || repo.html_url;
        recentItem.target = '_blank';
        recentItem.rel = 'noopener noreferrer';
        recentItem.textContent = repo.name;
        recentItem.title = repo.description || repo.name;
        
        recentsList.appendChild(recentItem);
    });
}

// Portfolio Data Functions
async function loadPortfolioData() {
    try {
        const response = await fetch('portfolioData.json');
        const data = await response.json();
        portfolioProjects = data.projects || [];
        leetcodeData = data.leetcode || { easy: 0, medium: 0, hard: 0, total: 3721 };
        
        loadProjectProgress();
        updateLeetCodeDisplay();
        updateProjectProgress();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        portfolioProjects = [
            { name: "Cookie Clicker", link: "https://zansah.github.io/cookie-clicker/", visited: false },
            { name: "BlackJack", link: "https://zansah.github.io/blackjack/", visited: false },
            { name: "Volleyball Scoreboard", link: "https://zansah.github.io/Volleyball-Scoreboard/", visited: false },
            { name: "Color Generator", link: "https://zansah.github.io/Color-Gen/", visited: false },
            { name: "Periodic Table", link: "https://zansah.github.io/Periodic-Table/", visited: false }
        ];
        leetcodeData = { easy: 50, medium: 80, hard: 16, total: 3721 };
        updateLeetCodeDisplay();
        updateProjectProgress();
    }
}

function updateLeetCodeDisplay() {
    const total = leetcodeData.easy + leetcodeData.medium + leetcodeData.hard;
    const circumference = 2 * Math.PI * 45;
    
    document.getElementById('leetcodeNumber').textContent = total;
    document.getElementById('leetcodeTotal').textContent = `/${leetcodeData.total}`;
    document.getElementById('easyCount').textContent = `Easy: ${leetcodeData.easy}`;
    document.getElementById('mediumCount').textContent = `Medium: ${leetcodeData.medium}`;
    document.getElementById('hardCount').textContent = `Hard: ${leetcodeData.hard}`;
    
    // Calculate percentages for each difficulty
    const easyPercent = (leetcodeData.easy / total) * 100;
    const mediumPercent = (leetcodeData.medium / total) * 100;
    const hardPercent = (leetcodeData.hard / total) * 100;
    
    // Calculate cumulative offsets for stacked circles
    const easyOffset = circumference * (1 - easyPercent / 100);
    const mediumStart = easyPercent;
    const mediumOffset = circumference * (1 - mediumPercent / 100);
    const hardStart = easyPercent + mediumPercent;
    const hardOffset = circumference * (1 - hardPercent / 100);
    
    // Apply to circles
    document.getElementById('easyCircle').style.strokeDashoffset = easyOffset;
    document.getElementById('mediumCircle').style.strokeDashoffset = mediumOffset;
    document.getElementById('mediumCircle').style.strokeDasharray = `${circumference}`;
    document.getElementById('mediumCircle').style.transform = `rotate(${(easyPercent / 100) * 360}deg)`;
    
    document.getElementById('hardCircle').style.strokeDashoffset = hardOffset;
    document.getElementById('hardCircle').style.strokeDasharray = `${circumference}`;
    document.getElementById('hardCircle').style.transform = `rotate(${(hardStart / 100) * 360}deg)`;
}

function updateProjectProgress() {
    const visitedCount = portfolioProjects.filter(p => p.visited).length;
    const totalCount = portfolioProjects.length;
    const percentage = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
    
    document.getElementById('progressPercent').textContent = `${percentage}%`;
    document.getElementById('progressCirclePath').setAttribute('stroke-dasharray', `${percentage}, 100`);
    
    // Trigger confetti at 100%
    if (percentage === 100 && !sessionStorage.getItem('confettiShown')) {
        createConfetti();
        sessionStorage.setItem('confettiShown', 'true');
    }
    
    // Update platform button colors
    updatePlatformButtonColors();
}

function createConfetti() {
    const colors = ['#f59e0b', '#ef4444', '#3aed7c', '#2E6BBB']; // Yellow, Red, Green, Blue
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 6000);
    }
}

function updatePlatformButtonColors() {
    const platformButtons = document.querySelectorAll('.platform-btn');
    
    platformButtons.forEach(button => {
        const link = button.getAttribute('href');
        const project = portfolioProjects.find(p => p.link === link);
        
        if (project && project.visited) {
            button.classList.add('visited');
        } else {
            button.classList.remove('visited');
        }
    });
}

function markProjectAsVisited(link) {
    const project = portfolioProjects.find(p => p.link === link);
    if (project && !project.visited) {
        project.visited = true;
        updateProjectProgress();
        saveProjectProgress();
    }
}

function saveProjectProgress() {
    const progressData = JSON.stringify(portfolioProjects.map(p => ({ link: p.link, visited: p.visited })));
    setCookie('projectProgress', progressData, 365);
}

function loadProjectProgress() {
    const saved = getCookie('projectProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            progress.forEach(saved => {
                const project = portfolioProjects.find(p => p.link === saved.link);
                if (project) {
                    project.visited = saved.visited;
                }
            });
        } catch (e) {
            console.error('Error loading project progress:', e);
        }
    }
}

// Search Functions
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const searchActions = document.querySelector('.search-actions');
    
    if (query === '') {
        clearSearchResults();
        clearAutocomplete();
        searchActions.style.display = 'flex';
        return;
    }
    
    searchActions.style.display = 'none';
    
    const results = portfolioProjects.filter(project => 
        project.name.toLowerCase().includes(query)
    );
    
    if (results.length > 0) {
        displayAutocomplete(results, query);
    } else {
        clearAutocomplete();
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase().trim();
        if (query) {
            const results = portfolioProjects.filter(project => 
                project.name.toLowerCase().includes(query)
            );
            displaySearchResults(results, query);
            clearAutocomplete();
        }
    }
});

function displayAutocomplete(results, query) {
    let autocompleteContainer = document.querySelector('.autocomplete-suggestions');
    
    if (!autocompleteContainer) {
        autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-suggestions';
        const searchContainer = document.querySelector('.search-container');
        searchContainer.parentNode.insertBefore(autocompleteContainer, searchContainer.nextSibling);
    }
    
    const topResults = results.slice(0, 5);
    
    autocompleteContainer.innerHTML = topResults.map(project => {
        const name = project.name;
        const index = name.toLowerCase().indexOf(query);
        const before = name.substring(0, index);
        const match = name.substring(index, index + query.length);
        const after = name.substring(index + query.length);
        
        return `
            <div class="autocomplete-item" data-link="${project.link}" data-name="${project.name}">
                <span class="autocomplete-text">
                    ${before}<strong>${match}</strong>${after}
                </span>
                <span class="autocomplete-arrow">→</span>
            </div>
        `;
    }).join('');
    
    autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const link = item.getAttribute('data-link');
            const name = item.getAttribute('data-name');
            openProjectPreview(name, link);
            clearAutocomplete();
            clearSearchResults();
            searchInput.value = '';
            document.querySelector('.search-actions').style.display = 'flex';
        });
    });
}

function clearAutocomplete() {
    const autocompleteContainer = document.querySelector('.autocomplete-suggestions');
    if (autocompleteContainer) {
        autocompleteContainer.remove();
    }
}

function displaySearchResults(results, query) {
    let resultsContainer = document.querySelector('.search-results');
    
    if (results.length === 0) {
        if (resultsContainer) resultsContainer.remove();
        return;
    }
    
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        const searchContainer = document.querySelector('.search-container');
        searchContainer.parentNode.insertBefore(resultsContainer, searchContainer.nextSibling);
    }
    
    resultsContainer.innerHTML = `
        <div class="search-results-header">Search Results for "${query}"</div>
        ${results.map(project => `
            <a href="#" class="search-result-item" data-link="${project.link}" data-name="${project.name}">
                <span class="search-result-name">${project.name}</span>
                <span class="search-result-arrow">→</span>
            </a>
        `).join('')}
    `;
    
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const link = item.getAttribute('data-link');
            const name = item.getAttribute('data-name');
            openProjectPreview(name, link);
            clearSearchResults();
            searchInput.value = '';
            document.querySelector('.search-actions').style.display = 'flex';
        });
    });
}

function clearSearchResults() {
    const resultsContainer = document.querySelector('.search-results');
    if (resultsContainer) {
        resultsContainer.remove();
    }
}

document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    const resultsContainer = document.querySelector('.search-results');
    const autocompleteContainer = document.querySelector('.autocomplete-suggestions');
    
    if (resultsContainer && 
        !searchContainer.contains(e.target) && 
        !resultsContainer.contains(e.target)) {
        clearSearchResults();
        document.querySelector('.search-actions').style.display = 'flex';
    }
    
    if (autocompleteContainer &&
        !searchContainer.contains(e.target) &&
        !autocompleteContainer.contains(e.target)) {
        clearAutocomplete();
        document.querySelector('.search-actions').style.display = 'flex';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTodos();
    fetchRepositories();
    loadPortfolioData();
    
    // Add click handlers to platform buttons after a short delay to ensure projects are loaded
    setTimeout(() => {
        document.querySelectorAll('.platform-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const link = button.getAttribute('href');
                const name = button.querySelector('span:last-child').textContent;
                openProjectPreview(name, link);
            });
        });
    }, 500);
});