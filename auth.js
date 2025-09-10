// Import the services you need from your Firebase configuration file
import { auth, db } from './FirebaseConfig.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- GET FORM ELEMENTS ---
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');

// --- SIGN UP LOGIC ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    let role = document.getElementById('signup-role').value;

    if (!name || !email || !password || !role) {
        alert('Please fill out all fields.');
        return;
    }

    // Default status is 'approved' for immediate access in the hackathon.
    let verificationStatus = "approved";

    // Special case: Create an auto-approved admin user.
    if (email.toLowerCase() === 'admin@surplus.com') {
        role = 'admin';
    }

    try {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Add user's details to the Firestore database
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: role,
            verification_status: verificationStatus, // Set to 'approved'
            created_at: new Date()
        });

        // 3. Inform user and redirect to the correct dashboard
        alert('Registration successful! Redirecting to your dashboard...');
        
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            // Pass role to dashboard to show correct view
            window.location.href = `dashboard.html?role=${encodeURIComponent(role)}`;
        }

    } catch (error) {
        console.error("Registration Error:", error.code, error.message);
        if (error.code === 'auth/email-already-in-use') {
            alert('This email address is already registered. Please sign in.');
        } else {
            alert(`Registration failed: ${error.message}`);
        }
    }
});


// --- SIGN IN LOGIC ---
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        // 1. Authenticate the user with their email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Access the user's data from Firestore to check their role and status
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error("User data not found in the database. Please contact support.");
        }

        const userData = userDoc.data();
        
        // 3. Check verification status and redirect accordingly
        if (userData.verification_status === "approved") {
            // Redirect based on role
            if (userData.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = `dashboard.html?role=${encodeURIComponent(userData.role)}`;
            }
        } else if (userData.verification_status === "pending") {
            alert("Your account is pending approval from an administrator. Please check back later.");
        } else { // Handles "rejected" or any other status
            alert("Your account has been rejected or is inactive. Please contact support.");
        }

    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        
        // Provide specific error messages for common login failures
        let errorMessage = "An unknown error occurred. Please try again.";
        switch (error.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                errorMessage = "Invalid email or password. Please check your credentials and try again.";
                break;
            case "auth/too-many-requests":
                errorMessage = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
                break;
        }
        alert(`Login failed: ${errorMessage}`);
    }
});

