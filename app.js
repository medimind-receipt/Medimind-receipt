// MediMind Receipt App JavaScript

class MediMindApp {
    constructor() {
        // In-memory data storage
        this.data = {
            receipts: [],
            metrics: {
                total_subscribers: 0
            }
        };

        // DOM elements
        this.elements = {
            formScreen: document.getElementById('formScreen'),
            successScreen: document.getElementById('successScreen'),
            form: document.getElementById('receiptForm'),
            nameInput: document.getElementById('name'),
            emailInput: document.getElementById('email'),
            nameError: document.getElementById('nameError'),
            emailError: document.getElementById('emailError'),
            submitBtn: document.getElementById('submitBtn'),
            submitLoader: document.getElementById('submitLoader'),
            submitText: document.getElementById('submitText'),
            subscriberCount: document.getElementById('subscriberCount'),
            receiptPreview: document.getElementById('receiptPreview'),
            downloadBtn: document.getElementById('downloadBtn'),
            shareBtn: document.getElementById('shareBtn'),
            newReceiptBtn: document.getElementById('newReceiptBtn'),
            updatedCount: document.getElementById('updatedCount'),
            pdfContent: document.getElementById('pdfContent'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage')
        };

        this.currentReceipt = null;
        this.validationState = {
            name: false,
            email: false
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSubscriberCount();
        this.checkFormValidity();

        // Focus on name input when page loads
        setTimeout(() => {
            this.elements.nameInput.focus();
        }, 100);
    }

    setupEventListeners() {
        // Form validation listeners
        this.elements.nameInput.addEventListener('input', () => this.validateName());
        this.elements.nameInput.addEventListener('blur', () => this.validateName());

        this.elements.emailInput.addEventListener('input', () => this.validateEmail());
        this.elements.emailInput.addEventListener('blur', () => this.validateEmail());

        // Form submission
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Success screen actions
        this.elements.downloadBtn.addEventListener('click', () => this.downloadPDF());
        this.elements.shareBtn.addEventListener('click', () => this.copyShareLink());
        this.elements.newReceiptBtn.addEventListener('click', () => this.createNewReceipt());
    }

    validateName() {
        const name = this.elements.nameInput.value.trim();
        const nameError = this.elements.nameError;

        if (!name) {
            this.showFieldError(this.elements.nameInput, nameError, 'Name is required');
            this.validationState.name = false;
        } else if (name.length < 2) {
            this.showFieldError(this.elements.nameInput, nameError, 'Name must be at least 2 characters');
            this.validationState.name = false;
        } else {
            this.hideFieldError(this.elements.nameInput, nameError);
            this.validationState.name = true;
        }

        this.checkFormValidity();
    }

    validateEmail() {
        const email = this.elements.emailInput.value.trim();
        const emailError = this.elements.emailError;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showFieldError(this.elements.emailInput, emailError, 'Email is required');
            this.validationState.email = false;
        } else if (!emailRegex.test(email)) {
            this.showFieldError(this.elements.emailInput, emailError, 'Please enter a valid email address');
            this.validationState.email = false;
        } else {
            this.hideFieldError(this.elements.emailInput, emailError);
            this.validationState.email = true;
        }

        this.checkFormValidity();
    }

    showFieldError(input, errorElement, message) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    hideFieldError(input, errorElement) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        errorElement.classList.remove('show');
    }

