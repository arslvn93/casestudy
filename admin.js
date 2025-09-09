document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.config === 'undefined') {
        console.error('Configuration object (window.config) not found. Make sure config.js is loaded before admin.js.');
        alert('Error: config.js not found. Cannot build admin page.');
        return;
    }

    const adminLayout = document.getElementById('adminLayout');
    const configForm = document.getElementById('configForm');
    const messageDiv = document.getElementById('message');

    // --- Helper Functions ---
    function getVal(id) { const el = document.getElementById(id); return el ? (el.type === 'checkbox' ? el.checked : el.value) : ''; }
    function setVal(id, value) { const el = document.getElementById(id); if (el) { if (el.type === 'checkbox') { el.checked = !!value; } else { el.value = value === undefined || value === null ? '' : value; } } }
    // No longer need arrayFromTextarea or textareaFromArray as paragraphs are now dynamic items

    function toHumanReadable(text) {
        if (!text) return '';
        if (text === 'src' || text === 'imageSrc') return 'Image URL';
        const result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    // --- Dynamic Item Rendering Functions ---
    function renderDynamicItems(containerId, items, renderItemFn) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; // Clear existing
        if (Array.isArray(items)) {
            items.forEach((item, index) => {
                container.appendChild(renderItemFn(item, index));
            });
        }
    }

    function addDynamicItem(containerId, defaultItem, createFn) {
        const container = document.getElementById(containerId);
        if (container) {
            const newItemElement = createFn(defaultItem, container.children.length);
            container.appendChild(newItemElement);
        }
    }

    window.removeDynamicItem = function(buttonElement) {
        const itemGroup = buttonElement.closest('.dynamic-item-group');
        if (itemGroup) {
            itemGroup.remove();
        }
    }

    // --- Specific Dynamic Item Creators ---

    // Agents (Globals)
    function createContactDetailInputs(detail, agentIndex, detailIndex) {
        const div = document.createElement('div');
        div.className = 'dynamic-item-group contact-detail-item'; // Added class for easier selection
        div.innerHTML = `
            <h5>Contact Detail ${detailIndex + 1}</h5>
            <div class="form-group">
                <label for="agentContactType${agentIndex}_${detailIndex}">Type:</label>
                <select id="agentContactType${agentIndex}_${detailIndex}" name="agentContactType${agentIndex}_${detailIndex}">
                    <option value="email" ${detail.type === 'email' ? 'selected' : ''}>Email</option>
                    <option value="phone" ${detail.type === 'phone' ? 'selected' : ''}>Phone</option>
                </select>
            </div>
            <div class="form-group">
                <label for="agentContactValue${agentIndex}_${detailIndex}">Value:</label>
                <input type="text" id="agentContactValue${agentIndex}_${detailIndex}" name="agentContactValue${agentIndex}_${detailIndex}" value="${detail.value || ''}">
            </div>
            <div class="dynamic-item-controls">
                <button type="button" onclick="removeDynamicItem(this)">Remove Detail</button>
            </div>
        `;
        return div;
    }

    window.addContactDetail = function(buttonElement, agentIndex) {
        // Find the agent container by looking for the closest agent group
        const agentGroup = buttonElement.closest('.dynamic-item-group');
        if (agentGroup) {
            const nameInput = agentGroup.querySelector('input[id^="agentName"]');
            if (nameInput) {
                const match = nameInput.id.match(/agentName(\d+)/);
                if (match) {
                    const actualAgentIndex = parseInt(match[1]);
                    const container = agentGroup.querySelector(`#agentContactDetailsContainer${actualAgentIndex}`);
                    if (container) {
                        const newDetailElement = createContactDetailInputs({ type: 'email', value: '' }, actualAgentIndex, container.children.length);
                        container.appendChild(newDetailElement);
                    }
                }
            }
        }
    }

    function createAgentInputs(agent, index) {
        const div = document.createElement('div');
        div.className = 'dynamic-item-group';
        div.innerHTML = `
            <h4>Agent ${index + 1}</h4>
            <div class="form-group">
                <label for="agentName${index}">Name:</label>
                <input type="text" id="agentName${index}" name="agentName${index}" value="${agent.name || ''}">
            </div>
            <div class="form-group">
                <label for="agentImageSrc${index}">Image URL:</label>
                <input type="text" id="agentImageSrc${index}" name="agentImageSrc${index}" value="${agent.imageSrc || ''}" placeholder="https://example.com/agent-photo.jpg">
            </div>
            <fieldset>
                <legend>Contact Details</legend>
                <div id="agentContactDetailsContainer${index}">
                    ${(agent.contactDetails || []).map((detail, detailIndex) => createContactDetailInputs(detail, index, detailIndex).outerHTML).join('')}
                </div>
                <div class="dynamic-item-controls">
                    <button type="button" class="add-item" onclick="addContactDetail(this, ${index})">Add Contact Detail</button>
                </div>
            </fieldset>
            <div class="dynamic-item-controls">
                <button type="button" onclick="removeDynamicItem(this)">Remove Agent</button>
            </div>
        `;
        return div;
    }

    window.addAgent = function() {
        const container = document.getElementById('agentsContainer');
        if (container) {
            // Find the highest existing agent index and add 1
            let maxIndex = -1;
            container.querySelectorAll('.dynamic-item-group').forEach(group => {
                const nameInput = group.querySelector('input[id^="agentName"]');
                if (nameInput) {
                    const match = nameInput.id.match(/agentName(\d+)/);
                    if (match) {
                        const index = parseInt(match[1]);
                        if (index > maxIndex) maxIndex = index;
                    }
                }
            });
            const newIndex = maxIndex + 1;
            
            const newAgentElement = createAgentInputs({ name: '', imageSrc: '', contactDetails: [{ type: 'email', value: '' }] }, newIndex);
            container.appendChild(newAgentElement);
        }
    }

    // Generic Paragraph/List Item
    function createParagraphInput(text, containerId, index) {
        const div = document.createElement('div');
        div.className = 'dynamic-item-group paragraph-item';
        div.innerHTML = `
            <div class="form-group">
                <label for="${containerId}Text${index}">Text:</label>
                <textarea id="${containerId}Text${index}" name="${containerId}Text${index}">${text || ''}</textarea>
            </div>
            <div class="dynamic-item-controls">
                <button type="button" onclick="removeDynamicItem(this)">Remove Item</button>
            </div>
        `;
        return div;
    }

    window.addParagraph = function(containerId) {
        addDynamicItem(containerId, '', (text, index) => createParagraphInput(text, containerId, index));
    }

    // Sections
    function createSectionInputs(section, index) {
        const div = document.createElement('div');
        div.className = 'dynamic-item-group';
        let contentHtml = '';
        let titleInput = '';

        if (section.type === 'standard') {
            titleInput = `
                <div class="form-group">
                    <label for="sectionTitle${index}">Title:</label>
                    <input type="text" id="sectionTitle${index}" name="sectionTitle${index}" value="${section.title || ''}">
                </div>
            `;
            contentHtml = `
                <div class="form-group">
                    <label>Paragraphs:</label>
                    <div id="sectionParagraphsContainer${index}">
                        ${(section.paragraphs || []).map((p, pIndex) => createParagraphInput(p, `sectionParagraphsContainer${index}`, pIndex).outerHTML).join('')}
                    </div>
                    <div class="dynamic-item-controls">
                        <button type="button" class="add-item" onclick="addParagraph('sectionParagraphsContainer${index}')">Add Paragraph</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>List Items:</label>
                    <div id="sectionListItemsContainer${index}">
                        ${(section.listItems || []).map((li, liIndex) => createParagraphInput(li, `sectionListItemsContainer${index}`, liIndex).outerHTML).join('')}
                    </div>
                    <div class="dynamic-item-controls">
                        <button type="button" class="add-item" onclick="addParagraph('sectionListItemsContainer${index}')">Add List Item</button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="sectionTestimonialQuote${index}">Testimonial Quote:</label>
                    <textarea id="sectionTestimonialQuote${index}" name="sectionTestimonialQuote${index}">${section.testimonial?.quote || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="sectionImageSrc${index}">Image URL:</label>
                    <input type="text" id="sectionImageSrc${index}" name="sectionImageSrc${index}" value="${section.image?.src || ''}" placeholder="https://example.com/section-image.jpg">
                </div>
            `;
        } else if (section.type === 'ctaBanner') {
            contentHtml = `
                <div class="form-group">
                    <label for="ctaBannerSubhead${index}">Subhead:</label>
                    <input type="text" id="ctaBannerSubhead${index}" name="ctaBannerSubhead${index}" value="${section.ctaBannerContent?.subhead || ''}">
                </div>
                <div class="form-group">
                    <label for="ctaBannerHeadline${index}">Headline (HTML allowed):</label>
                    <textarea id="ctaBannerHeadline${index}" name="ctaBannerHeadline${index}">${section.ctaBannerContent?.headline || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="ctaBannerSmallText${index}">Small Text:</label>
                    <input type="text" id="ctaBannerSmallText${index}" name="ctaBannerSmallText${index}" value="${section.ctaBannerContent?.smallText || ''}">
                </div>
            `;
        }

        div.innerHTML = `
            <h4>Section ${index + 1}</h4>
            <div class="form-group">
                <label for="sectionType${index}">Section Type:</label>
                <select id="sectionType${index}" name="sectionType${index}" onchange="handleSectionTypeChange(this, ${index})">
                    <option value="standard" ${section.type === 'standard' ? 'selected' : ''}>Standard Content</option>
                    <option value="ctaBanner" ${section.type === 'ctaBanner' ? 'selected' : ''}>CTA Banner</option>
                </select>
            </div>
            ${titleInput}
            <div id="sectionContent${index}">
                ${contentHtml}
            </div>
            <div class="dynamic-item-controls">
                <button type="button" onclick="removeDynamicItem(this)">Remove Section</button>
            </div>
        `;
        return div;
    }

    window.addSection = function() {
        addDynamicItem('sectionsContainer', { type: 'standard', title: '', paragraphs: [''] }, createSectionInputs);
    }

    window.handleSectionTypeChange = function(selectElement, index) {
        const newType = selectElement.value;
        const sectionContentDiv = document.getElementById(`sectionContent${index}`);
        const titleInputGroup = selectElement.closest('.dynamic-item-group').querySelector(`input[id="sectionTitle${index}"]`)?.closest('.form-group');

        sectionContentDiv.innerHTML = ''; // Clear current content

        if (titleInputGroup) {
            if (newType === 'ctaBanner') {
                titleInputGroup.style.display = 'none'; // Hide title for CTA banner
            } else {
                titleInputGroup.style.display = 'block'; // Show title for standard
            }
        }

        if (newType === 'standard') {
            sectionContentDiv.innerHTML = `
                <div class="form-group">
                    <label>Paragraphs:</label>
                    <div id="sectionParagraphsContainer${index}"></div>
                    <div class="dynamic-item-controls">
                        <button type="button" class="add-item" onclick="addParagraph('sectionParagraphsContainer${index}')">Add Paragraph</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>List Items:</label>
                    <div id="sectionListItemsContainer${index}"></div>
                    <div class="dynamic-item-controls">
                        <button type="button" class="add-item" onclick="addParagraph('sectionListItemsContainer${index}')">Add List Item</button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="sectionTestimonialQuote${index}">Testimonial Quote:</label>
                    <textarea id="sectionTestimonialQuote${index}" name="sectionTestimonialQuote${index}"></textarea>
                </div>
                <div class="form-group">
                    <label for="sectionImageSrc${index}">Image URL:</label>
                    <input type="text" id="sectionImageSrc${index}" name="sectionImageSrc${index}" placeholder="https://example.com/section-image.jpg">
                </div>
            `;
        } else if (newType === 'ctaBanner') {
            sectionContentDiv.innerHTML = `
                <div class="form-group">
                    <label for="ctaBannerSubhead${index}">Subhead:</label>
                    <input type="text" id="ctaBannerSubhead${index}" name="ctaBannerSubhead${index}">
                </div>
                <div class="form-group">
                    <label for="ctaBannerHeadline${index}">Headline (HTML allowed):</label>
                    <textarea id="ctaBannerHeadline${index}" name="ctaBannerHeadline${index}"></textarea>
                </div>
                <div class="form-group">
                    <label for="ctaBannerSmallText${index}">Small Text:</label>
                    <input type="text" id="ctaBannerSmallText${index}" name="ctaBannerSmallText${index}">
                </div>
            `;
        }
    }

    // --- Populate Form Function ---
    function populateForm() {
        if (typeof config === 'undefined') { console.error("Config not loaded!"); return; }
        const c = config;

        // Globals Panel
        setVal('globalCompanyName', c.globals?.companyName);
        if (window.githubConfig) {
            setVal('githubRepoName', window.githubConfig.repoName);
        }
        setVal('globalMainCTAButtonText', c.globals?.mainCTAButtonText);
        setVal('globalMainCTAButtonURL', c.globals?.mainCTAButtonURL);
        setVal('globalPrimaryColor', c.globals?.primaryColor);
        document.getElementById('globalPrimaryColorPicker').value = c.globals?.primaryColor || '#e3c379';
        setVal('globalAccentColor', c.globals?.accentColor);
        document.getElementById('globalAccentColorPicker').value = c.globals?.accentColor || '#d9c6a2';
        setVal('globalFacebookPixelId', c.globals?.facebookPixelId);
        if (c.globals.agents && Array.isArray(c.globals.agents)) {
            renderDynamicItems('agentsContainer', c.globals.agents, createAgentInputs);
        }

        // Header Panel
        setVal('headerTag', c.header?.tag);
        setVal('headerTitle', c.header?.title);
        setVal('headerSubheadline', c.header?.subheadline);

        // Summary Panel (formerly part of Main Box)
        setVal('mainBoxSummaryTitle', c.mainBox?.summary?.title);
        setVal('mainBoxSummaryHeroImageSrc', c.mainBox?.summary?.heroImage?.src);
        setVal('mainBoxSummarySubTitle', c.mainBox?.summary?.subTitle);
        renderDynamicItems('mainBoxSummaryParagraphsContainer', c.mainBox?.summary?.paragraphs, (text, index) => createParagraphInput(text, 'mainBoxSummaryParagraphsContainer', index));

        // Sidebar Panel (formerly part of Main Box)
        setVal('mainBoxSidebarTitle', c.mainBox?.sidebar?.title);
        setVal('mainBoxSidebarImageSrc', c.mainBox?.sidebar?.image?.src);
        renderDynamicItems('mainBoxSidebarParagraphsContainer', c.mainBox?.sidebar?.paragraphs, (text, index) => createParagraphInput(text, 'mainBoxSidebarParagraphsContainer', index));

        // Sections Panel
        if (c.sections && Array.isArray(c.sections)) {
            renderDynamicItems('sectionsContainer', c.sections, createSectionInputs);
        }

        // Footer Panel
        setVal('footerLogoSrc', c.footer?.logo?.src);
        setVal('footerBrokerageLabel', c.footer?.brokerageLabel);
        setVal('footerBrokerageName', c.footer?.brokerageName);
        setVal('footerBrokerageAddress', c.footer?.brokerageAddress);
        setVal('footerSecondaryLogoSrc', c.footer?.secondaryLogo?.src);
        setVal('footerDisclaimerText', c.footer?.disclaimerText);
        setVal('footerPrivacyPolicyText', c.footer?.privacyPolicy?.text);
        setVal('footerPrivacyPolicyHref', c.footer?.privacyPolicy?.href);
        // Agents in footer will be handled dynamically later
    }

    // --- Handle Form Submit Function ---
    async function handleFormSubmit(event) {
        event.preventDefault();
        messageDiv.textContent = 'Saving...';
        messageDiv.className = '';

        const updatedConfig = {
            globals: { agents: [] },
            header: {},
            mainBox: { summary: {}, sidebar: {} }, // Keep mainBox structure for config.js
            sections: [],
            footer: { privacyPolicy: {}, logo: {}, secondaryLogo: {} }
        };

        try {
            // Globals Panel
            updatedConfig.globals.companyName = getVal('globalCompanyName');
            updatedConfig.globals.mainCTAButtonText = getVal('globalMainCTAButtonText');
            updatedConfig.globals.mainCTAButtonURL = getVal('globalMainCTAButtonURL');
            updatedConfig.globals.primaryColor = getVal('globalPrimaryColor');
            updatedConfig.globals.accentColor = getVal('globalAccentColor');
            updatedConfig.globals.facebookPixelId = getVal('globalFacebookPixelId');

            // GitHub Repo
            updatedConfig.githubRepo = getVal('githubRepoName');
            
            // Collect agents dynamically
            document.querySelectorAll('#agentsContainer .dynamic-item-group').forEach((group, index) => {
                // Find the agent name and image inputs within this group
                const nameInput = group.querySelector('input[id^="agentName"]');
                const imageInput = group.querySelector('input[id^="agentImageSrc"]');
                
                const name = nameInput?.value || '';
                const imageSrc = imageInput?.value || '';
                
                const contactDetails = [];
                group.querySelectorAll(`.contact-detail-item`).forEach((contactGroup) => {
                    const typeSelect = contactGroup.querySelector('select');
                    const valueInput = contactGroup.querySelector('input[type="text"]');
                    
                    const type = typeSelect?.value;
                    const value = valueInput?.value;
                    
                    if (type && value) {
                        contactDetails.push({ type, value });
                    }
                });
                
                // Always add agent if they have a name, even if other fields are empty
                if (name.trim() !== '') {
                    updatedConfig.globals.agents.push({ name: name.trim(), imageSrc: imageSrc || '', contactDetails });
                }
            });


            // Header Panel
            updatedConfig.header.tag = getVal('headerTag');
            updatedConfig.header.title = getVal('headerTitle');
            updatedConfig.header.subheadline = getVal('headerSubheadline');

            // Summary Panel (collect into mainBox.summary)
            updatedConfig.mainBox.summary.title = getVal('mainBoxSummaryTitle');
            updatedConfig.mainBox.summary.heroImage = { src: getVal('mainBoxSummaryHeroImageSrc') };
            updatedConfig.mainBox.summary.subTitle = getVal('mainBoxSummarySubTitle');
            updatedConfig.mainBox.summary.paragraphs = Array.from(document.querySelectorAll('#mainBoxSummaryParagraphsContainer .paragraph-item textarea')).map(textarea => textarea.value);

            // Sidebar Panel (collect into mainBox.sidebar)
            updatedConfig.mainBox.sidebar.title = getVal('mainBoxSidebarTitle');
            updatedConfig.mainBox.sidebar.image = { src: getVal('mainBoxSidebarImageSrc') };
            updatedConfig.mainBox.sidebar.paragraphs = Array.from(document.querySelectorAll('#mainBoxSidebarParagraphsContainer .paragraph-item textarea')).map(textarea => textarea.value);

            // Sections Panel (collect dynamically)
            document.querySelectorAll('#sectionsContainer > .dynamic-item-group').forEach((sectionGroup, sectionIndex) => {
                const typeSelect = sectionGroup.querySelector(`#sectionType${sectionIndex}`);
                const type = typeSelect ? typeSelect.value : 'standard';
                let sectionData = { type };

                if (type === 'standard') {
                    sectionData.title = sectionGroup.querySelector(`#sectionTitle${sectionIndex}`)?.value || '';
                    sectionData.paragraphs = Array.from(sectionGroup.querySelectorAll(`#sectionParagraphsContainer${sectionIndex} .paragraph-item textarea`)).map(textarea => textarea.value);
                    const testimonialQuote = sectionGroup.querySelector(`#sectionTestimonialQuote${sectionIndex}`)?.value;
                    if (testimonialQuote) {
                        sectionData.testimonial = { quote: testimonialQuote };
                    }
                    const imageSrc = sectionGroup.querySelector(`#sectionImageSrc${sectionIndex}`)?.value;
                    if (imageSrc) {
                        sectionData.image = { src: imageSrc };
                    }
                    sectionData.listItems = Array.from(sectionGroup.querySelectorAll(`#sectionListItemsContainer${sectionIndex} .paragraph-item textarea`)).map(textarea => textarea.value);
                } else if (type === 'ctaBanner') {
                    sectionData.ctaBannerContent = {
                        subhead: sectionGroup.querySelector(`#ctaBannerSubhead${sectionIndex}`)?.value || '',
                        headline: sectionGroup.querySelector(`#ctaBannerHeadline${sectionIndex}`)?.value || '',
                        smallText: sectionGroup.querySelector(`#ctaBannerSmallText${sectionIndex}`)?.value || ''
                    };
                }
                updatedConfig.sections.push(sectionData);
            });


            // Footer Panel
            updatedConfig.footer.logo.src = getVal('footerLogoSrc');
            updatedConfig.footer.brokerageLabel = getVal('footerBrokerageLabel');
            updatedConfig.footer.brokerageName = getVal('footerBrokerageName');
            updatedConfig.footer.brokerageAddress = getVal('footerBrokerageAddress');
            updatedConfig.footer.secondaryLogo.src = getVal('footerSecondaryLogoSrc');
            updatedConfig.footer.disclaimerText = getVal('footerDisclaimerText');
            updatedConfig.footer.privacyPolicy.text = getVal('footerPrivacyPolicyText');
            updatedConfig.footer.privacyPolicy.href = getVal('footerPrivacyPolicyHref');
            // Agents in footer will be collected dynamically later

            // --- Webhook Submission (Placeholder for now) ---
            const adminWebhookUrl = "https://n8n.salesgenius.co/webhook/casestudyupdate"; // Existing webhook URL
            
            const response = await fetch(adminWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedConfig),
            });

            if (response.ok) {
                messageDiv.textContent = 'Configuration saved successfully! Reload page to see changes reflected if n8n updated config.js.';
                messageDiv.className = 'success';
            } else {
                const errorData = await response.text();
                throw new Error(`Error saving configuration: ${response.status} ${errorData}`);
            }
        } catch (error) {
            console.error("Error during form submission:", error);
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.className = 'error';
        }
    }

    // --- Side Navigation Logic ---
    function initSideNav() {
        const navLinks = document.querySelectorAll('#sideNav a');
        const contentPanels = document.querySelectorAll('.content-panel');

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                contentPanels.forEach(panel => {
                    panel.classList.toggle('active', panel.id === targetId);
                });
            });
        });
        if (navLinks.length > 0) { navLinks[0].click(); } // Activate first tab
    }

    // --- Initialization ---
    function init() {
        const password = prompt("Enter password to access admin page:", "");
        if (password === "123456") { // Replace with a secure method if needed
            if (typeof config === 'undefined') {
                 alert("Error: Configuration file (config.js) failed to load. Cannot initialize admin page.");
                 document.body.innerHTML = '<p style="color:red; text-align:center; margin-top: 50px; font-size:18px; width:100%;">Configuration Error</p>';
                 return;
            }
            document.body.style.justifyContent = 'flex-start';
            document.body.style.alignItems = 'flex-start';
            adminLayout.classList.remove('hidden');
            populateForm();
            initSideNav();
            configForm.addEventListener('submit', handleFormSubmit);

 
             // Add event listeners for color pickers
             document.getElementById('globalPrimaryColorPicker').addEventListener('input', (event) => {
                 document.getElementById('globalPrimaryColor').value = event.target.value;
            });
            document.getElementById('globalPrimaryColor').addEventListener('input', (event) => {
                document.getElementById('globalPrimaryColorPicker').value = event.target.value;
            });

            document.getElementById('globalAccentColorPicker').addEventListener('input', (event) => {
                document.getElementById('globalAccentColor').value = event.target.value;
            });
            document.getElementById('globalAccentColor').addEventListener('input', (event) => {
                document.getElementById('globalAccentColorPicker').value = event.target.value;
            });

        } else {
            alert("Incorrect password. Access denied.");
            document.body.innerHTML = '<p style="color:red; text-align:center; margin-top: 50px; font-size:18px; width:100%;">Access Denied</p>';
        }
    }

    init();
});