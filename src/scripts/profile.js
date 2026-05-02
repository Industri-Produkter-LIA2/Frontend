import { fetchCustomerProfile, updateCustomerProfile, updateUserPassword, escapeHtml } from '../api.js';
import { getUser ,logout} from '../ui/auth.js'; 

let currentCustomerData = null;

export async function initProfile() {
    // 1. Get the current logged-in user and their ID
    const user = getUser();
    const customerId = user?.customerId ;

    // 2. Security check: redirect to login if no ID is found
    if (!user || !customerId) {
        alert("You must be logged in to view your profile.");
        window.location.href = '/login';
        return;
    }

    // 3. Grab the main container elements from the HTML
    const profileView = document.getElementById('profile-view');
    const editForm = document.getElementById('profile-edit-form');
    const passwordForm = document.getElementById('password-edit-form');
    
    if (!profileView || !editForm || !passwordForm) {
        console.error("Profile UI elements are missing from the DOM.");
        return;
    }

    // 4. Load the data into the Read-Only view
    await loadData(customerId);

    // ==========================================
    // TOGGLE LOGIC: PROFILE EDIT FORM
    // ==========================================
    document.getElementById('btn-edit-profile').addEventListener('click', () => {
        populateForm(); // Fill the inputs with current data
        profileView.style.display = 'none';
        passwordForm.style.display = 'none';
        editForm.style.display = 'flex';
    });

    document.getElementById('btn-cancel-edit').addEventListener('click', () => {
        editForm.style.display = 'none';
        profileView.style.display = 'block';
    });

    // Handle Profile Save
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            id: customerId,
            name: document.getElementById('edit-company-name').value,
            orgNumber: document.getElementById('edit-org-number').value,
            address: document.getElementById('edit-address').value,
            invoiceAddress: document.getElementById('edit-invoice-address').value
        };

        const success = await updateCustomerProfile(customerId, updatedData);
        
        if (success) {
            currentCustomerData = updatedData;
            updateViewUI(); // Refresh the read-only view with new data
            
            editForm.style.display = 'none';
            profileView.style.display = 'block';
            alert('Profile updated successfully!'); 
        } else {
            alert('Failed to update profile. Please try again.');
        }
    });


    // ==========================================
    // TOGGLE LOGIC: CHANGE PASSWORD FORM
    // ==========================================
    document.getElementById('btn-show-password-form').addEventListener('click', () => {
        profileView.style.display = 'none';
        editForm.style.display = 'none'; 
        passwordForm.style.display = 'flex';
    });

    document.getElementById('btn-cancel-password').addEventListener('click', () => {
        passwordForm.style.display = 'none';
        passwordForm.reset(); // Clear the text boxes
        profileView.style.display = 'block';
    });

    // Handle Password Save
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        // Validation: Is the password null or empty?
        // Using .trim() ensures the user didn't just type a bunch of spaces
        if (!newPass || newPass.trim() === '') {
            alert("Password cannot be empty!");
            return;
        }

        // Validation: Do the passwords match?
        if (newPass !== confirmPass) {
            alert("Passwords do not match!");
            return;
        }

        const success = await updateUserPassword(user.id, newPass);
        
        if (success) {
            alert("Password updated successfully!");
            logout(); // Clear localStorage
            window.location.href = '/login'; // Send them to the login page
        } else {
            alert("Failed to update password. Please try again.");
        }
    });
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
async function loadData(customerId) {
    currentCustomerData = await fetchCustomerProfile(customerId);
    
    if (currentCustomerData) {
        updateViewUI();
    } else {
        document.getElementById('view-company-name').textContent = "Error loading profile data.";
    }
}

function updateViewUI() {
    // Check for lowerCase or PascalCase depending on how C# serializes the JSON
    const name = currentCustomerData.name || currentCustomerData.Name || currentCustomerData.companyName || '';
    const orgNum = currentCustomerData.orgNumber || currentCustomerData.OrgNumber || '';
    const address = currentCustomerData.address || currentCustomerData.Address || '';
    const invoice = currentCustomerData.invoiceAddress || currentCustomerData.InvoiceAddress || '';

    document.getElementById('view-company-name').textContent = escapeHtml(name);
    document.getElementById('view-org-number').textContent = escapeHtml(orgNum);
    document.getElementById('view-address').textContent = escapeHtml(address);
    document.getElementById('view-invoice-address').textContent = escapeHtml(invoice);
}

function populateForm() {
    const name = currentCustomerData.name || currentCustomerData.Name || currentCustomerData.companyName || '';
    const orgNum = currentCustomerData.orgNumber || currentCustomerData.OrgNumber || '';
    const address = currentCustomerData.address || currentCustomerData.Address || '';
    const invoice = currentCustomerData.invoiceAddress || currentCustomerData.InvoiceAddress || '';

    document.getElementById('edit-company-name').value = name;
    document.getElementById('edit-org-number').value = orgNum;
    document.getElementById('edit-address').value = address;
    document.getElementById('edit-invoice-address').value = invoice;
}