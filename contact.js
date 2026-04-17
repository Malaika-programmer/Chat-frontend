// Contact form handling
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Basic validation
        if (validateForm(data)) {
            // Simulate form submission
            showSuccessMessage();
            contactForm.reset();
        }
    });
});

function validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.firstName.trim()) {
        showError('Please enter your first name');
        return false;
    }

    if (!data.lastName.trim()) {
        showError('Please enter your last name');
        return false;
    }

    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address');
        return false;
    }

    if (!data.subject) {
        showError('Please select a subject');
        return false;
    }

    if (!data.message.trim()) {
        showError('Please enter your message');
        return false;
    }

    return true;
}

function showError(message) {
    // Remove existing error messages
    removeMessages();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">❌ ${message}</div>
        </div>
    `;

    const form = document.getElementById('contactForm');
    form.insertBefore(errorDiv, form.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage() {
    // Remove existing messages
    removeMessages();

    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">✅ Thank you for your message! We'll get back to you soon.</div>
        </div>
    `;

    const form = document.getElementById('contactForm');
    form.insertBefore(successDiv, form.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function removeMessages() {
    const messages = document.querySelectorAll('.message.error, .message.success');
    messages.forEach(message => message.remove());
}

// Add message styles
const style = document.createElement('style');
style.textContent = `
    .message {
        margin-bottom: 20px;
        animation: slideIn 0.3s ease;
    }

    .message.error .message-content {
        background: #fed7d7;
        border-left: 4px solid #e53e3e;
    }

    .message.success .message-content {
        background: #c6f6d5;
        border-left: 4px solid #38a169;
    }

    .message .message-content {
        padding: 15px;
        border-radius: 8px;
    }

    .message .message-text {
        color: #333;
        font-weight: 500;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);