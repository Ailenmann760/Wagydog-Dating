// app.js

import { auth, db, storage } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs, 
    updateDoc, 
    arrayUnion,
    query,
    where
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

const currentPage = window.location.pathname;

// --- UTILS & HELPERS ---
const showSpinner = () => {
    const spinner = document.getElementById('loading-spinner');
    if(spinner) spinner.style.display = 'block';
}
const hideSpinner = () => {
    const spinner = document.getElementById('loading-spinner');
    if(spinner) spinner.style.display = 'none';
}

// --- DARK/LIGHT MODE ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        if(themeToggle) themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark-mode');
        if(themeToggle) themeToggle.textContent = '🌙';
    }
};

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        const theme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    });
}
// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);


// --- AUTHENTICATION & ROUTE PROTECTION ---
const protectedPages = ['/profile.html', '/discover.html'];

onAuthStateChanged(auth, user => {
    if (user) {
        // User is logged in
        if (currentPage.includes('/login.html') || currentPage.includes('/signup.html')) {
            window.location.href = 'profile.html';
        }
    } else {
        // User is not logged in
        if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = 'login.html';
        }
    }
});

// --- PAGE-SPECIFIC LOGIC ---

// 1. SIGN-UP PAGE
if (currentPage.includes('/signup.html')) {
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('signup-btn');
        const errorMessage = document.getElementById('error-message');
        
        btn.disabled = true;
        btn.textContent = 'Creating Account...';
        errorMessage.textContent = '';

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const gender = document.getElementById('gender').value;
        const bio = document.getElementById('bio').value;
        const aboutMe = document.getElementById('about-me').value;
        const profilePicFile = document.getElementById('profile-pic').files[0];

        try {
            // 1. Create user in Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Upload profile picture to Storage
            const storageRef = ref(storage, `profilePictures/${user.uid}/${profilePicFile.name}`);
            const snapshot = await uploadBytes(storageRef, profilePicFile);
            const photoURL = await getDownloadURL(snapshot.ref);

            // 3. Save user data to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                gender: gender,
                bio: bio,
                aboutMe: aboutMe,
                photoURL: photoURL,
                likes: [],
                matches: [],
                createdAt: new Date()
            });

            // Redirect to profile page
            window.location.href = 'profile.html';

        } catch (error) {
            errorMessage.textContent = error.message;
            console.error("Signup Error:", error);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign Up';
        }
    });
}

// 2. LOGIN PAGE
if (currentPage.includes('/login.html')) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const errorMessage = document.getElementById('error-message');
        
        btn.disabled = true;
        btn.textContent = 'Logging In...';
        errorMessage.textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'profile.html';
        } catch (error) {
            errorMessage.textContent = "Invalid email or password.";
            console.error("Login Error:", error);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    });
}

// 3. LOGOUT FUNCTIONALITY (on protected pages)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });
}

// 4. PROFILE PAGE
if (currentPage.includes('/profile.html')) {
    const profileContent = document.getElementById('profile-content');
    
    const loadProfileData = async () => {
        showSpinner();
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                document.getElementById('profile-img').src = userData.photoURL;
                document.getElementById('profile-username').textContent = userData.username;
                document.getElementById('profile-bio').textContent = userData.bio;
                document.getElementById('profile-about').textContent = userData.aboutMe;
                profileContent.classList.remove('hidden');
            } else {
                console.error("No such user document!");
            }
        }
        hideSpinner();
    };

    // Edit Profile Modal Logic
    const modal = document.getElementById('edit-modal');
    const editBtn = document.getElementById('edit-profile-btn');
    const closeBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('edit-profile-form');

    editBtn.onclick = async () => {
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        document.getElementById('edit-username').value = userData.username;
        document.getElementById('edit-bio').value = userData.bio;
        document.getElementById('edit-about-me').value = userData.aboutMe;
        modal.style.display = 'block';
    }
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        const saveBtn = document.getElementById('save-changes-btn');
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const newUsername = document.getElementById('edit-username').value;
        const newBio = document.getElementById('edit-bio').value;
        const newAboutMe = document.getElementById('edit-about-me').value;
        const newProfilePicFile = document.getElementById('edit-profile-pic').files[0];

        const updatedData = {
            username: newUsername,
            bio: newBio,
            aboutMe: newAboutMe,
        };

        try {
            if (newProfilePicFile) {
                const storageRef = ref(storage, `profilePictures/${user.uid}/${newProfilePicFile.name}`);
                const snapshot = await uploadBytes(storageRef, newProfilePicFile);
                updatedData.photoURL = await getDownloadURL(snapshot.ref);
            }
            await updateDoc(doc(db, "users", user.uid), updatedData);
            modal.style.display = 'none';
            loadProfileData(); // Reload profile data
        } catch (error) {
            console.error("Error updating profile: ", error);
        } finally {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    });

    onAuthStateChanged(auth, user => {
        if (user) loadProfileData();
    });
}

