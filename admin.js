document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.config === 'undefined') {
        console.error('Configuration object (window.config) not found. Make sure config.js is loaded before admin.js.');
        alert('Error: config.js not found. Cannot build admin page.');
        return;
    }

    const formContainer = document.getElementById('config-form');
    const saveBtn = document.getElementById('save-changes-btn');
    const saveStatus = document.getElementById('save-status');

    // ============================================================================================
    // HELPERS
    // ============================================================================================

    function toHumanReadable(text) {
        if (!text) return '';
        if (text === 'src' || text === 'imageSrc') return 'Image URL';
        const result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    // ============================================================================================
    // DYNAMIC FORM GENERATION
    // ============================================================================================

    function createFormElement(key, value, path) {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.dataset.key = key;

        const label = document.createElement('label');
        label.textContent = toHumanReadable(key);
        group.appendChild(label);

        let input;
        if (key === 'type' && path.includes('contactDetails')) {
            input = document.createElement('select');
            const options = ['email', 'phone'];
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = toHumanReadable(opt);
                if (opt === value) option.selected = true;
                input.appendChild(option);
            });
        } else if (key === 'type' && path.includes('sections')) {
            input = document.createElement('select');
            input.className = 'section-type-selector';
            const options = ['standard', 'ctaBanner'];
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = toHumanReadable(opt);
                if (opt === value) option.selected = true;
                input.appendChild(option);
            });
            input.addEventListener('change', handleSectionTypeChange);
        } else if (Array.isArray(value)) {
            input = buildArrayEditor(key, value, path);
        } else if (typeof value === 'object' && value !== null) {
            input = buildObjectEditor(value, true, path);
        } else if (key.toLowerCase().includes('color')) {
            const colorContainer = document.createElement('div');
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = value;
            colorContainer.appendChild(colorInput);
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = value;
            textInput.dataset.path = path; // The text input holds the value
            colorInput.addEventListener('input', () => textInput.value = colorInput.value);
            textInput.addEventListener('input', () => colorInput.value = textInput.value);
            colorContainer.appendChild(textInput);
            input = colorContainer;
        } else {
            const isTextarea = typeof value === 'string' && (value.length > 60 || value.includes('\n') || value.includes('<')) && key !== 'src' && key !== 'imageSrc';
            if (isTextarea) {
                input = document.createElement('textarea');
                input.rows = value.split('\n').length + 2;
            } else {
                input = document.createElement('input');
                input.type = (typeof value === 'number') ? 'number' : 'text';
            }
            input.value = value;
        }
        
        if (input.nodeName !== 'FIELDSET' && input.nodeName !== 'DIV') {
            input.dataset.path = path;
        }
        group.appendChild(input);
        return group;
    }

    function handleSectionTypeChange(event) {
        const selectElement = event.target;
        const newType = selectElement.value;
        const sectionFieldset = selectElement.closest('.nested-object');
        const typeTitleRow = sectionFieldset.querySelector('.type-title-row');
        const fieldsToRemove = Array.from(sectionFieldset.children).filter(child => child !== typeTitleRow);
        fieldsToRemove.forEach(el => el.remove());
        
        const pathPrefix = selectElement.dataset.path.substring(0, selectElement.dataset.path.lastIndexOf('.'));

        if (newType === 'standard') {
            if (!typeTitleRow.querySelector('[data-key="title"]')) {
                const titleElement = createFormElement('title', 'New Section', `${pathPrefix}.title`);
                titleElement.classList.add('col-3-4');
                typeTitleRow.appendChild(titleElement);
            }
            buildStandardSectionFields(sectionFieldset, {}, pathPrefix);
        } else if (newType === 'ctaBanner') {
            const titleElement = typeTitleRow.querySelector('[data-key="title"]');
            if (titleElement) titleElement.remove();
            buildCtaBannerSectionFields(sectionFieldset, {}, pathPrefix);
        }
    }

    function buildStandardSectionFields(fieldset, data, pathPrefix) {
        fieldset.appendChild(createFormElement('paragraphs', data.paragraphs || [''], `${pathPrefix}.paragraphs`));
        const optionalControlsContainer = document.createElement('div');
        optionalControlsContainer.className = 'optional-controls-row';
        const testimonialContainer = document.createElement('div');
        testimonialContainer.className = 'optional-container';
        optionalControlsContainer.appendChild(testimonialContainer);
        updateOptionalButton(testimonialContainer, 'testimonial', data.testimonial, addTestimonialToSection, pathPrefix);
        const imageContainer = document.createElement('div');
        imageContainer.className = 'optional-container';
        optionalControlsContainer.appendChild(imageContainer);
        updateOptionalButton(imageContainer, 'image', data.image, addImageToSection, pathPrefix);
        fieldset.appendChild(optionalControlsContainer);
    }

    function buildCtaBannerSectionFields(fieldset, data, pathPrefix) {
        fieldset.appendChild(createFormElement('ctaBannerContent', data.ctaBannerContent || { subhead: '', headline: '', smallText: '' }, `${pathPrefix}.ctaBannerContent`));
    }

    function buildObjectEditor(obj, isNested = false, path) {
        const fieldset = document.createElement('fieldset');
        if (isNested) fieldset.className = 'nested-object';

        const keys = Object.keys(obj);
        keys.forEach(key => {
            fieldset.appendChild(createFormElement(key, obj[key], `${path}.${key}`));
        });
        return fieldset;
    }

    function updateOptionalButton(container, key, data, addFunction, pathPrefix) {
        container.innerHTML = '';
        const newPath = `${pathPrefix}.${key}`;
        if (data) {
            const fields = createFormElement(key, data, newPath);
            container.appendChild(fields);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = `Remove ${toHumanReadable(key)}`;
            removeBtn.className = 'toggle-optional-btn remove-btn';
            removeBtn.onclick = () => updateOptionalButton(container, key, null, addFunction, pathPrefix);
            fields.appendChild(removeBtn);
        } else {
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.textContent = `Add ${toHumanReadable(key)}`;
            addBtn.className = 'toggle-optional-btn add-btn';
            addBtn.onclick = () => addFunction(container, pathPrefix);
            container.appendChild(addBtn);
        }
    }

    function addImageToSection(container, pathPrefix) {
        updateOptionalButton(container, 'image', { src: '' }, addImageToSection, pathPrefix);
    }

    function addTestimonialToSection(container, pathPrefix) {
        updateOptionalButton(container, 'testimonial', { quote: '' }, addTestimonialToSection, pathPrefix);
    }

    function buildArrayEditor(key, arr, path) {
        const container = document.createElement('div');
        const listContainer = document.createElement('div');
        listContainer.className = 'array-list';
        container.appendChild(listContainer);
        const isStringArray = arr.every(item => typeof item === 'string');
        if (isStringArray) {
            arr.forEach((item, index) => listContainer.appendChild(createStringArrayItem(item, `${path}.${index}`)));
        } else {
            arr.forEach((item, index) => listContainer.appendChild(createObjectArrayItem(item, key, index, `${path}.${index}`)));
        }
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.textContent = `+ Add New ${toHumanReadable(key.slice(0, -1))}`;
        addBtn.className = 'add-btn';
        addBtn.onclick = () => {
            const newIndex = listContainer.children.length;
            const newPath = `${path}.${newIndex}`;
            if (isStringArray) {
                listContainer.appendChild(createStringArrayItem('', newPath));
            } else {
                let newItemData = {};
                if (key === 'sections') newItemData = { type: 'standard', title: 'New Section', paragraphs: [''] };
                else if (key === 'agents') newItemData = { name: '', imageSrc: '', contactDetails: [{type: 'email', value: ''}] };
                else if (key === 'contactDetails') newItemData = { type: 'email', value: '' };
                else if (arr.length > 0) newItemData = JSON.parse(JSON.stringify(arr[0]));
                
                Object.keys(newItemData).forEach(k => {
                    if (Array.isArray(newItemData[k])) newItemData[k] = [];
                    else if (typeof newItemData[k] === 'object' && newItemData[k] !== null) Object.keys(newItemData[k]).forEach(subKey => newItemData[k][subKey] = '');
                    else newItemData[k] = '';
                });
                listContainer.appendChild(createObjectArrayItem(newItemData, key, newIndex, newPath));
            }
        };
        container.appendChild(addBtn);
        return container;
    }

    function createObjectArrayItem(itemData, key, index, path) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'array-item object-item';
        if (key === 'sections') {
            const header = document.createElement('h3');
            header.className = 'array-item-header';
            header.textContent = `Section ${index + 1}`;
            itemContainer.appendChild(header);
        }
        const fieldset = buildObjectEditor(itemData, true, path);
        itemContainer.appendChild(fieldset);
        const controls = document.createElement('div');
        controls.className = 'array-controls';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = `Remove ${toHumanReadable(key.slice(0, -1))}`;
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => itemContainer.remove();
        controls.appendChild(removeBtn);
        itemContainer.appendChild(controls);
        return itemContainer;
    }

    function createStringArrayItem(itemData, path) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'array-item string-item';
        const textarea = document.createElement('textarea');
        textarea.value = itemData;
        textarea.rows = 3;
        textarea.dataset.path = path;
        itemContainer.appendChild(textarea);
        const controls = document.createElement('div');
        controls.className = 'array-controls';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove Item';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = () => itemContainer.remove();
        controls.appendChild(removeBtn);
        itemContainer.appendChild(controls);
        return itemContainer;
    }

    function buildForm(config, container) {
        for (const key in config) {
            container.appendChild(createFormElement(key, config[key], key));
        }
    }

    buildForm(window.config, formContainer);

    // ============================================================================================
    // FORM PARSING AND CONFIG GENERATION (REWRITTEN)
    // ============================================================================================
    
    function setValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];
            const isNextKeyNumeric = !isNaN(parseInt(nextKey, 10));
            if (!current[key]) {
                current[key] = isNextKeyNumeric ? [] : {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    }

    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true;
        saveStatus.textContent = 'Saving...';
        saveStatus.className = 'status-saving';

        const newConfig = {};
        const allInputs = formContainer.querySelectorAll('[data-path]');

        allInputs.forEach(input => {
            const path = input.dataset.path;
            let value = input.value;
            if (input.type === 'number') value = parseFloat(value);
            setValue(newConfig, path, value);
        });

        // Merge githubConfig if it exists
        if (window.githubConfig && window.githubConfig.repoName) {
            newConfig.githubRepo = window.githubConfig.repoName;
        }

        try {
            const response = await fetch('https://n8n.salesgenius.co/webhook/casestudyupdate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newConfig),
            });

            if (response.ok) {
                saveStatus.textContent = '✅ Changes Saved Successfully!';
                saveStatus.className = 'status-success';
            } else {
                const errorText = await response.text();
                throw new Error(`Webhook failed with status: ${response.status}. ${errorText}`);
            }
        } catch (error) {
            console.error('Error saving config:', error);
            saveStatus.textContent = `❌ Error: Could not save changes. ${error.message}`;
            saveStatus.className = 'status-error';
        } finally {
            setTimeout(() => {
                saveBtn.disabled = false;
                saveStatus.textContent = '';
                saveStatus.className = '';
            }, 4000);
        }
    });
});