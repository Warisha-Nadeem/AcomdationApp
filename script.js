// Application State
class TravelfreeApp {
    constructor() {
        this.currentUser = null;
        this.hosts = this.generateSampleHosts();
        this.photos = this.generateSamplePhotos();
        this.requests = [];
        this.chats = {};
        this.currentSection = 'hero';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.updateUI();
    }
    

    // Event Binding
    bindEvents() {
        // Navigation
        document.getElementById('exploreBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('explore');
        });
        
        document.getElementById('hostBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('host');
        });
        
        document.getElementById('photosBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('photos');
        });

        // Mobile navigation
        document.getElementById('mobileExplore').addEventListener('click', (e) => {
        e.preventDefault();
        this.showSection('explore');
    });
    document.getElementById('mobileHost').addEventListener('click', (e) => {
        e.preventDefault();
        this.showSection('host');
    });
    document.getElementById('mobilePhotos').addEventListener('click', (e) => {
        e.preventDefault();
        this.showSection('photos');
    });
    document.getElementById('mobileLogin').addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('loginModal');
    });
    document.getElementById('mobileSignup').addEventListener('click', (e) => {
        e.preventDefault();
        this.showModal('signupModal');
    });
        document.getElementById('mobileToggle').addEventListener('click', () => {
            this.toggleMobileMenu();
        });
document.getElementById('mobileMenuClose').addEventListener('click', () => {
    this.toggleMobileMenu();
});

document.getElementById('mobileMenuOverlay').addEventListener('click', () => {
    this.toggleMobileMenu();
});
        // Hero buttons
        document.getElementById('heroExploreBtn').addEventListener('click', () => {
            this.showSection('explore');
        });
        
        document.getElementById('heroHostBtn').addEventListener('click', () => {
            this.showSection('host');
        });

        // Authentication
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });
        
        document.getElementById('signupBtn').addEventListener('click', () => {
            this.showModal('signupModal');
        });

        // Modal switches
        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('signupModal');
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('signupModal');
            this.showModal('loginModal');
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('hostForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleHostRegistration();
        });

        document.getElementById('requestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStayRequest();
        });

        document.getElementById('photoUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePhotoUpload();
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Chat
        document.getElementById('chatSendBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInputField').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        document.getElementById('chatImageBtn').addEventListener('click', () => {
            document.getElementById('chatImageInput').click();
        });

        document.getElementById('chatImageInput').addEventListener('change', (e) => {
            this.handleChatImageUpload(e);
        });

        // Photo upload
        document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
            if (!this.currentUser) {
                this.showToast('Please login to share photos', 'error');
                this.showModal('loginModal');
                return;
            }
            this.showModal('photoUploadModal');
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                this.hideModal(modalId);
            });
        });

        // Profile tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Google auth buttons
        document.getElementById('googleLogin').addEventListener('click', () => {
            this.handleGoogleAuth('login');
        });

        document.getElementById('googleSignup').addEventListener('click', () => {
            this.handleGoogleAuth('signup');
        });
    }

    // Navigation Methods
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section, #heroSection').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const sectionMap = {
            'hero': 'heroSection',
            'explore': 'exploreSection',
            'host': 'hostSection',
            'photos': 'photosSection',
            'profile': 'profileSection'
        };

        const sectionId = sectionMap[sectionName];
        if (sectionId) {
            document.getElementById(sectionId).style.display = 'block';
            this.currentSection = sectionName;
        }

        // Load section-specific data
        if (sectionName === 'explore') {
            this.loadHosts();
        } else if (sectionName === 'photos') {
            this.loadPhotos();
        } else if (sectionName === 'profile') {
            this.loadProfile();
        }

        // Close mobile menu
        document.getElementById('mobileMenu').classList.remove('show');
    }

    toggleMobileMenu() {
        document.getElementById('mobileMenu').classList.toggle('show');
    }

    // Modal Methods
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    // Authentication Methods
handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
        this.showToast('Please fill in all fields', 'error');
        return;
    }
    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            firestore.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    this.currentUser = { ...user, ...doc.data(), uid: user.uid };
                    this.saveToStorage();
                    this.updateUI();
                    this.hideModal('loginModal');
                    this.showToast('Welcome back!', 'success');
                    this.showSection('profile');
                    this.loadProfile();
                } else {
                    // Prompt for profile info if missing
                    const name = prompt("Enter your name to complete your profile:");
                    const bio = prompt("Enter a short bio:");
                    firestore.collection('users').doc(user.uid).set({
                        name: name || user.email,
                        email: user.email,
                        bio: bio || '',
                        languages: ['English'],
                        interests: ['Travel']
                    }).then(() => {
                        this.currentUser = { ...user, name, bio, languages: ['English'], interests: ['Travel'], uid: user.uid };
                        this.saveToStorage();
                        this.updateUI();
                        this.hideModal('loginModal');
                        this.showToast('Profile completed!', 'success');
                        this.showSection('profile');
                        this.loadProfile();
                    });
                }
            });
        })
        .catch(err => this.showToast(err.message, 'error'));
}

handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) {
        this.showToast('Please fill in all fields', 'error');
        return;
    }
    firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            this.currentUser = userCredential.user;
            // Save extra profile info in Firestore
            firestore.collection('users').doc(this.currentUser.uid).set({
                name, email, bio: 'New to Travelfree!', languages: ['English'], interests: ['Travel']
            }).then(() => {
                this.saveToStorage();
                this.updateUI();
                this.hideModal('signupModal');
                this.showToast('Account created!', 'success');
                this.showSection('profile'); // Show profile after signup
                this.loadProfile(); // <-- Add this line
            });
        })
        .catch(err => this.showToast(err.message, 'error'));
}

    handleGoogleAuth(type) {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebaseAuth.signInWithPopup(provider)
            .then(result => {
                this.currentUser = result.user;
                this.saveToStorage();
                this.updateUI();
                this.hideModal(type === 'login' ? 'loginModal' : 'signupModal');
                this.showToast('Signed in with Google!', 'success');
            })
            .catch(err => this.showToast(err.message, 'error'));
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage();
        this.updateUI();
        this.showSection('hero');
        this.showToast('Logged out successfully', 'success');
    }

    // Host Registration
    async handleHostRegistration() {
    if (!this.currentUser) {
        this.showToast('Please login first', 'error');
        this.showModal('loginModal');
        return;
    }

    const title = document.getElementById('hostTitle').value;
    const description = document.getElementById('hostDescription').value;
    const roomType = document.getElementById('roomType').value;
    const location = document.getElementById('hostLocation').value;
    const rules = document.getElementById('houseRules').value;
    const files = document.getElementById('hostPhotos').files;

    if (!title || !description || !roomType || !location) {
        this.showToast('Please fill in all required fields', 'error');
        return;
    }

    let images = [];
    if (files.length > 0) {
        const promises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        images = await Promise.all(promises);
    } else {
        images = ['https://via.placeholder.com/400x300?text=Accommodation'];
    }

    const newHost = {
        title,
        description,
        roomType,
        location,
        rules,
        hostName: this.currentUser.name || this.currentUser.displayName || this.currentUser.email,
        hostId: this.currentUser.uid,
        images,
        available: true,
        createdAt: new Date().toISOString()
    };

    firestore.collection('hosts').add(newHost)
        .then(() => {
            document.getElementById('hostForm').reset();
            this.showToast('Your space has been listed!', 'success');
            this.showSection('explore');
            this.loadHosts(); // Refresh explore section
        });
}
    // Search and Load Methods
    handleSearch() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const filteredHosts = this.hosts.filter(host => 
            host.location.toLowerCase().includes(query) ||
            host.title.toLowerCase().includes(query) ||
            host.description.toLowerCase().includes(query)
        );
        this.renderHosts(filteredHosts);
    }

    // loadHosts() {
    //     this.renderHosts(this.hosts);
    // }
    loadHosts() {
    firestore.collection('hosts').get().then(snapshot => {
        const hosts = [];
        snapshot.forEach(doc => hosts.push({ id: doc.id, ...doc.data() }));
        this.renderHosts(hosts);
    });
}
renderHosts(hosts) {
    const grid = document.getElementById('hostsGrid');
    if (!hosts.length) {
        grid.innerHTML = '<p class="text-center">No hosts found. Be the first to list a space!</p>';
        return;
    }
    grid.innerHTML = hosts.map(host => {
        // Check if host is hardcoded (sample) by looking for a numeric hostId
        const isSample = typeof host.hostId === 'number';
        console.log('Host:', host.title, 'Image URL:', host.images && host.images[0] ? host.images[0] : 'images/cozy.jpg');
        return `
        <div class="host-card">
            <div class="host-card-image">
                <img src="${host.images && host.images[0] ? host.images[0] : 'images/cozy.jpg'}" alt="Accommodation">
            </div>
            <div class="host-card-content">
                <h3>${host.title}</h3>
                <div class="location"><i class="fas fa-map-marker-alt"></i> ${host.location}</div>
                <div class="room-type">${host.roomType}</div>
                <div class="rating">
                    <i class="fas fa-star"></i> ${host.rating || '5.0'}
                    <span>(${host.reviewCount || 0} reviews)</span>
                </div>
                <p class="mt-2 mb-2" style="color:#555;">${host.description ? host.description.substring(0, 80) + '...' : ''}</p>
                <button class="btn-primary btn-small full-width" onclick="app.showHostProfile('${host.id}', ${isSample})">View Details &amp; Request</button>
            </div>
        </div>
        `;
    }).join('');
}

