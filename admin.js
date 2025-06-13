document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.config === 'undefined') {
        console.error('Configuration object (window.config) not found. Make sure config.js is loaded before admin.js.');
        alert('Error: config.js not found. Cannot build admin page.');
        return;
    }

    const formContainer = document.getElementById('config-form');
    const generateBtn = document.getElementById('generate-config-btn');
    const outputContainer = document.getElementById('output-container');
    const configOutput = document.getElementById('config-output');
    const copyBtn = document.getElementById('copy-config-btn');

    // ============================================================================================
    // HELPERS
    // ============================================================================================

    function toHumanReadable(text) {
        if (!text) return '';
        const result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    // ============================================================================================
    // DYNAMIC FORM GENERATION
    // ============================================================================================

    function createFormElement(key, value, parentKey = '') {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.dataset.key = key;

        const label = document.createElement('label');
        label.textContent = toHumanReadable(key);
        group.appendChild(label);

        if (key === 'type' && parentKey === 'contactDetails') {
            const select = document.createElement('select');
            const options = ['email', 'phone'];
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = toHumanReadable(opt);
                if (opt === value) option.selected = true;
                select.appendChild(option);
            });
            group.appendChild(select);
        } else if (key === 'type' && (value === 'standard' || value === 'ctaBanner')) {
            const select = document.createElement('select');
            select.className = 'section-type-selector';
            const options = ['standard', 'ctaBanner'];
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = toHumanReadable(opt);
                if (opt === value) option.selected = true;
                select.appendChild(option);
            });
            group.appendChild(select);
            select.addEventListener('change', handleSectionTypeChange);
        } else if (Array.isArray(value)) {
            group.appendChild(buildArrayEditor(key, value));
        } else if (typeof value === 'object' && value !== null) {
            group.appendChild(buildObjectEditor(value, true, key));
        } else if (key.toLowerCase().includes('color')) {
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = value;
            group.appendChild(colorInput);
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = value;
            colorInput.addEventListener('input', () => textInput.value = colorInput.value);
            textInput.addEventListener('input', () => colorInput.value = textInput.value);
            group.appendChild(textInput);
        } else {
            let input;
            const isTextarea = typeof value === 'string' && (value.length > 60 || value.includes('\n') || value.includes('<') || key === 'headline');
            if (isTextarea) {
                input = document.createElement('textarea');
                input.rows = value.split('\n').length + 2;
            } else {
                input = document.createElement('input');
                input.type = (typeof value === 'number') ? 'number' : 'text';
            }
            input.value = value;
            group.appendChild(input);
        }
        return group;
    }

    function handleSectionTypeChange(event) {
        const selectElement = event.target;
        const newType = selectElement.value;
        const sectionFieldset = selectElement.closest('.nested-object');
        const typeTitleRow = sectionFieldset.querySelector('.type-title-row');
        const fieldsToRemove = Array.from(sectionFieldset.children).filter(child => child !== typeTitleRow);
        fieldsToRemove.forEach(el => el.remove());
        if (newType === 'standard') {
            if (!typeTitleRow.querySelector('[data-key="title"]')) {
                const titleElement = createFormElement('title', 'New Section');
                titleElement.classList.add('col-3-4');
                typeTitleRow.appendChild(titleElement);
            }
            buildStandardSectionFields(sectionFieldset, {});
        } else if (newType === 'ctaBanner') {
            const titleElement = typeTitleRow.querySelector('[data-key="title"]');
            if (titleElement) titleElement.remove();
            buildCtaBannerSectionFields(sectionFieldset, {});
        }
    }

    function buildStandardSectionFields(fieldset, data) {
        fieldset.appendChild(createFormElement('paragraphs', data.paragraphs || ['']));
        const optionalControlsContainer = document.createElement('div');
        optionalControlsContainer.className = 'optional-controls-row';
        const testimonialContainer = document.createElement('div');
        testimonialContainer.className = 'optional-container';
        optionalControlsContainer.appendChild(testimonialContainer);
        updateOptionalButton(testimonialContainer, 'testimonial', data.testimonial, addTestimonialToSection);
        const imageContainer = document.createElement('div');
        imageContainer.className = 'optional-container';
        optionalControlsContainer.appendChild(imageContainer);
        updateOptionalButton(imageContainer, 'image', data.image, addImageToSection);
        fieldset.appendChild(optionalControlsContainer);
    }

    function buildCtaBannerSectionFields(fieldset, data) {
        fieldset.appendChild(createFormElement('ctaBannerContent', data.ctaBannerContent || { subhead: '', headline: '', smallText: '' }));
    }

    function buildObjectEditor(obj, isNested = false, parentKey = '') {
        const fieldset = document.createElement('fieldset');
        if (isNested) fieldset.className = 'nested-object';

        if ('summary' in obj && 'sidebar' in obj) {
            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid-container';
            const summaryContainer = document.createElement('div');
            summaryContainer.appendChild(createFormElement('summary', obj.summary));
            gridContainer.appendChild(summaryContainer);
            const sidebarContainer = document.createElement('div');
            sidebarContainer.appendChild(createFormElement('sidebar', obj.sidebar));
            gridContainer.appendChild(sidebarContainer);
            fieldset.appendChild(gridContainer);
            return fieldset;
        }

        if (obj.hasOwnProperty('type') && parentKey === 'sections') {
            const typeTitleRow = document.createElement('div');
            typeTitleRow.className = 'form-row type-title-row';
            const typeElement = createFormElement('type', obj.type, parentKey);
            typeElement.classList.add('col-1-4');
            typeTitleRow.appendChild(typeElement);
            if (obj.type === 'standard') {
                const titleElement = createFormElement('title', obj.title || '');
                titleElement.classList.add('col-3-4');
                typeTitleRow.appendChild(titleElement);
            }
            fieldset.appendChild(typeTitleRow);
            if (obj.type === 'standard') buildStandardSectionFields(fieldset, obj);
            else if (obj.type === 'ctaBanner') buildCtaBannerSectionFields(fieldset, obj);
            return fieldset;
        }

        const keys = Object.keys(obj);
        const groupedKeys = [];
        const usedKeys = new Set();
        const potentialGroups = [['name', 'imageSrc'], ['brokerageLabel', 'brokerageName'], ['primaryColor', 'accentColor'], ['mainCTAButtonText', 'mainCTAButtonURL'], ['title', 'subTitle'], ['type', 'value']];
        
        potentialGroups.forEach(group => {
            if (group.every(key => keys.includes(key))) {
                // Special case for contactDetails to ensure it's handled correctly
                if (parentKey === 'contactDetails' && group.includes('type') && group.includes('value')) {
                     groupedKeys.push(group);
                     group.forEach(key => usedKeys.add(key));
                } else if (parentKey !== 'contactDetails') {
                    groupedKeys.push(group);
                    group.forEach(key => usedKeys.add(key));
                }
            }
        });

        groupedKeys.forEach(keyGroup => {
            const row = document.createElement('div');
            row.className = 'form-row';
            keyGroup.forEach(key => row.appendChild(createFormElement(key, obj[key], parentKey)));
            fieldset.appendChild(row);
        });
        keys.forEach(key => {
            if (!usedKeys.has(key)) fieldset.appendChild(createFormElement(key, obj[key], parentKey));
        });
        return fieldset;
    }

    function updateOptionalButton(container, key, data, addFunction) {
        container.innerHTML = '';
        if (data) {
            const fields = createFormElement(key, data);
            container.appendChild(fields);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = `Remove ${toHumanReadable(key)}`;
            removeBtn.className = 'toggle-optional-btn remove-btn';
            removeBtn.onclick = () => updateOptionalButton(container, key, null, addFunction);
            fields.appendChild(removeBtn);
        } else {
            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.textContent = `Add ${toHumanReadable(key)}`;
            addBtn.className = 'toggle-optional-btn add-btn';
            addBtn.onclick = () => addFunction(container);
            container.appendChild(addBtn);
        }
    }

    function addImageToSection(container) {
        updateOptionalButton(container, 'image', { src: '', alt: '' }, addImageToSection);
    }

    function addTestimonialToSection(container) {
        updateOptionalButton(container, 'testimonial', { quote: '' }, addTestimonialToSection);
    }

    function buildArrayEditor(key, arr) {
        const container = document.createElement('div');
        const listContainer = document.createElement('div');
        listContainer.className = 'array-list';
        container.appendChild(listContainer);
        const isStringArray = arr.every(item => typeof item === 'string');
        if (isStringArray) {
            arr.forEach(item => listContainer.appendChild(createStringArrayItem(item)));
        } else {
            arr.forEach((item, index) => listContainer.appendChild(createObjectArrayItem(item, key, index)));
        }
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.textContent = `+ Add New ${toHumanReadable(key.slice(0, -1))}`;
        addBtn.className = 'add-btn';
        addBtn.onclick = () => {
            if (isStringArray) {
                listContainer.appendChild(createStringArrayItem(''));
            } else if (key === 'sections') {
                const newSectionTemplate = { type: 'standard', title: 'New Section', paragraphs: [''] };
                listContainer.appendChild(createObjectArrayItem(newSectionTemplate, key, listContainer.children.length));
            } else if (key === 'agents') {
                 const newAgentTemplate = { name: '', imageSrc: '', contactDetails: [{type: 'email', value: ''}] };
                 listContainer.appendChild(createObjectArrayItem(newAgentTemplate, key, listContainer.children.length));
            } else if (key === 'contactDetails') {
                const newContactTemplate = { type: 'email', value: '' };
                listContainer.appendChild(createObjectArrayItem(newContactTemplate, key, listContainer.children.length));
            }
        };
        container.appendChild(addBtn);
        return container;
    }

    function createObjectArrayItem(itemData, key, index) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'array-item object-item';
        if (key === 'sections') {
            const header = document.createElement('h3');
            header.className = 'array-item-header';
            header.textContent = `Section ${index + 1}`;
            itemContainer.appendChild(header);
        }
        const fieldset = buildObjectEditor(itemData, true, key);
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

    function createStringArrayItem(itemData) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'array-item string-item';
        const textarea = document.createElement('textarea');
        textarea.value = itemData;
        textarea.rows = 3;
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
            const fieldset = document.createElement('fieldset');
            const legend = document.createElement('legend');
            legend.textContent = toHumanReadable(key);
            fieldset.appendChild(legend);
            if (key === 'sections') {
                fieldset.appendChild(buildArrayEditor(key, config[key]));
            } else {
                fieldset.appendChild(buildObjectEditor(config[key]));
            }
            container.appendChild(fieldset);
        }
    }

    buildForm(window.config, formContainer);

    // ============================================================================================
    // FORM PARSING AND CONFIG GENERATION
    // ============================================================================================

    function parseFieldset(fieldset) {
        const data = {};
        const directChildren = Array.from(fieldset.children);
        directChildren.forEach(child => {
            if (child.classList.contains('form-group') || child.classList.contains('form-row')) {
                const groups = child.classList.contains('form-row') ? child.querySelectorAll('.form-group') : [child];
                groups.forEach(group => {
                    const key = group.dataset.key;
                    if (!key) return;
                    const textInput = group.querySelector('input[type="text"], textarea:not(.string-item textarea)');
                    const select = group.querySelector('select');
                    const nestedFieldset = group.querySelector('fieldset.nested-object');
                    const arrayContainer = group.querySelector('.array-list');
                    if (arrayContainer) data[key] = parseArray(arrayContainer);
                    else if (nestedFieldset) data[key] = parseFieldset(nestedFieldset);
                    else if (select) data[key] = select.value;
                    else if (textInput) {
                        const colorInput = group.querySelector('input[type="color"]');
                        if (colorInput) data[key] = group.querySelector('input[type="text"]').value;
                        else data[key] = textInput.value;
                    }
                });
            } else if (child.classList.contains('optional-controls-row')) {
                const optionalGroups = child.querySelectorAll('.optional-container > .form-group');
                optionalGroups.forEach(group => {
                    const key = group.dataset.key;
                    if (key) data[key] = parseFieldset(group.querySelector('fieldset'));
                });
            } else if (child.classList.contains('grid-container')) {
                const gridGroups = child.querySelectorAll('.form-group');
                gridGroups.forEach(group => {
                    const key = group.dataset.key;
                    if (key) data[key] = parseFieldset(group.querySelector('fieldset'));
                });
            }
        });
        return data;
    }

    function parseArray(arrayContainer) {
        const arr = [];
        const objectItems = arrayContainer.querySelectorAll(':scope > .object-item');
        const stringItems = arrayContainer.querySelectorAll(':scope > .string-item');
        if (objectItems.length > 0) {
            objectItems.forEach(item => arr.push(parseFieldset(item.querySelector('fieldset'))));
        } else if (stringItems.length > 0) {
            stringItems.forEach(item => arr.push(item.querySelector('textarea').value));
        }
        return arr;
    }

    generateBtn.addEventListener('click', () => {
        const newConfig = {};
        const topLevelFieldsets = formContainer.querySelectorAll(':scope > fieldset');
        topLevelFieldsets.forEach(fieldset => {
            const legendText = fieldset.querySelector('legend').textContent;
            const key = legendText.toLowerCase().replace(/\s/g, '');
            const arrayEditor = fieldset.querySelector(':scope > div > .array-list');
            if (key === 'sections' && arrayEditor) {
                newConfig[key] = parseArray(arrayEditor);
            } else {
                newConfig[key] = parseFieldset(fieldset.querySelector(':scope > fieldset'));
            }
        });
        const finalConfigString = `const config = ${JSON.stringify(newConfig, null, 4)};\n\n` +
            `// Export for Node.js environment (if applicable) or set for browser\n` +
            `if (typeof module !== 'undefined' && module.exports) {\n` +
            `  module.exports = config;\n` +
            `} else if (typeof window !== 'undefined') {\n` +
            `  window.config = config;\n` +
            `}`;
        configOutput.value = finalConfigString;
        outputContainer.style.display = 'block';
        window.scrollTo(0, document.body.scrollHeight);
    });

    copyBtn.addEventListener('click', () => {
        configOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });
});