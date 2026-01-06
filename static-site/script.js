/**
 * Enhanced Resume Generator Script
 * Features: Form validation, live preview, skills tags, progress tracking, auto-save
 */

class ResumeGenerator {
    constructor() {
        this.state = {
            formData: {},
            skills: [],
            educationItems: [],
            isLivePreview: false,
            isDirty: false
        };
        
        this.photoData = null;
        this.photoObjectUrl = null;
        this.validationRules = this.initValidationRules();
        this.educationCounter = 3; // Start after primary, secondary, tertiary
        
        this.init();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        // add a debounced preview generator for live preview
        this.generateResumeDebounced = this.debounce(() => {
            // only generate when live preview mode is active
            if (this.state.isLivePreview) this.generateResume();
        }, 300);
        this.loadSavedData();
        this.setupAutoSave();
        this.updateProgress();
    }

    bindElements() {
        // Form elements
        this.form = document.getElementById('resumeForm');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Input elements
        this.nameInput = document.getElementById('name');
        this.suffixInput = document.getElementById('suffix'); // optional suffix (e.g., Jr., Sr., III)
        this.emailInput = document.getElementById('email');
        this.phoneInput = document.getElementById('phone');
        this.photoInput = document.getElementById('photo');
        this.summaryInput = document.getElementById('summary');
        this.summaryCount = document.getElementById('summaryCount');
        this.experienceInput = document.getElementById('experience');
        
        // Skills elements
        this.skillsInput = document.getElementById('skillsInput');
        this.skillsTags = document.getElementById('skillsTags');
        this.skillsHidden = document.getElementById('skills');
        
        // Education elements
        this.educationContainer = document.getElementById('educationContainer');
        this.addEducationBtn = document.getElementById('addEducationBtn');
        
        // Control elements
        this.livePreviewBtn = document.getElementById('livePreviewBtn');
        this.previewBtnText = document.getElementById('previewBtnText');
        this.resumeOutput = document.getElementById('resumeOutput');
        this.resumeContent = document.getElementById('resumeContent');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.downloadFormat = document.getElementById('downloadFormat');
        
        // Message elements
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
    }