// 5. DISCOVER PAGE
if (currentPage.includes('/discover.html')) {
    const discoverGrid = document.getElementById('discover-grid');
    let currentUserData = null;

    const checkForMatch = async (likedUserId) => {
        // 1. Get the liked user's document
        const likedUserDoc = await getDoc(doc(db, "users", likedUserId));
        if (!likedUserDoc.exists()) return;
        
        const likedUserData = likedUserDoc.data();
        
        // 2. Check if the liked user has already liked the current user
        if (likedUserData.likes && likedUserData.likes.includes(auth.currentUser.uid)) {
            // IT'S A MATCH!
            console.log("IT'S A MATCH WITH", likedUserData.username);

            // 3. Update both users' documents with the match
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                matches: arrayUnion(likedUserId)
            });
            const likedUserRef = doc(db, "users", likedUserId);
            await updateDoc(likedUserRef, {
                matches: arrayUnion(auth.currentUser.uid)
            });

            // 4. Show the match modal
            document.getElementById('match-name').textContent = likedUserData.username;
            document.getElementById('match-img-user').src = currentUserData.photoURL;
            document.getElementById('match-img-other').src = likedUserData.photoURL;
            document.getElementById('match-modal').style.display = 'block';
        }
    };


    const loadUsers = async () => {
        showSpinner();
        const user = auth.currentUser;
        if (!user) return;
        
        // Fetch current user's data to check for existing likes/matches
        const currentUserDoc = await getDoc(doc(db, "users", user.uid));
        currentUserData = currentUserDoc.data();

        // Fetch all users except the current one
        const q = query(collection(db, "users"), where("uid", "!=", user.uid));
        const querySnapshot = await getDocs(q);

        discoverGrid.innerHTML = ''; // Clear previous users
        querySnapshot.forEach((docSnap) => {
            const userData = docSnap.data();

            // Don't show users who are already matched
            if (currentUserData.matches && currentUserData.matches.includes(userData.uid)) {
                return;
            }

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <img src="${userData.photoURL}" alt="${userData.username}'s picture">
                <div class="card-content">
                    <h3>${userData.username}</h3>
                    <p>${userData.bio}</p>
                    <button class="btn btn-primary like-btn" data-id="${userData.uid}">Like ❤️</button>
                </div>
                ${Math.random() > 0.5 ? '<div class="online-status"></div>' : ''}
            `;
            discoverGrid.appendChild(card);
        });
        hideSpinner();

        // Add event listeners to the new "Like" buttons
        document.querySelectorAll('.like-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const likedUserId = e.target.dataset.id;
                e.target.disabled = true;
                e.target.textContent = 'Liked 👍';
                
                // Add liked user's ID to the current user's "likes" array in Firestore
                const currentUserRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(currentUserRef, {
                    likes: arrayUnion(likedUserId)
                });
                
                // Check if it's a mutual like
                await checkForMatch(likedUserId);
            });
        });
    };
    
    onAuthStateChanged(auth, user => {
        if (user) loadUsers();
    });

    // Close Match Modal
    const matchModal = document.getElementById('match-modal');
    const closeMatchBtn = document.querySelector('.match-close-btn');
    closeMatchBtn.onclick = () => {
        matchModal.style.display = 'none';
        loadUsers(); // Refresh the discover page to remove the matched user
    };
}