// Update showHostProfile to handle sample hosts
showHostProfile(hostId, isSample = false) {
    if (isSample) {
        // Find the sample host by id
        const host = this.hosts.find(h => h.id == hostId);
        if (!host) return;
        // Set up currentHostForRequest for sample host
        this.currentHostForRequest = { hostId: host.hostId, hostName: host.hostName };
        document.getElementById('hostModalTitle').textContent = host.title;
        document.getElementById('hostMainImage').src = host.images[0];
        document.getElementById('hostName').textContent = host.hostName;
        document.getElementById('hostLocationDetail').textContent = host.location;
        document.getElementById('hostRoomType').textContent = host.roomType;
        document.getElementById('hostRating').textContent = host.rating || '5.0';
        document.getElementById('hostReviewCount').textContent = host.reviewCount || '0';
        document.getElementById('hostDescriptionText').textContent = host.description;
        document.getElementById('hostRulesText').textContent = host.rules;

        // Enable Send Request button for sample hosts
        const requestBtn = document.getElementById('sendRequestBtn');
        if (requestBtn) {
            requestBtn.disabled = false;
            requestBtn.textContent = "Send Stay Request";
            requestBtn.onclick = () => {
                this.hideModal('hostProfileModal');
                if (!this.currentUser) {
                    this.showToast('Please login to send requests', 'error');
                    this.showModal('loginModal');
                    return;
                }
                this.showModal('requestModal');
            };
        }

        this.showModal('hostProfileModal');
    } else {
        // Real host from Firestore
        firestore.collection('hosts').doc(hostId).get().then(doc => {
            if (!doc.exists) return;
            const host = doc.data();
            this.currentHostForRequest = { hostId: host.hostId, hostName: host.hostName };
            document.getElementById('hostModalTitle').textContent = host.title;
            document.getElementById('hostMainImage').src = host.images[0];
            document.getElementById('hostName').textContent = host.hostName;
            document.getElementById('hostLocationDetail').textContent = host.location;
            document.getElementById('hostRoomType').textContent = host.roomType;
            document.getElementById('hostRating').textContent = host.rating || '5.0';
            document.getElementById('hostReviewCount').textContent = host.reviewCount || '0';
            document.getElementById('hostDescriptionText').textContent = host.description;
            document.getElementById('hostRulesText').textContent = host.rules;

            // Enable Send Request button
            const requestBtn = document.getElementById('sendRequestBtn');
            if (requestBtn) {
                requestBtn.disabled = false;
                requestBtn.textContent = "Send Stay Request";
                requestBtn.onclick = () => {
                    this.hideModal('hostProfileModal');
                    if (!this.currentUser) {
                        this.showToast('Please login to send requests', 'error');
                        this.showModal('loginModal');
                        return;
                    }
                    this.showModal('requestModal');
                };
            }

            this.showModal('hostProfileModal');
        });
    }
}

// renderHosts(hosts) {
//     const grid = document.getElementById('hostsGrid');
//     if (!hosts.length) {
//         grid.innerHTML = '<p class="text-center">No hosts found. Be the first to list a space!</p>';
//         return;
//     }
//     grid.innerHTML = hosts.map(host => `
//         <div class="host-card">
//             <div class="host-card-image">
//                 <img src="${host.images && host.images[0] ? host.images[0] : 'https://via.placeholder.com/400x300'}" alt="Accommodation">
//             </div>
//             <div class="host-card-content">
//                 <h3>${host.title}</h3>
//                 <div class="location"><i class="fas fa-map-marker-alt"></i> ${host.location}</div>
//                 <div class="room-type">${host.roomType}</div>
//                 <div class="rating">
//                     <i class="fas fa-star"></i> ${host.rating || '5.0'}
//                     <span>(${host.reviewCount || 0} reviews)</span>
//                 </div>
//                 <p class="mt-2 mb-2" style="color:#555;">${host.description ? host.description.substring(0, 80) + '...' : ''}</p>
//                 <button class="btn-primary btn-small full-width" onclick="app.showHostProfile('${host.id}')">View Details &amp; Request</button>
//             </div>
//         </div>
//     `).join('');
// }