    checkFormValidity() {
        const isValid = this.validationState.name && this.validationState.email;
        this.elements.submitBtn.disabled = !isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form one more time
        this.validateName();
        this.validateEmail();

        if (!this.validationState.name || !this.validationState.email) {
            this.showToast('Please fix the errors before submitting', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Create receipt
            const receipt = this.createReceipt();

            // Generate PDF content
            const pdfGenerated = await this.generatePDFContent(receipt);

            if (pdfGenerated) {
                // Save receipt and update metrics
                this.data.receipts.push(receipt);
                this.data.metrics.total_subscribers++;

                // Store current receipt
                this.currentReceipt = receipt;

                // Show success screen
                this.showSuccessScreen(receipt);

                this.showToast('Receipt generated successfully!', 'success');
            } else {
                throw new Error('Failed to generate PDF content');
            }
        } catch (error) {
            console.error('Error generating receipt:', error);
            this.showToast('Failed to generate receipt. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    createReceipt() {
        const name = this.elements.nameInput.value.trim();
        const email = this.elements.emailInput.value.trim();
        const receiptId = this.generateReceiptId();
        const timestamp = new Date().toISOString();

        return {
            receipt_id: receiptId,
            name: name,
            email: email,
            amount: '₹29',
            currency: 'INR',
            status: 'Paid',
            created_at: timestamp,
            pdf_url: `#receipt-${receiptId}`
        };
    }

    generateReceiptId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }

    async generatePDFContent(receipt) {
        try {
            // Create the receipt content using the exact template
            const receiptContent = this.formatReceiptContent(receipt);

            // Create PDF HTML structure
            const pdfHTML = this.createPDFHTML(receiptContent, receipt);

            // Set the PDF content
            this.elements.pdfContent.innerHTML = pdfHTML;

            return true;
        } catch (error) {
            console.error('Error generating PDF content:', error);
            return false;
        }
    }

    formatReceiptContent(receipt) {
        const formattedDate = new Date(receipt.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `Welcome to MediMind! 🎉

Dear ${receipt.name},

Thank you for joining MediMind. Your payment of ₹29 has been received and your access is now active.

Quick Access:

Website: https://medimindbynajir.github.io/Medimind/

App Download: https://limewire.com/d/CgeRo#culpmDPzgB

How to Use (Video): https://youtu.be/Iz5_CI1YG_E?feature=shared

What You Get:

• Enhanced beautiful UI with glassmorphism and animations
• Secure Razorpay payment and Formspree support
• Full legal pages: Terms, Privacy, Shipping, Contact, Refunds
• Mobile-responsive, SEO-optimized, fast performance

Your Details:

Name: ${receipt.name}
Email: ${receipt.email}
Amount: ₹29
Status: Paid
Receipt ID: ${receipt.receipt_id}
Date: ${formattedDate}

Next Steps:

1. Download and install the app.
2. Explore the website features.
3. Watch the how-to video for quick guidance.

Support:
Need help? Visit the Contact page on our website. We aim to respond within 24 hours.

Wishing a transformative journey with MediMind! ✨

— The MediMind Team`;
    }

    createPDFHTML(content, receipt) {
        return `
            <div class="pdf-content">
                <div class="pdf-header">
                    <h1 class="pdf-title">Welcome to MediMind! 🎉</h1>
                    <p class="pdf-subtitle">Your Premium Access Receipt</p>
                </div>

                <div class="pdf-section">
                    <p><strong>Dear ${receipt.name},</strong></p>
                    <p>Thank you for joining MediMind. Your payment of ₹29 has been received and your access is now active.</p>
                </div>

                <div class="pdf-section">
                    <h3>Quick Access</h3>
                    <div class="pdf-links">
                        <p><strong>Website:</strong> https://medimindbynajir.github.io/Medimind/</p>
                        <p><strong>App Download:</strong> https://limewire.com/d/CgeRo#culpmDPzgB</p>
                        <p><strong>How to Use (Video):</strong> https://youtu.be/Iz5_CI1YG_E?feature=shared</p>
                    </div>
                </div>

                <div class="pdf-section">
                    <h3>What You Get</h3>
                    <div class="pdf-features">
                        <p>• Enhanced beautiful UI with glassmorphism and animations</p>
                        <p>• Secure Razorpay payment and Formspree support</p>
                        <p>• Full legal pages: Terms, Privacy, Shipping, Contact, Refunds</p>
                        <p>• Mobile-responsive, SEO-optimized, fast performance</p>
                    </div>
                </div>

                <div class="pdf-section">
                    <h3>Your Details</h3>
                    <div class="pdf-details">
                        <p><strong>Name:</strong> ${receipt.name}</p>
                        <p><strong>Email:</strong> ${receipt.email}</p>
                        <p><strong>Amount:</strong> ₹29</p>
                        <p><strong>Status:</strong> Paid</p>
                        <p><strong>Receipt ID:</strong> ${receipt.receipt_id}</p>
                        <p><strong>Date:</strong> ${new Date(receipt.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                </div>

                <div class="pdf-section">
                    <h3>Next Steps</h3>
                    <p>1. Download and install the app.</p>
                    <p>2. Explore the website features.</p>
                    <p>3. Watch the how-to video for quick guidance.</p>
                </div>

                <div class="pdf-section">
                    <h3>Support</h3>
                    <p>Need help? Visit the Contact page on our website. We aim to respond within 24 hours.</p>
                    <p>Wishing a transformative journey with MediMind! ✨</p>
                    <p><strong>— The MediMind Team</strong></p>
                </div>

                <div class="pdf-footer">
                    <p>MediMind - Receipt #${receipt.receipt_id} - ₹29 INR</p>
                    <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
                </div>
            </div>
        `;
    }

    showSuccessScreen(receipt) {
        // Update receipt preview
        this.elements.receiptPreview.textContent = this.formatReceiptContent(receipt);

        // Update subscriber count
        this.elements.updatedCount.textContent = this.data.metrics.total_subscribers;
        this.updateSubscriberCount();

        // Switch screens
        this.elements.formScreen.classList.remove('active');
        this.elements.successScreen.classList.add('active');
    }

    async downloadPDF() {
        if (!this.currentReceipt) {
            this.showToast('No receipt to download', 'error');
            return;
        }

        try {
            // Show loading state on download button
            const originalText = this.elements.downloadBtn.innerHTML;
            this.elements.downloadBtn.innerHTML = '<span class="btn-icon">⏳</span> Generating PDF...';
            this.elements.downloadBtn.disabled = true;

            // Wait a bit to ensure content is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Make sure PDF content is visible for generation
            this.elements.pdfContent.style.display = 'block';

            // Configure PDF options
            const options = {
                margin: [16, 16, 16, 16], // 16mm margins
                filename: `MediMind_Receipt_${this.currentReceipt.receipt_id}_${this.currentReceipt.name.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            };

            // Generate PDF
            await html2pdf().set(options).from(this.elements.pdfContent).save();

            // Hide PDF content again
            this.elements.pdfContent.style.display = 'none';

            this.showToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('Failed to generate PDF. Please try again.', 'error');
        } finally {
            // Restore button state
            this.elements.downloadBtn.innerHTML = '<span class="btn-icon">📄</span> Download PDF';
            this.elements.downloadBtn.disabled = false;
        }
    }

    copyShareLink() {
        if (!this.currentReceipt) {
            this.showToast('No receipt to share', 'error');
            return;
        }

        const shareUrl = `${window.location.origin}${this.currentReceipt.pdf_url}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showToast('Share link copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(shareUrl);
            });
        } else {
            this.fallbackCopyToClipboard(shareUrl);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showToast('Share link copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy link. Please copy manually: ' + text, 'error');
        }

        document.body.removeChild(textArea);
    }

    createNewReceipt() {
        // Reset form
        this.elements.form.reset();
        this.elements.nameInput.classList.remove('valid', 'invalid');
        this.elements.emailInput.classList.remove('valid', 'invalid');
        this.elements.nameError.classList.remove('show');
        this.elements.emailError.classList.remove('show');

        // Reset validation state
        this.validationState.name = false;
        this.validationState.email = false;
        this.checkFormValidity();

        // Clear current receipt
        this.currentReceipt = null;

        // Switch back to form screen
        this.elements.successScreen.classList.remove('active');
        this.elements.formScreen.classList.add('active');

        // Focus on name input
        setTimeout(() => {
            this.elements.nameInput.focus();
        }, 100);
    }

    setLoadingState(loading) {
        if (loading) {
            this.elements.submitText.style.display = 'none';
            this.elements.submitLoader.classList.remove('hidden');
            this.elements.submitBtn.disabled = true;
        } else {
            this.elements.submitText.style.display = 'inline';
            this.elements.submitLoader.classList.add('hidden');
            this.checkFormValidity();
        }
    }

    updateSubscriberCount() {
        this.elements.subscriberCount.textContent = this.data.metrics.total_subscribers;
    }

    showToast(message, type = 'info') {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.remove('hidden');

        // Auto hide after 4 seconds
        setTimeout(() => {
            this.hideToast();
        }, 4000);
    }

    hideToast() {
        this.elements.toast.classList.add('hidden');
    }
}

// Global function for toast close button
function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediMindApp();
});

// Handle page refresh - preserve data in session storage for demo
window.addEventListener('beforeunload', () => {
    if (window.app && window.app.data) {
        sessionStorage.setItem('mediMindData', JSON.stringify(window.app.data));
    }
});

// Restore data on page load
window.addEventListener('load', () => {
    const savedData = sessionStorage.getItem('mediMindData');
    if (savedData && window.app) {
        try {
            window.app.data = JSON.parse(savedData);
            window.app.updateSubscriberCount();
        } catch (e) {
            console.error('Error restoring saved data:', e);
        }
    }
});