    initValidationRules() {
        return {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s.-]+$/,
                message: 'Please enter a valid full name (letters, spaces, periods, and hyphens only)'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                required: true,
                pattern: /^[\+]?[\d\s\-\(\)]{10,}$/,
                message: 'Please enter a valid phone number (at least 10 digits)'
            },
            summary: {
                required: true,
                minLength: 50,
                maxLength: 500,
                message: 'Professional summary must be between 50-500 characters'
            },
            experience: {
                required: true,
                minLength: 20,
                message: 'Please provide detailed work experience (minimum 20 characters)'
            },
            skills: {
                required: true,
                minItems: 3,
                message: 'Please add at least 3 skills'
            }
        };
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Real-time validation
        this.setupValidationListeners();
        
        // Character counter for summary
        this.summaryInput.addEventListener('input', this.updateCharacterCounter.bind(this));
        
        // Skills input handling
        this.setupSkillsListeners();
        
        // Photo handling
        this.photoInput.addEventListener('change', this.handlePhotoChange.bind(this));
        
        // Education management
        this.addEducationBtn.addEventListener('click', this.addEducationSection.bind(this));
        
        // Live preview toggle
        this.livePreviewBtn.addEventListener('click', this.toggleLivePreview.bind(this));
        
        // Download functionality
        this.downloadBtn.addEventListener('click', this.handleDownload.bind(this));
        
        // Auto-save on form changes
        this.form.addEventListener('input', this.debounce(this.markDirty.bind(this), 300));
        this.form.addEventListener('change', this.debounce(this.markDirty.bind(this), 300));
    }

    setupValidationListeners() {
        const fields = ['name', 'email', 'phone', 'summary', 'experience'];
        
        fields.forEach(fieldName => {
            const element = document.getElementById(fieldName);
            if (element) {
                element.addEventListener('blur', () => this.validateField(fieldName));
                element.addEventListener('input', () => {
                    this.clearError(fieldName);
                    this.updateProgress();
                });
            }
        });
    }

    setupSkillsListeners() {
        this.skillsInput.addEventListener('keydown', this.handleSkillsKeydown.bind(this));
        this.skillsInput.addEventListener('input', this.handleSkillsInput.bind(this));
        this.skillsInput.addEventListener('blur', this.addSkillFromInput.bind(this));
    }

    validateField(fieldName) {
        const element = document.getElementById(fieldName);
        const rule = this.validationRules[fieldName];
        const value = element.value.trim();
        
        if (!rule) return true;
        
        // Check required
        if (rule.required && !value) {
            this.showError(fieldName, `${this.capitalize(fieldName)} is required`);
            return false;
        }
        
        // Check minimum length
        if (rule.minLength && value.length < rule.minLength) {
            this.showError(fieldName, `${this.capitalize(fieldName)} must be at least ${rule.minLength} characters`);
            return false;
        }
        
        // Check maximum length
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showError(fieldName, `${this.capitalize(fieldName)} must not exceed ${rule.maxLength} characters`);
            return false;
        }
        
        // Check pattern
        if (rule.pattern && value && !rule.pattern.test(value)) {
            this.showError(fieldName, rule.message);
            return false;
        }
        
        this.clearError(fieldName);
        return true;
    }

    validateSkills() {
        const rule = this.validationRules.skills;
        if (rule.required && this.state.skills.length < rule.minItems) {
            this.showError('skills', rule.message);
            return false;
        }
        this.clearError('skills');
        return true;
    }

    validateForm() {
        const fields = ['name', 'email', 'phone', 'summary', 'experience'];
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!this.validateSkills()) {
            isValid = false;
        }
        
        return isValid;
    }

    showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        const inputElement = document.getElementById(fieldName === 'skills' ? 'skillsInput' : fieldName);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    clearError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        const inputElement = document.getElementById(fieldName === 'skills' ? 'skillsInput' : fieldName);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    updateCharacterCounter() {
        const count = this.summaryInput.value.length;
        const maxLength = 500;
        
        this.summaryCount.textContent = count;
        
        // Color coding
        if (count > maxLength * 0.9) {
            this.summaryCount.style.color = '#ef4444'; // Red
        } else if (count > maxLength * 0.7) {
            this.summaryCount.style.color = '#f59e0b'; // Orange
        } else {
            this.summaryCount.style.color = '#10b981'; // Green
        }
        
        // Prevent overflow
        if (count > maxLength) {
            this.summaryInput.value = this.summaryInput.value.substring(0, maxLength);
            this.summaryCount.textContent = maxLength;
        }
    }

    handleSkillsKeydown(e) {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            this.addSkillFromInput();
        } else if (e.key === 'Backspace' && !this.skillsInput.value && this.state.skills.length > 0) {
            // Remove last skill when backspacing on empty input
            this.removeSkill(this.state.skills.length - 1);
        }
    }

    handleSkillsInput(e) {
        const value = e.target.value;
        if (value.includes(',')) {
            const skills = value.split(',');
            skills.forEach(skill => {
                if (skill.trim()) {
                    this.addSkill(skill.trim());
                }
            });
            this.skillsInput.value = '';
        }
    }

    addSkillFromInput() {
        const skill = this.skillsInput.value.trim();
        if (skill) {
            this.addSkill(skill);
            this.skillsInput.value = '';
        }
    }

    addSkill(skillText) {
        if (skillText && !this.state.skills.includes(skillText)) {
            this.state.skills.push(skillText);
            this.renderSkillsTags();
            this.updateSkillsHiddenField();
            this.validateSkills();
            this.updateProgress();
            // update live preview if enabled
            if (this.state.isLivePreview) this.generateResumeDebounced();
        }
    }

    removeSkill(index) {
        this.state.skills.splice(index, 1);
        this.renderSkillsTags();
        this.updateSkillsHiddenField();
        this.validateSkills();
        this.updateProgress();
        // update live preview if enabled
        if (this.state.isLivePreview) this.generateResumeDebounced();
    }

    renderSkillsTags() {
        this.skillsTags.innerHTML = '';
        this.state.skills.forEach((skill, index) => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${this.escapeHTML(skill)}
                <button type="button" class="remove-skill" onclick="resumeGen.removeSkill(${index})">×</button>
            `;
            this.skillsTags.appendChild(tag);
        });
    }

    updateSkillsHiddenField() {
        this.skillsHidden.value = this.state.skills.join(', ');
    }

    handlePhotoChange() {
        const file = this.photoInput.files && this.photoInput.files[0];
        
        // Revoke previous URL
        if (this.photoObjectUrl) {
            URL.revokeObjectURL(this.photoObjectUrl);
            this.photoObjectUrl = null;
            this.photoData = null;
        }
        
        if (!file) return;
        
        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            this.showGlobalError('Photo file size must be less than 2MB');
            this.photoInput.value = '';
            return;
        }
        
        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
            this.showGlobalError('Photo must be in JPG, PNG, or GIF format');
            this.photoInput.value = '';
            return;
        }
        
        this.photoObjectUrl = URL.createObjectURL(file);
        this.photoData = this.photoObjectUrl;
        
        // Show preview or success message
        this.showGlobalSuccess('Photo uploaded successfully');
        // update live preview if enabled
        if (this.state.isLivePreview) this.generateResumeDebounced();
    }

    addEducationSection() {
        this.educationCounter++;
        const newSection = this.createEducationSection(this.educationCounter, 'Additional Education');
        this.educationContainer.insertBefore(newSection, this.addEducationBtn);
    }

    createEducationSection(counter, title) {
        const section = document.createElement('div');
        section.className = 'education-item';
        section.setAttribute('data-level', `education-${counter}`);
        
        section.innerHTML = `
            <div class="education-header">
                <h4>${title}</h4>
                <button type="button" class="remove-education" onclick="this.parentElement.parentElement.remove()" 
                    title="Remove this education level">
                    Remove
                </button>
            </div>
            <div class="education-content">
                <div class="input-row">
                    <div class="input-group flex-2">
                        <label for="education-${counter}">Institution & Details</label>
                        <textarea id="education-${counter}" name="education-${counter}" rows="2" 
                            placeholder="Institution name, degree, achievements..."></textarea>
                    </div>
                    <div class="input-group flex-1">
                        <label for="year-${counter}">Year Completed</label>
                        <input type="text" id="year-${counter}" name="year-${counter}" 
                            placeholder="e.g., 2020">
                    </div>
                </div>
            </div>
        `;
        
        return section;
    }

    toggleLivePreview() {
        this.state.isLivePreview = !this.state.isLivePreview;
        
        if (this.state.isLivePreview) {
            this.previewBtnText.textContent = 'Disable Live Preview';
            this.generateResume();
            this.setupLivePreviewListeners();
        } else {
            this.previewBtnText.textContent = 'Enable Live Preview';
            this.removeLivePreviewListeners();
            this.resumeOutput.classList.add('hidden');
        }
        
        document.body.classList.toggle('preview-mode', this.state.isLivePreview);

        // Ensure download button state respects current progress when toggling preview
        try { this.updateProgress(); } catch (e) { /* ignore */ }
    }

    async generateResume() {
        // Collect all form data
        const formData = this.collectFormData();
        
        // Generate resume HTML
        const resumeHTML = this.buildResumeHTML(formData);
        
        // Inject into preview
        this.resumeContent.innerHTML = resumeHTML;
        this.resumeOutput.classList.remove('hidden');
        
        // Auto-scroll to preview if not in live mode
        if (!this.state.isLivePreview) {
            this.resumeOutput.scrollIntoView({ behavior: 'smooth' });
        }

        // Ensure progress and download state are up-to-date after generating preview
        try { this.updateProgress(); } catch (e) { /* ignore */ }
    }

    updateProgress() {
        const requiredFields = ['name', 'email', 'phone', 'summary', 'experience'];
        const skillsRequired = this.state.skills.length >= 3;
        
        let completedFields = 0;
        const totalFields = requiredFields.length + 1; // +1 for skills
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element && element.value.trim()) {
                completedFields++;
            }
        });
        
        if (skillsRequired) {
            completedFields++;
        }
        
        const percentage = Math.round((completedFields / totalFields) * 100);
        
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}% Complete`;
        
        // Update progress bar color
        if (percentage < 30) {
            this.progressFill.style.backgroundColor = '#ef4444';
        } else if (percentage < 70) {
            this.progressFill.style.backgroundColor = '#f59e0b';
        } else {
            this.progressFill.style.backgroundColor = '#10b981';
        }

        // Manage download button state: only enable when progress is 100%
        try {
            if (this.downloadBtn) {
                const canDownload = percentage === 100;
                this.downloadBtn.disabled = !canDownload;
                this.downloadBtn.title = canDownload ? 'Download your resume' : 'Complete the form to 100% to enable download';
                // update style for disabled state for accessibility
                if (canDownload) {
                    this.downloadBtn.classList.remove('disabled');
                } else {
                    this.downloadBtn.classList.add('disabled');
                }
            }
        } catch (e) {
            // ignore if elements not yet bound
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showGlobalError('Please fix the errors above before generating your resume');
            return;
        }
        
        this.setButtonLoading(this.form.querySelector('button[type="submit"]'), true);
        
        try {
            await this.generateResume();
            this.showGlobalSuccess('Resume generated successfully!');
            // don't unconditionally enable download; rely on updateProgress to control it
            this.updateProgress();
        } catch (error) {
            this.showGlobalError('Failed to generate resume. Please try again.');
            console.error('Resume generation error:', error);
        } finally {
            this.setButtonLoading(this.form.querySelector('button[type="submit"]'), false);
        }
    }

    async generateResume() {
        // Collect all form data
        const formData = this.collectFormData();
        
        // Generate resume HTML
        const resumeHTML = this.buildResumeHTML(formData);
        
        // Inject into preview
        this.resumeContent.innerHTML = resumeHTML;
        this.resumeOutput.classList.remove('hidden');
        
        // Auto-scroll to preview if not in live mode
        if (!this.state.isLivePreview) {
            this.resumeOutput.scrollIntoView({ behavior: 'smooth' });
        }

        // Ensure progress and download state are up-to-date after generating preview
        try { this.updateProgress(); } catch (e) { /* ignore */ }
    }

    collectFormData() {
        // Get education data
        const educationData = [];
        const educationItems = this.educationContainer.querySelectorAll('.education-item');
        
        educationItems.forEach(item => {
            const level = item.getAttribute('data-level');
            if (level) { // Include all education items
                const content = item.querySelector('.education-content');
                if (content && content.style.display !== 'none') {
                    const textarea = item.querySelector('textarea');
                    const yearInput = item.querySelector('input[type="text"]');
                    
                    if (textarea && yearInput && (textarea.value.trim() || yearInput.value.trim())) {
                        educationData.push({
                            level: item.querySelector('h4').textContent,
                            details: textarea.value.trim(),
                            year: yearInput.value.trim()
                        });
                    }
                }
            }
        });
        
        return {
            name: this.nameInput.value.trim(),
            suffix: this.suffixInput ? this.suffixInput.value.trim() : '', // optional
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim(),
            summary: this.summaryInput.value.trim(),
            experience: this.experienceInput.value.trim(),
            skills: this.state.skills,
            education: educationData,
            photo: this.photoData
        };
    }

    buildResumeHTML(data) {
        const skillsList = data.skills.map(skill => `<li>${this.escapeHTML(skill)}</li>`).join('');
        const educationList = data.education.map(edu => 
            `<li><strong>${this.escapeHTML(edu.level)}:</strong> ${this.escapeHTML(edu.details)} ${edu.year ? `<span class="edu-year">(${this.escapeHTML(edu.year)})</span>` : ''}</li>`
        ).join('');

        return `
            <div class="resume-sheet">
                <header class="resume-header">
                    <div class="header-left">
                        <h1 class="name">${this.escapeHTML(data.name)}${data.suffix ? ', ' + this.escapeHTML(data.suffix) : ''}</h1>
                        <div class="contact">${this.escapeHTML(data.email)} &nbsp; | &nbsp; ${this.escapeHTML(data.phone)}</div>
                    </div>
                    ${data.photo ? `<div class="header-photo"><img class="photo" src="${data.photo}" alt="Profile Photo"></div>` : ''}
                </header>

                <section class="section summary">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${this.escapeHTML(data.summary).replace(/\n/g, '<br>')}</p>
                </section>

                <section class="section experience">
                    <h2 class="section-title">Work Experience</h2>
                    <p>${this.escapeHTML(data.experience).replace(/\n/g, '<br>')}</p>
                </section>

                ${data.education.length > 0 ? `
                <section class="section education">
                    <h2 class="section-title">Education</h2>
                    <ul class="education-list">
                        ${educationList}
                    </ul>
                </section>
                ` : ''}

                <section class="section skills">
                    <h2 class="section-title">Skills & Expertise</h2>
                    <ul class="skills-list">
                        ${skillsList}
                    </ul>
                </section>
            </div>
        `;
    }

    async handleDownload() {
        if (this.downloadBtn.disabled) return;
        
        const sheet = this.resumeContent.querySelector('.resume-sheet') || this.resumeContent;
        if (!sheet) {
            this.showGlobalError('No resume to download. Please generate a resume first.');
            return;
        }

        this.setButtonLoading(this.downloadBtn, true);

        try {
            // Load html2canvas if needed
            if (typeof html2canvas !== 'function') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
                if (typeof html2canvas !== 'function') throw new Error('html2canvas failed to load');
            }

            const scale = 1.5;
            const canvas = await html2canvas(sheet, {
                scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const format = this.downloadFormat.value.toLowerCase();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const baseName = (this.nameInput.value || 'resume').replace(/\s+/g, '_');

            if (format === 'png' || format === 'jpeg' || format === 'jpg') {
                const mime = format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mime, 0.92);
                this.downloadFile(dataUrl, `${baseName}_${timestamp}.${format === 'png' ? 'png' : 'jpg'}`);
            } else if (format === 'pdf') {
                await this.downloadAsPDF(canvas, `${baseName}_${timestamp}.pdf`);
            }

            this.showGlobalSuccess('Resume downloaded successfully!');
            this.clearSavedData(); // Clear saved data after successful download
        } catch (error) {
            this.showGlobalError('Download failed. Please try again.');
            console.error('Download error:', error);
        } finally {
            this.setButtonLoading(this.downloadBtn, false);
        }
    }

    async downloadAsPDF(canvas, filename) {
        // Load jsPDF if needed
        if (!(window.jspdf && window.jspdf.jsPDF) && !window.jsPDF) {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        
        const jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
        if (!jsPDFCtor) throw new Error('jsPDF not loaded');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDFCtor({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidthMm = pageWidth;
        const imgHeightMm = (imgProps.height * imgWidthMm) / imgProps.width;

        if (imgHeightMm <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);
        } else {
            // Handle multi-page PDF
            const pageCanvas = document.createElement('canvas');
            const scalePxToMm = pageWidth / canvas.width;
            let yPosPx = 0;
            
            while (yPosPx < canvas.height) {
                const h = Math.min(canvas.height - yPosPx, Math.round(pageHeight / scalePxToMm));
                pageCanvas.width = canvas.width;
                pageCanvas.height = h;
                
                const ctx = pageCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, yPosPx, canvas.width, h, 0, 0, canvas.width, h);
                
                const pageData = pageCanvas.toDataURL('image/png');
                const pageImgProps = pdf.getImageProperties(pageData);
                const pageImgHeightMm = (pageImgProps.height * pageWidth) / pageImgProps.width;
                
                if (yPosPx > 0) pdf.addPage();
                pdf.addImage(pageData, 'PNG', 0, 0, pageWidth, pageImgHeightMm);
                yPosPx += h;
            }
        }

        pdf.save(filename);
    }

    downloadFile(dataUrl, filename) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // Utility functions
    loadScript(src) {
        return new Promise((resolve, reject) => {
            for (const s of document.scripts) {
                if (s.src && s.src.indexOf(src) !== -1) return resolve();
            }
            
            const el = document.createElement('script');
            el.src = src;
            el.async = true;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(el);
        });
    }

    escapeHTML(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        const textSpan = button.querySelector('.btn-text');
        const loadingSpan = button.querySelector('.btn-loading');
        
        if (isLoading) {
            button.disabled = true;
            if (textSpan) textSpan.style.display = 'none';
            if (loadingSpan) loadingSpan.style.display = 'inline';
        } else {
            button.disabled = false;
            if (textSpan) textSpan.style.display = 'inline';
            if (loadingSpan) loadingSpan.style.display = 'none';
        }
    }

    showGlobalSuccess(message) {
        this.successMessage.querySelector('.message-text').textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        
        setTimeout(() => {
            this.successMessage.classList.add('hidden');
        }, 5000);
    }

    showGlobalError(message) {
        this.errorMessage.querySelector('.message-text').textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        
        setTimeout(() => {
            this.errorMessage.classList.add('hidden');
        }, 8000);
    }

    // Auto-save functionality
    setupAutoSave() {
        this.autoSaveHandler = this.debounce(this.saveData.bind(this), 800);
    }

    markDirty() {
        this.state.isDirty = true;
        this.autoSaveHandler();
        this.updateProgress();
    }

    saveData() {
        if (!this.state.isDirty) return;
        
        try {
            const data = {
                formData: this.collectFormData(),
                skills: this.state.skills,
                timestamp: Date.now()
            };
            
            localStorage.setItem('resumeGenerator_draft', JSON.stringify(data));
            this.state.isDirty = false;
        } catch (error) {
            console.warn('Failed to save draft:', error);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('resumeGenerator_draft');
            if (saved) {
                const data = JSON.parse(saved);
                const isRecent = (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000; // 24 hours
                
                if (isRecent && confirm('Would you like to restore your saved draft?')) {
                    this.restoreFormData(data);
                }
            }
        } catch (error) {
            console.warn('Failed to load saved draft:', error);
        }
    }

    restoreFormData(data) {
        if (data.formData) {
            const form = data.formData;
            if (form.name) this.nameInput.value = form.name;
            if (form.suffix && this.suffixInput) this.suffixInput.value = form.suffix;
            if (form.email) this.emailInput.value = form.email;
            if (form.phone) this.phoneInput.value = form.phone;
            if (form.summary) this.summaryInput.value = form.summary;
            if (form.experience) this.experienceInput.value = form.experience;
        }
        
        if (data.skills) {
            this.state.skills = data.skills;
            this.renderSkillsTags();
            this.updateSkillsHiddenField();
        }
        
        this.updateCharacterCounter();
        this.updateProgress();
    }

    clearSavedData() {
        localStorage.removeItem('resumeGenerator_draft');
        this.state.isDirty = false;
    }

    // Attach listeners used only during live-preview mode
    setupLivePreviewListeners() {
        if (this._livePreviewAttached) return;

        // Listen to form input/change to update preview
        this.form.addEventListener('input', this.generateResumeDebounced);
        this.form.addEventListener('change', this.generateResumeDebounced);

        // Skills changes: update preview when adding/removing tags
        this.skillsInput.addEventListener('keydown', this.generateResumeDebounced);
        this.skillsInput.addEventListener('input', this.generateResumeDebounced);

        // Photo change should update preview immediately
        this.photoInput.addEventListener('change', this.generateResumeDebounced);

        // Store a flag so we don't double attach
        this._livePreviewAttached = true;
    }

    // Remove listeners when live-preview is disabled
    removeLivePreviewListeners() {
        if (!this._livePreviewAttached) return;

        this.form.removeEventListener('input', this.generateResumeDebounced);
        this.form.removeEventListener('change', this.generateResumeDebounced);
        this.skillsInput.removeEventListener('keydown', this.generateResumeDebounced);
        this.skillsInput.removeEventListener('input', this.generateResumeDebounced);
        this.photoInput.removeEventListener('change', this.generateResumeDebounced);

        this._livePreviewAttached = false;
    }
}

// Global function for skill removal (called from dynamically generated HTML)
function toggleEducationItem(button) {
    const item = button.closest('.education-item');
    const content = item.querySelector('.education-content');
    const hideText = button.querySelector('.hide-text');
    const showText = button.querySelector('.show-text');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        hideText.style.display = 'inline';
        showText.style.display = 'none';
    } else {
        content.style.display = 'none';
        hideText.style.display = 'none';
        showText.style.display = 'inline';
    }
}

// Initialize the resume generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumeGen = new ResumeGenerator();
});