// showHostProfile(hostId) {
//     firestore.collection('hosts').doc(hostId).get().then(doc => {
//         if (!doc.exists) return;
//         const host = doc.data();
//         this.currentHostForRequest = { hostId: host.hostId, hostName: host.hostName };
//         document.getElementById('hostModalTitle').textContent = host.title;
//         document.getElementById('hostMainImage').src = host.images[0];
//         document.getElementById('hostName').textContent = host.hostName;
//         document.getElementById('hostLocationDetail').textContent = host.location;
//         document.getElementById('hostRoomType').textContent = host.roomType;
//         document.getElementById('hostRating').textContent = host.rating || '5.0';
//         document.getElementById('hostReviewCount').textContent = host.reviewCount || '0';
//         document.getElementById('hostDescriptionText').textContent = host.description;
//         document.getElementById('hostRulesText').textContent = host.rules;

//         // Set up Send Request button
//         const requestBtn = document.getElementById('sendRequestBtn');
//         if (requestBtn) {
//             requestBtn.onclick = () => {
//                 this.hideModal('hostProfileModal');
//                 if (!this.currentUser) {
//                     this.showToast('Please login to send requests', 'error');
//                     this.showModal('loginModal');
//                     return;
//                 }
//                 this.showModal('requestModal');
//             };
//         }

