document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.config === 'undefined') {
    console.error('Configuration object (window.config) not found. Make sure config.js is loaded before renderer.js.');
    return;
  }

  const { globals, header, mainBox, sections, footer } = window.config;

  // Function to apply custom colors from config to CSS variables
  function applyCustomColors() {
    if (globals && globals.primaryColor) {
      document.documentElement.style.setProperty('--gold', globals.primaryColor);
    }
    if (globals && globals.accentColor) {
      document.documentElement.style.setProperty('--accent', globals.accentColor);
    }
  }
  applyCustomColors(); // Apply colors as soon as config is available

  // Helper function to get a value from globals, supporting dot notation for nested properties
  function getGlobal(path) {
    if (!path) return '';
    if (path.startsWith('globals.')) {
        return path.split('.').slice(1).reduce((obj, key) => {
            if (obj && typeof obj === 'object' && key in obj) return obj[key];
            if (Array.isArray(obj) && !isNaN(parseInt(key))) return obj[parseInt(key)];
            return undefined;
        }, globals);
    }
    return globals[path] || '';
  }

  // Helper function to process template strings like "{{companyName}}"
  function processTemplateString(templateStr, dataObject = globals) {
    if (typeof templateStr !== 'string') return templateStr;
    return templateStr.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      // Resolve keys, trying dataObject first, then globals, then footer (for specific footer template cases)
      let value;
      if (dataObject && key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, dataObject) !== undefined) {
        value = key.split('.').reduce((obj, k) => obj && obj[k], dataObject);
      } else if (globals && key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, globals) !== undefined) {
        value = key.split('.').reduce((obj, k) => obj && obj[k], globals);
      } else if (footer && key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, footer) !== undefined) {
         // Special case for footer templates like {{brokerageName}}
        value = key.split('.').reduce((obj, k) => obj && obj[k], footer);
      }
      return value !== undefined ? value : match;
    });
  }

  // --- Renderer Functions ---

  function renderHeader(headerData) {
    const headerElement = document.getElementById('dynamic-header');
    if (!headerElement) {
      console.error('Element with ID "dynamic-header" not found.');
      return;
    }
    let subheadlineHTML = processTemplateString(headerData.subheadline || '');

    headerElement.innerHTML = `
      <div class="header-content-wrapper">
        <div class="case-study-tag">${processTemplateString(headerData.tag || '')}</div>
        <h1>${processTemplateString(headerData.title || '')}</h1>
        <div class="subheadline">${subheadlineHTML}</div>
      </div>
      <button class="discovery-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button>
    `;
  }

  function renderMainBox(mainBoxData) {
    const summaryContainer = document.getElementById('dynamic-main-content');
    const sidebarContainer = document.getElementById('dynamic-sidebar');

    if (summaryContainer && mainBoxData.summary) {
      const summary = mainBoxData.summary;
      const heroAltText = summary.heroImage && summary.heroImage.alt ? processTemplateString(summary.heroImage.alt) : '';
      summaryContainer.innerHTML = `
        <h2>${processTemplateString(summary.title || '')}</h2>
        ${summary.heroImage ? `<img class="hero" src="${summary.heroImage.src}" alt="${heroAltText}">` : ''}
        <h2>${processTemplateString(summary.subTitle || '')}</h2>
        ${(summary.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
        <button class="summary-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button>
      `;
    } else if (!summaryContainer) {
        console.error('Element with ID "dynamic-main-content" not found.');
    }


    if (sidebarContainer && mainBoxData.sidebar) {
      const sidebar = mainBoxData.sidebar;
      let contactsHTML = '';
      // Iterate over all agents in globals.agents
      if (globals.agents && Array.isArray(globals.agents)) {
        globals.agents.forEach((agent, agentIndex) => { // Added agentIndex
          if (agent && agent.name && agent.contactDetails && Array.isArray(agent.contactDetails)) {
            let agentBlockHTML = '';
            if (agent.imageSrc) {
              agentBlockHTML += `<img src="${agent.imageSrc}" alt="${processTemplateString(agent.name)}" class="sidebar-agent-photo">`;
            }
            
            let agentDetailsHTML = `<div class="sidebar-agent-info">`; // Wrapper for name and contacts
            agentDetailsHTML += `<h4 class="sidebar-agent-name">${processTemplateString(agent.name)}</h4>`;
            
            agent.contactDetails.forEach(detail => {
              let iconSvg = '';
              if (detail.type === "email") {
                iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V8.414l8 4.999 8-4.999V18H4zm8-7.414l-8-4.999V6h16v-.413l-8 4.999z"></path></svg>`;
              } else if (detail.type === "phone") {
                iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.314 0-10 1.668-10 5v3h20v-3c0-3.332-6.686-5-10-5z"></path></svg>`;
              }
              agentDetailsHTML += `<div class="contact-item">${iconSvg}${processTemplateString(detail.value)}</div>`;
            });
            agentDetailsHTML += `</div>`; // End sidebar-agent-info

            // If image exists, wrap image and details in a flex container
            if (agent.imageSrc) {
              contactsHTML += `<div class="sidebar-agent-block has-image">${agentBlockHTML}${agentDetailsHTML}</div>`;
            } else {
              contactsHTML += `<div class="sidebar-agent-block">${agentDetailsHTML}</div>`;
            }

            if (globals.agents.length > 1 && agentIndex < globals.agents.length - 1) {
              contactsHTML += `<hr class="sidebar-agent-divider">`;
            }
          }
        });
      }

      const sidebarImageAlt = sidebar.image && sidebar.image.alt ? processTemplateString(sidebar.image.alt) : '';
      // Construct sidebar title: "About [CompanyName]"
      const companyNameForSidebar = getGlobal('companyName');
      const sidebarTitle = companyNameForSidebar ? `About ${companyNameForSidebar}` : 'About Us'; // Default if companyName is not found

      sidebarContainer.innerHTML = `
        <h3>${sidebarTitle}</h3>
        ${sidebar.image ? `<img src="${sidebar.image.src}" alt="${sidebarImageAlt}">` : ''}
        ${(sidebar.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
        <div class="contacts">${contactsHTML}</div>
      `;
    } else if (!sidebarContainer) {
        console.error('Element with ID "dynamic-sidebar" not found.');
    }
  }

  function renderSections(sectionsArray) {
    const sectionsContainer = document.getElementById('dynamic-sections-container');
    if (!sectionsContainer) {
      console.error('Element with ID "dynamic-sections-container" not found.');
      return;
    }

    sectionsArray.forEach(sectionData => {
      let sectionHTML = '';
      // Default classes for standard sections
      let sectionClass = 'section-inner';
      let outerDivClass = 'section';
      let contentHTML = '';

      if (sectionData.type === 'ctaBanner' && sectionData.ctaBannerContent) {
        const bannerContent = sectionData.ctaBannerContent;
        // For ctaBanner, the outer div is the banner itself, and content is structured inside
        outerDivClass = 'cta-banner'; // This will be the main container for this section type
        contentHTML = `
          <div class="cta-banner-content">
            <div>
              <div class="cta-banner-subhead">${processTemplateString(bannerContent.subhead || '')}</div>
              <div class="cta-banner-headline">${processTemplateString(bannerContent.headline || '')}</div>
              <div class="cta-banner-small">${processTemplateString(bannerContent.smallText || '')}</div>
            </div>
            <button class="cta-banner-btn">${getGlobal('mainCTAButtonText') || 'Book A Discovery Call'}</button>
          </div>
        `;
        sectionHTML = `<div class="${outerDivClass}">${contentHTML}</div>`;
      } else if (sectionData.type === 'cta') {
        // Correctly render the CTA section using headline, subheadline, and button from config
        contentHTML = `
          <h3>${processTemplateString(sectionData.headline || '', sectionData)}</h3>
          <p>${processTemplateString(sectionData.subheadline || '', sectionData)}</p>
          <button class="discovery-btn" onclick="location.href='${processTemplateString(sectionData.button.link || '#', sectionData.button)}';">
            ${processTemplateString(sectionData.button.text || getGlobal('mainCTAButtonText') || 'Book A Discovery Call', sectionData.button)}
          </button>
        `;
        // The 'cta-section' class handles its own styling including background and max-width.
        // No need for an outer 'section cta-hosting-section' div.
        sectionHTML = `<div class="cta-section">${contentHTML}</div>`;
      } else { // Standard section rendering
        const imageAlt = sectionData.image && sectionData.image.alt ? processTemplateString(sectionData.image.alt) : '';
        const imageHtml = sectionData.image ? `<div class="section-image-content"><img src="${sectionData.image.src}" alt="${imageAlt}"></div>` : '';
        
        const textContentHtml = `
          <div class="section-text-content">
            ${sectionData.title ? `<h3>${processTemplateString(sectionData.title)}</h3>` : ''}
            ${(sectionData.paragraphs || []).map(p => `<p>${processTemplateString(p)}</p>`).join('')}
            ${sectionData.listItems ? `<ul>${sectionData.listItems.map(li => `<li>${processTemplateString(li)}</li>`).join('')}</ul>` : ''}
            ${sectionData.testimonial ? `<div class="testimonial">${processTemplateString(sectionData.testimonial.quote)}</div>` : ''}
          </div>
        `;

        if (sectionData.image) {
          // If there's an image, section-inner becomes a flex container
          // Order for desktop: text then image. CSS will handle order for mobile if needed.
          contentHTML = `${textContentHtml}${imageHtml}`;
        } else {
          contentHTML = textContentHtml; // Only text content
        }
        
        // sectionClass is 'section-inner'. It will need display:flex if image is present.
        // Add a conditional class if an image exists to trigger flex/grid display via CSS.
        const innerSectionClass = sectionData.image ? `${sectionClass} section-with-image` : sectionClass;
        sectionHTML = `<div class="${outerDivClass}"><div class="${innerSectionClass}">${contentHTML}</div></div>`;
      }
      sectionsContainer.innerHTML += sectionHTML;
    });
  }

  function renderFooter(footerData) {
    const footerElement = document.getElementById('dynamic-footer');
    if (!footerElement) {
      console.error('Element with ID "dynamic-footer" not found.');
      return;
    }
    const footerLogoAlt = footerData.logo && footerData.logo.alt ? processTemplateString(footerData.logo.alt) : '';
    const currentYear = new Date().getFullYear();
    // Construct copyright text using globals.companyName
    const companyNameForCopyright = getGlobal('companyName');
    const copyrightText = `&copy; ${currentYear} ${companyNameForCopyright || 'Your Company'}. All rights reserved.`;

    // Retrieve and prepare footer elements from config
    const disclaimerHtml = footerData.disclaimerText ? `<div class="footer-top-disclaimer">${processTemplateString(footerData.disclaimerText, footerData)}</div>` : '';
    
    let brokerageInfoHtml = '';
    if (footerData.brokerageLabel && footerData.brokerageName) {
      brokerageInfoHtml += `<strong>${processTemplateString(footerData.brokerageLabel, footerData)}</strong> ${processTemplateString(footerData.brokerageName, footerData)}`;
    }
    if (footerData.brokerageAddress) {
      brokerageInfoHtml += `<br>${processTemplateString(footerData.brokerageAddress, footerData)}`;
    }

    const mainLogoAlt = footerData.logo && footerData.logo.alt ? processTemplateString(footerData.logo.alt) : '';
    const mainLogoHtml = footerData.logo ? `<img class="footer-logo-main" src="${footerData.logo.src}" alt="${mainLogoAlt}">` : '';

    const secondaryLogoAlt = footerData.secondaryLogo && footerData.secondaryLogo.altTemplate
        ? processTemplateString(footerData.secondaryLogo.altTemplate, footerData)
        : (footerData.secondaryLogo && footerData.secondaryLogo.alt ? processTemplateString(footerData.secondaryLogo.alt, footerData) : '');
    const conditionalSecondaryLogoHtml = (footerData.secondaryLogo && footerData.secondaryLogo.src)
      ? `<img class="footer-logo-secondary" src="${footerData.secondaryLogo.src}" alt="${secondaryLogoAlt}">` // Removed inline style
      : '';

    const privacyPolicyHtml = footerData.privacyPolicy
      ? `<a href="${footerData.privacyPolicy.href || '#'}">${processTemplateString(footerData.privacyPolicy.text || 'Privacy Policy', footerData)}</a>` // Inline style removed, will be handled by CSS
      : '';

    let agentContactsFooterHtml = '';
    if (globals.agents && Array.isArray(globals.agents)) {
      globals.agents.forEach(agent => {
        if (agent && agent.name && agent.contactDetails && Array.isArray(agent.contactDetails)) {
          agentContactsFooterHtml += `<div class="footer-agent-contact-item">`;
          agentContactsFooterHtml += `<h5 class="footer-agent-name">${processTemplateString(agent.name)}</h5>`;
          agent.contactDetails.forEach(detail => {
            let iconSvg = '';
            if (detail.type === "email") {
              iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4C2.897 4 2 4.897 2 6v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zM4 18V8.414l8 4.999 8-4.999V18H4zm8-7.414l-8-4.999V6h16v-.413l-8 4.999z"></path></svg>`;
            } else if (detail.type === "phone") {
              iconSvg = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.314 0-10 1.668-10 5v3h20v-3c0-3.332-6.686-5-10-5z"></path></svg>`;
            }
            agentContactsFooterHtml += `<div class="footer-agent-detail">${iconSvg} ${processTemplateString(detail.value)}</div>`; // Added SVG
          });
          agentContactsFooterHtml += `</div>`;
        }
      });
    }

    footerElement.innerHTML = `
      ${disclaimerHtml}
      <div class="footer-content-grid">
        <div class="footer-column-logos">
          ${mainLogoHtml}
          ${conditionalSecondaryLogoHtml ? `<div class="footer-logo-secondary-wrapper">${conditionalSecondaryLogoHtml}</div>` : ''}
        </div>
        <div class="footer-column-info">
          <div class="footer-brokerage-info">
            ${brokerageInfoHtml}
          </div>
        </div>
        <div class="footer-column-agents">
          ${agentContactsFooterHtml}
        </div>
      </div>
      <div class="footer-bottom-bar">
        <span class="copyright-text">${copyrightText}</span>
        <span class="privacy-policy-link">${privacyPolicyHtml}</span>
      </div>
    `;
  }

  // --- Initialize Page ---
  if (header) renderHeader(header);
  if (mainBox) renderMainBox(mainBox);
  if (sections) renderSections(sections);
  if (footer) renderFooter(footer);

});
// Ensure config.js is loaded before this script in HTML.
// The 'config' constant from config.js will be in the global scope.