//         this.showModal('hostProfileModal');
//     });
// }
    // Stay Request Methods
   handleStayRequest() {
    if (!this.currentUser || !this.currentHostForRequest) {
        this.showToast('Something went wrong', 'error');
        return;
    }

    const checkin = document.getElementById('checkinDate').value;
    const checkout = document.getElementById('checkoutDate').value;
    const guests = document.getElementById('guestCount').value;
    const message = document.getElementById('requestMessage').value;

    if (!checkin || !checkout) {
        this.showToast('Please select dates', 'error');
        return;
    }

    firestore.collection('requests').add({
        hostId: this.currentHostForRequest.hostId,
        hostName: this.currentHostForRequest.hostName,
        guestId: this.currentUser.uid,
        guestName: this.currentUser.name || this.currentUser.displayName || this.currentUser.email,
        checkin, checkout, guests, message,
        status: 'pending',
        createdAt: new Date().toISOString()
    }).then(() => {
        document.getElementById('requestForm').reset();
        this.hideModal('requestModal');
        this.showToast('Stay request sent!', 'success');
    });
}
    loadUserRequests(role = 'all') {
    if (!this.currentUser) return;
    let query = firestore.collection('requests');
    if (role === 'host') {
        query = query.where('hostId', '==', this.currentUser.uid);
    } else if (role === 'traveler') {
        query = query.where('guestId', '==', this.currentUser.uid);
    }
    query.get().then(snapshot => {
        const userRequests = [];
        snapshot.forEach(doc => userRequests.push({ id: doc.id, ...doc.data() }));
        const container = document.getElementById('requestsList');
        if (userRequests.length === 0) {
            container.innerHTML = '<p>No requests yet.</p>';
            return;
        }
        container.innerHTML = userRequests.map(request => `
            <div class="request-card">
                <div class="request-header">
                    <h4>${request.guestId === this.currentUser.uid ? `Request to ${request.hostName}` : `Request from ${request.guestName}`}</h4>
                    <span class="request-status ${request.status}">${request.status}</span>
                </div>
                <p><strong>Dates:</strong> ${this.formatDate(request.checkin)} - ${this.formatDate(request.checkout)}</p>
                <p><strong>Guests:</strong> ${request.guests}</p>
                ${request.message ? `<p><strong>Message:</strong> ${request.message}</p>` : ''}
                <div class="request-actions">
                    ${request.hostId === this.currentUser.uid && request.status === 'pending' ? `
                        <button class="btn-primary btn-small" onclick="app.handleRequestAction('${request.id}', 'accepted')">Accept</button>
                        <button class="btn-secondary btn-small" onclick="app.handleRequestAction('${request.id}', 'declined')">Decline</button>
                    ` : ''}
                    ${request.status === 'accepted' ? `
                        <button class="btn-primary btn-small" onclick="app.openChat('${request.guestId === this.currentUser.uid ? request.hostId : request.guestId}', '${request.guestId === this.currentUser.uid ? request.hostName : request.guestName}')">Chat</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    });
}

    // Photo Methods
    loadPhotos() {
        this.renderPhotos(this.photos);
    }

    renderPhotos(photos) {
        const container = document.getElementById('photosGrid');

        container.innerHTML = photos.map(photo => `
            <div class="photo-card">
                <div class="photo-card-image">
                    <img src="${photo.url}" alt="${photo.caption}" onerror="this.src='https://via.placeholder.com/300x250?text=Photo'">
                </div>
                <div class="photo-card-content">
                    <div class="photo-caption">${photo.caption}</div>
                    <div class="photo-author">by ${photo.authorName}</div>
                    <div class="photo-actions">
                        <button class="like-btn ${photo.liked ? 'liked' : ''}" onclick="app.togglePhotoLike(${photo.id})">
                            <i class="fas fa-heart"></i>
                            <span>${photo.likes || 0}</span>
                        </button>
                        <small>${this.formatDate(photo.createdAt)}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    handlePhotoUpload() {
        const fileInput = document.getElementById('uploadPhotoInput');
        const caption = document.getElementById('photoCaption').value;

        if (!fileInput.files[0]) {
            this.showToast('Please select a photo', 'error');
            return;
        }

        // Simulate file upload
        const reader = new FileReader();
        reader.onload = (e) => {
            const newPhoto = {
                id: this.photos.length + 1,
                url: e.target.result,
                caption: caption || 'Beautiful travel moment',
                authorId: this.currentUser.uid,
                authorName: this.currentUser.name || this.currentUser.displayName || this.currentUser.email,
                likes: 0,
                liked: false,
                createdAt: new Date().toISOString()
            };

            this.photos.push(newPhoto);
            this.saveToStorage();

            // Reset form
            document.getElementById('photoUploadForm').reset();
            this.hideModal('photoUploadModal');
            this.showToast('Photo shared successfully!', 'success');
            this.loadPhotos(); // Refresh photos
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    togglePhotoLike(photoId) {
        if (!this.currentUser) {
            this.showToast('Please login to like photos', 'error');
            return;
        }

        const photo = this.photos.find(p => p.id === photoId);
        if (!photo) return;

        if (photo.liked) {
            photo.likes -= 1;
            photo.liked = false;
        } else {
            photo.likes += 1;
            photo.liked = true;
        }

        this.saveToStorage();
        this.renderPhotos(this.photos);
    }

    // Chat Methods
    openChat(partnerId, partnerName) {
        // Find or create chat doc
        firestore.collection('chats')
            .where('hostId', 'in', [this.currentUser.uid, partnerId])
            .where('guestId', 'in', [this.currentUser.uid, partnerId])
            .get().then(snapshot => {
                let chatDoc;
                snapshot.forEach(doc => chatDoc = doc);
                if (!chatDoc) {
                    firestore.collection('chats').add({
                        hostId: this.currentUser.uid,
                        guestId: partnerId,
                        messages: [],
                        unlocked: true
                    }).then(docRef => this.loadChatMessages(docRef.id));
                } else {
                    this.loadChatMessages(chatDoc.id);
                }
                document.getElementById('chatPartnerName').textContent = partnerName;
                this.showModal('chatModal');
            });
    }

    loadChatMessages(chatId) {
        firestore.collection('chats').doc(chatId)
            .onSnapshot(doc => {
                const messages = doc.data().messages || [];
                const container = document.getElementById('chatMessages');
                container.innerHTML = messages.map(msg => `
                    <div class="chat-message ${msg.senderId === this.currentUser.uid ? 'own' : ''}">
                        <div class="message-content">
                            ${msg.type === 'image' ? `<img src="${msg.content}" alt="Shared image" style="max-width: 200px; border-radius: 8px;">` : msg.content}
                            <div style="font-size: 0.8em; opacity: 0.7; margin-top: 0.5rem;">
                                ${this.formatTime(msg.timestamp)}
                            </div>
                            <button class="report-btn" onclick="app.reportMessage('${chatId}', ${msg.id})">Report</button>
                        </div>
                    </div>
                `).join('');
                container.scrollTop = container.scrollHeight;
            });
        this.currentChatId = chatId;
    }

    sendChatMessage() {
        const input = document.getElementById('chatInputField');
        const message = input.value.trim();
        if (!message || !this.currentChatId) return;
        const msgObj = {
            id: Date.now(),
            senderId: this.currentUser.uid,
            content: message,
            type: 'text',
            timestamp: new Date().toISOString()
        };
        firestore.collection('chats').doc(this.currentChatId).update({
            messages: firebase.firestore.FieldValue.arrayUnion(msgObj)
        });
        input.value = '';
    }

    handleChatImageUpload(event) {
        const file = event.target.files[0];
        if (!file || !this.currentChatId) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const msgObj = {
                id: Date.now(),
                senderId: this.currentUser.uid,
                content: e.target.result,
                type: 'image',
                timestamp: new Date().toISOString()
            };
            firestore.collection('chats').doc(this.currentChatId).update({
                messages: firebase.firestore.FieldValue.arrayUnion(msgObj)
            });
        };
        reader.readAsDataURL(file);
    }

    // === Report Message ===
    reportMessage(chatId, msgId) {
        firestore.collection('reports').add({
            chatId,
            msgId,
            reporterId: this.currentUser.uid,
            reportedAt: new Date().toISOString()
        }).then(() => {
            this.showToast('Message reported.', 'success');
        });
    }

    // Profile Methods
    loadProfile() {
        if (!this.currentUser) {
            this.showSection('hero');
            this.showToast('Please login first', 'error');
            return;
        }
        firestore.collection('users').doc(this.currentUser.uid).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('profileName').textContent = data.name;
                document.getElementById('profileBio').textContent = data.bio;
                this.loadProfileTags('languages', data.languages || []);
                this.loadProfileTags('interests', data.interests || []);
            }
        });
        // Load user requests
        this.loadUserRequests();
    }

    loadProfileTags(containerId, tags) {
        const container = document.getElementById(containerId);
        container.innerHTML = tags.map(tag =>
            `<span class="tag">${tag}</span>`
        ).join('');
    }

    handleRequestAction(requestId, action) {
        firestore.collection('requests').doc(requestId).update({ status: action })
            .then(() => {
                this.loadUserRequests();
                this.showToast(action === 'accepted' ? 'Request accepted!' : 'Request declined', 'success');
                if (action === 'accepted') {
                    // Unlock chat: create chat doc in Firestore
                    firestore.collection('chats').add({
                        hostId: this.currentUser.uid,
                        guestId: this.currentUser.uid === request.hostId ? request.guestId : request.hostId,
                        messages: [],
                        unlocked: true
                    });
                }
            });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    // UI Update Methods
    updateUI() {
        const isLoggedIn = !!this.currentUser;
        
        // Update navigation
        const navLinks = document.querySelector('.nav-links');
        if (isLoggedIn) {
            navLinks.innerHTML = `
                <a href="#" onclick="app.showSection('explore')">Explore</a>
                <a href="#" onclick="app.showSection('host')">Become a Host</a>
                <a href="#" onclick="app.showSection('photos')">Photos</a>
                <a href="#" onclick="app.showSection('profile')">Profile</a>
                <button class="btn-secondary" onclick="app.logout()">Logout</button>
            `;
        } else {
            navLinks.innerHTML = `
                <a href="#" id="exploreBtn">Explore</a>
                <a href="#" id="hostBtn">Become a Host</a>
                <a href="#" id="photosBtn">Photos</a>
                <button class="btn-primary" id="loginBtn">Login</button>
                <button class="btn-secondary" id="signupBtn">Sign Up</button>
            `;
            
            // Rebind events for new elements
            this.bindNavigationEvents();
        }
    }

    bindNavigationEvents() {
        const exploreBtn = document.getElementById('exploreBtn');
        const hostBtn = document.getElementById('hostBtn');
        const photosBtn = document.getElementById('photosBtn');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        if (exploreBtn) exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('explore');
        });
        
        if (hostBtn) hostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('host');
        });
        
        if (photosBtn) photosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('photos');
        });

        if (loginBtn) loginBtn.addEventListener('click', () => {
            this.showModal('loginModal');
        });
        
        if (signupBtn) signupBtn.addEventListener('click', () => {
            this.showModal('signupModal');
        });
    }

    // Utility Methods
    formatRoomType(type) {
        const types = {
            'private': 'Private Room',
            'shared': 'Shared Room',
            'couch': 'Couch/Living Room'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Data Generation Methods
    generateSampleHosts() {
        return [
            {
                id: 1,
                title: 'Cozy Downtown Apartment',
                description: 'Beautiful apartment in the heart of the city with amazing views and easy access to public transport. Perfect for travelers who want to experience local culture.',
                roomType: 'private',
                location: 'New York, USA',
                rules: 'No smoking, No parties after 10pm, Clean up after yourself',
                hostName: 'Sarah Johnson',
                hostId: 101,
                rating: 4.8,
                reviewCount: 15,
                images: ['images/cozy.jpg'],
                available: true
            },
            {
                id: 2,
                title: 'Beach House Paradise',
                description: 'Stunning beach house with direct beach access. Wake up to the sound of waves and enjoy breathtaking sunsets every evening.',
                roomType: 'shared',
                location: 'Barcelona, Spain',
                rules: 'Respect quiet hours, No sand in the house, Enjoy the beach!',
                hostName: 'Carlos Rodriguez',
                hostId: 102,
                rating: 4.9,
                reviewCount: 23,
                images: ['images/beach.jpg'],
                available: true
            },
            {
                id: 3,
                title: 'Mountain Cabin Retreat',
                description: 'Escape to the mountains in this rustic cabin surrounded by nature. Perfect for hiking enthusiasts and those seeking tranquility.',
                roomType: 'private',
                location: 'Denver, USA',
                rules: 'No loud music, Respect wildlife, Leave only footprints',
                hostName: 'Mike Wilson',
                hostId: 103,
                rating: 4.7,
                reviewCount: 8,
                images: ['images/mountain.webp'],
                available: true
            },
            {
                id: 4,
                title: 'Historic City Center Loft',
                description: 'Charming loft in a historic building with modern amenities. Walking distance to museums, cafes, and cultural attractions.',
                roomType: 'couch',
                location: 'Prague, Czech Republic',
                rules: 'No smoking indoors, Quiet after 11pm, Share stories!',
                hostName: 'Anna Novak',
                hostId: 104,
                rating: 4.6,
                reviewCount: 12,
                images: ['images/historic.jpg'],
                available: true
            },
            {
                id: 5,
                title: 'Garden Studio Sanctuary',
                description: 'Peaceful studio apartment with a beautiful garden view. Perfect for digital nomads and creative souls seeking inspiration.',
                roomType: 'private',
                location: 'Bali, Indonesia',
                rules: 'Respect the plants, Meditation corner available, Sunrise yoga welcome',
                hostName: 'Dewi Sari',
                hostId: 105,
                rating: 5.0,
                reviewCount: 19,
                images: ['images/garden_studio.jpg'],
                available: true
            },
            {
                id: 6,
                title: 'Riverside Houseboat',
                description: 'Unique experience on a traditional houseboat with modern comforts. Float along the canals and experience local life from the water.',
                roomType: 'shared',
                location: 'Amsterdam, Netherlands',
                rules: 'Life jackets available, No loud parties, Enjoy the water',
                hostName: 'Jan de Vries',
                hostId: 106,
                rating: 4.8,
                reviewCount: 14,
                images: ['images/riverside.jpg'],
                available: true
            }
        ];
    }

    generateSamplePhotos() {
        return [
            {
                id: 1,
                url: 'images/sunset.jpg',
                caption: 'Amazing sunset from Barcelona beach',
                authorId: 102,
                authorName: 'Carlos Rodriguez',
                likes: 24,
                liked: false,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                url: 'images/cabin.jpg',
                caption: 'Morning views from the cabin',
                authorId: 103,
                authorName: 'Mike Wilson',
                likes: 18,
                liked: false,
                createdAt: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 3,
                url: 'images/nyc.webp',
                caption: 'NYC skyline at night',
                authorId: 101,
                authorName: 'Sarah Johnson',
                likes: 31,
                liked: false,
                createdAt: new Date(Date.now() - 259200000).toISOString()
            },
            {
                id: 4,
                url: 'images/canals.webp',
                caption: 'Life on Amsterdam canals',
                authorId: 106,
                authorName: 'Jan de Vries',
                likes: 15,
                liked: false,
                createdAt: new Date(Date.now() - 345600000).toISOString()
            },
            {
                id: 5,
                url: 'images/bali.webp',
                caption: 'Peaceful morning in Bali',
                authorId: 105,
                authorName: 'Dewi Sari',
                likes: 27,
                liked: false,
                createdAt: new Date(Date.now() - 432000000).toISOString()
            },
            {
                id: 6,
                url: 'images/street.jpg',
                caption: 'Cobblestone streets of Prague',
                authorId: 104,
                authorName: 'Anna Novak',
                likes: 12,
                liked: false,
                createdAt: new Date(Date.now() - 518400000).toISOString()
            }
        ];
    }

    // Storage Methods
    saveToStorage() {
        const data = {
            currentUser: this.currentUser,
            hosts: this.hosts,
            photos: this.photos,
            requests: this.requests,
            chats: this.chats
        };
        // Note: In a real application, this would use localStorage or a database
        // For this demo, we'll just keep it in memory
        window.travelfreeData = data;
    }

    loadFromStorage() {
        const data = window.travelfreeData;
        if (data) {
            this.currentUser = data.currentUser;
            this.hosts = data.hosts || this.generateSampleHosts();
            this.photos = data.photos || this.generateSamplePhotos();
            this.requests = data.requests || [];
            this.chats = data.chats || {};
        }
    }
}

// Initialize the application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new TravelfreeApp();
});
// === Reviews Handling ===
const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");

if (reviewForm) {
  reviewForm.addEventListener("submit", function (e) {
    e.preventDefault(); // stop page reload

    const rating = document.getElementById("reviewRating").value;
    const text = document.getElementById("reviewText").value;

    if (!rating || !text) return;

    // Create review card
    const reviewCard = document.createElement("div");
    reviewCard.classList.add("review-card");
    reviewCard.innerHTML = `
      <div class="review-header">
        <strong>You</strong>
        <span class="rating">${"⭐".repeat(rating)}</span>
      </div>
      <p class="review-text">${text}</p>
    `;

    // Add new review at the top
    reviewsList.prepend(reviewCard);

    // Reset the form
    reviewForm.reset();
  });
}
// Scroll to hero section when logo is clicked
const logo = document.getElementById("logo");
const heroSection = document.getElementById("heroSection");

logo.addEventListener("click", () => {
    // Show hero section
    heroSection.style.display = "block";

    // Hide other sections if needed
    const sections = document.querySelectorAll("main .section");
    sections.forEach(sec => {
        if (sec.id !== "heroSection") {
            sec.style.display = "none";
        }
    });

    // Scroll to top
    heroSection.scrollIntoView({ behavior: "smooth" });
});
// === Edit Profile Handling ===
const editProfileBtn = document.getElementById("editProfileBtn");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const languagesContainer = document.getElementById("languages");
const interestsContainer = document.getElementById("interests");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    const newName = prompt("Enter your name:", profileName.textContent);
    const newBio = prompt("Enter your bio:", profileBio.textContent);
    const newLanguages = prompt(
      "Enter your languages (comma separated):",
      [...languagesContainer.querySelectorAll(".tag")].map(el => el.textContent).join(", ")
    );
    const newInterests = prompt(
      "Enter your interests (comma separated):",
      [...interestsContainer.querySelectorAll(".tag")].map(el => el.textContent).join(", ")
    );

    // Update UI
    if (newName && newName.trim() !== "") profileName.textContent = newName;
    if (newBio && newBio.trim() !== "") profileBio.textContent = newBio;

    let languagesArr = [];
    if (newLanguages) {
      languagesContainer.innerHTML = "";
      languagesArr = newLanguages.split(",").map(lang => lang.trim()).filter(Boolean);
      languagesArr.forEach(lang => {
        const span = document.createElement("span");
        span.classList.add("tag");
        span.textContent = lang;
        languagesContainer.appendChild(span);
      });
    }

    let interestsArr = [];
    if (newInterests) {
      interestsContainer.innerHTML = "";
      interestsArr = newInterests.split(",").map(interest => interest.trim()).filter(Boolean);
      interestsArr.forEach(interest => {
        const span = document.createElement("span");
        span.classList.add("tag");
        span.textContent = interest;
        interestsContainer.appendChild(span);
      });
    }

    // Update Firestore
    if (app.currentUser) {
      firestore.collection('users').doc(app.currentUser.uid).set({
        name: newName || profileName.textContent,
        bio: newBio || profileBio.textContent,
        email: app.currentUser.email,
        languages: languagesArr.length ? languagesArr : [...languagesContainer.querySelectorAll(".tag")].map(el => el.textContent),
        interests: interestsArr.length ? interestsArr : [...interestsContainer.querySelectorAll(".tag")].map(el => el.textContent)
      }, { merge: true });
    }
  });
}


// Global utility functions for onclick handlers
window.app = {
    showHostProfile: (hostId) => app.showHostProfile(hostId),
    togglePhotoLike: (photoId) => app.togglePhotoLike(photoId),
    handleRequestAction: (requestId, action) => app.handleRequestAction(requestId, action),
    openChat: (partnerId, partnerName) => app.openChat(partnerId, partnerName),
    showSection: (section) => app.showSection(section),
    logout: () => app.logout()
};

// Additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const targetId = href && href.length > 1 ? href.slice(1) : null;
            if (targetId) {
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add loading states to buttons
    document.addEventListener('submit', (e) => {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        }
    });
    // ...existing code...


    // Add hover effects to cards
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.host-card, .photo-card')) {
            e.target.closest('.host-card, .photo-card').style.transform = 'translateY(-5px)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.host-card, .photo-card')) {
            e.target.closest('.host-card, .photo-card').style.transform = 'translateY(0)';
        }
    });

    // Keyboard navigation for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                openModal.classList.remove('show');
            }
        }
    });

    // Auto-hide toast notifications
    const toast = document.getElementById('toast');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && toast.classList.contains('show')) {
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        });
    });
    observer.observe(toast, { attributes: true });

    // Add animation classes to elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.host-card, .photo-card, .section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        elements.forEach((element) => {
            observer.observe(element);
        });
    };

    animateOnScroll();
});